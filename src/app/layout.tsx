import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Geist — clean, modern sans for body copy and section titles.
const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// JetBrains Mono — the signature face: hero headline + all labels/metadata.
// He lives in the terminal and ships from GitHub; the type wears that.
const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// Production URL for absolute OG/canonical links. Vercel injects
// VERCEL_PROJECT_PRODUCTION_URL automatically; override with NEXT_PUBLIC_SITE_URL
// once a custom domain is set.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const description =
  "Ranjiv Jithendran builds autonomous AI agents that act across real tools and verify their own work. Agentic AI/ML engineer, full-stack developer, CS @ SFSU.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ranjiv Jithendran — Agentic AI/ML Engineer",
    template: "%s · Ranjiv Jithendran",
  },
  description,
  applicationName: "Ranjiv Jithendran",
  authors: [{ name: "Ranjiv Jithendran", url: "https://github.com/Ranj04" }],
  creator: "Ranjiv Jithendran",
  keywords: [
    "Ranjiv Jithendran",
    "agentic AI",
    "AI engineer",
    "ML engineer",
    "autonomous agents",
    "full-stack developer",
    "SFSU",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Ranjiv Jithendran",
    title: "Ranjiv Jithendran — Agentic AI/ML Engineer",
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranjiv Jithendran — Agentic AI/ML Engineer",
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
