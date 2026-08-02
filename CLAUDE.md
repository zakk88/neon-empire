# Neon Empire — Cyberpunk Game Site

## Quick Context

Marketing/lore site for "Neon Empire," a near-future cyberpunk game about building a criminal empire (Blade Runner / Tokyo-at-night aesthetic, set in a fictionalized Copenhagen). Built from a Diffui design-to-code build spec (5 diffusion-rendered page designs). Static vanilla HTML/CSS/JS — no framework, no build step.

**Live:** https://zakk88.github.io/neon-empire/ · **Repo:** https://github.com/zakk88/neon-empire (public)

## Architecture

```
index.html        Home — hero video + empire status panel + 4 below-fold sections
world.html        Environment detail — Crown Heights district (nav: WORLD)
character.html    Character detail — Asher Kraid, Syndicate Enforcer (nav: FACTIONS)
city.html         City overview — "Every Street Has a Price" + 5 district rail (nav: GAMEPLAY)
areas.html        8 city areas / weather grid (nav: MEDIA)
factions.html     Factions hub (nav: FACTIONS) — links the three dossiers below
operative.html    Police Force — operative dossier (shares character.css via .theme-police)
hackers.html      Phantom Protocol — hacker syndicate dossier (shares character.css via .theme-hacker)
police.html       Police Force — 4 full-body characters (NOT linked from the hub; reachable by URL only)
css/base.css      Design tokens, shared nav, footer status bar, buttons (+1440px body cap)
css/{home,character,city,areas,world,police,factions}.css   Per-page styles
css/character.css  Shared detail-page structure — Syndicate + Police Force both use it
css/components.css, css/widgets.css   Section/card/contact styles copied from ~/Projects/cyberpunk-empire (keep in sync)
js/main.js        Sync clock, home accordion, home parallax, district-rail selection
assets/           Diffui imagery (.webp), grit.webp texture, compressed .mp4 loops + .jpg posters
design/           9 original design reference PNGs (1440×1024) — the source of truth
.claude/launch.json   Dev servers: `neon-empire` (8642) and `cyberpunk-empire` (8643)
.nojekyll         Tells GitHub Pages to skip Jekyll — do not delete
```

**Design tokens** (css/base.css `:root`): bg `#05060a`, cyan `#00e5ff`, pink `#ff2d78`, purple `#8b5cf6`, yellow `#ffc233`, bone `#e5e0d1`. Fonts: Anton (display), JetBrains Mono (HUD labels), Inter (body) via Google Fonts.

**Video heroes** (all muted/looping/playsinline, each with a `.jpg` poster pulled from its own first frame):
`hero-city.mp4` (home) · `char-asher.mp4` (Syndicate) · `gameplay-scene.mp4` (gameplay) · `city-scene.mp4` (world) · `op-hero.mp4` (Police Force operative)

## Deployment

**Host:** GitHub Pages, serving `main` branch at repo root. Deploy = push to main; the site updates ~1 minute later.

```bash
cd ~/Projects/neon\ empire && git add -A && git commit -m "your message" && git push
```

Verify the deploy actually landed (not just that the push succeeded):

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://zakk88.github.io/neon-empire/
```

**Constraints that shaped this setup — don't break them:**

- **All asset paths must stay relative** (`assets/…`, `css/…`). The site is served from the `/neon-empire/` subpath, so a leading `/` breaks every asset. Grep before shipping: `grep -o '\(src\|href\)="/[^"]*"' *.html css/*.css`
- **The repo must stay public.** GitHub Pages requires it on the free plan. Nothing sensitive is committed; keep it that way (no keys, no tokens).
- **`.nojekyll` must exist** at the root or Pages runs Jekyll and can drop files.
- Total site is ~23 MB (~12 MB of it videos, ~11 MB the `design/` reference PNGs, which ship but are unlinked). Well inside Pages' 1 GB limit, but the videos dominate first-load time — compress before adding more (see below).

**If the site ever needs to go private or load faster,** move to Netlify or Cloudflare Pages — both handle private repos and put the videos behind a CDN.

## Asset Pipeline

Source videos/images land in `~/Downloads` from Diffui/HF. Never ship them raw — they're 12–40 MB each. Tools installed via Homebrew: `ffmpeg`, `cwebp` (+ `libtiff`).

**Video** — crop to the container's aspect first (so the framing is intentional), strip audio, compress:

```bash
ffmpeg -i input.mp4 -vf "crop=W:H:(iw-W)/2:0" -c:v libx264 -preset slow -crf 26 \
  -pix_fmt yuv420p -an -movflags +faststart output.mp4
ffmpeg -i output.mp4 -frames:v 1 -q:v 4 output-poster.jpg
```

- `-an` strips audio (some generated clips ship with an AAC track), `+faststart` lets playback begin before the download finishes.
- Typical result: 25–40 MB → 1–2 MB with no visible loss. Use CRF 24 for low-res sources, 26 otherwise.
- Container aspects: home hero backdrop **1440×1008 (1.43:1)**; gameplay/world scene box **1.384:1**; factions portrait **1248×1664**.

**Images:**

```bash
cwebp -q 84 -m 6 -crop X Y W H -resize W2 H2 input.png -o output.webp
```

Target 2× the CSS display size (measure it in the browser first). Typical: 5.8 MB → 117 KB.

**Two rules learned the hard way:**

1. **Grep before overwriting a shared asset.** Several files are used on more than one page (`d-underways.webp`, `d-market.webp`, `city-scene.mp4` were all shared). Overwriting one silently changes another page. `grep -rn "asset-name" *.html` first; if it's shared, add a new file instead of replacing.
2. **Bump the cache-busting version when CSS/JS changes.** Stylesheets are linked as `css/foo.css?v=N`. Browsers hold stale copies otherwise — this caused a real layout bug (a video escaping its container) that looked like a code error but was pure cache.

## Current State

**2026-07-31 (hackers):** Built `hackers.html` from the `Hacker_Faction_Detail.md` Diffui build (`authToken=Wa7Ne87Blvey`) — Phantom Protocol, a hacker-syndicate dossier. The build's own prompt says "follow the same format as the Character detail screen", so it reuses `character.css` with a new `.theme-hacker` (violet). Two assets generated: `hacker-hero.webp` (high, design-reference conditioned; needed one retry after a 524) and `null-grid.webp` (medium). Added a `.side-name` class for the faction-leader panel and `.char-tabs.compact` because this page has five tabs where the others have four. **This replaced `enforcers.html` on Zack's instruction** — that page, `css/enforcers.css` and its 13 assets were deleted again and the hub's third card now opens Phantom Protocol. Restore with `git checkout <commit>^ -- enforcers.html css/enforcers.css assets/...` if it's wanted back.

**2026-07-31 (shared detail layout):** `operative.html` was rebuilt on the Syndicate page's structure so both faction detail pages share one layout. `css/character.css` is now the single structure sheet: its accents are driven by `--accent` / `--accent-ink` / `--accent-hover` / `--accent-wash` / `--accent-line` / `--accent-glow`, defaulting to the Syndicate's pink, with `.char-page.theme-police` overriding them to cyan. `css/operative.css` (the old bespoke full-bleed layout) was deleted. Left/right column copy on the Police page is placeholder pending Zack's content; the centre video (`op-hero.mp4`) is final. **Editing `character.css` now affects both pages** — use the theme class for anything faction-specific.

**2026-07-31 (hub rework):** Hub now shows three cards — Syndicate → `character.html`, **Police Force** → `operative.html` (card renamed from "Enforcement Unit" so it matches that page's own h1), and **The Enforcers** → `enforcers.html`, restored from git along with `css/enforcers.css` and its 13 assets (which also replaced the short-lived redirect stub). `police.html` (the 4-character roster) is deliberately **unlinked from the hub but still deployed** — reachable by direct URL, kept for later.

**2026-07-31 (operative):** Built `operative.html` from a third Diffui build (`Police_Force_Characters.md`, `authToken=iA1uHAjPWUg5`, single page) — a Police Force Operative dossier: chamfered dossier panel with four skewed segmented stat meters (Authority 88 / Mobility 76 / Surveillance 92 / Combat Response 85), clearance footer, and the armored operative on a rain-soaked street with the neon signage rendered as HTML/CSS overlays rather than baked into the art. **This replaced `enforcers.html` on Zack's instruction** — `css/enforcers.css` and the 13 Enforcer-only assets were deleted, the hub's Enforcers card now points at the operative,. (Both the page and the redirect stub that briefly replaced it were later reverted — see the hub rework entry above.) The build doc's first fetch returned a Cloudflare 502; retrying got the full file (verified by checking all five endpoint blocks were present, per the doc's own anti-summarisation warning).

**2026-07-31 (hub):** Added `factions.html` as a proper hub for the three faction dossiers (Syndicate → `character.html`, Enforcers → `enforcers.html`, Police → `police.html`). The FACTIONS nav item on every page now points at the hub instead of `character.html`, and all three dossiers' back-links return to it. The hub is **not** from a Diffui build spec — it's composed from the established design language, reusing existing art (no new generation). Each card carries its faction's accent; the Enforcers use `--red` rather than `--pink` purely so they read distinctly from the Syndicate on the hub (their own page stays pink, as designed).

**2026-07-31 (later):** Added two pages from a second Diffui build (`authToken=WVu4AbBR3aaU`, 2 pages): `enforcers.html` (The Enforcers — crimson faction profile with segmented presence meters, six-item weapons loadout, six-unit roster rail) and `police.html` (Police Force — blue dossier plus four full-body characters). 17 assets generated (1 high hero with design-reference conditioning, 4 high full-body characters, 12 medium items/portraits) and stored locally. A `--blue` token was added to `base.css` for the Police palette. **Note:** the new design renders show the nav as WORLD/GAMEPLAY/FACTIONS/MEDIA, but the site's established order (WORLD/FACTIONS/GAMEPLAY/MEDIA) was kept on Zack's instruction — all seven pages share it.

**2026-07-31:** Empire status panel now plays a boot sequence on first view (`css/home.css` `ep-*` keyframes + the boot block in `js/main.js`): scanline sweep, map territory drops in and blooms outward via animated `clip-path`, stat rows stagger, bars overshoot then settle with a hot leading edge, numbers scramble through random same-width digits then lock on with decaying jitter, sparkline draws. Once settled the map keeps a slow infinite pulse (`ep-map-pulse` on the pink layer + `ep-map-glow` on the frame, chained after the drop so it takes over `filter`/`transform`). Initial hidden states are scoped to `html.anim` (set by an inline head script) so the panel renders complete without JS or under reduced-motion. The count-up has a guaranteed-settle timeout because `requestAnimationFrame` is suspended in background tabs, and the boot has a 1.5s fallback so an always-hidden embed can never strand the panel at opacity 0.

**2026-07-30 (later):** Published to GitHub Pages (repo created, first commit, Pages enabled, all 5 pages + assets verified live). Home hero, factions, gameplay, and world scenes are now looping videos. Home page got scroll-snap + parallax (hero backdrop drifts at 20% of scroll; oversize reduced to 120% so a 16:9 source shows ~80% of its width) and a gritty fixed-attachment `grit.webp` backdrop behind the lower sections. District rail on gameplay is interactive: pink glow on hover, cyan when selected, drawn with inset shadows so the boxes never resize.

**2026-07-30:** Home page extended with the below-the-fold sections from the cyberpunk-empire home (accordion, districts grid, four-dials grid, contact cards) between the hero and the status bar; site capped at 1440px wide and centered; world.html overview band moved under the scene image.

**2026-07-27:** All 5 pages implemented and visually verified against the design renders at 1440×1024. All imagery generated via the Diffui API (4 high-quality heroes with design-reference conditioning, 16 medium assets) and stored locally in `assets/`.

## Rules / Constraints

- Design PNGs in `design/` are the visual spec — match them, don't redesign.
- Never crop the design references for shipped assets; regenerate via Diffui (`POST https://diffui.ai/api/build/generate-image`). The build authToken expires ~2026-08-03; after that, re-copy the build link from Diffui.
- Diffui high-quality generations often return HTTP 524 (gateway timeout) on first attempt — retry, they usually succeed.
- Keep pages framework-free; all icons are inline SVG.
- **Nav order is fixed: WORLD / FACTIONS / GAMEPLAY / MEDIA** across every page, even when a new design render shows a different order.
- `character.html`'s back-link reads "BACK TO FACTIONS", not the design render's "BACK TO CHARACTERS" — a deliberate deviation so all three dossiers match and the label names its real destination (the hub).

## Testing Checklist

1. Run the dev server (Claude: preview_start `neon-empire`; manual: `cd ~/Projects/neon\ empire && python3 -m http.server 8642`).
2. Check all 5 pages at a 1440-wide viewport against `design/*.png`.
3. Verify no broken images/videos and no console errors. Hard-refresh (Cmd+Shift+R) if CSS looks stale, and bump `?v=N` if a stylesheet changed.
4. Exercise the interactions: home accordion (image swaps) and parallax, gameplay district rail hover/select, video playback on all four pages.
5. After pushing, confirm the live site returns 200 and spot-check a page in the browser.

## Tech Debt & Known Issues

- Nav tabs (ABILITIES / LORE / RELATIONSHIPS on character page), WISHLIST, and trailer buttons are non-functional placeholders — the design defines no targets.
- The gameplay scene video is sourced from 720p footage, so it renders softer than the other three (1080p+). Re-render at 1080p+ to match.
- `design/` (11 MB) ships to production unlinked. Harmless, but it's half the deploy size — exclude it if load time ever matters.
- Browser-pane screenshots render this site downscaled at some viewport sizes; it's a preview-tool artifact, not a site bug.
