# Carrick Webflow assets

CSS and JavaScript for the Carrick Webflow site (Commerce7 `/profile` integration). Edit files here, push to GitHub, and Webflow loads them from jsDelivr.

**Repo:** [github.com/cubdigital/carrick-c7](https://github.com/cubdigital/carrick-c7.git)  
**Staging:** [carrick-6a9492.webflow.io/profile](https://carrick-6a9492.webflow.io/profile)

## Source files

| File | Scope | Loaded from |
| --- | --- | --- |
| `sitewide.css` | Site-wide C7 overrides (login, profile, shared layout) | Site Settings → Custom Code → Head |
| `sitewide.js` | Site-wide behaviour (age gate, profile/login DOM wrappers, observers) | Site Settings → Custom Code → Footer |
| `profile-head.css` | `/profile` dashboard-only styles | `/profile` page → Custom Code → Head |

---

## 1. Webflow custom code

Each asset has two `<link>` or `<script>` tags in Webflow — one for jsDelivr (deploy) and one for localhost (local dev). **Comment out the one you are not using.**

Do not paste file contents into Webflow.

### Site Settings → Custom Code → Head

```html
<!-- Deploy -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.css">

<!-- Local dev -->
<!-- <link rel="stylesheet" href="http://localhost:8080/sitewide.css"> -->
```

### Site Settings → Custom Code → Footer

```html
<script defer type="text/javascript" src="https://cdn.commerce7.com/beta/commerce7.js" id="c7-javascript" data-tenant="carrick-winery"></script>

<!-- Deploy -->
<script defer src="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.js"></script>

<!-- Local dev -->
<!-- <script defer src="http://localhost:8080/sitewide.js"></script> -->
```

### `/profile` page → Custom Code → Head

```html
<!-- Deploy -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@latest/profile-head.css">

<!-- Local dev -->
<!-- <link rel="stylesheet" href="http://localhost:8080/profile-head.css"> -->
```

---

## 2. Local development

### Step 1 — Start a local server

From the repo root:

```bash
npx serve . -p 8080
```

### Step 2 — Switch Webflow to local URLs

In Webflow custom code, **comment out the jsDelivr tags and uncomment the localhost tags** (Site Settings Head/Footer + `/profile` page Head). Save/publish staging if needed.

```html
<!-- Deploy -->
<!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.css"> -->

<!-- Local dev -->
<link rel="stylesheet" href="http://localhost:8080/sitewide.css">
```

### Step 3 — Test on staging

1. Open [carrick-6a9492.webflow.io/profile](https://carrick-6a9492.webflow.io/profile).
2. Edit a file in this repo and save.
3. Hard-refresh the browser to see changes.

---

## 3. Deploy to staging

### Step 1 — Switch Webflow back to jsDelivr

**Comment out the localhost tags and uncomment the jsDelivr tags** before deploying. Save/publish staging.

```html
<!-- Deploy -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.css">

<!-- Local dev -->
<!-- <link rel="stylesheet" href="http://localhost:8080/sitewide.css"> -->
```

### Step 2 — Commit and push

```bash
git add sitewide.css sitewide.js profile-head.css
git commit -m "Describe your change"
git push origin main
```

### Step 3 — Tag a release

Webflow uses `@latest`, which points at the newest git tag. Bump the patch version (current latest: `v1.0.8`):

```bash
git tag v1.0.9
git push origin v1.0.9
```

### Step 4 — Purge jsDelivr cache

Open each URL in a browser and confirm `{"status":"finished"}`:

```
https://purge.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.css
https://purge.jsdelivr.net/gh/cubdigital/carrick-c7@latest/sitewide.js
https://purge.jsdelivr.net/gh/cubdigital/carrick-c7@latest/profile-head.css
```

### Step 5 — Verify on staging

1. Hard-refresh [carrick-6a9492.webflow.io/profile](https://carrick-6a9492.webflow.io/profile).
2. Check login, dashboard, and any pages you changed.

---

## 4. Publish to production

When staging looks good:

1. Confirm Webflow custom code is on **jsDelivr URLs** (localhost tags commented out).
2. Open the site in Webflow Designer.
3. Publish to the production domain.
4. Spot-check `/profile` on the live site.
