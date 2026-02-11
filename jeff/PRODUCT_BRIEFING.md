# Vantage Product Briefing — For Jeff's Eyes
**Prepared:** February 11, 2026  
**Updated:** February 11, 2026 (latest codebase state)  
**Purpose:** Get Jeff fully up to speed on the current state of Vantage before his UX/UI audit

---

## 1. What Vantage Is

Vantage is an **AI-powered project management intelligence platform**. It connects to PM tools (Jira, Monday.com, Asana) and provides a unified view of all projects with AI-driven insights, risk detection, and automated reporting.

**Positioning:** "The AI PM That Never Sleeps" — not another PM tool, but an AI intelligence layer on top of existing ones.

**Target User:** Project managers, engineering managers, and VPs of Engineering who manage portfolios across multiple tools.

**Business Goal:** $5,000/month recurring profit with minimal CEO input, managed by AI agents (OpenClaw).

---

## 2. Tech Stack (Current, Verified)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js (App Router) | 16.1.6 | Serverless on Vercel |
| UI | React | 19.2.3 | Client + Server Components |
| Language | TypeScript | strict mode | Path aliases `@/*` |
| Styling | Tailwind CSS | v4 | CSS variable theming via `@theme` directive |
| ORM | Prisma | 7.3.0 | Neon serverless adapter |
| Database | PostgreSQL | Neon (serverless) | Connection pooling via Neon |
| Auth | Neon Auth | Managed | OAuth (Google, Atlassian) |
| Queue | BullMQ + ioredis | 5.67.3 | Likely unused — cron-sync is primary |
| AI | OpenAI | GPT-4o-mini via `openai@6.21.0` | Scout assistant |
| Billing | Stripe | 20.3.1 | Checkout, subscriptions, webhooks |
| Email | Resend | 6.9.2 | Digest, alerts |
| Monitoring | Sentry | 10.38.0 | Error tracking |
| Validation | Zod | 4.3.6 | Inconsistent usage across routes |
| Testing | Vitest + MSW | Latest | Only 7 test files total |
| Charts | Recharts | 3.7.0 | SVG-based charting |
| Icons | Lucide React | 0.563.0 | Consistent icon library |
| Deploy | Vercel | Serverless | Daily cron at 06:00 UTC |

---

## 3. Dark Mode Architecture (CRITICAL — Read This Carefully)

**Implementation: CSS Variable Inversion via `data-theme="dark"` on `<html>`**

The application does **NOT** use Tailwind's `dark:` prefix. Instead, `globals.css` uses a `@theme` directive to define CSS custom properties, and an `html[data-theme="dark"]` block that **inverts the entire neutral scale**:

### Light Mode → Dark Mode Neutral Mapping

| Token | Light Mode | Dark Mode | Meaning |
|-------|-----------|-----------|---------|
| `neutral-900` | `#111827` (near black) | `#f0f3f6` (near white) | Headings — always high contrast |
| `neutral-800` | `#1F2937` | `#e0e6eb` | Strong text |
| `neutral-700` | `#374151` | `#c9d1d9` | **Body text — readable in both modes** |
| `neutral-600` | `#4B5563` | `#9ca3af` | Secondary text (lighter in dark) |
| `neutral-500` | `#6B7280` | `#848d97` | Muted text |
| `neutral-400` | `#9CA3AF` | `#6e7681` | **⚠️ Barely readable in dark mode!** |
| `neutral-300` | `#D1D5DB` | `#313840` | Strong borders |
| `neutral-200` | `#E5E7EB` | `#212830` | Borders |
| `neutral-100` | `#F3F4F6` | `#151b23` | Subtle backgrounds / card surfaces |
| `neutral-50` | `#F9FAFB` | `#0d1117` | Page background |

### Key Implications for Any UI Work
1. **`text-neutral-700`** = the safe body text color (readable in both themes)
2. **`text-neutral-400` and below** = nearly invisible in dark mode — avoid for any text that must be read
3. **`bg-white`** is overridden with `!important` to `#151b23` in dark mode
4. **`bg-neutral-100`** becomes `#151b23` (dark surface) in dark mode — good for card backgrounds
5. **Colored tints** (`bg-red-50`, `bg-blue-50`, etc.) are individually remapped in `globals.css` to dark equivalents
6. **Status text** (`text-red-600`, `text-green-600`, etc.) are brightened in dark mode via `!important` overrides
7. **`dark:` prefix classes do absolutely nothing** — they are dead code in this system
8. **Primary color** shifts from `#0066CC` (light) to `#4a9eff` (dark) — brighter blue

### What This Means for Jeff's Proposals
- Any new component must use the existing CSS variable tokens
- Never propose `dark:` class solutions — they won't work
- Use `text-neutral-700` or higher for body text, `text-neutral-900` for headings
- Use `bg-neutral-100` for card/surface backgrounds (inverts correctly)
- Use `border-neutral-200` for borders (inverts correctly)

---

## 4. Design Language (Source of Truth)

Jeff previously authored `DESIGN_LANGUAGE.md` — the canonical design system reference. Key highlights:

### Design Philosophy
1. **Clarity Over Density** — Scannable in seconds
2. **Warmth Over Coldness** — Enterprise doesn't have to feel sterile
3. **Action Over Observation** — Every screen leads toward doing
4. **Consistency Over Novelty** — Predictable patterns reduce cognitive load
5. **Progressive Disclosure** — Show what matters first

### Color System
- **Primary Brand:** `#6366f1` (Indigo-500) per design language spec. **BUT actual implementation uses `#0066CC` (Blue).** This is a known inconsistency.
- **Neutral Scale:** 50-900 with CSS variable inversion (see above)
- **Semantic Status:** Green (success), Orange (warning), Red (danger), Blue (info)
- **Health Scores:** Green 80+, Orange 60-79, Red <60

### Typography
- **Sans:** Inter (Google Fonts)
- **Mono:** JetBrains Mono (ticket keys, code, metrics)
- **Scale:** text-4xl (36px Display) → text-xs (12px Caption)

### Component Patterns
- **Cards:** `bg-white rounded-xl shadow-sm border border-neutral-100 p-6`
- **Buttons:** Primary (`bg-primary-500 text-white`), Secondary, Ghost, Danger
- **Badges:** `inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded`
- **Tables:** `bg-white rounded-xl border border-neutral-100 overflow-hidden` with divide-y
- **Sidebar Navigation:** Fixed w-64 with active/inactive states
- **Icons:** Lucide React, 16-20px default

---

## 5. Current Pages & Features (29 page routes)

### Navigation Structure
**Sidebar (primary):** Command Center, Projects, Boards & Plans, Timeline, Reports, Scout  
**Sidebar (secondary):** Pricing, Settings, API Keys, SSO, Report Schedules, Audit Log  
**Header:** Search, Sync Status, Theme Toggle, Notifications, User Menu

### Key Pages

| Page | Route | Lines | Maturity | Notes |
|------|-------|-------|----------|-------|
| Command Center | `/dashboard` | 507 | Core | 6 view modes (Brief, Focus, Meeting Intel, Risk, Stakeholder, Full) |
| Projects | `/projects` | — | Solid | Project list with health scores, create native projects |
| **Project Detail** | `/project/[id]` | **2963** | Core | Tasks tree, Intelligence, Risk, Predictive Intel, Team Workload, Scope Creep. **Largest file — needs decomposition** |
| Boards | `/boards` | — | Functional | Kanban/Scrum/Waterfall methodology views |
| Board Detail | `/boards/[id]` | — | Functional | Individual board view |
| Timeline | `/timeline` | — | Functional | Gantt chart |
| Reports | `/reports` | — | Functional | Templates, generated reports |
| Executive Summary | `/reports/executive-summary` | — | Functional | AI-generated exec report |
| Sprint Summary | `/reports/sprint-summary` | — | Functional | Sprint reporting |
| Team Workload | `/reports/team-workload` | — | Functional | Team capacity report |
| Scout | `/scout` | — | Functional | AI chat assistant |
| Integrations | `/integrations` | — | Functional | Connect Jira/Monday/Asana/Slack |
| Settings | `/settings` | — | Functional | Profile, notifications, appearance |
| API Keys | `/settings/api-keys` | — | Functional | Key management |
| SSO | `/settings/sso` | — | Functional | SAML 2.0 configuration |
| Audit Log | `/settings/audit-log` | — | Functional | Activity tracking |
| Report Schedules | `/settings/report-schedules` | — | Functional | Email/Slack delivery |
| Field Mappings | `/settings/field-mappings` | — | Functional | Custom field config |
| Pricing | `/pricing` | — | Functional | Stripe-powered plans |
| Team | `/team` | — | Functional | Team members |
| Dependencies | `/dependencies` | — | Functional | Cross-project dependencies |
| Activity | `/activity` | — | Functional | Activity feed |
| Notifications | `/notifications` | — | Functional | Notification center |
| Confluence Preview | `/confluence-preview` | — | Functional | Confluence integration preview |
| Connect Tools | `/connect-tools` | — | Functional | Onboarding tool connection |
| Login | `/login` | — | Auth | Login page |
| Signup | `/signup` | — | Auth | Registration page |
| Auth | `/auth` | — | Auth | OAuth callback |

### V3 Features (Recently Shipped)
- Scout AI with OpenAI GPT-4o-mini integration
- Email notifications via Resend
- Report scheduling (email/Slack delivery)
- Audit logging with detailed event tracking
- SSO/SAML 2.0 configuration
- API key management with scoped access (read/write/admin)
- Public API (`/api/v1/projects`, `/api/v1/tasks`)
- Customizable dashboard widgets with localStorage persistence
- Recursive task hierarchy (parent-child tree view with depth coloring)
- User-friendly risk levels (replaced raw technical multipliers)
- Dark mode via CSS variable inversion (fixed in latest commit)

### Recent Git History
```
b4c764a Fix dark mode: remove dead dark: prefixes, use CSS variable system
6509a62 V3 features + comprehensive dark mode fix for project detail page
58827a5 Add critical path detection and weighted scoring
fabe623 Wire Scope Creep, Predictive Intelligence, Alerts, Portfolio Pulse, and Risk Radar to real data
eb1d0d2 Add due-soon-not-started penalty to health score
f3d3bfd Fix health score: compute real score instead of hardcoded values
9d642e7 Add visible Status column to project task list
```

---

## 6. Data Model (Key Entities)

- **Workspace** → multi-tenant container (SSO, subscription, members)
- **Project** → unified project (source: jira/monday/asana/vantage), has health score
- **Task** → unified task with parent-child hierarchy via `parentId`
- **Connection** → encrypted OAuth tokens (AES-256-GCM) per workspace
- **SyncConflict** → detected conflicts requiring resolution
- **AuditLog** → user action tracking
- **ApiKey** → scoped API access management

---

## 7. Known Issues & Design Debt

### Dark Mode (Recently Fixed — But Needs Audit)
- Recent commit `b4c764a` removed all dead `dark:` prefix classes and fixed the project detail page
- However, only `/project/[id]` was systematically audited — **other pages may still have dark mode issues**
- Components using `text-neutral-400` or lower will be barely readable in dark mode
- New components must follow the CSS variable system

### Consistency
- Different pages use different card styles, spacing, and hierarchy patterns
- No standardized shared component library — each page builds its own cards, stats, filters
- The design language doc specifies Indigo (`#6366f1`) as primary, but the app uses Blue (`#0066CC`). **These need alignment.**
- 10 shared components exist in `/components/` but pages often don't use them

### Mobile
- Sidebar is desktop-only — no hamburger/drawer on mobile (153 lines, hardcoded w-64)
- Tables and task lists don't collapse gracefully on small screens
- Project detail page (2963 lines) is a complex multi-column layout that likely breaks on tablet

### Onboarding
- Getting Started checklist exists on dashboard but is basic
- No empty-state guidance on Projects, Boards, Timeline pages when no data
- No product tour or progressive disclosure for new users
- `/connect-tools` page exists but isn't part of a guided onboarding flow

### Information Architecture
- 6 dashboard view modes may be overwhelming for new users
- Settings has grown to 6+ sub-routes with flat navigation
- Sidebar has 14+ navigation items without clear grouping
- No breadcrumb navigation on most pages

### File Size / Code Debt
- `project/[id]/page.tsx` at **2963 lines** — desperately needs decomposition into components
- `dashboard/page.tsx` at 507 lines — manageable but growing
- No shared UI component abstractions (Button, Card, Badge, Modal, etc.)

---

## 8. Product Vision Reference Documents

Jeff should read these files to understand the full product vision and strategy:

| File | What It Contains |
|------|-----------------|
| `DESIGN_LANGUAGE.md` | Jeff's own design system spec (canonical reference, 1238 lines) |
| `VANTAGE_PRODUCT_VISION.md` | Product vision, 5 killer features, competitive matrix, WOW moments |
| `PM_LEVERAGE_WIREFRAMES_UX_FLOWS.md` | UX flows and wireframe specs (onboarding, dashboard, recommendations, messaging) |
| `DARK_MODE_TECH_SPEC.md` | Emmy's dark mode technical specification (comprehensive) |
| `VANTAGE_GANTT_TIMELINE_SPEC.md` | Gantt/Timeline feature spec |
| `VANTAGE_NATIVE_PM_SPEC.md` | Native PM tool creation spec |
| `VANTAGE_LANDING_PAGE_DESIGN.md` | Landing page design spec |
| `VANTAGE_GTM_STRATEGY.md` | Go-to-market strategy |

---

## 9. Code References for Jeff's Audit

| File | What It Contains | Lines |
|------|-----------------|-------|
| `pm-sync/src/app/globals.css` | **Actual CSS** — color tokens, dark mode implementation | 239 |
| `pm-sync/src/app/(app)/project/[id]/page.tsx` | **Project detail page** — largest, most complex page | 2963 |
| `pm-sync/src/app/(app)/dashboard/page.tsx` | **Dashboard / Command Center** — 6 view modes | 507 |
| `pm-sync/src/components/sidebar.tsx` | **Navigation structure** — sidebar implementation | 153 |
| `pm-sync/src/lib/constants.ts` | Status, priority, health config constants | — |
| `pm-sync/src/app/(app)/projects/page.tsx` | Project list page | — |
| `pm-sync/src/app/(app)/boards/page.tsx` | Boards view | — |
| `pm-sync/src/app/(app)/scout/page.tsx` | Scout AI chat | — |

---

## 10. What Jeff Should Focus On

1. **Dark mode audit across ALL pages** — Only the project detail page has been fixed. Every other page needs review.
2. **First 5 minutes** — What does a new user experience? Where do they get lost? The onboarding path is weak.
3. **Information hierarchy** — Is the most important thing on each page actually the most visible? Dashboard has 6 modes — is that right?
4. **Consistency** — Are patterns reused across pages or reinvented each time? There's significant inconsistency.
5. **Mobile readiness** — Can a PM check project health from their phone? Currently: probably not.
6. **Activation path** — What's the fastest route from signup to "aha moment"?
7. **Component library gaps** — Should we formalize shared Button, Card, Badge, Modal components?
8. **Primary color alignment** — Design language says Indigo, app uses Blue. Pick one.
9. **Navigation simplification** — 14+ sidebar items may overwhelm new users.
10. **File decomposition** — The 2963-line project detail page is a maintenance nightmare.

---

*This briefing reflects the codebase as of commit `b4c764a` (February 11, 2026).*
