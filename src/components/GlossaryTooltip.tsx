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
  const [position, setPosition] = useState<"left" | "right">("left");
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && containerRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // 縦書きの場合、ツールチップが画面下にはみ出すかチェック
      if (containerRect.bottom + tooltipRect.height > window.innerHeight - 10) {
        setPosition("right");
      } else {
        setPosition("left");
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
          className={`absolute z-50 py-3 px-2 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-lg shadow-lg whitespace-normal ${
            position === "left"
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
