---
name: add-essay
description: Publish a Cling essay from raw text into the Astro + React (TS) answer-first essay template at Essays/Cling/ — copy a starter, fill it, build, verify AI-search crawlability, and wire it into the homepage, Essays dashboard, sitemap, and llms.txt. Triggered by the user with /add-essay.
disable-model-invocation: true
---

# Publish a Cling essay (Astro + React template)

Usage: `/add-essay <title, or paste the essay text>` (in `$ARGUMENTS`). The user may also
supply the text and images across the next few messages — collect everything before building.

Cling's essays are the site's one build-step exception (see CLAUDE.md → Tooling). The Astro
project lives in `Essays/Cling/<Essay>/_src/`; the committed, servable artifact is the built
`index.html` + `assets/` one level up. **Never hand-edit that `index.html`** — edit
`_src/src/` and rebuild.

**CRITICAL: never rename, move, or overwrite an existing essay folder.** Every folder under
`Essays/Cling/` is a published (or staged) essay with live URLs — `The-Essay/` was once the
template scaffold but is now the live earthquake essay (homepage id `cling-essay-wip`,
`isDraft: false`). New essays always start as a **copy** of an existing one; the copy's text is
then replaced wholesale.

## Gather from the user (ask, don't guess)

1. **Title** and, if not provided, a one-sentence **description** (feeds meta + JSON-LD —
   confirm your draft of it with the user).
2. **The essay text.** Never write or pad the essay yourself; the starter's copy may only be
   replaced by the user's words. Unpublished drafts may already exist as Markdown in
   `Essays/Cling/_drafts/` — check there if the user names a topic. If sections don't map
   cleanly to the answer-first shape, ask how they want it structured rather than rewriting
   their prose.
3. **Images** (optional) + which one becomes the OG share card. Captions/alt if they have
   preferences; otherwise write truthful alt text by looking at each image.
4. **Category** for the homepage entry (existing categories: Essays, Mountains) and
   date/read-time.

## Steps

1. **Branch** off `main` if not already on a work branch.
2. **Folder**: copy only the Astro *source* of an existing essay (default starter:
   `Essays/Cling/The-Essay/`) into a new `Essays/Cling/<Title-Slug>/` — never its
   `node_modules/`, built `index.html`, `assets/`, or images. From the repo root (Git Bash):

   ```bash
   SRC="Essays/Cling/The-Essay/_src"; DST="Essays/Cling/<Title-Slug>"
   test ! -e "$DST" || { echo "$DST already exists — pick another slug"; exit 1; }
   mkdir -p "$DST/_src" "$DST/IMG"
   cp -r "$SRC"/{src,astro.config.mjs,package.json,package-lock.json,publish.mjs,tsconfig.json} "$DST/_src/"
   ```

   Keep the slug filesystem-friendly; the site tolerates spaces but doesn't require them.
3. **Fill the template** in `_src/src/pages/index.astro`:
   - `meta` block: title, description, canonicalUrl + ogImage (absolute, percent-encoded,
     ending in the new folder name), dates, category, readTime.
   - **Replace the starter essay's text entirely** with the user's words — headings, TL;DR,
     body, figures, captions, and the blockquote. Note one distinctive phrase from the starter
     before you start; step 7 checks it's gone. Preserve the answer-first shape: TL;DR block
     first, question-shaped H2s answered in their first sentence, lists for enumerable claims,
     one quotable blockquote. `<ExpandableAside>` is available for digressions.
   - Images: files go in the essay folder's `IMG/` (NOT in `_src/`), referenced as
     `IMG/<file>` inside `<figure>` + `<figcaption>`, with `loading="lazy" decoding="async"`
     and real alt text.
4. **Install deps**: `cd "Essays/Cling/<Title-Slug>/_src" && npm install` (needed for both
   the OG card and the build; `node_modules/` is gitignored).
5. **OG card**: 1200×630 `IMG/OG.jpg` from the user's chosen image. From the repo root (works
   on Windows and macOS — uses the `sharp` that Astro just installed):
   `node .claude/scripts/make-og.mjs "<chosen image>" "Essays/Cling/<Title-Slug>/IMG/OG.jpg"`
6. **Build**: `npm run build` inside `_src/`. This runs Astro, then `publish.mjs` copies the
   output up, relativizes asset paths, and removes `dist/`.
7. **Wire in**:
   - Homepage `articles` array (grep `const articles = [` in `index.html`): add a **new**
     entry for this essay — copy a Cling entry's shape with a new unique `id`, and set title,
     description, path, img/carouselImg. Keep `isDraft: true` until the user says it's ready.
   - Essays dashboard `Essays/index.html`: add a card for the essay by copying an existing
     Cling card (search for `Cling/Hiring-and-Promotion/index.html`) and updating its title,
     emoji, blurb, and link.
   - When undrafted (`isDraft: false`): add the URL to `sitemap.xml` and a line to `llms.txt`
     (both hand-maintained; percent-encode per CLAUDE.md).
8. **Verify** (all must pass). Serve the repo root with `python -m http.server 8899` (or the
   `closingsummits` launch config if one exists), then:
   - Crawler view: `curl -s "http://localhost:8899/Essays/Cling/<Title-Slug>/" | grep -c "<distinctive phrase>"`
     for the title and a body phrase — curl runs no JS; if the text is there, AI crawlers see
     it. The starter's distinctive phrase from step 3 must return `0`.
   - `node .claude/scripts/check-jsonld.mjs "Essays/Cling/<Title-Slug>/index.html"` — JSON-LD
     parses, has headline/description/image/author, no `TODO`, URLs on the live origin.
   - `node .claude/scripts/check-refs.mjs` — no new unresolved refs.
   - Screenshot desktop + ~390px mobile.
   - Homepage feed shows/hides the entry per its isDraft state.
9. **Commit** on the branch and show the user the result. Push/merge only when asked —
   note: this machine's git credentials sometimes revert to the wrong GitHub account; if a
   push 403s, `gh auth switch --user markcling07` and retry.
