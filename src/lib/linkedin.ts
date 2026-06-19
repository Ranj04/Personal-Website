import "server-only";

import { unstable_cache } from "next/cache";
import {
  linkedInPosts as fallbackPosts,
  type LinkedInPost,
} from "@/data/linkedin-posts";

// Live LinkedIn posts via the Apify "harvestapi/linkedin-profile-posts" actor
// (no-cookie: scrapes public posts with Apify's own infrastructure — never the
// account's credentials). Falls back to the local seed file when APIFY_TOKEN is
// absent or the call fails, so the section never goes empty.
const PROFILE_URL = "https://www.linkedin.com/in/ranjiv-jithendran/";
const ACTOR = "harvestapi~linkedin-profile-posts";
const MAX_POSTS = 8;

type ApifyImage = string | { url?: string };
type ApifyPost = {
  id?: string;
  content?: string;
  linkedinUrl?: string;
  postedAt?: { date?: string };
  // Post media. The exact field name varies by actor run, so we probe the
  // common ones defensively and degrade to text-only if none are present.
  images?: ApifyImage[];
  image?: string;
};

/** First usable image URL from a scraped post, or undefined. */
function firstImage(p: ApifyPost): string | undefined {
  if (typeof p.image === "string" && p.image) return p.image;
  const first = p.images?.[0];
  if (typeof first === "string") return first || undefined;
  if (first && typeof first.url === "string") return first.url || undefined;
  return undefined;
}

function sortDesc(posts: LinkedInPost[]): LinkedInPost[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

async function fetchFromApify(): Promise<LinkedInPost[] | null> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrls: [PROFILE_URL],
          maxPosts: MAX_POSTS,
          scrapeReactions: false,
          scrapeComments: false,
        }),
      },
    );
    if (!res.ok) return null;

    const items: ApifyPost[] = await res.json();
    const mapped = items
      .filter((p) => p.content && p.linkedinUrl && p.postedAt?.date)
      .map(
        (p) =>
          ({
            id: p.id ?? p.linkedinUrl!,
            date: p.postedAt!.date!,
            text: p.content!,
            url: p.linkedinUrl!,
            image: firstImage(p),
          }) satisfies LinkedInPost,
      );
    return mapped.length > 0 ? mapped : null;
  } catch {
    return null;
  }
}

// Cache the (paid, slow) actor run ~6h so it isn't hit on every ISR regen;
// a transient failure self-heals within the window rather than sticking a day.
const getCachedLivePosts = unstable_cache(fetchFromApify, ["linkedin-posts-v1"], {
  revalidate: 21600,
});

export async function getLinkedInPosts(): Promise<LinkedInPost[]> {
  const live = await getCachedLivePosts();
  return sortDesc(live && live.length > 0 ? live : fallbackPosts);
}
