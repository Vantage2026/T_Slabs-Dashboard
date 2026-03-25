const nodemailer = require("nodemailer");

function smtpPortNumber(port) {
  const n = Number.parseInt(String(port ?? "").trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : 587;
}

/**
 * Send mail via SMTP (Gmail, Outlook, etc.). No per-message fee beyond your mailbox/provider.
 */
async function sendSmtpMail({
  host,
  port,
  secure,
  user,
  pass,
  from,
  to,
  bcc,
  subject,
  text,
  html,
}) {
  const p = smtpPortNumber(port);
  const useTls = secure === true || secure === "true";
  const transporter = nodemailer.createTransport({
    host,
    port: p,
    secure: useTls,
    requireTLS: !useTls && p === 587,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: true },
  });
  try {
    await transporter.verify();
  } catch (e) {
    const hint =
      /gmail\.com/i.test(host) && /Invalid login|535|534/i.test(String(e.message || e))
        ? " For Gmail use an app password (2FA), not your normal password; Actions IPs are sometimes blocked—try SendGrid SMTP or another provider if this persists."
        : "";
    const err = new Error(`SMTP verify failed: ${e.message || e}.${hint}`);
    err.cause = e;
    throw err;
  }
  try {
    const info = await transporter.sendMail({
      from,
      to,
      bcc,
      subject,
      text,
      html,
    });
    return info;
  } catch (e) {
    const hint =
      /gmail\.com/i.test(host) && /535|534|not accepted|Application-specific/i.test(String(e.message || e))
        ? " Check Gmail app password and that From matches the mailbox or a verified send-as address."
        : "";
    const err = new Error(`SMTP send failed: ${e.message || e}.${hint}`);
    err.cause = e;
    throw err;
  }
}

/** RFC822 bytes — use for IMAP append to Sent (Gmail SMTP often does not file Sent). */
function buildRawMime({ from, to, bcc, subject, text, html, date }) {
  const MailComposer = require("nodemailer/lib/mail-composer");
  const mail = new MailComposer({
    from,
    to,
    bcc,
    subject,
    text,
    html,
    date: date || new Date(),
  });
  return new Promise((resolve, reject) => {
    mail.compile().build((err, message) => {
      if (err) reject(err);
      else resolve(message);
    });
  });
}

module.exports = { sendSmtpMail, buildRawMime, smtpPortNumber };
