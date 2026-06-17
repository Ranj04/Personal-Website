export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-10 font-mono text-xs text-muted-foreground sm:flex-row sm:px-8">
        <p>© {year} Ranjiv Jithendran</p>
        <p>built with next.js · deployed on vercel</p>
      </div>
    </footer>
  );
}
