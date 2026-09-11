# Updating friends and 88x31 buttons

Edit `data/friends.toml`. Group order and button order follow the file. Friends are first (Cubeyond, then your own blog); Random stuff follows.

Only your own GIF and its still frame are stored in `static/images/buttons/`. Your public button URL is https://0xstraw-hat.github.io/images/buttons/strawhat.gif. It links to https://0xstraw-hat.github.io/. Every other button image is loaded from the exact original host selected by you, not copied into the published website.

Add entries before the next `[[groups]]` header:

```toml
[[groups.buttons]]
name = 'Friend name'
image = 'https://friend.example/button.gif'
url = 'https://friend.example/'
animated = true
source = 'https://where-you-found-the-button.example/'
```

`image` is the actual image URL; `url` is where clicking goes. `source` is optional provenance. Use `animated = true` for remote animated artwork; it becomes a text link in reduced-motion/print mode. Omit it for static images. Your own local GIF uses `still` to switch to its PNG still frame. There is no visible pause control.

For your GitHub link, use `site_param = 'github'` instead of `url` to follow the configured profile. Use `url = '/'` for this blog and `/index.xml` for RSS; these resolve to the public site when published.

All images display at 88x31 with 44px-tall link targets and visible keyboard focus. This collection appears only on the homepage; no blogroll endpoint is generated.
