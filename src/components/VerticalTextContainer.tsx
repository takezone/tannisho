"use client";

import { useEffect, useRef, ReactNode } from "react";

interface VerticalTextContainerProps {
  children: ReactNode;
  className?: string;
}

export default function VerticalTextContainer({
  children,
  className = "",
}: VerticalTextContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 縦書き（右から左）なので、スクロールを右端（文章の先頭）に設定
    if (containerRef.current) {
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}
