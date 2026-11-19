import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ScrollProgress } from "@/components/scroll-progress";
import { JsonLd } from "@/components/json-ld";
import {
  getSiteUrl,
  githubUrl,
  siteDescription,
  siteName,
  siteTitle,
} from "@/lib/site";
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

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s · ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: githubUrl }],
  creator: siteName,
  keywords: [
    "Ranjiv Jithendran",
    "Avior",
    "Avior Technology",
    "founding engineer",
    "agentic AI",
    "AI engineer",
    "ML engineer",
    "autonomous agents",
    "full-stack developer",
    "San Francisco",
  ],
  alternates: {
    canonical: "/",
    // Points AI agents / LLM crawlers at the Markdown summary (llmstxt.org).
    types: { "text/markdown": "/llms.txt" },
  },
  openGraph: {
    type: "website",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
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
        <JsonLd />
        {/* Without JS, the scroll-reveal class would stay hidden — force it visible. */}
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ScrollProgress />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
