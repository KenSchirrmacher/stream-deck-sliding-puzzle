const SIZE = 144;
const TILE_BG = "#ECEFF1";
const TILE_BG_SHADE = "#CFD8DC";
const TILE_BORDER = "#90A4AE";
const NUMBER_COLOR = "#263238";
const BLANK_BG = "#101014";
const WIN_GLOW = "#43A047";

function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function tileFrame(n: number): string {
  const ring = "";
  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}" rx="16" fill="${TILE_BG_SHADE}"/>
    <rect x="8" y="8" width="${SIZE - 16}" height="${SIZE - 16}" rx="13" fill="${TILE_BG}" stroke="${TILE_BORDER}" stroke-width="2"/>
    <text x="72" y="96" font-family="Segoe UI, sans-serif" font-size="56" font-weight="800" text-anchor="middle" fill="${NUMBER_COLOR}">${n}</text>
    ${ring}
  </svg>`);
}

export function tileWinFrame(n: number): string {
  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect x="4" y="4" width="${SIZE - 8}" height="${SIZE - 8}" rx="16" fill="${TILE_BG_SHADE}"/>
    <rect x="8" y="8" width="${SIZE - 16}" height="${SIZE - 16}" rx="13" fill="${TILE_BG}" stroke="${TILE_BORDER}" stroke-width="2"/>
    <text x="72" y="96" font-family="Segoe UI, sans-serif" font-size="56" font-weight="800" text-anchor="middle" fill="${NUMBER_COLOR}">${n}</text>
    <rect x="3" y="3" width="${SIZE - 6}" height="${SIZE - 6}" rx="20" fill="none" stroke="${WIN_GLOW}" stroke-width="6"/>
  </svg>`);
}

export function blankFrame(): string {
  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" fill="${BLANK_BG}"/>
  </svg>`);
}
