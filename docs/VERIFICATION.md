# Release verification — 12 September 2026

Production base URL: https://0xstraw-hat.github.io/.
Repository: 0xStraw-Hat/0xStraw-Hat.github.io, existing history retained.

## Passed locally

- Hugo production build with drafts excluded.
- JavaScript syntax check.
- Static verifier: 18 HTML pages, 49 local targets, 3 RSS articles, 11 theme tokens; no errors.
- Canonical URLs use the public GitHub Pages host; no localhost URLs in production links, image sources, or metadata.
- Only strawhat.gif and its still frame are hosted under images/buttons. Other selected buttons use their exact remote source URLs.
- Headless Microsoft Edge: desktop and 390px mobile primary routes have no horizontal overflow; homepage, About, CVEs, archives, logbook and article render.
- Search returns matches and an empty state; Escape closes it. Topic filtering and theme switching work.
- A 244-line article code block previews exactly 15 lines, expands/collapses, and copies its complete contents (Windows clipboard line endings normalized for comparison).
- Reduced-motion mode uses the author's still frame and text alternatives for remote animated buttons.
- No JavaScript page errors in the tested routes. Screenshots and machine results are stored locally under .checks/browser and excluded from Git.

## Passed on GitHub Pages

- Source commit `223bfde` deployed successfully through [GitHub Actions](https://github.com/0xStraw-Hat/0xStraw-Hat.github.io/actions/runs/34676033174). Both build and deployment jobs passed, including the production verifier.
- Live URL: https://0xstraw-hat.github.io/. Pages uses GitHub Actions, HTTPS, and no custom domain.
- All 18 generated HTML pages and 68 internal link/asset targets returned HTTP 200. Canonical URLs use the public host; links, images, feeds, sitemap, and search metadata contain no localhost addresses.
- The desktop/mobile browser checks listed above also passed against the live site, including full-code clipboard copying and 15-line previews. No JavaScript page errors occurred.
- The live author button at https://0xstraw-hat.github.io/images/buttons/strawhat.gif matches the original local file byte for byte. All selected remote button images loaded in the live browser.
- Live check output is stored locally in `.checks/live-links.json` and `.checks/browser-live/`, excluded from Git.

Every future push to `main` repeats the production link/feed checks before deployment. Other people's buttons intentionally remain remote, so their future availability depends on those hosts.
