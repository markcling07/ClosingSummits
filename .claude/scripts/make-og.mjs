#!/usr/bin/env node
// Dissimilate OG-card maker (cross-platform — replaces macOS-only `sips`).
// Resizes and centre-crops an image to a 1200×630 JPEG for link previews.
//
// Needs `sharp`, which ships with the Astro essay projects: run `npm install`
// once in any `Essays/Cling/<Essay>/_src/` and this script will find it.
//
// Usage:
//   node make-og.mjs <source-image> <out.jpg>
//
// Exit 0 = written, 1 = bad usage or sharp unavailable.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..'); // .claude/scripts -> repo root

const [src, out] = process.argv.slice(2);
if (!src || !out) {
  console.error('usage: node make-og.mjs <source-image> <out.jpg>');
  process.exit(1);
}
if (!fs.existsSync(src)) {
  console.error(`make-og: source not found: ${src}`);
  process.exit(1);
}

// Look for sharp from the cwd first, then in any Astro sub-project's node_modules.
function loadSharp() {
  const bases = [process.cwd()];
  for (const bucket of ['Essays', 'Authors']) {
    const b = path.join(ROOT, bucket);
    if (!fs.existsSync(b)) continue;
    for (const person of fs.readdirSync(b)) {
      const p = path.join(b, person);
      if (!fs.statSync(p).isDirectory()) continue;
      for (const piece of fs.readdirSync(p)) bases.push(path.join(p, piece, '_src'));
    }
  }
  for (const base of bases) {
    try { return createRequire(path.join(base, 'noop.js'))('sharp'); } catch {}
  }
  return null;
}

const sharp = loadSharp();
if (!sharp) {
  console.error('make-og: sharp not found. Run `npm install` in an Essays/Cling/<Essay>/_src/ folder first.');
  process.exit(1);
}

await sharp(src)
  .rotate() // honour EXIF orientation from phone photos
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(out);

console.log(`wrote ${out} (1200×630 JPEG)`);
