#!/usr/bin/env node
/**
 * Writes WebP variants beside every JPEG in public/.
 *
 *   npm run images
 *
 * components/Picture.tsx offers these to the browser ahead of the JPEG, which
 * picks one by slot width and pixel density. PageSpeed's biggest remaining
 * saving was full-width JPEGs downloaded into slots a few hundred pixels wide.
 *
 * Both widths are always written, even when the source is narrower than the
 * target: a srcset candidate that 404s can leave a broken image, and the
 * component cannot check the filesystem from the browser. Run this after adding
 * or replacing any photo, and commit the results.
 */

import sharp from "sharp";
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const WIDTHS = [800, 1600];
const QUALITY = 72;

const sources = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.jpe?g$/i.test(entry.name)) sources.push(full);
  }
})("public");

let written = 0;
let bytes = 0;
for (const file of sources.sort()) {
  for (const width of WIDTHS) {
    const out = file.replace(/\.jpe?g$/i, `-${width}.webp`);
    const buf = await sharp(file)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer();
    writeFileSync(out, buf);
    written++;
    bytes += buf.length;
  }
}

const originals = sources.reduce((sum, f) => sum + statSync(f).size, 0);
console.log(
  `${written} WebP variants from ${sources.length} JPEGs\n` +
    `originals ${(originals / 1024 / 1024).toFixed(1)}MB, variants ${(bytes / 1024 / 1024).toFixed(1)}MB`,
);
