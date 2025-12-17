"use client";

import { PropsWithChildren, useState, useRef, useEffect } from "react";

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
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // 縦書きの場合、ツールチップが画面外にはみ出すかチェック
      if (containerRect.left - tooltipRect.width < 10) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isVisible]);

  return (
    <span
      ref={containerRef}
      className="relative inline-block cursor-help border-b border-dotted border-stone-400/50 dark:border-stone-500/50 hover:border-amber-500 dark:hover:border-amber-400 transition-colors"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onTouchStart={() => setIsVisible(true)}
      onTouchEnd={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <span
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg shadow-lg whitespace-normal writing-horizontal-tb ${
            position === "bottom"
              ? "right-full mr-2 top-0"
              : "left-full ml-2 top-0"
          }`}
          style={{
            width: "max-content",
            maxWidth: "280px",
            writingMode: "horizontal-tb",
          }}
        >
          <span className="block font-medium text-amber-700 dark:text-amber-400 mb-1">
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
