# REPORT_EXECUTIVE_SUMMARY.md

## Product Specification: Executive Summary Report

**Version:** 1.0  
**Last Updated:** 2026-02-09  
**Author:** Jeff, Product Director  
**Status:** Ready for Engineering (with V1 scope reductions noted inline)
**Build Priority:** 3 of 6 (aggregates existing data, with stripped metrics)

---

## 1. Overview, Purpose, and Target Audience

### Purpose
The Executive Summary Report provides a board-ready strategic overview of portfolio health, project status, and organizational performance. This report distills complex project data into digestible, actionable insights for decision-makers who need high-level visibility without technical detail.

### Target Audience
- **Primary:** C-suite executives (CEO, CFO, CTO)
- **Secondary:** Board members, investors, stakeholders
- **Tertiary:** VP-level leaders, department heads

### Key Value Proposition
- **Time-efficient:** Complete portfolio view in 2-3 pages
- **Decision-ready:** Clear RAG status, risks, and recommendations
- **Professional:** Board-meeting ready PDF output
- **Strategic:** Focus on "what matters" vs. operational detail

---

## 2. Section-by-Section Breakdown

### Section 1: Executive KPI Dashboard

**Section Name:** Executive KPI Dashboard  
**Purpose:** Headline metrics with trend indicators

**Data Points/Metrics:**
- **Projects On Track:** `X/Y` (e.g., "6/8")
  - Numerator: Projects with status = "On Track" (green RAG)
  - Denominator: Total active projects in scope
  - Trend: Week-over-week change (sparkline)
- **Portfolio Health Score:** `0-100` (e.g., "74")
  - Calculation: Weighted average of project health scores
  - Formula: `(On Track × 100 + At Risk × 50 + Off Track × 0) / Total Projects`
  - Trend: 4-week rolling average (sparkline)
- **Team Utilization:** `0-100%` (e.g., "82%")
  - Calculation: `(Total Assigned Hours / Total Available Hours) × 100`
  - Trend: Month-over-month change (sparkline)
- **Velocity Trend:** `±X%` (e.g., "+12%")
  - Calculation: `((Current Period Velocity - Previous Period Velocity) / Previous Period Velocity) × 100`
  - Trend: 4-week velocity chart (sparkline)
- **Budget Adherence:** `X%` (e.g., "94%")
  - Calculation: `(Actual Spend / Budgeted Spend) × 100`
  - Trend: Cumulative spend vs. budget (sparkline)
  > **V2 — REMOVE FROM V1:** Budget Adherence requires cost/budget tracking which Vantage does not support. No PM tool in our V1 integration set (Jira) provides budget data reliably. Remove from V1 KPI cards. Add back when budget tracking feature exists.
- **On-Time Delivery Rate:** `X%` (e.g., "78%")
  - Calculation: `(Completed On-Time / Total Completed) × 100`
  - Trend: 6-month rolling average (sparkline)
  > **V1 CAVEAT:** On-Time Delivery requires items to have due dates AND completion dates. Many Jira items lack due dates. This metric may show "Insufficient data" for most users. Consider making this optional or showing only when >50% of items have dates.

**Chart Type:** None (metric cards with sparklines)  
**Visualization:**
- 6 metric cards in 2 rows × 3 columns grid
- Each card: Large number, label, mini sparkline chart (Recharts Line, 30px height)
- Color coding:
  - Green: ≥ 80% or positive trend
  - Amber: 60-79% or neutral trend
  - Red: < 60% or negative trend

**Conditional Formatting:**
- Projects On Track: Green if ≥ 80%, Amber if 60-79%, Red if < 60%
- Portfolio Health: Green if ≥ 75, Amber if 60-74, Red if < 60
- Team Utilization: Green if 70-90%, Amber if 60-69% or 91-95%, Red if < 60% or > 95%
- Velocity Trend: Green if > 0%, Amber if -5% to 0%, Red if < -5%
- Budget Adherence: Green if 95-105%, Amber if 90-94% or 106-110%, Red if < 90% or > 110%
- On-Time Delivery: Green if ≥ 80%, Amber if 60-79%, Red if < 60%

---

### Section 2: Traffic Light Summary

**Section Name:** Traffic Light Summary  
**Purpose:** Quick visual status of all projects

**Data Points/Metrics:**
- Project name
- RAG status (Red/Amber/Green)
- One-line summary (auto-generated from project description or latest update)
- Owner (project owner name/email)
- Completion % (optional, shown on hover)

**Chart Type:** Table  
**Table Schema:**
| Column | Data Type | Sort | Width |
|--------|-----------|------|-------|
| Status | RAG dot (Red/Amber/Green) | By status priority (R→A→G) | 40px |
| Project Name | String | Alphabetical | 200px |
| Summary | String (truncated to 80 chars) | None | 300px |
| Owner | String | Alphabetical | 150px |
| Health Score | Number (0-100) | Descending | 100px |

**Conditional Formatting:**
- RAG dot: Red (#DC2626), Amber (#F59E0B), Green (#10B981)
- Row background: Light tint matching RAG status (10% opacity)
- Health Score text: Green if ≥ 75, Amber if 60-74, Red if < 60

**Data Source:**
- Projects from Jira (V1), Monday.com (V1.1), Asana (V1.2)
- RAG calculation: Based on on-time status, budget variance, risk count

---

### Section 3: Key Wins This Period

**Section Name:** Key Wins This Period  
**Purpose:** Highlight positive achievements

**Data Points/Metrics:**
- Milestone/epic completion
- Major feature launches
- Team achievements
- Process improvements

**Chart Type:** Bulleted list  
**Visualization:**
- Bullet points with icons (trophy/checkmark)
- Each win: Title, description (1-2 sentences), date, project name

**Data Source:**
- Completed milestones/epics from connected tools
- Filter: Completed within reporting period
- Auto-detection: Status transitions to "Done"/"Completed"/"Shipped"

**Conditional Formatting:**
- Highlight top 3 wins with larger font/bold
- Chronological order (most recent first)

---

### Section 4: Risks & Escalations

**Section Name:** Risks & Escalations  
**Purpose:** Surface critical blockers and risks

**Data Points/Metrics:**
- Risk title
- Impact rating (Critical/High/Medium/Low)
- Likelihood (High/Medium/Low)
- Recommended action
- Owner
- Days open

**Chart Type:** Table (top 3-5 risks)  
**Table Schema:**
| Column | Data Type | Sort | Width |
|--------|-----------|------|-------|
| Risk | String | By severity (Critical→High→Medium→Low) | 250px |
| Impact | Badge (Critical/High/Medium/Low) | By impact priority | 100px |
| Likelihood | Badge (High/Medium/Low) | By likelihood | 100px |
| Owner | String | Alphabetical | 150px |
| Days Open | Number | Descending | 100px |
| Action | String (truncated to 60 chars) | None | 200px |

**Conditional Formatting:**
- Impact badge: Critical (#DC2626), High (#F59E0B), Medium (#FCD34D), Low (#6B7280)
- Likelihood badge: High (#DC2626), Medium (#F59E0B), Low (#6B7280)
- Days Open: Red if > 30, Amber if 15-30, Green if < 15

**Data Source:**
- Risks from Jira issues (labels/tags), Monday.com items, Asana tasks
- Filter: Status = "Open" or "At Risk"
- Limit: Top 5 by severity score (Impact × Likelihood)

---

### Section 5: Strategic Alignment Radar

**Section Name:** Strategic Alignment Radar  
**Purpose:** Multi-dimensional health assessment

**Data Points/Metrics:**
- **Delivery Pace:** 0-100 score
  - Calculation: `(On-Time Deliveries / Total Deliveries) × 100`
- **Quality:** 0-100 score
  - Calculation: `100 - (Bug Count / Total Issues × 100)` (inverted)
- **Team Health:** 0-100 score
  - Calculation: `(Satisfaction Score + Utilization Score + Burnout Risk Score) / 3`
- **Scope Stability:** 0-100 score
  - Calculation: `100 - (Scope Changes / Original Scope × 100)` (inverted)
- **Stakeholder Satisfaction:** 0-100 score
  - Calculation: Average of stakeholder ratings (if available) or inferred from feedback
  > **V2 — REMOVE FROM V1:** Stakeholder Satisfaction has no data source in V1. There is no feedback collection mechanism, no rating system, no survey integration. This axis will always be empty. Remove from V1 radar (show 4-axis radar instead of 5). Add back when feedback feature exists.

**Chart Type:** Radar chart (Recharts Radar)  
**Axis Labels:**
- Delivery Pace
- Quality
- Team Health
- Scope Stability
- Stakeholder Satisfaction

**Visualization:**
- 5-axis radar chart
- Each axis: 0-100 scale
- Current period: Solid line
- Previous period: Dashed line (if comparison enabled)
- Color: Green if ≥ 75, Amber if 60-74, Red if < 60

**Conditional Formatting:**
- Axis color: Based on score (Green/Amber/Red)
- Area fill: 20% opacity matching score color

---

### Section 6: Recommendations

**Section Name:** Recommendations  
**Purpose:** Actionable next steps

> **V1 SCOPE WARNING:** Template-based recommendations require a rules engine that maps data patterns to recommendations. No templates are defined in this spec. V1 options: (a) hardcode 5-10 common recommendations with simple triggers, (b) show "Recommendations coming soon" placeholder, or (c) cut this section entirely from V1. Option (a) is recommended with minimal scope.

**Data Points/Metrics:**
- Recommendation title
- Rationale (why this matters)
- Priority (High/Medium/Low)
- Estimated impact

**Chart Type:** Numbered list  
**Visualization:**
- 2-3 recommendations
- Each: Title (bold), rationale (1-2 sentences), priority badge

**Data Source:**
- **V1:** Template-based recommendations (pre-defined rules)
- **V2:** AI-generated (Scout AI) based on data patterns

**Conditional Formatting:**
- Priority badge: High (#DC2626), Medium (#F59E0B), Low (#6B7280)
- Numbered 1-3 with visual emphasis

---

## 3. ASCII Wireframes

### Wireframe 1: Executive KPI Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│ EXECUTIVE KPI DASHBOARD                                         │
├──────────────────┬──────────────────┬───────────────────────────┤
│ Projects On Track│ Portfolio Health │ Team Utilization          │
│                  │                  │                           │
│       6/8        │       74         │         82%               │
│   ┌──────────┐  │   ┌──────────┐  │   ┌──────────┐            │
│   │  ╱╲╱╲╱╲  │  │   │  ╱╲╱╲╱╲  │  │   │  ╱╲╱╲╱╲  │            │
│   └──────────┘  │   └──────────┘  │   └──────────┘            │
│   ↑ +2 vs last  │   ↑ +5 vs last   │   ↑ +3% vs last           │
│                 │                  │                           │
├──────────────────┼──────────────────┼───────────────────────────┤
│ Velocity Trend   │ Budget Adherence │ On-Time Delivery Rate     │
│                  │                  │                           │
│      +12%        │       94%        │         78%               │
│   ┌──────────┐  │   ┌──────────┐  │   ┌──────────┐            │
│   │  ╱╲╱╲╱╲  │  │   │  ╱╲╱╲╱╲  │  │   │  ╱╲╱╲╱╲  │            │
│   └──────────┘  │   └──────────┘  │   └──────────┘            │
│   ↑ +5% vs last │   ↑ +2% vs last │   ↓ -3% vs last           │
└──────────────────┴──────────────────┴───────────────────────────┘
```

### Wireframe 2: Traffic Light Summary

```
┌─────────────────────────────────────────────────────────────────┐
│ TRAFFIC LIGHT SUMMARY                                           │
├──────┬──────────────────────┬──────────────────┬───────────────┤
│      │ Project Name          │ Summary          │ Owner         │
├──────┼──────────────────────┼──────────────────┼───────────────┤
│ 🟢   │ Mobile App Redesign   │ On track for Q1  │ Sarah Chen    │
│      │                       │ launch           │               │
├──────┼──────────────────────┼──────────────────┼───────────────┤
│ 🟡   │ API Migration         │ Delayed by 2     │ Mike Johnson  │
│      │                       │ weeks due to...  │               │
├──────┼──────────────────────┼──────────────────┼───────────────┤
│ 🔴   │ Legacy System        │ Critical         │ Alex Martinez │
│      │ Deprecation           │ dependencies...  │               │
└──────┴──────────────────────┴──────────────────┴───────────────┘
```

### Wireframe 3: Strategic Alignment Radar

```
┌─────────────────────────────────────────────────────────────────┐
│ STRATEGIC ALIGNMENT RADAR                                       │
│                                                                 │
│                    Delivery Pace                                │
│                        100                                      │
│                         │                                       │
│                         │                                       │
│        Scope Stability  │  Quality                             │
│             100         │    100                               │
│              ╲          │    ╱                                 │
│               ╲    ┌────┼────╱                                  │
│                ╲   │    │   ╱                                   │
│                 ╲  │    │  ╱                                    │
│                  ╲ │    │ ╱                                     │
│                   ╲│    │╱                                      │
│                    │    │                                       │
│         ───────────┼────┼───────────                            │
│                    │    │                                       │
│                    │    │                                       │
│              Team Health                                        │
│                   100                                           │
│                                                                 │
│         Stakeholder Satisfaction                                │
│                   100                                           │
│                                                                 │
│  ─── Current Period  ─ ─ ─ Previous Period                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Panel

### Date Range Picker
- **Type:** Calendar date picker (start date, end date)
- **Presets:** 
  - Last Week
  - Last 2 Weeks
  - Last Month
  - Last Quarter
  - Custom Range
- **Default:** Last Month
- **Validation:** End date must be ≥ start date, max range 1 year

### Project Selector
- **Type:** Multi-select dropdown with search
- **Options:**
  - All Projects (default)
  - Selected Projects (checkbox list)
  - Projects by Owner
  - Projects by Status
- **Display:** Project name, tool icon (Jira/Monday/Asana), status dot

### Team Filter
- **Type:** Multi-select dropdown
- **Options:**
  - All Teams (default)
  - Selected Teams
- **Display:** Team name, member count

### Comparison Toggle
- **Type:** Toggle switch
- **Options:**
  - Off (default)
  - Compare to Previous Period
- **When enabled:** Shows previous period data as dashed lines/ghosted bars

### Audience Preset
- **Type:** Radio buttons
- **Options:**
  - Board (most condensed, strategic focus)
  - Executive (balanced detail)
  - Team Lead (more operational detail)
- **Default:** Executive
- **Impact:** Adjusts section visibility, detail level, chart complexity

---

## 5. Export Formats

### Web View
- **Layout:** Single-page scrollable view
- **Sections:** All sections in order, full width
- **Charts:** Interactive (hover tooltips, click to drill down in V2)
- **Responsive:** Mobile-friendly (stacked layout on < 768px)
- **Print CSS:** Optimized for print-to-PDF

### PDF Layout (Browser Print-to-PDF)
- **Page Size:** US Letter (8.5" × 11")
- **Margins:** 0.75" all sides
- **Header:** 
  - Left: Vantage logo (SVG, 40px height)
  - Center: "Executive Summary Report"
  - Right: Date range (e.g., "Jan 1 - Jan 31, 2026")
- **Footer:**
  - Left: Confidential watermark (if enabled)
  - Center: Page number (e.g., "Page 1 of 3")
  - Right: Generated timestamp
- **Page Breaks:**
  - After Executive KPI Dashboard (if needed)
  - After Traffic Light Summary (if needed)
  - Before Recommendations (prefer on new page)
- **Styling:**
  - Font: System sans-serif (Arial/Helvetica fallback)
  - Colors: Print-safe (avoid pure black, use #333)
  - Charts: Rendered as static images (Recharts toImage export)
  - Tables: Full width, alternating row colors (subtle)

### CSV Export
- **Filename:** `executive_summary_YYYY-MM-DD.csv`
- **Columns:**
  1. Section
  2. Metric Name
  3. Value
  4. Trend
  5. Status (RAG)
  6. Project Name (if applicable)
  7. Owner (if applicable)
  8. Date
- **Rows:** One row per metric/data point
- **Encoding:** UTF-8 with BOM

---

## 6. Scheduling Options

### Frequency Choices
- **One-time** (default)
- **Daily**
- **Weekly** (day of week selector: Monday-Sunday)
- **Bi-weekly** (every 2 weeks, day selector)
- **Monthly** (day of month: 1-28, or "last day")
- **Quarterly** (first day of quarter)

### Recipient Selector
- **Type:** Multi-select with email input
- **Options:**
  - Current user (auto-selected)
  - User groups (Owner, Admin, Member, Viewer)
  - Individual email addresses
- **Validation:** Valid email format required
- **Limit:** Max 50 recipients per report

### Delivery Method (V1)
- **Email only** (default)
- **Email format:**
  - Subject: `Executive Summary Report - [Date Range]`
  - Body: HTML email with report preview (first 2 sections)
  - Attachment: PDF (if enabled)
  - Link: "View Full Report" (opens in Vantage)

### Delivery Method (V2 - Future)
- Slack integration
- Confluence integration
- Microsoft Teams integration

---

## 7. Data Requirements

### Minimum Integrations
- **Required:** At least 1 connected integration (Jira, Monday.com, or Asana)
- **Recommended:** 2+ integrations for cross-tool insights

### Minimum Items
- **Projects:** At least 1 active project
- **Issues/Tasks:** At least 10 items across all projects
- **Milestones:** At least 1 completed milestone for "Key Wins" section

### Minimum History
- **Time Range:** At least 7 days of historical data
- **Recommended:** 30+ days for trend calculations
- **Velocity:** Requires 2+ completed sprints/periods

### Data Validation
- **Empty State:** Show if no projects found
- **Partial Data:** Show available sections, hide unavailable sections with note
- **Stale Data:** Warning banner if last sync > 24 hours ago

---

## 8. RBAC Permissions Matrix

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View Report | ✅ | ✅ | ✅ | ✅ |
| Create Report | ✅ | ✅ | ✅ | ❌ |
| Edit Report Config | ✅ | ✅ | ✅ | ❌ |
| Schedule Report | ✅ | ✅ | ✅ | ❌ |
| Export PDF | ✅ | ✅ | ✅ | ✅ |
| Export CSV | ✅ | ✅ | ✅ | ✅ |
| Share Report Link | ✅ | ✅ | ✅ | ✅ |
| Delete Report | ✅ | ✅ | ❌ | ❌ |
| Manage Recipients | ✅ | ✅ | ❌ | ❌ |

**Notes:**
- Viewer can view and export but cannot create or schedule
- Member can create/schedule but cannot delete or manage recipients
- Admin can do everything except delete (Owner-only)
- Owner has full access

---

## 9. Empty States and Error States

### Empty State: No Data
**Condition:** No projects found in selected scope  
**Message:**
```
No projects found
Connect at least one project management tool to generate this report.
[Connect Integration] button
```
**Visual:** Empty state illustration (SVG), muted colors

### Empty State: Partial Data
**Condition:** Some sections have data, others don't  
**Message:** Section-specific empty states:
- **Key Wins:** "No completed milestones found in this period."
- **Risks:** "No open risks identified."
- **Strategic Alignment:** "Insufficient data for radar chart. Requires 30+ days of history."

**Visual:** Hide empty sections, show note above next section

### Empty State: Stale Data
**Condition:** Last sync > 24 hours ago  
**Message:**
```
⚠️ Data may be outdated
Last synced: [Timestamp]
[Sync Now] button
```
**Visual:** Warning banner (amber background) at top of report

### Empty State: Single Project
**Condition:** Only 1 project in scope  
**Message:** Report still generates, but some metrics may be less meaningful  
**Visual:** Info banner: "Showing data for 1 project. Some portfolio-level metrics may be limited."

### Error State: Integration Failure
**Condition:** Connected tool API error  
**Message:**
```
⚠️ Unable to fetch data from [Tool Name]
Error: [Error message]
Last successful sync: [Timestamp]
[Retry] [View Integration Settings]
```
**Visual:** Error banner (red background), hide affected sections

### Error State: Insufficient Permissions
**Condition:** User lacks permissions to view project data  
**Message:**
```
Access Denied
You don't have permission to view data for [Project Name].
Contact your administrator.
```
**Visual:** Error message, hide restricted data

---

## 10. Real Assumptions & Open Questions

### Assumptions
1. **RAG Calculation:** Assumes projects have clear status fields (On Track/At Risk/Off Track). What if tools use different status taxonomies?
2. **Portfolio Health Score:** Assumes equal weighting of projects. Should we weight by budget, team size, or strategic importance?
3. **Team Utilization:** Assumes we can calculate available hours from team member data. What if team members aren't tracked in connected tools?
4. **Stakeholder Satisfaction:** Assumes we can infer from feedback/comments or have explicit ratings. What's the fallback if neither exists?
5. **PDF Generation:** Assumes browser print-to-PDF works consistently across Chrome/Safari/Firefox. Do we need a print stylesheet fallback?

### Open Questions
1. **Q1:** How do we handle projects that span multiple tools? Should they appear once (merged) or multiple times (per tool)?
   - **Impact:** Affects "Projects On Track" count and Traffic Light Summary
   - **Decision Needed:** Product/Engineering alignment on identity resolution

2. **Q2:** For "Key Wins," should we auto-detect from status changes, or require manual tagging (labels/epics)?
   - **Impact:** V1 implementation complexity
   - **Decision Needed:** Define detection rules or require manual curation

3. **Q3:** Strategic Alignment Radar requires 5 scores. What's the fallback if we can't calculate all 5 (e.g., no stakeholder ratings)?
   - **Impact:** Empty radar chart vs. partial radar (4 axes)
   - **Decision Needed:** Minimum required axes to show radar, or show as bar chart fallback?

4. **Q4:** PDF page breaks: Should sections always start on new pages, or only if they don't fit?
   - **Impact:** PDF length and readability
   - **Decision Needed:** UX preference for pagination strategy

5. **Q5:** Recommendations in V1: Should we use a fixed template library (e.g., "If Portfolio Health < 60, recommend X"), or allow admins to configure custom recommendation rules?
   - **Impact:** V1 scope and configurability
   - **Decision Needed:** Template-based vs. configurable rules engine

6. **Q6:** Date range presets: Should "Last Quarter" be calendar quarter (Q1/Q2/Q3/Q4) or rolling 90 days?
   - **Impact:** Consistency with financial reporting
   - **Decision Needed:** Align with customer reporting cycles

---

## Technical Notes

### Chart Library
- **Library:** Recharts (React-native compatible, MIT license)
- **Components:** Line (sparklines), Radar (strategic alignment), Table (custom)
- **Tree-shaking:** Import only used components to minimize bundle size

### Data Fetching
- **API:** Vendor-agnostic REST endpoints
- **Caching:** Cache report data for 5 minutes to avoid redundant API calls
- **Pagination:** Not required (report aggregates data server-side)

### Performance
- **Target:** Report generation < 3 seconds for 100 projects
- **Optimization:** Lazy-load charts, defer non-critical sections

---

## Acceptance Criteria

- [ ] All 6 sections render correctly with sample data
- [ ] PDF export produces board-ready output (tested in Chrome/Safari/Firefox)
- [ ] CSV export includes all metrics in structured format
- [ ] RBAC permissions enforced at API and UI level
- [ ] Empty states display appropriately for all scenarios
- [ ] Configuration panel saves user preferences
- [ ] Scheduled reports send email with PDF attachment
- [ ] Report loads in < 3 seconds for typical dataset (50 projects, 1000 items)

---

**End of Specification**
