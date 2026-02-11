# Component Reference

Every component in the Vantage codebase, its purpose, props, and relationships.

---

## Layout Components

### `header.tsx` — App Header

Top navigation bar. Fixed position, full width, 64px height.

**Contains:** Logo, search bar, sync status indicator, theme toggle, notification bell, user avatar.

**Used in:** `(app)/layout.tsx` — appears on all authenticated pages.

**Key details:**
- Search input is UI-only (no search backend yet)
- Sync status shows "Live" with animated dot (mocked)
- ThemeToggle imported from `theme-toggle.tsx`

---

### `sidebar.tsx` — App Sidebar

Left navigation panel. Fixed position, 256px wide.

**Contains:** Primary nav links (Dashboard, Projects, Boards, Timeline, Dependencies, Scout), secondary nav (Settings), connected tools indicator.

**Used in:** `(app)/layout.tsx` — appears on all authenticated pages.

**Key details:**
- Active link highlighted with `bg-primary-50 text-primary`
- Badge counts on nav items (e.g., "3" on Dashboard for critical alerts)
- Connected tools section at bottom showing Jira/Monday/Asana status

---

### `theme-provider.tsx` — Theme Context

React Context provider for light/dark theme management.

**Exports:** `ThemeProvider` (component), `useTheme` (hook)

**Hook returns:** `{ theme, setTheme, toggleTheme }`

**Used in:** `layout.tsx` (root) — wraps entire app.

**Key details:**
- Reads initial theme from `document.documentElement.getAttribute("data-theme")`
- Persists to `localStorage` key `vantage-theme`
- Listens to system `prefers-color-scheme` changes

---

### `theme-toggle.tsx` — Theme Switch Button

Moon/Sun icon button that toggles between light and dark mode.

**Props:** None (uses `useTheme` hook internally)

**Used in:** `header.tsx`

---

### `error-boundary.tsx` — Error Boundary

React error boundary for graceful error handling.

**Props:** `{ children: React.ReactNode }`

---

## Dashboard Components

### `the-brief.tsx` — The Morning Brief

The flagship landing experience. Shows personalized daily briefing with narrative intelligence.

**Props:**
```typescript
interface TheBriefProps {
  onStartDay: () => void;         // Navigate to Focus Mode
  onViewFires: () => void;        // Navigate to Focus Mode
  onViewMeetings: () => void;     // Navigate to Meeting Intelligence
  onViewFocusMode: () => void;    // Navigate to Focus Mode
  onViewFullDashboard: () => void; // Navigate to Full Dashboard
}
```

**Contains:**
- Dark gradient banner with day-specific greeting, fire/opportunity/meeting counts, headline
- 4-button entry point grid (Fires, Opportunities, Meeting Prep, One Thing)
- Opportunities section with acceleration cards
- Quick meeting preview with criticality indicators
- Bottom tagline

**Key details:**
- `getGreeting()` returns time-of-day greeting (morning/afternoon/evening) with icon
- `getDayOfWeek()` returns current day name
- Headline text is derived from critical alerts in `ai-mock-data.ts`
- Dark banner uses hardcoded hex (`#0d1117`), not theme tokens

---

### `focus-mode.tsx` — Focus Mode ("The Three Things")

Top 3 highest-leverage actions sorted by impact, with Communication Copilot built in.

**Props:**
```typescript
interface FocusModeProps {
  onBack: () => void;
  onSelectAlert?: (alert: BlockerAlert) => void;
}
```

**Contains:**
- Numbered action cards (1, 2, 3) with severity coloring
- Cascade preview visualization for blocker chains
- Draft message drawer with pre-written Slack messages
- "Send via Slack" / "Edit first" / "Save as template" actions
- Talking points generator for exec meetings with copy-to-clipboard

**Key details:**
- `focusItems` array is hardcoded with curated data linking to `blockerAlerts`
- `sentItems` state tracks which messages have been "sent" (simulated)
- Draft messages are pre-written, contextual, human-toned

---

### `meeting-intelligence.tsx` — Meeting Intelligence

Calendar-aware meeting prep with standup value predictor and meeting eliminator.

**Props:**
```typescript
interface MeetingIntelligenceProps {
  onBack: () => void;
}
```

**Contains:**
- Summary bar (meeting count, prep needed, total attendees, replaceable count)
- Per-meeting expandable cards with topics, severity, talking points
- "Generate status doc (skip meeting)" — Meeting Eliminator
- Standup Value Predictor with value score bar and async draft

**Key details:**
- Meetings data is hardcoded in the component
- Meeting Eliminator generates a full status doc with headlines + decisions
- Shows time saved calculation ("6 hours saved — 8 people × 45 min")
- Standup predictor assesses value at 23% and suggests skipping

---

### `risk-forecast.tsx` — Risk Forecast

4-week risk trajectory with counterfactual modeling.

**Props:**
```typescript
interface RiskForecastProps {
  onBack: () => void;
}
```

**Contains:**
- Timeline visualization (TODAY → +1w → +2w → +4w) with risk score circles
- Feb release probability line
- Counterfactual scenarios ("If you unblock Auth Service: Risk 73→58")
- By-project forecast table with current vs. projected risk

**Key details:**
- Three scenarios: two positive (unblock + scope fix), one negative (do nothing)
- Scenarios are clickable to reveal required actions
- Color-coded by risk threshold (green <50, yellow 50-70, orange 70-85, red 85+)

---

### `stakeholder-radar.tsx` — Stakeholder Radar

Tracks stakeholder awareness and proactively drafts updates.

**Props:**
```typescript
interface StakeholderRadarProps {
  onBack: () => void;
}
```

**Contains:**
- Stakeholder cards with avatar, role, last viewed, last update gap
- Risk level indicators (HIGH GAP, MEDIUM GAP, NO GAPS)
- Expandable detail with surprise risk assessment
- Pre-drafted proactive update messages per stakeholder

**Key details:**
- 4 mock stakeholders (CFO, VP Eng, Product Lead, CTO)
- Gap detection based on last view vs. last update from you
- Draft messages are personalized per stakeholder and channel (Email, Slack DM)

---

### `portfolio-pulse.tsx` — Portfolio Pulse

Portfolio health dashboard with three tabs.

**Props:**
```typescript
interface PortfolioPulseProps {
  onSelectAlert?: (alert: BlockerAlert) => void;
}
```

**Contains:**
- Dark gradient banner with live status, blocked tasks count, delay risk, teams affected
- Portfolio health strip (mini progress bars per project)
- Tab navigation: Action Queue, Impact Cascade, Risk Trends
- Action Queue: severity-sorted alert cards with recommended actions
- Impact Cascade: cascading dependency chains with expandable visualization
- Risk Trends: trending risk factors with sparkline chart

**Key details:**
- Imports from `ai-mock-data.ts` (radarBlips, blockerAlerts, predictions)
- SVG sparkline chart uses CSS variables for theming
- Impact chains are hardcoded with 2 scenarios

---

## Board/Planning Components

### `kanban-board.tsx` — Kanban Board

Drag-and-drop Kanban board view.

**Props:** Receives native project data via page component.

**Contains:** Column headers with counts, draggable cards with assignee, priority, due date.

---

### `scrum-board.tsx` — Scrum Board

Sprint-based Scrum view with charts.

**Props:** Receives sprint data via page component.

**Contains:** Sprint selector, task cards by status, burndown chart (SVG), velocity chart (SVG).

---

### `waterfall-view.tsx` — Waterfall View

Phase-based waterfall project view.

**Props:** Receives waterfall phase data via page component.

**Contains:** Phase timeline, gate reviews, budget tracking, RACI matrix.

---

### `gantt-chart.tsx` — Gantt Chart

Interactive Gantt timeline with impact analysis.

**Props:** Work items with dependencies, impact engine integration.

**Contains:** Scrollable timeline grid, dependency arrows, what-if analysis controls.

**Key details:**
- Uses `impact-engine.ts` for cascade delay calculation
- SVG-based rendering, no chart library

---

## Modal Components

### `alert-detail-modal.tsx` — Alert Detail

Full detail view for a blocker alert.

**Props:**
```typescript
interface AlertDetailModalProps {
  alert: BlockerAlert;
  onClose: () => void;
}
```

**Contains:** Alert metadata, impact summary, affected teams, AI recommendations with confidence scores.

---

### `status-report-modal.tsx` — Status Report Generator

AI-generated status report with configuration and preview.

**Props:**
```typescript
interface StatusReportModalProps {
  project: Project;
  onClose: () => void;
}
```

**Contains:** Three-step flow — Configure → Generating (animated) → Preview with copy/share.

---

### `ticket-detail-panel.tsx` — Work Item Detail

Side panel for viewing and editing a work item.

**Props:** Work item data, edit mode toggle.

**Contains:** Title, description, status, assignee, priority, due date, comments. Edit mode with simulated sync-back.

---

## Data Files

### `lib/mock-data.ts`

Core mock data used across the app.

**Exports:** `projects`, `allAlerts`, `stats`, `activityItems`, `connections`

---

### `lib/ai-mock-data.ts`

AI feature mock data.

**Exports:** `radarBlips`, `blockerAlerts`, `predictions`, `depNodes`, `depEdges`, `sampleScoutResponses`, `sampleStatusReport`

**Types:** `RadarBlip`, `BlockerAlert`, `Prediction`, `DepNode`, `DepEdge`

---

### `lib/native-pm-data.ts`

Native PM tool mock data for Kanban/Scrum/Waterfall views.

**Exports:** `nativeProjects`, `workItems`, `sprints`, `kanbanColumns`, `waterfallPhases`, `teamMembers`

---

### `lib/gantt-data.ts`

Timeline/Gantt data with hierarchy.

**Exports:** `ganttItems`, `ganttSprints`, helper functions for item lookup.

---

### `lib/impact-engine.ts`

Working business logic module (not mocked).

**Exports:** `calculateImpact(items, dependencies, changedItemId)` → returns downstream delay calculations.
