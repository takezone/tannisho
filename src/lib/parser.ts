/**
 * テキストを解析して、引用と釈文を区別する
 */

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
