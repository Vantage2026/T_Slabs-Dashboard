#!/usr/bin/env node
/**
 * Daily boss dashboard: Google Sheets → FedEx track → HTML report → optional email (SMTP) and/or Twilio SMS.
 */
require("dotenv").config();

const fs = require("node:fs/promises");
const path = require("node:path");
const { loadTrackingRows, filterRowsWithinDays } = require("./sheets");
const { trackOne } = require("./fedex");
const { fedexPublicTrackUrl, isSkipFedExApi } = require("./tracking");
const { renderDashboardHtml, escapeHtml } = require("./render-html");
const { sendTwilioSmsFetch } = require("./sms");
const { sendSmtpMail, buildRawMime, smtpPortNumber } = require("./email-smtp");
const { appendToImapMailbox } = require("./email-imap-sent");
const { sendResendEmail } = require("./email-resend");

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

/** Comma, semicolon, or newline — used for EMAIL_TO and EMAIL_FROM. */
function parseAddressList(raw) {
  return String(raw || "")
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Safe for logs (not a security guarantee). */
function maskEmail(addr) {
  const s = String(addr).trim();
  const at = s.indexOf("@");
  if (at < 1) return "(invalid)";
  return `${s[0]}…@${s.slice(at + 1)}`;
}

/** In transit / not delivered first; delivered rows last (stable within each group). */
function sortItemsDeliveryFirst(items) {
  return [...items].sort((a, b) => {
    if (a.delivered !== b.delivered) return a.delivered ? 1 : -1;
    return 0;
  });
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

  let rows = [...kaiRows, ...momoRows];
  const recentDays = Number.parseInt(process.env.REPORT_RECENT_DAYS ?? "14", 10);
  if (Number.isFinite(recentDays) && recentDays > 0) {
    const tz = process.env.REPORT_TIMEZONE || "America/New_York";
    const before = rows.length;
    rows = filterRowsWithinDays(rows, recentDays, tz);
    // eslint-disable-next-line no-console
    console.log(`Report: last ${recentDays} days (${tz}) — ${rows.length} of ${before} FedEx rows`);
  }

  const items = await buildItems(rows, { skipFedEx, linkOnly });
  const sortedItems = sortItemsDeliveryFirst(items);

  const html = renderDashboardHtml({ generatedAt: new Date(), items: sortedItems });
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
    const previewFrom = parseAddressList((process.env.EMAIL_FROM || process.env.SMTP_USER || "").trim()).join(", ");
    // eslint-disable-next-line no-console
    console.log(
      "\n--- Email preview (From / subject / plain body) ---\n",
      previewFrom || "(set SMTP_USER or EMAIL_FROM)",
      "\n",
      emailSubject,
      "\n",
      notifyPlain || "(need DASHBOARD_PUBLIC_URL)"
    );
    // eslint-disable-next-line no-console
    console.log("\n--- SMS preview (link only) ---\n", notifyPlain || "(need DASHBOARD_PUBLIC_URL)");
    return;
  }

  const smtpHost = (process.env.SMTP_HOST || "").trim();
  const smtpUser = (process.env.SMTP_USER || "").trim();
  /** Trim: pasted app passwords often include a trailing newline and Gmail then rejects login. */
  const smtpPass = String(process.env.SMTP_PASS || "").trim();
  const emailToRaw = (process.env.EMAIL_TO || "").trim();
  const emailTos = parseAddressList(emailToRaw);
  const fromRaw = (process.env.EMAIL_FROM || smtpUser || "").trim();
  const emailFromList = parseAddressList(fromRaw);
  const emailFromHeader = emailFromList.join(", ");

  const resendKey = String(process.env.RESEND_API_KEY || "").trim();
  const resendFrom = (
    process.env.RESEND_FROM || "T Slabs daily brief <onboarding@resend.dev>"
  ).trim();
  const resendReady = Boolean(resendKey && emailTos.length > 0);

  const smtpReady = smtpHost && smtpUser && smtpPass && emailFromList.length > 0 && emailTos.length > 0;
  // eslint-disable-next-line no-console
  console.log(
    `[notify] Email: RESEND_API_KEY=${resendKey ? "set" : "unset"} | SMTP_HOST=${smtpHost || "(unset)"} SMTP_USER=${smtpUser ? maskEmail(smtpUser) : "(unset)"} SMTP_PASS=${smtpPass ? "set" : "(unset)"} | EMAIL_TO count=${emailTos.length}`
  );

  if (emailTos.length === 0) {
    // eslint-disable-next-line no-console
    console.log(
      "Email skipped — set repository secret EMAIL_TO with comma-separated recipient addresses (your inbox must be listed)."
    );
  } else if (!dashboardUrl) {
    // eslint-disable-next-line no-console
    console.log("Email skipped — DASHBOARD_PUBLIC_URL is empty.");
  } else {
    let sentViaResend = false;
    if (resendReady) {
      // eslint-disable-next-line no-console
      console.log(
        "[notify] Using Resend API (HTTPS). For multiple recipients without a verified domain, Resend may 403 — we fall back to SMTP if configured."
      );
      // eslint-disable-next-line no-console
      console.log("[notify] Resend To:", emailTos.map(maskEmail).join(", "));
      try {
        const resendOut = await sendResendEmail({
          apiKey: resendKey,
          from: resendFrom,
          toAddresses: emailTos,
          subject: emailSubject,
          text: notifyPlain,
          html: emailHtml,
        });
        sentViaResend = true;
        // eslint-disable-next-line no-console
        console.log(`[notify] Resend accepted. id=${resendOut?.id ?? JSON.stringify(resendOut).slice(0, 120)}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("[notify] Resend failed:", e.message || e);
        if (!smtpReady) throw e;
        // eslint-disable-next-line no-console
        console.log("[notify] Falling back to SMTP for all recipients…");
      }
    }

    if (!sentViaResend && smtpReady) {
    const smtpPort = smtpPortNumber(process.env.SMTP_PORT);
      const smtpSecure = process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "true";

      if (/gmail\.com/i.test(smtpHost) && emailFromHeader.includes(",")) {
        // eslint-disable-next-line no-console
        console.warn(
          "[notify] Gmail SMTP: multiple From addresses may be rejected unless every address is a verified “Send mail as” alias. Consider a single EMAIL_FROM."
        );
      }

      const bccExtra = parseAddressList(process.env.EMAIL_BCC || "");
      const bccSelf = /^1|true|yes$/i.test(String(process.env.EMAIL_BCC_SELF || "").trim());
      const bccSet = new Set(bccExtra);
      if (bccSelf && smtpUser) bccSet.add(smtpUser);
      const bccHeader = bccSet.size > 0 ? [...bccSet].join(", ") : undefined;

      // eslint-disable-next-line no-console
      console.log("[notify] Sending mail To:", emailTos.map(maskEmail).join(", "));
      const mailInfo = await sendSmtpMail({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        user: smtpUser,
        pass: smtpPass,
        from: emailFromHeader,
        to: emailTos.join(", "),
        bcc: bccHeader,
        subject: emailSubject,
        text: notifyPlain,
        html: emailHtml,
      });
      // eslint-disable-next-line no-console
      console.log(
        `[notify] SMTP accepted message to ${emailTos.length} recipient(s). messageId=${mailInfo?.messageId || "(none)"}`
      );

      /** Gmail SMTP usually does not add a row in “Sent”; copy via IMAP APPEND unless disabled. */
      const appendRaw = (process.env.EMAIL_APPEND_SENT_IMAP || "").trim().toLowerCase();
      const isGmailSmtp = /gmail\.com/i.test(smtpHost);
      const imapSentOff = appendRaw === "0" || appendRaw === "false" || appendRaw === "no";
      const doImapSent =
        !imapSentOff &&
        (appendRaw === "1" ||
          appendRaw === "true" ||
          appendRaw === "yes" ||
          ((appendRaw === "" || appendRaw === "auto") && isGmailSmtp));
      if (doImapSent) {
        try {
          const rawMime = await buildRawMime({
            from: emailFromHeader,
            to: emailTos.join(", "),
            bcc: bccHeader,
            subject: emailSubject,
            text: notifyPlain,
            html: emailHtml,
          });
          const imapHost = (process.env.IMAP_HOST || "imap.gmail.com").trim();
          const imapUser = (process.env.IMAP_USER || smtpUser).trim();
          const imapPass = String(process.env.IMAP_PASS || smtpPass).trim();
          const sentBox = (process.env.IMAP_SENT_MAILBOX || "[Gmail]/Sent Mail").trim();
          await appendToImapMailbox({
            host: imapHost,
            user: imapUser,
            pass: imapPass,
            mailboxPath: sentBox,
            rawMime,
          });
          // eslint-disable-next-line no-console
          console.log(`IMAP: saved copy to "${sentBox}" (${imapHost}).`);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(
            "IMAP Sent copy failed (email was still delivered). Enable IMAP on the Gmail account; set EMAIL_APPEND_SENT_IMAP=0 to skip.",
            e.message || e
          );
        }
      }
    } else if (!sentViaResend && !resendReady && !smtpReady) {
    // eslint-disable-next-line no-console
    console.log(
      "Email skipped — add repository secret RESEND_API_KEY (Resend.com, free tier) or SMTP_HOST + SMTP_USER + SMTP_PASS + From (EMAIL_FROM or SMTP_USER)."
    );
    }
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
