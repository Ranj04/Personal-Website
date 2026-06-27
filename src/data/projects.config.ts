import type { ProjectsConfig } from "@/lib/projects";

/**
 * Curation layer for the GitHub project grid. Edit this file to tune what shows.
 * Repo names must match GitHub exactly (case-sensitive).
 */
export const projectsConfig: ProjectsConfig = {
  // Shown first, in this order.
  featured: [
    "Autonomous-Healthcare-Hackathon",
    "AI-Car-Quotation",
    "SFSU-TutorConnect",
  ],

  // Excluded entirely.
  hidden: [
    "Personal-Website", // this site itself
    "Ranj04", // GitHub profile README repo, not a project
  ],

  // Manual deploy URLs for repos whose GitHub "homepage" field isn't set.
  // e.g. "My-Repo": "https://my-repo.vercel.app"
  liveOverrides: {},

  // Force the tech tags for a repo when README auto-detection misses (or
  // false-positives). e.g. "My-Repo": ["Next.js", "OpenAI"]
  tagOverrides: {
    // README prose mentions Next.js/FastAPI/etc. in passing; it's a C++ game.
    "2D-MOBA": [],
  },

  // Force a description when neither GitHub nor the README gives a good one.
  // e.g. "My-Repo": "A one-line summary."
  descriptionOverrides: {},
};
