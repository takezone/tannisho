// 聖教データを静的にインポート
import tannishoData from "../../data/tannisho/tannisho.json";
import kyogyoshinshoData from "../../data/kyogyoshinsho/kyogyoshinsho.json";

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

// 全ての聖教データ
const scriptures: Record<string, Record<string, Scripture>> = {
  tannisho: {
    tannisho: tannishoData as Scripture,
  },
  kyogyoshinsho: {
    kyogyoshinsho: kyogyoshinshoData as Scripture,
  },
};

export function getCategories(): string[] {
  return Object.keys(scriptures);
}

export function getScripturesByCategory(category: string): ScriptureInfo[] {
  const categoryData = scriptures[category];
  if (!categoryData) return [];

  return Object.entries(categoryData).map(([id, scripture]) => ({
    id,
    title: scripture.title,
    category,
    chapterCount: scripture.chapters.length,
  }));
}

export function getAllScriptures(): ScriptureInfo[] {
  const categories = getCategories();
  return categories.flatMap((category) => getScripturesByCategory(category));
}

export function getScripture(category: string, id: string): Scripture | null {
  const categoryData = scriptures[category];
  if (!categoryData) return null;
  return categoryData[id] || null;
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
  const results: {
    scripture: ScriptureInfo;
    chapter: Chapter;
    snippet: string;
  }[] = [];

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
