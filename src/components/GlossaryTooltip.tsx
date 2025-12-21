"use client";

import { PropsWithChildren, useState, useRef, useCallback } from "react";

interface GlossaryTooltipProps {
  reading: string;
  meaning: string;
}

export default function GlossaryTooltip({
  children,
  reading,
  meaning,
}: PropsWithChildren<GlossaryTooltipProps>) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<"below" | "above">("below");
  const containerRef = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // 画面の中央より下にある場合は上に表示
      if (rect.top > viewportHeight / 2) {
        setPosition("above");
      } else {
        setPosition("below");
      }
    }
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <span
      ref={containerRef}
      className="relative inline-block cursor-help border-b border-dotted border-stone-400/50 dark:border-stone-500/50 hover:border-amber-500 dark:hover:border-amber-400 transition-colors"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <span
          className={`absolute z-50 py-3 px-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg shadow-lg whitespace-normal pointer-events-none ${
            position === "below"
              ? "top-full mt-2 right-0"
              : "bottom-full mb-2 right-0"
          }`}
          style={{
            writingMode: "vertical-rl",
            height: "max-content",
            maxHeight: "200px",
          }}
        >
          <span className="block font-medium text-amber-700 dark:text-amber-400 ml-2">
            {reading}
          </span>
          <span className="block text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
            {meaning}
          </span>
        </span>
      )}
    </span>
  );
}
