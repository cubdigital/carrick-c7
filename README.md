# Carrick Webflow assets

CSS and JavaScript for the Carrick Webflow site (Commerce7 `/profile` integration). Edit files here, push to GitHub, and Webflow loads them from jsDelivr — no copy-paste on every change.

**Repo:** [https://github.com/cubdigital/carrick-c7.git](https://github.com/cubdigital/carrick-c7.git)

## Files


| File               | Scope                                                                 | Loaded from                          |
| ------------------ | --------------------------------------------------------------------- | ------------------------------------ |
| `sitewide.css`     | Site-wide C7 overrides (login, profile, shared layout)                | Site Settings → Custom Code → Head   |
| `sitewide.js`      | Site-wide behaviour (age gate, profile/login DOM wrappers, observers) | Site Settings → Custom Code → Footer |
| `profile-head.css` | `/profile` dashboard-only styles                                      | `/profile` page → Custom Code → Head |


## Webflow custom code

### Site Settings → Head

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@main/sitewide.css">
```

### Site Settings → Footer

```html
<script defer type="text/javascript" src="https://cdn.commerce7.com/beta/commerce7.js" id="c7-javascript" data-tenant="carrick-winery"></script>
<script defer src="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@main/sitewide.js"></script>
```

### `/profile` page → Head

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@main/profile-head.css">
```

## Workflow

1. Edit the relevant `.css` or `.js` file.
2. Commit and push to `main`.
3. Webflow picks up changes after jsDelivr refreshes its cache for branch URLs (up to ~12 hours).

## Faster deploys (optional)

`@main` branch URLs cache for up to 12 hours. For immediate updates without changing Webflow URLs, use semver tags and `@latest`:

```bash
git push origin main
git tag v1.0.3
git push origin v1.0.3
```

Then purge after each release — open these URLs in a browser and confirm `{"status":"finished"}`:

```
https://purge.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.css
https://purge.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.js
https://purge.jsdelivr.net/gh/cubdigital/carrick-c7@latest/profile-head.css
```

## Notes

- Paste the `<link>` and `<script src>` tags once in Webflow; updates flow from GitHub after push.
- Do not use `raw.githubusercontent.com` in production — caching and MIME types are unreliable.
- C7 swaps views client-side; scripts use `MutationObserver` to survive DOM re-renders.
- Scope styles with `body:has(.c7-…)` selectors so rules apply after C7 injects markup.

