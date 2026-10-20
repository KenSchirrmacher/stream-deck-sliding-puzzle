/**
 * Generates PNG icons for the Sliding Puzzle plugin (plugin, category, and action icons).
 * Run: node scripts/generate-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "com.homedeck.slidingpuzzle.sdPlugin", "imgs");

// All icon bodies below are authored on a fixed 72x72 design grid. Rendering with
// width/height = target size but viewBox always "0 0 72 72" lets SVG scale every
// coordinate (not just stroke-width) proportionally, so artwork fills the canvas
// at any requested size instead of staying pinned to its original 72px position.
const GRID = 72;

function svgIcon(body, size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${GRID} ${GRID}">
  <rect width="${GRID}" height="${GRID}" rx="${GRID * 0.18}" fill="#101014"/>
  ${body}
</svg>`);
}

async function writeIcon(dir, name, body, sizes = [72, 144]) {
  const folder = path.join(root, dir);
  fs.mkdirSync(folder, { recursive: true });
  for (const [index, size] of sizes.entries()) {
    const svg = svgIcon(body, size);
    const out = path.join(folder, `${name}${index === 1 ? "@2x" : ""}.png`);
    await sharp(svg).png().toFile(out);
  }
}

// A 2x2 sliding-puzzle grid: three numbered tiles and one gap, the classic shorthand.
const pluginBody = `
  <rect x="10" y="10" width="24" height="24" rx="5" fill="#ECEFF1"/>
  <text x="22" y="29" font-family="Segoe UI, sans-serif" font-size="18" font-weight="800" text-anchor="middle" fill="#263238">1</text>
  <rect x="38" y="10" width="24" height="24" rx="5" fill="#ECEFF1"/>
  <text x="50" y="29" font-family="Segoe UI, sans-serif" font-size="18" font-weight="800" text-anchor="middle" fill="#263238">2</text>
  <rect x="10" y="38" width="24" height="24" rx="5" fill="#ECEFF1"/>
  <text x="22" y="57" font-family="Segoe UI, sans-serif" font-size="18" font-weight="800" text-anchor="middle" fill="#263238">3</text>`;

const categoryBody = `
  <circle cx="36" cy="36" r="20" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <text x="36" y="42" fill="#FFFFFF" font-family="Segoe UI, sans-serif" font-size="18" font-weight="700" text-anchor="middle">P</text>`;

const tileActionBody = `
  <rect x="10" y="10" width="52" height="52" rx="10" fill="#CFD8DC"/>
  <rect x="14" y="14" width="44" height="44" rx="8" fill="#ECEFF1" stroke="#90A4AE" stroke-width="2"/>`;

await writeIcon("plugin", "plugin-icon", pluginBody, [256, 512]);
await writeIcon("plugin", "category-icon", categoryBody, [28, 56]);
await writeIcon("actions/tile", "icon", tileActionBody);

console.log("Icons generated in com.homedeck.slidingpuzzle.sdPlugin/imgs/");
