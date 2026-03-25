const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";

const DEFAULT_COL = {
  date: 0,
  cards: 1,
  tracking: 2,
  delivered: 5,
};

/**
 * Path to ADC file (WIF or key). Auth action may set GOOGLE_APPLICATION_CREDENTIALS and/or GOOGLE_GHA_CREDS_PATH.
 */
function getAdcCredentialPath() {
  return (
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_GHA_CREDS_PATH ||
    process.env.CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE ||
    ""
  ).trim();
}

/**
 * Auth order:
 * 1) Application Default Credentials (GitHub Actions + google-github-actions/auth WIF)
 * 2) Service account JWT (GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY) — local / legacy CI
 * 3) OAuth token file
 */
async function getGoogleAuthClient() {
  const adcPath = getAdcCredentialPath();
  if (adcPath) {
    const auth = new GoogleAuth({ scopes: [SHEETS_SCOPE], keyFilename: adcPath });
    return auth.getClient();
  }

  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: [SHEETS_SCOPE],
    });
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/oauth2callback";
  const tokenFile = process.env.GOOGLE_OAUTH_TOKEN_FILE || ".state/google-oauth-token.json";
  if (!clientId || !clientSecret) {
    throw new Error(
      "Google auth: set WIF/ADC (GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_GHA_CREDS_PATH from google-github-actions/auth), or GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY, or OAuth client + token file."
    );
  }
  const fs = require("node:fs");
  const path = require("node:path");
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const tokenPath = path.resolve(process.cwd(), tokenFile);
  const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
  oauth2.setCredentials(token);
  return oauth2;
}

/**
 * Resolve sheet tab title from numeric gid (from spreadsheet URL).
 */
async function getSheetTitleByGid(spreadsheetId, sheetGid, auth) {
  const sheetsApi = google.sheets({ version: "v4", auth });
  const { data } = await sheetsApi.spreadsheets.get({ spreadsheetId });
  const gid = Number.parseInt(String(sheetGid), 10);
  const sheet = data.sheets?.find((s) => s.properties?.sheetId === gid);
  if (!sheet?.properties?.title) {
    throw new Error(`No sheet with gid ${sheetGid} in ${spreadsheetId}`);
  }
  return sheet.properties.title;
}

function escapeSheetTitle(title) {
  return `'${String(title).replace(/'/g, "''")}'`;
}

function normHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Infer column indices from header row; fall back to A,B,C,F style defaults.
 */
function inferColumns(headerRow) {
  const envDate = process.env.COL_DATE_INDEX;
  const envCards = process.env.COL_CARDS_INDEX;
  const envTrack = process.env.COL_TRACKING_INDEX;
  const envDel = process.env.COL_DELIVERED_INDEX;
  if (envDate != null && envCards != null && envTrack != null && envDel != null) {
    return {
      date: Number.parseInt(envDate, 10),
      cards: Number.parseInt(envCards, 10),
      tracking: Number.parseInt(envTrack, 10),
      delivered: Number.parseInt(envDel, 10),
    };
  }

  const headers = (headerRow || []).map(normHeader);
  let dateIdx = headers.findIndex((h) => /^date$/i.test(h));
  let cardsIdx = headers.findIndex((h) =>
    /^(number of cards|# of cards|cards|card count|枚数|カード枚数)$/.test(h)
  );
  let trackIdx = headers.findIndex((h) => /tracking/.test(h));
  let delIdx = headers.findIndex((h) => /delivered/.test(h));

  if (dateIdx < 0) dateIdx = DEFAULT_COL.date;
  if (cardsIdx < 0) cardsIdx = DEFAULT_COL.cards;
  if (trackIdx < 0) trackIdx = DEFAULT_COL.tracking;
  if (delIdx < 0) delIdx = DEFAULT_COL.delivered;

  return { date: dateIdx, cards: cardsIdx, tracking: trackIdx, delivered: delIdx };
}

function parseRow(row, col, sourceLabel) {
  const date = row[col.date] != null ? String(row[col.date]).trim() : "";
  const cardsRaw = row[col.cards];
  const tracking = row[col.tracking] != null ? String(row[col.tracking]).trim() : "";
  const deliveredCell =
    row[col.delivered] != null ? String(row[col.delivered]).trim() : "";

  const cardsNum =
    typeof cardsRaw === "number" && !Number.isNaN(cardsRaw)
      ? cardsRaw
      : Number(String(cardsRaw).replace(/,/g, ""));
  const cards = Number.isFinite(cardsNum) ? Math.round(cardsNum) : null;

  const delivered = /^y$/i.test(deliveredCell);

  return {
    sourceLabel,
    date,
    cards,
    tracking,
    delivered,
    deliveredCell,
  };
}

/** Google Sheets / Excel serial day → Date (UTC noon on that civil day). */
function serialToDate(serial) {
  const whole = Math.floor(Number(serial));
  const epoch = Date.UTC(1899, 11, 30);
  return new Date(epoch + whole * 86400000);
}

/**
 * Parse a sheet Date cell (string M/D/Y, ISO, or numeric serial as string/number).
 */
function parseSheetDateValue(raw) {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw > 200 && raw < 800000) return serialToDate(raw);
    return null;
  }
  const s = String(raw).trim();
  if (!s) return null;
  if (/^\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    if (n > 200 && n < 800000) return serialToDate(n);
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
    if (!Number.isNaN(d.getTime())) return d;
  }
  const mdY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
  if (mdY) {
    let y = Number(mdY[3]);
    if (mdY[3].length <= 2 && y < 100) y += y < 50 ? 2000 : 1900;
    const mo = Number(mdY[1]);
    const day = Number(mdY[2]);
    const d = new Date(y, mo - 1, day);
    if (!Number.isNaN(d.getTime())) return d;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d;
  return null;
}

function calendarDateInTimeZone(date, timeZone) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** YYYY-MM-DD minus n calendar days (naive Gregorian, stable for comparisons). */
function civilDateMinusDays(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  const u = Date.UTC(y, m - 1, d) - n * 86400000;
  const x = new Date(u);
  return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}-${String(x.getUTCDate()).padStart(2, "0")}`;
}

/**
 * Keep rows whose Date column falls within the last `days` calendar days in `timeZone` (inclusive of cutoff day).
 * Rows with missing/unparseable dates are kept so bad sheet data is not hidden silently.
 */
function filterRowsWithinDays(rows, days, timeZone) {
  if (!rows.length || days <= 0) return rows;
  const today = calendarDateInTimeZone(new Date(), timeZone);
  if (!today) return rows;
  const cutoff = civilDateMinusDays(today, days);
  return rows.filter((row) => {
    const dt = parseSheetDateValue(row.date);
    if (!dt) return true;
    const rowDay = calendarDateInTimeZone(dt, timeZone);
    if (!rowDay) return true;
    return rowDay >= cutoff;
  });
}

function isFedExTrackingNumber(s) {
  if (!s || s.length < 10) return false;
  if (/^#/.test(s)) return false;
  if (/ref/i.test(s)) return false;
  return /^\d{10,14}$/.test(s.replace(/\s/g, ""));
}

/**
 * Load tracking rows from one spreadsheet tab (by gid).
 */
async function loadTrackingRows(spreadsheetId, sheetGid, sourceLabel) {
  const auth = await getGoogleAuthClient();
  const sheetsApi = google.sheets({ version: "v4", auth });
  const title = await getSheetTitleByGid(spreadsheetId, sheetGid, auth);
  const range = `${escapeSheetTitle(title)}!A:Z`;
  const { data } = await sheetsApi.spreadsheets.values.get({ spreadsheetId, range });
  const values = data.values || [];
  if (values.length < 2) return [];

  const col = inferColumns(values[0]);
  const rows = [];
  for (let i = 1; i < values.length; i += 1) {
    const row = values[i] || [];
    const parsed = parseRow(row, col, sourceLabel);
    if (!parsed.tracking && !parsed.date) continue;
    if (!isFedExTrackingNumber(parsed.tracking)) continue;
    rows.push({ ...parsed, rowIndex: i + 1 });
  }
  return rows;
}

module.exports = {
  getGoogleAuthClient,
  loadTrackingRows,
  isFedExTrackingNumber,
  parseRow,
  filterRowsWithinDays,
  parseSheetDateValue,
};
