import fs from "fs";
import path from "path";

export interface Chapter {
  id: string;
  title: string;
  content: string;
}

export interface Scripture {
  id: string;
  title: string;
  source: string;
  chapters: Chapter[];
}

export interface ScriptureInfo {
  id: string;
  title: string;
  category: string;
  chapterCount: number;
}

const DATA_DIR = path.join(process.cwd(), "data");

export function getCategories(): string[] {
  try {
    return fs
      .readdirSync(DATA_DIR)
      .filter((item) => fs.statSync(path.join(DATA_DIR, item)).isDirectory());
  } catch {
    return [];
  }
}

export function getScripturesByCategory(category: string): ScriptureInfo[] {
  const categoryDir = path.join(DATA_DIR, category);

  try {
    const files = fs
      .readdirSync(categoryDir)
      .filter((f) => f.endsWith(".json"));

    return files.map((filename) => {
      const filepath = path.join(categoryDir, filename);
      const content = fs.readFileSync(filepath, "utf-8");
      const scripture: Scripture = JSON.parse(content);

      return {
        id: scripture.id,
        title: scripture.title,
        category,
        chapterCount: scripture.chapters.length,
      };
    });
  } catch {
    return [];
  }
}

export function getAllScriptures(): ScriptureInfo[] {
  const categories = getCategories();
  return categories.flatMap((category) => getScripturesByCategory(category));
}

export function getScripture(category: string, id: string): Scripture | null {
  const filepath = path.join(DATA_DIR, category, `${id}.json`);

  try {
    const content = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function getChapter(
  category: string,
  scriptureId: string,
  chapterId: string
): { scripture: Scripture; chapter: Chapter } | null {
  const scripture = getScripture(category, scriptureId);
  if (!scripture) return null;

  const chapter = scripture.chapters.find((c) => c.id === chapterId);
  if (!chapter) return null;

  return { scripture, chapter };
}

export function searchScriptures(
  query: string
): { scripture: ScriptureInfo; chapter: Chapter; snippet: string }[] {
  const allScriptures = getAllScriptures();
  const results: { scripture: ScriptureInfo; chapter: Chapter; snippet: string }[] =
    [];

  for (const info of allScriptures) {
    const scripture = getScripture(info.category, info.id);
    if (!scripture) continue;

    for (const chapter of scripture.chapters) {
      if (chapter.content.includes(query)) {
        const queryIndex = chapter.content.indexOf(query);
        const start = Math.max(0, queryIndex - 30);
        const end = Math.min(
          chapter.content.length,
          queryIndex + query.length + 50
        );
        const snippet =
          (start > 0 ? "..." : "") +
          chapter.content.slice(start, end).replace(/\n/g, " ") +
          (end < chapter.content.length ? "..." : "");

        results.push({
          scripture: info,
          chapter,
          snippet,
        });
      }
    }
  }

  return results.slice(0, 50);
}
