import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

type SectionProps = {
  id: string;
  eyebrow?: string;
  title?: string;
  ariaLabel?: string; // used as the landmark name when there's no visible title
  className?: string;
  children?: React.ReactNode;
};

/**
 * Consistent section wrapper: anchor id + scroll offset for the sticky nav,
 * shared container width, generous vertical rhythm, the heading scale, and a
 * named region landmark for assistive tech.
 */
export function Section({
  id,
  eyebrow,
  title,
  ariaLabel,
  className,
  children,
}: SectionProps) {
  const headingId = title ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      aria-label={headingId ? undefined : ariaLabel}
      className={cn("scroll-mt-24 py-12 sm:py-16", className)}
    >
      <Reveal className="mx-auto w-full max-w-6xl px-6 sm:px-8">
        {(eyebrow || title) && (
          <div className="mb-10">
            {eyebrow && (
              <p className="mb-3 font-mono text-xs lowercase tracking-[0.08em] text-muted-foreground">
                <span aria-hidden="true" className="mr-1.5 text-brand">
                  ▸
                </span>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                id={headingId}
                className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl"
              >
                {title}
              </h2>
            )}
          </div>
        )}
        {children}
      </Reveal>
    </section>
  );
}
