"use client";

import { useEffect, useRef } from "react";

/**
 * A thin brand-gradient bar pinned to the top of the viewport that fills as the
 * page is scrolled. Reads progress in a rAF-batched passive scroll handler and
 * drives a single `scaleX` transform — cheap, no layout, no re-renders.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const progress = max > 0 ? Math.min(doc.scrollTop / max, 1) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        ref={ref}
        className="h-full origin-left scale-x-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--brand), var(--brand-2))",
        }}
      />
    </div>
  );
}
