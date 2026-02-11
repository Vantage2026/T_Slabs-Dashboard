# Screen Spec: Reports & Analytics
## /reports

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

Reports & Analytics is the data storytelling layer of Vantage. It transforms raw project data into shareable, exportable insights that PMs can use for executive updates, retrospectives, and strategic planning.

**Core Value:** PMs spend hours building slides and spreadsheets for stakeholder updates. Vantage auto-generates these reports, saving time and ensuring consistency.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| R-1 | PM | Generate a status report for a project | I can share progress with stakeholders without manual work |
| R-2 | PM | See velocity trends over time | I can identify patterns and predict delivery |
| R-3 | PM Leader | View portfolio-level metrics | I can understand health across all my projects |
| R-4 | PM | Export reports as PDF | I can share with stakeholders who don't use Vantage |
| R-5 | PM | Schedule recurring reports | Stakeholders get weekly updates automatically |
| R-6 | PM | Compare metrics across projects | I can identify which projects need attention |
| R-7 | Executive | See high-level dashboards | I get visibility without learning PM tools |
| R-8 | PM | Customize which metrics appear | I can tailor reports to different audiences |

---

## 3. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Reports & Analytics                    [+ New Report] [Schedule] │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [Dashboard] [Project Reports] [Portfolio Reports] [Saved]       │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │  DASHBOARD VIEW (Default Tab)                                        │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │                                                                       │
│         │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│         │  │ Active Projects  │ │ On-Time Rate     │ │ Total Tasks      │     │
│         │  │       12         │ │      78%         │ │     847          │     │
│         │  │ ↑ 2 this month   │ │ ↑ 5% vs last mo  │ │ 124 completed    │     │
│         │  └──────────────────┘ └──────────────────┘ └──────────────────┘     │
│         │                                                                       │
│         │  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐     │
│         │  │ Avg Health Score │ │ Open Risks       │ │ Avg Velocity     │     │
│         │  │       74         │ │       8          │ │    42 pts/wk     │     │
│         │  │ ↓ 3 pts          │ │ 3 critical       │ │ ↓ 8% vs target   │     │
│         │  └──────────────────┘ └──────────────────┘ └──────────────────┘     │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Portfolio Velocity Trend                        Last 12 weeks   │ │
│         │  │                                                                  │ │
│         │  │     60│    ╭─╮                                                  │ │
│         │  │       │   ╱   ╲    ╭──╮                                         │ │
│         │  │     40│──╱─────╲──╱────╲─────╭╮────────                         │ │
│         │  │       │ ╱       ╲╱      ╲───╱  ╲──────                          │ │
│         │  │     20│╱                                                        │ │
│         │  │       └────────────────────────────────────────                 │ │
│         │  │        W1  W2  W3  W4  W5  W6  W7  W8  W9  W10 W11 W12         │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌──────────────────────────────────┐ ┌──────────────────────────┐  │
│         │  │ Project Health Distribution      │ │ Tasks by Status          │  │
│         │  │                                  │ │                          │  │
│         │  │   ████████████░░░░ 78% Healthy  │ │  Done      ████████ 312  │  │
│         │  │   ████░░░░░░░░░░░░ 15% At Risk  │ │  In Prog   █████    186  │  │
│         │  │   ██░░░░░░░░░░░░░░  7% Critical │ │  Blocked   ██        47  │  │
│         │  │                                  │ │  To Do     ███████   302 │  │
│         │  └──────────────────────────────────┘ └──────────────────────────┘  │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Project Comparison                                               │ │
│         │  │ ┌──────────────┬────────┬──────────┬──────────┬───────────────┐ │ │
│         │  │ │ Project      │ Health │ Velocity │ On-Time  │ Open Risks    │ │ │
│         │  │ ├──────────────┼────────┼──────────┼──────────┼───────────────┤ │ │
│         │  │ │ Payments     │   82   │  45/wk   │   85%    │ 2             │ │ │
│         │  │ │ Mobile App   │   71   │  38/wk   │   72%    │ 3             │ │ │
│         │  │ │ API Platform │   65   │  52/wk   │   68%    │ 3             │ │ │
│         │  │ └──────────────┴────────┴──────────┴──────────┴───────────────┘ │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab Structure

### Tab 1: Dashboard (Default)
Portfolio-wide metrics and visualizations. The "executive view."

### Tab 2: Project Reports
Generate and view reports for individual projects.

### Tab 3: Portfolio Reports
Cross-project analysis and comparisons.

### Tab 4: Saved
Previously generated and scheduled reports. Scheduled delivery via email + Slack only (V1). Confluence delivery is **V2**.

---

## 5. Component Breakdown

### 5.1 Page Header

```tsx
<PageHeader
  title="Reports & Analytics"
  actions={
    <>
      <Button variant="secondary" icon={<Calendar />} onClick={openScheduleModal}>
        Schedule
      </Button>
      <Button variant="primary" icon={<Plus />} onClick={openNewReportModal}>
        New Report
      </Button>
    </>
  }
/>
```

### 5.2 Metric Cards (Dashboard)

**Layout:** 6 cards in 2 rows of 3 (responsive: 2 columns on tablet, 1 on mobile)

**Card Structure:**
```
┌─────────────────────────┐
│ [Icon]  Metric Name     │
│                         │
│    Large Number         │
│                         │
│ [Trend] vs comparison   │
└─────────────────────────┘
```

**Component:**
```tsx
interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'flat';
    value: string;
    comparison: string;  // "vs last month", "vs target"
  };
  color?: 'default' | 'success' | 'warning' | 'danger';
}
```

**Styling:**
- Card: `bg-white rounded-xl border border-neutral-100 p-6`
- Label: `text-sm text-neutral-500`
- Value: `text-3xl font-bold text-neutral-900`
- Trend up (good): `text-success-600` (#008F5A)
- Trend down (bad): `text-danger-600` (#CC2F3C)
- Icon: `w-5 h-5 text-neutral-400`

### 5.3 Velocity Chart

**Type:** Line chart with area fill

**Data:** Weekly velocity over 12 weeks (configurable)

**Styling:**
- Line stroke: `#0066CC` (primary)
- Area fill: `#0066CC` at 10% opacity
- Grid lines: `#E5E5E5` (neutral-200)
- Axis labels: `text-[10px] text-neutral-400`

**Interactions:**
- Hover point → tooltip with exact value and date
- Click and drag → zoom to range
- Toggle lines for multi-project comparison

### 5.4 Health Distribution Chart

**Type:** Horizontal stacked bar or donut

**Segments:**
- Healthy (≥80): `#00A86B` (success)
- At Risk (60-79): `#FFA500` (warning)
- Critical (<60): `#E63946` (danger)

**Display:** Show percentage and count for each segment

### 5.5 Tasks by Status Chart

**Type:** Horizontal bar chart

**Statuses:** Done, In Progress, Blocked, To Do

**Colors:**
- Done: `#00A86B` (success)
- In Progress: `#0066CC` (primary)
- Blocked: `#E63946` (danger)
- To Do: `#A3A3A3` (neutral-400)

### 5.6 Project Comparison Table

**Columns:**
- Project name (link to project detail)
- Health score (with color indicator)
- Velocity (with sparkline)
- On-time rate (percentage)
- Open risks (count with severity breakdown on hover)

**Features:**
- Sortable columns
- Click row → navigate to project
- Hover row → highlight

---

## 6. Project Reports Tab

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Select a project to generate report                             │
│                                                                 │
│ [Search projects...]                                            │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ○ Payments Portfolio            Health: 82   [Generate →]  │ │
│ │ ○ Mobile App                    Health: 71   [Generate →]  │ │
│ │ ○ API Platform                  Health: 65   [Generate →]  │ │
│ │ ○ Customer Portal               Health: 88   [Generate →]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ─────────────────── OR ───────────────────                     │
│                                                                 │
│ Recent Reports                                                  │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📄 Payments Portfolio - Weekly Status                       │ │
│ │    Generated Feb 7, 2026 · PDF                              │ │
│ │                               [View] [Download] [Regenerate]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Report Generation Modal

**Step 1: Select Template**
```
┌─────────────────────────────────────────────────────────────────┐
│ Generate Report: Payments Portfolio                      [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Select Report Type                                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ● Weekly Status Report                                      │ │
│ │   Summary of progress, blockers, and next steps             │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ○ Sprint Retrospective                                      │ │
│ │   Analysis of completed sprint with velocity and learnings  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ○ Executive Summary                                         │ │
│ │   High-level health, risks, and milestones                  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ○ Custom Report                                             │ │
│ │   Choose your own metrics and sections                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                      [Cancel] [Next: Configure] │
└─────────────────────────────────────────────────────────────────┘
```

**Step 2: Configure**
```
┌─────────────────────────────────────────────────────────────────┐
│ Configure Report                                         [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Time Period                                                     │
│ [This Week ▼]                                                   │
│                                                                 │
│ Sections to Include                                             │
│ ☑ Summary & Highlights                                         │
│ ☑ Health Score & Trends                                        │
│ ☑ Velocity Metrics                                             │
│ ☑ Risk Radar                                                   │
│ ☑ Blockers & Dependencies                                      │
│ ☑ Completed Items                                              │
│ ☐ Team Workload                                                │
│ ☐ Budget & Timeline                                            │
│                                                                 │
│ AI Summary                                                      │
│ ☑ Include Scout-generated narrative summary (**V2 if LLM not ready**) │
│                                                                 │
│                                       [Back] [Generate Report]  │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Report Preview & Export

**Full-page report preview with:**
- Print-optimized layout
- Export buttons: PDF, PNG, Copy Link
- Share button: Email, Slack, Confluence embed
- Edit button: Modify and regenerate

---

## 7. Report Templates

### 7.1 Weekly Status Report

**Sections:**
1. **Header:** Project name, date range, generated date
2. **Executive Summary:** Scout-generated 2-3 sentence overview
3. **Health Score:** Current score with trend chart (4 weeks)
4. **Key Metrics:** Velocity, completion rate, on-time delivery
5. **Highlights:** Completed items this period
6. **Risks & Blockers:** Active risks with severity
7. **Next Week:** Upcoming milestones, planned work
8. **Team Notes:** Optional manual notes section

### 7.2 Sprint Retrospective

**Sections:**
1. **Sprint Info:** Sprint name, dates, goal
2. **Velocity:** Planned vs. actual, trend
3. **Completion:** Stories completed, carried over
4. **What Went Well:** Auto-detected positives (ahead of schedule items, unblocked items)
5. **What Needs Improvement:** Auto-detected issues (missed estimates, blockers)
6. **Action Items:** Editable list for team input

### 7.3 Executive Summary

**Sections:**
1. **Portfolio Health:** Single number with context
2. **Key Milestones:** Timeline of upcoming/recent milestones
3. **Top Risks:** Critical and high risks only
4. **Budget Status:** If budget tracking enabled
5. **Recommendations:** Scout-generated strategic recommendations

---

## 8. Scheduled Reports

### 8.1 Schedule Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Schedule Recurring Report                                [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Report                                                          │
│ [Weekly Status - Payments Portfolio ▼]                          │
│                                                                 │
│ Frequency                                                       │
│ ○ Daily    ● Weekly    ○ Bi-weekly    ○ Monthly                │
│                                                                 │
│ Day & Time                                                      │
│ Every [Monday ▼] at [9:00 AM ▼] [EST ▼]                        │
│                                                                 │
│ Delivery                                                        │
│ ☑ Email to me                                                  │
│ ☑ Email to: [sarah@company.com, mike@company.com]              │
│ ☐ Post to Slack: [#project-payments ▼]                         │
│ ☐ Update Confluence page: [Select page...]                     │
│                                                                 │
│                                         [Cancel] [Save Schedule] │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Scheduled Reports List (Saved Tab)

```
┌─────────────────────────────────────────────────────────────────┐
│ Scheduled Reports                                               │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 Weekly Status - Payments Portfolio                       │ │
│ │    Every Monday at 9:00 AM EST                              │ │
│ │    Next run: Feb 10, 2026                                   │ │
│ │    Recipients: 3 emails, #project-payments                  │ │
│ │                              [Edit] [Pause] [Run Now] [Delete]│
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📅 Executive Summary - All Projects                         │ │
│ │    First Monday of month at 8:00 AM EST                     │ │
│ │    Paused                                                   │ │
│ │                            [Edit] [Resume] [Run Now] [Delete]│ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Interactions & States

### 9.1 Chart Interactions

- **Hover:** Show tooltip with exact values
- **Click data point:** Drill down to that time period
- **Legend click:** Toggle series visibility
- **Time range selector:** Adjust chart period

### 9.2 Loading States

- Metric cards: Skeleton pulse animation
- Charts: Skeleton with chart shape outline
- Tables: Row skeletons

### 9.3 Empty States

**No projects:**
"Connect your tools to see reports. [Go to Integrations]"

**No data for period:**
"No data available for this time period. Try a different range."

### 9.4 Error States

"Failed to load analytics. [Retry]"

---

## 10. Data Requirements

### 10.1 API Endpoints

**GET /api/analytics/dashboard**
```typescript
{
  timeRange: '7d' | '30d' | '90d' | 'all';
  projectIds?: string[];  // filter to specific projects
}

// Response
{
  metrics: {
    activeProjects: { value: number; trend: number };
    onTimeRate: { value: number; trend: number };
    totalTasks: { value: number; completed: number };
    avgHealthScore: { value: number; trend: number };
    openRisks: { value: number; critical: number };
    avgVelocity: { value: number; trend: number };
  };
  velocityTrend: Array<{ week: string; velocity: number }>;
  healthDistribution: { healthy: number; atRisk: number; critical: number };
  tasksByStatus: { done: number; inProgress: number; blocked: number; todo: number };
  projectComparison: Array<ProjectMetrics>;
}
```

**POST /api/reports/generate**
```typescript
{
  projectId: string;
  template: 'weekly-status' | 'sprint-retro' | 'executive' | 'custom';
  config: {
    timeRange: { start: string; end: string };
    sections: string[];
    includeAiSummary: boolean;
  };
}

// Response
{
  reportId: string;
  previewUrl: string;
  downloadUrl: string;
}
```

**POST /api/reports/schedule**
```typescript
{
  reportConfig: ReportConfig;
  schedule: {
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek?: number;  // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    time: string;        // HH:MM
    timezone: string;
  };
  delivery: {
    emails?: string[];
    slackChannel?: string;
    confluencePageId?: string;
  };
}
```

### 10.2 Computed Metrics

| Metric | Calculation |
|--------|-------------|
| On-time rate | Tasks completed by due date / Total tasks with due dates |
| Velocity | Story points completed per week (rolling average) |
| Health score | Composite of velocity, blocker %, risk score, on-time % |
| Trend | Current value vs. previous period (%, absolute) |

---

## 11. Edge Cases

| Case | Handling |
|------|----------|
| Project with no tasks | Show metrics as 0 or N/A, prompt to sync |
| Very long project names | Truncate with ellipsis, full on hover |
| PDF generation fails | Show error, offer retry, fallback to web view |
| Scheduled report has no recipients | Validation error, require at least one delivery method |
| Time period has no data | Show empty state for that period |
| Cross-tool metrics mismatch | Normalize to common units, note source in tooltip |

---

## 12. Mobile Considerations

### 12.1 Responsive Layout

**Dashboard Tab:**
- Metric cards: 2x3 grid → 2x3 on tablet → 1 column on mobile
- Charts: Full width, reduced height
- Table: Horizontal scroll or card view

**Report Generation:**
- Modal → full-screen sheet
- Step indicator at top

### 12.2 Mobile Chart Interactions

- Tap to show tooltip (no hover)
- Pinch to zoom
- Swipe to pan time range

---

## 13. Accessibility

- Charts have text alternatives (data table view toggle)
- Color-blind safe palette (patterns in addition to colors)
- Metric cards readable by screen readers
- Export formats include accessible PDF option

---

## 14. Analytics Events

| Event | Properties |
|-------|------------|
| `report_generated` | `project_id`, `template`, `sections`, `format` |
| `report_exported` | `report_id`, `format` (pdf, png, link) |
| `report_scheduled` | `frequency`, `delivery_methods` |
| `dashboard_viewed` | `time_range`, `project_filter` |
| `chart_interacted` | `chart_type`, `interaction` (hover, zoom, filter) |

---

## 15. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Charting library: Recharts confirmed? Any accessibility concerns? | Engineering | Decided: Recharts (see TECHNICAL_DECISIONS.md R5) |
| 2 | Scout AI summaries: available in V1 or deferred? | Product + Engineering | Depends on LLM integration timeline. Interface defined in R2. |
| 3 | PDF generation: acceptable UX for browser print-to-PDF in V1? | Product | Server-side PDF is V2 (see R1). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Reports & Analytics transforms PM data into shareable insights that save hours of manual reporting.*
