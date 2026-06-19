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
// LinkedIn public handle — used to drop reposts of other people's content
// (the actor returns those with the original author, not Ranjiv).
const PROFILE_HANDLE = "ranjiv-jithendran";
const ACTOR = "harvestapi~linkedin-profile-posts";
// Over-fetch: reposts of others' content get filtered out, so pull more than we
// render to reliably fill FEED_SIZE own-posts.
const MAX_POSTS = 12;
const FEED_SIZE = 6; // most-recent own posts shown in the section

type ApifyPost = {
  id?: string;
  content?: string;
  linkedinUrl?: string;
  postedAt?: { date?: string };
  // Attached images, highest-res first; empty for text-only posts.
  postImages?: { url?: string }[];
  author?: { publicIdentifier?: string };
};

/** First image URL on a post, or undefined for text-only posts. */
function firstImage(p: ApifyPost): string | undefined {
  const url = p.postImages?.[0]?.url;
  return typeof url === "string" && url ? url : undefined;
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
      .filter(
        (p) =>
          p.content &&
          p.linkedinUrl &&
          p.postedAt?.date &&
          // Only Ranjiv's own posts — skip bare reposts of others' content.
          p.author?.publicIdentifier === PROFILE_HANDLE,
      )
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
const getCachedLivePosts = unstable_cache(fetchFromApify, ["linkedin-posts-v2"], {
  revalidate: 21600,
});

export async function getLinkedInPosts(): Promise<LinkedInPost[]> {
  const live = await getCachedLivePosts();
  const posts = live && live.length > 0 ? live : fallbackPosts;
  return sortDesc(posts).slice(0, FEED_SIZE);
}
