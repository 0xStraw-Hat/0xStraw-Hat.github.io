# Updating the About page

The About page is a short personal resume with structured cards.

- `content/about.md`: edit the two short introductory paragraphs. Markdown works here.
- `data/about.toml`: edit focus cards, community roles, and the after-hours card. Copy an existing `[[focus]]` or `[[roles]]` block to add an item. File order controls display order. Keep descriptions short; omit dates or credentials unless you want to supply real ones.
- `data/advisories.toml` and `data/cves.toml`: the About page shares the discoveries list with the homepage and CVEs page. Add a record once and it appears in all three places. Entries with `draft = true` stay hidden. GHSAs come first. Preserve the published severity and CVSS version; omit a numeric score when none has been published.
- `hugo.toml`: update `github`, `linkedin`, `discord`, and `contact` under site parameters to change the social links.
- `themes/after-hours/layouts/_default/about.html`: page layout.
- `themes/after-hours/assets/css/identity.css`: the final About styles block controls these cards, spacing, and responsive layout.

This change is local to the anime version at `E:\strawhat-blog-anime-v1`. Production build and static verification passed during repository preparation; browser interaction verification remains pending. See docs/VERIFICATION.md.
