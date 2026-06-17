// Full-page screenshots via Chrome DevTools Protocol (no extra deps).
// Requires Chrome already running with --remote-debugging-port=9222.
import fs from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const DEBUG = "http://localhost:9222";
const URL = process.env.SHOT_URL || "http://localhost:3000";

const list = await (await fetch(`${DEBUG}/json/list`)).json();
const page = list.find((t) => t.type === "page");
const sock = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => sock.addEventListener("open", r, { once: true }));

let id = 0;
const pending = new Map();
const waiters = [];
sock.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
  } else if (msg.method) {
    for (const w of waiters.slice())
      if (w.method === msg.method) {
        w.resolve(msg.params);
        waiters.splice(waiters.indexOf(w), 1);
      }
  }
});
const send = (method, params = {}) =>
  new Promise((res) => {
    const myId = ++id;
    pending.set(myId, res);
    sock.send(JSON.stringify({ id: myId, method, params }));
  });
const once = (method) => new Promise((resolve) => waiters.push({ method, resolve }));

await send("Page.enable");

async function shot({ width, height, mobile, out }) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  });
  const loaded = once("Page.loadEventFired");
  await send("Page.navigate", { url: URL });
  await loaded;
  await sleep(2500); // fonts, webgl, entrance
  // trigger whileInView observers across the whole page, then return to top
  await send("Runtime.evaluate", {
    expression: "window.scrollTo(0, document.body.scrollHeight)",
  });
  await sleep(1200);
  await send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await sleep(700);
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  fs.writeFileSync(out, Buffer.from(data, "base64"));
  console.log("saved", out);
}

await shot({ width: 1440, height: 900, mobile: false, out: "screenshots/desktop.png" });
await shot({ width: 390, height: 844, mobile: true, out: "screenshots/mobile.png" });
sock.close();
