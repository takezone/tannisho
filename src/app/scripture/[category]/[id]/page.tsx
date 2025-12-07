import Link from "next/link";
import { notFound } from "next/navigation";
import { getScripture, getAllScriptures } from "@/lib/scriptures";

interface PageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export async function generateStaticParams() {
  const scriptures = getAllScriptures();
  return scriptures.map((s) => ({
    category: s.category,
    id: s.id,
  }));
}

export default async function ScripturePage({ params }: PageProps) {
  const { category, id } = await params;
  const scripture = getScripture(category, id);

  if (!scripture) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-10">
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
            {scripture.title}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {scripture.chapters.length}章
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <nav>
          <h2 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-4">
            目次
          </h2>
          <ul className="space-y-2">
            {scripture.chapters.map((chapter, index) => (
              <li key={chapter.id}>
                <Link
                  href={`/scripture/${category}/${id}/${encodeURIComponent(chapter.id)}`}
                  className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                >
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-full text-sm text-stone-600 dark:text-stone-400">
                    {index + 1}
                  </span>
                  <span className="text-stone-800 dark:text-stone-200">
                    {chapter.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>出典：{scripture.source}</p>
        </div>
      </footer>
    </div>
  );
}
