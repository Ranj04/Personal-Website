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

/** Raw README text for an "owner/name" repo, or "" when it has none / fails. */
async function fetchReadme(fullName: string): Promise<string> {
  try {
    const res = await fetch(`${API}/repos/${fullName}/readme`, {
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
async function fetchLanguages(fullName: string): Promise<string[]> {
  try {
    const res = await fetch(`${API}/repos/${fullName}/languages`, {
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
 * A single "owner/name" repo (used for extraRepos), or null when it's missing or
 * the token can't see it — e.g. a private repo with no GITHUB_TOKEN set.
 */
async function fetchRepo(fullName: string): Promise<GitHubRepo | null> {
  try {
    const res = await fetch(`${API}/repos/${fullName}`, {
      headers: authHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[getProjects] ${fullName}: GitHub API error ${res.status}`);
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch + shape the public repos at build time (revalidated hourly via ISR),
 * plus any `extraRepos` from the config. Also pulls each kept repo's README to
 * derive descriptions + tech tags.
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

  const owned: GitHubRepo[] = await res.json();

  // Private and other-owner repos opted in via config. Skip any already listed.
  const ownedNames = new Set(owned.map((r) => r.full_name.toLowerCase()));
  const extras = await Promise.all(
    projectsConfig.extraRepos
      .filter((fullName) => !ownedNames.has(fullName.toLowerCase()))
      .map(fetchRepo),
  );
  const repos = [
    ...owned,
    ...extras.filter((r): r is GitHubRepo => r !== null),
  ];

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
          await Promise.all([
            fetchReadme(r.full_name),
            fetchLanguages(r.full_name),
          ]),
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
