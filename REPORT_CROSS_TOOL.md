# Cross-Tool Comparison Report - Product Specification

**Version:** 1.0  
**Author:** Jeff, Product Director  
**Last Updated:** 2026-02-09  
**Status:** V1.1 — Blocked until second integration ships
**Build Priority:** 6 of 6 (requires 2+ integrations, which is V1.1 minimum)

---

## 1. Overview, Purpose, and Target Audience

### Purpose
The Cross-Tool Comparison Report is Vantage's competitive differentiator. It provides a unified analysis across Jira, Monday.com, and Asana — something no other tool offers. This report exposes data overlaps, status mapping conflicts, sync health, and gap analysis to help PMO leads and integration admins ensure data integrity and consistency across their tool ecosystem.

### Target Audience
- **Primary:** PMO leads, integration admins
- **Secondary:** Engineering managers, program managers
- **Tertiary:** Executives evaluating tool consolidation

### Key Value Proposition
- **Unique to Vantage:** No other product provides cross-tool comparison
- **Data integrity:** Surface conflicts, duplicates, and unmapped fields
- **Consolidation insights:** Help orgs decide whether to standardize on one tool
- **Sync visibility:** Real-time health of data synchronization pipelines

### ⚠️ V1 BLOCKER NOTICE

**This report CANNOT be built for V1.** It requires:
1. **2+ connected integrations** — V1 ships with Jira only. Monday.com is V1.1.
2. **Cross-tool item matching** — Explicitly deferred per TECHNICAL_DECISIONS.md S7. Task-level identity resolution was deemed too risky for V1 (false positives destroy trust).
3. **Status mapping configuration** — V1 uses auto-detected field mappings only (I2). Custom status mapping UI is V2.

**Recommendation:** Ship this report with V1.1 (Monday.com integration). Until then, show an empty state: "Cross-tool comparison available when 2+ tools are connected."

Engineering should NOT allocate time for this report in V1 sprint planning.

---

## 2. Section-by-Section Breakdown

### Section 1: Source Overview

**Section Name:** Connected Tools Overview  
**Purpose:** Status card per connected integration

**Data Points/Metrics:**
- Tool name (string: "Jira", "Monday.com", "Asana")
- Tool icon (SVG)
- Connection status (enum: "Connected" | "Degraded" | "Disconnected")
- Total item count (integer, synced work items)
- Total project count (integer)
- Last successful sync (datetime)
- Time since last sync (duration string, e.g., "5 minutes ago")
- Sync error count (integer, errors in last 24h)
- Data freshness indicator (enum: "Fresh" | "Stale" | "Error")

**Visualization Type:** Card grid (one card per tool)

**Card Layout:**
- Tool icon and name (header)
- Connection status badge (green/amber/red dot)
- Large numbers: item count, project count
- Last sync timestamp with relative time
- Sync health indicator bar (green/amber/red)
- Error count (if > 0)

**Conditional Formatting:**
- Connection status:
  - Connected: Green dot (#10B981)
  - Degraded: Amber dot (#F59E0B) — sync errors but not disconnected
  - Disconnected: Red dot (#DC2626)
- Data freshness:
  - Fresh (< 15 min): Green (#10B981)
  - Stale (15 min - 24h): Amber (#F59E0B)
  - Error (> 24h or failed): Red (#DC2626)

**Chart Type:** N/A (Cards)

---

### Section 2: Data Overlap Matrix

> **CRITICAL DEPENDENCY:** This section depends on cross-tool item matching, which was explicitly deferred in TECHNICAL_DECISIONS.md S7. Task-level matching (matching same item across Jira and Monday) is architecturally different from person matching (T2). The S7 decision states: "Wrong deduplication is worse than showing duplicates." This section's core value depends on a feature we decided NOT to build in V1.

**Section Name:** Cross-Tool Data Overlap  
**Purpose:** Show items appearing in multiple tools

**Data Points/Metrics:**
- Item title (string)
- Source tools (array: which tools contain this item)
- Match method (enum: "Email" | "Title" | "Manual Link")
- Match confidence (float, 0-100%)
- Status in each tool (string per tool)
- Last updated in each tool (datetime per tool)
- Conflict indicator (boolean: true if statuses disagree)

**Visualization Type:** Table with conflict highlighting

**Table Schema:**
| Column | Type | Sortable | Default Sort |
|--------|------|----------|--------------|
| Item Title | string | Yes | Alphabetical |
| Source Tools | badge array | Yes | By tool count (desc) |
| Match Confidence | percentage | Yes | Descending |
| Jira Status | string | Yes | - |
| Monday Status | string | Yes | - |
| Asana Status | string | Yes | - |
| Conflict? | boolean | Yes | Conflicts first |
| Last Updated | datetime | Yes | Most recent |

**Conditional Formatting:**
- Match Confidence:
  - Green: ≥ 90% (high confidence match)
  - Amber: 70-89% (medium confidence)
  - Red: < 70% (low confidence, possible false positive)
- Conflict indicator:
  - Red badge: Statuses disagree across tools
  - Green badge: Statuses aligned
- Row background:
  - Light red: Conflict detected
  - Light amber: Low confidence match

**Data Requirements:**
- Minimum 2 connected integrations
- Identity resolution (T2) must be complete
- Items matched via email-first algorithm

---

### Section 3: Status Mapping Table

**Section Name:** Cross-Tool Status Alignment  
**Purpose:** Show how statuses map across tools

**Data Points/Metrics:**
- Vantage canonical status (string: "To Do" | "In Progress" | "In Review" | "Done" | "Blocked")
- Jira status(es) mapped to canonical (string array)
- Monday status(es) mapped to canonical (string array)
- Asana status(es) mapped to canonical (string array)
- Unmapped statuses per tool (string array)
- Conflict count (integer: items with conflicting mapped statuses)

**Visualization Type:** Matrix table

**Table Schema:**
| Vantage Status | Jira | Monday.com | Asana | Conflict Count |
|----------------|------|------------|-------|----------------|
| To Do | "Open", "Backlog" | "Not Started" | "Incomplete" (no assignee) | 3 |
| In Progress | "In Progress" | "Working on it" | "Incomplete" (assigned) | 0 |
| In Review | "In Review", "Code Review" | "Waiting for Review" | (unmapped) | 12 |
| Done | "Done", "Closed" | "Done" | "Completed" | 0 |
| Blocked | "Blocked" | "Stuck" | (custom field) | 5 |

**Conditional Formatting:**
- Unmapped cells: Yellow background (#FEF3C7) with "Not Mapped" text
- Conflict Count:
  - Green: 0
  - Amber: 1-10
  - Red: > 10
- Status labels: Color-coded per tool (Jira blue, Monday purple, Asana pink)

**Interactivity:**
- Click conflict count to see specific conflicting items
- Click "Not Mapped" to navigate to Integration Settings > Field Mapping (V2)

---

### Section 4: Timeline Comparison

**Section Name:** Cross-Tool Timeline Alignment  
**Purpose:** Gantt-style overlay showing same initiative across tools

**Data Points/Metrics:**
- Initiative/project name (string)
- Timeline per tool:
  - Start date per tool (date)
  - End date per tool (date)
  - Current progress per tool (percentage)
- Alignment score (float, 0-100%: how closely timelines agree)
- Date drift (integer: days difference between tool timelines)

**Visualization Type:** Gantt-style overlay chart

**Chart Type:** Horizontal bar chart (Recharts BarChart) with overlay

**Axis Labels:**
- Y-axis: Initiative names (categorical), with sub-rows per tool
- X-axis: Date range (time scale)

**Visual Elements:**
- Each initiative gets 2-3 horizontal bars (one per tool)
- Bars are stacked vertically (not overlapping) for clarity
- Color coding per tool:
  - Jira: Blue (#3B82F6)
  - Monday: Purple (#8B5CF6)
  - Asana: Pink (#EC4899)
- Alignment indicator:
  - If bars overlap significantly (>80% overlap): Green connector line
  - If moderate overlap (50-80%): Amber connector line
  - If low overlap (<50%): Red connector line with "Misaligned" label
- Progress indicator: Filled portion of bar

**Conditional Formatting:**
- Alignment score:
  - Green: ≥ 80% aligned
  - Amber: 50-79% aligned
  - Red: < 50% aligned
- Date drift:
  - Green: ≤ 3 days
  - Amber: 4-14 days
  - Red: > 14 days

**Interactivity:**
- Hover: Show exact dates and progress per tool
- Click: Navigate to initiative detail (V2)

---

### Section 5: Gap Analysis

**Section Name:** Cross-Tool Gap Analysis  
**Purpose:** Items present in one tool but missing from another

**Data Points/Metrics:**
- Gap type (enum: "Missing Item" | "Missing Field" | "Stale Item")
- Item title (string)
- Present in (tool name)
- Missing from (tool name)
- Missing field (string, if gap type = "Missing Field")
- Days since last update (integer, if gap type = "Stale Item")
- Severity (enum: "High" | "Medium" | "Low")

**Visualization Type:** Table with expandable rows

**Table Schema:**
| Column | Type | Sortable | Default Sort |
|--------|------|----------|--------------|
| Gap Type | badge | Yes | By severity |
| Item Title | string | Yes | - |
| Present In | tool badge | Yes | - |
| Missing From | tool badge | Yes | - |
| Detail | string | No | - |
| Severity | badge | Yes | Descending |

**Conditional Formatting:**
- Severity:
  - High (#DC2626): Item completely missing from expected tool
  - Medium (#F59E0B): Field data missing (e.g., no due date in one tool)
  - Low (#6B7280): Item stale (not updated in >30 days in one tool)
- Gap Type:
  - Missing Item: Red badge
  - Missing Field: Amber badge
  - Stale Item: Gray badge

**Expandable Row Detail:**
- Full item details from both tools (side-by-side comparison)
- Suggested action: "Sync this item" or "Update field in [Tool]"
- Link to item in source tool

---

### Section 6: Sync Health Dashboard

**Section Name:** Sync Health & Performance  
**Purpose:** Monitor synchronization pipeline health

**Data Points/Metrics:**
- Sync frequency per tool (string, e.g., "Every 5 minutes")
- Last successful sync per tool (datetime)
- Sync error rate per tool (float, percentage over last 24h)
- Items pending sync (integer, per tool)
- Average sync duration (float, seconds)
- Total items synced today (integer, per tool)
- Webhook status per tool (enum: "Active" | "Inactive" | "N/A", V2)

**Visualization Type:** Metric cards + line chart

**Chart Type:** Line chart (Recharts LineChart) showing sync success rate over last 7 days

**Axis Labels:**
- X-axis: Date (last 7 days)
- Y-axis: Sync success rate (0-100%)

**Visual Elements:**
- One line per connected tool (color-coded per tool)
- Reference line: 99% target (dashed green)
- Below 95%: Amber zone
- Below 90%: Red zone

**Metric Cards:**
Per tool:
- Sync frequency
- Last sync time
- Error rate (24h)
- Items pending
- Avg duration

**Conditional Formatting:**
- Error rate:
  - Green: < 1%
  - Amber: 1-5%
  - Red: > 5%
- Items pending:
  - Green: 0
  - Amber: 1-50
  - Red: > 50
- Avg duration:
  - Green: < 10s
  - Amber: 10-60s
  - Red: > 60s

---

## 3. ASCII Wireframes

### Wireframe 1: Source Overview Cards

```
┌─────────────────────────────────────────────────────────────────┐
│ CONNECTED TOOLS OVERVIEW                                         │
├───────────────────┬───────────────────┬─────────────────────────┤
│   [Jira Logo]     │  [Monday Logo]    │    [Asana Logo]         │
│   Jira Cloud      │  Monday.com       │    Asana                │
│   🟢 Connected    │  🟢 Connected     │    🟡 Degraded          │
│                   │                   │                         │
│   Items: 1,247    │  Items: 892       │    Items: 456           │
│   Projects: 8     │  Projects: 5      │    Projects: 3          │
│                   │                   │                         │
│   Last sync:      │  Last sync:       │    Last sync:           │
│   2 minutes ago   │  5 minutes ago    │    47 minutes ago       │
│                   │                   │                         │
│   Errors (24h): 0 │  Errors (24h): 2  │    Errors (24h): 12    │
│   [████████████]  │  [██████████░░]   │    [████░░░░░░░░]      │
│   100% healthy    │  96% healthy      │    73% healthy          │
└───────────────────┴───────────────────┴─────────────────────────┘
```

### Wireframe 2: Status Mapping Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│ CROSS-TOOL STATUS ALIGNMENT                                      │
├────────────────┬────────────────┬────────────┬───────┬──────────┤
│ Vantage Status │     Jira       │  Monday.com│ Asana │ Conflicts│
├────────────────┼────────────────┼────────────┼───────┼──────────┤
│ To Do          │ "Open"         │ "Not       │"Incom-│    3     │
│                │ "Backlog"      │  Started"  │ plete"│          │
├────────────────┼────────────────┼────────────┼───────┼──────────┤
│ In Progress    │ "In Progress"  │ "Working   │"Incom-│    0     │
│                │                │  on it"    │ plete"│          │
├────────────────┼────────────────┼────────────┼───────┼──────────┤
│ In Review      │ "In Review"    │ "Waiting   │ ⚠️    │   12     │
│                │ "Code Review"  │  for Review│ UNMAP │   🔴     │
├────────────────┼────────────────┼────────────┼───────┼──────────┤
│ Done           │ "Done"         │ "Done"     │"Compl-│    0     │
│                │ "Closed"       │            │ eted" │          │
├────────────────┼────────────────┼────────────┼───────┼──────────┤
│ Blocked        │ "Blocked"      │ "Stuck"    │ ⚠️    │    5     │
│                │                │            │ UNMAP │   🟡     │
└────────────────┴────────────────┴────────────┴───────┴──────────┘
```

### Wireframe 3: Timeline Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│ CROSS-TOOL TIMELINE ALIGNMENT                                    │
├─────────────────────────────────────────────────────────────────┤
│                   Jan 1      Jan 15     Jan 31     Feb 15       │
│                                                                  │
│ Mobile App v2                                                    │
│   Jira     [████████████████████]                               │
│   Monday   [███████████████████████]                            │
│   Asana       [████████████████]                                │
│   Alignment: 72% 🟡  Drift: 8 days                             │
│                                                                  │
│ API Migration                                                    │
│   Jira     [██████████████]                                     │
│   Monday   [██████████████]                                     │
│   Alignment: 95% 🟢  Drift: 1 day                              │
│                                                                  │
│ Data Pipeline                                                    │
│   Jira        [████████████████████]                            │
│   Asana    [████████]                                           │
│   Alignment: 45% 🔴  Drift: 18 days                            │
│                                                                  │
│ Legend: [Jira] [Monday] [Asana]                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Panel

### Tool Selector
- **Type:** Multi-select checkboxes
- **Options:** All connected tools (pre-selected)
- **Minimum:** 2 tools must be selected (comparison requires 2+)
- **Display:** Tool icon + name
- **Impact:** All sections

### Project/Initiative Mapper
- **Type:** Multi-select dropdown with search
- **Options:**
  - All initiatives (default)
  - Selected initiatives
  - Initiatives by tool
- **Display:** Initiative name, connected tool icons
- **Impact:** Timeline Comparison, Data Overlap, Gap Analysis

### Date Range
- **Type:** Calendar date picker with presets
- **Presets:**
  - Last 7 Days
  - Last 30 Days (default)
  - Last 90 Days
  - Custom Range
- **Impact:** Sync Health Dashboard, Data Overlap (time filter)

### Show Only Conflicts Toggle
- **Type:** Toggle switch
- **Default:** Off
- **Purpose:** Filter to show only misaligned/conflicting items
- **Impact:** Data Overlap Matrix, Status Mapping, Timeline Comparison

### Comparison Mode
- **Type:** Radio buttons
- **Options:**
  - All-to-all (compare all tools to each other, default)
  - Pairwise (select two specific tools to compare)
- **Impact:** All sections
- **When pairwise:** Show secondary dropdown to select the two tools

---

## 5. Export Formats

### Web View
- **Layout:** Full-width, multi-section scrollable
- **Charts:** Interactive (hover tooltips, click to drill down)
- **Tables:** Sortable, filterable, expandable rows
- **Responsive:** Desktop-optimized (complex data requires wide viewport)
- **Mobile note:** "For best experience, view on desktop"

### PDF Layout (Browser Print-to-PDF)
- **Page Size:** US Letter (8.5" x 11"), Landscape for Timeline Comparison
- **Margins:** 0.75" all sides
- **Header:**
  - Left: Vantage logo
  - Center: "Cross-Tool Comparison Report"
  - Right: Date range, tools compared
- **Footer:**
  - Left: Confidential
  - Center: Page number
  - Right: Generated timestamp
- **Page Breaks:**
  - Page 1: Source Overview + Status Mapping
  - Page 2: Data Overlap Matrix (may span 2 pages)
  - Page 3: Timeline Comparison (landscape orientation)
  - Page 4: Gap Analysis
  - Page 5: Sync Health Dashboard
- **Styling:**
  - Charts: Static image export
  - Tables: Full width, alternating row colors
  - Color coding preserved for print

### CSV Export
- **Filename:** `cross_tool_comparison_YYYY-MM-DD.csv`
- **Multiple Files:**
  - `data_overlap.csv` — Item title, source tools, confidence, statuses, conflict
  - `status_mapping.csv` — Vantage status, Jira status, Monday status, Asana status, conflict count
  - `gap_analysis.csv` — Gap type, item title, present in, missing from, severity
  - `sync_health.csv` — Tool, last sync, error rate, items pending, avg duration
- **Encoding:** UTF-8 with BOM

---

## 6. Scheduling Options

### Frequency Choices
- **One-time** (default)
- **Daily** (for active integration admins)
- **Weekly** (recommended for PMO leads)
- **Monthly** (for quarterly reviews)

### Recipient Selector
- **Type:** Multi-select with email input
- **Options:**
  - Current user (auto-selected)
  - Integration Admins (auto-detected from RBAC)
  - All Admins
  - Specific email addresses
- **Limit:** Max 50 recipients

### Delivery Method (V1)
- **Email only**
- **Email format:**
  - Subject: `Cross-Tool Comparison Report - [Tools] - [Date Range]`
  - Body: HTML email with summary stats (conflict count, sync health %)
  - Attachment: PDF (if enabled)
  - Link: "View Full Report"

### Delivery Method (V2)
- Slack integration
- Confluence page

---

## 7. Data Requirements

### Minimum Integrations
- **Required:** At least 2 connected integrations (comparison requires 2+)
- **If only 1 integration:** Show empty state with CTA to connect more
- **Supported combinations:** Jira+Monday, Jira+Asana, Monday+Asana, All three

### Minimum Items
- **Items:** At least 10 items per connected tool
- **Projects:** At least 1 shared project/initiative across tools
- **Identity resolution:** T2 identity resolution must be configured

### Minimum History
- **Sync Health:** At least 24 hours of sync history
- **Timeline Comparison:** At least 1 initiative with dates in 2+ tools
- **Status Mapping:** Immediate (uses current field mapping config)

### Data Validation
- **Identity resolution prerequisite:** Report warns if identity resolution (T2) hasn't been configured
- **Field mapping prerequisite:** Report warns if status mapping hasn't been reviewed
- **Stale data:** Warning if any tool's last sync > 24 hours

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
| View sync health details | ✅ | ✅ | ❌ | ❌ |
| Trigger manual sync | ✅ | ✅ | ❌ | ❌ |
| Delete report | ✅ | ✅ | ❌ | ❌ |

**Notes:**
- Sync health details may contain integration credentials metadata — restricted to Admin+
- Manual sync trigger is an Admin action (affects integration quotas)
- Member can view aggregated sync status but not detailed error logs

---

## 9. Empty States and Error States

### Empty State: Only 1 Integration Connected
**Condition:** Less than 2 integrations connected  
**Message:**
```
Cross-tool comparison requires 2+ connected tools

You currently have 1 tool connected. Connect at least one more to see cross-tool insights.
[Connect Monday.com] [Connect Asana]
```
**Visual:** Empty state illustration showing two puzzle pieces

### Empty State: No Overlapping Data
**Condition:** 2+ tools connected but no shared items/initiatives  
**Message:**
```
No overlapping data found

Your connected tools don't share any items or initiatives. This may be because:
- Teams use different tools for different projects
- Identity resolution hasn't been configured
- Data hasn't synced yet

[Configure Identity Resolution] [View Integration Settings]
```

### Empty State: No Status Conflicts
**Condition:** All statuses are aligned  
**Message:**
```
✅ All statuses aligned

No conflicts detected across your connected tools. Great job maintaining consistency!
```
**Visual:** Success illustration, continue showing other sections

### Empty State: Stale Data
**Condition:** Last sync > 24h for any tool  
**Message:**
```
⚠️ Some tools haven't synced recently
[Tool Name] last synced: [Timestamp]
[Sync Now] button
```
**Visual:** Amber warning banner

### Error State: Integration Disconnected
**Condition:** One of the compared tools lost connection  
**Message:**
```
⚠️ [Tool Name] is disconnected
Comparison data may be incomplete. Reconnect to restore full cross-tool analysis.
[Reconnect] [Continue with remaining tools]
```
**Visual:** Error banner, show available data from other tools

### Error State: Identity Resolution Failed
**Condition:** Cannot match users across tools  
**Message:**
```
⚠️ Unable to match users across tools
Cross-tool comparison requires identity resolution. Some items may not be matched correctly.
[Configure Identity Resolution]
```

### Error State: Sync Pipeline Error
**Condition:** Sync errors exceeding threshold  
**Message:**
```
❌ Sync errors detected
[X] sync failures in the last 24 hours for [Tool Name].
[View Error Log] [Retry Sync]
```

---

## 10. Real Assumptions & Open Questions

### Assumptions

1. **Item Matching:** Assumes items across tools can be matched via identity resolution (T2 — email-first) and/or manual linking. If no matching is possible, overlap sections will be empty.

2. **Status Mapping:** Assumes V1 auto-detected field mappings (I2) are sufficient. Custom status mapping requires V2 field mapping UI.

3. **Timeline Data:** Assumes projects/initiatives have date fields in all connected tools. If dates are missing in one tool, timeline comparison shows partial data.

4. **Sync Health:** Assumes sync pipeline logs are available (integration_events table from I3). If event log is empty, sync health section is empty.

5. **Two-Tool Minimum:** Assumes this report is only meaningful with 2+ tools. Single-tool orgs see empty state.

### Open Questions

1. **Q1: Item Matching Threshold**
   - What confidence threshold should we use to consider two items "the same" across tools?
   - Title-only matching? Title + assignee? Title + project?
   - What about items with generic titles like "Bug fix" that appear in multiple projects?
   - **Decision needed:** Product/Engineering to define matching algorithm and thresholds

2. **Q2: Status Mapping Ownership**
   - Who maintains the status mapping table? Is it auto-generated or admin-configured?
   - What happens when a tool adds a new status that isn't mapped?
   - Should we alert admins when unmapped statuses are detected?
   - **Decision needed:** Product to define status mapping governance

3. **Q3: Timeline Alignment Score Calculation**
   - How do we calculate "alignment score" between timelines?
   - Is it based on date overlap? Duration similarity? Progress similarity?
   - What weight do we give start date vs end date vs progress?
   - **Decision needed:** Product/Data Science to define alignment algorithm

4. **Q4: Cross-Tool Dependency Display**
   - Should this report show dependencies that span tools (e.g., Jira task blocks Monday item)?
   - Or is that the Risk & Dependency Report's domain?
   - **Decision needed:** Product to define report boundaries and avoid overlap with Risk report

5. **Q5: Sync Health Detail Level**
   - How much sync pipeline detail should this report expose?
   - Error messages from tool APIs? Webhook delivery status?
   - This overlaps with the Integrations Hub (/integrations) webhook log
   - **Decision needed:** Product to define sync health scope vs. Integrations Hub scope

6. **Q6: Performance with Large Data Overlap**
   - If two tools share 10,000+ items, the Data Overlap Matrix becomes very large
   - Should we paginate? Show only conflicts? Aggregate by project?
   - **Decision needed:** Engineering to define performance limits and UX for large datasets

---

## Technical Notes

### Chart Library
- **Library:** Recharts (React-native compatible, MIT license)
- **Components:** BarChart (timeline comparison), LineChart (sync health), custom table components
- **Tree-shaking:** Import only used components

### Data Fetching
- **API:** `GET /api/v1/reports/cross-tool` with params: toolIds, dateRange, initiativeIds, conflictsOnly
- **Caching:** Cache for 5 minutes (shorter due to sync health being time-sensitive)
- **Pagination:** Data Overlap Matrix paginated server-side (50 items per page)

### Performance
- **Target:** Report generation < 5 seconds for typical dataset
- **Large overlap optimization:** Server-side aggregation, client shows summary with drill-down
- **Timeline chart:** Limit to 20 initiatives per page (paginate if more)

### Identity Resolution Dependency
- This report heavily depends on T2 (Cross-Tool Identity Resolution)
- Items matched via email-first algorithm
- Manual linking results from admin dedup queue
- If identity resolution is incomplete, overlap data will be incomplete

---

## Acceptance Criteria

- [ ] All 6 sections render correctly with sample data from 2+ tools
- [ ] Source Overview shows real connection status and sync timestamps
- [ ] Data Overlap Matrix correctly identifies items in multiple tools
- [ ] Status Mapping Table shows all canonical statuses with tool-specific mappings
- [ ] Timeline Comparison renders multi-tool Gantt overlay
- [ ] Gap Analysis surfaces missing items and fields
- [ ] Sync Health Dashboard shows real-time pipeline health
- [ ] PDF export includes all sections with appropriate page breaks
- [ ] CSV export generates separate files per section
- [ ] Empty state shown when < 2 tools connected
- [ ] RBAC permissions enforced
- [ ] Report loads in < 5 seconds for typical dataset

---

**End of Specification**
