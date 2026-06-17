# Ranjiv Jithendran — Portfolio

Personal portfolio for Ranjiv Jithendran (agentic AI/ML engineer). Single-page,
dark, with a WebGL hero, a GitHub-driven project grid, and a local LinkedIn feed.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Motion** for micro-interactions, **Lucide** for icons
- **React Three Fiber** + **drei** for the hero scene (lazy, perf-gated)
- **Geist** + **Geist Mono** via `next/font`
- Deploys to **Vercel**; GitHub data via the REST API at build time (ISR)

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run lint
```

## Environment

Create `.env.local` in the project root:

```
GITHUB_TOKEN=your_token_here
```

- The token raises the GitHub API rate limit from 60 → 5,000 req/hr, which keeps
  builds reliable (the project list **and** each repo's README are fetched).
- For public repos **no scopes are required** — create a fine-grained token with
  read-only public access (or a classic token with no scopes). Least privilege.
- It's server-only and never shipped to the client. `.env*` is gitignored.
- The site still builds without a token (unauthenticated 60/hr), just rate-limited.

Optional: `NEXT_PUBLIC_SITE_URL=https://your-domain.com` to set absolute OG /
canonical URLs when using a custom domain (on Vercel the production URL is
detected automatically).

## Maintaining content

### Projects (`src/data/projects.config.ts`)

Repos are pulled live from GitHub (`Ranj04`), forks/archived excluded, refreshed
hourly via ISR. Curate with this file (repo names must match GitHub exactly):

- `featured` — repos shown first, in this order (the first is the large "lead" card).
- `hidden` — repos excluded entirely.
- `liveOverrides` — manual deploy URL when a repo's GitHub `homepage` isn't set.
- `tagOverrides` — force the tech tags when README auto-detection misses.
- `descriptionOverrides` — force a card description.

Descriptions and tech tags are derived from each repo's README (GitHub
`description` → README first paragraph; tags from a keyword scan). The cleanest
way to improve a card is to improve that repo's README. The **"View Live"** button
appears only when a repo has a `homepage` (or a `liveOverrides` entry).

### LinkedIn feed (`src/data/linkedin-posts.ts`)

There is **no scraping** — the feed is a local array (LinkedIn's ToS forbids
scraping). Edit the `linkedInPosts` array: each entry needs `id`, `date` (ISO),
`text`, and `url` (the real post permalink); `image` (a `/public` path) and
`tags` are optional. Cards sort newest-first automatically.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. In Vercel: **New Project → import the repo** (framework auto-detected as Next.js).
3. Add the environment variable **`GITHUB_TOKEN`** in Project → Settings →
   Environment Variables (Production + Preview).
4. Deploy. The production URL serves real GitHub data; ISR refreshes hourly.

## Project structure

```
src/
  app/            layout, page, globals.css, opengraph-image, icon, not-found
  components/     hero, hero-scene (R3F), projects, project-card, linkedin-feed,
                  site-nav, site-footer, section, socials, ui/
  data/           projects.config.ts, linkedin-posts.ts
  hooks/          use-capabilities.ts (reduced-motion / low-power gating)
  lib/            github.ts (fetch+ISR), projects.ts (pure shaping)
scripts/          verify-projects.mts (data-layer test), shot.mjs (screenshots)
```
