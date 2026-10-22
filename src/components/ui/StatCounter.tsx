"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value up to its target when scrolled into view. Preserves
 * any non-numeric prefix/suffix in the label (e.g. "$", "B", "+", "M").
 */
export function StatCounter({
  value,
  durationMs = 1600,
  className,
}: {
  value: string;
  durationMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Parse the leading number out of the string (handles "1,200+", "$2.4B").
    const match = value.match(/([^\d]*)([\d,.]+)(.*)/);
    if (!match) {
      setDisplay(value);
      return;
    }
    const [, prefix, numStr, suffix] = match;
    const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
    const target = parseFloat(numStr.replace(/,/g, ""));
    if (!Number.isFinite(target)) {
      setDisplay(value);
      return;
    }

    const useGrouping = numStr.includes(",");
    const format = (n: number) =>
      `${prefix}${n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      })}${suffix}`;

    setDisplay(format(0));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setDisplay(value);
          observer.disconnect();
          return;
        }

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          // easeOutExpo
          const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
          setDisplay(format(target * eased));
          if (t < 1) requestAnimationFrame(tick);
          else setDisplay(value);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, durationMs]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
