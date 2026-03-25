# Boss daily tracking dashboard

Automated **FedEx** status + **card counts** from two **Google Sheets** tracking tabs, with a **mobile-friendly HTML** report and optional **Twilio SMS** to your boss.

## What it does

1. Reads each sheet’s tab identified by **gid** in the URL (defaults match [Kai 2026](https://docs.google.com/spreadsheets/d/15oaXW2GEyMl7ES5AV_nJIdx7wG0nmMgoRjiEzyaax1A/edit?gid=1560013633) and [Momo/Tyler 2026](https://docs.google.com/spreadsheets/d/1BTlXaIMMDE9qcZRAfGOnM4ZNvUHjA1X06wTOTvRFnvo/edit?gid=47718698)).
2. Finds **Date**, **Number of cards**, **Tracking #**, **Delivered** columns from the header row (or uses fixed indices via env).
3. Keeps rows whose tracking cell looks like a **FedEx numeric** id (10–14 digits). Skips `#REF!` and non-numeric cells.
4. For rows where **Delivered** is not `Y`, either:
   - **FedEx Track API** (optional): lines like `889755754940 — On the way, Memphis, TN`, or  
   - **No API** (`SKIP_FEDEX_API=1`): uses **tracking # + card count from the sheet** and a **public [FedEx tracking](https://www.fedex.com/fedextrack/)** link so your boss taps through for live status (same info as the website, no developer account).
5. Writes `dist/report.html`, `dist/index.html` (redirect), and `dist/.nojekyll` for static hosting (dark, readable on phones).
6. Sends a **short SMS** (intro + **dashboard URL** only; phones linkify the URL). Open the page for full status, **clickable tracking numbers**, and **Open on FedEx** buttons. Requires **`DASHBOARD_PUBLIC_URL`** (CI sets a default Pages URL).

## GitHub Actions + Pages (recommended)

The workflow **`.github/workflows/daily-dashboard.yml`** (repo root):

1. Runs **every hour** and only executes the job at **8:00 AM America/New_York** (or when you **Run workflow** with **force** checked).
2. **Authenticates to Google with Workload Identity Federation** (OIDC) — **no service account JSON key** in GitHub. See [Configure Workload Identity Federation with deployment pipelines](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines) and [GitHub’s OIDC + Google Cloud](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-google-cloud-platform).
3. Runs `npm start` in `boss-dashboard-daily/` with your **repository secrets** (FedEx + Twilio match `.env`; Google uses WIF + SA email only).
4. If `DASHBOARD_PUBLIC_URL` is **not** set as a secret, it defaults to  
   `https://<owner>.github.io/<repo>/report.html` so the SMS includes the live dashboard link after deploy.
5. Publishes **`boss-dashboard-daily/dist/`** to **GitHub Pages** (`upload-pages-artifact` + `deploy-pages`).

**One-time in GitHub:** **Settings → Pages → Build and deployment → Source: GitHub Actions** (not “Deploy from a branch”). The first deploy may ask you to approve the `github-pages` environment.

**Google Cloud (WIF):** In your GCP project, create a **Workload Identity Pool** + **OIDC provider** for GitHub (`issuer`: `https://token.actions.githubusercontent.com`), map `google.subject=assertion.sub`, add an **attribute condition** so only your repo can authenticate (e.g. `assertion.repository=='OWNER/REPO'`), then grant the **`roles/iam.workloadIdentityUser`** on your **service account** to the federated principal for that repo. Copy the provider’s full resource name into GitHub.

**Repository secrets (GitHub Actions):**

| Secret | Purpose |
|--------|---------|
| `GOOGLE_WORKLOAD_IDENTITY_PROVIDER` | Full provider resource name, e.g. `projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account to impersonate (same account you share the Sheets with) |
| `SKIP_FEDEX_API` | Set to `1` to **skip** FedEx developer API; uses public tracking links only (omit `FEDEX_*` secrets) |
| `FEDEX_API_KEY` | FedEx API key (not needed if `SKIP_FEDEX_API=1`) |
| `FEDEX_SECRET_KEY` | FedEx secret (not needed if `SKIP_FEDEX_API=1`) |
| `TWILIO_ACCOUNT_SID` | Twilio |
| `TWILIO_AUTH_TOKEN` | Twilio |
| `TWILIO_FROM_E164` | Your Twilio number, e.g. `+1...` |
| `BOSS_PHONE_E164` | Recipient(s), E.164, e.g. `+1...` — comma-separated for multiple |

Optional: `FEDEX_USE_SANDBOX` (API mode only), `SMS_INTRO`, `SHEET_*`, `DASHBOARD_PUBLIC_URL` (override Pages URL).

**Local development** can still use **`GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`** in `.env` (or OAuth) — no WIF needed on your Mac.

**Test without waiting for 8 AM:** **Actions → Boss daily tracking dashboard → Run workflow** → enable **Run now (ignore 8 AM Eastern gate)**.

## Setup

1. **Google**
   - Create a **service account**, enable **Sheets API**.
   - **Share both spreadsheets** with the service account email (Viewer).
   - **On your machine:** set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env` (or use OAuth — see `.env.example`), **or** use **Workload Identity Federation** in GitHub Actions only (see table above).

2. **FedEx (pick one)**
   - **Simplest:** set **`SKIP_FEDEX_API=1`** in `.env` or GitHub secret — no FedEx developer signup. Tracking numbers still come from the sheet; the **HTML dashboard** includes a **FedEx.com** link per shipment (SMS is only the dashboard URL).
   - **API (status in the text):** register at [FedEx Developer Portal](https://developer.fedex.com/), enable **Track API**, link a shipping account if required, then set `FEDEX_API_KEY` and `FEDEX_SECRET_KEY` (and leave `SKIP_FEDEX_API` unset). Sandbox: `FEDEX_USE_SANDBOX=1`.

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

Builds `dist/report.html`, calls FedEx, prints **SMS preview** (link-only text), **does not** send SMS.

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
