#!/usr/bin/env node
/**
 * Daily boss dashboard: Google Sheets → FedEx track → HTML report → optional Twilio SMS.
 */
require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { loadTrackingRows } = require("./sheets");
const { trackOne } = require("./fedex");
const { renderDashboardHtml, buildSmsSummary } = require("./render-html");
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

async function buildItems(rows, { skipFedEx }) {
  const items = [];
  for (const row of rows) {
    if (row.delivered) {
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: true,
        statusLine: `${row.tracking} — Delivered`,
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
      });
    } catch (e) {
      items.push({
        sourceLabel: row.sourceLabel,
        date: row.date,
        cards: row.cards,
        tracking: row.tracking,
        delivered: false,
        statusLine: `${row.tracking} — ${e.message || String(e)}`,
      });
    }
  }
  return items;
}

async function main() {
  const { dryRun, reportOnly } = parseArgs();
  /** Skip FedEx only in dry-run (no API keys / faster). Report-only still polls FedEx. */
  const skipFedEx = dryRun;

  const labelKai = process.env.SHEET_KAI_LABEL || "Kai 2026";
  const labelMomo = process.env.SHEET_MOMO_LABEL || "Momo/Tyler 2026";

  const [kaiRows, momoRows] = await Promise.all([
    loadTrackingRows(SHEET_KAI, SHEET_KAI_GID, labelKai),
    loadTrackingRows(SHEET_MOMO, SHEET_MOMO_GID, labelMomo),
  ]);

  const rows = [...kaiRows, ...momoRows];
  const items = await buildItems(rows, { skipFedEx });

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

  const publicUrl = process.env.DASHBOARD_PUBLIC_URL || "";
  const summary = buildSmsSummary(items);
  const intro = process.env.SMS_INTRO || "Daily card shipment tracking:";
  let smsBody = `${intro}\n\n${summary}`;
  if (publicUrl) {
    smsBody += `\n\nFull dashboard: ${publicUrl}`;
  }

  if (dryRun || reportOnly) {
    // eslint-disable-next-line no-console
    console.log("\n--- SMS preview ---\n", smsBody);
    return;
  }

  const to = process.env.BOSS_PHONE_E164;
  const from = process.env.TWILIO_FROM_E164;
  if (!to || !from) {
    throw new Error("Set BOSS_PHONE_E164 and TWILIO_FROM_E164 to send SMS.");
  }

  await sendTwilioSmsFetch({ to, from, body: smsBody });
  // eslint-disable-next-line no-console
  console.log("SMS sent.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
