# Neon Empire — Cyberpunk Game Site

## Quick Context

Marketing/lore site for "Neon Empire," a near-future cyberpunk game about building a criminal empire (Blade Runner / Tokyo-at-night aesthetic, set in a fictionalized Copenhagen). Built from a Diffui design-to-code build spec (5 diffusion-rendered page designs). Static vanilla HTML/CSS/JS — no framework, no build step.

## Architecture

```
index.html        Home — "Build the Empire. Own the Night." hero + empire status panel
world.html        Environment detail — Crown Heights district (nav: WORLD)
character.html    Character detail — Asher Kraid, Syndicate Enforcer (nav: FACTIONS)
city.html         City overview — "Every Street Has a Price" + 5 district rail (nav: GAMEPLAY)
areas.html        8 city areas / weather grid (nav: MEDIA)
css/base.css      Design tokens, shared nav, footer status bar, buttons (+1440px body cap)
css/{home,character,city,areas,world}.css   Per-page styles
css/components.css, css/widgets.css   Section/card/contact styles copied from ~/Projects/cyberpunk-empire (keep in sync)
js/main.js        Ticking sync clock + feature accordion (home page)
assets/           Diffui-generated .webp images + grit.webp texture + compressed .mp4 loops (local copies — do NOT hotlink diffui.ai)
design/           5 original design reference PNGs (1440×1024) — the source of truth
.claude/launch.json   `neon-empire` dev server (python3 http.server on port 8642)
```

**Design tokens** (css/base.css `:root`): bg `#05060a`, cyan `#00e5ff`, pink `#ff2d78`, purple `#8b5cf6`, yellow `#ffc233`, bone `#e5e0d1`. Fonts: Anton (display), JetBrains Mono (HUD labels), Inter (body) via Google Fonts.

## Current State

**2026-07-30:** Home page extended with the below-the-fold sections from the cyberpunk-empire home (accordion, districts grid, four-dials grid, contact cards) between the hero and the status bar; site capped at 1440px wide and centered; world.html overview band moved under the scene image.

**2026-07-27:** All 5 pages implemented and visually verified against the design renders at 1440×1024. All imagery generated via the Diffui API (4 high-quality heroes with design-reference conditioning, 16 medium assets) and stored locally in `assets/`. No git repo yet — `git init` + first commit is the natural next step.

## Rules / Constraints

- Design PNGs in `design/` are the visual spec — match them, don't redesign.
- Never crop the design references for shipped assets; regenerate via Diffui (`POST https://diffui.ai/api/build/generate-image`). The build authToken expires ~2026-08-03; after that, re-copy the build link from Diffui.
- Diffui high-quality generations often return HTTP 524 (gateway timeout) on first attempt — retry, they usually succeed.
- Keep pages framework-free; all icons are inline SVG.

## Testing Checklist

1. Run the dev server (Claude: preview_start `neon-empire`; manual: `cd ~/Projects/neon\ empire && python3 -m http.server 8642`).
2. Check all 5 pages at 1440-wide viewport against `design/*.png`.
3. Verify no broken images (all `assets/*.webp` referenced paths exist) and no console errors.

## Tech Debt & Known Issues

- Nav tabs (ABILITIES / LORE / RELATIONSHIPS on character page), WISHLIST, trailer buttons are non-functional placeholders — the design defines no targets.
- Browser-pane screenshots render this site downscaled at some viewport sizes; it's a preview-tool artifact, not a site bug.
