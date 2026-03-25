#!/usr/bin/env node
/**
 * Daily boss dashboard: Google Sheets → FedEx track → HTML report → optional Twilio SMS.
 */
require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { loadTrackingRows } = require("./sheets");
const { trackOne } = require("./fedex");
const { fedexPublicTrackUrl, isSkipFedExApi } = require("./tracking");
const { renderDashboardHtml } = require("./render-html");
const { sendTwilioSmsFetch } = require("./sms");

const SHEET_KAI = process.env.SHEET_KAI_ID || "15oaXW2GEyMl7ES5AV_nJIdx7wG0nmMgoRjiEzyaax1A";
const SHEET_KAI_GID = process.env.SHEET_KAI_GID || "1560013633";
const SHEET_MOMO = process.env.SHEET_MOMO_ID || "1BTlXaIMMDE9qcZRAfGOnM4ZNvUHjA1X06wTOTvRFnvo";
const SHEET_MOMO_GID = process.env.SHEET_MOMO_GID || "47718698";

function parseArgs() {
  const dryRun = process.argv.includes("--dry-run");
  const reportOnly = process.argv.includes("--report-only");
  return { dryRun, reportOnly };
}

async function buildItems(rows, { skipFedEx, linkOnly }) {
  const items = [];
  for (const row of rows) {
    const trackUrl = fedexPublicTrackUrl(row.tracking);
    if (row.delivered) {
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: true,
        statusLine: `${row.tracking} — Delivered`,
        trackUrl,
      });
      continue;
    }

    if (skipFedEx) {
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: false,
        statusLine: `${row.tracking} — (FedEx not queried — dry run)`,
        trackUrl,
      });
      continue;
    }

    if (linkOnly) {
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: false,
        statusLine: "Tap the tracking number or link below to open FedEx.",
        trackUrl,
      });
      continue;
    }

    try {
      const t = await trackOne(row.tracking);
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: false,
        statusLine: t.line,
        trackUrl,
      });
    } catch (e) {
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: false,
        statusLine: `${row.tracking} — ${e.message || String(e)}`,
        trackUrl,
      });
    }
  }
  return items;
}

async function main() {
  const { dryRun, reportOnly } = parseArgs();
  /** Dry-run: no FedEx. SKIP_FEDEX_API=1: use sheet + public FedEx link only (no developer API). */
  const skipFedEx = dryRun;
  const linkOnly = !dryRun && isSkipFedExApi();

  const labelKai = process.env.SHEET_KAI_LABEL || "Kai 2026";
  const labelMomo = process.env.SHEET_MOMO_LABEL || "Momo/Tyler 2026";

  const [kaiRows, momoRows] = await Promise.all([
    loadTrackingRows(SHEET_KAI, SHEET_KAI_GID, labelKai),
    loadTrackingRows(SHEET_MOMO, SHEET_MOMO_GID, labelMomo),
  ]);

  const rows = [...kaiRows, ...momoRows];
  const items = await buildItems(rows, { skipFedEx, linkOnly });

  const html = renderDashboardHtml({ generatedAt: new Date(), items });
  const outDir = process.env.REPORT_DIR || path.join(process.cwd(), "dist");
  const outFile = path.join(outDir, "report.html");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outFile, html, "utf8");
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="0; url=report.html" />
  <title>Card shipments — redirect</title>
</head>
<body>
  <p><a href="report.html">Open dashboard</a></p>
</body>
</html>`;
  await fs.writeFile(path.join(outDir, "index.html"), indexHtml, "utf8");
  await fs.writeFile(path.join(outDir, ".nojekyll"), "", "utf8");
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outFile}, index.html, .nojekyll`);

  const dashboardUrl = (process.env.DASHBOARD_PUBLIC_URL || "").trim();
  const intro = (process.env.SMS_INTRO || "Card shipments — open your dashboard:").trim();
  /** Plain text; the URL is auto-linked on phones. Kept short for one SMS segment. */
  const smsBody = dashboardUrl ? `${intro}\n\n${dashboardUrl}` : "";

  if (dryRun || reportOnly) {
    // eslint-disable-next-line no-console
    console.log("\n--- SMS preview (link only) ---\n", smsBody || "(set DASHBOARD_PUBLIC_URL for SMS body)");
    return;
  }

  const from = process.env.TWILIO_FROM_E164;
  const twilioKeys = [
    "BOSS_PHONE_E164",
    "TWILIO_FROM_E164",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
  ];
  const missing = twilioKeys.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `SMS skipped — missing GitHub Actions secrets (or empty): ${missing.join(", ")}. Add all four to send SMS.`
    );
    return;
  }

  /** Comma, semicolon, or newline — multiple E.164 recipients, e.g. +15551234567,+15559876543 */
  const recipients = String(process.env.BOSS_PHONE_E164)
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    // eslint-disable-next-line no-console
    console.log("SMS skipped — BOSS_PHONE_E164 has no numbers after parsing.");
    return;
  }

  if (!dashboardUrl) {
    // eslint-disable-next-line no-console
    console.log(
      "SMS skipped — DASHBOARD_PUBLIC_URL is empty. Set it (GitHub Actions sets a default after deploy) so the text can include the live dashboard link."
    );
    return;
  }

  for (const to of recipients) {
    await sendTwilioSmsFetch({ to, from, body: smsBody });
  }
  // eslint-disable-next-line no-console
  console.log(
    `SMS sent to ${recipients.length} number(s) via Twilio. (Trial: each recipient may need to be verified.)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
