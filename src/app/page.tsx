import Link from "next/link";
import { getCategories, getScripturesByCategory } from "@/lib/texts";

export default function Home() {
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
            聖教データベース
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            浄土真宗聖典テキスト
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg hover:bg-stone-700 dark:hover:bg-stone-300 transition-colors"
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            テキスト検索
          </Link>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400">
              データがまだ登録されていません。
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const scriptures = getScripturesByCategory(category);
              return (
                <section key={category}>
                  <ul className="space-y-3">
                    {scriptures.map((scripture) => (
                      <li key={scripture.id}>
                        <Link
                          href={`/scripture/${category}/${scripture.id}`}
                          className="block p-5 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                        >
                          <h3 className="text-xl font-semibold text-stone-800 dark:text-stone-200">
                            {scripture.title}
                          </h3>
                          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                            {scripture.chapterCount}章
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>
            テキストデータ出典：浄土真宗本願寺派総合研究所「浄土真宗聖典」聖教データベース
          </p>
          <p className="mt-1">個人学習・研究目的での利用</p>
        </div>
      </footer>
    </div>
  );
}
