"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a fade + rise the first time they scroll into view.
 *
 * Progressive enhancement, matching the rest of the site:
 *  - The hidden→visible styles live in CSS under `(prefers-reduced-motion:
 *    no-preference)`, so reduced-motion users never see the hidden state.
 *  - Under reduced motion we skip the observer entirely (content is already
 *    visible), so there's nothing to toggle.
 *  - A <noscript> override in the layout keeps content visible without JS.
 *
 * `delay` staggers siblings (ms). The observer disconnects after firing once.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      // Trip slightly before the element is fully on screen.
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={
        delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
