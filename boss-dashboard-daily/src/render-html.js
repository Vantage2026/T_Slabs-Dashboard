function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatCards(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US");
}

/**
 * @param {{ generatedAt: Date, items: Array<{ sourceLabel: string, date: string, cards: number|null, tracking: string, delivered: boolean, statusLine: string, trackUrl?: string }> }} data
 */
function renderDashboardHtml(data) {
  const title = "Card shipments";
  const when = data.generatedAt.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const rows = data.items
    .map((item) => {
      const badge = item.delivered
        ? '<span class="badge delivered">Delivered</span>'
        : '<span class="badge active">In transit</span>';
      const cards = formatCards(item.cards);
      const href = item.trackUrl ? escapeHtml(item.trackUrl) : "";
      const trackingBlock = href
        ? `<a class="tracking tracking-link" href="${href}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.tracking)}</a>`
        : `<span class="tracking mono">${escapeHtml(item.tracking)}</span>`;
      const fedexBtn = href
        ? `<a class="fedex-btn" href="${href}" target="_blank" rel="noopener noreferrer">Open on FedEx</a>`
        : "";
      const statusInner = `${escapeHtml(item.statusLine)}${fedexBtn ? ` ${fedexBtn}` : ""}`;
      return `
      <article class="card">
        <div class="card-top">
          <span class="source">${escapeHtml(item.sourceLabel)}</span>
          ${badge}
        </div>
        ${trackingBlock}
        <p class="status">${statusInner}</p>
        <div class="meta">
          <span class="cards"><strong>${cards}</strong> cards</span>
          <span class="date">${escapeHtml(item.date || "—")}</span>
        </div>
      </article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0f1419" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #0a0e14;
      --surface: #151c28;
      --border: #2a3544;
      --text: #eef3f8;
      --muted: #8b9cae;
      --accent: #5eb0ff;
      --accent-dim: rgba(94, 176, 255, 0.14);
      --success: #3dd68c;
      --radius: 16px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      min-height: 100dvh;
      background:
        radial-gradient(ellipse 140% 80% at 50% -20%, rgba(61, 139, 253, 0.22) 0%, transparent 55%),
        radial-gradient(ellipse 100% 50% at 100% 50%, rgba(52, 199, 89, 0.06) 0%, transparent 45%),
        var(--bg);
      color: var(--text);
      line-height: 1.45;
      -webkit-font-smoothing: antialiased;
    }
    .wrap {
      max-width: 520px;
      margin: 0 auto;
      padding: 1.25rem 1rem 2.5rem;
    }
    header {
      margin-bottom: 1.25rem;
    }
    h1 {
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 0.35rem;
    }
    .when {
      font-size: 0.85rem;
      color: var(--muted);
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.05rem 1.15rem;
      margin-bottom: 0.9rem;
      box-shadow: 0 12px 40px rgba(0,0,0,0.35);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .source {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }
    .badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.2rem 0.5rem;
      border-radius: 999px;
    }
    .badge.delivered {
      background: rgba(52, 199, 89, 0.15);
      color: var(--success);
      border: 1px solid rgba(52, 199, 89, 0.35);
    }
    .badge.active {
      background: rgba(61, 139, 253, 0.12);
      color: var(--accent);
      border: 1px solid rgba(61, 139, 253, 0.35);
    }
    .tracking, .tracking.mono {
      display: block;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      word-break: break-all;
      margin-bottom: 0.55rem;
      line-height: 1.35;
    }
    a.tracking-link {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid rgba(94, 176, 255, 0.35);
      padding-bottom: 1px;
    }
    a.tracking-link:active {
      opacity: 0.85;
    }
    .status {
      margin: 0 0 0.65rem;
      font-size: 0.95rem;
      color: var(--text);
    }
    .fedex-btn {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.45rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--accent);
      background: var(--accent-dim);
      border: 1px solid rgba(94, 176, 255, 0.35);
      border-radius: 999px;
      text-decoration: none;
    }
    .fedex-btn:active {
      transform: scale(0.98);
    }
    .meta {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 0.85rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
      padding-top: 0.65rem;
    }
    .cards strong { color: var(--text); }
    footer {
      text-align: center;
      font-size: 0.75rem;
      color: var(--muted);
      margin-top: 1.5rem;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>${escapeHtml(title)}</h1>
      <p class="when">${escapeHtml(when)}</p>
    </header>
    <main>
      ${rows || '<p class="when">No FedEx rows found in the tracking tabs.</p>'}
    </main>
    <footer>Tap tracking # or Open on FedEx for live status</footer>
  </div>
</body>
</html>`;
}

module.exports = { renderDashboardHtml, escapeHtml };
