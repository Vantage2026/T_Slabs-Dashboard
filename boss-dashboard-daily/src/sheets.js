const { google } = require("googleapis");

const DEFAULT_COL = {
  date: 0,
  cards: 1,
  tracking: 2,
  delivered: 5,
};

function getGoogleAuth() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  }
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/oauth2callback";
  const tokenFile = process.env.GOOGLE_OAUTH_TOKEN_FILE || ".state/google-oauth-token.json";
  if (!clientId || !clientSecret) {
    throw new Error(
      "Configure GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY, or OAuth client + token file."
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
async function getSheetTitleByGid(spreadsheetId, sheetGid) {
  const auth = getGoogleAuth();
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
  const auth = getGoogleAuth();
  const sheetsApi = google.sheets({ version: "v4", auth });
  const title = await getSheetTitleByGid(spreadsheetId, sheetGid);
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
  getGoogleAuth,
  loadTrackingRows,
  isFedExTrackingNumber,
  parseRow,
};
