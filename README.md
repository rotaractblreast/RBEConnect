# RBE Connect — Reviewer Portal (Standalone PWA)

Independent, high-performance candidate review portal & progressive web app for the **Rotaract Club of Bangalore East**.

- **Production Domain:** `https://connect.rotaractblreast.org`
- **Stack:** Vite 6 + React 18 + TypeScript + Tailwind CSS + PWA (Workbox & OneSignal v16)
- **Backend:** Google Apps Script Web App (`Code.gs` + `Dashboard.gs`) + Google Sheets

---

## Key Features & Architecture

1. **Instant Cold Launches (0ms FOUC):**
   - Synchronous local cache hydration (`localStorage`).
   - Stale-while-revalidate architecture: displays cached applicant cards immediately while validating sessions and refreshing data quietly in the background.
2. **Unified Service Worker & OneSignal Web Push v16:**
   - Single unified service worker (`public/sw.js` and `public/OneSignalSDKWorker.js`) eliminating service worker collisions.
   - Lock-screen and desktop push notifications dispatched via OneSignal REST API when candidates apply.
   - Dual-frequency synthesized Web Audio chime on incoming submissions.
3. **PWA Desktop & Mobile Windowing:**
   - Full desktop windowing support (Chrome, Edge, macOS Safari, Windows).
   - Keyboard shortcuts (`/` to focus search, `Esc` to close drawer).
   - Responsive bottom sheet on mobile and slide-over drawer on desktop.
4. **PWA Install Telemetry:**
   - Automatically logs device and platform installation data to the Google Sheet `Installs` tab when reviewers install the app.
5. **Session Security & Scaling:**
   - 15-minute `CacheService` server-side caching preventing quota exhaustion.
   - Direct device session revocation from Google Sheets.
   - Batch header operations eliminating redundant synchronous writes.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start Vite local dev server (port 5173)
npm run dev

# 3. Production build
npm run build

# 4. Local preview of production build
npm run preview
```

---

## Deployment (Netlify)

1. Connect this repository to **Netlify** (or drag & drop the `dist/` folder).
2. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Custom domain:
   - Set custom domain to `connect.rotaractblreast.org`.
   - Point your DNS CNAME record for `connect` to your Netlify site URL.

> **Zero `.env` variables required:** The Forms API URL is fixed in the codebase, and all credentials (OneSignal App ID, allowed origins, notification emails) are dynamically loaded from your Google Sheet's **`Config`** tab!

---

## Google Apps Script Updates

The latest scripts are located in [`google-apps-script/forms-api/`](./google-apps-script/forms-api/):
- [`Code.gs`](./google-apps-script/forms-api/Code.gs):
  - Configured with `portalUrl: "https://connect.rotaractblreast.org"`.
  - Added `https://connect.rotaractblreast.org` to `allowedOrigins`.
  - Fixed OneSignal REST API `Authorization: Basic <apiKey>` header.
- [`Dashboard.gs`](./google-apps-script/forms-api/Dashboard.gs):
  - Fast cached session verification (under 300ms) with direct sheet fallback.
  - Added `logInstall` telemetry action writing to the `Installs` sheet tab.
  - Eliminated 4 redundant synchronous header `setValue` calls on read.
  - Increased session token `CacheService` TTL to 15 minutes.

### Applying to Google Apps Script:
1. Open your Google Sheet → **Extensions → Apps Script**.
2. Replace `Code.gs` and `Dashboard.gs` with the updated files in this folder.
3. Click **Deploy → Manage deployments → Edit (pencil icon) → New version → Deploy**.
