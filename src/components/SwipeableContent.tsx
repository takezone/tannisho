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
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartTime = useRef<number | null>(null);

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
      if (deltaX > 0 && nextUrl) {
        // 右にスワイプ → 次の章（縦書きでは左側が次）
        router.push(nextUrl);
      } else if (deltaX < 0 && prevUrl) {
        // 左にスワイプ → 前の章（縦書きでは右側が前）
        router.push(prevUrl);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchStartTime.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={className}
    >
      {children}
    </div>
  );
}
