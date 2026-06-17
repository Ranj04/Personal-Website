import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-32">
      <div className="max-w-md">
        <p className="font-mono text-xs lowercase tracking-[0.08em] text-muted-foreground">
          error 404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          This page doesn&apos;t exist.
        </h1>
        <p className="mt-4 text-muted-foreground">
          The route you tried isn&apos;t here — it may have moved, or never
          shipped.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block font-mono text-sm text-brand underline-offset-4 hover:underline"
        >
          cd ~ <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
