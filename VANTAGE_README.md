# Vantage — Strategic PM Intelligence Platform

> The AI PM assistant that scales your team. Strategic intelligence for project leaders who manage across Jira, Monday.com, and Asana.

**Live Prototype:** [pm-sync.vercel.app](https://pm-sync.vercel.app) (access code: `vantage2026`)

---

## What Is Vantage?

Vantage is a cross-tool project management intelligence platform. It connects to Jira, Monday.com, and Asana, then layers AI-powered analytics on top — risk prediction, blocker detection, dependency mapping, and actionable recommendations.

The core innovation is **The Brief**: instead of a dashboard you explore, Vantage delivers a personalized daily briefing that tells you what matters, what to do about it, and drafts the communications for you.

## Quick Start

```bash
# Clone and install
git clone <repo-url>
cd pm-sync
npm install

# Run locally
npm run dev

# Open http://localhost:3000
```

See [docs/SETUP.md](docs/SETUP.md) for detailed setup instructions including environment variables.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Icons | Lucide React |
| Auth | NextAuth.js + middleware password gate (prototype) |
| Database | Prisma (PostgreSQL) |
| Queue | BullMQ + Redis |
| Deployment | Vercel |

## Project Structure

```
pm-sync/
├── docs/                    # Technical documentation (you are here)
├── prisma/                  # Database schema
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (app)/           # Authenticated app pages (sidebar + header layout)
│   │   │   ├── dashboard/   # Command Center (The Brief, Focus Mode, etc.)
│   │   │   ├── projects/    # Project list
│   │   │   ├── project/     # Project detail [id]
│   │   │   ├── boards/      # Native PM boards
│   │   │   ├── timeline/    # Gantt/timeline view
│   │   │   ├── dependencies/# Cross-tool dependency map
│   │   │   ├── scout/       # AI chat interface
│   │   │   └── settings/    # App settings
│   │   ├── auth/            # Prototype auth gate
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup flow
│   │   ├── connect-tools/   # Onboarding tool connection
│   │   ├── api/             # API routes
│   │   ├── layout.tsx       # Root layout (theme, fonts)
│   │   ├── globals.css      # Design tokens + dark mode
│   │   └── page.tsx         # Landing page
│   ├── components/          # React components
│   │   ├── the-brief.tsx    # Morning brief experience
│   │   ├── focus-mode.tsx   # Top 3 actions + Communication Copilot
│   │   ├── meeting-intelligence.tsx  # Calendar prep + meeting eliminator
│   │   ├── risk-forecast.tsx         # 4-week trajectory + counterfactuals
│   │   ├── stakeholder-radar.tsx     # Awareness gap tracking
│   │   ├── portfolio-pulse.tsx       # Portfolio health dashboard
│   │   ├── kanban-board.tsx          # Kanban view
│   │   ├── scrum-board.tsx           # Scrum view + charts
│   │   ├── waterfall-view.tsx        # Waterfall view
│   │   ├── gantt-chart.tsx           # Gantt timeline
│   │   ├── header.tsx       # App header
│   │   ├── sidebar.tsx      # App sidebar
│   │   ├── theme-provider.tsx  # Theme context
│   │   └── ...              # Modals, panels, etc.
│   ├── lib/                 # Business logic + data
│   │   ├── mock-data.ts     # Core mock data (projects, alerts)
│   │   ├── ai-mock-data.ts  # AI feature mock data (risks, predictions)
│   │   ├── native-pm-data.ts # Native PM tool mock data
│   │   ├── gantt-data.ts    # Timeline data + helpers
│   │   ├── impact-engine.ts # Cascade delay calculator
│   │   ├── adapters/        # PM tool adapter interfaces (Jira, Monday, Asana)
│   │   ├── sync/            # Sync engine stubs
│   │   └── ...              # Auth, DB, encryption, queue stubs
│   └── middleware.ts        # Prototype auth gate
├── package.json
├── tsconfig.json
└── next.config.ts
```

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](docs/SETUP.md) | Dev environment setup, dependencies, env vars |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | App structure, data flow, routing, component hierarchy |
| [COMPONENTS.md](docs/COMPONENTS.md) | Component catalog with props, usage, relationships |
| [API.md](docs/API.md) | API routes, request/response formats, webhooks |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel deployment, env vars, domains, auth |
| [CONTRIBUTING.md](docs/CONTRIBUTING.md) | Code standards, PR process, naming conventions |

## Current Status

This is a **functional prototype** with full UI and mock data. The frontend is production-quality; the backend is stubbed.

| Layer | Status |
|-------|--------|
| UI/UX (all 14 screens) | Complete |
| Design system + dark mode | Complete |
| Mock data layer | Complete |
| PM tool adapters (Jira, Monday, Asana) | Interface only — stubs |
| Sync engine | Stub |
| Database operations | Schema defined, not wired |
| Real API integrations | Not started |
| Auth (production) | Not started (using prototype gate) |
| Tests | Not started |

## License

Proprietary. All rights reserved.
