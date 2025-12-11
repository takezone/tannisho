import { notFound } from "next/navigation";
import { getScripture } from "@/lib/scriptures";
import ChapterContent from "@/components/ChapterContent";

interface PageProps {
  params: Promise<{
    chapterId: string;
  }>;
}

export async function generateStaticParams() {
  const scripture = getScripture("tannisho", "tannisho");
  if (!scripture) return [];

  // 序文以外の章のパラメータを生成（序文は / で表示）
  return scripture.chapters
    .filter((chapter) => chapter.id !== "序文")
    .map((chapter) => ({
      chapterId: chapter.id,
    }));
}

export default async function ChapterPage({ params }: PageProps) {
  const { chapterId } = await params;
  const decodedChapterId = decodeURIComponent(chapterId);

  const scripture = getScripture("tannisho", "tannisho");
  if (!scripture) {
    notFound();
  }

  const currentIndex = scripture.chapters.findIndex(
    (c) => c.id === decodedChapterId
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
