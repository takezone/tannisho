import { NextRequest, NextResponse } from "next/server";
import { searchScriptures } from "@/lib/texts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = searchScriptures(query.trim());

  const formattedResults = results.map((result) => ({
    scriptureId: result.scripture.id,
    scriptureTitle: result.scripture.title,
    category: result.scripture.category,
    chapterId: result.chapter.id,
    chapterTitle: result.chapter.title,
    snippet: result.snippet,
  }));

  return NextResponse.json({ results: formattedResults });
}
