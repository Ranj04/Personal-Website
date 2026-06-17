import { cn } from "@/lib/utils";

const socials = [
  { label: "github", href: "https://github.com/Ranj04" },
  { label: "linkedin", href: "https://www.linkedin.com/in/ranjiv-jithendran/" },
  // TODO: add X/Twitter when ready — uncomment this one line:
  // { label: "twitter / x", href: "https://x.com/HANDLE" },
];

export function Socials({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-6 gap-y-2", className)}>
      {socials.map((s) => (
        <li key={s.label}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            {s.label} <span aria-hidden="true">↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
