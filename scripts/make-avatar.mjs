// One-off: crop a square, face-focused avatar from the source photo and emit a
// small optimized JPEG for the About section. Tune cx/cy/zoom then re-run.
import sharp from "sharp";

const SRC =
  "C:/Users/ranji/.claude/image-cache/a1956441-863f-4541-9c5d-42671464692c/1.png";
const OUT = "public/ranjiv-avatar.jpg";

// Focus point (fraction of width/height) + how tight the square is (fraction of
// the smaller dimension). Adjust these three numbers to reframe.
const cx = Number(process.argv[2] ?? 0.46); // face x
const cy = Number(process.argv[3] ?? 0.69); // face y
const zoom = Number(process.argv[4] ?? 0.42); // square side as fraction of width

const img = sharp(SRC);
const { width, height } = await img.metadata();

const side = Math.round(width * zoom);
let left = Math.round(cx * width - side / 2);
let top = Math.round(cy * height - side / 2);
// clamp inside the image
left = Math.max(0, Math.min(left, width - side));
top = Math.max(0, Math.min(top, height - side));

await sharp(SRC)
  .extract({ left, top, width: side, height: side })
  .resize(480, 480)
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(OUT);

console.log(`source ${width}x${height} -> crop ${side}px @ (${left},${top}) -> ${OUT}`);
