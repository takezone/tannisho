/**
 * 聖教テキストをJSON形式に変換するスクリプト
 *
 * 使用方法:
 *   npx ts-node scripts/convert-to-json.ts
 */

import * as fs from "fs";
import * as path from "path";

interface Chapter {
  id: string;
  title: string;
  content: string;
}

interface Scripture {
  id: string;
  title: string;
  source: string;
  chapters: Chapter[];
}

function parseScripture(content: string, id: string): Scripture {
  const lines = content.split("\n");
  let title = "";
  const chapters: Chapter[] = [];
  let currentChapter: Chapter | null = null;
  let contentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // ページ番号をスキップ
    if (trimmed.startsWith("P--") || trimmed === "") {
      continue;
    }

    // メインタイトル (#1)
    if (trimmed.startsWith("#1")) {
      title = trimmed.slice(2).trim();
      continue;
    }

    // 章見出し (#2)
    if (trimmed.startsWith("#2")) {
      // 前の章を保存
      if (currentChapter) {
        currentChapter.content = contentLines
          .join("\n")
          .trim()
          .replace(/\n{3,}/g, "\n\n");
        chapters.push(currentChapter);
      }

      const chapterTitle = trimmed.slice(2).trim();
      currentChapter = {
        id: chapterTitle,
        title: formatChapterTitle(chapterTitle),
        content: "",
      };
      contentLines = [];
      continue;
    }

    // 段落番号 (1), (2) などは保持
    contentLines.push(line);
  }

  // 最後の章を保存
  if (currentChapter) {
    currentChapter.content = contentLines
      .join("\n")
      .trim()
      .replace(/\n{3,}/g, "\n\n");
    chapters.push(currentChapter);
  }

  return {
    id,
    title,
    source: "浄土真宗本願寺派総合研究所「浄土真宗聖典」聖教データベース",
    chapters,
  };
}

function formatChapterTitle(raw: string): string {
  // 数字だけの場合は「第X条」に変換
  if (/^\d+$/.test(raw)) {
    return `第${raw}条`;
  }
  // 「序」「後序」などはそのまま
  return raw;
}

function convertFile(inputPath: string, outputPath: string): void {
  const content = fs.readFileSync(inputPath, "utf-8");
  const id = path.basename(inputPath, ".txt");
  const scripture = parseScripture(content, id);

  // 出力ディレクトリを作成
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(scripture, null, 2), "utf-8");
  console.log(`✓ ${scripture.title} (${scripture.chapters.length}章)`);
}

// メイン処理
const dataDir = path.join(process.cwd(), "data");
const categories = fs.readdirSync(dataDir).filter((item) => {
  return fs.statSync(path.join(dataDir, item)).isDirectory();
});

console.log("聖教テキストをJSON形式に変換中...\n");

for (const category of categories) {
  const categoryDir = path.join(dataDir, category);
  const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith(".txt"));

  for (const file of files) {
    const inputPath = path.join(categoryDir, file);
    const outputPath = path.join(categoryDir, file.replace(".txt", ".json"));
    convertFile(inputPath, outputPath);
  }
}

console.log("\n完了！");
