#!/usr/bin/env node
// Dissimilate JSON-LD checker.
// Verifies that each given page carries a parseable `<script type="application/ld+json">`
// Article block with the fields CLAUDE.md requires (headline, description, image, author),
// and that its absolute URLs point at the live Pages origin.
//
// Usage:
//   node check-jsonld.mjs <file.html> [file.html ...]
//
// Exit 0 = clean, 2 = problems found, 1 = bad usage.

import fs from 'node:fs';

const ORIGIN = 'https://markcling07.github.io/ClosingSummits/';
const REQUIRED = ['headline', 'description', 'image', 'author'];
const LD_RE = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node check-jsonld.mjs <file.html> [file.html ...]');
  process.exit(1);
}

// Article nodes may sit at the top level, in an array, or inside @graph.
function articles(node) {
  if (Array.isArray(node)) return node.flatMap(articles);
  if (!node || typeof node !== 'object') return [];
  if (node['@graph']) return articles(node['@graph']);
  const t = [].concat(node['@type'] ?? []);
  return t.some((x) => /^(Article|BlogPosting|NewsArticle)$/.test(x)) ? [node] : [];
}

const urlOf = (v) => (typeof v === 'string' ? v : v?.url ?? v?.['@id'] ?? null);

let problems = 0;
const report = (file, msg) => { console.error(`${file}  ${msg}`); problems++; };

for (const file of files) {
  let html;
  try { html = fs.readFileSync(file, 'utf8'); } catch { report(file, '(file not found)'); continue; }

  const blocks = [...html.matchAll(LD_RE)];
  if (!blocks.length) { report(file, 'no JSON-LD block'); continue; }

  const found = [];
  blocks.forEach((b, i) => {
    try { found.push(...articles(JSON.parse(b[1]))); }
    catch (e) { report(file, `JSON-LD block ${i + 1} does not parse: ${e.message}`); }
  });
  if (!found.length) { report(file, 'no Article in JSON-LD'); continue; }

  for (const a of found) {
    for (const key of REQUIRED) {
      const v = a[key];
      if (v == null || v === '' || (typeof v === 'object' && !Object.keys(v).length)) report(file, `Article missing "${key}"`);
    }
    if (/TODO/.test(JSON.stringify(a))) report(file, 'Article still contains TODO placeholder text');
    for (const key of ['image', 'mainEntityOfPage']) {
      const u = urlOf(a[key]);
      if (u && !u.startsWith(ORIGIN)) report(file, `"${key}" should start with ${ORIGIN} (got ${u})`);
      if (u && /\s/.test(u)) report(file, `"${key}" has a raw space — percent-encode it (%20)`);
    }
  }
}

if (problems) {
  console.error(`\n${problems} JSON-LD problem(s).`);
  process.exit(2);
}
console.log(`JSON-LD OK (${files.length} file${files.length === 1 ? '' : 's'}).`);
