# VANTAGE - Gantt Timeline Feature Specification

**Unified Roadmap View Across All PM Tools**

---

## Feature Overview

### What It Is

The **Gantt Timeline** is Vantage's unified roadmap view that aggregates projects from Monday, Jira, and Asana into a single, interactive timeline. It transforms fragmented project schedules into a coherent visual story of what's happening across the organization.

### Why It Matters

**The Problem:**
- PM manages 8 projects across Monday (marketing), Jira (engineering), and Asana (ops)
- No single place to see all projects on a timeline
- Building slide decks manually for stakeholder updates takes 2+ hours
- Leadership asks "What are we shipping this quarter?" and PM has to check 3 tools

**The Solution:**
- One unified Gantt view shows all projects, regardless of source tool
- Drag-and-drop to adjust dates (writes back to source tools in v2.0)
- Color-coded health indicators (Green/Yellow/Red)
- Export to PNG/PDF for stakeholder presentations
- Filter by team, tool, PM, or status

### User Value Proposition

**For PMs (Jake):**
- "See all my projects on one timeline in 10 seconds"
- "Export timeline for stakeholder meeting in 30 seconds"
- "Spot timeline conflicts instantly (two projects due same week)"

**For PMO Directors (Sarah):**
- "Portfolio roadmap view for leadership presentations"
- "Identify resource bottlenecks (too many projects Q2, not enough Q3)"
- "Track milestone progress across 50+ projects"

**For VPs (Maria):**
- "Executive dashboard: What's shipping this quarter?"
- "Capacity planning: Are we overcommitted?"
- "Board-ready visualization in 2 minutes"

---

## User Workflows

### Workflow 1: PM Views Timeline (Primary Use Case)

**Context:** Jake (PM) wants to see all his projects on a timeline before his weekly stakeholder meeting.

**Steps:**
1. Jake opens Vantage dashboard
2. Clicks **"Timeline"** tab in top navigation
3. Timeline loads, showing all 8 projects across Monday/Jira/Asana
4. Projects displayed as horizontal bars on a Gantt chart
5. Color-coded by health score (Green/Yellow/Red)
6. Jake zooms to "This Quarter" view
7. Identifies conflict: Two critical projects both due May 15
8. Jake drags one project to June 1 (writes back to Monday in v2.0)
9. Jake clicks **"Export PNG"** and sends to stakeholders

**Time:** 30-60 seconds (vs 30 minutes building slide deck manually)

**Success Criteria:**
- Timeline loads in <3 seconds
- All projects visible and accurate
- Export works reliably

---

### Workflow 2: PMO Director Presents to Leadership

**Context:** Sarah (PMO Director) needs to present portfolio roadmap to CEO/Board.

**Steps:**
1. Sarah opens Vantage Timeline
2. Filters to **"All Projects"** (not just her own)
3. Groups by **"Team"** (Engineering, Marketing, Ops, Sales)
4. Color-coding shows 3 Red projects (at risk)
5. Sarah clicks on Red project → Drill into project details
6. Sees root cause: "Deployment frequency dropped 40%"
7. Returns to Timeline, clicks **"Export PDF"**
8. Adds to Board deck

**Time:** 5 minutes (vs 2 days collecting data manually)

**Success Criteria:**
- Portfolio-level view (50+ projects)
- Grouping/filtering works smoothly
- Export quality is presentation-ready

---

### Workflow 3: VP Identifies Capacity Issues

**Context:** Maria (VP Engineering) wants to understand Q2 vs Q3 capacity.

**Steps:**
1. Maria opens Timeline, zooms to **"Next 6 Months"**
2. Sees 12 projects due in Q2 (April-June)
3. Sees only 4 projects in Q3 (July-Sept)
4. Identifies overcommitment risk in Q2
5. Clicks **"Resource View"** (future feature)
6. Sees Engineering team at 140% capacity Q2, 60% Q3
7. Maria decides to shift 2 projects from Q2 → Q3

**Time:** 10 minutes (vs gut feeling or manual analysis)

**Success Criteria:**
- Clear visualization of project density
- Easy to spot overcommitment
- Future: Resource allocation overlay

---

## Visual Design Specification

### Layout Structure

```
┌────────────────────────────────────────────────────────────────┐
│  VANTAGE                                Timeline   [Export ▼]   │ ← Header
├────────────────────────────────────────────────────────────────┤
│  [Filters: All Tools ▼] [Group By: Team ▼] [Zoom: Quarter ▼]  │ ← Controls
├──────────────┬─────────────────────────────────────────────────┤
│              │  Mar    Apr    May    Jun    Jul    Aug    Sep  │ ← Timeline header
│              ├─────────────────────────────────────────────────┤
│ Engineering  │  [■■■■■■■■■■■■■■■■      ]                       │ ← Project bar (Green)
│  Mobile v2.0 │                                                 │
│              │                                                 │
│ Marketing    │          [■■■■■■■■■■      ]                     │ ← Project bar (Yellow)
│  Campaign    │                                                 │
│              │                                                 │
│ Engineering  │                    [■■■■■■■■■■■■■■■            ]│ ← Project bar (Red)
│  API Migr.   │                                                 │
└──────────────┴─────────────────────────────────────────────────┘
```

### Project Bar Design

**Anatomy of a Project Bar:**
```
┌─────────────────────────────────────────────┐
│  🟢 Mobile App v2.0                         │ ← Project name + health dot
│  Jira · Jake                                │ ← Source tool + PM name
│  Apr 15 - Jun 30 · 2 alerts                │ ← Dates + alert count
└─────────────────────────────────────────────┘
```

**Visual Specifications:**
- **Height:** 64px per project bar
- **Padding:** 8px between bars
- **Border radius:** 8px
- **Border:** 1px solid (health-color + 20% opacity)
- **Background:** White (or light health-color tint for emphasis)
- **Shadow:** 0px 2px 8px rgba(0,0,0,0.08) on hover

**Color Coding (Health Score):**
- 🟢 **Green (80+):** Border #10B981, Background #F0FDF4
- 🟡 **Yellow (50-79):** Border #F59E0B, Background #FFFBEB
- 🔴 **Red (<50):** Border #EF4444, Background #FEF2F2

**Text:**
- Project name: 16px, Weight 600, Gray 900
- Metadata: 14px, Weight 400, Gray 600
- All text: Inter font

---

### Timeline Header (Months/Weeks)

**Month View:**
```
┌────────┬────────┬────────┬────────┬────────┬────────┐
│  Mar   │  Apr   │  May   │  Jun   │  Jul   │  Aug   │
└────────┴────────┴────────┴────────┴────────┴────────┘
```
- Font: 14px, Weight 600, Gray 900
- Background: Gray 100
- Border bottom: 1px solid Gray 300
- Height: 48px
- Sticky on scroll

**Week View (when zoomed in):**
```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ W1   │ W2   │ W3   │ W4   │ W5   │ W6   │ W7   │ W8   │
└──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

**Today Marker:**
- Vertical line (2px, Vantage Blue #0066FF)
- Runs full height of timeline
- Label: "Today" (12px, above line)

---

### Sidebar (Project List)

**Structure:**
```
┌──────────────────────┐
│ Engineering          │ ← Group header
├──────────────────────┤
│  Mobile App v2.0     │ ← Project row
│  Jira · Jake         │
├──────────────────────┤
│  API Migration       │
│  Jira · Sarah        │
├──────────────────────┤
│ Marketing            │ ← Group header
├──────────────────────┤
│  Campaign Launch     │
│  Monday · Alex       │
└──────────────────────┘
```

**Dimensions:**
- Width: 280px
- Fixed position (scrolls independently from timeline)
- Group headers: 14px, Weight 600, Gray 900, Background Gray 100
- Project rows: 64px height (matches timeline bars)

---

### Controls & Filters

**Filter Bar:**
```
[All Tools ▼]  [All Teams ▼]  [All PMs ▼]  [All Statuses ▼]
```
- Dropdown menus
- 16px height, 12px padding
- Border: 1px Gray 300
- Hover: Border Vantage Blue

**Zoom Selector:**
```
[Year] [Quarter] [Month] [Week]
```
- Tab-style buttons
- Active tab: Vantage Blue background, White text
- Inactive: Gray 700 text, Transparent background

**Export Button:**
```
[Export ▼]
  → Export as PNG
  → Export as PDF
  → Copy Link
```
- Dropdown menu
- Primary button style
- Export formats: PNG (4000×2000px), PDF (landscape A4)

---

### Interactions & Animations

**Hover States:**
- Project bar: Lift effect (0px 4px 16px rgba(0,0,0,0.12))
- Cursor: pointer
- Show tooltip with full project details

**Tooltip (on hover):**
```
┌─────────────────────────────────┐
│ 🟢 Mobile App v2.0              │
│ Start: Apr 15, 2026             │
│ End: Jun 30, 2026               │
│ Health: 85 (On track)           │
│ Alerts: 2 open                  │
│ PM: Jake                        │
│ Source: Jira                    │
│                                 │
│ [View Details]                  │
└─────────────────────────────────┘
```
- Appears after 300ms hover
- Positioned above or below bar (auto-adjust)
- Shadow: 0px 8px 24px rgba(0,0,0,0.15)

**Click:**
- Project bar click → Opens project detail modal (same as dashboard click)
- Timeline drag (v2.0 feature) → Adjust dates, write back to source tool

**Loading State:**
- Skeleton bars (animated shimmer)
- Loads in <3 seconds

**Empty State:**
```
┌─────────────────────────────────────┐
│         No projects found           │
│                                     │
│  Try adjusting your filters or      │
│  connect a tool to get started.     │
│                                     │
│       [Connect Tools]               │
└─────────────────────────────────────┘
```

---

## Technical Requirements

### Data Sources

**Input Data (from integrations):**
```javascript
{
  "projectId": "proj_12345",
  "name": "Mobile App v2.0",
  "source": "jira", // monday | jira | asana
  "startDate": "2026-04-15",
  "endDate": "2026-06-30",
  "healthScore": 85,
  "status": "in_progress", // planned | in_progress | at_risk | completed
  "owner": "Jake Smith",
  "team": "Engineering",
  "alerts": [
    { "type": "dora_metric", "severity": "warning" }
  ],
  "milestones": [
    { "name": "Beta Launch", "date": "2026-05-15" },
    { "name": "GA Launch", "date": "2026-06-30" }
  ]
}
```

**API Endpoints (Backend):**
- `GET /api/timeline/projects?filter=...&groupBy=...&zoom=...`
  - Returns: Array of projects with timeline data
  - Filters: tool, team, PM, status
  - GroupBy: team, tool, PM, none
  - Zoom: year, quarter, month, week

- `GET /api/timeline/export?format=png|pdf`
  - Returns: Binary image or PDF file

- `PATCH /api/timeline/projects/:id` (v2.0)
  - Updates project dates, writes back to source tool

---

### Frontend Implementation

**Tech Stack:**
- React + TypeScript
- Charting: Custom SVG (not a library — gives us full control)
- Date handling: date-fns
- Export: html2canvas (PNG), jsPDF (PDF)

**Component Structure:**
```
<Timeline>
  <TimelineControls />
  <TimelineContainer>
    <TimelineSidebar />
    <TimelineGrid>
      <TimelineHeader />
      <TimelineBody>
        <ProjectBar />
        <ProjectBar />
        ...
      </TimelineBody>
    </TimelineGrid>
  </TimelineContainer>
</Timeline>
```

**Key Considerations:**
- Virtualization for 50+ projects (render only visible rows)
- Horizontal scroll (wide timelines)
- Responsive (collapse sidebar on mobile)
- Touch-friendly (mobile/tablet drag)

---

### Backend Requirements

**Database Schema (Postgres):**
```sql
-- Projects already stored, timeline pulls from existing projects table
SELECT 
  p.id,
  p.name,
  p.source_tool,
  p.start_date,
  p.end_date,
  p.health_score,
  p.status,
  u.name AS owner_name,
  t.name AS team_name,
  COUNT(a.id) AS alert_count
FROM projects p
LEFT JOIN users u ON p.owner_id = u.id
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN alerts a ON p.id = a.project_id AND a.status = 'open'
WHERE p.organization_id = ?
  AND p.archived = false
GROUP BY p.id, u.name, t.name
ORDER BY p.start_date ASC;
```

**Caching Strategy:**
- Cache timeline data for 5 minutes (Redis)
- Invalidate on project update
- Pre-generate common views (e.g., "This Quarter")

**Export Processing:**
- Server-side rendering (Puppeteer or similar)
- Queue export jobs (if >50 projects)
- Return download link when ready

---

### Performance Requirements

**Load Time:**
- Initial timeline load: <3 seconds (50 projects)
- Filter change: <500ms
- Export generation: <10 seconds (PNG), <15 seconds (PDF)

**Scalability:**
- Support 500+ projects per organization
- Support 10,000+ projects across platform
- Horizontal scaling (stateless API)

---

## MVP vs Future Features

### MVP (v1.0) - MUST HAVE

✅ **Unified Timeline View**
- Aggregate projects from Monday/Jira/Asana
- Display as Gantt chart (horizontal bars)
- Color-coded by health score

✅ **Basic Filters**
- Filter by tool, team, PM, status
- Group by team or tool

✅ **Zoom Levels**
- Year, Quarter, Month

✅ **Export**
- Export as PNG

✅ **Today Marker**
- Vertical line showing current date

✅ **Hover Tooltips**
- Show project details on hover

✅ **Click-Through**
- Click project bar → Open project detail modal

---

### v1.5 - NICE TO HAVE (3-6 Months)

🟡 **Week Zoom Level**
- Zoom into weekly granularity

🟡 **Milestone Markers**
- Show milestones as diamonds on timeline

🟡 **Export PDF**
- PDF export for presentations

🟡 **Custom Date Range**
- "Show Apr 1 - Jul 31" (user-defined)

🟡 **Search**
- Search projects by name

🟡 **Collapse/Expand Groups**
- Collapse "Engineering" group to hide 10 projects

---

### v2.0 - ADVANCED (6-12 Months)

🔴 **Drag-and-Drop Editing**
- Drag project bar to adjust dates
- Write back to source tool (Monday/Jira)

🔴 **Resource View**
- Overlay PM/team capacity on timeline
- Show overallocation warnings

🔴 **Dependencies**
- Show project dependencies (arrows connecting bars)
- Highlight critical path

🔴 **Baseline vs Actual**
- Show original plan (light bar) vs current timeline (solid bar)

🔴 **Scenario Planning**
- "What if we delay Project A by 2 weeks?"
- Sandbox mode (doesn't write back)

🔴 **Timeline Sharing**
- Generate public link for external stakeholders
- Embed timeline in Notion/Confluence

---

## Integration with Vantage Product

### How Timeline Fits Into Vantage

**Timeline is a VIEW, not a separate product.**

It shares the same underlying data as:
- Dashboard (project cards)
- Alerts (risk detection)
- Recommendations (AI suggestions)
- Stakeholder messaging (communication)

**User Journey:**
1. PM sees Red project on Dashboard
2. Clicks into Timeline to see how it fits with other projects
3. Realizes: Red project + another project both due same week
4. Adjusts timeline (v2.0)
5. Generates stakeholder message: "Shifted Project A to June 15 to avoid resource conflict"

**Timeline Navigation:**
- Top-level tab: **Dashboard | Timeline | Alerts | Settings**
- Always accessible
- Badge count on "Timeline" if any projects due this week

---

### User Permissions

**Role-Based Access:**
- **PM (Jake):** See only own projects + team projects
- **PMO Director (Sarah):** See all projects across organization
- **VP (Maria):** See all projects + executive summary view

**Filtering Logic:**
- Default view: User's own projects
- "Show All Projects" toggle (if user has permissions)
- Respect organization-level visibility settings

---

## Success Metrics

### Product Metrics

**Adoption:**
- % of users who open Timeline within 7 days: 60%+
- % of users who open Timeline weekly: 40%+

**Engagement:**
- Average time spent on Timeline per session: 2-5 minutes
- Export usage: 30%+ of users export at least once per month

**Value:**
- User-reported time savings: "Timeline saves me X minutes per week"
- Self-reported value: "How valuable is Timeline?" (1-10 scale, target 8+)

### User Feedback Goals

**Qualitative:**
- "I can finally see all my projects in one place"
- "This cut my stakeholder update prep from 30 min to 2 min"
- "Leadership loves the timeline exports"

**Feature Requests (indicates success):**
- "Can I drag to adjust dates?" → Validates v2.0 roadmap
- "Can I show dependencies?" → Validates advanced features
- "Can I share this with external stakeholders?" → Validates sharing feature

---

## Development Estimates

### MVP (v1.0)

**Frontend:**
- Timeline layout & styling: 3-4 days
- Project bar rendering: 2 days
- Filters & grouping: 2-3 days
- Export PNG: 2 days
- Responsive design: 2 days
- **Total Frontend: 11-13 days**

**Backend:**
- Timeline API endpoint: 2 days
- Filter/grouping logic: 1-2 days
- Export generation: 2-3 days
- Caching: 1 day
- **Total Backend: 6-8 days**

**Testing & Polish:**
- QA: 2 days
- Performance optimization: 1-2 days
- Bug fixes: 2 days
- **Total Testing: 5-6 days**

**TOTAL MVP: 22-27 days (4-5 weeks, 1 developer)**

---

### v1.5 Features

**Each feature (estimated):**
- Week zoom: 2 days
- Milestones: 3 days
- PDF export: 2 days
- Custom date range: 2 days
- Search: 1 day
- Collapse/expand: 2 days

**TOTAL v1.5: 12 days (2-3 weeks)**

---

### v2.0 Features

**Each feature (estimated):**
- Drag-and-drop: 5-7 days (complex)
- Write-back to tools: 3-5 days (API integration)
- Resource view: 5-7 days (new data model)
- Dependencies: 7-10 days (complex graph logic)
- Baseline vs actual: 3 days
- Scenario planning: 7-10 days (sandbox mode)

**TOTAL v2.0: 30-42 days (6-8 weeks)**

---

## Open Questions / Decisions Needed

### Decision 1: Custom Timeline Library vs Off-the-Shelf?

**Option A: Build Custom (SVG)**
- Pros: Full control, exact design match, no licensing
- Cons: More dev time (4-5 weeks)

**Option B: Use Library (e.g., DHTMLX Gantt, Bryntum)**
- Pros: Faster (2-3 weeks), mature features
- Cons: Licensing cost ($500-2000/year), design constraints

**Recommendation:** Build custom for MVP (simpler than full Gantt), consider library for v2.0 advanced features

---

### Decision 2: Real-Time Updates?

**Question:** Should timeline auto-refresh when projects change in Monday/Jira?

**Option A: Real-Time (WebSockets)**
- Pros: Always up-to-date
- Cons: Complex, more server load

**Option B: Manual Refresh**
- Pros: Simple, low server load
- Cons: Might be stale

**Recommendation:** Manual refresh for MVP (with "Last updated 2 min ago" indicator), real-time in v2.0

---

### Decision 3: Mobile Experience?

**Question:** How important is mobile timeline view?

**Analysis:**
- PMs mostly use desktops for planning (not mobile)
- Mobile could be "view-only" (no editing)

**Recommendation:** Responsive design (works on mobile) but optimize for desktop/laptop

---

## Conclusion

The Gantt Timeline is a **high-value, moderate-complexity** feature that:
- Solves acute pain (fragmented project views)
- Differentiates Vantage from competitors (unified roadmap)
- Enables stakeholder communication (export for presentations)
- Opens door to advanced features (drag-and-drop, dependencies, resource planning)

**Estimated MVP Timeline:** 4-5 weeks (1 full-stack developer)

**Recommended Build Sequence:**
1. Week 1-2: Basic timeline rendering + data pipeline
2. Week 3: Filters, grouping, zoom
3. Week 4: Export, polish, responsive
4. Week 5: QA, bug fixes, launch

**Ready to build.** 🚀
