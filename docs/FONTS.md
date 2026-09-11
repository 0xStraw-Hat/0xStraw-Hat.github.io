# Self-hosted fonts

The theme serves fonts locally from `static/fonts`; reading the blog makes no Google Fonts requests. Font license text is included in `static/fonts/licenses`.

| Font | Use | Source |
|---|---|---|
| Pixelify Sans | Name and selected section titles | https://fonts.google.com/specimen/Pixelify+Sans |
| Chakra Petch | Article headings | https://fonts.google.com/specimen/Chakra+Petch |
| DM Sans | Prose | https://fonts.google.com/specimen/DM+Sans |
| IBM Plex Mono | Code and metadata | https://fonts.google.com/specimen/IBM+Plex+Mono |
| Noto Sans JP | Japanese identity phrases | https://fonts.google.com/noto/specimen/Noto+Sans+JP |

The Japanese WOFF2 is a small subset containing the current phrases. Other Japanese text falls back to Yu Gothic, Meiryo, or the reader's installed sans-serif font. If Japanese becomes a larger part of the blog, replace the subset with appropriate full language coverage.

OFL license files were retrieved from the respective `ofl` directories in the official [Google Fonts repository](https://github.com/google/fonts). The existing anime artwork and article images were migrated from the user's files. Unused source artwork is kept in `docs/asset-sources`, outside the generated website.
