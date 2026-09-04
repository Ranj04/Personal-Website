// Production URL for absolute OG/canonical/sitemap links. Vercel injects
// VERCEL_PROJECT_PRODUCTION_URL automatically; override with NEXT_PUBLIC_SITE_URL
// once a custom domain is set (include the protocol, e.g. https://ranjiv.dev).
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

export const siteName = "Ranjiv Jithendran";

export const siteTitle = "Ranjiv Jithendran — Founding Engineer at Avior";

export const siteDescription =
  "Ranjiv Jithendran is a Founding Engineer at Avior Technology. Agentic AI/ML engineer and full-stack developer in San Francisco.";

export const githubUrl = "https://github.com/Ranj04";
export const linkedinUrl = "https://www.linkedin.com/in/ranjiv-jithendran/";
export const email = "ranjiv.jithendran@gmail.com";

export function getJsonLd() {
  const url = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${url}/#person`,
        name: siteName,
        url,
        image: `${url}/ranjiv-avatar.jpg`,
        jobTitle: "Founding Engineer",
        worksFor: {
          "@type": "Organization",
          name: "Avior Technology",
          url: "https://useavior.com",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "San Francisco State University",
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: "San Francisco",
          addressRegion: "CA",
          addressCountry: "US",
        },
        sameAs: [githubUrl, linkedinUrl],
        email: `mailto:${email}`,
        description: siteDescription,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteName,
        description: siteDescription,
        publisher: { "@id": `${url}/#person` },
      },
    ],
  };
}
