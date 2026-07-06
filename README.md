# Carrick Webflow assets

CSS and JavaScript for the Carrick Webflow site (Commerce7 `/profile` integration). Edit files here, push to GitHub, and Webflow loads them from a CDN — no copy-paste on every change.

## Files

| File | Purpose |
|------|---------|
| `sitewide.css` | Site-wide styles (profile/login, C7 overrides) |
| `sitewide.js` | Site-wide scripts (age gate, profile layout) — generated from `site-wide-footer.html` |
| `site-wide-footer.html` | Source/reference for footer scripts (edit this, then regenerate `sitewide.js`) |
| `profile-head.html` | Profile page head snippet (paste in Webflow page settings if needed) |
| `profile-before-body.html` | Profile page before-`</body>` snippet |

## Regenerate `sitewide.js`

After editing `site-wide-footer.html`, extract the inline scripts:

```bash
python3 - <<'PY'
from pathlib import Path
import re
html = Path('site-wide-footer.html').read_text()
blocks = [m.group(1).strip() for m in re.finditer(
    r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', html, re.DOTALL | re.IGNORECASE)]
Path('sitewide.js').write_text('\n\n'.join(blocks) + '\n')
PY
```

## GitHub setup (one time)

1. Create a **public** repo on GitHub (e.g. `carrick-webflow-assets`).
2. Push this folder:

```bash
git init
git add .
git commit -m "Add Carrick Webflow sitewide assets"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/carrick-webflow-assets.git
git push -u origin main
```

3. Optional: enable **GitHub Pages** (Settings → Pages → Deploy from branch `main` / root).

## Webflow custom code

Replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub repo. **jsDelivr** is recommended — it serves public GitHub repos as a CDN with no extra setup.

### Site Settings → Custom Code → **Head**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/REPO_NAME@main/sitewide.css">
```

### Site Settings → Custom Code → **Footer**

Keep the Commerce7 loader, then load your scripts:

```html
<script defer type="text/javascript" src="https://cdn.commerce7.com/beta/commerce7.js" id="c7-javascript" data-tenant="carrick-winery"></script>
<script defer src="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/REPO_NAME@main/sitewide.js"></script>
```

### GitHub Pages URLs (alternative)

If you enable GitHub Pages:

```html
<link rel="stylesheet" href="https://YOUR_USERNAME.github.io/REPO_NAME/sitewide.css">
<script defer src="https://YOUR_USERNAME.github.io/REPO_NAME/sitewide.js"></script>
```

## Workflow

1. Edit `sitewide.css` and/or `site-wide-footer.html` locally.
2. Regenerate `sitewide.js` if you changed the footer HTML.
3. Commit and push to `main`.
4. Webflow picks up changes after jsDelivr cache refreshes (usually within minutes). For an immediate update, pin to a commit hash instead of `@main`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/YOUR_USERNAME/REPO_NAME@abc1234/sitewide.css">
```

## Notes

- Webflow cannot “import” a file URL into the designer UI — you paste the `<link>` / `<script src>` tags once in Site Settings; updates flow from GitHub after push.
- Do not use `raw.githubusercontent.com` in production; caching and MIME types are unreliable.
- Profile-only snippets (`profile-head.html`, `profile-before-body.html`) stay as page-level embeds unless you also host them and link by URL.
