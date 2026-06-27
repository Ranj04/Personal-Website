import { ImageResponse } from "next/og";

export const alt = "Ranjiv Jithendran — Agentic AI/ML Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Build-time social card, on-brand (near-black + electric blue).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#fafafa",
          padding: "80px",
        }}
      >
        <div style={{ fontSize: 30, color: "#a1a1a1" }}>~/ranjiv-jithendran</div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          <span>I build autonomous agents that are&nbsp;</span>
          <span style={{ color: "#3b82f6" }}>production</span>
          <span>&nbsp;ready with built-in harness and develop full-stack apps.</span>
        </div>
        <div style={{ fontSize: 28, color: "#a1a1a1" }}>
          agentic ai · ml engineer · cs @ sfsu
        </div>
      </div>
    ),
    { ...size },
  );
}
