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
  repo("Gh-Desc", { description: "Curated GitHub description" }),
  repo("Email-Repo"),
  repo("Gmail-Repo"),
];
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
const out = shapeProjects(synthetic, cfg, readmes);
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
  const real = shapeProjects(repos, projectsConfig, realReadmes);
  console.log(`  fetched ${repos.length} repos → ${real.length} after shaping`);
  console.table(
    real.map((p) => ({
      name: p.name,
      lang: p.language ?? "-",
      tags: p.tags.join(", ") || "-",
      desc: (p.description ?? "—").slice(0, 50),
    })),
  );
  assert(
    "hidden 'Personal-Website' excluded",
    !real.some((p) => p.name === "Personal-Website"),
  );
}

console.log(`\n${failures === 0 ? "ALL PASSED ✓" : `${failures} FAILURE(S) ✗`}`);
if (failures > 0) process.exitCode = 1;
