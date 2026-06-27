// One-off Phase 3/4 verification. Run: npx tsx scripts/verify-projects.mts
// Imports the pure shaper directly (no "@/..." aliases at runtime).
import {
  shapeProjects,
  type GitHubRepo,
  type ProjectsConfig,
} from "../src/lib/projects";
import { projectsConfig } from "../src/data/projects.config";

let failures = 0;
function assert(label: string, cond: boolean) {
  console.log(`${cond ? "  ✓" : "  ✗ FAIL"} ${label}`);
  if (!cond) failures++;
}

function repo(name: string, over: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    name,
    description: null,
    html_url: `https://github.com/x/${name}`,
    homepage: null,
    language: null,
    stargazers_count: 0,
    updated_at: "2022-01-01T00:00:00Z",
    fork: false,
    archived: false,
    ...over,
  };
}

console.log("\n[1] Synthetic shaping + README enrichment test");
const synthetic: GitHubRepo[] = [
  repo("Featured-B"),
  repo("Featured-A"),
  repo("Recent-Normal", { updated_at: "2025-06-01T00:00:00Z" }),
  repo("Old-Normal", { updated_at: "2020-01-01T00:00:00Z" }),
  repo("A-Fork", { fork: true }),
  repo("An-Archive", { archived: true }),
  repo("Hidden-One"),
  repo("Has-Homepage", { homepage: "https://real.example" }),
  repo("Empty-Homepage", { homepage: "   " }),
  repo("Needs-Override"),
  repo("Readme-Repo"),
  repo("Boilerplate-Repo"),
  repo("Gh-Desc", { description: "Curated GitHub description", language: "Go" }),
  repo("Email-Repo"),
  repo("Gmail-Repo"),
];
const languages: Record<string, string[]> = {
  // Multi-language repo: order is "most-used first" and must be preserved.
  "Readme-Repo": ["TypeScript", "CSS", "JavaScript"],
  // "Gh-Desc" intentionally absent → must fall back to its primary ("Go").
};
const readmes: Record<string, string> = {
  "Readme-Repo":
    "# Cool Title 🚀\n\nAn agentic assistant built with Next.js and OpenAI that does things.\n\n## Setup\n...",
  "Boilerplate-Repo":
    "This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`].",
  // contact email must NOT produce a Gmail tag
  "Email-Repo": "# Tool\n\nA tiny CLI. Questions? Email me at ranjiv@gmail.com.",
  // genuine integration SHOULD produce a Gmail tag
  "Gmail-Repo": "# Agent\n\nSends notifications through the Gmail API.",
};
const cfg: ProjectsConfig = {
  featured: ["Featured-A", "Featured-B"],
  hidden: ["Hidden-One"],
  liveOverrides: { "Needs-Override": "https://override.example" },
  tagOverrides: { "Featured-A": ["Custom-Tag"] },
  descriptionOverrides: {},
};
const out = shapeProjects(synthetic, cfg, readmes, languages);
const byName = (n: string) => out.find((p) => p.name === n);
const names = out.map((p) => p.name);

assert("fork excluded", !names.includes("A-Fork"));
assert("archived excluded", !names.includes("An-Archive"));
assert("hidden excluded", !names.includes("Hidden-One"));
assert(
  "featured ordered first, in config order",
  names[0] === "Featured-A" && names[1] === "Featured-B",
);
assert(
  "non-featured newest-first",
  names.indexOf("Recent-Normal") < names.indexOf("Old-Normal"),
);
assert("homepage drives live link", byName("Has-Homepage")?.live === "https://real.example");
assert("empty homepage → null live", byName("Empty-Homepage")?.live === null);
assert("liveOverride applied", byName("Needs-Override")?.live === "https://override.example");
assert("tagOverride applied", JSON.stringify(byName("Featured-A")?.tags) === '["Custom-Tag"]');
assert(
  "README tags detected (Next.js + OpenAI)",
  ["Next.js", "OpenAI"].every((t) => byName("Readme-Repo")?.tags.includes(t)),
);
assert(
  "README summary extracted, markdown stripped",
  byName("Readme-Repo")?.description ===
    "An agentic assistant built with Next.js and OpenAI that does things.",
);
assert("boilerplate README → null description", byName("Boilerplate-Repo")?.description === null);
assert("GitHub description preferred when present", byName("Gh-Desc")?.description === "Curated GitHub description");
assert("contact email does NOT create Gmail tag", !byName("Email-Repo")?.tags.includes("Gmail"));
assert("genuine Gmail integration IS tagged", byName("Gmail-Repo")?.tags.includes("Gmail") === true);
assert(
  "all languages listed, most-used order preserved",
  JSON.stringify(byName("Readme-Repo")?.languages) ===
    '["TypeScript","CSS","JavaScript"]',
);
assert(
  "languages fall back to primary when endpoint empty/absent",
  JSON.stringify(byName("Gh-Desc")?.languages) === '["Go"]',
);
assert(
  "no languages + no primary → empty list",
  JSON.stringify(byName("Featured-A")?.languages) === "[]",
);

console.log("\n[2] Live GitHub data (Ranj04) shaped with real config + READMEs");
const headers = { Accept: "application/vnd.github+json", "User-Agent": "verify" };
const repoRes = await fetch(
  "https://api.github.com/users/Ranj04/repos?per_page=100&sort=updated",
  { headers },
);
const raw: unknown = await repoRes.json();
if (!Array.isArray(raw)) {
  const message =
    (raw as { message?: string })?.message ?? "unexpected response";
  console.log(`  ⚠ live test skipped — GitHub unavailable: ${message}`);
} else {
  const repos = raw as GitHubRepo[];
  const hidden = new Set(projectsConfig.hidden);
  const kept = repos.filter((r) => !r.fork && !r.archived && !hidden.has(r.name));
  const realReadmes: Record<string, string> = Object.fromEntries(
    await Promise.all(
      kept.map(async (r) => {
        const rr = await fetch(`https://api.github.com/repos/Ranj04/${r.name}/readme`, {
          headers: { ...headers, Accept: "application/vnd.github.raw" },
        });
        return [r.name, rr.ok ? await rr.text() : ""] as const;
      }),
    ),
  );
  const realLanguages: Record<string, string[]> = Object.fromEntries(
    await Promise.all(
      kept.map(async (r) => {
        const lr = await fetch(`https://api.github.com/repos/Ranj04/${r.name}/languages`, { headers });
        const bytes: Record<string, number> = lr.ok ? await lr.json() : {};
        const langs = Object.entries(bytes)
          .sort(([, a], [, b]) => b - a)
          .map(([l]) => l);
        return [r.name, langs] as const;
      }),
    ),
  );
  const real = shapeProjects(repos, projectsConfig, realReadmes, realLanguages);
  console.log(`  fetched ${repos.length} repos → ${real.length} after shaping`);
  console.table(
    real.map((p) => ({
      name: p.name,
      languages: p.languages.join(", ") || "-",
      tags: p.tags.join(", ") || "-",
      desc: (p.description ?? "—").slice(0, 50),
    })),
  );
  assert(
    "hidden 'Personal-Website' excluded",
    !real.some((p) => p.name === "Personal-Website"),
  );
  assert(
    "hidden 'Ranj04' profile repo excluded",
    !real.some((p) => p.name === "Ranj04"),
  );
  assert(
    "2D-MOBA tags cleared (false positives removed)",
    real.find((p) => p.name === "2D-MOBA")?.tags.length === 0,
  );
  // Robust to rate-limiting (languages then fall back to primary) and to empty
  // repos (no primary, no languages): a repo with a primary must list it.
  assert(
    "every repo with a primary language lists it",
    real.every((p) => !p.language || p.languages.includes(p.language)),
  );
  const multiLang = real.filter((p) => p.languages.length > 1);
  console.log(
    `  ${multiLang.length} repo(s) with multiple languages` +
      (multiLang.length === 0 ? " (likely rate-limited — re-run with GITHUB_TOKEN)" : ""),
  );
}

console.log(`\n${failures === 0 ? "ALL PASSED ✓" : `${failures} FAILURE(S) ✗`}`);
if (failures > 0) process.exitCode = 1;
