# Team Workload Report - Product Specification

**Version:** 1.0  
**Author:** Jeff, Product Director  
**Last Updated:** 2026-02-09  
**Status:** Ready for Engineering
**Build Priority:** 2 of 6 (depends on capacity config, minimal new data)

---

## 1. Overview

### Purpose
The Team Workload Report provides engineering managers and resource planners with visibility into team capacity, utilization, and workload distribution across projects. It helps identify overloaded team members, forecast capacity constraints, and optimize resource allocation to prevent burnout and ensure sustainable delivery.

### Target Audience
- Engineering Managers
- Resource Planners
- Team Leads
- HR/People Ops (view-only, with privacy controls)

### Use Cases
- Weekly capacity planning
- Identifying overloaded team members
- Project resource allocation decisions
- Burnout prevention
- Hiring planning (identifying capacity gaps)
- Workload balancing across teams

---

## 2. Section-by-Section Breakdown

### Section 1: Team Summary Cards

**Section Name:** Team Capacity Overview

**Data Points/Metrics:**
- Team name (string)
- Total capacity units (float, hours, sum of all team members)
- Total allocated units (float, hours, sum of all assigned work)
- Utilization percentage (float, allocated / capacity × 100)
- Overloaded count (integer, team members with utilization > 100%)
- Available count (integer, team members with utilization < 80%)
- At capacity count (integer, team members with utilization 80-100%)
- Team member count (integer)

**Visualization Type:** Card-based layout (one card per team, or aggregate card)

**Card Layout:**
Each card displays:
- Team name (header)
- Utilization percentage (large number, color-coded)
- Capacity breakdown (allocated / total capacity)
- Member status counts (overloaded / at capacity / available)
- Visual indicator: Progress bar showing utilization

**Conditional Formatting:**
- **Utilization %:**
  - Green: < 80%
  - Amber: 80-100%
  - Red: > 100%
- **Overloaded Count:**
  - Green: 0
  - Amber: 1-2
  - Red: ≥ 3

**Chart Type:** N/A (Cards with progress bars)

---

### Section 2: Individual Utilization Bars

**Section Name:** Team Member Utilization

**Data Points/Metrics:**
- Team member name (string)
- Total capacity units (float, hours, per week or per time period)
- Allocated units (float, hours, sum of assigned work)
- Utilization percentage (float, allocated / capacity × 100)
- Project breakdown (array: project name, allocated units per project)
- Available capacity (float, capacity - allocated, can be negative)

**Visualization Type:** Horizontal stacked bar chart

**Chart Type:** Stacked horizontal bar chart (Recharts BarChart)

**Axis Labels:**
- Y-axis: Team member names (categorical)
- X-axis: Capacity Units (hours, numeric)

**Stack Segments:**
- Each project = one segment in the stack
- Color palette: Distinct colors per project (max 8 projects, then cycle)
- Unallocated capacity: Gray segment (#E5E7EB) at end of bar
- Over-allocation: Red segment (#EF4444) extending beyond capacity line

**Visual Elements:**
- Capacity line: Vertical dashed line at 100% capacity (or custom threshold)
- Bar length: Allocated units (may exceed capacity line if overloaded)
- Utilization %: Text label on bar
- Project labels: Tooltip on hover showing project breakdown

**Conditional Formatting:**
- **Bar Color (if single project or aggregate):**
  - Green: < 80%
  - Amber: 80-100%
  - Red: > 100%
- **Over-allocation Segment:**
  - Red (#EF4444) for portion exceeding capacity

**Sorting:** By utilization percentage (descending)

**Privacy Mode:**
- Default: "Team Aggregate" mode (show team totals only)
- Individual breakdown: Requires org setting "Show Individual Utilization" enabled
- If disabled: Show only team-level cards, hide individual bars

---

### Section 3: Workload Heatmap

**Section Name:** Workload Over Time

**Data Points/Metrics:**
- Team member name (string)
- Week (date, week start date)
- Utilization percentage (float, 0-150%, can exceed 100%)
- Allocated units (float, hours)
- Capacity units (float, hours)

**Visualization Type:** Grid heatmap (person × week)

**Chart Type:** Custom heatmap using Recharts (scatter plot with color intensity, or custom SVG)

**Axis Labels:**
- Y-axis: Team member names (categorical)
- X-axis: Weeks (time scale, e.g., "Week of Jan 15")

**Color Scheme:**
- 0-60%: Green (#10B981, light)
- 61-80%: Light Green (#34D399)
- 81-100%: Amber (#F59E0B)
- 101-120%: Orange (#F97316)
- 121%+: Red (#EF4444, dark)

**Interactivity:**
- Hover: Show tooltip (person, week, utilization %, allocated hours, capacity hours)
- Click: Navigate to person detail view (V2)

**Privacy Mode:**
- If individual breakdown disabled: Show team aggregate rows only
- Each row = team aggregate utilization for that week

---

### Section 4: Capacity Forecast

**Section Name:** Projected Utilization

> **HONESTY NOTE:** V1 forecast is "simple: extend current allocation forward." This produces a flat line, not a true forecast. Rename section to "Current Projection" in V1 UI, not "Forecast." A flat line labeled "forecast" will undermine user trust. Label V2 for actual predictive forecasting.

**Data Points/Metrics:**
- Date (date, weekly)
- Projected utilization percentage (float, based on current trajectory)
- Confidence interval (float, upper/lower bounds, if available)
- Historical utilization (float, actual data for past weeks)
- Capacity units (float, hours, may vary if team members join/leave)

**Visualization Type:** Line chart with area fill

**Chart Type:** Area chart (Recharts AreaChart)

**Axis Labels:**
- X-axis: Date (time scale, weekly intervals)
- Y-axis: Utilization Percentage (0-150%)

**Visual Elements:**
- Historical line: Solid blue line (#3B82F6) for past weeks
- Projected line: Dashed blue line (#3B82F6) for future weeks
- Area fill: Gradient from blue to transparent
- Reference lines:
  - 100% capacity: Dashed red line (#EF4444)
  - 80% target: Dashed green line (#10B981)
- Confidence band: Light gray area (if confidence intervals available, V2)

**Time Period:** Next 2-4 weeks (configurable)

**Forecast Method:**
- Simple: Extend current allocation forward (assumes no changes)
- Advanced: Account for sprint end dates, project milestones (V2)

---

### Section 5: Overload Alerts Table

**Section Name:** Overload Warnings

**Data Points/Metrics:**
- Team member name (string)
- Current utilization percentage (float)
- Current allocated hours (float)
- Capacity hours (float)
- Over-by (float, hours, allocated - capacity, negative if under)
- Top 3 tasks (array: task title, project, allocated hours)
- Overload duration (integer, weeks overloaded)

**Visualization Type:** Sortable table

**Table Schema:**
| Column | Type | Sortable | Default Sort |
|--------|------|----------|--------------|
| Team Member | string | Yes | Alphabetical |
| Utilization % | float | Yes | Descending |
| Allocated Hours | float | Yes | Descending |
| Capacity Hours | float | Yes | - |
| Over-by | float | Yes | Descending |
| Duration | integer | Yes | Descending |
| Top Tasks | array | No | - |

**Conditional Formatting:**
- **Utilization %:**
  - Red text: > 100%
  - Amber text: 90-100%
  - Green text: < 90%
- **Over-by:**
  - Red badge: > 0 (overloaded)
  - Green badge: < 0 (under capacity)
- **Row Background:**
  - Light red: Utilization > 120%
  - Light amber: Utilization 100-120%

**Filtering:**
- Default: Show only overloaded members (utilization > 100%)
- Toggle: "Show all team members"

**Privacy Mode:**
- If individual breakdown disabled: Table hidden or shows team aggregates only

---

### Section 6: Project Allocation Breakdown

**Section Name:** Work Distribution by Project

**Data Points/Metrics:**
- Team member name (string)
- Project name (string)
- Allocated units (float, hours)
- Percentage of total allocation (float, project / total allocated × 100)

**Visualization Type:** Pie chart per person (or horizontal bar chart)

**Chart Type:** Pie chart (Recharts PieChart) - one per team member, or horizontal bar chart (alternative)

**Visual Elements:**
- Each pie chart: One team member's allocation across projects
- Color palette: Consistent colors per project across all charts
- Labels: Project name and percentage
- Legend: Shared across all charts

**Alternative Layout (if many team members):**
- Horizontal bar chart: Person × Project matrix
- Each row = one person
- Stacked segments = projects (same as Section 2, but pie view)

**Privacy Mode:**
- If individual breakdown disabled: Show team aggregate pie chart only

**Interactivity:**
- Hover: Highlight project across all charts
- Click: Filter to show only that project (V2)

---

## 3. ASCII Wireframes

### Wireframe 1: Team Summary Cards

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Team Workload Report                                        [Export] [⚙️]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Frontend Team                                                        │ │
│ │                                                                       │ │
│ │ Utilization: 95%                                    [████████░░]    │ │
│ │                                                                       │ │
│ │ Capacity: 320h allocated / 336h total                                │ │
│ │                                                                       │ │
│ │ Status: 2 overloaded | 3 at capacity | 3 available                   │ │
│ │                                                                       │ │
│ │ Members: 8                                                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Backend Team                                                         │ │
│ │                                                                       │ │
│ │ Utilization: 78%                                    [███████░░░]    │ │
│ │                                                                       │ │
│ │ Capacity: 280h allocated / 360h total                                │ │
│ │                                                                       │ │
│ │ Status: 0 overloaded | 2 at capacity | 6 available                  │ │
│ │                                                                       │ │
│ │ Members: 8                                                            │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 2: Individual Utilization Bars

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Team Member Utilization                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ Alice        ████████████████████░░░░░░░░  40h / 40h (100%)             │
│              [Project A] [Project B] [Available]                         │
│                                                                           │
│ Bob          ████████████████████████░░░░  45h / 40h (113%) ⚠️          │
│              [Project A] [Project C] [Over-allocated]                    │
│                                                                           │
│ Charlie      ████████████░░░░░░░░░░░░░░░░  24h / 40h (60%)              │
│              [Project B] [Available]                                     │
│                                                                           │
│ ──────────────────────────────────────────────────────────────────────── │
│ Capacity Units (hours)                                                   │
│ │100% Capacity│                                                          │
│                                                                           │
│ Legend: [Project A] [Project B] [Project C] [Available] [Over-allocated]│
└─────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 3: Workload Heatmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Workload Over Time                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                    Week 1  Week 2  Week 3  Week 4                        │
│                                                                           │
│ Alice        │  🟢  │  🟡  │  🟡  │  🟢  │                               │
│              │ 65%  │ 85%  │ 90%  │ 70%  │                               │
│                                                                           │
│ Bob          │  🟡  │  🟠  │  🔴  │  🟠  │                               │
│              │ 95%  │105%  │125%  │110%  │                               │
│                                                                           │
│ Charlie      │  🟢  │  🟢  │  🟡  │  🟢  │                               │
│              │ 55%  │ 60%  │ 85%  │ 75%  │                               │
│                                                                           │
│ Legend: 🟢 <80%  🟡 80-100%  🟠 100-120%  🔴 >120%                     │
│                                                                           │
│ Hover over cells for details                                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Panel

### Panel Layout

**Location:** Top-right of report, collapsible panel (⚙️ icon)

**Configuration Options:**

1. **Team/Group Filter**
   - Type: Multi-select dropdown
   - Options: All teams (default) | Select specific teams
   - Affects: All sections

2. **Time Range Selector**
   - Type: Dropdown with presets
   - Options:
     - This week (default)
     - Next 2 weeks
     - Next month (4 weeks)
     - Next quarter (12 weeks)
     - Custom range (date picker)
   - Affects: Workload Heatmap, Capacity Forecast, Individual Utilization

3. **Capacity Units Selector**
   - Type: Dropdown
   - Options:
     - Hours (default)
     - Story Points (converted using org config: 1 SP = X hours)
   - Affects: All capacity/allocation displays

4. **Include Viewers Toggle**
   - Type: Toggle switch
   - Options: Off (default) | On (include Viewer role members)
   - Note: Viewers typically don't have allocated work, but may have capacity
   - Affects: All sections

5. **Privacy Mode Selector** (if org setting allows)
   - Type: Dropdown (only visible if org has "Show Individual Utilization" enabled)
   - Options:
     - Team Aggregate (default, if org setting disabled)
     - Individual Breakdown (requires org setting enabled)
   - Affects: Individual Utilization Bars, Workload Heatmap, Overload Alerts, Project Allocation

6. **Capacity Threshold Override**
   - Type: Number input (optional)
   - Default: 100% (org default)
   - Options: Custom percentage (e.g., 80% for conservative planning)
   - Affects: Overload calculations, reference lines in charts

**State Persistence:**
- Save user preferences to localStorage (per user)
- Privacy mode: Respect org-level setting (cannot override if disabled)

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
- Expandable project breakdown (show all projects per person)
- Full-screen chart view (V2)

**Privacy Controls:**
- If individual breakdown disabled: Export shows team aggregates only
- PDF/CSV respect privacy settings

### PDF Export (Browser Print-to-PDF)

**Page Layout:**
- Page size: US Letter (8.5" x 11")
- Orientation: Portrait (or Landscape for heatmap, V2)
- Margins: 0.5" all sides
- Header: Report title, team name(s), time range, page number
- Footer: "Vantage Team Workload Report" | Confidential

**Page Breaks:**
- Section 1 (Team Summary Cards): Page 1
- Section 2 (Individual Utilization Bars): Page 2-3 (may span multiple pages if many team members)
- Section 3 (Workload Heatmap): Page 4 (or continue from page 3)
- Section 4 (Capacity Forecast): Page 5 (top half)
- Section 5 (Overload Alerts): Page 5 (bottom half) or Page 6
- Section 6 (Project Allocation): Page 6-7 (one pie chart per page, or grid layout)

**PDF Optimizations:**
- Convert interactive charts to static images
- Remove hover states
- Ensure text is selectable
- Table pagination: Repeat header row on each page
- Pie charts: Limit to top 5 projects per person (others grouped as "Other")

**Privacy in PDF:**
- If individual breakdown disabled: PDF shows team aggregates only
- Add watermark: "Team Aggregate View" if individual data hidden

**Print CSS:**
```css
@media print {
  .config-panel { display: none; }
  .interactive-controls { display: none; }
  .page-break { page-break-after: always; }
  table { page-break-inside: avoid; }
  .pie-chart { page-break-inside: avoid; }
}
```

### CSV Export

**File Name:** `team-workload-YYYY-MM-DD.csv`

**Export Options (user selects):**
1. Individual Utilization Only
2. Overload Alerts Only
3. Both (separate sheets, V2) or combined CSV

**Columns - Individual Utilization:**
1. Team Member Name
2. Team Name
3. Total Capacity (hours)
4. Allocated Hours
5. Utilization Percentage
6. Available Capacity (hours)
7. Project 1 Name
8. Project 1 Hours
9. Project 2 Name
10. Project 2 Hours
11. ... (up to 8 projects, then "Other")

**Columns - Overload Alerts:**
1. Team Member Name
2. Team Name
3. Utilization Percentage
4. Allocated Hours
5. Capacity Hours
6. Over-by (hours)
7. Overload Duration (weeks)
8. Top Task 1
9. Top Task 1 Project
10. Top Task 1 Hours
11. Top Task 2
12. Top Task 2 Project
13. Top Task 2 Hours
14. Top Task 3
15. Top Task 3 Project
16. Top Task 3 Hours

**Format:**
- UTF-8 encoding
- Comma delimiter
- Double-quote text fields
- Date format: YYYY-MM-DD
- Headers in first row

**Privacy in CSV:**
- If individual breakdown disabled: CSV shows team aggregates only (one row per team)

---

## 6. Scheduling Options

### Frequency Choices

**Type:** Dropdown selector

**Options:**
- Weekly (Monday morning, 9 AM user timezone)
- Bi-weekly (Every other Monday)
- Monthly (1st of month, 9 AM)
- Custom (cron expression, V2)

**Default:** Weekly

### Recipient Selector

**Type:** Multi-select with user search

**Options:**
- Current user (default, pre-selected)
- All Engineering Managers
- All Team Leads
- Team members (from selected teams)
- Specific users (search by name/email)
- Distribution lists (V2)

**Constraints:**
- Sender must have Owner/Admin/Member role
- Recipients must have at least Viewer role
- Maximum 50 recipients (V1)
- **Privacy:** If report includes individual breakdown, recipients must have permission to view individual utilization (org setting)

### Delivery Method

**V1:** Email only

**Email Format:**
- Subject: `Team Workload Report - [Team Name(s)] - [Date Range]`
- Body: HTML email with:
  - Team summary (utilization %, overloaded count)
  - Link to view full report in Vantage
  - PDF attachment (generated on-demand)
  - Privacy notice if individual data included
- Attachment: PDF export

**V2 Delivery Methods:**
- Slack channel/webhook
- Confluence page
- Microsoft Teams channel

**Scheduling UI:**
- Toggle: Enable scheduled delivery
- Frequency dropdown
- Recipient multi-select
- Privacy warning: "This report includes individual utilization data. Ensure recipients have permission to view this information."
- Preview: "Next delivery: [date/time]"
- Test email button

---

## 7. Data Requirements

### Minimum Integrations

**V1:** Jira integration required (for work item assignments)

**V1.1:** Monday.com integration available

**V1.2:** Asana integration available

**Multi-source:** Team members can have work from multiple sources

### Minimum Data Items

**Per Team:**
- At least 1 team member
- At least 1 work item assigned to team members
- Capacity defined (either explicit capacity setting or default based on role/hours)

**For Utilization Calculation:**
- Minimum 1 assigned work item per person (for allocation calculation)
- Capacity: Either user-defined capacity or default (e.g., 40 hours/week for full-time)

**For Heatmap:**
- Minimum 1 week of data
- If < 1 week: Show current week only

**For Forecast:**
- Minimum 2 weeks of historical data (for trend calculation)
- If < 2 weeks: Show current allocation extended forward (no trend)

### Minimum History

**Workload Heatmap:**
- Minimum 1 week (current week)
- Ideal: 4+ weeks for trend visibility

**Capacity Forecast:**
- Minimum 2 weeks historical (for baseline)
- Forecast period: Next 2-4 weeks (configurable)

**Overload Duration:**
- Requires historical data to calculate "weeks overloaded"
- If insufficient: Show current overload status only

### Data Freshness

**Stale Data Threshold:**
- Data older than 24 hours: Show warning banner
- Allocation data should reflect current sprint/iteration assignments

**Refresh Mechanism:**
- Manual refresh button
- Auto-refresh: Every 15 minutes (if report is open)
- Last updated timestamp displayed in header

**Capacity Updates:**
- Capacity changes (team members join/leave, part-time adjustments) should reflect within 24 hours

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
| View team workload | ✅ | ✅ | ✅ | ✅* |
| View individual utilization | ✅** | ✅** | ✅** | ❌ |

*Viewer can view team aggregates only (privacy mode enforced)

**Owner/Admin/Member can view individual utilization ONLY if org setting "Show Individual Utilization" is enabled. Otherwise, team aggregate only.

**Privacy Setting (Org-Level):**
- "Show Individual Utilization": Boolean setting (default: false)
- If disabled: All users see team aggregates only
- If enabled: Owner/Admin/Member can see individual breakdown
- Viewer role: Always sees team aggregates only (cannot override)

**Project-Level Permissions:**
- If user lacks access to a project, that project's allocation is excluded from:
  - Individual Utilization Bars
  - Project Allocation Breakdown
  - Overload Alerts (top tasks from inaccessible projects hidden)

---

## 9. Empty States and Error States

### Empty State: No Teams Available

**Condition:** User has access to 0 teams

**Message:**
```
No teams available

You don't have access to any teams yet. Contact your administrator to get access, or create your first team.
```

**Actions:**
- Button: "Create Team" (if user has permission)
- Link: "Contact Administrator"

**Visual:** Empty state illustration

---

### Empty State: No Team Members

**Condition:** Selected team(s) have 0 members

**Message:**
```
Team has no members

This team doesn't have any members assigned. Add team members to see workload data.
```

**Actions:**
- Link: "Manage Team Members"
- Button: "Select Different Team"

**Visual:** Empty state illustration

---

### Empty State: No Allocated Work

**Condition:** Team members exist but have 0 assigned work items

**Message:**
```
No work allocated

Team members don't have any assigned work items in the selected time range. This may indicate available capacity.
```

**Behavior:**
- Show team members with 0% utilization
- Show available capacity in summary cards
- Heatmap: All cells show 0% (green)

**Actions:**
- Link: "View Projects" (to assign work)
- Button: "Adjust Time Range"

---

### Empty State: No Capacity Defined

**Condition:** Team members exist but capacity is not set (no default)

**Message:**
```
Capacity not defined

Team members don't have capacity settings. Set capacity in team settings or user profiles to calculate utilization.
```

**Actions:**
- Button: "Set Default Capacity" (if user has permission)
- Link: "Team Settings"

**Behavior:**
- Show allocation hours only (no utilization %)
- Hide utilization-based charts
- Show allocation totals in tables

---

### Empty State: Insufficient Historical Data

**Condition:** < 2 weeks of data for forecast

**Message:**
```
Limited historical data

Forecast requires at least 2 weeks of historical data. Currently showing [N] weeks. Check back in [X] days for forecast.
```

**Behavior:**
- Show available historical data
- Forecast section: Show "Insufficient data" message
- Heatmap: Show available weeks only

---

### Empty State: No Overloads

**Condition:** No team members with utilization > 100%

**Message:**
```
✅ No overloads detected

All team members are within capacity. Great job managing workload!
```

**Behavior:**
- Overload Alerts table: Empty state message
- Summary cards: Show "0 overloaded" (green)
- Still show all other sections normally

---

### Error State: Integration Failure

**Condition:** Unable to fetch work item data from integration

**Banner:**
```
❌ Unable to fetch work allocation data

Error: [Error message]. Please check your integration settings or contact support.
```

**Actions:**
- Link: "Check Integration Settings"
- Link: "Contact Support"

**Behavior:**
- Show cached data if available (with stale warning)
- If no cache: Show empty state

---

### Error State: Capacity Calculation Error

**Condition:** Division by zero or null capacity values

**Message:**
```
Unable to calculate utilization for [Team Member Name]

Capacity may not be set. Utilization: N/A
```

**Behavior:**
- Show allocation hours only
- Mark utilization as "N/A"
- Exclude from utilization-based calculations
- Log error for debugging

---

### Error State: Privacy Restriction

**Condition:** User tries to view individual breakdown but org setting disabled

**Message:**
```
Individual utilization data is not available

Your organization has individual utilization viewing disabled for privacy. This report shows team aggregates only.
```

**Behavior:**
- Automatically switch to "Team Aggregate" mode
- Hide individual sections (Individual Utilization Bars, Workload Heatmap per person)
- Show team-level data only
- Config panel: Privacy mode selector hidden or disabled

**Actions:**
- Link: "Contact Administrator" (to enable individual viewing)
- Info icon: Tooltip explaining privacy policy

---

### Error State: Permission Denied

**Condition:** User tries to create/schedule but is Viewer

**Toast Notification:**
```
You don't have permission to create or schedule reports. Contact your administrator.
```

**Behavior:**
- Config panel: Disable create/schedule buttons
- Show tooltip: "Viewer role cannot create reports"

---

## 10. Real Assumptions & Open Questions

### Assumptions

1. **Capacity Definition:** Assumes capacity is either:
   - Explicitly set per user (hours/week)
   - Defaulted based on role (full-time = 40h/week, part-time = 20h/week)
   - Or: Calculated from calendar availability (V2)
   Need to confirm capacity data model and defaults.

2. **Work Allocation Calculation:** Assumes allocated work = sum of:
   - Assigned work items' estimated hours (or story points converted to hours)
   - Active sprint/iteration assignments
   - Ongoing project assignments
   Need to confirm how we aggregate "allocated" work (current sprint only? All active items?).

3. **Time Period Granularity:** Assumes weekly aggregation for heatmap and forecast. Daily granularity may be needed for short-term planning (V2).

4. **Story Point Conversion:** Assumes org has configured SP → hours conversion (default: 1 SP = 4h). If not configured, need fallback (use raw hours if available, or show "N/A").

5. **Privacy Controls:** Assumes org-level setting "Show Individual Utilization" exists and defaults to false (team aggregate only). Individual breakdown requires explicit opt-in.

6. **Forecast Methodology:** Assumes simple forecast (extend current allocation forward). Advanced forecasting (account for sprint end dates, project milestones, planned work) is V2.

### Open Questions

1. **Q1: Capacity Calculation Method**
   - How do we determine a team member's capacity?
     - User-defined setting in profile?
     - Default based on employment type (full-time/part-time)?
     - Calculated from calendar (working days × hours/day)?
   - What if capacity varies week-to-week (PTO, part-time schedules)?
   - Should we support capacity overrides per project (e.g., "Alice is 50% on Project A")?
   - **Decision needed:** Product/Engineering to define capacity data model

2. **Q2: Work Allocation Scope**
   - What defines "allocated work"?
     - Only items in current/active sprint?
     - All assigned items regardless of status?
     - Only items with "In Progress" or "Todo" status?
   - How do we handle items assigned but not started (do they count as allocated)?
   - What about items with no time estimate (use default? Exclude?)?
   - **Decision needed:** Product to define allocation calculation rules

3. **Q3: Multi-Project Allocation Handling**
   - If a work item belongs to multiple projects, how do we allocate it?
     - Count fully in each project (sum > 100%)?
     - Split proportionally?
     - Assign to primary project only?
   - How do we prevent double-counting in team totals?
   - **Decision needed:** Engineering/Data to define multi-project allocation logic

4. **Q4: Forecast Accuracy and Confidence**
   - How accurate should forecasts be?
     - Simple: Current allocation extended forward (assumes no changes)
     - Advanced: Account for sprint end dates, project milestones, planned work
   - Should we show confidence intervals (e.g., "80% likely to be 85-95% utilized")?
   - How do we handle uncertainty (new projects, scope changes)?
   - **Decision needed:** Product/Data Science to define forecast methodology

5. **Q5: Privacy Controls Implementation**
   - How granular should privacy controls be?
     - Org-level only (all or nothing)?
     - Team-level (some teams can see individuals, others can't)?
     - Role-based (Managers can see, ICs cannot)?
   - What about self-viewing (can team members see their own utilization even if org setting is off)?
   - Should there be an audit log of who viewed individual utilization data?
   - **Decision needed:** Product/Privacy/Legal to define privacy model

6. **Q6: Overload Alert Thresholds**
   - What defines "overloaded"?
     - > 100% utilization (hard limit)?
     - > 110% (buffer)?
     - Configurable per team/org?
   - How long does someone need to be overloaded before alerting (1 week? 2 weeks?)?
   - Should we alert on "approaching overload" (e.g., 90%+ for 2+ weeks)?
   - **Decision needed:** Product to define alert thresholds and rules

7. **Q7: Capacity Units vs Story Points**
   - Should we always convert to hours, or allow pure story point view?
   - If org uses story points but no SP→hours conversion, how do we show capacity?
   - What if some projects use SP and others use hours (mixed units)?
   - **Decision needed:** Product to define unit handling and conversion strategy

8. **Q8: Historical Data Retention for Trends**
   - How far back do we store workload data?
   - Do we aggregate old data (daily → weekly after 3 months)?
   - What happens to heatmap if we only have 4 weeks of data but user selects "last quarter"?
   - **Decision needed:** Engineering/Data to define retention and aggregation policy

9. **Q9: Team Member Changes (Join/Leave)**
   - How do we handle team members who join mid-period (capacity starts mid-week)?
   - How do we handle team members who leave (show historical data? Hide?)?
   - Should we pro-rate capacity for partial weeks?
   - **Decision needed:** Engineering to define handling of dynamic team membership

10. **Q10: Large Team Heatmap Performance**
    - The spec says "canvas rendering if >240 cells (V2)" but a 30-person team × 12 weeks = 360 cells, which exceeds this threshold on day 1 for any medium org.
    - V1 needs a practical limit: either cap at 20 team members per page with pagination, or default to 4-week view (reducing cells to 120 for 30 people).
    - **Decision needed:** Engineering to set performance budget and choose heatmap rendering strategy for V1.

---

## Appendix: Technical Notes

### Chart Library: Recharts

**Components Used:**
- `BarChart` (Individual Utilization Bars)
- `AreaChart` (Capacity Forecast)
- `PieChart` (Project Allocation Breakdown)
- Custom heatmap (Workload Heatmap, using ScatterChart or custom SVG)
- `ResponsiveContainer` (all charts)

**Tree-Shaking:**
- Import only needed components
- Ensure build tool supports tree-shaking

### Data Fetching

**API Endpoints (to be defined by Backend):**
- `GET /api/v1/reports/team-workload` (with query params: teamIds, timeRange, capacityUnits, includeViewers, privacyMode)
- Response schema: TBD (Backend to provide)

**Privacy-Aware Endpoints:**
- If privacy mode = "team aggregate": Backend returns team-level data only
- If privacy mode = "individual": Backend returns individual data (subject to user permissions)

**Caching:**
- Cache report data for 15 minutes (client-side)
- Invalidate on manual refresh
- Privacy-sensitive: Don't cache individual data if user lacks permission

### Performance Considerations

**Large Teams:**
- Paginate Individual Utilization Bars (20 members per page, V2)
- Limit Workload Heatmap to 30 members (scroll if more)
- Aggregate Project Allocation (show top 5 projects, group rest as "Other")

**Heatmap Rendering:**
- If > 20 members × 12 weeks = 240 cells, use canvas rendering instead of SVG (V2)
- Lazy load heatmap (render on scroll into viewport)

**Forecast Calculation:**
- Calculate forecast server-side (don't send raw historical data)
- Cache forecast for 1 hour (recalculate if allocation changes)

### Privacy Implementation

**Client-Side:**
- Check org setting "Show Individual Utilization" on load
- If disabled: Hide individual sections, show team aggregates only
- Don't fetch individual data if privacy mode is "team aggregate"

**Server-Side:**
- Enforce privacy at API level (don't return individual data if org setting disabled)
- Log access to individual utilization data (audit trail, V2)

---

**End of Specification**
