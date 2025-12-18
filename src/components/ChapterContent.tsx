"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  parseContentSimple,
  parseRubyWithGlossary,
  TextBlock,
  GlossaryItem,
} from "@/lib/parser";
import { getChapterUrl } from "@/lib/chapters";
import VerticalTextContainer from "@/components/VerticalTextContainer";
import Drawer from "@/components/Drawer";
import HeaderSearch from "@/components/HeaderSearch";

interface Chapter {
  id: string;
  title: string;
  content: string;
  glossary?: GlossaryItem[];
}

interface ChapterContentProps {
  chapter: Chapter;
  chapters: Chapter[];
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
}

type FontSize = "small" | "medium" | "large";

const fontSizeClasses: Record<FontSize, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};

function RubyText({
  content,
  glossary,
}: {
  content: string;
  glossary?: GlossaryItem[];
}) {
  const lines = content.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {parseRubyWithGlossary(line, glossary)}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function TextBlockComponent({
  block,
  glossary,
}: {
  block: TextBlock;
  glossary?: GlossaryItem[];
}) {
  if (block.type === "citation-header") {
    return (
      <h3 className="font-bold text-amber-800 dark:text-amber-400 border-t-2 border-amber-500 dark:border-amber-400 pt-2">
        <RubyText content={block.content} glossary={glossary} />
      </h3>
    );
  }

  if (block.type === "citation") {
    return (
      <blockquote className="border-t-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 pt-3 pb-3 px-2">
        <p className="text-stone-700 dark:text-stone-300">
          <RubyText content={block.content} glossary={glossary} />
        </p>
      </blockquote>
    );
  }

  return (
    <p className="text-stone-800 dark:text-stone-200">
      <RubyText content={block.content} glossary={glossary} />
    </p>
  );
}

function FontSizeSelector({
  fontSize,
  onChange,
}: {
  fontSize: FontSize;
  onChange: (size: FontSize) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
      <button
        onClick={() => onChange("small")}
        className={`px-2 py-1 rounded text-xs transition-colors ${
          fontSize === "small"
            ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
        }`}
        title="小さい文字"
      >
        小
      </button>
      <button
        onClick={() => onChange("medium")}
        className={`px-2 py-1 rounded text-sm transition-colors ${
          fontSize === "medium"
            ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
        }`}
        title="標準の文字"
      >
        中
      </button>
      <button
        onClick={() => onChange("large")}
        className={`px-2 py-1 rounded text-base transition-colors ${
          fontSize === "large"
            ? "bg-white dark:bg-stone-700 text-amber-600 dark:text-amber-400 shadow-sm"
            : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
        }`}
        title="大きい文字"
      >
        大
      </button>
    </div>
  );
}

export default function ChapterContent({
  chapter,
  chapters,
  prevChapter,
  nextChapter,
}: ChapterContentProps) {
  const blocks = parseContentSimple(chapter.content);
  const [fontSize, setFontSize] = useState<FontSize>("medium");

  // ローカルストレージから文字サイズを復元
  useEffect(() => {
    const saved = localStorage.getItem("tannisho-font-size") as FontSize | null;
    if (saved && ["small", "medium", "large"].includes(saved)) {
      setFontSize(saved);
    }
  }, []);

  // 文字サイズをローカルストレージに保存
  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem("tannisho-font-size", size);
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Drawer chapters={chapters} currentChapterId={chapter.id} />
              <div>
                <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  歎異抄
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {chapter.title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FontSizeSelector
                fontSize={fontSize}
                onChange={handleFontSizeChange}
              />
              <HeaderSearch />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="relative">
          {/* 文章ブロックの左右のナビゲーションボタン */}
          {prevChapter && (
            <Link
              href={getChapterUrl(prevChapter.id)}
              className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full shadow-lg hover:bg-amber-50 dark:hover:bg-stone-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors group"
              title={`前: ${prevChapter.title}`}
            >
              <span className="text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 text-xl">
                ›
              </span>
            </Link>
          )}
          {nextChapter && (
            <Link
              href={getChapterUrl(nextChapter.id)}
              className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full shadow-lg hover:bg-amber-50 dark:hover:bg-stone-700 hover:border-amber-300 dark:hover:border-amber-600 transition-colors group"
              title={`次: ${nextChapter.title}`}
            >
              <span className="text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 text-xl">
                ‹
              </span>
            </Link>
          )}

          <article className="bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 p-6 md:p-8">
          <VerticalTextContainer className="overflow-x-auto">
            <div
              className={`writing-vertical h-[70vh] min-h-[500px] ${fontSizeClasses[fontSize]}`}
            >
              {/* 前の章へ（タイトルの右に配置） */}
              {prevChapter && (
                <Link
                  href={getChapterUrl(prevChapter.id)}
                  className="inline-block mr-4 px-4 py-2 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-sm"
                >
                  ← 前 {prevChapter.title}
                </Link>
              )}

              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 ml-8">
                {chapter.title}
              </h2>

              {blocks.map((block, index) => (
                <TextBlockComponent
                  key={index}
                  block={block}
                  glossary={chapter.glossary}
                />
              ))}

              {/* 次の章へ（本文の最後に配置） */}
              {nextChapter && (
                <Link
                  href={getChapterUrl(nextChapter.id)}
                  className="inline-block ml-8 px-4 py-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                >
                  次 → {nextChapter.title}
                </Link>
              )}
            </div>
          </VerticalTextContainer>
        </article>
        </div>

        {/* 語釈セクション */}
        {chapter.glossary && chapter.glossary.length > 0 && (
          <section className="mt-6 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 p-6">
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-4 border-b border-stone-200 dark:border-stone-700 pb-2">
              語釈
            </h3>
            <dl className="space-y-3">
              {chapter.glossary.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="font-medium text-amber-700 dark:text-amber-400 sm:w-32 flex-shrink-0">
                    <ruby>
                      {item.term}
                      <rp>(</rp>
                      <rt className="text-xs">{item.reading}</rt>
                      <rp>)</rp>
                    </ruby>
                  </dt>
                  <dd className="text-stone-600 dark:text-stone-400 text-sm mt-1 sm:mt-0">
                    {item.meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ナビゲーション（縦書き用：次が左、前が右） */}
        <nav className="mt-8 flex justify-between gap-4">
          {nextChapter ? (
            <Link
              href={getChapterUrl(nextChapter.id)}
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
              href={getChapterUrl(prevChapter.id)}
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

      <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
          <p>provided by Friends of ONE</p>
        </div>
      </footer>
    </div>
  );
}
