import { notFound } from "next/navigation";
import { getScripture } from "@/lib/scriptures";
import { getChapterIdFromSlug, getAllChapterSlugs } from "@/lib/chapters";
import ChapterContent from "@/components/ChapterContent";

interface PageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export async function generateStaticParams() {
  // 序文以外の全てのスラッグを生成
  return getAllChapterSlugs().map((slug) => ({
    chapterId: slug,
  }));
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapterId: slug } = await params;

  // スラッグから章IDを取得
  const chapterId = getChapterIdFromSlug(slug);

  if (!chapterId) {
    notFound();
  }

  const scripture = getScripture("tannisho", "tannisho");
  if (!scripture) {
    notFound();
  }

  const currentIndex = scripture.chapters.findIndex(
    (c) => c.id === chapterId
  );

  if (currentIndex === -1) {
    notFound();
  }

  const chapter = scripture.chapters[currentIndex];
  const prevChapter =
    currentIndex > 0 ? scripture.chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < scripture.chapters.length - 1
      ? scripture.chapters[currentIndex + 1]
      : null;

  return (
    <ChapterContent
      chapter={chapter}
      chapters={scripture.chapters}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}
