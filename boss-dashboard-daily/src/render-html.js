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
 * @param {{ generatedAt: Date, items: Array<{ sourceLabel: string, date: string, cards: number|null, tracking: string, delivered: boolean, statusLine: string }> }} data
 */
function renderDashboardHtml(data) {
  const title = "Card shipments — tracking";
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
        : '<span class="badge active">In progress</span>';
      const cards = formatCards(item.cards);
      return `
      <article class="card">
        <div class="card-top">
          <span class="source">${escapeHtml(item.sourceLabel)}</span>
          ${badge}
        </div>
        <div class="tracking">${escapeHtml(item.tracking)}</div>
        <p class="status">${escapeHtml(item.statusLine)}</p>
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
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #0f1419;
      --surface: #1a2332;
      --border: #2d3a4d;
      --text: #e8eef4;
      --muted: #8b9cae;
      --accent: #3d8bfd;
      --success: #34c759;
      --radius: 14px;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(1200px 600px at 50% -10%, #1e3a5f 0%, var(--bg) 55%);
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
      padding: 1rem 1.1rem;
      margin-bottom: 0.85rem;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
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
    .tracking {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.95rem;
      word-break: break-all;
      color: #b8d4ff;
      margin-bottom: 0.45rem;
    }
    .status {
      margin: 0 0 0.65rem;
      font-size: 1rem;
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
    <footer>Automated tracking summary</footer>
  </div>
</body>
</html>`;
}

function buildSmsSummary(items) {
  const lines = items.map((item) => {
    const cards = formatCards(item.cards);
    const short = item.statusLine
      .replace(/^[\d\s]+[—\-]\s*/, "")
      .replace(new RegExp(`^${item.tracking}\\s*[—-]\\s*`), "")
      .trim();
    return `${item.tracking} - ${short}, ${cards} cards`;
  });
  const body = lines.join("\n");
  const max = 1500;
  if (body.length <= max) return body;
  return `${body.slice(0, max - 20)}…`;
}

module.exports = { renderDashboardHtml, buildSmsSummary, escapeHtml };
