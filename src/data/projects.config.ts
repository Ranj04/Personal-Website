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
  ],

  // Manual deploy URLs for repos whose GitHub "homepage" field isn't set.
  // e.g. "My-Repo": "https://my-repo.vercel.app"
  liveOverrides: {},

  // Force the tech tags for a repo when README auto-detection misses.
  // e.g. "My-Repo": ["Next.js", "OpenAI"]
  tagOverrides: {},

  // Force a description when neither GitHub nor the README gives a good one.
  // e.g. "My-Repo": "A one-line summary."
  descriptionOverrides: {},
};
