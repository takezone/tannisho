import { NextRequest, NextResponse } from "next/server";
import { searchTexts } from "@/lib/texts";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  const results = searchTexts(query.trim());

  const formattedResults = results.slice(0, 50).map((result) => {
    const queryIndex = result.content.indexOf(query);
    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(result.content.length, queryIndex + query.length + 100);
    const snippet = (start > 0 ? "..." : "") +
                    result.content.slice(start, end) +
                    (end < result.content.length ? "..." : "");

    return {
      id: result.info.id,
      title: result.info.title,
      category: result.info.category,
      snippet: snippet.replace(/\n/g, " "),
    };
  });

  return NextResponse.json({ results: formattedResults });
}
