// 章IDとURLスラッグのマッピング
export const chapterUrlMap: Record<string, string> = {
  "序文": "preface",
  "第一条": "1",
  "第二条": "2",
  "第三条": "3",
  "第四条": "4",
  "第五条": "5",
  "第六条": "6",
  "第七条": "7",
  "第八条": "8",
  "第九条": "9",
  "第十条": "10",
  "後半序文": "preface2",
  "第十一条": "11",
  "第十二条": "12",
  "第十三条": "13",
  "第十四条": "14",
  "第十五条": "15",
  "第十六条": "16",
  "第十七条": "17",
  "第十八条": "18",
  "後記": "afterword",
  "流罪記録": "exile",
};

// URLスラッグから章IDへの逆マッピング
export const urlToChapterMap: Record<string, string> = Object.fromEntries(
  Object.entries(chapterUrlMap).map(([k, v]) => [v, k])
);

// 章IDからURLを取得
export function getChapterUrl(chapterId: string): string {
  const slug = chapterUrlMap[chapterId];
  if (chapterId === "序文") {
    return "/";
  }
  return slug ? `/${slug}` : `/${encodeURIComponent(chapterId)}`;
}

// URLスラッグから章IDを取得
export function getChapterIdFromSlug(slug: string): string | null {
  return urlToChapterMap[slug] || null;
}

// 全てのURLスラッグを取得（静的生成用）
export function getAllChapterSlugs(): string[] {
  return Object.values(chapterUrlMap).filter(slug => slug !== "preface");
}
