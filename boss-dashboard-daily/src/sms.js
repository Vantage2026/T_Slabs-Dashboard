/**
 * Send SMS via Twilio REST (no extra npm dependency).
 */
async function sendTwilioSmsFetch({ to, from, body, mediaUrl }) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error("Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.");
  }
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const params = new URLSearchParams({ To: to, From: from, Body: body });
  if (mediaUrl) {
    params.append("MediaUrl", mediaUrl);
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Twilio ${res.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text);
}

module.exports = { sendTwilioSmsFetch };
