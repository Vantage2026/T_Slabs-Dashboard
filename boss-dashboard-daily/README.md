# Boss daily tracking dashboard

Automated **FedEx** status + **card counts** from two **Google Sheets** tracking tabs, with a **mobile-friendly HTML** report and optional **Twilio SMS** to your boss.

## What it does

1. Reads each sheet’s tab identified by **gid** in the URL (defaults match [Kai 2026](https://docs.google.com/spreadsheets/d/15oaXW2GEyMl7ES5AV_nJIdx7wG0nmMgoRjiEzyaax1A/edit?gid=1560013633) and [Momo/Tyler 2026](https://docs.google.com/spreadsheets/d/1BTlXaIMMDE9qcZRAfGOnM4ZNvUHjA1X06wTOTvRFnvo/edit?gid=47718698)).
2. Finds **Date**, **Number of cards**, **Tracking #**, **Delivered** columns from the header row (or uses fixed indices via env).
3. Keeps rows whose tracking cell looks like a **FedEx numeric** id (10–14 digits). Skips `#REF!` and non-numeric cells.
4. For rows where **Delivered** is not `Y`, calls the **FedEx Track API** and builds a line like:  
   `889755754940 — On the way, Memphis, TN`  
   plus **card count** in the dashboard and SMS summary.
5. Writes `dist/report.html`, `dist/index.html` (redirect), and `dist/.nojekyll` for static hosting (dark, readable on phones).
6. Sends an SMS with a short summary plus a **Full dashboard** link when a public URL is set (local `.env` or CI; see below).

## GitHub Actions + Pages (recommended)

The workflow **`.github/workflows/daily-dashboard.yml`** (repo root):

1. Runs **every hour** and only executes the job at **8:00 AM America/New_York** (or when you **Run workflow** with **force** checked).
2. Runs `npm start` in `boss-dashboard-daily/` with your **repository secrets** (same names as `.env`).
3. If `DASHBOARD_PUBLIC_URL` is **not** set as a secret, it defaults to  
   `https://<owner>.github.io/<repo>/report.html` so the SMS includes the live dashboard link after deploy.
4. Publishes **`boss-dashboard-daily/dist/`** to **GitHub Pages** (`upload-pages-artifact` + `deploy-pages`).

**One-time in GitHub:** **Settings → Pages → Build and deployment → Source: GitHub Actions** (not “Deploy from a branch”). The first deploy may ask you to approve the `github-pages` environment.

**Repository secrets to add** (match `.env.example`):

| Secret | Purpose |
|--------|---------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email |
| `GOOGLE_PRIVATE_KEY` | Full PEM, include `\n` newlines |
| `FEDEX_API_KEY` | FedEx API key |
| `FEDEX_SECRET_KEY` | FedEx secret |
| `TWILIO_ACCOUNT_SID` | Twilio |
| `TWILIO_AUTH_TOKEN` | Twilio |
| `TWILIO_FROM_E164` | Your Twilio number, e.g. `+1...` |
| `BOSS_PHONE_E164` | Boss’s mobile, e.g. `+1...` |

Optional: `FEDEX_USE_SANDBOX`, `SMS_INTRO`, `SHEET_*`, `DASHBOARD_PUBLIC_URL` (override Pages URL).

**Test without waiting for 8 AM:** **Actions → Boss daily tracking dashboard → Run workflow** → enable **Run now (ignore 8 AM Eastern gate)**.

## Setup

1. **Google**
   - Create a **service account**, enable **Sheets API**, download JSON, set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env`.
   - **Share both spreadsheets** with the service account email (Viewer).

2. **FedEx**
   - Register at [FedEx Developer Portal](https://developer.fedex.com/), create a project, subscribe to **Track API**, and create **API Key** + **Secret Key** (client credentials).
   - Set `FEDEX_API_KEY` and `FEDEX_SECRET_KEY`. For sandbox tests, set `FEDEX_USE_SANDBOX=1` and use sandbox keys.

3. **Twilio**
   - Buy a number; set `TWILIO_*` and `BOSS_PHONE_E164` / `TWILIO_FROM_E164`.

4. **Copy** `.env.example` to `.env` and fill values.

```bash
cd boss-dashboard-daily
npm install
npm run dry-run
```

`dry-run` loads Sheets but does **not** call FedEx or send SMS (good for verifying column mapping).

```bash
npm run report-only
```

Builds `dist/report.html`, calls FedEx, prints SMS body, **does not** send SMS.

```bash
npm start
```

Full run: HTML + SMS.

## Hosting without GitHub Pages

Set **`DASHBOARD_PUBLIC_URL`** in `.env` (or as a repo secret) to any public URL where you upload `dist/` (S3, Netlify, etc.).

Generating a **PNG** for MMS would need headless Chrome or an image API; this package does not include that.

## Schedule: every day 8:00 AM Eastern

The workflow uses an **hourly cron** plus a **timezone gate** so only the **8 AM America/New_York** run does work (see workflow file). **DST** is handled because the gate uses `TZ=America/New_York`.

**Local cron** (optional): `0 8 * * * TZ=America/New_York cd /path/to/boss-dashboard-daily && node src/index.js`

## Claude / agent

You can have a **scheduled agent** run the same command as CI; the logic lives in this repo so the agent only needs secrets and `npm start`.

## Column F vs D

If a sheet stores “Delivered” in column **D** instead of **F**, set header text to include **Delivered** (auto-detected), or set `COL_DELIVERED_INDEX` (0-based).
