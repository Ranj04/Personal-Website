import { pathToFileURL } from "node:url";
const PW = process.env.PW_PATH;
const pw = await import(pathToFileURL(PW).href);
const chromium = pw.chromium ?? pw.default?.chromium;
import { mkdirSync } from "node:fs";

const OUT = process.argv[2] ?? "screens/before";
mkdirSync(OUT, { recursive: true });
const base = "http://localhost:3000";

const browser = await chromium.launch();

async function shoot(label, width, height, prefersReduced = false) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    reducedMotion: prefersReduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  // full page
  await page.screenshot({ path: `${OUT}/${label}-full.png`, fullPage: true });
  // hero viewport
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${label}-hero.png` });
  // projects section
  const projects = await page.$("#projects");
  if (projects) {
    await projects.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/${label}-projects.png` });
  }
  await ctx.close();
}

await shoot("desktop", 1440, 900);
await shoot("mobile", 390, 844);
await browser.close();
console.log("done ->", OUT);
