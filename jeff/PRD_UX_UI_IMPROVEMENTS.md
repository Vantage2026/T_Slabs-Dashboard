# Product Requirements Document: Vantage UX/UI Overhaul
**Author:** Jeff, SVP Product  
**Date:** February 11, 2026  
**Version:** 1.0  
**Status:** Proposed  
**Audience:** Engineering, Design, CEO

---

## Executive Summary

I've spent the past day going through every page, every flow, and every pixel of Vantage. Here's the honest assessment:

**What's working:** The AI intelligence features are genuinely differentiated. Risk Analysis, Predictive Intelligence, Scout — these are real product superpowers. The data model is solid. The Jira integration is well-built. The hierarchy tree view for tasks is a good start.

**What's not working:** The product feels like it was built feature-by-feature without a holistic UX pass. Each page is an island with its own patterns, spacing, and visual language. Dark mode is broken in dozens of places. There's no clear activation path for new users. The information architecture has grown organically and it shows.

**The thesis of this PRD:** We don't need more features. We need the features we have to work 2x better. A user who can't read the screen in dark mode, can't find where to click, or doesn't know what to do after signup — that user churns. Every UX fix below is a retention fix.

**Estimated impact:** If we execute this well, I'd expect a 20-30% improvement in Day-7 retention and a measurable reduction in support questions.

---

## Table of Contents

1. [P0: Critical Dark Mode Fixes](#p0-critical-dark-mode-fixes)
2. [P0: Activation & Onboarding](#p0-activation--onboarding)
3. [P1: Design System Enforcement](#p1-design-system-enforcement)
4. [P1: Information Architecture Restructure](#p1-information-architecture-restructure)
5. [P1: Project Detail Page Redesign](#p1-project-detail-page-redesign)
6. [P1: Mobile Responsiveness](#p1-mobile-responsiveness)
7. [P2: Component Library Standardization](#p2-component-library-standardization)
8. [P2: Microinteractions & Polish](#p2-microinteractions--polish)
9. [P2: Accessibility Audit](#p2-accessibility-audit)
10. [P3: Advanced UX Enhancements](#p3-advanced-ux-enhancements)

---

## P0: Critical Dark Mode Fixes

**Why P0:** ~50% of developer/PM users prefer dark mode. If they can't read the interface, they leave. This is not a cosmetic issue — it's a usability blocker.

### Problem

The app uses CSS variable inversion (`data-theme="dark"`) which remaps the neutral scale. This is elegant in theory but breaks in practice because:

1. **Many components use hardcoded neutral values that become unreadable.** `text-neutral-400` maps to `#6e7681` in dark mode — barely visible on `#0d1117` backgrounds.
2. **Colored tint backgrounds** (`bg-amber-50`, `bg-red-50`, etc.) are remapped in `globals.css` but components keep getting added without testing in dark mode.
3. **`dark:` Tailwind prefixes are dead code.** The app doesn't use Tailwind's `darkMode` class strategy, so every `dark:` class does nothing. This has wasted engineering cycles.

### Requirements

#### DM-1: Establish Dark Mode Color Rules
Create a documented reference (add to `DESIGN_LANGUAGE.md`) with these absolute rules:

| Use Case | Light Mode Token | Dark Mode Renders As | Min Contrast |
|----------|-----------------|---------------------|--------------|
| Headings | `text-neutral-900` | `#f0f3f6` | 15:1 |
| Body text | `text-neutral-800` | `#e0e6eb` | 12:1 |
| Secondary text | `text-neutral-700` | `#c9d1d9` | 9:1 |
| Muted/labels | `text-neutral-500` | `#848d97` | 4.5:1 |
| Disabled/hint | `text-neutral-400` | `#6e7681` | 3:1 (LOW — avoid for readable content) |
| Borders | `border-neutral-200` | `#212830` | N/A |
| Surface | `bg-white` (→ `#151b23`) | Auto | N/A |
| Page bg | `bg-neutral-50` (→ `#0d1117`) | Auto | N/A |
| Subtle bg | `bg-neutral-100` (→ `#151b23`) | Auto | N/A |

**Rule: Never use `text-neutral-400` or lower for content a user needs to read in dark mode.**

#### DM-2: Full Page Audit
Every page must be tested in dark mode and fixed. Priority order:

1. **Project Detail** (`/project/[id]`) — the most complex page, highest traffic
2. **Dashboard / Command Center** (`/dashboard`) — the landing page
3. **Projects list** (`/projects`)
4. **Reports** (all sub-pages)
5. **Settings** (`/settings` + all sub-pages)
6. **Scout** (`/scout`)
7. **Integrations** (`/integrations`)
8. **Boards** (`/boards`), Timeline (`/timeline`)

#### DM-3: Remove All `dark:` Prefixed Classes
Run a project-wide search-and-remove for any `dark:` Tailwind classes. They do nothing and confuse engineers into thinking they work.

#### DM-4: Add Dark Mode Visual Regression Tests
Implement screenshot-based tests (Playwright or Chromatic) for all key pages in both themes. No PR should merge without passing dark mode visual checks.

### Success Metrics
- Zero readability issues reported by users in dark mode
- WCAG AA contrast ratio (4.5:1 minimum) for all text elements in dark mode

---

## P0: Activation & Onboarding

**Why P0:** The fastest path from signup to $5K MRR is converting free-trial users to paid. Every user who churns in the first session is revenue lost.

### Problem

A new user who signs up today sees:
1. The Command Center with zero data — just empty widgets
2. No guidance on what to do first (connect Jira? Create a project? Explore Scout?)
3. A Getting Started checklist that's buried and doesn't adapt to user context
4. 6 dashboard view modes on a sidebar they haven't learned yet

### Requirements

#### OB-1: First-Run Experience (FRE)
When a user has zero connected tools and zero projects:

**Screen 1: Welcome**
- "Welcome to Vantage. Let's set you up in under 2 minutes."
- Two paths:
  - **"Connect your PM tool"** → OAuth flow for Jira/Monday/Asana
  - **"Start fresh in Vantage"** → Create native project wizard

**Screen 2: Success**
- After connecting or creating: "Your data is syncing. Here's what Vantage will show you..."
- Animated preview of what their Command Center will look like with data
- "While we sync, meet Scout →" (optional onboarding side-path)

**Screen 3: Command Center (with data)**
- Auto-navigate to Command Center
- Pulsing highlights on key elements: "This is your health score", "These are your at-risk items"
- Dismiss-able, never shows again after first visit

#### OB-2: Empty States for Every Page
Every page that can be empty needs a purpose-built empty state:

| Page | Empty State Message | CTA |
|------|-------------------|-----|
| Projects | "No projects yet. Connect a PM tool or create one here." | Connect Tool / Create Project |
| Boards | "Your boards will appear here once you have projects." | Go to Projects |
| Timeline | "Timeline view needs project data. Get started:" | Connect Tool |
| Reports | "Reports are generated from your project data." | Connect Tool |
| Scout | "Scout gets smarter with more data. Connect a tool to unlock AI insights." | Connect Tool |

#### OB-3: Progressive Dashboard
Don't show all 6 Command Center views to a new user. Start with **The Brief** only. Unlock additional views as the user's data grows:

| View Mode | Unlock Condition |
|-----------|-----------------|
| The Brief | Always available |
| Focus Mode | After first blocked task detected |
| Risk Forecast | After 2+ projects synced |
| Meeting Intel | After 5+ tasks with assignees |
| Stakeholder Radar | After 10+ team members detected |
| Full Dashboard | After 2 weeks of use |

Show locked views as greyed cards with "Unlock by..." messaging.

### Success Metrics
- 80%+ of new users complete onboarding (connect tool or create project)
- Time to "aha moment" < 3 minutes (defined as viewing a project with health score)
- Day-1 retention > 60%

---

## P1: Design System Enforcement

**Why P1:** Inconsistency is cognitive debt. Every time a user encounters a different card style, button treatment, or spacing pattern, they burn mental energy re-learning the interface.

### Problem

I found at least 5 different card styles, 3 different button treatments, and inconsistent spacing (p-4, p-5, p-6 used seemingly at random) across the app. The design language doc exists but isn't enforced in code.

### Requirements

#### DS-1: Reconcile Primary Color
The design language doc defines primary as **Indigo `#6366f1`**, but `globals.css` implements **Blue `#0066CC`**. Pick one. My recommendation: keep the implemented blue — it's more professional for enterprise SaaS and differentiates from Figma/Linear's purple/indigo. Update the design language doc.

#### DS-2: Standardized Card Component
Create a single `<Card>` component with variants:

```typescript
interface CardProps {
  variant: 'default' | 'raised' | 'outlined' | 'highlighted';
  padding: 'sm' | 'md' | 'lg';   // maps to p-4, p-5, p-6
  status?: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}
```

Every card-like element across the app should use this. No more `bg-white rounded-xl shadow-sm border border-neutral-100 p-6` scattered in 40+ places.

#### DS-3: Standardized Stat Box
Create a `<StatBox>` component:

```typescript
interface StatBoxProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'flat';
  status?: 'success' | 'warning' | 'danger' | 'neutral';
}
```

#### DS-4: Standardized Filter Bar
Create a `<FilterBar>` component with status filters, search, and action buttons. Currently every page rebuilds this from scratch.

#### DS-5: Spacing Scale
Enforce consistent spacing:
- **Section gap:** `space-y-6` (between major sections)
- **Card gap:** `gap-4` (between cards in a grid)
- **Internal padding:** `p-5` (standard card content)
- **Header padding:** `px-6 py-4` (section headers)

Document this in the design language doc and enforce via linting.

### Success Metrics
- Every card on the app uses the standardized `<Card>` component
- Visual consistency score (internal audit): 90%+ across all pages

---

## P1: Information Architecture Restructure

**Why P1:** Users shouldn't need a map to use the product. The current IA has grown organically and needs intentional structure.

### Problem

1. **6 dashboard views** are overwhelming for new users and even confusing for power users (what's the difference between "Focus Mode" and "The Brief"?)
2. **Settings has 8+ sub-pages** with no grouping — API Keys, SSO, and Audit Log are enterprise features mixed with basic profile settings
3. **Sidebar has 12 items** — too many for a flat list. No hierarchy or grouping.
4. **No breadcrumbs** on most pages — users lose their place, especially drilling from Projects → Project Detail

### Requirements

#### IA-1: Restructure Sidebar Navigation

**Proposed new structure:**

```
MAIN
├── Home (Command Center — default to Brief)
├── Projects
├── Boards
├── Timeline
└── Reports

TOOLS
├── Scout AI
├── Dependencies
└── Activity Feed

SETTINGS (gear icon, bottom)
├── General (profile, appearance, notifications)
├── Integrations (connected tools, field mappings)
├── Security (2FA, SSO, API keys, audit log)
└── Billing (subscription, invoices)
```

This reduces top-level items from 12 to 8, groups related features, and separates "daily use" from "occasional configuration."

#### IA-2: Simplify Dashboard Views
Reduce from 6 views to 3:

| View | What It Contains |
|------|-----------------|
| **Overview** | Brief + key stats + alerts (merge of Brief and Focus) |
| **Intelligence** | Risk Forecast + Meeting Intel + Stakeholder Radar (merge of 3 AI views) |
| **Portfolio** | Full dashboard with all widgets (current Full Dashboard) |

Users can still access all the same data — just organized into fewer, more distinct tabs.

#### IA-3: Add Breadcrumbs
Every page deeper than top-level should have breadcrumbs:
- `Projects → Customer Portal v2.0`
- `Settings → Security → API Keys`
- `Reports → Sprint Summary`

Use a consistent `<Breadcrumbs>` component positioned below the header, above the page content.

#### IA-4: Add Global Command Palette (Cmd+K)
Power users should be able to jump anywhere instantly:
- Search projects, tasks, pages
- Quick actions (Create Project, Trigger Sync, Open Scout)
- Recently viewed items

This is table stakes for developer/PM tools (see: Linear, Notion, Figma, GitHub).

### Success Metrics
- Average clicks to reach any page: ≤ 2
- User-reported "I couldn't find X" support tickets: -50%

---

## P1: Project Detail Page Redesign

**Why P1:** This is the highest-traffic page after the dashboard. It's also the most complex — and it shows.

### Problem

The project detail page is a vertical scroll of 8+ panels with no structure:
1. Project Intelligence (stats, completion, blocked, insights)
2. Tasks (tree view with filters)
3. Team Workload
4. Risk Analysis
5. Predictive Intelligence
6. Scope Creep Monitor
7. Recent Activity
8. Quick Actions

A user who lands here is looking for ONE thing: "Is my project healthy and what do I need to act on?" Instead, they get a wall of information.

### Requirements

#### PD-1: Two-Column Layout
Split into a 2/3 + 1/3 layout:

**Left column (2/3):**
- Project header (name, health score, source badge, sync status)
- Task list (tree view with filters — this is the main interaction)
- Recent Activity

**Right column (1/3) — "Intelligence Sidebar":**
- Health summary (completion %, trend)
- Top alerts (blocked, overdue — clickable)
- Risk Analysis (simplified — just the risk level + top 3 items)
- Quick Actions

**Why:** The task list is the user's primary interaction. Intelligence data is context that supports the task list, not a separate section to scroll through.

#### PD-2: Collapsible Intelligence Panels
Each panel in the intelligence sidebar should be collapsible. Default: Health summary open, Risk Analysis open, others collapsed. User preference persisted in localStorage.

#### PD-3: Sticky Task Filters
The task filter bar (search, status filters, Add Task, CSV) should be **sticky** — it stays pinned when the user scrolls through the task list. Currently it scrolls away and users have to scroll back up to filter.

#### PD-4: Task Detail Slide-Over
When clicking a task, open a slide-over panel from the right (not navigate away). This is the Jira pattern — click an issue, see details, close, you're back where you were.

The slide-over should contain:
- Task title (editable)
- Status (editable dropdown)
- Priority (editable dropdown)
- Assignee (editable with search)
- Due date (editable date picker)
- Description (rich text, editable)
- Comments thread
- External link (to Jira/source)

#### PD-5: Inline Task Status Updates
Allow changing task status directly from the task list row (click the status badge → dropdown → select new status). Don't force users to open the detail panel just to change a status.

### Success Metrics
- Time to find a specific task: < 5 seconds
- Time to change a task status: < 3 seconds (from task list)
- Scroll depth: top 3 panels visible without scrolling on 1080p

---

## P1: Mobile Responsiveness

**Why P1:** PMs check project status from their phones constantly — in meetings, in transit, during coffee. If Vantage doesn't work on mobile, they open Jira instead.

### Requirements

#### MR-1: Responsive Sidebar
- Desktop: Fixed sidebar (current)
- Tablet: Collapsible sidebar (hamburger toggle)
- Mobile: Bottom tab bar with 5 key items (Home, Projects, Scout, Notifications, More)

#### MR-2: Responsive Task List
On mobile, the task list should show:
- Title (full width)
- Status badge
- Priority badge
- Tap to expand → shows assignee, due date, type, actions

Hide TICKET, ASSIGNEE, DUE DATE, TYPE columns on mobile. Show them on tap/expand.

#### MR-3: Responsive Project Detail
- Stack two-column layout to single column on mobile
- Intelligence sidebar becomes a collapsible drawer from bottom
- Swipe gestures: swipe between project sections

#### MR-4: Touch-Friendly Targets
All interactive elements must be minimum **44x44px** touch targets on mobile (Apple HIG standard).

### Success Metrics
- 100% of key flows completable on mobile (view projects, check health, change status)
- Lighthouse mobile score: 90+

---

## P2: Component Library Standardization

### Requirements

#### CL-1: Shared Component Inventory
Extract and standardize these components:

| Component | Usage |
|-----------|-------|
| `<Card>` | Every card/panel in the app |
| `<StatBox>` | Stat display (Blocked: 0, High Priority: 38) |
| `<FilterBar>` | Status filters + search + actions |
| `<Badge>` | Status badges, priority badges, source badges |
| `<HealthScore>` | Numeric health score with color coding |
| `<EmptyState>` | Page/section empty states |
| `<Breadcrumbs>` | Navigation breadcrumbs |
| `<SlideOver>` | Detail panels (task detail, project detail) |
| `<TreeItem>` | Recursive tree node (task hierarchy) |
| `<Avatar>` | User avatar (initials or image) |

#### CL-2: Storybook
Set up Storybook for the component library. Each component should have:
- All variants documented
- Light and dark mode previews
- Mobile viewport preview
- Accessibility notes

### Success Metrics
- 100% of UI patterns use shared components
- New pages can be built 50% faster using existing components

---

## P2: Microinteractions & Polish

### Requirements

#### MP-1: Loading States
Replace all spinner-only loading states with skeleton screens that match the layout of the content being loaded. Users should see the shape of the data before the data arrives.

#### MP-2: Transitions
- Page transitions: subtle fade-in (200ms)
- Panel open/close: slide + fade (250ms ease-out)
- Status changes: color transition with a brief checkmark animation
- Card hover: subtle lift (translateY -1px, shadow increase)

#### MP-3: Toasts & Feedback
Every user action that changes state should produce visible feedback:
- "Task status updated" → success toast
- "Sync triggered" → info toast with progress
- "Project created" → success toast with link
- "Error saving" → danger toast with retry

#### MP-4: Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Cmd+K` | Command palette |
| `Cmd+/` | Open Scout |
| `N` | New task (in project context) |
| `F` | Focus search |
| `1-5` | Switch dashboard views |
| `Esc` | Close panel/modal |

Display shortcuts in tooltips and in a `?` help overlay.

### Success Metrics
- Zero "dead clicks" (clicks with no visible response)
- NPS improvement from "feels professional" feedback

---

## P2: Accessibility Audit

### Requirements

#### A11Y-1: WCAG AA Compliance
- All text passes 4.5:1 contrast ratio (regular text) or 3:1 (large text)
- All interactive elements have visible focus indicators
- All images/icons have alt text or aria-labels
- All form inputs have associated labels

#### A11Y-2: Screen Reader Support
- Proper heading hierarchy (h1 → h2 → h3, no skipping)
- Landmark regions (main, nav, aside)
- ARIA live regions for dynamic content (sync status, toast notifications)
- Proper tab order through all interactive elements

#### A11Y-3: Color Independence
No information should be conveyed by color alone. All status indicators must have:
- Color + label (e.g., green dot + "Done")
- Color + icon (e.g., red circle + ban icon for Blocked)

### Success Metrics
- 0 critical WCAG AA violations (Axe audit)
- All pages navigable with keyboard only

---

## P3: Advanced UX Enhancements

### PX-1: Personalized Home Feed
Replace the static Command Center with a personalized feed based on user role and behavior:
- PM sees: their projects, their blocked tasks, upcoming deadlines
- Manager sees: team workload, cross-project risks, portfolio health
- Executive sees: portfolio summary, budget status, milestone tracking

### PX-2: Natural Language Search
Upgrade the search bar to understand natural language:
- "show me all blocked tasks in Customer Portal"
- "what's overdue this week"
- "Tyler's workload"

Route these to Scout AI for processing, return results inline in the search dropdown.

### PX-3: Inline Comments on Anything
Allow users to comment on any object — not just tasks. Comment on:
- Project health scores ("This looks wrong, QA project finished last week")
- Risk items ("Already addressed in today's standup")
- Team workload ("Sarah is OOO this week, redistribute")

### PX-4: Workspace Themes
Beyond light/dark, allow workspace-level customization:
- Custom primary color (brand alignment)
- Compact vs. comfortable density
- Logo upload for white-labeling (enterprise tier)

---

## Prioritization Summary (ICE Scoring)

| Initiative | Impact | Confidence | Ease | ICE Score | Priority |
|-----------|--------|-----------|------|-----------|----------|
| Dark Mode Fixes (DM-1 to DM-3) | 9 | 10 | 8 | **720** | P0 |
| First-Run Experience (OB-1) | 10 | 8 | 5 | **400** | P0 |
| Empty States (OB-2) | 7 | 9 | 8 | **504** | P0 |
| Progressive Dashboard (OB-3) | 6 | 7 | 5 | **210** | P0 |
| Design System Reconcile (DS-1) | 5 | 10 | 9 | **450** | P1 |
| Standardized Card (DS-2) | 7 | 9 | 6 | **378** | P1 |
| Sidebar Restructure (IA-1) | 8 | 8 | 6 | **384** | P1 |
| Simplify Dashboard Views (IA-2) | 7 | 7 | 5 | **245** | P1 |
| Breadcrumbs (IA-3) | 6 | 10 | 9 | **540** | P1 |
| Command Palette (IA-4) | 8 | 9 | 5 | **360** | P1 |
| Project Detail 2-Col (PD-1) | 8 | 8 | 4 | **256** | P1 |
| Sticky Task Filters (PD-3) | 7 | 10 | 9 | **630** | P1 |
| Task Slide-Over (PD-4) | 8 | 9 | 5 | **360** | P1 |
| Inline Status Updates (PD-5) | 8 | 9 | 7 | **504** | P1 |
| Responsive Sidebar (MR-1) | 8 | 9 | 5 | **360** | P1 |
| Responsive Task List (MR-2) | 7 | 9 | 6 | **378** | P1 |
| Component Library (CL-1) | 6 | 9 | 4 | **216** | P2 |
| Skeleton Loading (MP-1) | 5 | 10 | 7 | **350** | P2 |
| Toast Feedback (MP-3) | 6 | 10 | 8 | **480** | P2 |
| Keyboard Shortcuts (MP-4) | 6 | 9 | 7 | **378** | P2 |
| WCAG Compliance (A11Y-1) | 7 | 10 | 5 | **350** | P2 |
| Personalized Home (PX-1) | 8 | 5 | 3 | **120** | P3 |
| NL Search (PX-2) | 7 | 6 | 3 | **126** | P3 |

---

## Execution Recommendation

### Sprint 1 (Week 1-2): "Foundation"
- DM-1: Dark mode color rules
- DM-2: Full page dark mode audit (top 4 pages)
- DM-3: Remove dead `dark:` classes
- DS-1: Reconcile primary color
- OB-2: Empty states for all pages

### Sprint 2 (Week 3-4): "Activation"
- OB-1: First-run experience
- IA-3: Breadcrumbs
- PD-3: Sticky task filters
- PD-5: Inline status updates
- MP-3: Toast feedback system

### Sprint 3 (Week 5-6): "Structure"
- IA-1: Sidebar restructure
- IA-2: Simplify dashboard views
- DS-2: Standardized Card component
- PD-1: Project detail 2-column layout
- PD-4: Task slide-over panel

### Sprint 4 (Week 7-8): "Mobile & Polish"
- MR-1: Responsive sidebar
- MR-2: Responsive task list
- MP-1: Skeleton loading states
- MP-4: Keyboard shortcuts
- IA-4: Command palette

### Ongoing: Accessibility
- A11Y items integrated into every sprint as part of definition-of-done

---

## Open Questions for CEO

1. **Primary color:** Confirm we're keeping Blue `#0066CC` over the spec'd Indigo `#6366f1`?
2. **Mobile native app:** Is a native mobile app on the roadmap, or is responsive web sufficient for now?
3. **Enterprise tier features:** Are SSO/Audit/API keys behind a paywall or available to all users? This affects the settings IA.
4. **Scout investment:** Should we invest more in Scout (NL search, proactive suggestions) or focus on core UX first?
5. **User research:** Do we have any session recordings or heatmaps? I'd love to validate these recommendations with real user data.

---

*This document is a living spec. I'll update it as we learn more from users and as engineering provides implementation feedback on feasibility and effort estimates.*

— Jeff
