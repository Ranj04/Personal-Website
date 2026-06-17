"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { prettyName, type Project } from "@/lib/projects";
import { ProjectCard } from "@/components/project-card";
import { useCapabilities } from "@/hooks/use-capabilities";

export function Projects({ projects }: { projects: Project[] }) {
  const { reducedMotion: reduced } = useCapabilities();
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const languages = useMemo(
    () =>
      Array.from(
        new Set(projects.map((p) => p.language).filter((l): l is string => !!l)),
      ).sort(),
    [projects],
  );

  // README-derived tech tags. Auto-hidden until at least one repo has any.
  const tags = useMemo(
    () => Array.from(new Set(projects.flatMap((p) => p.tags))).sort(),
    [projects],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        !q ||
        prettyName(p.name).toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false);
      const matchesLang = !language || p.language === language;
      const matchesTag = !tag || p.tags.includes(tag);
      return matchesQuery && matchesLang && matchesTag;
    });
  }, [projects, query, language, tag]);

  const hasFilters = query !== "" || language !== null || tag !== null;
  function clearAll() {
    setQuery("");
    setLanguage(null);
    setTag(null);
  }

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);
  const showFeaturedLayout = !hasFilters && featured.length > 0;

  return (
    <div>
      <header className="mb-8 flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <h2 className="font-mono text-sm lowercase tracking-[0.08em] text-foreground">
          projects
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {projects.length} repos · live from github
        </span>
      </header>

      {/* Controls */}
      <div className="flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search projects…"
            aria-label="Search projects"
            className="h-10 w-full rounded-md border border-border bg-card/30 pl-9 pr-9 font-mono text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand/50 focus-visible:ring-3 focus-visible:ring-brand/20"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <FilterRow
          label="lang"
          options={languages}
          selected={language}
          onSelect={setLanguage}
        />
        {tags.length > 0 && (
          <FilterRow label="tech" options={tags} selected={tag} onSelect={setTag} />
        )}
      </div>

      <div className="mt-5 flex items-center justify-between font-mono text-xs text-muted-foreground">
        <span>{filtered.length} shown</span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            clear ✕
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="mt-6 border border-dashed border-border p-12 text-center">
          <p className="font-mono text-sm text-muted-foreground">
            No repos match that filter.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-3 font-mono text-sm text-brand underline-offset-4 hover:underline"
          >
            clear filters
          </button>
        </div>
      ) : showFeaturedLayout ? (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {featured.map((p, i) => (
              <ProjectCard
                key={p.name}
                project={p}
                variant={i === 0 ? "lead" : "card"}
                reduced={reduced}
              />
            ))}
          </div>
          {rest.length > 0 && (
            <div className="mt-14">
              <p className="mb-1 font-mono text-xs lowercase tracking-[0.08em] text-muted-foreground">
                all repos
              </p>
              <ul className="grid sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
                {rest.map((p) => (
                  <li key={p.name}>
                    <ProjectCard project={p} variant="compact" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <ul className="mt-6 grid sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.name}>
              <ProjectCard project={p} variant="compact" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 font-mono text-xs lowercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <Chip active={selected === null} onClick={() => onSelect(null)}>
        all
      </Chip>
      {options.map((opt) => (
        <Chip
          key={opt}
          active={selected === opt}
          onClick={() => onSelect(selected === opt ? null : opt)}
        >
          {opt}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded border px-2 py-0.5 font-mono text-xs transition-colors",
        active
          ? "border-brand/50 bg-brand/15 text-foreground"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
