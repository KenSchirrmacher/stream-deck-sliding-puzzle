import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const PHOTO = "C:/Users/kensc/Downloads/PXL_20261020_192232155.jpg";
const PLUGIN_ICON = "C:/users/kensc/OneDrive/Documents/GitHub/Stream Deck Sliding Puzzle/com.homedeck.slidingpuzzle.sdPlugin/imgs/plugin/plugin-icon@2x.png";
const OUT = "C:/Users/kensc/AppData/Local/Temp/claude/C--users-kensc-OneDrive-Documents-GitHub/c9391527-b74f-4f95-a256-95f796cb078e/scratchpad/marketplace-slidingpuzzle";

fs.mkdirSync(OUT, { recursive: true });

// --- Icon: 288x288 from the existing plugin icon ---
await sharp(PLUGIN_ICON).resize(288, 288).png().toFile(path.join(OUT, "icon-288.png"));

// --- Thumbnail + gallery 0: real device photo ---
await sharp(PHOTO).resize(1920, 960, { fit: "cover", position: "attention" }).jpeg({ quality: 90 }).toFile(path.join(OUT, "thumbnail-1920x960.jpg"));
await sharp(PHOTO).resize(1920, 960, { fit: "cover", position: "attention" }).jpeg({ quality: 92 }).toFile(path.join(OUT, "gallery-0-device-photo.jpg"));

// --- Reproduce the plugin's own key art (same code as src/game/render.ts) ---
const SIZE = 144;
const TILE_BG = "#ECEFF1", TILE_BG_SHADE = "#CFD8DC", TILE_BORDER = "#90A4AE";
const NUMBER_COLOR = "#263238";
const BLANK_BG = "#101014";
const WIN_GLOW = "#43A047";

function tileFrame(n) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}" rx="16" fill="${TILE_BG_SHADE}"/>
    <rect x="8" y="8" width="${SIZE - 16}" height="${SIZE - 16}" rx="13" fill="${TILE_BG}" stroke="${TILE_BORDER}" stroke-width="2"/>
    <text x="72" y="96" font-family="Segoe UI, sans-serif" font-size="56" font-weight="800" text-anchor="middle" fill="${NUMBER_COLOR}">${n}</text>
  </svg>`;
}
function tileWinFrame(n) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}" rx="16" fill="${TILE_BG_SHADE}"/>
    <rect x="8" y="8" width="${SIZE - 16}" height="${SIZE - 16}" rx="13" fill="${TILE_BG}" stroke="${TILE_BORDER}" stroke-width="2"/>
    <text x="72" y="96" font-family="Segoe UI, sans-serif" font-size="56" font-weight="800" text-anchor="middle" fill="${NUMBER_COLOR}">${n}</text>
    <rect x="3" y="3" width="${SIZE - 6}" height="${SIZE - 6}" rx="20" fill="none" stroke="${WIN_GLOW}" stroke-width="6"/>
  </svg>`;
}
function blankFrame() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}"><rect width="${SIZE}" height="${SIZE}" fill="${BLANK_BG}"/></svg>`;
}

// --- Gallery 1: a shuffled 4x4 board in progress ---
{
  const W = 1920, H = 960;
  const cols = 4, rows = 4, gap = 16, outerMargin = 60;
  const cellFromHeight = Math.floor((H - outerMargin * 2 - gap * (rows - 1)) / rows);
  const cellFromWidth = Math.floor((W - outerMargin * 2 - gap * (cols - 1)) / cols);
  const cell = Math.min(cellFromHeight, cellFromWidth);
  const contentW = cols * cell + (cols - 1) * gap;
  const contentH = rows * cell + (rows - 1) * gap;
  const padX = Math.round((W - contentW) / 2);
  const padY = Math.round((H - contentH) / 2);

  const shuffled = [5, 1, 3, 4, 9, 2, 6, 8, 13, 10, 7, 0, 14, 11, 15, 12];
  const composites = [];
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const svg = shuffled[i] === 0 ? blankFrame() : tileFrame(shuffled[i]);
    composites.push({
      input: await sharp(Buffer.from(svg)).resize(cell, cell).png().toBuffer(),
      left: padX + c * (cell + gap),
      top: padY + r * (cell + gap),
    });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15171c" } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, "gallery-1-shuffled.jpg"));
}

// --- Gallery 2: the solved board, all tiles glowing green ---
{
  const W = 1920, H = 960;
  const cols = 4, rows = 4, gap = 16, outerMargin = 60;
  const cellFromHeight = Math.floor((H - outerMargin * 2 - gap * (rows - 1)) / rows);
  const cellFromWidth = Math.floor((W - outerMargin * 2 - gap * (cols - 1)) / cols);
  const cell = Math.min(cellFromHeight, cellFromWidth);
  const contentW = cols * cell + (cols - 1) * gap;
  const contentH = rows * cell + (rows - 1) * gap;
  const padX = Math.round((W - contentW) / 2);
  const padY = Math.round((H - contentH) / 2);

  const solved = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  const composites = [];
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const svg = solved[i] === 0 ? blankFrame() : tileWinFrame(solved[i]);
    composites.push({
      input: await sharp(Buffer.from(svg)).resize(cell, cell).png().toBuffer(),
      left: padX + c * (cell + gap),
      top: padY + r * (cell + gap),
    });
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: "#15171c" } })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(OUT, "gallery-2-solved.jpg"));
}

console.log("Done:", fs.readdirSync(OUT));
