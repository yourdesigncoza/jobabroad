// Regenerates the PWA / app icons from the brand wordmark.
// Run: node scripts/gen-icons.mjs
//
// Design: dark-green (#1B4D3E) brand background with a lowercase "ja" monogram
// in the wordmark's two-tone split — "j" cream, "a" orange — set in DM Sans
// Bold (the same face as the jobabroad wordmark). Two variants:
//   - "any":      rounded square, generous content (standard launcher icon)
//   - "maskable": full-bleed background, content kept inside the ~80% safe zone
//                 so Android's adaptive mask never clips the letters.
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fontB64 = readFileSync(join(root, 'public/fonts/DMSans-Bold.ttf')).toString('base64');

const GREEN = '#1B4D3E';
const CREAM = '#F8F5F0';
const ORANGE = '#ff751f';

// size: canvas px. fontSize/dy/radius are in the same 512 design space, scaled.
function svg({ maskable }) {
  const S = 512;
  const radius = maskable ? 0 : 112; // OS masks the maskable variant itself
  const fontSize = maskable ? 232 : 300; // smaller content = safe-zone padding
  return `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <defs><style>
    @font-face { font-family:'JADMSans'; src:url(data:font/ttf;base64,${fontB64}) format('truetype'); font-weight:700; }
  </style></defs>
  <rect width="${S}" height="${S}" rx="${radius}" fill="${GREEN}"/>
  <text x="47%" y="47%" font-family="JADMSans" font-weight="700" font-size="${fontSize}"
        text-anchor="middle" dominant-baseline="central" letter-spacing="-4">
    <tspan fill="${CREAM}">j</tspan><tspan fill="${ORANGE}">a</tspan>
  </text>
</svg>`;
}

async function render(svgStr, size, outPath) {
  const buf = await sharp(Buffer.from(svgStr)).resize(size, size).png().toBuffer();
  writeFileSync(join(root, outPath), buf);
  console.log(`wrote ${outPath} (${size}x${size})`);
}

const any = svg({ maskable: false });
const maskable = svg({ maskable: true });

await render(any, 192, 'public/icon-192.png');
await render(any, 512, 'public/icon-512.png');
await render(maskable, 512, 'public/icon-512-maskable.png');
// iOS rounds corners itself and dislikes transparency → full-bleed, no radius.
await render(svg({ maskable: false }).replace('rx="112"', 'rx="0"'), 180, 'app/apple-icon.png');
