"use client";

import { useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface SwipeableContentProps {
  children: ReactNode;
  prevUrl: string | null;
  nextUrl: string | null;
  className?: string;
}

export default function SwipeableContent({
  children,
  prevUrl,
  nextUrl,
  className = "",
}: SwipeableContentProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

  // スクロール位置をチェック（縦書き用）
  const checkScrollPosition = () => {
    const container = containerRef.current;
    if (!container) return { atStart: false, atEnd: false };

    // 縦書きコンテナを探す
    const scrollable = container.querySelector(".overflow-x-auto");
    if (!scrollable) return { atStart: true, atEnd: true };

    const { scrollLeft, scrollWidth, clientWidth } = scrollable;
    const tolerance = 10; // 端と判定する許容範囲

    // 縦書き（vertical-rl）の場合：
    // scrollLeft = 0 → 右端（開始位置）
    // scrollLeft = -(scrollWidth - clientWidth) → 左端（終了位置）
    const maxScroll = scrollWidth - clientWidth;
    const atStart = scrollLeft >= -tolerance; // 右端
    const atEnd = scrollLeft <= -(maxScroll - tolerance); // 左端

    return { atStart, atEnd };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null ||
      touchStartTime.current === null
    )
      return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;
    const duration = Date.now() - touchStartTime.current;

    // 条件：
    // 1. 水平方向のスワイプが垂直方向より大きい
    // 2. スワイプ距離が150px以上
    // 3. スワイプ時間が500ms以上（ゆっくりした意図的なスワイプ）
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
    const isLongEnough = Math.abs(deltaX) > 150;
    const isSlowEnough = duration > 500;

    if (isHorizontalSwipe && isLongEnough && isSlowEnough) {
      const { atStart, atEnd } = checkScrollPosition();

      if (deltaX > 0 && nextUrl && atEnd) {
        // 右にスワイプ → 次の章（縦書きの左端＝読み終わりの位置でのみ）
        router.push(nextUrl);
      } else if (deltaX < 0 && prevUrl && atStart) {
        // 左にスワイプ → 前の章（縦書きの右端＝読み始めの位置でのみ）
        router.push(prevUrl);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={className}
    >
      {children}
    </div>
  );
}
