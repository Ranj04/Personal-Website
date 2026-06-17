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
 * Fetch + shape the public repos at build time (revalidated hourly via ISR).
 * Also pulls each kept repo's README to derive descriptions + tech tags.
 * GITHUB_TOKEN (server-only) raises the rate limit; never reaches the client.
 */
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(
    `${API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
    { headers: authHeaders(), next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`);
  }

  const repos: GitHubRepo[] = await res.json();

  // Only fetch READMEs for repos that will actually be shown.
  const hidden = new Set(projectsConfig.hidden);
  const kept = repos.filter(
    (r) => !r.fork && !r.archived && !hidden.has(r.name),
  );
  const readmeEntries = await Promise.all(
    kept.map(async (r) => [r.name, await fetchReadme(r.name)] as const),
  );
  const readmes = Object.fromEntries(readmeEntries);

  return shapeProjects(repos, projectsConfig, readmes);
}
