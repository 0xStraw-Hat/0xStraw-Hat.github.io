# Release verification — 11 September 2026

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

The GitHub Actions run and public URL will be checked after this commit is pushed. The workflow repeats production link/feed checks before deployment.
