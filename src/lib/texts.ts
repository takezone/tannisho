import fs from "fs";
import path from "path";

export interface TextInfo {
  id: string;
  title: string;
  category: string;
  filename: string;
}

export interface TextContent {
  info: TextInfo;
  content: string;
}

const DATA_DIR = path.join(process.cwd(), "data");

export function getCategories(): string[] {
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((item) =>
        fs.statSync(path.join(DATA_DIR, item)).isDirectory()
      );
  } catch {
    return [];
  }
}

export function getTextsByCategory(category: string): TextInfo[] {
  const categoryDir = path.join(DATA_DIR, category);

  try {
    const files = fs.readdirSync(categoryDir).filter((f) => f.endsWith(".txt"));

    return files.map((filename) => {
      const id = filename.replace(".txt", "");
      const title = extractTitle(path.join(categoryDir, filename)) || id;

      return {
        id,
        title,
        category,
        filename,
      };
    });
  } catch {
    return [];
  }
}

export function getAllTexts(): TextInfo[] {
  const categories = getCategories();
  return categories.flatMap((category) => getTextsByCategory(category));
}

export function getTextContent(
  category: string,
  id: string
): TextContent | null {
  const filepath = path.join(DATA_DIR, category, `${id}.txt`);

  try {
    const content = fs.readFileSync(filepath, "utf-8");
    const title = extractTitle(filepath) || id;

    return {
      info: {
        id,
        title,
        category,
        filename: `${id}.txt`,
      },
      content,
    };
  } catch {
    return null;
  }
}

function extractTitle(filepath: string): string | null {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    const lines = content.split("\n");

    // #1 で始まる行を探す（聖教データのタイトル形式）
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#1")) {
        // #1 を除去してタイトルを取得
        return trimmed.slice(2).trim().slice(0, 50);
      }
    }

    // #1 が見つからない場合は最初の意味のある行を使用
    for (const line of lines) {
      const trimmed = line.trim();
      // ページ番号（P--xxx）やマーカー（#）で始まらない行を探す
      if (trimmed && !trimmed.startsWith("P--") && !trimmed.startsWith("#")) {
        return trimmed.slice(0, 50);
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function searchTexts(query: string): TextContent[] {
  const allTexts = getAllTexts();
  const results: TextContent[] = [];

  for (const textInfo of allTexts) {
    const content = getTextContent(textInfo.category, textInfo.id);
    if (content && content.content.includes(query)) {
      results.push(content);
    }
  }

  return results;
}
