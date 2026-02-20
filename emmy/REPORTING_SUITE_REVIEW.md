# Reporting Suite PRD — Technical Review
## Emmy's Engineering Assessment

**Author:** Emmy, Principal Engineer  
**Date:** February 11, 2026  
**Document Reviewed:** jeff/REPORTING_SUITE_PRD.md  
**Verdict:** Solid product vision, but significant data gaps and over-engineering. Ship 3 reports, not 6.

---

## Executive Summary

Jeff's PRD is ambitious and well-researched. The persona-based approach is correct — different stakeholders need different views. However:

1. **50% of the features require data we don't have.** Sprint tracking, velocity history, capacity scores, blocker durations — none of this exists in our schema.
2. **The PM Cockpit and Eng Lead Dashboard are nearly identical.** Merge them.
3. **Client Status report requires manual data entry** that doesn't exist today.
4. **Several dark mode classes will break.** Hardcoded shadow colors need fixing.

**My recommendation:** Build 3 reports (My Work, CEO Pulse, Portfolio), not 6. The rest are either blocked on missing data or redundant.

---

## 1. Technical Feasibility Analysis

### Data We Actually Have (from Prisma schema + use-workspace-data.ts)

| Data Point | Available? | Source |
|------------|------------|--------|
| Tasks with status/priority/type | ✅ Yes | `Task` model |
| Assignee name | ✅ Yes | `Task.assigneeName` |
| Due dates | ✅ Yes | `Task.dueDate` |
| Completion dates | ✅ Yes | `Task.completedAt` |
| Task hierarchy (parent/child) | ✅ Yes | `Task.parentId` |
| Project list | ✅ Yes | `Project` model |
| Blocked tasks | ✅ Yes | `Task.status === 'blocked'` |
| Overdue tasks | ✅ Yes | Computed from `dueDate < today` |
| Task counts by status | ✅ Yes | `useWorkspaceData().stats.byStatus` |
| Task counts by assignee | ✅ Yes | `useWorkspaceData().stats.byAssignee` |
| Recently completed | ✅ Yes | Tasks with `completedAt` in last 7 days |

### Data Jeff Assumes But We DON'T Have

| Data Point | Used In | Reality | Impact |
|------------|---------|---------|--------|
| Sprint dates (start/end) | PM Cockpit | ❌ Not in schema | Sprint progress bar impossible |
| Sprint number | PM Cockpit | ❌ Not in schema | "Sprint 14" label impossible |
| Days blocked | CEO Pulse, PM Cockpit | ❌ No status change history | Can only show "is blocked", not duration |
| Velocity history | PM Cockpit, Eng Lead | ❌ No historical tracking | Velocity trends impossible |
| Story points | PM Cockpit | ⚠️ In `Task.estimate` but rarely populated | Unreliable |
| Team capacity/utilization | Eng Lead Dashboard | ❌ Not tracked | "82% utilization" is fiction |
| Blocker reason text | PM Cockpit | ⚠️ Sometimes in Jira custom fields via `metadata` | Inconsistent |
| Project target date | Client Status | ❌ Not in schema | "On track for March 15" impossible |
| Milestones | Client Status | ❌ No milestone entity | Must infer from epics |
| Current user identity | My Work | ⚠️ Need to match session user to assigneeName | Fragile |
| User role (lead vs IC) | Access control | ⚠️ Only workspace roles exist | No project-level roles |

### Feasibility Verdict by Report

| Report | Feasibility | Blocker |
|--------|-------------|---------|
| **My Work (IC)** | ✅ Buildable | Need current user → assigneeName mapping |
| **CEO Pulse** | ✅ Buildable | "Days blocked" must become "is blocked" |
| **Director Portfolio** | ✅ Buildable | Health status already computed |
| **PM Cockpit** | ⚠️ Partial | No sprint data — becomes generic project view |
| **Eng Lead Dashboard** | ⚠️ Partial | No capacity data — becomes workload view (same as PM?) |
| **Client Status** | ❌ Blocked | No milestones, no target dates, needs manual entry |

---

## 2. Dark Mode Correctness

### ✅ Classes That Work

Jeff correctly uses semantic color tokens that auto-switch via CSS variables:

```tsx
// These are correct ✅
bg-success, text-success, bg-success-50, border-success-200
bg-warning, text-warning, bg-warning-50, border-warning-200  
bg-danger, text-danger, bg-danger-50, border-danger-200
bg-primary, text-primary, bg-primary-50
bg-neutral-100, bg-neutral-200, text-neutral-500, text-neutral-700, text-neutral-900
bg-white (handled by !important override)
```

### ❌ Classes That Will Break

**1. Hardcoded shadow glows in Traffic Light:**

```tsx
// Jeff's code (BROKEN in dark mode):
shadow-[0_0_30px_rgba(0,168,107,0.4)]  // Green glow
shadow-[0_0_30px_rgba(255,165,0,0.4)]  // Amber glow
shadow-[0_0_30px_rgba(230,57,70,0.4)]  // Red glow
```

These are hardcoded RGBA values. In dark mode, the light green glow will look muddy. The colors should be brighter on dark backgrounds.

**Fix:** Use CSS custom properties for glow colors, or define dark-mode-aware shadow classes in globals.css:

```css
/* Add to globals.css */
.glow-success { box-shadow: 0 0 30px rgba(0, 168, 107, 0.4); }
.glow-warning { box-shadow: 0 0 30px rgba(255, 165, 0, 0.4); }
.glow-danger { box-shadow: 0 0 30px rgba(230, 57, 70, 0.4); }

html[data-theme="dark"] .glow-success { box-shadow: 0 0 30px rgba(63, 185, 80, 0.5); }
html[data-theme="dark"] .glow-warning { box-shadow: 0 0 30px rgba(210, 153, 34, 0.5); }
html[data-theme="dark"] .glow-danger { box-shadow: 0 0 30px rgba(248, 81, 73, 0.5); }
```

**2. Sparkline chart colors in StatCard:**

Jeff shows sparklines using Recharts with hardcoded colors:
```tsx
const colorMap = {
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
};
```

**Problem:** These hex values are fixed. In dark mode, charts should use the brighter dark-mode variants.

**Fix:** Read CSS variable values at runtime:
```tsx
const getChartColor = (status: string) => {
  const style = getComputedStyle(document.documentElement);
  switch (status) {
    case 'green': return style.getPropertyValue('--color-success').trim();
    case 'amber': return style.getPropertyValue('--color-warning').trim();
    case 'red': return style.getPropertyValue('--color-danger').trim();
    default: return style.getPropertyValue('--color-primary').trim();
  }
};
```

Or simpler: use the Tailwind classes `text-success`, `text-warning`, etc. and apply `currentColor` to SVG strokes.

**3. Status report modal gradient (existing code, not Jeff's):**

```tsx
// In status-report-modal.tsx (existing):
className="bg-gradient-to-r from-[#0066CC] to-[#0052A3]"
```

**Problem:** Hardcoded hex values. Works okay because primary is similar in both modes, but technically incorrect.

**Recommendation:** Low priority — the gradient is close enough in both modes.

---

## 3. Architecture Recommendations

### 3.1 Jeff's File Structure is Overcomplicated

Jeff proposes:
```
/reports
  /ceo-pulse/page.tsx
  /portfolio/page.tsx
  /sprint/[projectId]/page.tsx
  /team/page.tsx
  /my-work/page.tsx
  /client/[shareToken]/page.tsx
  /schedule/page.tsx
  /history/page.tsx
```

**My recommendation:** Simpler structure for what we're actually building:

```
/reports
  page.tsx                    # Report hub (already exists, enhance it)
  /my-work/page.tsx           # IC dashboard (P0)
  /ceo-pulse/page.tsx         # CEO traffic light (P0)  
  /portfolio/page.tsx         # Director grid (P1)
  /project/[id]/page.tsx      # PM view per project (P2, replaces PM Cockpit)
```

Skip `/team`, `/client`, `/schedule`, `/history` for now. They're either blocked on missing data or low priority.

### 3.2 Shared Components to Extract

Create `src/components/reports/`:

```
/components/reports/
  index.ts                    # Barrel export
  traffic-light.tsx           # Green/amber/red indicator (used in 3+ places)
  stat-card.tsx               # Number + label + trend (used in 4+ places)
  progress-bar.tsx            # Completion bar (used everywhere)
  report-header.tsx           # Title + date + actions
  escalation-row.tsx          # Blocker/risk row item
  project-health-card.tsx     # Mini project card for grid
  all-clear-state.tsx         # "No issues" message
  task-row.tsx                # Compact task row for lists
```

**Why:** The existing `executive-summary/page.tsx` is 852 lines because it defines everything inline. Extract shared components FIRST.

### 3.3 Hooks to Create

```typescript
// hooks/use-report-data.ts
// Central hook for report data, built on top of useWorkspaceData

export function useReportData(reportType: string) {
  const { data, stats, loading, hasRealData } = useWorkspaceData();
  
  // Compute report-specific metrics
  const computedData = useMemo(() => {
    if (!data) return null;
    
    switch (reportType) {
      case 'ceo-pulse':
        return computeCEOPulse(data, stats);
      case 'portfolio':
        return computePortfolio(data, stats);
      case 'my-work':
        return computeMyWork(data, stats, currentUserEmail);
      default:
        return null;
    }
  }, [data, stats, reportType]);
  
  return { data: computedData, loading, hasRealData };
}
```

```typescript
// hooks/use-current-user.ts
// Get current user info for "My Work" filtering

export function useCurrentUser() {
  // Pull from auth context or session
  // Return { name, email, id }
}
```

### 3.4 API Endpoints

Jeff proposes separate endpoints per report. **Overkill.** We already have:
- `GET /api/projects` — project list
- `GET /api/projects/:id/tasks` — tasks for a project
- `GET /api/dashboard/stats` — dashboard stats

The `useWorkspaceData` hook already fetches and caches this data. Reports should compute their views client-side from this shared data, not make separate API calls.

**Exception:** If we add scheduled email delivery, we'll need server-side report generation. But that's Phase 3.

---

## 4. Build Order (Revised from Jeff's)

Jeff's phased approach is too ambitious. Here's what to actually build:

### Phase 1: Foundation (Days 1-2)

| Task | Effort | Why First |
|------|--------|-----------|
| Extract shared components from executive-summary | 4 hours | Prerequisite for all reports |
| Add glow classes to globals.css | 30 min | Dark mode fix |
| Create `useCurrentUser` hook | 1 hour | Needed for My Work |

### Phase 2: Core Reports (Days 3-6)

| Report | Effort | Notes |
|--------|--------|-------|
| **My Work** | 4 hours | Simplest, highest frequency. Filter tasks by current user's assigneeName. |
| **CEO Pulse** | 4 hours | Highest visibility. Traffic light + 3 numbers + action item. |
| **Portfolio (Director)** | 6 hours | Project grid with health cards. Uses existing health computation. |

### Phase 3: Consolidation (Days 7-8)

| Task | Effort | Notes |
|------|--------|-------|
| Merge PM Cockpit into project detail page | 6 hours | Don't create separate route. Enhance `/project/[id]` with sprint-like view. |
| Kill Eng Lead Dashboard | 0 hours | Redundant with Portfolio + assignee filtering |

### Phase 4: Delivery (Future Sprint)

| Feature | Effort | Notes |
|---------|--------|-------|
| Email digest generation | 8 hours | Server-side rendering of reports |
| Slack integration | 4 hours | Block Kit message formatting |
| Scheduling engine | 8 hours | Cron job execution |

### What to Skip Entirely

| Jeff's Proposal | Why Skip |
|-----------------|----------|
| Eng Lead Dashboard | 90% identical to Portfolio. Add assignee filter to Portfolio instead. |
| Client Status | No milestones, no target dates. Requires schema changes. |
| Velocity trends | No historical data. Would need months of collection. |
| Sprint progress bar | No sprint metadata. Would need Jira custom field mapping. |
| Days blocked tracking | No status change history. Would need schema change. |

---

## 5. What to Cut (Ruthless Simplification)

### 5.1 Cut from CEO Pulse

**Jeff's spec:**
```tsx
{actionItem && (
  <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
    ...
    Owner: {actionItem.assigneeName} · {actionItem.daysBlocked} days blocked
  </div>
)}
```

**Cut:** Remove "X days blocked" — we don't track this. Change to:
```tsx
Owner: {actionItem.assigneeName} · Blocked since {formatDate(actionItem.updatedAt)}
```

Or even simpler:
```tsx
Owner: {actionItem.assigneeName} · Needs attention
```

### 5.2 Cut PM Cockpit Sprint Features

Jeff's PM Cockpit has:
- Sprint health bar with "Day 7 of 14 · Expected: 50%"
- Sprint dates in header
- Burndown chart (screen 3)

**Cut all of it.** We don't have sprint data. Replace with:
- Project completion progress bar
- "Active since {createdAt}" instead of sprint dates
- Cut burndown entirely

### 5.3 Cut Eng Lead Dashboard Entirely

Jeff proposes separate Eng Lead Dashboard with:
- Workload distribution bars
- "Who needs help" section
- Team capacity indicators

**This is 90% identical to Portfolio + "My Team" filter.** Don't build a separate view. Instead:
- Add assignee filter dropdown to Portfolio
- Add "Blocked tasks by owner" section to Portfolio

### 5.4 Cut Client Status Entirely (For Now)

Requires:
- Milestone entity (doesn't exist)
- Project target date (doesn't exist)
- AI-generated highlights (undefined scope)
- Share token authentication (extra security work)

**Too much infrastructure.** Defer to future sprint.

---

## 6. Risk Assessment

### 6.1 Edge Cases the AI Agent Must Handle

| Scenario | Risk | Mitigation |
|----------|------|------------|
| **0 projects** | Empty portfolio, CEO Pulse shows nothing | Show "Connect a tool to see your portfolio" empty state |
| **0 tasks** | My Work is empty, stats all zero | Show "No tasks assigned to you" with link to project list |
| **1000+ tasks** | Performance issues, list too long | Limit to 50 tasks per section, add "View all" link |
| **No blocked tasks** | CEO Pulse has no action item | Show green "All clear" state (Jeff handles this) |
| **All tasks done** | 100% completion, weird edge case | Valid state — show success message |
| **No assignees** | My Work can't match current user | Show "Your email doesn't match any assignees in Jira" warning |
| **Current user not in assignees** | Common if user never assigned tasks | Same as above |
| **Project with only epics** | No leaf tasks to count | Handle gracefully — count epics as tasks |

### 6.2 What Could Break in Production

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dark mode glow colors look wrong | High | Low | Add glow classes to globals.css |
| useWorkspaceData cache causes stale data | Medium | Medium | Add manual refresh button |
| "My Work" can't match current user | High | High | Add explicit user matching fallback |
| Large workspaces timeout | Low | High | Add pagination to useWorkspaceData |
| Email delivery fails silently | Medium | Medium | Add delivery status tracking |

### 6.3 Performance Concerns

The existing `useWorkspaceData` hook fetches ALL projects, then ALL tasks for ALL projects. For a workspace with 20 projects × 100 tasks = 2000 tasks, this is fine. For 50 projects × 500 tasks = 25,000 tasks, it will be slow.

**Current state:** Acceptable for MVP. Revisit if workspaces grow.

---

## 7. Concrete Implementation Plan

### Pre-Work Checklist

- [ ] Add glow utility classes to `globals.css`
- [ ] Create `hooks/use-current-user.ts` hook
- [ ] Verify current user → assigneeName mapping works

### Shared Components Checklist

Create in `/components/reports/`:

- [ ] `traffic-light.tsx` — Props: `status: 'green' | 'amber' | 'red', size?: 'sm' | 'md' | 'lg'`
- [ ] `stat-card.tsx` — Props: `value, label, trend?, highlight?, onClick?`
- [ ] `progress-bar.tsx` — Props: `value, max?, size?, color?`
- [ ] `report-header.tsx` — Props: `title, subtitle?, date, actions?`
- [ ] `escalation-row.tsx` — Props: `title, description, severity, onClick?`
- [ ] `project-health-card.tsx` — Props: `project, onClick?`
- [ ] `all-clear-state.tsx` — Props: `message?`
- [ ] `task-row.tsx` — Props: `task, showProject?, onClick?`
- [ ] `index.ts` — Barrel export

### My Work Report Checklist

File: `/app/(app)/reports/my-work/page.tsx`

- [ ] Create `useMyWorkData` hook that filters `useWorkspaceData` by current user
- [ ] Summary banner: "You have X tasks · Y blocked · Z due today"
- [ ] "Due Today" section: Tasks where `dueDate === today`
- [ ] "Blocked" section: Tasks where `status === 'blocked'`
- [ ] "In Progress" section: Tasks where `status === 'in_progress'`
- [ ] "Up Next" section: Tasks where `status === 'todo'`, sorted by priority
- [ ] "Completed This Week" footer link
- [ ] Empty states for each section
- [ ] Mobile-friendly vertical layout

### CEO Pulse Report Checklist

File: `/app/(app)/reports/ceo-pulse/page.tsx`

- [ ] Compute overall status: `blocked` → red, `at_risk` → amber, else → green
- [ ] Traffic light component with glow
- [ ] Headline text based on status
- [ ] Stats row: Active Projects | At Risk | On Track %
- [ ] Action item: Highest priority blocked task (or oldest if tie)
- [ ] "All Clear" state when no blockers
- [ ] No scroll — single viewport
- [ ] Mobile-optimized layout

### Portfolio Report Checklist

File: `/app/(app)/reports/portfolio/page.tsx`

- [ ] Grid of project health cards (2x4 or 3x3 responsive)
- [ ] Cards sorted: blocked first, then at_risk, then on_track
- [ ] Each card shows: name, completion %, health status, task count
- [ ] Escalations section below grid
- [ ] Escalations = blocked tasks sorted by age (updatedAt)
- [ ] Click card → navigate to project detail page

### Report Hub Enhancement Checklist

File: `/app/(app)/reports/page.tsx` (existing)

- [ ] Update template routes to point to new reports
- [ ] Add "For You" section with My Work card
- [ ] Add "Leadership" section with CEO Pulse + Portfolio cards
- [ ] Remove or gray out unavailable templates (Sprint Summary, Team Workload, Client Status)
- [ ] Remove mock data from generated/scheduled tabs

### Dark Mode Verification Checklist

After implementation:

- [ ] Toggle `data-theme="dark"` on `<html>`
- [ ] Verify traffic light glows are bright enough
- [ ] Verify stat card backgrounds have contrast
- [ ] Verify text is readable in all states
- [ ] Verify progress bars are visible
- [ ] Verify empty states work

### API Endpoints (If Needed)

Only create if client-side computation becomes too slow:

- [ ] `GET /api/reports/ceo-pulse` — Returns pre-computed CEO pulse data
- [ ] `GET /api/reports/my-work?userId=X` — Returns filtered task list

For MVP, skip API endpoints. Use `useWorkspaceData` and compute client-side.

---

## 8. Questions for Jeff / CEO

1. **Current user matching:** How do we match the logged-in user to `Task.assigneeName`? Is it by email? By name string match? This is fragile if Jira names don't match Vantage names.

2. **"Days blocked" requirement:** I've cut this because we don't track status change history. Is approximate "blocked since updatedAt" acceptable? Or do we need to add status history tracking?

3. **Eng Lead vs Portfolio:** Do we really need two separate views? My recommendation is to merge them.

4. **Client Status priority:** Is external sharing actually needed now? It requires significant infrastructure (share tokens, auth, milestones).

5. **Sprint data:** Do we want to add sprint field mapping for Jira? It would require custom field configuration per workspace.

---

## Summary Table

| Jeff's Proposal | My Verdict | Action |
|-----------------|------------|--------|
| My Work (IC) | ✅ Build | P0 — simplest, highest value |
| CEO Pulse | ✅ Build | P0 — but cut "days blocked" |
| Director Portfolio | ✅ Build | P1 — use existing health computation |
| PM Cockpit | ⚠️ Modify | P2 — merge into project detail, cut sprint features |
| Eng Lead Dashboard | ❌ Cut | Redundant with Portfolio + filters |
| Client Status | ❌ Defer | Missing data model, high infrastructure cost |
| Email delivery | ⚠️ Defer | Phase 3 — needs server-side rendering |
| Slack integration | ⚠️ Defer | Phase 3 — needs Block Kit formatting |
| Scheduling engine | ⚠️ Defer | Phase 3 — needs cron infrastructure |

**Estimated total effort for Phase 1-2:** 5-6 days  
**Estimated total if we built everything Jeff proposed:** 4-6 weeks

Build the foundation. Ship 3 reports. Iterate based on feedback. Don't over-engineer.

---

*The best reporting suite is the one people actually use. Start simple.*

**— Emmy** ⚡
