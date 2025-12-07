"use client";

import Link from "next/link";
import { useState } from "react";

interface SearchResult {
  id: string;
  title: string;
  category: string;
  snippet: string;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}`
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

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-2"
          >
            <svg
              className="w-4 h-4"
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
            戻る
          </Link>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            テキスト検索
          </h1>
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
              className="flex-1 px-4 py-3 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors disabled:opacity-50"
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
                    href={`/text/${encodeURIComponent(result.category)}/${encodeURIComponent(result.id)}`}
                    className="block p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                  >
                    <h3 className="font-semibold text-stone-800 dark:text-stone-200">
                      {result.title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                      {result.category}
                    </p>
                    <p className="text-stone-600 dark:text-stone-300 text-sm line-clamp-3">
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
