import { getProjects } from "@/lib/github";
import { prettyName, type Project } from "@/lib/projects";
import {
  email,
  getSiteUrl,
  githubUrl,
  linkedinUrl,
  siteDescription,
  siteName,
} from "@/lib/site";

// llms.txt (https://llmstxt.org): a plain-Markdown summary of the site for AI
// agents and LLM crawlers. Shares the GitHub data (and ISR window) with the page.
export const revalidate = 3600;

function projectLine(p: Project): string {
  const link = p.live ?? p.url;
  const title = link ? `[${prettyName(p.name)}](${link})` : prettyName(p.name);
  const meta = [
    p.languages.length ? p.languages.join(", ") : null,
    p.tags.length ? `built with ${p.tags.join(", ")}` : null,
    p.url ? null : "private repo",
  ]
    .filter(Boolean)
    .join("; ");
  const detail = [p.description, meta && `(${meta})`].filter(Boolean).join(" ");
  return `- ${title}${detail ? `: ${detail}` : ""}`;
}

export async function GET() {
  const url = getSiteUrl();
  const projects = await getProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  const body = `# ${siteName}

> ${siteDescription}

## About

- Agentic AI/ML engineer and full-stack developer in San Francisco; recent computer science graduate of San Francisco State University.
- Founding Engineer at [Avior Technology](https://useavior.com), a pre-seed stablecoin neobank. Builds the product that ties wallets, fiat and crypto rails, card issuing, cashback, and identity into one global account, shipped on web and mobile.
- Worked on Avior's AI CFO: an agent that keeps the books and moves money on request.
- Focus: autonomous systems, the full-stack and mobile apps around them, and the harness that makes agents reliable.
- Open to agentic AI/ML and full-stack roles, and to collaborating on agent projects.

## Contact

- Website: ${url}
- Email: ${email}
- GitHub: ${githubUrl}
- LinkedIn: ${linkedinUrl}

## Featured projects

${featured.map(projectLine).join("\n") || "- See GitHub."}

## Other projects

${rest.map(projectLine).join("\n") || `- See ${githubUrl}`}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
