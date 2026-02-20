# CEO Pulse & Portfolio Health Report — Complete Redesign

**Author:** Jeff, SVP of Product  
**Date:** February 20, 2026  
**Status:** Ready for Engineering Review  
**Replaces:** Current CEO Pulse page + Portfolio Health page

---

## The Problem with What We Have Today

I'm going to be blunt: these two reports are half-baked.

**CEO Pulse** is a traffic light with three stat cards and a single action item. A CEO looking at this gets a red/amber/green dot and a number. That's not a pulse — that's a heartbeat monitor with the sound off. There's no context, no trend, no "compared to what," no ability to dig in. If everything's green, there's nothing to look at. If something's red, there's one task to click. Where's the story?

**Portfolio Health** is a grid of project cards with a flat escalation list underneath. It tells you which projects are behind, but not *why*. Not *how much* behind. Not *what changed since last week*. Not *what's about to become a problem*. An engineering director looking at this has to click into every single project to understand what's going on. That's not a report — that's a table of contents.

**Both reports share the same fundamental flaw:** they show current state without trajectory. A project at 40% completion might be fine (started 2 days ago) or catastrophic (due tomorrow). These reports can't tell the difference.

We now have timeline intelligence, drift tracking, dependency data, and critical path analysis. None of it is surfaced in these reports.

Time to fix that.

---

## Who Are These Reports Actually For?

### CEO Pulse → Renamed: **"Executive Pulse"**

**Primary audience:** CEO, CFO, CTO, board members  
**Reading context:** Monday morning before standup, Friday afternoon before weekend, investor meeting prep  
**Time budget:** 60 seconds. Not kidding. This audience will spend ONE MINUTE on this report.  
**What they actually need to know:**
1. Are we going to hit our commitments? (Yes/No/Maybe, with confidence level)
2. What changed since last time I looked?
3. What's the one thing I should worry about?
4. What's the one thing going well?

**What they absolutely do NOT need:**
- Task-level details
- Technical jargon ("blocked by dependency chain in sprint 14")
- Granular metrics they can't act on
- More than 3 numbers on screen at once

**Insight density target:** Maximum signal in minimum pixels. Think Bloomberg Terminal meets Apple Health summary.

### Portfolio Health → Renamed: **"Portfolio Command Center"**

**Primary audience:** VP of Engineering, Engineering Directors, Portfolio Managers, Product Directors  
**Reading context:** Weekly portfolio review, pre-standup prep, resource allocation meetings  
**Time budget:** 3-5 minutes. This audience will actually *use* this page, not just glance at it.  
**What they actually need to know:**
1. Which projects need my attention right now? (and why?)
2. Are we trending better or worse across the portfolio?
3. Where are the resource bottlenecks?
4. What's at risk of slipping in the next 2 weeks?
5. What dependency chains could cause cascading delays?

**What makes this different from CEO Pulse:**
- Drill-down capability (click anything to go deeper)
- Comparative view (project vs. project)
- Time dimension (this week vs. last week)
- Action-oriented (not just "here's the status" but "here's what to do about it")

---

## Executive Pulse — Full Redesign

### Design Philosophy

This report should feel like a **1-page newspaper front page** for your portfolio. Above the fold: the headline and whether things are good or bad. Below the fold: the supporting stories. Everything clickable for anyone who wants to read more.

### Layout: Single Column, Scannable, 60-Second Read

#### Section 1: The Verdict (top of page)

**What it looks like:** A single sentence headline with a confidence indicator — not a traffic light.

Traffic lights are lazy. They collapse complex reality into three colors and train executives to ignore green and panic at red. Instead:

**The Headline** — An AI-generated natural-language summary. One sentence. Dynamic.

Examples:
- *"Portfolio is on track to deliver 7 of 8 commitments this quarter. Confidence: High."*
- *"2 projects have slipped this week — Mobile App and API Migration need attention."*
- *"Strong week: 3 projects moved from At Risk to On Track. Portfolio velocity is up 18%."*
- *"Warning: dependency chain between Platform and Mobile could delay Q2 launch by 2 weeks."*

**Confidence Meter** — A horizontal bar, not a traffic light. Shows portfolio confidence as a percentage (0-100) with color gradient (green → amber → red). This is computed from:
- Weighted health scores across projects
- Drift trajectory (are things getting better or worse?)
- Dependency risk (are there unresolved blocking chains?)
- Historical delivery accuracy (did past projections hold?)

**Change indicator** — Arrow + delta from last report. "↑ 8 points from last week" or "↓ 3 points — driven by Platform delays."

**Click behavior:** Clicking the confidence meter opens a breakdown showing which factors are pulling it up or down.

```
┌─────────────────────────────────────────────────────────────┐
│  Portfolio is on track to deliver 7 of 8 commitments.       │
│                                                             │
│  Confidence ████████████████████░░░░  78%  ↑ 8 from last wk │
│                                                             │
│  Driven by: Mobile App timeline recovered (+12 pts)         │
│  Watch:     API Migration still has 3 unresolved blockers   │
└─────────────────────────────────────────────────────────────┘
```

#### Section 2: What Changed (delta view)

**What it looks like:** A compact list of the 3-5 most important changes since the last time this report was generated. Not "here's the state" — "here's what MOVED."

Each item is a single line with an icon, a description, and a click target:

```
📈  Mobile App: moved from At Risk → On Track (5 blockers resolved)        → View
📉  API Migration: slipped 4 days — dependency on Platform auth not met    → View
✅  Design System v2: completed ahead of schedule                          → View
⚠️  Platform: 3 new critical-priority tasks added mid-sprint               → View
```

**Data source:**
- Compare current project health scores to stored snapshot from last report generation
- Timeline events (drift changes, baseline resets)
- Task status transitions (blocked → unblocked, etc.)
- New critical/high priority tasks created since last report

**Click behavior:** Each row links to the relevant project page, scrolled to the area of concern (e.g., if the issue is blockers, deep-link to the project's blocked task view).

**Why this matters:** Executives don't care about steady state. They care about *change*. If everything is the same as last week, that's worth knowing in one line ("No significant changes — portfolio is stable"). If something moved, lead with that.

#### Section 3: The Portfolio Grid (at-a-glance project health)

**What it looks like:** A horizontal row of compact project "pills" — not cards, not a grid. Think of airport departure boards: project name, status dot, completion %, and a tiny sparkline showing the health trend over the last 4 weeks.

```
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🟢 Mobile App    │ │ 🟡 API Migration │ │ 🟢 Design System │
│ 78% ▁▂▃▅ ↑       │ │ 45% ▅▃▂▁ ↓      │ │ 100% ▁▂▅█ ✓     │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

**Key innovation:** The **sparkline**. A tiny 4-week trend chart inside each pill. This is the single most important addition to these reports. A number without a trend is meaningless. "45% complete" could be amazing or terrible — the sparkline tells you which.

**Click behavior:** Each pill links to the project detail page. But ALSO: hovering (or tapping on mobile) shows a tooltip with:
- Health score (number)
- Tasks: X done / Y total
- Blocked: N tasks
- Drift: +N days / On track
- Top risk: "Blocked by [task name]"

**Overflow:** If there are more than ~8 projects, show the top 6 (sorted by "needs attention") and collapse the rest into a "+N more, all on track" summary. Click to expand.

#### Section 4: The One Thing (bottom of report)

**What it looks like:** A single highlighted action card. Not a list of escalations — THE most important thing that needs executive attention right now.

Selection logic (in priority order):
1. A project that is **newly blocked** this week (wasn't blocked last week)
2. A dependency chain that threatens a **commitment date**
3. A resource bottleneck (one person is assigned to 3+ critical-path items)
4. A project whose **drift just crossed from "late" to "critical"** 
5. If nothing is wrong: "No action needed. Portfolio is healthy." (with a subtle ✅)

```
┌─────────────────────────────────────────────────────────────┐
│  🔴  ACTION NEEDED                                          │
│                                                             │
│  API Migration blocked by Platform auth dependency          │
│  Impact: Could delay Q2 launch by 2 weeks                   │
│  Owner: Sarah Chen · Since: Feb 14                          │
│                                                             │
│  [View Project →]  [View Dependency Chain →]                │
└─────────────────────────────────────────────────────────────┘
```

**Click behavior:** Two CTAs:
1. "View Project" → goes to the project page
2. "View Dependency Chain" → goes to the project's dependency/timeline view showing the blocker chain visually

**Why one thing, not a list?** Because executives process lists by reading the first item and ignoring the rest. One thing forces us to compute what actually matters most. If someone wants the full escalation list, that's what the Portfolio Command Center is for.

#### Section 5: Timestamp + Report Controls

- "Generated [date/time] · [Refresh]"
- "Share" button → copies a shareable link or exports a clean PDF
- "Schedule" → set up weekly email delivery (links to report schedule settings)

---

## Portfolio Command Center — Full Redesign

### Design Philosophy

This is the **working report** for the people who actually manage the portfolio. It should feel like a mission control dashboard — dense but organized, interactive, and built for weekly portfolio review meetings. Every single element should be clickable, filterable, or expandable.

### Layout: Full-Width, Three-Zone Design

#### Zone 1: Portfolio Pulse Bar (sticky top bar)

**What it looks like:** A thin, persistent bar at the top of the report (stays visible as you scroll) showing key portfolio-wide metrics:

```
┌─────────────────────────────────────────────────────────────────────┐
│  12 Projects  │  74% On Track  │  3 At Risk  │  1 Blocked  │  ↓ 2 from last week  │  [Filter ▾]  │
└─────────────────────────────────────────────────────────────────────┘
```

**Filter controls:** Click "Filter" to filter the entire report by:
- Source tool (Jira / Monday / Asana)
- Health status (On Track / At Risk / Blocked)
- Time range for trend data (1w / 2w / 1m / 3m)
- Team/assignee (if team data available)

**Click behavior:** Each metric in the bar is clickable — clicking "3 At Risk" scrolls to and highlights those projects.

#### Zone 2: Project Health Matrix (the main view)

**What it looks like:** This is the centerpiece. NOT a grid of identical cards. Instead, a **ranked table** with inline visualizations that tells you everything about each project in a single row.

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  #  │ Project          │ Health │ Completion    │ Drift    │ Blockers │ Velocity │ ▼  │
├──────────────────────────────────────────────────────────────────────────────────────┤
│  1  │ 🔴 API Migration │   34   │ ██░░░░ 34%    │ +12d ↑   │ 5 🔥     │ ▅▃▂▁ ↓  │ ⌄  │
│  2  │ 🟡 Platform      │   58   │ ████░░ 58%    │ +4d  →   │ 2        │ ▁▂▃▃ →  │ ⌄  │
│  3  │ 🟢 Mobile App    │   82   │ █████░ 82%    │ 0d   ✓   │ 0        │ ▁▂▃▅ ↑  │ ⌄  │
│  4  │ 🟢 Design System │   91   │ ██████ 91%    │ -2d  ✓   │ 0        │ ▂▃▅█ ↑  │ ⌄  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Columns:**
1. **Rank** — Sorted by "needs attention" score (combines health, drift, blockers, velocity trend). Worst projects float to top.
2. **Project** — Name with status dot. Click → navigates to project page.
3. **Health** — Numeric score (0-100) with background color gradient. Click → shows health score breakdown popover (what's contributing to the score).
4. **Completion** — Inline progress bar with percentage. Compact but readable.
5. **Drift** — Days of timeline drift from baseline. Positive = late, negative = ahead, 0 = on track. Color-coded. Arrow shows trend direction (getting worse ↑, stable →, improving ↓). Click → opens timeline view for that project.
6. **Blockers** — Count of blocked tasks. If any are critical priority, show 🔥. Click → shows a popover listing the blocked tasks with their blocking reasons.
7. **Velocity** — 4-week sparkline showing tasks-completed-per-week trend. This tells you if the team is accelerating, coasting, or stalling. Direction arrow.
8. **Expand (⌄)** — Expands the row inline to show project details without leaving the page.

**Expanded Row (when you click ⌄):**

The row expands to show a mini-dashboard for that project:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  API Migration                                                          [View Full →]│
│                                                                                      │
│  ┌─ Task Breakdown ──────┐  ┌─ Timeline ─────────────┐  ┌─ Top Risks ─────────────┐ │
│  │ Done:        14 (34%) │  │ Baseline:   Mar 15      │  │ 🔴 Auth service blocked │ │
│  │ In Progress:  8 (20%) │  │ Projected:  Mar 27      │  │    by Platform team     │ │
│  │ Todo:        12 (29%) │  │ Drift:      +12 days    │  │ 🟡 3 tasks unassigned   │ │
│  │ Blocked:      5 (12%) │  │ Trend:      Worsening   │  │    on critical path     │ │
│  │ Backlog:      2  (5%) │  │                         │  │ 🟡 Sprint scope grew    │ │
│  └───────────────────────┘  └─────────────────────────┘  │    by 15% this week     │ │
│                                                          └─────────────────────────┘ │
│  Critical Path: Auth Service → API Gateway → User Migration → Data Validation       │
│  [View Dependencies →]  [View Timeline →]  [View Tasks →]                            │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

**Why a table and not cards?** Cards are pretty but terrible for comparison. When a VP is in a portfolio review asking "which project is worst?" they need to compare 12 projects across 5 dimensions simultaneously. Tables do this. Cards don't. The sparklines and progress bars inside the table give it the visual richness of cards without sacrificing scannability.

**Sorting:** Click any column header to re-sort. Default sort: "needs attention" score (descending). Common re-sorts: by drift, by blocker count, by completion.

#### Zone 3: Portfolio Intelligence Panel (below the table)

Three tabs, horizontally arranged. These provide cross-project analysis that individual project pages can't:

##### Tab 1: Dependency Risk Map

**What it looks like:** A visual graph showing cross-project dependency chains. Only shows *at-risk* dependencies — ones where the blocker is late or the dependency could cause a cascade.

```
┌─────────────────────────────────────────────────────────────────────┐
│  DEPENDENCY RISK MAP                                    2 chains ⚠️  │
│                                                                     │
│  Platform Auth ──blocks──→ API Migration ──blocks──→ User Rollout   │
│  [+4d late]                [+12d projected]           [at risk]     │
│                                                                     │
│  Design System ──blocks──→ Mobile App Redesign                      │
│  [on track]                [waiting]                                │
│                                                                     │
│  Legend: 🔴 Late  🟡 At Risk  🟢 On Track  ── blocks ──→            │
└─────────────────────────────────────────────────────────────────────┘
```

**Click behavior:** Click any node (project/task) to navigate to it. Click a chain to see the full dependency detail view.

**Data source:** The `TaskDependency` table we just built + drift data from timeline intelligence. Cross-project dependencies are the unique insight this view provides.

##### Tab 2: Team Heatmap

**What it looks like:** A grid showing assignee workload across projects. Rows = people, columns = projects, cells = task count with color intensity.

```
┌────────────────────────────────────────────────────────────┐
│  TEAM HEATMAP                                              │
│                                                            │
│              │ API Migr │ Platform │ Mobile │ Design │      │
│  Sarah C.    │ ████ 8   │ ██ 3     │        │        │ 🔥   │
│  Alex K.     │          │ ███ 5    │ ██ 4   │        │      │
│  Jordan T.   │ █ 2      │          │ ███ 6  │ █ 1    │      │
│  Unassigned  │ ███ 5    │ █ 1      │        │ ██ 3   │ ⚠️   │
│                                                            │
│  🔥 = overloaded (>10 active tasks)                        │
│  ⚠️ = unassigned work on critical path                     │
└────────────────────────────────────────────────────────────┘
```

**Click behavior:** 
- Click a person's name → filters the project table to show only their tasks
- Click a cell → shows that person's tasks in that project (popover list, each task clickable)
- Click 🔥 → shows the overloaded person's task list sorted by priority

**Why this matters:** Resource bottlenecks are the #1 cause of portfolio delays. If Sarah is assigned to 11 critical tasks across 2 projects, that's a risk that no project-level view will surface. This view makes it obvious.

##### Tab 3: Trend Analysis

**What it looks like:** Two charts, side by side:

**Chart 1: Portfolio Health Over Time**
- Line chart, X-axis = weeks, Y-axis = health score (0-100)
- One line per project (color-coded)
- Area shading: green zone (70-100), amber zone (40-70), red zone (0-40)
- Hover any point to see that project's score at that time

**Chart 2: Completion Velocity**
- Stacked bar chart, X-axis = weeks, Y-axis = tasks completed
- Each bar broken down by project (color-coded)
- Trend line showing average velocity
- This tells you: "Are we getting faster or slower as a portfolio?"

**Click behavior:** Click any data point to see the project at that point in time (opens the project page).

**Why this matters:** Without trends, you can't answer "are we getting better?" A portfolio at 60% health that was at 40% last month is a success story. A portfolio at 80% that was at 95% last month is a warning sign. Current reports can't tell the difference.

---

## Cross-Report Navigation

Both reports should link to each other and to the deeper reports:

```
Executive Pulse
  ↓ "See full portfolio breakdown"
Portfolio Command Center
  ↓ "View project details" (per project)
Project Detail Page
  ↓ "View timeline" / "View dependencies"
Timeline View / Dependency View
```

**The principle:** Every piece of information is a doorway. Numbers are links. Status dots are links. Project names are links. Nothing is a dead end. If a CEO sees "3 At Risk" they should be able to click and see which three, then click a project and see why it's at risk, then click a blocker and see the dependency chain.

---

## Data Requirements

### New Data Needed (not currently computed)

| Data Point | Source | How to Compute |
|---|---|---|
| Portfolio confidence score | Health scores + drift + dependency risk + historical accuracy | Weighted composite, documented below |
| Week-over-week delta | Stored snapshots of report state | Save report data to DB on each generation |
| Per-project velocity sparkline | Task completion timestamps grouped by week | `COUNT tasks WHERE completedAt BETWEEN week_start AND week_end GROUP BY project` |
| Cross-project dependency chains | TaskDependency table | Follow sourceTaskId → targetTaskId across projects, filter by `blocks` type |
| Team heatmap data | Task.assigneeName + Task.projectId + Task.status | Aggregate active tasks by person × project |
| Health history | Stored snapshots | Need a new `ReportSnapshot` model (see below) |
| "What Changed" deltas | Compare current state to last snapshot | Diff health scores, blocker counts, drift values |

### Report Snapshot Model (new)

To power the "What Changed" and trend features, we need to persist report state:

```
ReportSnapshot {
  id: cuid
  workspaceId: string
  reportType: "executive_pulse" | "portfolio_command"
  generatedAt: DateTime
  data: Json  // Full report data at time of generation
}
```

**Retention:** Keep snapshots for 90 days. One per report per day max.

**When to snapshot:** Every time the report is loaded (if no snapshot exists for today), plus on any scheduled report delivery.

### Portfolio Confidence Score Algorithm

```
confidence = (
  healthWeight      × avgProjectHealthScore +
  driftWeight       × (100 - normalizedDriftPenalty) +
  dependencyWeight  × (100 - dependencyRiskScore) +
  velocityWeight    × normalizedVelocityTrend
)

Where:
  healthWeight     = 0.40  (current health is the strongest signal)
  driftWeight      = 0.25  (are we trending better or worse?)
  dependencyWeight = 0.20  (are there blocking chains?)
  velocityWeight   = 0.15  (are we speeding up or slowing down?)

normalizedDriftPenalty:
  0    if avg drift = 0
  25   if avg drift = 1-3 days
  50   if avg drift = 4-7 days
  75   if avg drift = 8-14 days
  100  if avg drift > 14 days

dependencyRiskScore:
  0    if no unresolved blocking chains
  25   if chains exist but blockers are on track
  50   if any blocker is at risk
  75   if any blocker is late
  100  if blocker is on critical path AND late

normalizedVelocityTrend:
  Based on tasks-completed-per-week delta over last 4 weeks
  Increasing = 100, stable = 50, decreasing = 0
```

---

## Interaction Design Details

### Hover Behaviors

| Element | Hover shows |
|---|---|
| Project pill (Executive Pulse) | Mini health card: score, tasks done/total, blockers, drift, top risk |
| Health score (Command Center) | Breakdown: what contributes to the score (completion, blockers, drift, velocity) |
| Drift value | Timeline: baseline date vs projected date, when drift started |
| Blocker count | List of blocked tasks with names, assignees, and how long they've been blocked |
| Sparkline | Enlarged view with labeled data points and dates |
| Person name (heatmap) | That person's task summary: N total, N done, N blocked, N overdue |

### Mobile Behavior

**Executive Pulse:** Already single-column, works naturally on mobile. Sparklines in pills become tappable instead of hoverable.

**Portfolio Command Center:** 
- Pulse bar becomes scrollable
- Health Matrix collapses to show only: Rank, Project Name, Health Score, Status. Tap row to expand.
- Intelligence Panel tabs become a full-width card carousel (swipe between tabs)
- Heatmap becomes a vertical list (person → their projects)

### Empty States

**No projects connected:**
> "Connect your first project tool to see your portfolio health."
> [Connect Jira →] [Connect Monday →] [Connect Asana →]

**Only one project:**
> "Portfolio reports shine with multiple projects. Connect more tools or sync more projects to unlock cross-project intelligence."
> (Still show the report with a single project — don't gate the feature)

**No data yet (just connected):**
> "Your projects are syncing. Portfolio data will appear after the first sync completes."
> [Check sync status →]

---

## Success Metrics

| Metric | Target | How to Measure |
|---|---|---|
| Report load time | < 2 seconds | Performance monitoring |
| Time on page (Executive Pulse) | 30-90 seconds | Analytics |
| Time on page (Command Center) | 3-5 minutes | Analytics |
| Click-through rate (any link) | > 40% of report viewers click at least one thing | Analytics |
| Weekly active report viewers | > 60% of workspace admins view at least one report weekly | Analytics |
| "What Changed" engagement | > 70% of viewers interact with delta items | Analytics |
| Report scheduling adoption | > 20% of workspaces set up at least one scheduled report | Analytics |

---

## Implementation Phases

### Phase 1: Core Redesign (MVP)
- Executive Pulse: confidence meter + headline + project pills + one action item
- Portfolio Command Center: pulse bar + health matrix table (without expand) + project click-through
- Store report snapshots for delta computation
- Health score breakdown popover

### Phase 2: Intelligence Layer
- "What Changed" delta view on Executive Pulse
- Expanded row detail on Command Center
- Velocity sparklines (requires historical task completion data)
- Dependency Risk Map tab

### Phase 3: Collaboration + Trends
- Team Heatmap tab
- Trend Analysis tab (requires 4+ weeks of snapshots)
- Scheduled email delivery with inline report content
- PDF export (board-meeting ready)
- Share link with snapshot (viewer sees report as of that date)

---

## What Makes This Different from Every Other PM Dashboard

1. **Change-first, not state-first.** The Executive Pulse leads with what CHANGED, not what IS. State is context. Change is information.

2. **Confidence, not traffic lights.** A continuous confidence score with trend beats a 3-color bucket. Reality isn't red/amber/green — it's a spectrum.

3. **Sparklines everywhere.** Every metric has a tiny trend. Because a number without trajectory is trivia.

4. **Progressive depth.** CEO gets the 60-second version. VP gets the 5-minute version. Both are the SAME data, just at different zoom levels. One links to the other seamlessly.

5. **Dependency awareness.** No other portfolio view surfaces cross-project dependency risk. We have the data (thanks to the dependency sync). USE IT.

6. **People, not just projects.** The team heatmap answers "who is overloaded?" — the question every portfolio meeting asks but no dashboard answers.

7. **Everything is clickable.** There are zero dead ends. Every number, every status dot, every project name is a doorway to more detail. The report is a navigation surface, not a printout.

---

*This isn't just a UI refresh. It's a rethink of what portfolio reporting should be in a tool that has cross-tool visibility, dependency intelligence, and timeline tracking. We have data that no one else has. Let's show it.*

**— Jeff** 🎯
