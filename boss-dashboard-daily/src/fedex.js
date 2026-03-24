const crypto = require("node:crypto");

const FEDEX_SANDBOX = "https://apis-sandbox.fedex.com";
const FEDEX_PROD = "https://apis.fedex.com";

function getBaseUrl() {
  if (process.env.FEDEX_USE_SANDBOX === "1" || process.env.FEDEX_USE_SANDBOX === "true") {
    return FEDEX_SANDBOX;
  }
  return FEDEX_PROD;
}

let tokenCache = { accessToken: null, expiresAt: 0 };

async function getFedExAccessToken() {
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const clientId = process.env.FEDEX_API_KEY || process.env.FEDEX_CLIENT_ID;
  const clientSecret = process.env.FEDEX_SECRET_KEY || process.env.FEDEX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Set FEDEX_API_KEY and FEDEX_SECRET_KEY (FedEx Developer Portal client credentials)."
    );
  }

  const base = getBaseUrl();
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${base}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FedEx OAuth failed ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = await res.json();
  const accessToken = json.access_token;
  const expiresIn = Number(json.expires_in) || 3600;
  tokenCache = {
    accessToken,
    expiresAt: now + expiresIn * 1000,
  };
  return accessToken;
}

/**
 * Normalize FedEx track API response into a short human line.
 */
function summarizeTrackPayload(payload, trackingNumber) {
  const ctr =
    payload?.output?.completeTrackResults ||
    payload?.completeTrackResults ||
    [];
  const first = ctr[0]?.trackResults?.[0];
  if (!first) {
    const errs =
      payload?.errors ||
      payload?.output?.errors ||
      ctr[0]?.errors ||
      ctr[0]?.error;
    const list = Array.isArray(errs) ? errs : errs ? [errs] : [];
    if (list.length) {
      const msg = list.map((e) => e.message || e.code || String(e)).join("; ");
      return { ok: false, line: `${trackingNumber} — ${msg}` };
    }
    return { ok: false, line: `${trackingNumber} — No tracking data` };
  }

  const latest = first.latestStatusDetail || {};
  const status =
    latest.statusByLocale ||
    latest.description ||
    latest.derivedCode ||
    latest.code ||
    "In transit";

  let city = "";
  let state = "";
  const scanLoc =
    latest.scanLocation ||
    latest.serviceCenterLocation?.locationContactAndAddress?.address;
  if (scanLoc) {
    city = scanLoc.city || scanLoc.cityName || "";
    state = scanLoc.stateOrProvinceCode || scanLoc.stateOrProvince || "";
  }
  if (!city && Array.isArray(first.scanEvents) && first.scanEvents.length) {
    const ev = first.scanEvents[0];
    const loc = ev?.scanLocation || {};
    city = loc.city || "";
    state = loc.stateOrProvinceCode || loc.stateOrProvince || "";
  }

  const where = [city, state].filter(Boolean).join(", ");
  const line = where
    ? `${trackingNumber} — ${status}, ${where}`
    : `${trackingNumber} — ${status}`;

  return { ok: true, line, raw: first };
}

async function trackOne(trackingNumber) {
  const token = await getFedExAccessToken();
  const base = getBaseUrl();
  const body = {
    includeDetailedScans: false,
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber: String(trackingNumber).replace(/\s/g, ""),
        },
      },
    ],
  };

  const res = await fetch(`${base}/track/v1/trackingnumbers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-locale": "en_US",
      "X-customer-transaction-id": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return summarizeTrackPayload(null, trackingNumber);
  }

  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || text.slice(0, 200);
    return { ok: false, line: `${trackingNumber} — API ${res.status}: ${msg}` };
  }

  return summarizeTrackPayload(json, trackingNumber);
}

module.exports = {
  getFedExAccessToken,
  trackOne,
  summarizeTrackPayload,
};
