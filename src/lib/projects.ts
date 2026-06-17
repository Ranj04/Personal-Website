// Pure, dependency-free project shaping. Kept free of "@/..." imports so it can
// be unit-verified directly (see scripts/verify-projects.mts).

/** The subset of the GitHub repo payload we consume. */
export type GitHubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  fork: boolean;
  archived: boolean;
};

/** A repo shaped for the UI. */
export type Project = {
  name: string;
  description: string | null;
  url: string; // repo page
  live: string | null; // deploy URL, or null when there's none
  language: string | null;
  tags: string[]; // tech derived from the README (+ overrides)
  stars: number;
  updatedAt: string;
  featured: boolean;
};

export type ProjectsConfig = {
  featured: string[];
  hidden: string[];
  liveOverrides: Record<string, string>;
  /** Force the tag list for a repo (replaces README detection). */
  tagOverrides: Record<string, string[]>;
  /** Force the description for a repo (wins over GitHub/README). */
  descriptionOverrides: Record<string, string>;
};

/** kebab/snake repo name → readable title, e.g. "What-Did-I-Miss-" → "What Did I Miss". */
export function prettyName(name: string): string {
  return name.replace(/[-_]+/g, " ").trim();
}

// Tech detected from README prose. Labels are display strings; patterns are matched
// case-insensitively. Heuristic by design — tagOverrides exist for precision.
const TECH_KEYWORDS: Record<string, RegExp> = {
  "Next.js": /next\.?js|create-next-app/i,
  React: /\breact\b/i,
  TypeScript: /\btypescript\b/i,
  Tailwind: /tailwind/i,
  "Node.js": /node\.?js/i,
  Express: /\bexpress\b/i,
  Python: /\bpython\b/i,
  FastAPI: /fastapi/i,
  Flask: /\bflask\b/i,
  OpenAI: /openai|gpt-[34]/i,
  Gemini: /\bgemini\b/i,
  LangChain: /langchain/i,
  Composio: /composio/i,
  Supabase: /supabase/i,
  Firebase: /firebase/i,
  PostgreSQL: /postgre/i,
  MongoDB: /mongo/i,
  "Three.js": /three\.?js|react-three/i,
  Docker: /docker/i,
  Telegram: /telegram/i,
  Gmail: /gmail/i,
  "Google Sheets": /google sheets/i,
};

export function detectTags(readme: string): string[] {
  if (!readme) return [];
  // Strip email addresses so contact emails (e.g. name@gmail.com) don't false-tag.
  const text = readme.replace(/[\w.+-]+@[\w.-]+\.\w+/g, " ");
  return Object.entries(TECH_KEYWORDS)
    .filter(([, re]) => re.test(text))
    .map(([label]) => label);
}

function isBoilerplateReadme(readme: string): boolean {
  return /bootstrapped with .{0,40}create-next-app/i.test(readme);
}

/** First real prose paragraph of a README, cleaned of markdown. Null if none/boilerplate. */
export function readmeSummary(readme: string): string | null {
  if (!readme || isBoilerplateReadme(readme)) return null;

  const withoutCode = readme.replace(/```[\s\S]*?```/g, "");
  const paragraph: string[] = [];

  for (const raw of withoutCode.split("\n")) {
    const line = raw.trim();
    if (!line) {
      if (paragraph.length) break; // end of first paragraph
      continue;
    }
    if (line.startsWith("#")) continue; // heading
    if (line.startsWith(">")) continue; // blockquote / callout
    if (line.startsWith("|")) {
      if (paragraph.length) break;
      continue;
    } // table
    if (/^[-*]\s/.test(line)) {
      if (paragraph.length) break;
      continue;
    } // list
    if (/^!?\[/.test(line)) continue; // image / badge line
    paragraph.push(line);
  }

  if (!paragraph.length) return null;

  let summary = paragraph
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links → text
    .replace(/[*_`#]/g, "") // emphasis / code marks
    .replace(/\s+/g, " ")
    .trim();

  if (summary.length > 220) summary = summary.slice(0, 217).trimEnd() + "…";
  return summary || null;
}

/**
 * Filter (forks/archived/hidden), apply overrides + README enrichment, and order:
 * featured first (in config order), then the rest newest-first.
 * `readmes` maps repo name → raw README text ("" when absent).
 */
export function shapeProjects(
  repos: GitHubRepo[],
  config: ProjectsConfig,
  readmes: Record<string, string> = {},
): Project[] {
  const hidden = new Set(config.hidden);
  const featuredIndex = new Map(config.featured.map((name, i) => [name, i]));

  const projects = repos
    .filter((r) => !r.fork && !r.archived && !hidden.has(r.name))
    .map((r) => {
      const readme = readmes[r.name] ?? "";
      const override = config.liveOverrides[r.name];
      const homepage = r.homepage?.trim() ? r.homepage : null;
      const ghDescription = r.description?.trim() ? r.description.trim() : null;

      return {
        name: r.name,
        description:
          config.descriptionOverrides[r.name] ??
          ghDescription ??
          readmeSummary(readme),
        url: r.html_url,
        live: override ?? homepage,
        language: r.language,
        tags: config.tagOverrides[r.name] ?? detectTags(readme),
        stars: r.stargazers_count,
        updatedAt: r.updated_at,
        featured: featuredIndex.has(r.name),
      } satisfies Project;
    });

  projects.sort((a, b) => {
    const ai = featuredIndex.get(a.name) ?? Infinity;
    const bi = featuredIndex.get(b.name) ?? Infinity;
    if (ai !== bi) return ai - bi;
    return b.updatedAt.localeCompare(a.updatedAt);
  });

  return projects;
}
