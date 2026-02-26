# MEMORY.md — Long-Term Memory

## About My Human
- Working on **Vantage** — a PM tool aggregator that syncs Jira, Monday.com, and Asana into a unified view
- Codebase lives in `pm-sync/` (Next.js + Prisma + PostgreSQL on Neon/Vercel)
- Two AI collaborator personas write docs that I implement:
  - **Emmy** — Principal Engineer. Writes technical requirements, reviews specs for feasibility and architecture. Her docs live in `emmy/`
  - **Jeff** — Product Manager. Writes PRDs and product briefs. His docs live in `jeff/`
- My human reviews and decides what gets built from their output

## Workflow
- Emmy and Jeff produce documents → I write specs for Emmy to review → I implement what Emmy approves
- Document trail matters — keep things in the folder, not in conversation memory
- **IMPORTANT:** Save progress notes to `memory/YYYY-MM-DD.md` frequently during work, not just at the end. Cursor can crash and erase conversation context.
- **ALWAYS push to Vercel** after implementing changes. Commit to `pm-sync` on `main` and `git push`. Vercel deploys automatically from main.

## Current State (as of 2026-02-20)

### Dependency Sync Feature — MOSTLY COMPLETE
Implemented first-class `TaskDependency` model and sync pipeline:
- Prisma schema, types, Jira adapter extraction, sync engine (with two-pass resolution + stale cleanup), critical path engine upgrade (uses resolved deps over metadata), horizontal cascade in timeline propagation
- **Skipped:** Monday.com and Asana dependency extraction (user said don't do)
- **Remaining:** Callers of `computeCriticalPath` need to pass resolved deps from DB; gantt chart dependency arrows

### Cost Intelligence MVP+ — IMPLEMENTED (first slice)
- Added budget + cost + scenario data models in Prisma (`ProjectBudget`, `ProjectCostEntry`, `CostScenario`)
- Added report/API pipeline for portfolio and per-project cost rollups
- Added new report UI at `/reports/cost-intelligence` with:
  - Budget vs actual + forecast
  - Clickable project drill-down
  - Budget controls
  - Manual cost entry
  - What-if scenario modeling and save
- Wired report entry points in `reports/page.tsx`

### Document History (build order so far)
1. Task Table Redesign (jeff → emmy review → implemented)
2. Reporting Suite (jeff → emmy review → implemented)
3. Custom Mapping (jeff → emmy review → implemented)
4. Timeline Impact (jeff → emmy review → implemented)
5. Dependency Sync (my spec → emmy review → implementing now)

## Lessons
- Cursor crashes happen. Write to files early and often.
- NULL values in Prisma unique constraints don't behave like you'd expect (NULL != NULL in PostgreSQL) — use find-or-create instead of upsert for nullable unique fields.
