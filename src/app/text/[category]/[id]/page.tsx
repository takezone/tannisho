import Link from "next/link";
import { notFound } from "next/navigation";
import { getTextContent, getAllTexts } from "@/lib/texts";

interface PageProps {
  params: Promise<{
    category: string;
    id: string;
  }>;
}

export async function generateStaticParams() {
  const texts = getAllTexts();
  return texts.map((text) => ({
    category: text.category,
    id: text.id,
  }));
}

export default async function TextPage({ params }: PageProps) {
  const { category, id } = await params;
  const decodedCategory = decodeURIComponent(category);
  const decodedId = decodeURIComponent(id);

  const textContent = getTextContent(decodedCategory, decodedId);

  if (!textContent) {
    notFound();
  }

  const paragraphs = textContent.content
    .split(/\n\n+/)
    .filter((p) => p.trim());

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
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {textContent.info.title}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {decodedCategory}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <article className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 p-8">
          <div className="prose prose-stone dark:prose-invert max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-stone-800 dark:text-stone-200 leading-relaxed mb-6 text-lg whitespace-pre-wrap"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </main>

      <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>
            テキストデータ出典：浄土真宗本願寺派総合研究所「浄土真宗聖典」聖教データベース
          </p>
        </div>
      </footer>
    </div>
  );
}
