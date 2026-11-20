// Generates PWA icons, favicon and the Open Graph image from simple vector shapes (no people, no text in icons).
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const rings = (size, pad = 0.18, bg = "#7a2e3b") => {
  const s = size, c = s / 2, r = s * (0.5 - pad) * 0.62, off = r * 0.55, sw = s * 0.055;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" fill="${bg}"/>
  <circle cx="${c - off}" cy="${c}" r="${r}" fill="none" stroke="#fbf8f3" stroke-width="${sw}"/>
  <circle cx="${c + off}" cy="${c}" r="${r}" fill="none" stroke="#e8c27a" stroke-width="${sw}"/>
</svg>`;
};
const out = async (svg, file, w, h = w) => sharp(Buffer.from(svg)).resize(w, h).png().toFile(file);
await out(rings(512), "public/icons/icon-512.png", 512);
await out(rings(512), "public/icons/icon-192.png", 192);
await out(rings(512, 0.28), "public/icons/maskable-512.png", 512);
await out(rings(512), "public/icons/apple-touch-icon.png", 180);
await out(rings(512), "src/app/icon.png", 64);
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#7a2e3b"/>
  <circle cx="470" cy="315" r="170" fill="none" stroke="#fbf8f3" stroke-width="26"/>
  <circle cx="730" cy="315" r="170" fill="none" stroke="#e8c27a" stroke-width="26"/>
  <text x="600" y="570" text-anchor="middle" font-family="sans-serif" font-size="56" font-weight="700" fill="#fbf8f3" letter-spacing="10">DUJON</text>
</svg>`;
await out(og, "public/og.png", 1200, 630);
writeFileSync("public/icons/.generated", "by scripts/make-icons.mjs\n");
console.log("icons ok");
