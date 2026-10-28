/**
 * Copies the Astro build output up into the essay folder (the level GitHub
 * Pages serves) and relativizes asset URLs so the page works both on
 * localhost:8899 (repo served at root) and under /ClosingSummits/ on Pages.
 *
 * Run via `npm run build` — never edit ../index.html by hand; it is generated.
 */
import { cpSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, 'dist');
const target = join(here, '..');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('publish: no dist/index.html — did astro build fail?');
  process.exit(1);
}

// Fresh copy of the assets folder
rmSync(join(target, 'assets'), { recursive: true, force: true });
if (existsSync(join(dist, 'assets'))) {
  cpSync(join(dist, 'assets'), join(target, 'assets'), { recursive: true });
}

// Relativize root-absolute asset references in the HTML
let html = readFileSync(join(dist, 'index.html'), 'utf8');
html = html.replaceAll('src="/assets/', 'src="./assets/');
html = html.replaceAll('href="/assets/', 'href="./assets/');
// Astro island loader references modules by absolute path inside inline scripts
html = html.replaceAll('"/assets/', '"./assets/');
writeFileSync(join(target, 'index.html'), html);

// Remove the staging copy: it duplicates the published files with paths that
// only resolve from the published location, which trips the repo's
// check-refs hook. (`astro preview` won't work without a rebuild — use the
// published output via the repo-root server instead.)
rmSync(dist, { recursive: true, force: true });

console.log('publish: wrote ../index.html and ../assets/, removed dist/');
