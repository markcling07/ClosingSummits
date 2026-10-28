# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Dissimilate is a **static website** — a curated journal of essays and Philippine mountain-climbing logs. Plain hand-written **HTML/CSS/vanilla JS**. No build step, no framework, no package manager, no tests. Edit files and open them in a browser (use VS Code Live Server for the JS-driven homepage carousel).

Deployed via **GitHub Pages** at https://markcling07.github.io/ClosingSummits/. Pushing to `main` publishes the site.

## Structure

- Root `index.html` + `diss.css` are the homepage. Content cards/carousel render from an **inline `<script>` `articles` array in `index.html`** (grep `const articles = [`; currently 20 entries, 3 of them `isDraft`) — to add or relink content, edit that array, not just the markup. Each entry's keys: `id, title, author, category, readTime, path, description, type, badge, isFeaturedHero, img` (card thumbnail), `carouselImg` (wider hero image), `isDraft`. The homepage renders `articles.filter(a => !a.isDraft)` — set `isDraft: true` to stage a piece without deleting or unlinking it. Some entries' `path` points at an author landing page itself (e.g. `Authors/Raul/index.html`) rather than a `<Person>/<Piece>/` folder.
- Each piece of content is a **self-contained folder** holding its own `.html`, `.css`, optional `.js`, and an `IMG/` subfolder. Buckets: `Authors/`, `Essays/`, `Mountains/`. **`Authors/` is the primary bucket** — most live pieces are `Authors/<Person>/<Piece>/`, with a per-author landing page at `Authors/<Person>/index.html`. **Filenames are inconsistent**: some folders use `index.html`, others a slug (`sumagaya.html`, `Ophiorrhiza-Biflora.html`); CSS is sometimes `style.css`, sometimes slugged. Match the folder you're editing — don't assume `index.html`.
- The **`Essays/` bucket is author-first**, mirroring `Authors/`: `Essays/<Person>/<Piece>/` for the four essayists (`Cling`, `Obito`, `Makima`, `Kuvira`), with a **shared author dashboard at `Essays/index.html`** that lists every essayist's pieces and filters by author and by field/topic. Cling's essays are the Astro exception (see Tooling); the other three are plain HTML. `Essays/Mountains/Why We Climb/` and `Essays/Ophiorrhiza Biflora/` are older standalone essays, not part of the dashboard.
- `_card-preview.html` (root) is a standalone author-card design mockup — **not linked from the site**. `Diss-Design.jpg` is a design reference image, and `_refs/` holds gitignored local design references. None of these are live content.

## Tooling

- A PostToolUse hook runs `node .claude/scripts/check-refs.mjs --hook` after every file edit — it validates local href/src paths and `articles` array entries with exact-case matching. If it reports a broken reference, fix it before moving on.
- `/add-content` scaffolds a new piece (folder + HTML/CSS/IMG skeleton + OG meta + articles-array entry); `/check-links` runs the full reference check; `/dissimilate` runs pre-flight checks then commits and pushes to `main` (pushing **is** deploying). Prefer these over doing it by hand.
- Before building or restyling a page, read `.claude/skills/dissimilate/design-language.md` — the site's typography, palette, motif and interaction conventions.
- **One exception to "no build step": Astro essay sub-projects.** Cling's essays live as Astro + React (TS) projects in `Essays/Cling/<Essay>/_src/`; the **committed, servable artifact** is the built `index.html` + `assets/` one level up. Never hand-edit that `index.html` — edit `_src/src/` and run `npm run build` inside `_src/` (builds, then `publish.mjs` copies output up and relativizes asset paths). `node_modules/`, `_src/dist/`, `_src/.astro/` are gitignored. Everything else on the site stays no-build.

## AI SEO (GEO/AEO) conventions

- Root `robots.txt` (explicitly allows AI crawlers), `sitemap.xml`, and `llms.txt` exist. **When a piece goes live (isDraft flips to false), add its URL to `sitemap.xml` and, if noteworthy, `llms.txt`** — both are hand-maintained, percent-encoded absolute URLs.
- Live pages carry a **JSON-LD Article block** (`<script type="application/ld+json">`) with headline/description/image/author taken from the page's own meta. Add one to every new page; the Astro layout does this automatically for Cling's essays.
- Essay structure follows the answer-first pattern: TL;DR block up top, question-shaped H2s answered in their first sentence, lists for enumerable claims. The full text must be present in static HTML — AI crawlers don't run JS, so never gate essay content behind client-side rendering.

## Gotchas

- **Paths contain spaces and special characters** (e.g. `Lera & Lara/`, `Star/Kotkot × Bukaw/`, `Order and Chaos/`). GitHub Pages is **case- and character-sensitive**, so links must match the real path exactly. Keep `href`/`src` consistent with the existing files.
- `Authors/Star/Kotkot × Bukaw/` (`×` = U+00D7 multiplication sign) and `Authors/Allison/Kotkot x Bukaw/` (ASCII `x`) are **both live, different authors' pieces** — don't "fix" one into the other.
- **Legacy / non-live folders exist.** Not everything outside the `articles` array is legacy — some folders are finished-but-unregistered work in progress (e.g. `Authors/Gladys/Sumagaya/`, `Authors/Aki/Pulag/`). The truly stale/typo paths to avoid: `Essays/Mountains/` (stray nested folder ≠ the top-level `Mountains/` bucket), `Authors/Raul/Sumagaya-Before/` (old snapshot), `Authors/Star/Kotkot × Bukaw Redesign/` (unused variant). (The old `Essays/Order & Chaos/`, `Essays/Order and Chaos/`, `Essays/Psychology/`, `Essays/Success and Suffering/`, `Essays/Psychology/Makima/Pysch/`, and `Essays/Tech.html` were removed when the Essays bucket was reorganized author-first — Obito/Makima/Kuvira's essays now live under `Essays/<Person>/<Piece>/`.)
- **Registered ≠ committed, and present ≠ live.** `Authors/Gladys/Balatukan/` is in the `articles` array (as `isDraft: true`) but isn't committed to git yet, so a clean checkout has a dangling `path`. Conversely `Authors/Shieka/index.html` still sits on disk with **zero inbound references** — it was replaced by her Apo and Sumagaya essay entries; don't treat it as the live Shieka landing page.
- **Scratch design references live inside content folders**, not only in gitignored `_refs/` — e.g. `Authors/Gladys/Sumagaya/Reference Design.jpg`, `Authors/Gladys/Balatukan/Reference Design1.jpg`, `Authors/Aki/Pulag/Ref*.jpg`. They're working files, not site assets; never commit them as part of a publish.
- Images are a mix of `.jpg`, `.jpeg`, `.webp`, `.png`, `.jfif` — plus **uppercase `.JPG`/`.PNG`** on disk. Pages is case-sensitive, so use the actual extension and case; don't assume lowercase `.jpg`.
- New content pages should include **Open Graph + Twitter Card `<meta>` tags** (title, description, image, url) like the homepage and recent pieces — and **URL-encode special characters** in those tag values (`%20` for space, `%C3%97` for `×`), since social crawlers don't tolerate raw spaces/symbols. For link previews, add a dedicated **1200×630 OG card** in the piece's `IMG/` and use **`.jpg`** for it (broadest crawler compatibility). OG tags aren't on every page yet — always add them to new pages.
