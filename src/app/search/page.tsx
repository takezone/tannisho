"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface SearchResult {
  scriptureId: string;
  scriptureTitle: string;
  category: string;
  chapterId: string;
  chapterTitle: string;
  snippet: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const doSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              検索
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="検索語句を入力..."
              className="flex-1 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "検索中..." : "検索"}
            </button>
          </div>
        </form>

        {hasSearched && (
          <div>
            {results.length === 0 ? (
              <p className="text-center text-stone-500 dark:text-stone-400 py-8">
                検索結果が見つかりませんでした。
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {results.length} 件の結果
                </p>
                {results.map((result, index) => (
                  <Link
                    key={index}
                    href={result.chapterId === "序文" ? "/" : `/${encodeURIComponent(result.chapterId)}`}
                    className="block p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 transition-colors"
                  >
                    <h3 className="font-semibold text-stone-800 dark:text-stone-200">
                      {result.chapterTitle}
                    </h3>
                    <p className="text-stone-600 dark:text-stone-300 text-sm mt-2 line-clamp-3">
                      {result.snippet}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50 dark:bg-stone-950" />}>
      <SearchContent />
    </Suspense>
  );
}
