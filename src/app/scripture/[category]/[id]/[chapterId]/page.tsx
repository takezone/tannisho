import Link from "next/link";
import { notFound } from "next/navigation";
import { getChapter, getScripture, getAllScriptures } from "@/lib/scriptures";
import { parseContentSimple, parseRuby, TextBlock } from "@/lib/parser";
import VerticalTextContainer from "@/components/VerticalTextContainer";

interface PageProps {
  params: Promise<{
    category: string;
    id: string;
    chapterId: string;
  }>;
}

export async function generateStaticParams() {
  const scriptures = getAllScriptures();
  const params: { category: string; id: string; chapterId: string }[] = [];

  for (const info of scriptures) {
    const scripture = getScripture(info.category, info.id);
    if (scripture) {
      for (const chapter of scripture.chapters) {
        params.push({
          category: info.category,
          id: info.id,
          chapterId: chapter.id,
        });
      }
    }
  }

  return params;
}

function RubyText({ content }: { content: string }) {
  // 改行で分割して各行をルビ処理
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {parseRuby(line)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function TextBlockComponent({ block }: { block: TextBlock }) {
  if (block.type === "citation-header") {
    return (
      <h3 className="text-base font-bold text-amber-800 dark:text-amber-400 border-t-2 border-amber-500 dark:border-amber-400 pt-2">
        <RubyText content={block.content} />
      </h3>
    );
  }

  if (block.type === "citation") {
    return (
      <blockquote className="border-t-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 pt-3 pb-3 px-2">
        <p className="text-stone-700 dark:text-stone-300">
          <RubyText content={block.content} />
        </p>
      </blockquote>
    );
  }

  // commentary（親鸞の釈文）
  return (
    <p className="text-stone-800 dark:text-stone-200">
      <RubyText content={block.content} />
    </p>
  );
}

export default async function ChapterPage({ params }: PageProps) {
  const { category, id, chapterId } = await params;
  const decodedChapterId = decodeURIComponent(chapterId);
  const result = getChapter(category, id, decodedChapterId);

  if (!result) {
    notFound();
  }

  const { scripture, chapter } = result;
  const currentIndex = scripture.chapters.findIndex(
    (c) => c.id === decodedChapterId
  );
  const prevChapter =
    currentIndex > 0 ? scripture.chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < scripture.chapters.length - 1
      ? scripture.chapters[currentIndex + 1]
      : null;

  // テキストをパースして構造化
  const blocks = parseContentSimple(chapter.content);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href={`/scripture/${category}/${id}`}
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
            {scripture.title}
          </Link>
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
            {chapter.title}
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <article className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 p-6 md:p-8">
          <VerticalTextContainer className="overflow-x-auto">
            <div className="writing-vertical h-[70vh] min-h-[500px]">
              {blocks.map((block, index) => (
                <TextBlockComponent key={index} block={block} />
              ))}
            </div>
          </VerticalTextContainer>
        </article>

        {/* ナビゲーション（縦書き用：次が左、前が右） */}
        <nav className="mt-8 flex justify-between gap-4">
          {nextChapter ? (
            <Link
              href={`/scripture/${category}/${id}/${encodeURIComponent(nextChapter.id)}`}
              className="flex-1 p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
            >
              <span className="text-sm text-stone-500 dark:text-stone-400">
                次
              </span>
              <p className="text-stone-800 dark:text-stone-200 font-medium">
                {nextChapter.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {prevChapter ? (
            <Link
              href={`/scripture/${category}/${id}/${encodeURIComponent(prevChapter.id)}`}
              className="flex-1 p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors text-right"
            >
              <span className="text-sm text-stone-500 dark:text-stone-400">
                前
              </span>
              <p className="text-stone-800 dark:text-stone-200 font-medium">
                {prevChapter.title}
              </p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </main>

    </div>
  );
}
