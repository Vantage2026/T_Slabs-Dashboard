# Vantage Technical Briefing — For Emmy's Eyes
**Prepared:** February 11, 2026  
**Updated:** February 11, 2026 (latest codebase state, commit `b4c764a`)  
**Purpose:** Get Emmy fully up to speed on the codebase before reviewing Jeff's UX/UI PRD

---

## 1. Stack (Verified from package.json)

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Next.js (App Router) | 16.1.6 | Serverless on Vercel |
| UI | React | 19.2.3 | Client + Server Components |
| Language | TypeScript | strict mode | Path aliases `@/*` |
| Styling | Tailwind CSS | v4 | CSS variable theming via `@theme` directive, **no `dark:` prefix** |
| ORM | Prisma | 7.3.0 | Neon serverless adapter (`@prisma/adapter-neon`) |
| Database | PostgreSQL | Neon (serverless) | Connection pooling via `@neondatabase/serverless` |
| Auth | Neon Auth | 0.1.0-beta.21 | OAuth (Google, Atlassian) via `next-auth@5.0.0-beta.30` |
| Queue | BullMQ + ioredis | 5.67.3 / 5.9.2 | **Likely unused** — cron-sync is the active path |
| AI | OpenAI | 6.21.0 (GPT-4o-mini) | Scout assistant |
| Billing | Stripe | 20.3.1 | Checkout, subscriptions, webhooks |
| Email | Resend | 6.9.2 | Digest, alerts |
| Monitoring | Sentry | 10.38.0 | `@sentry/nextjs` error tracking |
| Validation | Zod | 4.3.6 | Inconsistent usage across routes |
| Charts | Recharts | 3.7.0 | SVG-based charting library |
| Icons | Lucide React | 0.563.0 | Icon library |
| 2FA | OTPAuth + QRCode | 9.5.0 / 1.5.4 | TOTP-based 2FA |
| Testing | Vitest + MSW | Latest | **Only 7 test files** |
| Deploy | Vercel | Serverless | Daily cron at 06:00 UTC |

---

## 2. Architecture

### What's Good
- **Clean adapter pattern** — `PMAdapter` interface with Jira, Monday, Asana implementations. Well-separated concerns, easy to extend.
- **Database schema** — Well-designed Prisma schema (~570 lines) with composite unique keys, soft deletes, normalized + source-native fields, proper indexes.
- **Encryption** — AES-256-GCM for OAuth tokens with key rotation support.
- **Singleton Prisma client** — Prevents connection pool exhaustion in serverless.
- **Idempotent upserts** — Sync engine uses `(source, sourceId)` composites correctly.
- **Health scoring** — Real computed health scores with weighted scoring, critical path detection, due-soon penalties.

### What's Fragile
- **Dual sync implementations** — `cron-sync.ts` (717 lines, serverless) AND `engine.ts` (BullMQ-based). Only cron-sync is active. `engine.ts` is dead code.
- **In-memory rate limiter** — Token bucket resets on every cold start. Effectively useless on Vercel serverless.
- **No pagination** — Task list endpoints can return unbounded results. Will timeout on large projects.
- **Inconsistent error handling** — Some routes return structured errors, others return generic 500s.
- **Incomplete adapters** — Asana adapter is scaffolded but not functional. Monday adapter is partial.
- **BullMQ dependency** — Present in `package.json` but likely unused since cron-sync is the active path. Dead dependency.

### Critical Technical Debt
1. **No integration tests** — Only 7 unit test files. Zero API route tests. Zero sync engine tests.
2. **No API rate limiting** — Vantage's own API endpoints (`/api/v1/*`) have zero protection.
3. **No caching layer** — Redis/ioredis dependency exists but not used for caching. Every page load hits DB.
4. **Monolithic files** — `project/[id]/page.tsx` (**2963 lines**), `jira.ts` (936 lines), `cron-sync.ts` (717 lines).
5. **Untyped metadata** — `Task.metadata` is `Json?` with zero schema validation.
6. **Dead code** — `engine.ts` (BullMQ sync), likely unused BullMQ/ioredis dependencies.

---

## 3. Dark Mode Architecture (CRITICAL)

The app uses `data-theme="dark"` on `<html>` which swaps CSS custom property values in `globals.css`:

### How It Works
- Tailwind CSS v4's `@theme` directive defines CSS custom properties
- `html[data-theme="dark"]` block **inverts the neutral scale** and remaps colors
- Tailwind's `dark:` prefix classes **do absolutely nothing** — they are dead code
- The neutral scale is completely inverted: `neutral-900` becomes bright white, `neutral-50` becomes near-black

### Key Color Mappings (Dark Mode)
| Token | Light | Dark | Safe for text? |
|-------|-------|------|---------------|
| `neutral-900` | `#111827` | `#f0f3f6` | ✅ Headings |
| `neutral-700` | `#374151` | `#c9d1d9` | ✅ Body text |
| `neutral-500` | `#6B7280` | `#848d97` | ⚠️ Secondary only |
| `neutral-400` | `#9CA3AF` | `#6e7681` | ❌ Barely readable |

### Additional Dark Mode Overrides
- `bg-white` → `#151b23` via `!important`
- Colored tints (`bg-red-50`, `bg-blue-50`, etc.) individually remapped
- Status text colors (`text-red-600`, `text-green-600`) brightened via `!important`
- Primary color shifts from `#0066CC` to `#4a9eff`
- Shadows adjusted for dark backgrounds
- Custom scrollbar styling

### Implication for Any UI Work
Components **must** use the CSS variable tokens correctly. `text-neutral-700` = readable body text in both modes. `text-neutral-400` = barely visible in dark. **Never use `dark:` prefixes.**

---

## 4. File Structure (29 page routes, 30+ API routes)

```
pm-sync/
├── prisma/schema.prisma            (570 lines — data model)
├── src/
│   ├── app/
│   │   ├── globals.css              (239 lines — design tokens + dark mode)
│   │   ├── layout.tsx               (root layout, fonts, Sentry)
│   │   ├── (app)/                   (authenticated routes — 24 pages)
│   │   │   ├── dashboard/page.tsx   (507 lines — Command Center, 6 view modes)
│   │   │   ├── project/[id]/page.tsx (2963 lines! — project detail)
│   │   │   ├── projects/page.tsx    (project list)
│   │   │   ├── boards/page.tsx      (Kanban/Scrum/Waterfall)
│   │   │   ├── boards/[id]/page.tsx (individual board)
│   │   │   ├── timeline/page.tsx    (Gantt chart)
│   │   │   ├── scout/page.tsx       (AI chat)
│   │   │   ├── reports/             (4 report pages)
│   │   │   ├── settings/            (6 sub-routes)
│   │   │   ├── team/page.tsx        (team management)
│   │   │   ├── dependencies/page.tsx (dependency tracking)
│   │   │   ├── activity/page.tsx    (activity feed)
│   │   │   ├── notifications/page.tsx
│   │   │   ├── pricing/page.tsx
│   │   │   ├── integrations/page.tsx
│   │   │   └── confluence-preview/page.tsx
│   │   ├── api/                     (30+ API routes)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── auth/page.tsx
│   │   └── connect-tools/page.tsx
│   ├── components/                  (10 shared components — sidebar, header, etc.)
│   ├── hooks/                       (custom hooks)
│   └── lib/
│       ├── adapters/                (Jira, Monday, Asana PM adapters)
│       ├── sync/                    (cron-sync.ts active, engine.ts dead)
│       ├── auth/                    (Neon Auth, 2FA)
│       ├── billing/                 (Stripe integration)
│       ├── ai/                      (Scout engine, OpenAI)
│       ├── email/                   (Resend templates)
│       ├── db/                      (Prisma singleton client)
│       └── ...                      (utilities, constants, encryption)
└── vercel.json                      (cron config)
```

---

## 5. Performance Profile

| Concern | Severity | Details |
|---------|----------|---------|
| No pagination | HIGH | `/api/projects` and task lists return unbounded rows |
| No caching | MEDIUM | Every request hits Neon DB (serverless = cold connections) |
| Cold starts | MEDIUM | Vercel serverless + Prisma + Neon = 2-5s cold starts |
| N+1 queries | MEDIUM | Health score computation fetches tasks per project individually |
| Monolithic page component | MEDIUM | 2963-line `page.tsx` = large client bundle, slow compilation |
| Sequential sync | LOW | Connections synced one-at-a-time, could parallelize |

---

## 6. Security Profile

| Area | Status | Notes |
|------|--------|-------|
| OAuth tokens | ✅ Good | AES-256-GCM, key rotation |
| API authentication | ✅ Good | Session-based + API key auth with scopes |
| RBAC | ✅ Good | 4 roles, workspace-scoped |
| Input validation | ⚠️ Inconsistent | Zod on some routes, nothing on others |
| API rate limiting | ❌ Missing | No protection on Vantage's own endpoints |
| Webhook verification | ⚠️ Weak | Jira uses shared secret, Monday is basic |
| XSS protection | ⚠️ Unknown | No explicit sanitization of user content |
| CSRF | ✅ Likely OK | Next.js handles this for server actions |

---

## 7. Testing Profile

| Category | Coverage | Files |
|----------|----------|-------|
| Unit tests | Minimal | 7 files (encryption, dates, RBAC, validation, constants) |
| Integration tests | **None** | Zero API route tests |
| E2E tests | **None** | No Playwright/Cypress |
| Visual regression | **None** | No dark mode screenshot tests |
| Load tests | **None** | No performance benchmarks |

---

## 8. Recent Changes (Git Log)

```
b4c764a Fix dark mode: remove dead dark: prefixes, use CSS variable system
6509a62 V3 features + comprehensive dark mode fix for project detail page
58827a5 Add critical path detection and weighted scoring
fabe623 Wire Scope Creep, Predictive Intelligence, Alerts, Portfolio Pulse, Risk Radar to real data
eb1d0d2 Add due-soon-not-started penalty to health score
f3d3bfd Fix health score: compute real score instead of hardcoded values
9d642e7 Add visible Status column to project task list
62e4588 Sprint 3 — depth and polish
0bbc35e Sprint 2 — production readiness
```

---

## 9. Key Files Emmy Should Read

| File | Why | Lines |
|------|-----|-------|
| `pm-sync/src/app/globals.css` | Dark mode system — must understand before any UI work | 239 |
| `pm-sync/src/lib/adapters/index.ts` | Adapter pattern — clean, good reference architecture | — |
| `pm-sync/src/lib/sync/cron-sync.ts` | Active sync engine — largest backend logic | 717 |
| `pm-sync/src/app/(app)/project/[id]/page.tsx` | Largest frontend file — urgently needs decomposition | 2963 |
| `pm-sync/src/app/(app)/dashboard/page.tsx` | Dashboard / Command Center — 6 view modes | 507 |
| `pm-sync/prisma/schema.prisma` | Data model — well-designed, source of truth | 570 |
| `pm-sync/src/lib/auth/` | Auth context — used everywhere | — |
| `jeff/PRD_UX_UI_IMPROVEMENTS.md` | Jeff's proposals — Emmy needs to review | — |

---

## 10. What Emmy Should Focus On

1. **Read Jeff's PRD** — Challenge what's technically unsound, flag hidden complexity, propose alternatives
2. **Don't worry about engineering time/effort** — An AI coding agent will be doing all the engineering work, so traditional time estimates are not a constraint. Focus instead on **technical risk, feasibility, architecture concerns, and build order.**
3. **Flag technical risks** — What could break? What has hidden complexity? What needs infrastructure work first?
4. **Propose alternatives** — Where Jeff proposes something technically naive, suggest the better approach
5. **Identify dependencies** — What needs to be built first because other things depend on it?
6. **Flag infrastructure gaps** — Testing, rate limiting, caching, dead code removal — things that should happen alongside or before UI work
7. **Challenge priorities** — Engineering priority may differ from product priority. If something should be higher/lower, say so and explain why.
8. **Propose counter-items** — Infrastructure work Jeff wouldn't know about that should be on the roadmap

---

## 11. Context: AI-Driven Engineering

**Important:** The CEO has an AI coding agent that will execute all engineering work. This changes the calculus:

- **Traditional time estimates are irrelevant** — Don't gate priorities on "this takes 2 weeks." An AI agent can work 24/7.
- **Focus on technical correctness** — What matters is: is this the right approach? Will it break? Is it maintainable?
- **Focus on build order** — Dependencies and sequencing matter more than effort sizing.
- **Focus on risk** — What are the footguns? What edge cases will an AI agent miss? What needs human review?
- **Infrastructure is cheap** — Adding tests, rate limiting, removing dead code — these are easy for an AI agent. Don't deprioritize them because they're "boring."

Emmy's role is to be the **technical conscience** — making sure we build the right things in the right order with the right architecture, not to estimate effort.
