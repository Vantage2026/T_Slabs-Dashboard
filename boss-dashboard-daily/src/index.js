#!/usr/bin/env node
/**
 * Daily boss dashboard: Google Sheets → FedEx track → HTML report → optional email (SMTP) and/or Twilio SMS.
 */
require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { loadTrackingRows } = require("./sheets");
const { trackOne } = require("./fedex");
const { fedexPublicTrackUrl, isSkipFedExApi } = require("./tracking");
const { renderDashboardHtml, escapeHtml } = require("./render-html");
const { sendTwilioSmsFetch } = require("./sms");
const { sendSmtpMail } = require("./email-smtp");

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

function parseEmailRecipients(raw) {
  return String(raw || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
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
  const intro = (
    process.env.SMS_INTRO || "Good morning Michael and Tyler. Here is your daily brief."
  ).trim();
  const notifyPlain = dashboardUrl ? `${intro}\n\n${dashboardUrl}` : "";
  const emailSubject = (process.env.EMAIL_SUBJECT || "Daily card shipment brief").trim();
  const emailHtml = dashboardUrl
    ? `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5;">
  <p>${escapeHtml(intro)}</p>
  <p><a href="${escapeHtml(dashboardUrl)}">Open dashboard</a></p>
</body>
</html>`
    : "";

  if (dryRun || reportOnly) {
    // eslint-disable-next-line no-console
    console.log("\n--- Email preview (subject + plain body) ---\n", emailSubject, "\n", notifyPlain || "(need DASHBOARD_PUBLIC_URL)");
    // eslint-disable-next-line no-console
    console.log("\n--- SMS preview (link only) ---\n", notifyPlain || "(need DASHBOARD_PUBLIC_URL)");
    return;
  }

  const smtpHost = (process.env.SMTP_HOST || "").trim();
  const smtpUser = (process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.SMTP_PASS || "").trim();
  const emailToRaw = (process.env.EMAIL_TO || "").trim();
  const emailFrom = (process.env.EMAIL_FROM || smtpUser).trim();
  const emailTos = parseEmailRecipients(emailToRaw);

  const smtpReady = smtpHost && smtpUser && smtpPass && emailFrom && emailTos.length > 0;
  if (smtpReady) {
    if (!dashboardUrl) {
      // eslint-disable-next-line no-console
      console.log("Email skipped — DASHBOARD_PUBLIC_URL is empty.");
    } else {
      const smtpPort = process.env.SMTP_PORT || "587";
      const smtpSecure = process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "true";
      await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: emailFrom,
        to: emailTos.join(", "),
        subject: emailSubject,
        text: notifyPlain,
        html: emailHtml,
      });
      // eslint-disable-next-line no-console
      console.log(`Email sent to ${emailTos.length} address(es) via SMTP (${smtpHost}).`);
    }
  } else {
    const need = [];
    if (!smtpHost) need.push("SMTP_HOST");
    if (!smtpUser) need.push("SMTP_USER");
    if (!smtpPass) need.push("SMTP_PASS");
    if (!emailFrom) need.push("EMAIL_FROM or SMTP_USER");
    if (emailTos.length === 0) need.push("EMAIL_TO");
    // eslint-disable-next-line no-console
    console.log(`Email skipped — set ${need.join(", ")} for free SMTP (e.g. Gmail app password).`);
  }

  const twilioKeys = [
    "BOSS_PHONE_E164",
    "TWILIO_FROM_E164",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
  ];
  const twilioMissing = twilioKeys.filter((k) => !process.env[k]);
  if (twilioMissing.length > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `SMS skipped — missing Twilio secrets: ${twilioMissing.join(", ")}. (Optional if you use email only.)`
    );
  } else {
    const smsFrom = process.env.TWILIO_FROM_E164;
    const phoneRecipients = String(process.env.BOSS_PHONE_E164)
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (phoneRecipients.length === 0) {
      // eslint-disable-next-line no-console
      console.log("SMS skipped — BOSS_PHONE_E164 has no numbers after parsing.");
    } else if (!dashboardUrl) {
      // eslint-disable-next-line no-console
      console.log("SMS skipped — DASHBOARD_PUBLIC_URL is empty.");
    } else {
      for (const to of phoneRecipients) {
        await sendTwilioSmsFetch({ to, from: smsFrom, body: notifyPlain });
      }
      // eslint-disable-next-line no-console
      console.log(`SMS sent to ${phoneRecipients.length} number(s) via Twilio.`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
