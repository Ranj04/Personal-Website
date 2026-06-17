import { linkedInPosts } from "@/data/linkedin-posts";

// Local data only — no LinkedIn scraping or network calls (their ToS forbids it).
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function LinkedInFeed() {
  const posts = [...linkedInPosts].sort((a, b) => b.date.localeCompare(a.date));

  if (posts.length === 0) {
    return (
      <p className="font-mono text-sm text-muted-foreground">No posts yet.</p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <li key={post.id} className="h-full">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col rounded-lg border border-border bg-card/30 p-5 transition-colors hover:border-foreground/25 hover:bg-card/50"
          >
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>linkedin</span>
            </div>

            {post.image && (
              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-md border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied post image */}
                <img
                  src={post.image}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {post.text}
            </p>

            {post.tags && post.tags.length > 0 && (
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <span className="mt-auto pt-5 font-mono text-xs text-brand">
              read on linkedin <span aria-hidden="true">→</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
