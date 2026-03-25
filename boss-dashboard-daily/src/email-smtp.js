const nodemailer = require("nodemailer");

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
  const transporter = nodemailer.createTransport({
    host,
    port: Number(port) || 587,
    secure: secure === true || secure === "true",
    auth: user && pass ? { user, pass } : undefined,
  });
  await transporter.sendMail({
    from,
    to,
    bcc,
    subject,
    text,
    html,
  });
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

module.exports = { sendSmtpMail, buildRawMime };
