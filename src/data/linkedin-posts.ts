export type LinkedInPost = {
  id: string;
  date: string; // ISO
  text: string; // post body (markdown-lite ok)
  url: string; // link to the real post on LinkedIn
  image?: string; // optional /public path
  tags?: string[];
};

// TODO: replace with real posts — these are realistic placeholders so the
// layout can be reviewed. Swap `url` for each post's real LinkedIn permalink,
// drop in real `image` paths under /public, and update dates.
export const linkedInPosts: LinkedInPost[] = [
  {
    id: "expense-agent",
    date: "2026-05-22",
    text: "Shipped an autonomous expense-approval agent for the Composio hackathon — theme was \"doing over reasoning,\" and that framing stuck with me.\n\nA receipt email lands, Gemini extracts the fields and decides how to route it against policy, then it executes for real across Gmail, Google Sheets and Telegram. No human presses go.",
    url: "https://www.linkedin.com/in/ranjiv-jithendran/",
    tags: ["agents", "composio", "gemini"],
  },
  {
    id: "healthcare-hackathon",
    date: "2026-04-08",
    text: "Spent the weekend building a voice agent that handles the paperwork the healthcare system buries people in.\n\nThe hard part was never the model — it was making the thing verify its own output before acting, so a wrong field doesn't quietly become a wrong claim. That's the pattern I keep coming back to: agents that check their work, not just produce it.",
    url: "https://www.linkedin.com/in/ranjiv-jithendran/",
    image: "/posts/sample.svg",
    tags: ["healthcare", "voice-agents", "hackathon"],
  },
  {
    id: "why-agents",
    date: "2026-02-19",
    text: "Most \"AI features\" are a prompt and a hope. The interesting work is the harness around the model — tools, verification, retries, the gate that decides whether to act.",
    url: "https://www.linkedin.com/in/ranjiv-jithendran/",
    tags: ["agents"],
  },
];
