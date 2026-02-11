# Vantage Product Briefing — For Jeff's Eyes
**Prepared:** February 11, 2026  
**Purpose:** Get Jeff fully up to speed on the current state of Vantage before his UX/UI audit

---

## 1. What Vantage Is

Vantage is an **AI-powered project management intelligence platform**. It connects to PM tools (Jira, Monday.com, Asana) and provides a unified view of all projects with AI-driven insights, risk detection, and automated reporting.

**Positioning:** "The AI PM That Never Sleeps" — not another PM tool, but an AI layer on top of existing ones.

**Target User:** Project managers, engineering managers, and VPs of Engineering who manage portfolios across multiple tools.

**Business Goal:** $5,000/month recurring profit with minimal CEO input, managed by AI agents (OpenClaw).

---

## 2. Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js API Routes, Prisma 7, Neon PostgreSQL
- **Auth:** Neon Auth (OAuth — Google, Atlassian)
- **AI:** OpenAI GPT-4o-mini (Scout assistant)
- **Integrations:** Jira Cloud (full), Monday.com (stub), Asana (stub), Slack, Stripe
- **Deploy:** Vercel
- **Dark Mode:** CSS variable inversion via `data-theme="dark"` on `<html>` (NOT Tailwind `dark:` prefix)

---

## 3. Design System Summary

### Color System
- **Primary:** `#0066CC` (blue — note: DESIGN_LANGUAGE.md spec says Indigo `#6366f1`, but implementation uses blue)
- **Neutral Scale:** 50-900 with CSS variable inversion for dark mode
- **Status Colors:** Green (success/done), Blue (in progress), Red (blocked/danger), Orange (warning), Purple (review)
- **Health:** Green 80+, Orange 60-79, Red <60

### Typography
- **Sans:** Inter, system-ui
- **Mono:** JetBrains Mono

### Key Dark Mode Pattern
All neutral colors are remapped via CSS variables when `data-theme="dark"`:
- neutral-900 (#111827) → #f0f3f6 (headings — bright)
- neutral-700 (#374151) → #c9d1d9 (body text — readable)
- neutral-500 (#6B7280) → #848d97 (secondary — muted)
- neutral-400 (#9CA3AF) → #6e7681 (tertiary — dim, barely readable!)
- bg-white → #151b23 (surface)
- bg-neutral-50 → #0d1117 (page background)

Colored tints (`bg-red-50`, `bg-blue-50`, etc.) are individually remapped to dark equivalents in `globals.css`.

---

## 4. Current Pages & Features

### Navigation Structure
**Sidebar (primary):** Command Center, Projects, Boards & Plans, Timeline, Reports, Scout  
**Sidebar (secondary):** Pricing, Settings, API Keys, SSO, Report Schedules, Audit Log  
**Header:** Search, Sync Status, Theme Toggle, Notifications, User Menu

### Key Pages

| Page | What It Does | Maturity |
|------|-------------|----------|
| Command Center (`/dashboard`) | Portfolio intelligence hub — 6 view modes (Brief, Focus, Meeting Intel, Risk, Stakeholder, Full) | Core — most complex page |
| Projects (`/projects`) | Project list with health scores, create native projects | Solid |
| Project Detail (`/project/[id]`) | Tasks tree, Project Intelligence, Risk Analysis, Predictive Intel, Team Workload, Scope Creep | Core — recently redesigned |
| Boards (`/boards`) | Kanban/Scrum/Waterfall methodology views | Functional |
| Timeline (`/timeline`) | Gantt chart | Functional |
| Reports (`/reports`) | Templates, generated reports, scheduled delivery | Functional |
| Scout (`/scout`) | AI chat assistant for portfolio queries | Functional |
| Integrations (`/integrations`) | Connect Jira/Monday/Asana/Slack | Functional |
| Settings (`/settings`) | Profile, notifications, appearance, sync config, 2FA, danger zone | Functional |

### V3 Features (Recently Shipped)
- Scout AI with OpenAI integration
- Email notifications via Resend
- Report scheduling (email/Slack delivery)
- Audit logging
- SSO/SAML configuration
- API key management with scoped access
- Public API (`/api/v1/projects`, `/api/v1/tasks`)
- Customizable dashboard widgets
- Recursive task hierarchy (parent-child tree view)
- User-friendly risk levels (replaced technical multipliers)

---

## 5. Data Model (Key Entities)

- **Workspace** → multi-tenant container (SSO, subscription, members)
- **Project** → unified project (source: jira/monday/asana/vantage), has health score
- **Task** → unified task with parent-child hierarchy via `parentId`
- **Connection** → encrypted OAuth tokens per workspace
- **SyncConflict** → detected conflicts requiring resolution

---

## 6. Known Issues & Design Debt

### Dark Mode
- **CRITICAL:** Dark mode uses CSS variable inversion, but many components were built with hardcoded light-only colors. The neutral scale inversion means `text-neutral-400` becomes barely readable (#6e7681 on dark backgrounds). Need systematic audit.
- Colored tint backgrounds (`bg-amber-50`, `bg-orange-50`) are remapped in `globals.css` but new components often forget this and add Tailwind `dark:` classes that do nothing.

### Consistency
- Different pages use different card styles, spacing, and hierarchy patterns
- No standardized component library — each page builds its own cards, stats, filters
- The design language doc specifies Indigo (`#6366f1`) as primary, but the app uses Blue (`#0066CC`). These need alignment.

### Mobile
- Sidebar is desktop-only — no hamburger/drawer on mobile
- Tables and task lists don't collapse gracefully on small screens
- Project detail page is a complex multi-column layout that likely breaks on tablet

### Onboarding
- Getting Started checklist exists on dashboard but is basic
- No empty-state guidance on Projects, Boards, Timeline pages when no data
- No product tour or progressive disclosure for new users

### Information Architecture
- 6 dashboard view modes may be overwhelming for new users
- Settings page has grown to 8+ sub-sections with no grouping
- Navigation hierarchy is flat — no clear path from "I just signed up" to "I'm getting value"

---

## 7. What Jeff Should Focus On

1. **First 5 minutes** — What does a new user experience? Where do they get lost?
2. **Dark mode audit** — Systematic review of every page for readability
3. **Information hierarchy** — Is the most important thing on each page actually the most visible?
4. **Consistency** — Are patterns reused across pages or reinvented each time?
5. **Mobile readiness** — Can a PM check project health from their phone?
6. **Activation path** — What's the fastest route from signup to "aha moment"?

---

## 8. File References

| File | What It Contains |
|------|-----------------|
| `DESIGN_LANGUAGE.md` | Jeff's own design system spec (canonical reference) |
| `VANTAGE_PRODUCT_VISION.md` | Product vision and 5 killer features |
| `PM_LEVERAGE_WIREFRAMES_UX_FLOWS.md` | UX flows and wireframe specs |
| `VANTAGE_MVP_COMPLETE_SPECS.md` | Original MVP specifications |
| `pm-sync/src/app/globals.css` | Actual CSS — color tokens, dark mode implementation |
| `pm-sync/src/lib/constants.ts` | Status, priority, health config |
| `pm-sync/src/components/sidebar.tsx` | Navigation structure |
| `pm-sync/src/app/(app)/project/[id]/page.tsx` | Project detail page (largest, most complex) |
| `pm-sync/src/app/(app)/dashboard/page.tsx` | Dashboard / Command Center |
