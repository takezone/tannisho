import { getScripture } from "@/lib/scriptures";
import ChapterContent from "@/components/ChapterContent";

export default function Home() {
  const scripture = getScripture("tannisho", "tannisho");

  if (!scripture) {
    return <div>データが見つかりません</div>;
  }

  const chapter = scripture.chapters[0]; // 序文
  const nextChapter = scripture.chapters[1] || null;

  return (
    <ChapterContent
      chapter={chapter}
      chapters={scripture.chapters}
      prevChapter={null}
      nextChapter={nextChapter}
    />
  );
}
