---
name: check-links
description: Validate that local references (href/src and the index.html articles `path:` entries) resolve to real files on disk, using exact-case matching to catch GitHub Pages case/character-sensitivity breakage. Use before pushing, after adding or moving content, or when a link/image might be broken.
---

# Check local references

Dissimilate deploys to GitHub Pages, which is **case- and character-sensitive**, and paths
contain spaces and special characters (`&`, `×`). A link that works locally on Windows
(case-insensitive) can 404 in production. This skill runs a checker that resolves every
relative `href`/`src` — plus each `path:` in `index.html`'s `articles` array — against the
real filesystem with exact-case matching.

## Run it

From the repo root:

```bash
node .claude/scripts/check-refs.mjs            # scan every .html in the repo
node .claude/scripts/check-refs.mjs index.html "Authors/Star/Negron/index.html"   # specific files
```

The script prints each unresolved reference as `file:line  <ref>  (hint)`, where the hint is
either `(not found on disk)` or `(did you mean "X"? — case/char mismatch)`. It exits `0` when
clean and `2` when problems exist.

## Interpreting results

- **Case/char mismatch** (`did you mean "X"?`) — the reference points at a name that exists
  only under different case or a different character (e.g. ASCII `x` vs `×` U+00D7, or `.jpg`
  vs `.JPG`). Fix the reference to match the real on-disk name exactly.
- **Not found on disk** — the target genuinely doesn't exist. Either the file is missing or the
  path is wrong. Check for the legacy/duplicate folders documented in `CLAUDE.md` (e.g. ASCII
  `Authors/Allison/Kotkot x Bukaw/` vs `Authors/Star/Kotkot × Bukaw/` with the `×` U+00D7).
- **Known noise**: legacy non-live pages (e.g. `Essays/Mountains/Why We Climb/`) may contain
  stale links. When doing a full-repo scan, focus on files you actually edited or that the
  `articles` array references; ignore breakage inside folders `CLAUDE.md` marks as non-live.
- **Uncommitted drafts**: an `articles` entry with `isDraft: true` can point at a folder that
  exists only on the author's machine (e.g. `Authors/Aki/Pulag/`), so a clean checkout reports
  it as not found. The homepage hides drafts, so this isn't live breakage — mention it, but
  don't "fix" it by deleting the entry. It must resolve before the draft flips to `false`.

After reporting, offer to fix the references (matching the exact on-disk name); don't rename
the on-disk files unless the user asks.
