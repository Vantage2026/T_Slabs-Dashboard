# Sprint Summary Report - Product Specification

**Version:** 1.0  
**Author:** Jeff, Product Director  
**Last Updated:** 2026-02-09  
**Status:** Ready for Engineering
**Build Priority:** 1 of 6 (simplest, Jira-native data, self-contained)

---

## 1. Overview

### Purpose
The Sprint Summary Report provides scrum masters and engineering managers with a comprehensive view of sprint performance, including velocity trends, burndown progress, completed work, carryover items, and individual contributions. It helps teams identify patterns, blockers, and areas for improvement in sprint execution.

### Target Audience
- Scrum Masters
- Engineering Managers
- Team Leads
- Product Owners (view-only)

### Use Cases
- Sprint retrospective preparation
- Sprint review presentations
- Velocity tracking and planning
- Identifying sprint blockers and scope changes
- Performance reviews (individual contributions)

---

## 2. Section-by-Section Breakdown

### Section 1: Sprint Scorecard

**Section Name:** Sprint Overview Scorecard

**Data Points/Metrics:**
- Sprint name (string)
- Sprint start date (date)
- Sprint end date (date)
- Sprint status (enum: "Active" | "Completed" | "Planning")
- Planned story points (integer)
- Completed story points (integer)
- Carryover story points (integer)
- Commitment ratio (float, completed / planned)
- Scope change story points (integer, items added during sprint)
- Scope change percentage (float, scope change / planned × 100)
- Blocker count (integer, active blockers)
- Average PR merge time (float, hours, if available)

**Visualization Type:** Card-based layout (4-6 metric cards)

**Card Layout:**
Each card displays:
- Metric name (label)
- Metric value (large number)
- Trend indicator (if applicable, vs previous sprint)
- Color coding (green/amber/red)

**Conditional Formatting:**
- **Commitment Ratio:**
  - Green: ≥ 0.95 (95%+)
  - Amber: 0.80-0.94 (80-94%)
  - Red: < 0.80 (< 80%)
- **Scope Change %:**
  - Green: ≤ 5%
  - Amber: 6-15%
  - Red: > 15%
- **Blocker Count:**
  - Green: 0
  - Amber: 1-2
  - Red: ≥ 3
- **PR Merge Time:**
  - Green: < 4 hours
  - Amber: 4-8 hours
  - Red: > 8 hours

**Chart Type:** N/A (Cards)

---

### Section 2: Velocity Chart

**Section Name:** Sprint Velocity Trend

**Data Points/Metrics:**
- Sprint name (string)
- Sprint end date (date)
- Planned story points (integer)
- Completed story points (integer)
- Velocity (integer, completed story points)
- Trend line value (float, moving average or linear regression)

**Visualization Type:** Bar chart with trend line overlay

**Chart Type:** Composed chart (Recharts ComposedChart: BarChart + LineChart)

**Axis Labels:**
- X-axis: Sprint names (categorical, last 6-8 sprints)
- Y-axis: Story Points (numeric, 0 to max + 20% padding)

**Visual Elements:**
- Bars: Completed story points (blue, #3B82F6)
- Bars (secondary): Planned story points (gray, #9CA3AF, semi-transparent, behind completed)
- Trend line: Moving average (dashed green line, #10B981)
- Reference line: Target velocity (dashed horizontal line, if configured)

**Data Range:** Last 6-8 sprints (configurable, default: 6)

**Interactivity:**
- Hover: Show exact values (planned, completed, velocity)
- Click: Navigate to sprint detail (V2)

---

### Section 3: Burndown Chart

**Section Name:** Sprint Burndown

**Data Points/Metrics:**
- Date (date, daily)
- Ideal remaining (integer, linear decrease from planned to 0)
- Actual remaining (integer, sum of incomplete story points)
- Scope added (integer, story points added on this date)
- Scope removed (integer, story points removed on this date)

**Visualization Type:** Line chart with annotations

**Chart Type:** Line chart (Recharts LineChart)

**Axis Labels:**
- X-axis: Date (time scale, sprint start to end)
- Y-axis: Remaining Story Points (numeric, 0 to planned + padding)

**Visual Elements:**
- Ideal line: Dashed gray line (#6B7280), linear from planned to 0
- Actual line: Solid blue line (#3B82F6)
- Scope change markers:
  - Scope added: Red upward arrow (▲) at date
  - Scope removed: Green downward arrow (▼) at date
- Today marker: Vertical dashed line (if sprint is active)

**Annotations:**
- Hover on scope change marker: Tooltip showing "Added X SP" or "Removed X SP" with item titles

**Empty State:** If sprint has no daily data, show only start/end points

---

### Section 4: Completed Items Table

**Section Name:** Completed Work Items

**Data Points/Metrics:**
- Item title (string)
- Item ID (string, e.g., Jira ticket number)
- Assignee (string, user name)
- Story points (integer)
- Status (enum: "Done" | "Completed" | "Closed")
- Source system (enum: "Jira" | "Monday" | "Asana")
- Completed date (date)
- Time to complete (integer, days from start to completion)

**Visualization Type:** Sortable table

**Table Schema:**
| Column | Type | Sortable | Default Sort |
|--------|------|----------|--------------|
| Title | string | Yes | - |
| ID | string | Yes | - |
| Assignee | string | Yes | Alphabetical |
| Story Points | integer | Yes | Descending |
| Status | enum | Yes | - |
| Source | enum | No | - |
| Completed Date | date | Yes | Descending |
| Time to Complete | integer | Yes | Ascending |

**Conditional Formatting:**
- **Time to Complete:**
  - Green: ≤ 3 days
  - Amber: 4-7 days
  - Red: > 7 days
- **Story Points:**
  - Highlight large items (≥ 8 SP) with bold text

**Pagination:** 25 items per page

---

### Section 5: Carryover Items Table

**Section Name:** Items Not Completed

**Data Points/Metrics:**
- Item title (string)
- Item ID (string)
- Assignee (string)
- Story points (integer)
- Status (enum: "In Progress" | "Blocked" | "Todo")
- Blocker reason (string, if blocked)
- Blocker type (enum: "Dependency" | "Technical" | "Resource" | "Scope" | "Other")
- Percent complete (integer, 0-100, estimated)
- Planned completion date (date, original estimate)

**Visualization Type:** Sortable table with expandable rows

**Table Schema:**
| Column | Type | Sortable | Default Sort |
|--------|------|----------|--------------|
| Title | string | Yes | - |
| ID | string | Yes | - |
| Assignee | string | Yes | Alphabetical |
| Story Points | integer | Yes | Descending |
| Status | enum | Yes | Custom order (Blocked > In Progress > Todo) |
| Blocker Reason | string | No | - |
| Percent Complete | integer | Yes | Descending |

**Conditional Formatting:**
- **Status:**
  - "Blocked": Red badge
  - "In Progress": Amber badge
  - "Todo": Gray badge
- **Blocker Reason:**
  - Show only if status = "Blocked"
  - Truncate to 50 chars, expand on hover/click

**Expandable Rows:**
- Click row to expand: Show full blocker reason, planned completion date, related items

---

### Section 6: Individual Contributions

**Section Name:** Team Member Contributions

> **PRIVACY NOTE (T4):** Individual contribution visibility must respect org-level workload visibility settings from TECHNICAL_DECISIONS.md T4. Default mode is "Team Aggregate" — individual bars should only appear when org has enabled "Transparent" mode. In default mode, show team-level aggregate only. This contradicts the current spec which says "visible to all team members."

**Data Points/Metrics:**
- Team member name (string)
- Committed story points (integer, assigned at sprint start)
- Completed story points (integer)
- Completion ratio (float, completed / committed)
- Item count completed (integer)
- Average time to complete (float, days)

**Visualization Type:** Horizontal stacked bar chart

**Chart Type:** Horizontal bar chart (Recharts BarChart)

**Axis Labels:**
- Y-axis: Team member names (categorical)
- X-axis: Story Points (numeric)

**Visual Elements:**
- Bar segments:
  - Completed: Green (#10B981), solid
  - Not completed: Gray (#E5E7EB), semi-transparent
- Bar length: Committed story points
- Completion ratio: Text label on bar (e.g., "85%")

**Sorting:** By completed story points (descending)

**Conditional Formatting:**
- **Completion Ratio:**
  - Green bar: ≥ 0.90
  - Amber bar: 0.70-0.89
  - Red bar: < 0.70

**Interactivity:**
- Hover: Show tooltip with committed, completed, completion ratio, item count

---

### Section 7: Sprint Health Indicators

**Section Name:** Sprint Health Metrics

> **V2 LABEL:** PR Merge Time and Code Review Time require Git provider integration (GitHub/GitLab/Bitbucket) which is NOT in V1 scope. These metrics must be hidden or show "N/A" in V1. Deployment frequency is also V2.

**Data Points/Metrics:**
- Scope change percentage (float, already in scorecard, repeated here with trend)
- Blocker rate (float, blocker count / total items × 100)
- Average PR merge time (float, hours)
- PR merge time trend (enum: "↑" | "→" | "↓", vs previous sprint)
- Code review time (float, hours, if available, V2)
- Deployment frequency (integer, deployments per sprint, V2)

**Visualization Type:** Metric cards with trend indicators

**Card Layout:**
- Metric name
- Current value
- Trend arrow (vs previous sprint)
- Mini sparkline (last 4 sprints, V2)

**Conditional Formatting:**
- **Blocker Rate:**
  - Green: ≤ 5%
  - Amber: 6-15%
  - Red: > 15%
- **PR Merge Time:**
  - Green: < 4 hours
  - Amber: 4-8 hours
  - Red: > 8 hours

**Chart Type:** N/A (Cards, sparklines V2)

---

## 3. ASCII Wireframes

### Wireframe 1: Sprint Scorecard

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Sprint Summary: Sprint 23 (Jan 15 - Jan 26, 2026)        [Export] [⚙️] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│ │   Planned    │ │  Completed   │ │  Carryover   │ │  Commitment  │   │
│ │              │ │              │ │              │ │    Ratio     │   │
│ │     42 SP    │ │    38 SP     │ │     4 SP     │ │    90.5%     │   │
│ │              │ │   [GREEN]    │ │   [AMBER]    │ │   [AMBER]    │   │
│ │              │ │              │ │              │ │   ↓ 5% vs prev│   │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
│                                                                           │
│ ┌──────────────┐ ┌──────────────┐                                     │
│ │ Scope Change │ │   Blockers   │                                     │
│ │              │ │              │                                     │
│ │   +6 SP (14%)│ │      2       │                                     │
│ │   [AMBER]    │ │   [AMBER]    │                                     │
│ │              │ │              │                                     │
│ └──────────────┘ └──────────────┘                                     │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 2: Burndown Chart

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Sprint Burndown                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ Story Points                                                             │
│    50 ┤                                                                   │
│       │     Ideal ────                                                    │
│    40 ┤        ╲                                                          │
│       │         ╲                                                         │
│    30 ┤          ╲    ▲ Scope added                                       │
│       │           ╲  ╱                                                    │
│    20 ┤            ╲╱                                                     │
│       │             │                                                     │
│    10 ┤             │                                                     │
│       │             │                                                     │
│     0 └─────────────┴─────────────────────────────────────────────────────│
│        Start    Day 3    Day 5    Day 7    Day 9    End                 │
│        [Today ────│]                                                     │
│                                                                           │
│ Legend: ─── Ideal  ─── Actual  ▲ Scope added  ▼ Scope removed           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Wireframe 3: Individual Contributions

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Team Member Contributions                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│ Alice        ████████████████████░░░░  18/20 SP (90%)                    │
│              [Completed] [Remaining]                                     │
│                                                                           │
│ Bob          ████████████████░░░░░░░░  14/18 SP (78%)                    │
│                                                                           │
│ Charlie      ████████████████████████  20/20 SP (100%)                   │
│                                                                           │
│ Diana        ██████████░░░░░░░░░░░░░░  10/16 SP (63%)                    │
│                                                                           │
│ ──────────────────────────────────────────────────────────────────────── │
│ Story Points                                                             │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Panel

### Panel Layout

**Location:** Top-right of report, collapsible panel (⚙️ icon)

**Configuration Options:**

1. **Sprint Selector**
   - Type: Dropdown
   - Options: List of available sprints (most recent first)
   - Format: "Sprint [N] - [Start Date] to [End Date]"
   - Default: Most recent completed sprint (or active sprint if exists)
   - Affects: All sections

2. **Project Selector**
   - Type: Dropdown (single select)
   - Options: All projects (default) | Select specific project
   - Note: Only shows projects with sprint data
   - Affects: All sections

3. **Team Filter**
   - Type: Multi-select dropdown
   - Options: All teams (default) | Select specific teams
   - Affects: Individual Contributions, Completed Items, Carryover Items

4. **Comparison Sprint Toggle**
   - Type: Toggle switch
   - Options: Off (default) | On (show side-by-side comparison)
   - When On: Shows second sprint selector
   - Affects: Velocity Chart, Sprint Scorecard (shows delta), Burndown Chart (overlay)

5. **Include Sub-tasks Toggle** (V1.1)
   - Type: Toggle switch
   - Options: Off (default) | On (include sub-tasks in counts)
   - Affects: All story point calculations

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
- Expandable carryover item rows
- Full-screen chart view (V2)

### PDF Export (Browser Print-to-PDF)

**Page Layout:**
- Page size: US Letter (8.5" x 11")
- Orientation: Portrait
- Margins: 0.5" all sides
- Header: Report title, sprint name/dates, page number
- Footer: "Vantage Sprint Summary Report" | Confidential

**Page Breaks:**
- Section 1 (Sprint Scorecard): Page 1 (top half)
- Section 2 (Velocity Chart): Page 1 (bottom half)
- Section 3 (Burndown Chart): Page 2 (full page)
- Section 4 (Completed Items): Page 3-4 (pagination if > 25 items)
- Section 5 (Carryover Items): Page 5 (or continue from page 4)
- Section 6 (Individual Contributions): Page 6 (top half)
- Section 7 (Health Indicators): Page 6 (bottom half)

**PDF Optimizations:**
- Convert interactive charts to static images
- Remove hover states and expandable rows
- Ensure text is selectable
- Table pagination: Repeat header row on each page
- If comparison mode: Side-by-side layout (2 columns)

**Print CSS:**
```css
@media print {
  .config-panel { display: none; }
  .interactive-controls { display: none; }
  .page-break { page-break-after: always; }
  table { page-break-inside: avoid; }
  .expandable-row-content { display: block; } /* Expand all rows */
}
```

### CSV Export

**File Name:** `sprint-summary-[sprint-name]-YYYY-MM-DD.csv`

**Export Options (user selects):**
1. Completed Items Only
2. Carryover Items Only
3. Both (separate sheets, V2) or combined CSV

**Columns - Completed Items:**
1. Item Title
2. Item ID
3. Assignee
4. Story Points
5. Status
6. Source System
7. Completed Date
8. Time to Complete (days)

**Columns - Carryover Items:**
1. Item Title
2. Item ID
3. Assignee
4. Story Points
5. Status
6. Blocker Reason
7. Blocker Type
8. Percent Complete
9. Planned Completion Date

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
- End of sprint (automatically when sprint ends)
- Daily during sprint (Monday-Friday, 9 AM user timezone)
- Weekly (Monday morning)
- Custom (cron expression, V2)

**Default:** End of sprint

**Special Handling:**
- "End of sprint" triggers automatically when sprint status changes to "Completed"
- Other frequencies only apply to active sprints

### Recipient Selector

**Type:** Multi-select with user search

**Options:**
- Current user (default, pre-selected)
- Sprint team members (auto-populated from sprint)
- All Scrum Masters
- All Engineering Managers
- Specific users (search by name/email)
- Distribution lists (V2)

**Constraints:**
- Sender must have Owner/Admin/Member role
- Recipients must have at least Viewer role for the project
- Maximum 50 recipients (V1)

### Delivery Method

**V1:** Email only

**Email Format:**
- Subject: `Sprint Summary: [Sprint Name] - [Date Range]`
- Body: HTML email with:
  - Sprint scorecard summary (key metrics)
  - Link to view full report in Vantage
  - PDF attachment (generated on-demand)
- Attachment: PDF export

**V2 Delivery Methods:**
- Slack channel/webhook
- Confluence page
- Microsoft Teams channel

**Scheduling UI:**
- Toggle: Enable scheduled delivery
- Frequency dropdown
- Recipient multi-select
- Preview: "Next delivery: [date/time]" or "On sprint completion"
- Test email button

---

## 7. Data Requirements

### Minimum Integrations

**V1:** Jira integration required (Jira supports sprints natively)

**V1.1:** Monday.com integration (sprints mapped to timeline groups or custom fields)

**V1.2:** Asana integration (sprints mapped to sections or custom fields)

**Note:** Sprint concept may not exist in all systems. Need fallback:
- If no sprint data: Show error state (see Empty States)
- Alternative: Allow manual sprint definition in Vantage (V1.1)

### Minimum Data Items

**Per Sprint:**
- At least 1 work item assigned to sprint
- At least 1 team member assigned to sprint items
- Sprint start and end dates defined

**For Velocity Calculation:**
- Minimum 2 completed sprints (to show trend)
- If only 1 sprint: Show single bar, no trend line

**For Burndown:**
- Minimum 2 data points (start and end)
- Ideal: Daily data points throughout sprint
- If sparse data: Interpolate or show only available points

**For Individual Contributions:**
- At least 1 team member with assigned items
- If no assignments: Show "No assignments" message

### Minimum History

**Velocity Chart:**
- Minimum 2 sprints (to show comparison)
- If < 2 sprints: Show single bar with message "More sprints needed for trend"

**Burndown:**
- Minimum sprint start date (can show incomplete burndown for active sprint)
- If sprint hasn't started: Show error state

**Health Indicators:**
- PR merge time: Requires integration with Git provider (GitHub/GitLab/Bitbucket)
- If not available: Hide metric or show "N/A"

### Data Freshness

**Stale Data Threshold:**
- Data older than 24 hours: Show warning banner
- For completed sprints: Data should be final (no stale warning)

**Refresh Mechanism:**
- Manual refresh button
- Auto-refresh: Every 15 minutes (if sprint is active and report is open)
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
| View sprint data | ✅ | ✅ | ✅ | ✅* |
| View individual contributions | ✅ | ✅ | ✅ | ✅* |

*Viewer can only see sprints from projects they have access to

**Project-Level Permissions:**
- If user lacks access to project, sprint data is excluded
- Individual contributions: Filtered to user's accessible projects

**Privacy Considerations:**
- Individual contributions are visible to all team members (no privacy masking)
- If org requires privacy: Show aggregate only (V2 feature)

---

## 9. Empty States and Error States

### Empty State: No Sprints Available

**Condition:** Project has no sprints defined

**Message:**
```
No sprints found

This project doesn't have any sprints yet. Create a sprint in your project management tool (Jira/Monday/Asana) or configure sprint settings.
```

**Actions:**
- Button: "Configure Sprint Settings" (V1.1)
- Link: "View Project Settings"

**Visual:** Empty state illustration

---

### Empty State: Sprint Has No Items

**Condition:** Selected sprint has 0 work items

**Message:**
```
Sprint has no work items

This sprint doesn't have any items assigned. Add items to the sprint in your project management tool.
```

**Actions:**
- Link: "Open in [Jira/Monday/Asana]"
- Button: "Select Different Sprint"

**Visual:** Empty chart/table placeholders

---

### Empty State: Sprint Not Started

**Condition:** Sprint start date is in the future

**Message:**
```
Sprint hasn't started yet

Start date: [Date]. Check back after the sprint begins.
```

**Behavior:**
- Show sprint details (name, dates, planned items)
- Hide burndown chart (or show placeholder)
- Hide completed items table
- Show planned items in "Carryover" table (labeled as "Planned")

**Actions:**
- Button: "Select Completed Sprint"

---

### Empty State: Incomplete Burndown Data

**Condition:** Sprint is active but has < 3 data points

**Message:**
```
Limited burndown data

Daily updates will appear as the sprint progresses. Currently showing [N] data points.
```

**Behavior:**
- Show available data points
- Show ideal line
- Note: "More data points needed for accurate trend"

---

### Empty State: No Completed Items

**Condition:** Sprint ended with 0 completed items

**Message:**
```
No items completed in this sprint

All items were carried over or removed. Review carryover items below.
```

**Behavior:**
- Show carryover items table normally
- Completed items table: Empty state message
- Velocity: 0 SP (still show bar)
- Commitment ratio: 0%

---

### Error State: Sprint Data Sync Failure

**Condition:** Unable to fetch sprint data from integration

**Banner:**
```
❌ Unable to fetch sprint data

Error: [Error message]. Please check your integration settings or contact support.
```

**Actions:**
- Link: "Check Integration Settings"
- Link: "Contact Support"

**Behavior:**
- Show cached data if available (with stale warning)
- If no cache: Show empty state

---

### Error State: Invalid Sprint Selection

**Condition:** Selected sprint no longer exists or user lost access

**Message:**
```
Sprint not found or access denied

The selected sprint is no longer available. Please select a different sprint.
```

**Actions:**
- Button: "Select Sprint" (opens sprint selector)

**Behavior:**
- Auto-redirect to most recent available sprint

---

### Error State: Calculation Error

**Condition:** Story point calculation fails (e.g., null values)

**Message:**
```
Unable to calculate some metrics

Some items may be missing story points. Review individual items below.
```

**Behavior:**
- Show available metrics
- Mark incomplete metrics as "N/A"
- Log error for debugging

---

### Error State: Comparison Sprint Mismatch

**Condition:** Comparison sprint is from different project or has incompatible data

**Message:**
```
Cannot compare sprints

Selected sprints are from different projects or have incompatible data structures.
```

**Actions:**
- Button: "Select Different Sprint"

**Behavior:**
- Disable comparison mode
- Show single sprint view

---

## 10. Real Assumptions & Open Questions

### Assumptions

1. **Sprint Definition:** Assumes sprints are well-defined in source systems (Jira: Sprint board, Monday: Timeline group, Asana: Section with dates). If sprint concept doesn't exist, need manual mapping (V1.1).

2. **Story Points:** Assumes story points are the primary estimation unit. If a project uses hours or other units, need conversion or fallback to item count.

3. **Sprint Status:** Assumes sprint status can be determined from dates:
   - Active: Current date between start and end
   - Completed: Current date > end date
   - Planning: Current date < start date
   Need to confirm if source systems provide explicit status field.

4. **Scope Change Detection:** Assumes we can track when items are added/removed from sprint after sprint start. Requires:
   - Historical sprint membership data
   - Or: Compare sprint start snapshot vs current items
   Need to confirm data availability.

5. **Burndown Calculation:** Assumes "remaining story points" = sum of incomplete items' story points. If items are partially complete, need to handle fractional story points or percent complete.

6. **PR Merge Time:** Assumes Git provider integration (GitHub/GitLab/Bitbucket) is available and linked to work items. If not available, metric is hidden or shows "N/A".

### Open Questions

1. **Q1: Sprint Mapping for Non-Sprint Systems**
   - How do we map Monday.com and Asana data to "sprints" if they don't have native sprint concept?
   - Do we use date ranges? Custom fields? Manual configuration?
   - What happens if a project uses both Jira (with sprints) and Monday (without sprints)?
   - **Decision needed:** Product/Engineering to define sprint mapping strategy

2. **Q2: Scope Change Tracking Accuracy**
   - How do we accurately detect scope changes mid-sprint?
   - Do we compare sprint start snapshot vs current state?
   - What if an item was added on day 1 but we only sync daily? (false positive)
   - How do we handle items that were planned but never added to sprint?
   - **Decision needed:** Engineering/Data to define scope change detection algorithm

3. **Q3: Partial Story Point Completion**
   - If an item is "50% complete" but not done, how do we calculate burndown?
   - Do we use fractional story points (e.g., 5 SP item, 50% done = 2.5 SP remaining)?
   - Or do we only count fully completed items?
   - **Decision needed:** Product to define completion calculation method

4. **Q4: Carryover Item Status Mapping**
   - When an item carries over, does it keep its original status ("In Progress") or get reset?
   - How do we distinguish "carried over" vs "newly added in next sprint"?
   - Should carryover items be automatically added to next sprint in Vantage?
   - **Decision needed:** Product/UX to define carryover workflow

5. **Q5: Velocity Calculation Method**
   - Should velocity be simple sum of completed SP, or weighted by sprint duration?
   - How do we handle sprints of different lengths (1 week vs 2 weeks)?
   - Should we normalize to "story points per week"?
   - **Decision needed:** Product/Data Science to define velocity formula

6. **Q6: PR Merge Time Attribution**
   - How do we link PRs to sprint work items?
   - Via commit messages? Branch names? Manual linking?
   - What if a PR addresses multiple items?
   - What if a PR is merged but item isn't marked done?
   - **Decision needed:** Engineering to define PR-to-item linking strategy

7. **Q7: Comparison Mode Implementation**
   - For side-by-side comparison, do we show:
     - Two full reports side-by-side?
     - Delta view (differences only)?
     - Overlay charts (both lines on same chart)?
   - **Decision needed:** Product/UX to define comparison UI (even if V2)

8. **Q8: Historical Sprint Data Retention**
   - How far back do we store sprint data?
   - Do we aggregate old sprint data (e.g., archive after 6 months)?
   - What happens to velocity trends if old data is purged?
   - **Decision needed:** Engineering/Data to define retention policy

9. **Q9: Sprint Mapping is V1-Jira-Only**
   - Monday.com and Asana don't have native sprint concepts. This report is effectively Jira-only for V1.
   - The spec should be explicit: V1 supports Jira sprints only. V1.1+ needs sprint mapping strategy for non-Jira tools.
   - For V1, if the selected project uses Monday or Asana, show: "Sprint data requires Jira integration. Connect Jira or wait for sprint mapping support."
   - **Decision needed:** Confirm this report is Jira-only for V1.

---

## Appendix: Technical Notes

### Chart Library: Recharts

**Components Used:**
- `ComposedChart` (Velocity Chart: bars + trend line)
- `LineChart` (Burndown Chart)
- `BarChart` (Individual Contributions)
- `ResponsiveContainer` (all charts)

**Tree-Shaking:**
- Import only needed components
- Ensure build tool supports tree-shaking

### Data Fetching

**API Endpoints (to be defined by Backend):**
- `GET /api/v1/reports/sprint-summary` (with query params: sprintId, projectId, teamIds, compareSprintId)
- Response schema: TBD (Backend to provide)

**Caching:**
- Cache sprint data for 15 minutes (client-side)
- For completed sprints: Cache indefinitely (data is final)
- Invalidate on manual refresh

### Performance Considerations

**Large Sprints:**
- Paginate tables (25 items per page)
- Limit velocity chart to 8 sprints (configurable)
- Lazy load charts (render on scroll)

**Burndown Rendering:**
- If sprint has 100+ daily data points, aggregate to weekly for display
- Show "Daily" vs "Weekly" toggle (V2)

---

**End of Specification**
