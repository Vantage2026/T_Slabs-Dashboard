# Engineering Review: CEO Pulse & Portfolio Command Center Redesign

**Author:** Emmy, Principal Engineer  
**Date:** February 20, 2026  
**Status:** Engineering Review Complete  
**Input Document:** jeff/CEO_PULSE_PORTFOLIO_REDESIGN.md

---

## Executive Summary

Jeff's best work yet. The "change-first, not state-first" insight is genuinely good product thinking and it aligns well with the data infrastructure we just built (dependency sync, timeline intelligence, drift tracking). Most of what he's proposing is achievable with the data we already have.

**But** — and you knew this was coming — about 40% of this spec requires infrastructure we haven't built yet, and Jeff buries that fact under beautiful ASCII mockups. Let me separate what we can ship now from what needs groundwork.

**My recommendation:** Ship a strong Phase 1 that delivers the core innovations (confidence score, delta view, health matrix table, expandable rows) without the features that need weeks of infrastructure work. The sparklines, trend charts, and team heatmap need the `ReportSnapshot` persistence layer and historical data accumulation — they literally can't work on day one.

---

## A. What We Can Build Right Now (Data Already Exists)

### 1. Portfolio Confidence Score ✅

Jeff's algorithm is sound. We have all four inputs:
- **Health scores** — already computed per-project in both reports
- **Drift data** — `driftDays` and `driftDirection` on every Task, computed by timeline intelligence
- **Dependency risk** — `TaskDependency` table with resolved blocking chains
- **Velocity** — derivable from `Task.completedAt` timestamps (count per week per project)

One correction to Jeff's formula: his weights sum to 1.0, which is correct, but his `normalizedVelocityTrend` definition is vague. Here's how to actually compute it:

```typescript
function computeVelocityTrend(tasks: { completedAt: string | null; projectId: string }[]): number {
  const now = new Date();
  const weeks = [0, 1, 2, 3].map((w) => {
    const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
    return tasks.filter((t) =>
      t.completedAt &&
      new Date(t.completedAt) >= weekStart &&
      new Date(t.completedAt) < weekEnd
    ).length;
  });
  // weeks[0] = this week, weeks[3] = 4 weeks ago
  const recent = (weeks[0] + weeks[1]) / 2;
  const older = (weeks[2] + weeks[3]) / 2;
  if (older === 0) return recent > 0 ? 100 : 50; // no baseline
  const delta = (recent - older) / older;
  return Math.max(0, Math.min(100, 50 + delta * 50)); // normalize to 0-100
}
```

**Estimate:** S (half day) — it's a pure computation function with no new data requirements.

### 2. Natural Language Headline ✅

This is string interpolation, not AI. Jeff's examples are all template-able:

```typescript
function generateHeadline(confidence: number, delta: number, problemProjects: Project[]): string {
  if (confidence >= 80 && delta >= 0) {
    return `Portfolio is on track. Confidence: ${confidence}%.`;
  }
  if (delta > 5) {
    return `Strong week: confidence up ${delta} points to ${confidence}%.`;
  }
  if (problemProjects.length > 0) {
    const names = problemProjects.slice(0, 2).map(p => p.name).join(" and ");
    return `${problemProjects.length} project${problemProjects.length > 1 ? "s" : ""} need attention — ${names}.`;
  }
  return `Portfolio at ${confidence}% confidence. Stable.`;
}
```

Don't overthink this. Templates with conditional logic. Save AI-generated summaries for a later iteration when we actually have an LLM integration.

**Estimate:** XS (1-2 hours).

### 3. Health Matrix Table (Portfolio Command Center) ✅

Jeff is right that a table beats cards for comparison. The data for every column already exists:

| Column | Data Source | Status |
|---|---|---|
| Project name + status | Project model + computed health | ✅ Have it |
| Health score | computeCriticalPath + health formula | ✅ Have it |
| Completion % | Task status counts | ✅ Have it |
| Drift | Task.driftDays (avg across project tasks) | ✅ Have it |
| Blockers | Task WHERE status = "blocked" | ✅ Have it |
| Velocity sparkline | Task.completedAt grouped by week | ⚠️ Computable but no chart component |

The sparklines are the one tricky part. We're not going to install a full charting library for a 40px-wide line. Use inline SVG — it's literally 4 points connected by a polyline:

```tsx
function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 48, h = 16;
  const points = data.map((v, i) =>
    `${(i / (data.length - 1)) * w},${h - (v / max) * h}`
  ).join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
```

No library needed. 15 lines of code.

**Estimate:** M (2-3 days) — table component, sorting, inline visualizations, responsive collapse.

### 4. Expandable Row Detail ✅

When you click ⌄ on a project row, it expands inline to show:
- Task breakdown by status (we have this)
- Baseline vs projected dates (we have this from timeline intelligence)
- Drift trend (we have driftDays)
- Top risks: blocked tasks + critical path items (we have this from computeCriticalPath)
- Critical path chain (we have this, but need to query TaskDependency for the chain display)

The critical path chain display is new but simple. Query:

```typescript
const chain = await prisma.taskDependency.findMany({
  where: {
    sourceTaskId: { in: projectTaskIds },
    dependencyType: "blocks",
    targetTaskId: { not: null },
  },
  include: {
    sourceTask: { select: { id: true, title: true, status: true } },
    targetTask: { select: { id: true, title: true, status: true } },
  },
});
```

Then walk the chain to display: `Task A → Task B → Task C`.

**Estimate:** M (2-3 days) — expand/collapse UI, data fetching, critical path chain rendering.

### 5. Dependency Risk Map ✅

Jeff's ASCII mockup of this is actually close to what we should build. We have the `TaskDependency` table with resolved cross-project blocking chains. The visual is a horizontal node graph — each node is a task (or project), connected by arrows.

**Important simplification:** Don't build a general-purpose graph visualization. Build a **linear chain display**. Find the longest blocking chain per cluster, render it as a horizontal sequence. This covers 95% of real dependency patterns and avoids the rendering nightmare of arbitrary DAG layouts.

```
Platform Auth ──blocks──→ API Migration ──blocks──→ User Rollout
[+4d late]                [+12d projected]           [at risk]
```

Each node is clickable → goes to that task or project. Color-coded by drift status.

**Estimate:** M (2-3 days).

### 6. "What Changed" Delta View ⚠️ (Partial)

This is where Jeff's spec gets tricky. To show "what changed since last time," we need to know what "last time" looked like. That requires the `ReportSnapshot` model.

**But** — we can ship a useful V1 without snapshots by using data we already have:

- **Timeline events** from the last 7 days → "API Migration slipped 4 days"
- **Task status transitions** → "Mobile App: 5 blockers resolved" (count tasks that moved from blocked to non-blocked recently, using `updatedAt`)
- **New critical tasks** → "Platform: 3 new critical-priority tasks added" (tasks with `createdAt` in last 7 days and priority = critical/high)
- **Project completion milestones** → "Design System v2: completed" (projects that crossed 100% recently)

This gives us 80% of Jeff's "What Changed" without the snapshot infrastructure. The deltas won't be exact ("confidence went from 72 to 78") but they'll be directionally useful ("3 blockers resolved this week").

**Estimate:** S-M (1-2 days) for the timeline-event-based approach.

---

## B. What Needs Infrastructure First (Build Later)

### 1. ReportSnapshot Model — Skip for now

Jeff wants to store full report state on every load. This is the right long-term approach, but it's premature:

- We don't have a retention policy implemented
- Storing JSON blobs per workspace per day will grow fast
- The snapshot diff logic is non-trivial
- We can get 80% of the value from timeline events (see above)

**When to build:** After Phase 1 ships and we confirm users actually care about the "compared to last week" feature. If they do, invest in snapshots. If they don't, we saved weeks of work.

### 2. Health History / Trend Charts — Skip for now

The "Portfolio Health Over Time" line chart requires 4+ weeks of historical data that we don't have. Even if we build the snapshot model today, we won't have enough data points to render a useful trend for a month.

**When to build:** 4 weeks after ReportSnapshot ships.

### 3. Team Heatmap — Ship simplified

Jeff's full heatmap (person × project matrix with color intensity) is useful but heavy. The data exists (Task.assigneeName × Task.projectId), but the rendering is complex and the interaction model (click a cell to filter) requires significant state management.

**Simplified V1:** Instead of a full matrix, show a **"Workload Alerts"** list — just surface the outliers:

```
⚠️  Sarah Chen — 11 active tasks across 2 projects (API Migration: 8, Platform: 3)
⚠️  5 unassigned tasks on critical path (API Migration: 3, Platform: 2)
```

This surfaces the same insight (who's overloaded, what's unassigned) without the matrix rendering complexity. It's a filtered list, not a heatmap. 

**Estimate for simplified version:** S (half day).

**When to build full heatmap:** Phase 3, after we validate that workload visibility matters to users.

### 4. PDF Export / Scheduled Email with Inline Content — Skip for now

We already have `ReportSchedule` infrastructure and email delivery via Resend. But rendering a full report as inline email HTML or PDF is a separate project. Not Phase 1.

---

## C. Technical Recommendations for Implementation

### File Structure

```
src/lib/reports/
├── confidence.ts           // Portfolio confidence score computation
├── headline.ts             // Natural language headline generation
├── delta.ts                // "What Changed" computation from timeline events
├── portfolio-metrics.ts    // Per-project health, drift, velocity, blockers
└── types.ts                // Shared types for report data

src/components/reports/
├── confidence-meter.tsx    // Horizontal confidence bar with gradient
├── mini-sparkline.tsx      // Inline SVG sparkline (no library)
├── health-matrix.tsx       // Sortable table with inline visualizations
├── health-matrix-row.tsx   // Single row, handles expand/collapse
├── expanded-detail.tsx     // Expanded row content (task breakdown, timeline, risks)
├── delta-list.tsx          // "What Changed" items
├── dependency-chain.tsx    // Linear chain display for dependency risk map
├── workload-alerts.tsx     // Simplified team workload outliers
└── (existing files stay)
```

### API Changes

**No new API routes needed for Phase 1.** All data comes from the existing workspace data hook (`useWorkspaceData`) plus two new client-side computation functions:
- `computePortfolioConfidence()` — runs client-side, same pattern as existing `computeCEOData()`
- `computeDeltaEvents()` — needs one new query: recent timeline events

**One new API route needed:**

```
GET /api/reports/timeline-events?workspaceId=X&since=YYYY-MM-DD
```

Returns recent `TimelineEvent` rows for the workspace (for the "What Changed" section). This is a simple Prisma query:

```typescript
const events = await prisma.timelineEvent.findMany({
  where: {
    task: { project: { workspaceId } },
    createdAt: { gte: sinceDate },
  },
  include: {
    task: { select: { id: true, title: true, projectId: true, project: { select: { name: true } } } },
  },
  orderBy: { createdAt: "desc" },
  take: 20,
});
```

### Schema Change

**Add to `WorkspaceTask` type** (the hook's return type, not the DB):

```typescript
// Already available from Task model, just not included in the hook's select:
completedAt: string | null;  // ← Need this for velocity computation
```

Make sure `useWorkspaceData` includes `completedAt` in its task select.

### Build Order

```
Day 1:  Confidence score computation + headline generation + confidence meter component
Day 2:  Health matrix table component with sorting + mini sparkline
Day 3:  Expandable row detail + dependency chain display
Day 4:  "What Changed" delta computation + delta list component + workload alerts
Day 5:  Wire into Executive Pulse page + Portfolio Command Center page
Day 6:  Mobile responsive adjustments + hover interactions + polish
```

**Total estimate: M-L (6 working days), medium confidence (×1.3) = ~8 days.**

### Performance Considerations

1. **All computation is client-side.** We're already loading all tasks via `useWorkspaceData`. The confidence score, velocity, and delta computations add negligible overhead (<50ms even with 1000 tasks).

2. **Sparklines are inline SVG.** No canvas, no chart library, no bundle size impact.

3. **Expanded rows load lazily.** Don't fetch dependency chain data until the row is expanded. Use the existing data for the summary, only hit the API for the chain visualization when needed.

4. **The timeline events endpoint should be cached.** Add a 60-second SWR cache — delta data doesn't need to be real-time.

### What Jeff Got Right

- Change-first reporting — genuinely differentiated approach
- Table over cards for the portfolio view — correct for comparison
- Confidence score as a continuous metric — better than traffic lights
- Everything-is-clickable philosophy — this is how modern tools work
- Progressive depth (CEO 60s → VP 5min) — good IA thinking

### What Jeff Got Wrong

- **Sparklines are not "the single most important addition."** The confidence score with delta is more valuable. A trend without context is still noise. Sparklines are polish, not substance.
- **The team heatmap is over-designed.** A simple alert list ("Sarah has 11 tasks") delivers the same insight with 10% of the complexity.
- **PDF export in Phase 3 is too early.** No one will use it. Screenshot + Slack is how people share dashboards in 2026.
- **"AI-generated natural-language summary"** — Jeff didn't explicitly call for LLM, but the phrasing is suggestive. Templates are fine. Don't add an LLM dependency for string interpolation.

### What Jeff Missed

1. **No loading states specified.** The expanded row detail needs a skeleton loader while dependency data loads. The confidence meter needs an animated fill-in on first paint.

2. **No error states.** What happens when timeline events fail to load? When a project has no tasks? When drift data is missing? Every component needs a fallback.

3. **Keyboard navigation.** The health matrix table needs arrow key navigation and Enter-to-expand. Accessibility isn't optional.

4. **URL state.** When someone expands a project row or switches intelligence tabs, the URL should update. Users share report links in Slack — the recipient should see the same view. Use `searchParams` for `?expanded=proj_123&tab=dependencies`.

---

## D. Final Recommendation

**Build it in this order, ship after day 5, polish on day 6:**

1. `src/lib/reports/confidence.ts` — confidence score + velocity computation
2. `src/lib/reports/headline.ts` — template-based headline generation
3. `src/lib/reports/delta.ts` — "What Changed" from timeline events + task transitions
4. `src/lib/reports/portfolio-metrics.ts` — per-project health matrix data
5. `src/components/reports/confidence-meter.tsx` — horizontal gradient bar
6. `src/components/reports/mini-sparkline.tsx` — inline SVG, no deps
7. `src/components/reports/health-matrix.tsx` + `health-matrix-row.tsx` — sortable table
8. `src/components/reports/expanded-detail.tsx` — inline expand with task breakdown + chain
9. `src/components/reports/delta-list.tsx` — "What Changed" items
10. `src/components/reports/dependency-chain.tsx` — linear blocking chain display
11. `src/components/reports/workload-alerts.tsx` — overloaded/unassigned alerts
12. Rewrite `ceo-pulse/page.tsx` → Executive Pulse
13. Rewrite `portfolio/page.tsx` → Portfolio Command Center
14. Add `GET /api/reports/timeline-events` endpoint
15. Update `useWorkspaceData` to include `completedAt`

Skip for now: ReportSnapshot model, full trend charts, team heatmap matrix, PDF export.

Build them when we have data proving users engage with the delta/trend features.

---

*Ship the 80% that works with data we have. Build the 20% that needs infrastructure after we validate demand. That's how you avoid building a beautiful dashboard no one uses.*

**— Emmy** ⚡
