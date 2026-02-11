# Architecture

Technical architecture of the Vantage application.

---

## Overview

Vantage is a Next.js 16 application using the App Router. The current build is a **functional prototype** — the entire frontend is built with mock data, and backend integrations are stubbed.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Vercel (Edge)                                │
│  ┌───────────────┐                                                  │
│  │  Middleware    │── Auth gate (password check via cookie)          │
│  └───────┬───────┘                                                  │
│          ▼                                                          │
│  ┌───────────────────────────────────────────────────┐              │
│  │              Next.js App Router                    │              │
│  │                                                    │              │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │              │
│  │  │  Pages   │  │Components│  │  API Routes   │    │              │
│  │  │ (app/)   │  │          │  │  (app/api/)   │    │              │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │              │
│  │       │              │               │             │              │
│  │       ▼              ▼               ▼             │              │
│  │  ┌─────────────────────────────────────────┐      │              │
│  │  │           lib/ (Data Layer)              │      │              │
│  │  │                                          │      │              │
│  │  │  mock-data.ts    ←── Current (prototype) │      │              │
│  │  │  ai-mock-data.ts                         │      │              │
│  │  │  adapters/       ←── Future (real APIs)  │      │              │
│  │  │  sync/           ←── Future (sync engine)│      │              │
│  │  └─────────────────────────────────────────┘      │              │
│  └───────────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Routing

### Route Groups

Next.js App Router uses **route groups** to share layouts without affecting the URL:

| Group | Layout | Description |
|-------|--------|-------------|
| `(app)` | `(app)/layout.tsx` — Header + Sidebar | All authenticated app pages |
| Root | `layout.tsx` — Theme + fonts only | Landing, login, signup, auth, connect-tools |

### Page Routes

| Route | File | Layout | Description |
|-------|------|--------|-------------|
| `/` | `app/page.tsx` | Root | Landing page |
| `/login` | `app/login/page.tsx` | Root | Login form |
| `/signup` | `app/signup/page.tsx` | Root | Signup flow |
| `/auth` | `app/auth/page.tsx` | Root | Prototype auth gate |
| `/connect-tools` | `app/connect-tools/page.tsx` | Root | Onboarding tool connection |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | App | Command Center (6 sub-views) |
| `/projects` | `app/(app)/projects/page.tsx` | App | Project list |
| `/project/[id]` | `app/(app)/project/[id]/page.tsx` | App | Project detail |
| `/boards` | `app/(app)/boards/page.tsx` | App | Native PM boards list |
| `/boards/[id]` | `app/(app)/boards/[id]/page.tsx` | App | Board detail (Kanban/Scrum/Waterfall) |
| `/timeline` | `app/(app)/timeline/page.tsx` | App | Gantt chart + impact analysis |
| `/dependencies` | `app/(app)/dependencies/page.tsx` | App | Cross-tool dependency map |
| `/scout` | `app/(app)/scout/page.tsx` | App | AI chat interface |
| `/settings` | `app/(app)/settings/page.tsx` | App | Application settings |

### API Routes

| Route | Method | Description | Status |
|-------|--------|-------------|--------|
| `/api/auth-check` | POST | Prototype password verification | Working |
| `/api/auth/[...nextauth]` | ALL | NextAuth handler | Configured |
| `/api/sync/trigger` | POST | Manual sync trigger | Stub |
| `/api/sync/status` | GET | Sync status | Stub |
| `/api/conflicts/list` | GET | List sync conflicts | Stub |
| `/api/conflicts/[id]` | GET | Conflict detail | Stub |
| `/api/conflicts/resolve` | POST | Resolve conflict | Stub |
| `/api/webhooks/jira` | POST | Jira webhook receiver | Stub |
| `/api/webhooks/monday` | POST | Monday.com webhook receiver | Stub |
| `/api/webhooks/asana` | POST | Asana webhook receiver | Stub |

## Component Architecture

### Layout Hierarchy

```
RootLayout (layout.tsx)
├── ThemeProvider (context)
│   ├── Landing pages (no sidebar/header)
│   │   ├── / (landing)
│   │   ├── /login
│   │   ├── /signup
│   │   ├── /auth
│   │   └── /connect-tools
│   │
│   └── AppLayout ((app)/layout.tsx)
│       ├── Header (fixed top)
│       ├── Sidebar (fixed left, 256px)
│       └── Main content area (scrollable)
│           ├── /dashboard
│           ├── /projects
│           ├── /project/[id]
│           └── ...
```

### Dashboard Sub-Views

The `/dashboard` page manages 6 views internally via React state (not URL routing):

```
DashboardPage (state: view)
├── ViewNav (persistent tab ribbon)
├── view === "brief"        → TheBrief
├── view === "focus"        → FocusMode (+ Communication Copilot)
├── view === "meetings"     → MeetingIntelligence (+ Meeting Eliminator)
├── view === "forecast"     → RiskForecast
├── view === "stakeholders" → StakeholderRadar
└── view === "dashboard"    → Full Dashboard
    ├── PortfolioPulse (Action Queue, Impact Cascade, Risk Trends)
    ├── Active Projects list
    └── Scout Insights sidebar
```

## Theming System

### How It Works

1. **CSS Custom Properties** defined in `globals.css` via Tailwind's `@theme` directive
2. **Dark mode** overrides via `html[data-theme="dark"]` CSS selectors
3. **ThemeProvider** (React Context) manages state, syncs to `data-theme` attr + `localStorage`
4. **FOUC prevention**: Inline `<script>` in `<head>` reads `localStorage` before React hydrates
5. **ThemeToggle** button in the header calls `toggleTheme()` from context

### Token Flow

```
globals.css @theme { --color-primary: #0066CC }
        ↓
Tailwind generates: .bg-primary { background: var(--color-primary) }
        ↓
html[data-theme="dark"] { --color-primary: #4a9eff }
        ↓
Same .bg-primary class now resolves to #4a9eff in dark mode
```

### Always-Dark Surfaces

Some elements (Portfolio Pulse banner, Brief headline) use hardcoded dark hex values instead of theme tokens so they stay dark in both modes:

```css
background: linear-gradient(to right, #0d1117, #161b22);
```

## Data Layer

### Current: Mock Data

All data comes from TypeScript files in `src/lib/`:

| File | Contents |
|------|----------|
| `mock-data.ts` | Projects, alerts, stats, activity, connections |
| `ai-mock-data.ts` | Risk radar blips, blocker alerts, predictions, dependency graph, Scout responses, status reports |
| `native-pm-data.ts` | Native projects, work items, sprints, kanban columns, waterfall phases, team members |
| `gantt-data.ts` | Gantt work items hierarchy, sprints, helper functions |

### Future: Real Data

The adapter pattern is in place for swapping mock data with real API calls:

```
src/lib/adapters/
├── base.ts      # BaseAdapter interface (normalize, sync, webhooks)
├── jira.ts      # JiraAdapter (stub)
├── monday.ts    # MondayAdapter (stub)
└── asana.ts     # AsanaAdapter (stub)
```

Each adapter implements:
- `fetchProjects()` → normalized project data
- `fetchTasks()` → normalized task data
- `handleWebhook()` → process incoming webhook
- `pushUpdate()` → write changes back to source tool

### Impact Engine

`src/lib/impact-engine.ts` is a working module that calculates cascading delays from dependency chains. It takes a set of work items with dependencies and computes downstream impact when items are delayed or blocked.

## Authentication

### Prototype (Current)

Password-based gate via Next.js middleware:

1. `middleware.ts` checks every request for a `vantage-auth` cookie
2. If missing/invalid → redirect to `/auth`
3. User enters access code → POST to `/api/auth-check`
4. If correct → set HTTP-only cookie (7-day expiry) → redirect to original page

### Production (Future)

NextAuth.js is configured but not wired:
- Prisma adapter for session/user storage
- Support for OAuth providers (Jira, Google, etc.)
- Role-based access control (planned)

## Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js App Router** over Pages Router | Server components, nested layouts, better data fetching patterns |
| **CSS custom properties** over Tailwind `dark:` classes | Single source of truth for theming; dark mode works via variable override, not class duplication |
| **Tailwind v4 `@theme`** over `@theme inline` | Allows CSS variable references in generated utilities; `inline` bakes literal values |
| **Mock data layer** with adapter interfaces | Rapid prototyping now; swap in real APIs later without changing components |
| **View state** for dashboard sub-views over URL routing | Keeps the navigation simple; avoids deep URL nesting for what are conceptually tabs |
| **No external UI library** | Full design control; no dependency risk; smaller bundle |
| **SVG for charts** over chart library | Lightweight, themeable, no heavy dependencies |
| **Middleware auth gate** | Zero-config prototype sharing; no database needed |
