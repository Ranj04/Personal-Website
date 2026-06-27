import "server-only";

import { projectsConfig } from "@/data/projects.config";
import { shapeProjects, type GitHubRepo, type Project } from "@/lib/projects";

const GITHUB_USER = "Ranj04";
const API = "https://api.github.com";

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github+json",
    "User-Agent": "ranjiv-portfolio",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/** Raw README text for a repo, or "" when it has none / fails. */
async function fetchReadme(repo: string): Promise<string> {
  try {
    const res = await fetch(`${API}/repos/${GITHUB_USER}/${repo}/readme`, {
      headers: { ...authHeaders(), Accept: "application/vnd.github.raw" },
      next: { revalidate: 3600 },
    });
    return res.ok ? await res.text() : "";
  } catch {
    return "";
  }
}

/**
 * All languages used in a repo, most-used first (this is what drives GitHub's
 * repo-page language bar). The /languages endpoint returns a { lang: bytes } map;
 * we sort by bytes desc and keep the names. Empty array on failure / no languages.
 */
async function fetchLanguages(repo: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}/repos/${GITHUB_USER}/${repo}/languages`, {
      headers: authHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const bytes: Record<string, number> = await res.json();
    return Object.entries(bytes)
      .sort(([, a], [, b]) => b - a)
      .map(([lang]) => lang);
  } catch {
    return [];
  }
}

/**
 * Fetch + shape the public repos at build time (revalidated hourly via ISR).
 * Also pulls each kept repo's README to derive descriptions + tech tags.
 * GITHUB_TOKEN (server-only) raises the rate limit; never reaches the client.
 *
 * Degrades gracefully: a GitHub failure (rate limit, network, etc.) returns an
 * empty list instead of throwing, so the rest of the page still renders. Set
 * GITHUB_TOKEN to raise the 60 req/hr unauthenticated limit that's easy to hit
 * in dev.
 */
export async function getProjects(): Promise<Project[]> {
  let res: Response;
  try {
    res = await fetch(
      `${API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      { headers: authHeaders(), next: { revalidate: 3600 } },
    );
  } catch (err) {
    console.error("[getProjects] GitHub request failed:", err);
    return [];
  }

  if (!res.ok) {
    const hint =
      res.status === 403 && !process.env.GITHUB_TOKEN
        ? " (set GITHUB_TOKEN to raise the unauthenticated rate limit)"
        : "";
    console.error(
      `[getProjects] GitHub API error ${res.status}: ${res.statusText}${hint}`,
    );
    return [];
  }

  const repos: GitHubRepo[] = await res.json();

  // Only fetch per-repo data (README + languages) for repos that will show.
  const hidden = new Set(projectsConfig.hidden);
  const kept = repos.filter(
    (r) => !r.fork && !r.archived && !hidden.has(r.name),
  );
  const enrichment = await Promise.all(
    kept.map(
      async (r) =>
        [
          r.name,
          await Promise.all([fetchReadme(r.name), fetchLanguages(r.name)]),
        ] as const,
    ),
  );
  const readmes = Object.fromEntries(
    enrichment.map(([name, [readme]]) => [name, readme]),
  );
  const languages = Object.fromEntries(
    enrichment.map(([name, [, langs]]) => [name, langs]),
  );

  return shapeProjects(repos, projectsConfig, readmes, languages);
}
