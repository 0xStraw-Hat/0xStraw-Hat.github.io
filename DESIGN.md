---
version: alpha
name: After Hours
description: A low-level security notebook with restrained anime scenery and colorful terminal typography.
colors:
  background: '#131521'
  surface: '#1b1d2b'
  raised: '#222638'
  text: '#e9e8ef'
  muted: '#a9abbf'
  faint: '#9496af'
  border: '#34374c'
  primary: '#c7adff'
  mint: '#97ddca'
  blue: '#91c7ff'
  peach: '#eca58e'
typography:
  display:
    fontFamily: 'Pixelify Sans, monospace'
  heading:
    fontFamily: 'Chakra Petch, Segoe UI, sans-serif'
  body:
    fontFamily: 'DM Sans, Segoe UI, sans-serif'
  utility:
    fontFamily: 'IBM Plex Mono, Consolas, monospace'
  japanese:
    fontFamily: 'Noto Sans JP, Yu Gothic, Meiryo, sans-serif'
rounded:
  sm: '6px'
  lg: '10px'
spacing:
  section: '64px'
  page: '1280px'
components:
  button: {}
  post: {}
  search: {}
  contents: {}
---

# After Hours

## Overview

A debugger left open after midnight. Anime stills, a colorful terminal prompt, and long research notes. This is a personal content site for global English-reading security learners. No admin, account, billing, or remote mutations: the premium content-site gate applies.

The user explicitly requested subtle anime, colorful fonts, Cubeyond's low-level sensibility, a rewritten About page and a few Japanese phrases. These replace the earlier harbor direction. References: [existing site](https://0xstrawhat.tech/), [Mushroom](https://mushroom.cat/), [Entropic](https://www.cubeyond.net/), [Pawnyable](https://pawnyable.cafe/), [0x5t](https://0x5t.raptx.org/), [Niko](https://nikolan.net/), [Lona](https://lona.moe/), [XAOXUU](https://xaoxuu.com/), [Orange Tsai](https://blog.orange.tw/). Borrow atmosphere and content organization, not branding or code.

Signature: oversized pixel name over a muted anime city with a compact terminal identity panel. Article reading remains calm and opaque. No forced loaders, cursor trails, flashing, or invented achievements.

Japanese classification: English locale, global audience, no Japan-specific market or regulated flows. Japanese identity phrases are explicitly user-requested, marked lang=ja, paired with English translations, and use a Japanese-capable font. No native-review claims or critical Japanese UI copy.

## Colors

Ownership Model B: canonical runtime tokens are the root and light-theme declarations in `themes/after-hours/assets/css/main.css`. This document mirrors accepted values; `scripts/verify.py` checks drift. Shared components consume semantic CSS variables.

| Document | Runtime | Role |
|---|---|---|
| background | --color-bg | Page and dialog |
| surface | --color-surface | Panels |
| raised | --color-raised | Controls and tags |
| text | --color-text | Main foreground |
| muted | --color-muted | Prose and descriptions |
| faint | --color-faint | Metadata |
| border | --color-border | Separation |
| primary | --color-primary | Lavender action and focus |
| mint | --color-mint | Links and identifiers |
| blue | --color-blue | Terminal keywords |
| peach | --color-rust | Warm accents |

Day mode remaps tokens to dark ink on pale lavender. Global scrollbars define thumb/track/hover/active and forced-colors fallback.

## Typography

Pixelify Sans: name and a few section titles. Chakra Petch: article headings. DM Sans at 16px+: prose. IBM Plex Mono: code and metadata. Noto Sans JP subset with Yu Gothic/Meiryo fallbacks: Japanese phrases, normal punctuation, line-height 1.8, no italics. Fonts are self-hosted WOFF2.

## Layout

1280px max, desktop total gutters 64px, narrow 36px. Intro then article rows + sidebar, then blogroll. Articles max 780px plus contents. At 850px contents becomes a disclosure above the article; at 650px layouts stack. Document owns scrolling; code, tables, dialogs scroll internally. Images reserve geometry.

## Elevation & Depth

Anime art belongs behind the intro and in small author imagery. Reading is on solid surfaces. Elevation is reserved for menus, dialogs, and feedback. Scenery is static.

## Shapes

6px controls, 10px panels, circular avatar, crisp terminal borders, 88-by-31 web badges.

## Components

Shared owners: header/footer/icon/post-card/sidebar/cover templates, base tokens and components in `main.css`, identity styling in `identity.css`, and one behavior module. Hugo combines the two stylesheets into one fingerprinted asset. Navigation, theme, filters and feedback behave consistently across routes.

Embedded full-text search has initial, matching, no-results, clear and failure-recovery states; no remote loading exists. Native dialog supplies modal focus isolation, Escape and restoration; `/search/` is a linkable counterpart. List state is in URL parameters with 9-entry batches. Without JS, articles/taxonomies remain readable. Copy feedback has fixed control geometry and manual recovery. Theme storage is guarded. Mobile navigation uses details. Static cover posters avoid autoplay; reduced motion disables transitions.

## Do's and Don'ts

- Preserve real posts, author facts and original URLs.
- Keep pixel fonts away from long code and prose.
- Pair Japanese with translations.
- Never invent CVEs discovered, employers, certificates, or friendships.
- Never expose drafts or publish without the user's approval.
- No fake terminal inputs, autoplay music, or anime characters on every panel.

## CVEs page: After Hours disclosure files

The latest user correction rejects the restrained rows as boring. This route now draws directly from the established anime identity: the existing city wallpaper fills a short cinematic banner, its foreground title uses Chakra Petch rather than pixel lettering, and the requested mechanical-style counter remains. The city is decorative and static; the compact banner does not become a full-height hero.

Disclosure files form a unified two-column collection, GHSAs first, with small project tabs, color-matched identifier links, published severity, dates, and real source actions. Project tab colors encode project identity consistently: libyang mint, uuid blue, Multer peach, Zen Browser lavender, default lavender. Severity continues to use the independent shared score component and its labels. The cards use subtle inset tab treatment and solid reading surfaces; no copied circuit art or timeline structure. Hover and focus reveal the file accent without moving or resizing cards. Mobile becomes one column and preserves every link and severity label.

All colors consume canonical main.css variables. Template: layouts/cves/list.html; styling: the single disclosure-files block in identity.css. research-data.html and score.html retain shared ownership; no data changes or invented scores. Counts derive from non-draft public records and unique projects. Known Japanese identity copy is translated beside it. No new assets, animation, fake controls, or disclosure categories. Final verification is still deferred under the user's ongoing instruction.

## Homepage friends shelf

The user requested a traditional image-button collection using 88x31db, initially with only three demos. The prior text-based inspiration badges are replaced by a compact, wrapping shelf under Friends & stuff. The images retain native 88x31 geometry and crisp pixel rendering; each link has a 44px hit area and a visible keyboard outline. Demo status is explicit and no archived button is represented as an actual personal friendship. `data/friends.toml` is the canonical owner of entries, linked URLs, local image paths, alt text and demo state. Real button data will be supplied by the user after visual approval. The section remains homepage-only. Local demo image provenance is recorded in the data and `docs/FRIENDS-BUTTONS.md`.

### Real button collection

The user supplied all nine final button assets and their destinations. `data/friends.toml` now has ordered groups: Friends (Cubeyond, then this blog) and Random stuff (personal GitHub, Linux source, Neovim, Python, IDA, Hugo, RSS). Demo entries and labels are removed. Assets are downloaded unchanged from the exact selected archive IDs and friend URL. Local home/RSS URLs work in preview and publication; the GitHub button reads the existing Hugo param. Animated images have still-frame alternatives with reduced-motion support and print fallbacks; the visible pause control was removed at the user’s request. The maintenance guide is `docs/FRIENDS-BUTTONS.md`.


## Main repository handoff

The selected After Hours project is now the single self-contained main repository, initialized locally on main with no remote or commits. Source, assets, and the theme live together; .github/workflows/hugo.yaml is prepared for the future GitHub connection. The README replaces the old separate-repository instructions. Generated output and historical recovery artifacts are excluded by .gitignore. Production build, JavaScript syntax, and static link/feed/token checks passed; see docs/VERIFICATION.md. Browser interaction testing and live deployment remain separate pending steps. No original folder or remote has been removed or replaced.


## GitHub Pages publication

The user authorized publication to the existing 0xStraw-Hat/0xStraw-Hat.github.io repository with its history preserved. Canonical base URL is https://0xstraw-hat.github.io/. Only the author’s own button GIF and still are local published assets; all other buttons use their original remote URLs. Remote animations have text fallbacks for reduced motion and print. Production checks reject localhost references. The Pages workflow replaces the old generated-HTML publishing setup.
