# REPORT_RISK_DEPENDENCY.md

## Product Specification: Risk & Dependency Report

**Version:** 1.0  
**Last Updated:** 2026-02-09  
**Author:** Jeff, Product Director  
**Status:** Blocked — awaiting Risk Data Model specification
**Build Priority:** 5 of 6 (requires Risk Data Model which doesn't exist yet)
**Blocked By:** Risk Data Model (no schema, no CRUD API, no creation UI)

---

## 1. Overview, Purpose, and Target Audience

### Purpose
The Risk & Dependency Report provides a deep-dive analysis of project risks, blockers, and cross-project dependencies. This report helps technical leads and program managers identify critical paths, resolve blockers, and mitigate risks before they impact delivery.

### Target Audience
- **Primary:** Technical leads, program managers, engineering managers
- **Secondary:** Project managers, risk managers, PMO leads
- **Tertiary:** Executives reviewing critical path and risk exposure

### Key Value Proposition
- **Comprehensive:** Centralized view of all risks and dependencies
- **Visual:** Dependency map visualization (hero section)
- **Actionable:** Clear mitigation plans and escalation paths
- **Predictive:** Identifies critical path and potential delays

---

## 2. Section-by-Section Breakdown

### Section 1: Risk Summary Cards

**Section Name:** Risk Summary Cards  
**Purpose:** Quick overview of risk landscape

**Data Points/Metrics:**
- **Critical Count:** Number of risks with severity = Critical
- **High Count:** Number of risks with severity = High
- **Medium Count:** Number of risks with severity = Medium
- **Low Count:** Number of risks with severity = Low
- **New This Period:** Risks created within reporting period
- **Resolved This Period:** Risks closed/resolved within reporting period
- **Total Open Risks:** Sum of all open risks
- **Risk Trend:** Week-over-week change (sparkline)

**Chart Type:** Card grid (4 columns, 2 rows)  
**Visualization:**
- 8 metric cards in grid layout
- Each card: Large number, label, mini sparkline (if trend available)
- Color coding: Critical (red), High (amber), Medium (yellow), Low (gray)

**Conditional Formatting:**
- Critical Count: Red badge (#DC2626) if > 0, gray if 0
- High Count: Amber badge (#F59E0B) if > 0, gray if 0
- Medium Count: Yellow badge (#FCD34D) if > 0, gray if 0
- Low Count: Gray badge (#6B7280)
- New This Period: Red if > 5, amber if 2-5, green if 0-1
- Resolved This Period: Green if > New, amber if = New, red if < New

**Table Schema (if shown as table):**
| Severity | Count | New | Resolved | Trend |
|----------|-------|-----|----------|-------|
| Critical | 3 | 1 | 0 | ↑ |
| High | 12 | 3 | 2 | ↓ |
| Medium | 28 | 5 | 8 | ↓ |
| Low | 15 | 2 | 1 | → |

---

### Section 2: Risk Registry Table

**Section Name:** Risk Registry Table  
**Purpose:** Detailed list of all risks with full context

**Data Points/Metrics:**
- Risk ID (auto-generated or manual)
- Risk title
- Severity (Critical/High/Medium/Low)
- Likelihood (High/Medium/Low)
- Impact (High/Medium/Low)
- Owner (assigned person)
- Status (Open/In Progress/Mitigated/Resolved/Closed)
- Days open (calculated from created date)
- Mitigation plan (text description)
- Related items (linked issues/tasks)

**Chart Type:** Table with filters and sorting  
**Table Schema:**
| Risk ID | Title | Severity | Likelihood | Impact | Owner | Status | Days Open | Mitigation |
|---------|-------|----------|------------|--------|-------|--------|-----------|------------|
| R-001 | API Rate Limit | Critical | High | High | Sarah Chen | Open | 12 | Upgrade plan... |
| R-002 | Key Dependency | High | Medium | High | Mike Johnson | In Progress | 8 | Alternative... |
| R-003 | Team Capacity | Medium | Low | Medium | Alex Martinez | Mitigated | 45 | Hired contractor |

**Sort Options:**
- By severity (Critical → High → Medium → Low)
- By days open (descending)
- By risk score (Severity × Likelihood × Impact, descending)
- By owner (alphabetical)
- By status (Open → In Progress → Mitigated → Resolved → Closed)

**Conditional Formatting:**
- Severity badge: Critical (#DC2626), High (#F59E0B), Medium (#FCD34D), Low (#6B7280)
- Likelihood badge: High (#DC2626), Medium (#F59E0B), Low (#6B7280)
- Impact badge: High (#DC2626), Medium (#F59E0B), Low (#6B7280)
- Days open: Red if > 30, amber if 15-30, green if < 15
- Row background: Light red tint if Critical + Open, light amber if High + Open

**Visualization Details:**
- Expandable rows show:
  - Full mitigation plan
  - Related items (links to Jira/Monday/Asana)
  - Risk history (status changes, comments)
  - Escalation path

---

### Section 3: Risk Trend Chart

**Section Name:** Risk Trend Chart  
**Purpose:** Visualize risk count over time

**Data Points/Metrics:**
- Date (X-axis)
- Risk count by severity (Y-axis)
- Stacked by: Critical, High, Medium, Low

**Chart Type:** Stacked area chart (Recharts Area)  
**Axis Labels:**
- X-axis: Date (e.g., "Jan 1", "Jan 8", "Jan 15")
- Y-axis: Risk Count (0, 10, 20, 30, ...)

**Visualization:**
- Stacked area chart showing risk count over time
- 4 layers: Critical (red, bottom), High (amber), Medium (yellow), Low (gray, top)
- Tooltip on hover: Shows exact counts per severity for that date
- Optional: Toggle to show line chart (total count only)

**Conditional Formatting:**
- Area colors: Critical (#DC2626), High (#F59E0B), Medium (#FCD34D), Low (#6B7280)
- Area opacity: 70% for better visibility
- Trend line: Dashed line overlay showing total count trend

**Data Source:**
- Historical risk snapshots (daily/weekly)
- Filter: Reporting period date range
- Grouping: Daily if < 30 days, weekly if 30-90 days, monthly if > 90 days

---

### Section 4: Dependency Map Visualization

> **⚠️ SCOPE WARNING:** This "hero section" is a mini-product, not a chart. Recharts does NOT support node-link diagrams. A force-directed graph with zoom, pan, filtering, critical path highlighting, and interactive node selection requires either D3 force simulation (2-3 weeks specialized frontend work) or a dedicated graph library. 
>
> **V1 RECOMMENDATION:** Replace with a simplified dependency table showing blocked paths. Columns: Blocker Item, Blocked Item(s), Path Length, Critical Path (Y/N). The force-directed graph should be V1.1 or V2.

**Section Name:** Dependency Map Visualization  
**Purpose:** Visual representation of cross-project dependencies (HERO SECTION)

**Data Points/Metrics:**
- Node: Project/item identifier
- Edge: Dependency relationship (blocks/blocked by)
- Node properties: Name, status, completion %, owner
- Edge properties: Type (hard/soft), critical path indicator

**Chart Type:** Node-link diagram (custom SVG/Canvas, or Recharts if supported)  
**Visualization:**
- **Nodes:** Circles/rectangles representing projects/items
  - Size: Based on item count or importance
  - Color: Based on status (Green = On Track, Amber = At Risk, Red = Blocked)
  - Label: Project/item name (truncated if long)
- **Edges:** Lines/arrows representing dependencies
  - Direction: Arrow points from blocker → blocked
  - Color: Red if blocked path (critical), gray if normal
  - Thickness: Based on dependency strength
- **Layout:** Force-directed or hierarchical (user preference)
- **Interactivity:** Click node to highlight dependencies, hover for details

**Conditional Formatting:**
- Node color: Green (#10B981) if On Track, Amber (#F59E0B) if At Risk, Red (#DC2626) if Blocked
- Edge color: Red (#DC2626) if on critical path, Gray (#6B7280) if normal
- Edge style: Solid if hard dependency, dashed if soft dependency
- Blocked paths: Highlight entire path in red (blocker → blocked → blocked)

**Visualization Details:**
- **Zoom/Pan:** Allow user to zoom and pan large dependency maps
- **Filters:** Show only critical path, show only blocked items, show only selected projects
- **Legend:** Node types, edge types, color coding
- **Export:** SVG export for documentation

**Example Layout:**
```
        [Project A] ──→ [Project B] ──→ [Project C]
            │                │                │
            │                ▼                │
        [Project D] ←── [Project E] ←────────┘
            │
            ▼
        [Project F] ──→ [Project G]
```

---

### Section 5: Blocker Analysis

**Section Name:** Blocker Analysis  
**Purpose:** Detailed view of blocking relationships

**Data Points/Metrics:**
- Blocker item (title, ID, project)
- Blocked items count (number of items blocked)
- Estimated delay days (sum of delays)
- Blocker owner
- Escalation status (None/Escalated/Resolved)
- Days blocked (oldest blocked item)

**Chart Type:** Table with expandable rows  
**Table Schema:**
| Blocker | Blocked Count | Est. Delay | Owner | Escalation | Days Blocked |
|---------|---------------|------------|-------|------------|--------------|
| API Migration | 8 | 14 days | Sarah Chen | Escalated | 12 |
| Design Review | 3 | 5 days | Mike Johnson | None | 5 |
| Infrastructure | 15 | 21 days | Alex Martinez | Escalated | 8 |

**Sort Options:**
- By blocked count (descending)
- By estimated delay (descending)
- By days blocked (descending)
- By escalation status (Escalated → None)

**Conditional Formatting:**
- Blocked count: Red if > 10, amber if 5-10, green if < 5
- Estimated delay: Red if > 14 days, amber if 7-14 days, green if < 7 days
- Escalation status: Red badge if Escalated, gray if None, green if Resolved
- Days blocked: Red if > 14, amber if 7-14, green if < 7
- Row background: Light red if Escalated + High delay

**Visualization Details:**
- Expandable rows show:
  - List of blocked items (with links)
  - Delay breakdown per blocked item
  - Blocker details (status, assignee, due date)
  - Escalation history

---

### Section 6: Critical Path Timeline

> **IMPLEMENTATION NOTE:** Critical Path Method (CPM) calculation requires ALL items to have explicit start dates, end dates, and dependency links. Many Jira projects don't track item-level dates. If dates are missing, critical path cannot be calculated. V1 must handle this gracefully: "Critical path requires date information for all dependent items. [X] items are missing dates."

**Section Name:** Critical Path Timeline  
**Purpose:** Show the longest chain of dependent items

**Data Points/Metrics:**
- Item sequence (ordered list)
- Item name, project, owner
- Start date, end date
- Duration (days)
- Slack/float (days of buffer)
- On critical path indicator (Yes/No)

**Chart Type:** Gantt-style timeline (Recharts Bar chart, horizontal)  
**Visualization:**
- Horizontal bar chart showing items in sequence
- Bars show: Start date, end date, duration
- Color coding: Red if on critical path, gray if not
- Slack shown as: Dashed extension beyond bar

**Axis Labels:**
- X-axis: Date range (start to end of critical path)
- Y-axis: Item names (ordered by sequence)

**Conditional Formatting:**
- Bar color: Red (#DC2626) if on critical path, Gray (#6B7280) if not
- Bar opacity: 100% if current, 50% if completed, 30% if future
- Slack indicator: Green dashed line if slack > 0, red if slack = 0 (critical)

**Example:**
```
Critical Path Timeline
┌─────────────────────────────────────────────────────────────┐
│ Jan 1          Jan 15         Jan 31         Feb 15        │
│                                                              │
│ Item A: [████████████] (Critical)                           │
│ Item B:        [████████████████] (Critical)                │
│ Item C:                [████████] (Critical)                │
│ Item D:        [████] (Not Critical, Slack: 5 days)          │
└─────────────────────────────────────────────────────────────┘
```

---

### Section 7: Mitigation Tracker

**Section Name:** Mitigation Tracker  
**Purpose:** Track progress on risk mitigation actions

**Data Points/Metrics:**
- Risk ID (links to Risk Registry)
- Risk title
- Mitigation action (description)
- Assignee (person responsible)
- Due date
- Status (Not Started/In Progress/Completed/Overdue)
- Completion %

**Chart Type:** Table with status filters  
**Table Schema:**
| Risk | Mitigation Action | Assignee | Due Date | Status | Progress |
|------|-------------------|----------|----------|--------|----------|
| R-001 | Upgrade API plan | Sarah Chen | Feb 15 | In Progress | 60% |
| R-002 | Find alternative | Mike Johnson | Feb 10 | Overdue | 30% |
| R-003 | Hire contractor | Alex Martinez | Feb 20 | Not Started | 0% |

**Sort Options:**
- By due date (ascending)
- By status (Overdue → In Progress → Not Started → Completed)
- By assignee (alphabetical)
- By risk severity (Critical → High → Medium → Low)

**Conditional Formatting:**
- Status badge: Overdue (#DC2626), In Progress (#F59E0B), Not Started (#6B7280), Completed (#10B981)
- Due date: Red if overdue, amber if due within 3 days, green if > 3 days away
- Progress bar: Green if ≥ 80%, amber if 40-79%, red if < 40%
- Row background: Light red if Overdue

**Visualization Details:**
- Progress bar: Visual indicator (0-100%)
- Filter by: Status, assignee, due date range
- Bulk actions: Mark multiple as completed, reassign

---

## 3. ASCII Wireframes

### Wireframe 1: Dependency Map Visualization (Hero Section)

```
┌─────────────────────────────────────────────────────────────────┐
│ DEPENDENCY MAP VISUALIZATION                                    │
│ [Zoom In] [Zoom Out] [Reset] [Show Critical Path Only]         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    [Project A]                                  │
│                    (On Track)                                   │
│                       │                                         │
│                       │                                         │
│                       ▼                                         │
│         [Project B] ──┼──→ [Project C]                          │
│         (At Risk)     │    (Blocked)                            │
│                       │                                         │
│                       │                                         │
│                       ▼                                         │
│                    [Project D]                                  │
│                    (Blocked)                                    │
│                       │                                         │
│                       │                                         │
│                       ▼                                         │
│                    [Project E]                                  │
│                    (On Track)                                   │
│                                                                 │
│ Legend:                                                         │
│ 🟢 On Track  🟡 At Risk  🔴 Blocked                            │
│ ─── Hard Dependency  ─ ─ ─ Soft Dependency                    │
│ Red Path = Critical Path                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Wireframe 2: Risk Registry Table

```
┌─────────────────────────────────────────────────────────────────┐
│ RISK REGISTRY TABLE                                             │
│ [Filter: All Severities ▼] [Filter: All Statuses ▼] [Search...]│
├──────┬──────────────┬──────────┬──────────┬──────┬──────┬──────┤
│ ID   │ Title        │ Severity │ Likelihood│Impact│Owner │Status│
├──────┼──────────────┼──────────┼──────────┼──────┼──────┼──────┤
│ R-001│ API Rate     │ 🔴 Critical│ High    │ High │Sarah │ Open │
│      │ Limit        │          │          │      │      │      │
│      │              │          │          │      │      │      │
│   ▼ Expanded:       │          │          │      │      │      │
│   • Days Open: 12   │          │          │      │      │      │
│   • Mitigation:     │          │          │      │      │      │
│     Upgrade API...  │          │          │      │      │      │
│   • Related Items:  │          │          │      │      │      │
│     JIRA-123, ...   │          │          │      │      │      │
├──────┼──────────────┼──────────┼──────────┼──────┼──────┼──────┤
│ R-002│ Key          │ 🟡 High  │ Medium   │ High │Mike  │In Pro│
│      │ Dependency   │          │          │      │      │      │
└──────┴──────────────┴──────────┴──────────┴──────┴──────┴──────┘
```

### Wireframe 3: Critical Path Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│ CRITICAL PATH TIMELINE                                          │
├─────────────────────────────────────────────────────────────────┤
│ Jan 1          Jan 15         Jan 31         Feb 15            │
│                                                              │
│ API Migration  [████████████████████] 🔴                      │
│                (Critical, No Slack)                            │
│                                                              │
│ Backend Work         [████████████████] 🔴                    │
│                      (Critical, No Slack)                     │
│                                                              │
│ Frontend Work            [████████████] 🔴                    │
│                          (Critical, No Slack)                 │
│                                                              │
│ Testing                    [████] (Not Critical, Slack: 5d) │
│                                                              │
│ Legend: 🔴 Critical Path  ─ ─ ─ Slack                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Panel

### Severity Filter
- **Type:** Multi-select checkboxes
- **Options:**
  - Critical
  - High
  - Medium
  - Low
- **Default:** All selected
- **Impact:** Filters Risk Registry, Risk Trend Chart, Mitigation Tracker

### Project Scope
- **Type:** Multi-select dropdown with search
- **Options:**
  - All Projects (default)
  - Selected Projects
  - Projects by Owner
  - Projects by Status
- **Display:** Project name, tool icon, risk count

### Include Resolved Toggle
- **Type:** Toggle switch
- **Default:** Off (show only open risks)
- **Purpose:** Include resolved/closed risks in analysis
- **Impact:** Affects Risk Registry, Risk Trend Chart

### Date Range
- **Type:** Calendar date picker (start date, end date)
- **Presets:**
  - Last 7 Days
  - Last 30 Days
  - Last 90 Days
  - Last Quarter
  - Custom Range
- **Default:** Last 30 Days
- **Validation:** End date ≥ start date, max range 1 year

### Dependency Map Layout
- **Type:** Radio buttons
- **Options:**
  - Force-Directed (default, organic layout)
  - Hierarchical (top-down tree)
  - Circular (radial layout)
- **Impact:** Dependency Map Visualization layout algorithm

### Show Only Critical Path
- **Type:** Toggle switch
- **Default:** Off
- **Purpose:** Filter Dependency Map and Critical Path Timeline to show only critical path items
- **Impact:** Simplifies visualization, focuses on blockers

---

## 5. Export Formats

### Web View
- **Layout:** Multi-section scrollable view
- **Sections:** All 7 sections in order, full width
- **Charts:** Interactive (hover tooltips, click to drill down)
- **Dependency Map:** Interactive zoom/pan, click nodes for details
- **Responsive:** Mobile-friendly (stacked layout on < 768px, simplified dependency map)

### PDF Layout (Browser Print-to-PDF)
- **Page Size:** US Letter (8.5" × 11")
- **Margins:** 0.75" all sides
- **Header:**
  - Left: Vantage logo
  - Center: "Risk & Dependency Report"
  - Right: Date range
- **Footer:**
  - Left: Confidential watermark (if enabled)
  - Center: Page number
  - Right: Generated timestamp
- **Page Breaks:**
  - After Risk Summary Cards
  - After Risk Registry Table (if > 1 page)
  - After Risk Trend Chart
  - Dependency Map on its own page (landscape orientation if needed)
  - Before Mitigation Tracker (prefer on new page)
- **Styling:**
  - Dependency Map: Rendered as static SVG/image (may need landscape page)
  - Tables: Full width, alternating row colors
  - Charts: Rendered as static images (Recharts toImage)

### CSV Export
- **Filename:** `risk_dependency_YYYY-MM-DD.csv`
- **Multiple Files:** One CSV per section
  - `risk_summary.csv`
  - `risk_registry.csv`
  - `risk_trend.csv`
  - `dependency_map.csv` (nodes and edges as separate tables)
  - `blocker_analysis.csv`
  - `critical_path.csv`
  - `mitigation_tracker.csv`
- **Encoding:** UTF-8 with BOM
- **Columns:** Vary by section (see table schemas above)

---

## 6. Scheduling Options

### Frequency Choices
- **One-time** (default)
- **Daily**
- **Weekly** (day of week selector)
- **Bi-weekly**
- **Monthly**

### Recipient Selector
- **Type:** Multi-select with email input
- **Options:**
  - Current user (auto-selected)
  - User groups (Owner, Admin, Member)
  - Individual email addresses
- **Validation:** Valid email format required
- **Limit:** Max 50 recipients

### Delivery Method (V1)
- **Email only** (default)
- **Email format:**
  - Subject: `Risk & Dependency Report - [Date Range]`
  - Body: HTML email with summary stats (critical risks count, blocker count)
  - Attachment: PDF (if enabled)
  - Link: "View Full Report" (opens in Vantage)

### Delivery Method (V2 - Future)
- Slack integration
- Confluence integration

---

## 7. Data Requirements

### Minimum Integrations
- **Required:** At least 1 connected integration (Jira, Monday.com, or Asana)
- **Recommended:** Multiple integrations for cross-project dependency analysis

### Minimum Items
- **Items:** At least 10 items with dependency relationships
- **Projects:** At least 1 project
- **Risks:** At least 1 risk (for risk sections to populate)

### Minimum History
- **Time Range:** At least 7 days of historical data
- **Recommended:** 30+ days for risk trends
- **Dependencies:** Requires items with linked relationships (blocks/blocked by)

### Data Validation
- **Empty State:** Show if no risks or dependencies found
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
| Create Risk | ✅ | ✅ | ✅ | ❌ |
| Edit Risk | ✅ | ✅ | ✅ | ❌ |
| Resolve Risk | ✅ | ✅ | ✅ | ❌ |
| Create Dependency Link | ✅ | ✅ | ✅ | ❌ |
| Delete Report | ✅ | ✅ | ❌ | ❌ |

**Notes:**
- Viewer can view and export but cannot create risks or dependencies
- Member can create/edit risks and dependencies but cannot delete reports
- Admin can do everything except delete (Owner-only)
- Owner has full access

---

## 9. Empty States and Error States

### Empty State: No Risks
**Condition:** No risks found in selected scope  
**Message:**
```
No risks identified
No risks have been created or detected in the selected projects.
[Create Risk] button
```
**Visual:** Empty state illustration, create risk CTA

### Empty State: No Dependencies
**Condition:** No dependency relationships found  
**Message:**
```
No dependencies found
Items in your projects don't have dependency relationships.
[Learn about dependencies] link
```
**Visual:** Info banner, show risk sections only

### Empty State: Partial Data
**Condition:** Some sections have data, others don't  
**Message:** Section-specific empty states:
- **Risk Trend:** "Insufficient historical data. Requires 7+ days of risk history."
- **Dependency Map:** "No dependency relationships found."
- **Critical Path:** "No critical path identified. All items have slack."

**Visual:** Hide empty sections, show note above next section

### Empty State: Stale Data
**Condition:** Last sync > 24 hours ago  
**Message:**
```
⚠️ Data may be outdated
Last synced: [Timestamp]
[Sync Now] button
```
**Visual:** Warning banner (amber background) at top

### Error State: Dependency Map Too Large
**Condition:** Dependency map has > 100 nodes  
**Message:**
```
⚠️ Dependency map is too large to render
Consider filtering by project or date range.
[Filter Projects] [Reduce Date Range] buttons
```
**Visual:** Error message, show table view fallback

### Error State: Circular Dependencies
**Condition:** Circular dependency detected  
**Message:**
```
⚠️ Circular dependencies detected
Projects A → B → C → A create a cycle.
[View Details] link
```
**Visual:** Warning banner, highlight circular path in dependency map

### Error State: Critical Path Calculation Failed
**Condition:** Unable to calculate critical path  
**Message:**
```
⚠️ Unable to calculate critical path
Missing date information for some items.
[Review Items] link
```
**Visual:** Error message, show dependency map without critical path highlighting

---

## 10. Real Assumptions & Open Questions

### Assumptions
1. **Risk Detection:** Assumes risks are explicitly tagged/labeled in tools (e.g., Jira labels, Monday.com tags). What if risks are inferred from item status (blocked, overdue)?
2. **Dependency Detection:** Assumes dependencies are explicitly linked (e.g., Jira "blocks" links, Asana dependencies). What if dependencies are inferred from item titles or descriptions?
3. **Critical Path:** Assumes we can calculate critical path using CPM/PERT algorithms. What if items don't have clear start/end dates?
4. **Mitigation Plans:** Assumes mitigation plans are stored as text fields or comments. What if they're in separate documents or tools?
5. **Dependency Map Rendering:** Assumes we can render 50-100 nodes efficiently. What's the performance limit before we need to simplify or paginate?

### Open Questions
1. **Q1:** Dependency Map: Should we render all dependencies in one view, or allow users to "focus" on a specific project and show only its dependencies (1-2 degrees of separation)?
   - **Impact:** Performance and visual clarity
   - **Decision Needed:** UX preference for dependency map interaction model

2. **Q2:** Risk Severity: Should we auto-calculate severity from likelihood + impact, or require manual assignment? What if tools have different severity taxonomies?
   - **Impact:** Risk registry accuracy and consistency
   - **Decision Needed:** Risk classification strategy and tool mapping

3. **Q3:** Critical Path: If multiple critical paths exist (same length), should we show all of them, or only the one with the highest risk?
   - **Impact:** Timeline visualization complexity
   - **Decision Needed:** Critical path selection algorithm

4. **Q4:** Blocker Analysis: Should "Estimated Delay" be calculated from item due dates, or require manual input? What if items don't have due dates?
   - **Impact:** Blocker analysis accuracy
   - **Decision Needed:** Delay calculation method and fallbacks

5. **Q5:** Dependency Map Layout: Force-directed layouts can be non-deterministic (different each time). Should we allow users to manually position nodes and save layouts, or always use algorithm?
   - **Impact:** User experience and layout consistency
   - **Decision Needed:** Layout persistence and manual editing support

6. **Q6:** Risk Trend Chart: Should we show risk count (absolute) or risk score (weighted by severity)? Should we include resolved risks in the trend?
   - **Impact:** Trend interpretation and historical accuracy
   - **Decision Needed:** Trend calculation method and resolved risk handling

7. **Q7: Risk Data Model is a Blocking Dependency**
   - This report references risks with: ID, title, severity, likelihood, impact, owner, status, mitigation plan, days open, related items.
   - None of this data exists in Vantage. There is no risks table, no risk creation UI, no risk import mechanism.
   - Are risks (a) manually entered in Vantage, (b) imported from Jira labels, (c) auto-detected from blockers/delays, or (d) all of the above?
   - This report is essentially a spec for TWO features: (1) risk management and (2) risk reporting.
   - **Decision needed:** Risk Management feature spec with data model. BLOCKING — do not build this report until resolved.

---

## Technical Notes

### Chart Library
- **Library:** Recharts (React-native compatible, MIT license)
- **Components:** Area (risk trend), Bar (critical path timeline), Custom SVG (dependency map)
- **Dependency Map:** May require custom SVG/Canvas rendering if Recharts doesn't support node-link diagrams
- **Tree-shaking:** Import only used components

### Data Fetching
- **API:** Vendor-agnostic REST endpoints
- **Dependency Resolution:** Server-side graph traversal (BFS/DFS for critical path)
- **Caching:** Cache dependency graph for 10 minutes (fresher due to critical nature)

### Performance
- **Target:** Report generation < 5 seconds for 50 projects, 500 items, 100 dependencies
- **Dependency Map:** Render up to 100 nodes efficiently, simplify or paginate if larger
- **Optimization:** Lazy-load dependency map, defer non-critical sections, paginate large tables

### Critical Path Algorithm
1. **Build Dependency Graph:** Nodes = items, Edges = dependencies
2. **Topological Sort:** Order items by dependency sequence
3. **Forward Pass:** Calculate earliest start/finish times
4. **Backward Pass:** Calculate latest start/finish times
5. **Identify Critical Path:** Items with zero slack (earliest = latest)
6. **Handle Cycles:** Detect and flag circular dependencies

---

## Acceptance Criteria

- [ ] All 7 sections render correctly with sample data
- [ ] Risk Summary Cards show accurate counts and trends
- [ ] Risk Registry Table displays all risks with filtering/sorting
- [ ] Risk Trend Chart visualizes risk count over time
- [ ] Dependency Map renders nodes and edges correctly (up to 100 nodes)
- [ ] Blocker Analysis identifies blocking relationships
- [ ] Critical Path Timeline shows longest dependency chain
- [ ] Mitigation Tracker displays mitigation actions and progress
- [ ] PDF export includes all sections (dependency map may need landscape)
- [ ] CSV export generates separate files per section
- [ ] RBAC permissions enforced at API and UI level
- [ ] Empty states display appropriately for all scenarios
- [ ] Report loads in < 5 seconds for typical dataset (50 projects, 500 items, 100 dependencies)

---

**End of Specification**
