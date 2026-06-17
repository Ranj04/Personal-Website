import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Section } from "@/components/section";
import { Hero } from "@/components/hero";
import { Projects } from "@/components/projects";
import { LinkedInFeed } from "@/components/linkedin-feed";
import { Socials } from "@/components/socials";
import { getProjects } from "@/lib/github";

export const revalidate = 3600; // ISR: refresh GitHub data hourly

export default async function Home() {
  const projects = await getProjects();

  return (
    <>
      <SiteNav />

      <main id="top" className="flex-1">
        <Hero />

        <Section id="about" eyebrow="about" title="About">
          {/* TODO: replace with final bio copy — placeholder is written in-voice. */}
          <div className="grid gap-10 md:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg text-foreground/90">
                I&apos;m Ranjiv — an agentic AI/ML engineer and CS student at San
                Francisco State.
              </p>
              <p>
                I build autonomous systems that take an objective, act across
                real tools, and check their own work before calling it done. Most
                of my time goes into the harness around the model — the tools,
                the verification, the retries, the gate that decides whether to
                act — because that&apos;s where reliability actually comes from.
              </p>
              <p>
                I work full-stack, live in the terminal, and ship from GitHub.
                Lately that&apos;s meant agents for healthcare paperwork, expense
                approvals, and student catch-up.
              </p>
            </div>
            <dl className="space-y-3 font-mono text-sm">
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-muted-foreground">location</dt>
                <dd>San Francisco</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-muted-foreground">focus</dt>
                <dd>agentic systems · full-stack</dd>
              </div>
              <div className="flex gap-4">
                <dt className="w-24 shrink-0 text-muted-foreground">currently</dt>
                <dd>CS @ SFSU</dd>
              </div>
            </dl>
          </div>
        </Section>

        <Section id="projects" ariaLabel="Projects">
          <Projects projects={projects} />
        </Section>

        <Section id="linkedin" eyebrow="linkedin" title="LinkedIn">
          <LinkedInFeed />
        </Section>

        <Section id="contact" eyebrow="contact" title="Get in touch">
          <p className="max-w-2xl text-muted-foreground">
            The fastest way to reach me is email. I&apos;m open to agentic AI/ML
            and full-stack roles, and to collaborating on agent projects.
          </p>
          <a
            href="mailto:ranjiv.jithendran@gmail.com"
            className="mt-6 inline-block text-2xl font-semibold tracking-tight underline-offset-4 transition-colors hover:text-brand sm:text-3xl"
          >
            ranjiv.jithendran@gmail.com
          </a>
          <Socials className="mt-8" />
        </Section>
      </main>

      <SiteFooter />
    </>
  );
}
