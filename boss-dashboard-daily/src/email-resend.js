/**
 * Resend HTTP API — works from GitHub Actions when Gmail SMTP is blocked.
 * https://resend.com/docs/api-reference/emails/send-email
 */
async function sendResendEmail({ apiKey, from, toAddresses, subject, text, html }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: toAddresses,
      subject,
      text,
      html,
    }),
  });
  const raw = await res.text();
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    json = { raw };
  }
  if (!res.ok) {
    const msg = typeof json === "object" && json.message ? json.message : raw;
    throw new Error(`Resend ${res.status}: ${String(msg).slice(0, 600)}`);
  }
  return json;
}

module.exports = { sendResendEmail };
