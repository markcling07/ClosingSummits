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
     tell the user which images to drop in.

3. **Add OG + Twitter meta** to the new page's `<head>` (URL-encode spaces as `%20`, `×` as
   `%C3%97` in tag values):

   ```html
   <meta property="og:type" content="article" />
   <meta property="og:title" content="TITLE" />
   <meta property="og:description" content="DESCRIPTION" />
   <meta property="og:url" content="https://markcling07.github.io/ClosingSummits/PATH" />
   <meta property="og:image" content="https://markcling07.github.io/ClosingSummits/PATH/IMG/OG-Card.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta name="twitter:card" content="summary_large_image" />
   <meta name="twitter:title" content="TITLE" />
   <meta name="twitter:description" content="DESCRIPTION" />
   <meta name="twitter:image" content="https://markcling07.github.io/ClosingSummits/PATH/IMG/OG-Card.jpg" />
   ```

4. **Register it in the homepage** — add an object to the `articles` array in `index.html`
   (inline `<script>`, ~line 631). Match the existing key set and copy the shape of a nearby
   entry:
   `{ id, title, author, category, readTime, path, description, type, badge, isFeaturedHero, img, carouselImg, isDraft }`
   - `path` is relative to the repo root and must match the real folder/file name **exactly**
     (case and characters).
   - `img` = card thumbnail, `carouselImg` = wider hero image (both in the piece's `IMG/`).
   - Set `isDraft: true` while it's unfinished — the homepage renders `filter(a => !a.isDraft)`,
     so drafts stay hidden until you flip it to `false`.

5. **Validate** by running the check-links skill (`node .claude/scripts/check-refs.mjs
   index.html "<new-path>"`) so the new `path`/`img`/`href`/`src` all resolve before committing.
