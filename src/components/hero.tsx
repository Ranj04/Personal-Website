"use client";

import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useCapabilities } from "@/hooks/use-capabilities";

// Lazy, client-only — never blocks first paint.
const HeroScene = dynamic(() => import("@/components/hero-scene"), {
  ssr: false,
});

// Static fallback (also the reduced-motion / low-power background).
const fallbackGradient = {
  background: [
    "radial-gradient(55% 50% at 78% 32%, color-mix(in oklch, var(--brand) 22%, transparent), transparent 70%)",
    "radial-gradient(45% 50% at 92% 78%, color-mix(in oklch, var(--brand-2) 14%, transparent), transparent 72%)",
    "var(--background)",
  ].join(","),
};

// Calm the left side so the thesis sits on near-black; aurora reads on the right.
const leftCalm = {
  background:
    "linear-gradient(90deg, var(--background) 0%, color-mix(in oklch, var(--background) 65%, transparent) 42%, transparent 72%)",
};

export function Hero() {
  const { reducedMotion, lowPower } = useCapabilities();
  const showScene = !reducedMotion;

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="relative flex min-h-[88vh] scroll-mt-24 items-center overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0" style={fallbackGradient} />
        {showScene && <HeroScene lowPower={lowPower} />}
        <div className="absolute inset-0" style={leftCalm} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="max-w-3xl">
          <p className="fade-up fade-up-1 font-mono text-xs lowercase tracking-[0.08em] text-muted-foreground">
            agentic ai · ml engineer
          </p>

          <h1 className="fade-up fade-up-2 mt-6 font-mono text-balance text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.14] tracking-[-0.04em]">
            I build autonomous agents that act across real tools and{" "}
            <span className="text-brand">verify</span>{" "}their own work before
            they&apos;re done.
            <span className="hero-cursor" aria-hidden="true" />
          </h1>

          <p className="fade-up fade-up-3 mt-7 font-mono text-xs tracking-[0.04em] text-muted-foreground">
            san francisco · cs @ sfsu · github/Ranj04
          </p>

          <div className="fade-up fade-up-4 mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#projects"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 gap-2 bg-brand px-6 text-sm font-medium text-background hover:bg-brand/90",
              )}
            >
              View the work
              <ArrowRight className="size-4" />
            </a>
            <a
              href="#contact"
              className="font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              email me
            </a>
            {/* Resume CTA intentionally omitted until a resume link exists (per brief). */}
          </div>
        </div>
      </div>
    </section>
  );
}
