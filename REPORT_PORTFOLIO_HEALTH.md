# Portfolio Health Report - Product Specification

**Version:** 1.0  
**Author:** Jeff, Product Director  
**Last Updated:** 2026-02-09  
**Status:** Blocked — awaiting Health Score Algorithm and Risk Data Model

**Build Priority:** 4 of 6 (after health score algorithm is defined)
**Blocked By:** Health Score Algorithm spec (X-1), Risk Data Model (X-2)

---

## 1. Overview

### Purpose
The Portfolio Health Report provides executives, engineering leads, directors, and VPs with a high-level view of project health across the entire portfolio. It aggregates data from multiple projects to identify risks, track milestones, monitor resource allocation, and assess overall portfolio performance trends.

### Target Audience
- Engineering Leads
- Engineering Directors
- VPs of Engineering
- Product Directors
- Portfolio Managers

### Use Cases
- Weekly/monthly portfolio reviews
- Risk assessment and mitigation planning
- Resource allocation decisions
- Executive reporting
- Cross-project health comparisons

---

## 2. Section-by-Section Breakdown

### Section 1: Health Scorecard Grid

**Section Name:** Portfolio Health Scorecard

**Data Points/Metrics:**
- Project name (string)
- Health score (0-100 integer)
- Status (enum: "On Track" | "At Risk" | "Blocked" | "Completed")
- Trend indicator (enum: "↑" | "→" | "↓")
- Risk count (integer, count of active risks)
- Next milestone name (string)
- Next milestone date (date)
- Days to next milestone (integer, can be negative)

**Visualization Type:** Table/Grid with conditional formatting

**Table Schema:**
| Column | Type | Sortable | Default Sort |
|--------|------|----------|--------------|
| Project Name | string | Yes | Alphabetical |
| Health Score | integer | Yes | Descending |
| Status | enum | Yes | Custom order |
| Trend | icon | No | - |
| Risk Count | integer | Yes | Descending |
| Next Milestone | string | Yes | By date |
| Days to Milestone | integer | Yes | Ascending |

**Conditional Formatting:**
- **Health Score:**
  - Green: 80-100
  - Amber: 50-79
  - Red: 0-49
- **Status:**
  - "On Track": Green badge
  - "At Risk": Amber badge
  - "Blocked": Red badge
  - "Completed": Gray badge
- **Trend Arrow:**
  - ↑ (improving): Green
  - → (stable): Gray
  - ↓ (declining): Red
- **Days to Milestone:**
  - < 0 (overdue): Red text
  - 0-7: Amber text
  - > 7: Green text

**Chart Type:** N/A (Table)

---

### Section 2: Risk Matrix Heatmap

> **⚠️ BLOCKED:** This section requires a Risk Data Model that does not yet exist. Risk data (severity, likelihood, impact, owner) has no schema, no CRUD API, and no creation UI. This section cannot be built until the Risk Management feature is specified. See Risk Review X-2.

**Section Name:** Portfolio Risk Matrix

**Data Points/Metrics:**
- Risk ID (string)
- Risk title (string)
- Likelihood score (1-5 integer)
- Impact score (1-5 integer)
- Project name (string)
- Risk category (enum: "Scope" | "Timeline" | "Resource" | "Technical" | "Dependency")
- Risk status (enum: "Active" | "Mitigated" | "Resolved")

**Visualization Type:** Heatmap (5x5 grid)

**Chart Type:** Custom heatmap using Recharts (scatter plot with color intensity)

> **TECHNICAL NOTE:** Recharts does not natively support heatmaps. This requires significant custom SVG work or a lightweight heatmap library. Budget 3-5 days for this component alone.

**Axis Labels:**
- X-axis: Impact (1-5, Low to High)
- Y-axis: Likelihood (1-5, Low to High)

**Color Scheme:**
- Low risk (1-2 impact, 1-2 likelihood): Green (#10B981)
- Medium risk (3 impact/likelihood): Amber (#F59E0B)
- High risk (4-5 impact, 4-5 likelihood): Red (#EF4444)
- Critical risk (5 impact, 5 likelihood): Dark Red (#DC2626)

**Interactivity:**
- Hover: Show risk details tooltip (title, project, category, status)
- Click: Navigate to risk detail page (V2)

---

### Section 3: Milestone Tracker

**Section Name:** Portfolio Milestone Timeline

**Data Points/Metrics:**
- Project name (string)
- Milestone name (string)
- Milestone date (date)
- Milestone status (enum: "Upcoming" | "At Risk" | "Overdue" | "Completed")
- Milestone type (enum: "Release" | "Sprint End" | "Phase Gate" | "Custom")

**Visualization Type:** Timeline/Gantt-style bar chart

> **V1 NOTE:** Milestone data maps from Jira Versions/Releases only. Monday.com and Asana milestone mapping is undefined until V1.1/V1.2. For V1, show "Milestone data unavailable" for non-Jira projects.

**Chart Type:** Horizontal stacked bar chart (Recharts BarChart)

**Axis Labels:**
- Y-axis: Project names (categorical)
- X-axis: Date range (time scale)

**Visual Elements:**
- Each project = one horizontal bar spanning date range
- Milestone markers = diamond shapes (◆) positioned at milestone dates
- Color coding:
  - Upcoming: Blue (#3B82F6)
  - At Risk: Amber (#F59E0B)
  - Overdue: Red (#EF4444)
  - Completed: Green (#10B981)

**Date Range:** Configurable (default: next 12 weeks)

---

### Section 4: Resource Allocation

**Section Name:** Project Resource Allocation

**Data Points/Metrics:**
- Project name (string)
- Team name (string)
- Allocated capacity units (float, hours)
- Total capacity units (float, hours)
- Utilization percentage (float, calculated)
- Team member count (integer)

**Visualization Type:** Stacked bar chart

**Chart Type:** Stacked horizontal bar chart (Recharts BarChart)

**Axis Labels:**
- Y-axis: Project names (categorical)
- X-axis: Capacity units (hours, numeric)

**Stack Segments:**
- Each team = one segment in the stack
- Color palette: Distinct colors per team (max 8 teams, then cycle)
- Total bar length = sum of all team allocations per project

**Additional Metrics Display:**
- Total allocated vs total capacity (text label per project)
- Utilization % (text label per project)

**Conditional Formatting:**
- Utilization < 80%: Green
- Utilization 80-100%: Amber
- Utilization > 100%: Red

---

### Section 5: Health Trend

**Section Name:** Portfolio Health Score Trend

**Data Points/Metrics:**
- Date (date, weekly aggregation)
- Portfolio health score (float, 0-100, weighted average)
- Project count (integer, number of active projects)
- On-track count (integer)
- At-risk count (integer)
- Blocked count (integer)

**Visualization Type:** Line chart with area fill

**Chart Type:** Area chart (Recharts AreaChart)

**Axis Labels:**
- X-axis: Date (time scale, weekly intervals)
- Y-axis: Health Score (0-100)

**Visual Elements:**
- Primary line: Portfolio health score (blue, #3B82F6)
- Area fill: Gradient from blue to transparent
- Reference lines:
  - Target threshold (80): Dashed green line
  - Warning threshold (50): Dashed amber line

**Time Periods:**
- 4 weeks: Daily aggregation
- 8 weeks: Weekly aggregation
- 12 weeks: Weekly aggregation

---

### Section 6: Completion Funnel

**Section Name:** Portfolio Completion Status Over Time

**Data Points/Metrics:**
- Date (date, daily/weekly aggregation)
- Done count (integer, sum of completed items)
- In Progress count (integer)
- Blocked count (integer)
- Todo count (integer)
- Total count (integer, sum of all)

**Visualization Type:** Stacked area chart

**Chart Type:** Stacked area chart (Recharts AreaChart)

**Axis Labels:**
- X-axis: Date (time scale)
- Y-axis: Item count (numeric)

**Stack Order (bottom to top):**
1. Done (green, #10B981)
2. In Progress (blue, #3B82F6)
3. Blocked (red, #EF4444)
4. Todo (gray, #6B7280)

**Interactivity:**
- Hover: Show exact counts per status at that date
- Legend: Click to toggle visibility of status layers

---

## 3. ASCII Wireframes

### Wireframe 1: Health Scorecard Grid

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Portfolio Health Scorecard                                    [Export] [⚙️]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ ┌──────────────┬──────────────┬──────────┬───────┬───────────┬─────────┐│
│ │ Project Name │ Health Score │  Status  │ Trend │ Risk Count│ Next    ││
│ │              │              │          │       │           │ Milestone││
│ ├──────────────┼──────────────┼──────────┼───────┼───────────┼─────────┤│
│ │ Mobile App   │      85      │ On Track │   ↑   │     2     │ v2.0    ││
│ │              │    [GREEN]   │  [GREEN] │ [GREEN]│           │ (12d)   ││
│ ├──────────────┼──────────────┼──────────┼───────┼───────────┼─────────┤│
│ │ API Gateway  │      62      │ At Risk  │   ↓   │     5     │ Launch  ││
│ │              │   [AMBER]    │  [AMBER] │ [RED] │           │ (3d)    ││
│ ├──────────────┼──────────────┼──────────┼───────┼───────────┼─────────┤│
│ │ Dashboard    │      45      │ Blocked  │   ↓   │     8     │ Beta    ││
│ │              │    [RED]     │  [RED]   │ [RED] │           │ (-5d)   ││
│ └──────────────┴──────────────┴──────────┴───────┴───────────┴─────────┘│
│                                                                           │
│ Showing 12 of 12 projects                                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 2: Risk Matrix Heatmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Portfolio Risk Matrix                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│                    Impact                                                │
│           1       2       3       4       5                              │
│        ┌───────┬───────┬───────┬───────┬───────┐                        │
│      1 │  🟢   │  🟢   │  🟡   │  🟡   │  🟠   │                        │
│        │       │       │       │       │       │                        │
│      2 │  🟢   │  🟢   │  🟡   │  🟠   │  🟠   │                        │
│        │       │       │       │       │       │                        │
│ L    3 │  🟡   │  🟡   │  🟡   │  🟠   │  🔴   │                        │
│ i      │       │       │       │       │       │                        │
│ k    4 │  🟡   │  🟠   │  🟠   │  🔴   │  🔴   │                        │
│ e      │       │       │       │       │       │                        │
│ l    5 │  🟠   │  🟠   │  🔴   │  🔴   │  🔴   │                        │
│ i      └───────┴───────┴───────┴───────┴───────┘                        │
│ h                                                                         │
│ o                                                                         │
│ o                                                                         │
│ d                                                                         │
│                                                                           │
│ Legend: 🟢 Low  🟡 Medium  🟠 High  🔴 Critical                         │
│                                                                           │
│ Hover over cells to see risk details                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 3: Milestone Tracker

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Portfolio Milestone Timeline                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ Mobile App      ────────────────────────◆───────────◆───────────────    │
│                 [Upcoming]              [At Risk]   [Upcoming]          │
│                                                                           │
│ API Gateway     ────────────────◆───────────────────────────────        │
│                 [Overdue]                                               │
│                                                                           │
│ Dashboard       ────────────────────────────────◆───────────────        │
│                 [Completed]                        [Upcoming]           │
│                                                                           │
│ ──────────────────────────────────────────────────────────────────────── │
│ Today          Week 2        Week 4        Week 6        Week 8         │
│                                                                           │
│ Legend: ◆ Milestone                                                      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Panel

### Panel Layout

**Location:** Top-right of report, collapsible panel (⚙️ icon)

**Configuration Options:**

1. **Date Range Selector**
   - Type: Dropdown with presets + custom range picker
   - Options:
     - Last 1 week
     - Last 2 weeks (default)
     - Last 4 weeks
     - Last 8 weeks
     - Last 12 weeks
     - Custom range (date picker: start date, end date)
   - Affects: Health Trend, Completion Funnel, Milestone Tracker

2. **Project Filter**
   - Type: Multi-select dropdown with search
   - Options: All projects (default) | Select specific projects
   - Search: Filter projects by name
   - Affects: All sections

3. **Team Filter**
   - Type: Multi-select dropdown
   - Options: All teams (default) | Select specific teams
   - Affects: Resource Allocation section

4. **Health Threshold Filter**
   - Type: Multi-select checkboxes
   - Options:
     - Show all (default)
     - Show only at-risk (health score < 50)
     - Show only blocked (status = "Blocked")
     - Show only on-track (health score ≥ 80)
   - Affects: Health Scorecard Grid

5. **Comparison Toggle** (V2)
   - Type: Toggle switch
   - Options: Off (default) | On (compare with previous period)
   - Affects: Health Trend, Completion Funnel

**State Persistence:**
- Save user preferences to localStorage (per user)
- URL query parameters for shareable links (V1.1)

---

## 5. Export Formats

### Web View

**Layout:**
- Full-width responsive design
- Sections stack vertically
- Charts scale to container width (max 1200px)
- Tables: Horizontal scroll if needed
- Print media query: Hide config panel, optimize spacing

**Interactive Features:**
- Hover tooltips on charts
- Sortable table columns
- Expandable sections (V2)
- Full-screen chart view (V2)

### PDF Export (Browser Print-to-PDF)

**Page Layout:**
- Page size: US Letter (8.5" x 11")
- Orientation: Portrait
- Margins: 0.5" all sides
- Header: Report title, generated date/time, page number
- Footer: "Vantage Portfolio Health Report" | Confidential

**Page Breaks:**
- Section 1 (Health Scorecard): Page 1, full page if < 15 projects
- Section 2 (Risk Matrix): Page 2
- Section 3 (Milestone Tracker): Page 3 (may span 2 pages if > 8 projects)
- Section 4 (Resource Allocation): Page 4-5
- Section 5 (Health Trend): Page 6 (top half)
- Section 6 (Completion Funnel): Page 6 (bottom half)

**PDF Optimizations:**
- Convert interactive charts to static images (Recharts `toDataURL()`)
- Remove hover states
- Ensure text is selectable (not rasterized)
- Color scheme: Print-friendly (ensure contrast)
- Table pagination: Repeat header row on each page

**Print CSS:**
```css
@media print {
  .config-panel { display: none; }
  .interactive-controls { display: none; }
  .page-break { page-break-after: always; }
  table { page-break-inside: avoid; }
}
```

### CSV Export

**File Name:** `portfolio-health-YYYY-MM-DD.csv`

**Columns (in order):**
1. Project Name
2. Health Score
3. Status
4. Trend
5. Risk Count
6. Next Milestone Name
7. Next Milestone Date
8. Days to Milestone
9. Total Capacity Units
10. Allocated Capacity Units
11. Utilization Percentage
12. Team Count
13. On Track Count
14. At Risk Count
15. Blocked Count

**Data Source:** Health Scorecard Grid (one row per project)

**Format:**
- UTF-8 encoding
- Comma delimiter
- Double-quote text fields
- Date format: YYYY-MM-DD
- Headers in first row

---

## 6. Scheduling Options

### Frequency Choices

**Type:** Dropdown selector

**Options:**
- Daily (Monday-Friday)
- Weekly (Monday morning, 9 AM user timezone)
- Bi-weekly (Every other Monday)
- Monthly (1st of month, 9 AM)
- Custom (cron expression, V2)

**Default:** Weekly

### Recipient Selector

**Type:** Multi-select with user search

**Options:**
- Current user (default, pre-selected)
- All Owners
- All Admins
- All Members
- Specific users (search by name/email)
- Distribution lists (V2)

**Constraints:**
- Sender must have Owner/Admin/Member role
- Recipients must have at least Viewer role for all selected projects
- Maximum 50 recipients (V1)

### Delivery Method

**V1:** Email only

**Email Format:**
- Subject: `Portfolio Health Report - [Date Range]`
- Body: HTML email with:
  - Summary statistics (portfolio health score, project count, risk count)
  - Link to view full report in Vantage
  - PDF attachment (generated on-demand)
- Attachment: PDF export (see Export Formats section)

**V2 Delivery Methods:**
- Slack channel/webhook
- Confluence page
- Microsoft Teams channel

**Scheduling UI:**
- Toggle: Enable scheduled delivery
- Frequency dropdown
- Recipient multi-select
- Preview: "Next delivery: [date/time]"
- Test email button

---

## 7. Data Requirements

### Minimum Integrations

**V1:** Jira integration required

**V1.1:** Monday.com integration available

**V1.2:** Asana integration available

**Multi-source:** Projects can pull data from multiple sources (e.g., Jira + Monday)

### Minimum Data Items

**Per Project:**
- At least 1 active project
- At least 1 team member assigned
- At least 1 work item (issue/task) in last 30 days

**For Health Score Calculation:**
- Minimum 5 work items per project (for statistical significance)
- At least 1 completed item (to establish baseline)

**For Risk Matrix:**
- At least 1 risk identified (can be empty state if none)

**For Milestone Tracker:**
- At least 1 milestone defined (can be empty state if none)

### Minimum History

**Health Trend:**
- Minimum 2 weeks of historical data (for trend calculation)
- If < 2 weeks: Show "Insufficient data" message

**Completion Funnel:**
- Minimum 7 days of historical data
- If < 7 days: Show current snapshot only (no trend)

**Velocity/Resource Allocation:**
- Minimum 1 week of allocation data
- If none: Show current allocation only

### Data Freshness

**Stale Data Threshold:**
- Data older than 24 hours: Show warning banner
- Data older than 7 days: Show error state (prompt to refresh)

**Refresh Mechanism:**
- Manual refresh button (triggers data sync)
- Auto-refresh: Every 15 minutes (if report is open)
- Last updated timestamp displayed in header

---

## 8. RBAC Permissions Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View report | ✅ | ✅ | ✅ | ✅ |
| Create report | ✅ | ✅ | ✅ | ❌ |
| Edit report config | ✅ | ✅ | ✅ | ❌ |
| Schedule report | ✅ | ✅ | ✅ | ❌ |
| Export PDF | ✅ | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ | ✅ |
| Share report link | ✅ | ✅ | ✅ | ✅ (read-only) |
| Delete report | ✅ | ✅ | ❌ | ❌ |
| View all projects | ✅ | ✅ | ✅ | ✅* |
| Filter by project | ✅ | ✅ | ✅ | ✅* |

*Viewer can only see projects they have access to (project-level permissions apply)

**Project-Level Permissions:**
- If user lacks access to a project, that project is excluded from:
  - Health Scorecard Grid
  - Risk Matrix (risks from that project)
  - Milestone Tracker
  - Resource Allocation
  - All aggregations and calculations

**Data Filtering:**
- Report automatically filters to user's accessible projects
- No error shown if projects are filtered out (silent filtering)

---

## 9. Empty States and Error States

### Empty State: No Projects

**Condition:** User has access to 0 projects

**Message:**
```
No projects available

You don't have access to any projects yet. Contact your administrator to get access, or integrate your first project management tool.
```

**Actions:**
- Button: "Integrate Jira" (or Monday/Asana if available)
- Link: "Contact Administrator"

**Visual:** Empty state illustration (SVG icon)

---

### Empty State: No Data

**Condition:** Projects exist but no work items in date range

**Message:**
```
No data available for selected date range

Try adjusting your date range or check that your projects have active work items.
```

**Actions:**
- Button: "Adjust Date Range"
- Link: "View All Projects"

**Visual:** Empty chart placeholder

---

### Empty State: Partial Data

**Condition:** Some projects have data, others don't

**Behavior:**
- Show projects with data normally
- In Health Scorecard: Show projects without data with "No data" badge
- Health score: "N/A" (excluded from portfolio average)
- Risk count: 0
- Milestone: "None"

**Message:** None (silent handling)

---

### Empty State: Stale Data

**Condition:** Data older than 7 days

**Banner:**
```
⚠️ Data is stale (last updated: [date])

Some information may be outdated. [Refresh Data] button
```

**Visual:** Yellow warning banner at top of report

**Action:** Refresh button triggers data sync

---

### Empty State: Single Project

**Condition:** Only 1 project in portfolio

**Behavior:**
- All sections render normally
- Health Scorecard: Single row (no sorting needed)
- Risk Matrix: Still shows (may be sparse)
- Milestone Tracker: Single row
- Resource Allocation: Single bar
- Health Trend: Still shows trend over time
- Completion Funnel: Still shows over time

**No special empty state** (single project is valid)

---

### Error State: Integration Failure

**Condition:** Jira/Monday/Asana API error

**Banner:**
```
❌ Unable to fetch data from [Integration Name]

Error: [Error message]. Please check your integration settings or contact support.
```

**Actions:**
- Link: "Check Integration Settings"
- Link: "Contact Support"

**Behavior:**
- Show cached data if available (with stale data warning)
- If no cache: Show empty state

---

### Error State: Calculation Error

**Condition:** Health score calculation fails (e.g., division by zero)

**Message:**
```
Unable to calculate health score for [Project Name]

This project may not have enough data. Health score: N/A
```

**Behavior:**
- Project still appears in grid with "N/A" health score
- Excluded from portfolio average
- Other metrics still shown if available

---

### Error State: Permission Denied

**Condition:** User tries to create/schedule but is Viewer

**Toast Notification:**
```
You don't have permission to create or schedule reports. Contact your administrator.
```

**Behavior:**
- Config panel: Disable create/schedule buttons
- Show tooltip on hover: "Viewer role cannot create reports"

---

## 10. Real Assumptions & Open Questions

### Assumptions

1. **Health Score Calculation:** Assumes we have a defined algorithm for calculating health scores (0-100) based on velocity, completion rate, blocker count, and milestone adherence. This algorithm needs to be finalized before implementation.

2. **Risk Data Source:** Assumes risks are either:
   - Manually entered in Vantage (V1)
   - Extracted from Jira labels/epics with "risk" prefix (V1.1)
   - Both (preferred)
   Need to confirm risk data model and source of truth.

3. **Milestone Mapping:** Assumes milestones map to:
   - Jira: Versions/Releases
   - Monday: Timeline columns or custom fields
   - Asana: Milestones feature
   Need to confirm exact mapping and field names per integration.

4. **Capacity Units:** Assumes organization has configured story point → hours conversion (default: 1 SP = 4h). If not configured, need fallback behavior (use raw hours if available, or show "N/A").

5. **Time Aggregation:** Assumes weekly aggregation for trends (Monday-Sunday weeks, user timezone). Need to confirm timezone handling (user timezone vs UTC vs org timezone).

6. **Project Filtering:** Assumes projects are filtered at report generation time, not dynamically. If user loses access to a project after report is created, cached report still shows it (until refresh).

### Open Questions

1. **Q1: Health Score Algorithm Details**
   - What is the exact formula for health score (0-100)?
   - What weights are applied to velocity, completion rate, blockers, milestones?
   - How do we handle projects with insufficient historical data?
   - **Decision needed:** Product/Data Science to provide algorithm spec

2. **Q2: Risk Likelihood/Impact Scoring**
   - Are likelihood and impact scores (1-5) user-entered or auto-calculated?
   - If auto-calculated, what factors determine likelihood (e.g., blocker age, dependency count)?
   - If user-entered, where is this data stored (Vantage custom fields or source system)?
   - **Decision needed:** UX/Product to define risk scoring model

3. **Q3: Multi-Source Project Aggregation**
   - If a project pulls data from both Jira and Monday, how do we handle:
     - Duplicate work items (same item synced from both)?
     - Conflicting statuses?
     - Capacity allocation (sum or average)?
   - **Decision needed:** Engineering/Product to define deduplication strategy

4. **Q4: Historical Data Retention**
   - How far back do we store historical data for trends?
   - Do we aggregate/archive old data (e.g., daily → weekly after 3 months)?
   - What happens if a project is deleted (keep historical data or purge)?
   - **Decision needed:** Engineering/Data to define retention policy

5. **Q5: Real-Time vs Batch Updates**
   - Is data refreshed in real-time (webhook) or batch (scheduled sync)?
   - For scheduled reports, do we use data snapshot at schedule time or latest data at delivery time?
   - **Decision needed:** Engineering to confirm sync architecture

6. **Q6: PDF Generation Performance**
   - Browser print-to-PDF may be slow for large datasets (20+ projects, 12 weeks of data).
   - Should we show a loading state during PDF generation?
   - Should we limit PDF export to certain date ranges (e.g., max 8 weeks)?
   - **Decision needed:** Engineering to test performance and define limits

7. **Q7: Comparison Mode (V2)**
   - For comparison toggle (previous period), what defines "previous period"?
   - Same duration shifted back (e.g., last 4 weeks vs previous 4 weeks)?
   - Same calendar period previous cycle (e.g., this month vs last month)?
   - **Decision needed:** Product to define comparison logic (even if V2)

8. **Q8: Health Score Algorithm is a Blocking Dependency**
   - The health score (0-100) is referenced in this report, Executive Summary, and the main dashboard.
   - No algorithm is defined. Executive Summary uses `(On Track × 100 + At Risk × 50) / Total` but this report lists velocity, completion rate, blockers, milestones as inputs. These WILL conflict.
   - This is NOT an engineering decision — it's a data science / product decision.
   - **Decision needed:** Standalone Health Score Algorithm spec with test cases against real data. BLOCKING — do not build until resolved.

---

## Appendix: Technical Notes

### Chart Library: Recharts

**Components Used:**
- `BarChart` (Resource Allocation, Milestone Tracker)
- `AreaChart` (Health Trend, Completion Funnel)
- `ScatterChart` (Risk Matrix heatmap, custom implementation)
- `ResponsiveContainer` (all charts)

**Tree-Shaking:**
- Import only needed components: `import { BarChart, Bar, XAxis, YAxis, ... } from 'recharts'`
- Ensure build tool (Webpack/Vite) supports tree-shaking

**React Native Compatibility:**
- Recharts supports React Native via `react-native-svg`
- Test on mobile devices if Vantage has mobile app (V2)

### Data Fetching

**API Endpoints (to be defined by Backend):**
- `GET /api/v1/reports/portfolio-health` (with query params: dateRange, projectIds, teamIds)
- Response schema: TBD (Backend to provide)

**Caching:**
- Cache report data for 15 minutes (client-side)
- Invalidate on manual refresh
- Stale-while-revalidate pattern for scheduled reports

### Performance Considerations

**Large Datasets:**
- Paginate Health Scorecard table (20 rows per page)
- Limit Risk Matrix to top 50 risks (by impact × likelihood)
- Aggregate data server-side when possible (don't send raw work items)

**Chart Rendering:**
- Lazy load charts (render on scroll into viewport)
- Debounce config panel changes (wait 500ms before refetch)

---

**End of Specification**
