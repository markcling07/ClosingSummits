---
name: add-content
description: Scaffold a new Dissimilate content piece (essay, mountain log, or author page) — create its self-contained folder with an HTML+CSS+IMG skeleton and OG meta, then register it in the index.html articles array. Triggered by the user with /add-content.
disable-model-invocation: true
---

# Add a content piece

Usage: `/add-content <title or short description>` (in `$ARGUMENTS`).

This scaffolds a new self-contained content folder and wires it into the homepage. Follow the
conventions in `CLAUDE.md` exactly — this site is hand-written and deploys to case-sensitive
GitHub Pages.

## Steps

1. **Clarify placement** with the user if not obvious from `$ARGUMENTS`:
   - **Bucket**: `Authors/` (primary — most pieces are `Authors/<Person>/<Piece>/`, with a
     per-author landing page at `Authors/<Person>/index.html`), `Essays/`, or `Mountains/`.
   - **Author** (for the `author` field and Authors/ placement).
   - **Type/category/badge** shown on the homepage card.

2. **Create the folder** `<Bucket>/.../<Piece>/` containing:
   - `index.html` (or a slugged name if that's the local convention in sibling folders — match
     what's already there; don't blindly assume `index.html`).
   - a matching `.css`.
   - an `IMG/` subfolder for the card thumbnail, hero/carousel image, and a dedicated
     **1200×630 OG card as `.jpg`** (broadest crawler compatibility). Leave placeholders and
     tell the user which images to drop in. Once they've chosen the share image, make the card
     with `node .claude/scripts/make-og.mjs "<chosen image>" "<piece>/IMG/OG.jpg"` (needs
     `npm install` to have been run once in any `Essays/Cling/*/_src/`; the script says so if
     not).

3. **Add OG + Twitter meta** to the new page's `<head>` (URL-encode spaces as `%20`, `×` as
   `%C3%97` in tag values):

   ```html
   <meta property="og:type" content="article" />
   <meta property="og:title" content="TITLE" />
   <meta property="og:description" content="DESCRIPTION" />
   <meta property="og:url" content="https://markcling07.github.io/ClosingSummits/PATH" />
   <meta property="og:image" content="https://markcling07.github.io/ClosingSummits/PATH/IMG/OG.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="TITLE" />
   <meta name="twitter:description" content="DESCRIPTION" />
   <meta name="twitter:image" content="https://markcling07.github.io/ClosingSummits/PATH/IMG/OG.jpg" />
   ```

4. **Add a JSON-LD Article block** to the same `<head>` — CLAUDE.md requires one on every new
   page. Reuse the title/description/image/URL from the meta tags above (same encoding rules):

   ```html
   <script type="application/ld+json">
   {
       "@context": "https://schema.org",
       "@type": "Article",
       "headline": "TITLE",
       "description": "DESCRIPTION",
       "image": "https://markcling07.github.io/ClosingSummits/PATH/IMG/OG.jpg",
       "author": { "@type": "Person", "name": "AUTHOR" },
       "publisher": { "@type": "Organization", "name": "Dissimilate" },
       "mainEntityOfPage": "https://markcling07.github.io/ClosingSummits/PATH"
   }
   </script>
   ```

   For a mountain log, also add `"contentLocation": { "@type": "Place", "name": "Mount X, Province, Philippines" }`
   (see `Authors/Ian/Pulag/index.html`).

5. **Register it in the homepage** — add an object to the `articles` array in `index.html`
   (inline `<script>`; find it with grep `const articles = [`). Match the existing key set and
   copy the shape of a nearby entry:
   `{ id, title, author, category, readTime, path, description, type, badge, isFeaturedHero, img, carouselImg, isDraft }`
   - `path` is relative to the repo root and must match the real folder/file name **exactly**
     (case and characters).
   - `img` = card thumbnail, `carouselImg` = wider hero image (both in the piece's `IMG/`).
   - Set `isDraft: true` while it's unfinished — the homepage renders `filter(a => !a.isDraft)`,
     so drafts stay hidden until you flip it to `false`.
   - **When it goes live** (`isDraft` flips to `false`): add its URL to `sitemap.xml` and, if
     noteworthy, a line to `llms.txt` — both hand-maintained, percent-encoded absolute URLs.

6. **Validate** before committing — both must pass:
   - `node .claude/scripts/check-refs.mjs index.html "<new-path>"` — the new
     `path`/`img`/`href`/`src` all resolve (exact case).
   - `node .claude/scripts/check-jsonld.mjs "<new-path>"` — the JSON-LD parses and has
     headline/description/image/author with live-origin URLs.
