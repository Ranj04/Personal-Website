"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { prettyName, type Project } from "@/lib/projects";

type Variant = "lead" | "card" | "compact";

function Meta({ project }: { project: Project }) {
  // All languages, most-used first (mirrors the repo-page language bar).
  const languages = project.languages.length
    ? project.languages
    : project.language
      ? [project.language]
      : [];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
      {languages.length > 0 && <span>{languages.join(" · ")}</span>}
      {project.stars > 0 && (
        <span className="flex items-center gap-1">
          <Star className="size-3" />
          {project.stars}
        </span>
      )}
    </div>
  );
}

function Links({ project }: { project: Project }) {
  return (
    <div className="flex items-center gap-4 font-mono text-xs">
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        aria-label={`view repo ${prettyName(project.name)}`}
      >
        view repo <span aria-hidden="true">→</span>
      </a>
      {project.live && (
        <a
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand underline-offset-4 transition-all hover:brightness-125 hover:underline"
          aria-label={`live demo ${prettyName(project.name)}`}
        >
          live demo <span aria-hidden="true">→</span>
        </a>
      )}
    </div>
  );
}

function Tags({ project, max }: { project: Project; max: number }) {
  if (project.tags.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {project.tags.slice(0, max).map((tag) => (
        <li
          key={tag}
          className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}

// Dense, quiet row for non-featured repos. Pure — no hooks, cheap to hydrate.
function CompactCard({ project }: { project: Project }) {
  return (
    <article className="flex flex-col gap-2 border-t border-border py-5 transition-colors hover:border-foreground/30">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-medium tracking-tight">{prettyName(project.name)}</h3>
        <Meta project={project} />
      </div>
      {project.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {project.description}
        </p>
      )}
      <div className="mt-1">
        <Links project={project} />
      </div>
    </article>
  );
}

// Featured (lead/card) with a subtle hover tilt. `reduced` is passed in so we
// don't subscribe to reduced-motion per card.
function FeaturedCard({
  project,
  lead,
  reduced,
}: {
  project: Project;
  lead: boolean;
  reduced: boolean;
}) {
  const tiltRef = useRef<HTMLDivElement>(null);

  function handleMove(e: React.MouseEvent) {
    const el = tiltRef.current;
    if (!el || reduced) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${-py * 4}deg) rotateY(${px * 4}deg)`;
  }
  function reset() {
    if (tiltRef.current) tiltRef.current.style.transform = "";
  }

  return (
    <article className={cn("[perspective:1000px]", lead && "lg:col-span-2")}>
      <div
        ref={tiltRef}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={cn(
          "flex h-full flex-col gap-5 rounded-lg border border-border bg-card/30 p-6 transition-[transform,border-color,background-color] duration-200 ease-out will-change-transform hover:border-foreground/25 hover:bg-card/50",
          lead && "lg:flex-row lg:items-stretch lg:gap-10 lg:p-8",
        )}
      >
        <div className="flex-1">
          <h3
            className={cn(
              "font-semibold tracking-tight",
              lead ? "text-2xl" : "text-lg",
            )}
          >
            {prettyName(project.name)}
          </h3>
          {project.description && (
            <p
              className={cn(
                "mt-3 text-sm text-muted-foreground",
                lead ? "max-w-md" : "line-clamp-3",
              )}
            >
              {project.description}
            </p>
          )}
          <div className="mt-4">
            <Tags project={project} max={lead ? 6 : 4} />
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-between gap-4",
            lead ? "lg:flex-col lg:items-end lg:justify-end" : "mt-auto",
          )}
        >
          <Meta project={project} />
          <Links project={project} />
        </div>
      </div>
    </article>
  );
}

export function ProjectCard({
  project,
  variant = "card",
  reduced = false,
}: {
  project: Project;
  variant?: Variant;
  reduced?: boolean;
}) {
  if (variant === "compact") return <CompactCard project={project} />;
  return (
    <FeaturedCard project={project} lead={variant === "lead"} reduced={reduced} />
  );
}
