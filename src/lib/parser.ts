/**
 * テキストを解析して、引用と釈文を区別する
 */

import { ReactNode, createElement } from "react";
import GlossaryTooltip from "@/components/GlossaryTooltip";

export interface GlossaryItem {
  term: string;
  reading: string;
  meaning: string;
}

/**
 * カタカナをひらがなに変換（マッチング用）
 */
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) =>
    String.fromCharCode(match.charCodeAt(0) - 0x60)
  );
}

/**
 * ルビ記法 {漢字|ふりがな} をパースしてReact要素に変換
 */
export function parseRuby(text: string): ReactNode[] {
  const rubyPattern = /\{([^|]+)\|([^}]+)\}/g;
  const result: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = rubyPattern.exec(text)) !== null) {
    // ルビの前のテキスト
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    // ルビ要素
    const [, kanji, furigana] = match;
    result.push(
      createElement(
        "ruby",
        { key: `ruby-${keyIndex++}` },
        kanji,
        createElement("rp", null, "("),
        createElement("rt", null, furigana),
        createElement("rp", null, ")")
      )
    );

    lastIndex = match.index + match[0].length;
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result.length > 0 ? result : [text];
}

/**
 * 語釈のマッピングを作成（長い用語を優先）
 * 正規化版（カタカナ→ひらがな）も含める
 */
function createGlossaryMap(
  glossary: GlossaryItem[]
): { map: Map<string, GlossaryItem>; normalizedMap: Map<string, GlossaryItem> } {
  const map = new Map<string, GlossaryItem>();
  const normalizedMap = new Map<string, GlossaryItem>();
  // 長い用語を優先するためにソート
  const sortedGlossary = [...glossary].sort(
    (a, b) => b.term.length - a.term.length
  );
  for (const item of sortedGlossary) {
    map.set(item.term, item);
    // 正規化版も登録（カタカナ→ひらがな）
    const normalizedTerm = katakanaToHiragana(item.term);
    if (!normalizedMap.has(normalizedTerm)) {
      normalizedMap.set(normalizedTerm, item);
    }
  }
  return { map, normalizedMap };
}

/**
 * テキストセグメントを語釈でラップ
 * カタカナ→ひらがな正規化によるマッチングも行う
 */
function wrapWithGlossary(
  text: string,
  normalizedMap: Map<string, GlossaryItem>,
  keyPrefix: string
): ReactNode[] {
  if (normalizedMap.size === 0 || !text) {
    return [text];
  }

  const result: ReactNode[] = [];
  let remainingText = text;
  let keyIndex = 0;

  while (remainingText.length > 0) {
    let foundMatch = false;
    const normalizedRemaining = katakanaToHiragana(remainingText);

    // 長い用語から順にマッチを試みる（正規化版で検索）
    for (const [normalizedTerm, item] of normalizedMap) {
      const index = normalizedRemaining.indexOf(normalizedTerm);
      if (index === 0) {
        // 用語がテキストの先頭にある
        const originalText = remainingText.slice(0, normalizedTerm.length);
        result.push(
          createElement(
            GlossaryTooltip,
            {
              key: `${keyPrefix}-g-${keyIndex++}`,
              reading: item.reading,
              meaning: item.meaning,
            },
            originalText
          )
        );
        remainingText = remainingText.slice(normalizedTerm.length);
        foundMatch = true;
        break;
      } else if (index > 0) {
        // 用語の前にテキストがある
        result.push(remainingText.slice(0, index));
        const originalText = remainingText.slice(index, index + normalizedTerm.length);
        result.push(
          createElement(
            GlossaryTooltip,
            {
              key: `${keyPrefix}-g-${keyIndex++}`,
              reading: item.reading,
              meaning: item.meaning,
            },
            originalText
          )
        );
        remainingText = remainingText.slice(index + normalizedTerm.length);
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) {
      // マッチする用語がない場合、1文字進める
      result.push(remainingText[0]);
      remainingText = remainingText.slice(1);
    }
  }

  // 連続する文字列を結合
  const consolidated: ReactNode[] = [];
  let currentString = "";
  for (const node of result) {
    if (typeof node === "string") {
      currentString += node;
    } else {
      if (currentString) {
        consolidated.push(currentString);
        currentString = "";
      }
      consolidated.push(node);
    }
  }
  if (currentString) {
    consolidated.push(currentString);
  }

  return consolidated;
}

/**
 * ルビ記法と語釈をパースしてReact要素に変換
 * 連続するルビ要素の結合、ルビ＋プレーンテキストの結合にも対応
 */
export function parseRubyWithGlossary(
  text: string,
  glossary?: GlossaryItem[]
): ReactNode[] {
  const { normalizedMap } = glossary
    ? createGlossaryMap(glossary)
    : { normalizedMap: new Map<string, GlossaryItem>() };
  const rubyPattern = /\{([^|]+)\|([^}]+)\}/g;

  // まずルビ要素とその位置を収集
  interface RubySegment {
    kanji: string;
    furigana: string;
    start: number;
    end: number;
    fullMatch: string;
  }

  const segments: RubySegment[] = [];
  let match;
  while ((match = rubyPattern.exec(text)) !== null) {
    segments.push({
      kanji: match[1],
      furigana: match[2],
      start: match.index,
      end: match.index + match[0].length,
      fullMatch: match[0],
    });
  }

  if (segments.length === 0) {
    // ルビがない場合は語釈チェックのみ
    return wrapWithGlossary(text, normalizedMap, "plain");
  }

  // 語釈の用語リスト（正規化版、長い順）
  const glossaryTerms = Array.from(normalizedMap.keys()).sort(
    (a, b) => b.length - a.length
  );

  const result: ReactNode[] = [];
  let lastIndex = 0;
  let keyIndex = 0;
  let i = 0;

  while (i < segments.length) {
    const segment = segments[i];

    // ルビの前のテキスト（語釈チェック）
    if (segment.start > lastIndex) {
      const beforeText = text.slice(lastIndex, segment.start);
      result.push(
        ...wrapWithGlossary(beforeText, normalizedMap, `pre-${keyIndex}`)
      );
    }

    // 最適なマッチを探す
    let bestMatch: {
      glossaryItem: GlossaryItem;
      rubyCount: number;
      plainTextLength: number;
      combinedKanji: string;
    } | null = null;

    // 各語釈用語（正規化版）について、このルビから始まるマッチを探す
    for (const normalizedTerm of glossaryTerms) {
      if (!normalizedTerm.startsWith(segment.kanji)) continue;

      // このルビの漢字で始まる用語を見つけた
      let currentKanji = segment.kanji;
      let rubyCount = 1;
      let currentEnd = segment.end;

      // 連続するルビ要素を結合してチェック
      for (let j = i + 1; j < segments.length && currentKanji.length < normalizedTerm.length; j++) {
        const nextSegment = segments[j];
        if (nextSegment.start !== currentEnd) break; // 連続していない

        const testKanji = currentKanji + nextSegment.kanji;
        if (normalizedTerm.startsWith(testKanji)) {
          currentKanji = testKanji;
          currentEnd = nextSegment.end;
          rubyCount++;
        } else {
          break;
        }
      }

      // ルビの後のプレーンテキストも結合してチェック（カタカナ→ひらがな正規化）
      let plainTextLength = 0;
      if (currentKanji.length < normalizedTerm.length) {
        const remainingTerm = normalizedTerm.slice(currentKanji.length);
        const nextRubyStart = i + rubyCount < segments.length
          ? segments[i + rubyCount].start
          : text.length;
        const plainTextAfter = text.slice(currentEnd, nextRubyStart);
        const normalizedPlainText = katakanaToHiragana(plainTextAfter);

        if (normalizedPlainText.startsWith(remainingTerm)) {
          currentKanji = normalizedTerm;
          plainTextLength = remainingTerm.length;
        }
      }

      // 完全マッチした場合
      if (currentKanji === normalizedTerm) {
        const glossaryItem = normalizedMap.get(normalizedTerm);
        if (glossaryItem) {
          // より長いマッチを優先
          if (!bestMatch || normalizedTerm.length > bestMatch.combinedKanji.length) {
            bestMatch = {
              glossaryItem,
              rubyCount,
              plainTextLength,
              combinedKanji: normalizedTerm,
            };
          }
        }
      }
    }

    if (bestMatch) {
      // マッチが見つかった場合
      const rubyElements: ReactNode[] = [];
      for (let k = 0; k < bestMatch.rubyCount; k++) {
        const seg = segments[i + k];
        rubyElements.push(
          createElement(
            "ruby",
            { key: `ruby-${keyIndex}-${k}` },
            seg.kanji,
            createElement("rp", null, "("),
            createElement("rt", null, seg.furigana),
            createElement("rp", null, ")")
          )
        );
      }

      // プレーンテキスト部分があれば追加
      if (bestMatch.plainTextLength > 0) {
        const lastRuby = segments[i + bestMatch.rubyCount - 1];
        const plainText = text.slice(
          lastRuby.end,
          lastRuby.end + bestMatch.plainTextLength
        );
        rubyElements.push(plainText);
      }

      result.push(
        createElement(
          GlossaryTooltip,
          {
            key: `ruby-tooltip-${keyIndex++}`,
            reading: bestMatch.glossaryItem.reading,
            meaning: bestMatch.glossaryItem.meaning,
          },
          ...rubyElements
        )
      );

      i += bestMatch.rubyCount;
      lastIndex = segments[i - 1].end + bestMatch.plainTextLength;
    } else {
      // マッチがない場合は通常のルビ要素
      result.push(
        createElement(
          "ruby",
          { key: `ruby-${keyIndex++}` },
          segment.kanji,
          createElement("rp", null, "("),
          createElement("rt", null, segment.furigana),
          createElement("rp", null, ")")
        )
      );
      i++;
      lastIndex = segment.end;
    }
  }

  // 残りのテキスト（語釈チェック）
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    result.push(
      ...wrapWithGlossary(remainingText, normalizedMap, `post-${keyIndex}`)
    );
  }

  return result.length > 0 ? result : [text];
}

export interface TextBlock {
  type: "citation" | "commentary" | "citation-header";
  source?: string; // 引用元（経典名、論師名など）
  content: string;
}

// 引用開始パターン（経典名、論師名 + 言/云/曰）
const CITATION_HEADER_PATTERN = /^([ァ-ヶー一-龥a-zA-Z]+)(言|云|曰)$/;

// 「又言」「又云」などの続きの引用
const CONTINUATION_PATTERN = /^又(言|云|曰)$/;

export function parseContent(content: string): TextBlock[] {
  const lines = content.split("\n");
  const blocks: TextBlock[] = [];

  let currentBlock: TextBlock | null = null;
  let currentLines: string[] = [];
  let inCitation = false;
  let currentSource = "";

  const flushBlock = () => {
    if (currentLines.length > 0) {
      const text = currentLines.join("\n").trim();
      if (text) {
        if (currentBlock) {
          currentBlock.content = text;
          blocks.push(currentBlock);
        } else {
          blocks.push({
            type: inCitation ? "citation" : "commentary",
            source: inCitation ? currentSource : undefined,
            content: text,
          });
        }
      }
    }
    currentLines = [];
    currentBlock = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 引用ヘッダーをチェック
    const headerMatch = trimmed.match(CITATION_HEADER_PATTERN);
    const continuationMatch = trimmed.match(CONTINUATION_PATTERN);

    if (headerMatch) {
      flushBlock();
      currentSource = headerMatch[1];
      blocks.push({
        type: "citation-header",
        source: currentSource,
        content: trimmed,
      });
      inCitation = true;
      continue;
    }

    if (continuationMatch) {
      flushBlock();
      blocks.push({
        type: "citation-header",
        source: currentSource || "続",
        content: trimmed,
      });
      inCitation = true;
      continue;
    }

    // ｛已上｝や［已上］で引用終了
    if (trimmed.includes("已上") || trimmed.includes("｛已上｝")) {
      currentLines.push(line);
      flushBlock();
      inCitation = false;
      currentSource = "";
      continue;
    }

    // 空行は段落区切り
    if (trimmed === "") {
      if (currentLines.length > 0) {
        flushBlock();
      }
      continue;
    }

    currentLines.push(line);
  }

  flushBlock();

  return blocks;
}

/**
 * シンプルなパース（段落ごとに分割、引用ヘッダーを強調）
 */
export function parseContentSimple(content: string): TextBlock[] {
  const lines = content.split("\n");
  const blocks: TextBlock[] = [];
  let currentLines: string[] = [];

  const flushBlock = (isCitation: boolean, source?: string) => {
    if (currentLines.length > 0) {
      const text = currentLines.join("\n").trim();
      if (text) {
        blocks.push({
          type: isCitation ? "citation" : "commentary",
          source,
          content: text,
        });
      }
      currentLines = [];
    }
  };

  let inCitation = false;
  let currentSource = "";

  for (const line of lines) {
    const trimmed = line.trim();

    // 引用ヘッダーをチェック
    const headerMatch = trimmed.match(CITATION_HEADER_PATTERN);
    const continuationMatch = trimmed.match(CONTINUATION_PATTERN);

    if (headerMatch || continuationMatch) {
      flushBlock(inCitation, currentSource);

      if (headerMatch) {
        currentSource = headerMatch[1];
      }

      blocks.push({
        type: "citation-header",
        source: currentSource,
        content: trimmed,
      });
      inCitation = true;
      currentLines = [];
      continue;
    }

    // 親鸞の釈文の開始パターン
    if (
      trimmed.startsWith("謹按") ||
      trimmed.startsWith("爾者") ||
      trimmed.startsWith("夫") ||
      trimmed.match(/^[　\s]*[謹按爾夫然]/)
    ) {
      flushBlock(inCitation, currentSource);
      inCitation = false;
      currentSource = "";
    }

    currentLines.push(line);
  }

  flushBlock(inCitation, currentSource);

  return blocks;
}
