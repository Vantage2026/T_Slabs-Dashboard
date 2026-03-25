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
    subject,
    text,
    html,
  });
}

module.exports = { sendSmtpMail };
