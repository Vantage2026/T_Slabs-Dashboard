# Reporting Suite Redesign Brief — Jeff (SVP Product)

## Your Mission

Design a **stakeholder-targeted reporting suite** for Vantage (PM Sync). The current reporting is bloated — one-size-fits-all templates that nobody reads. Your job is to design reports so focused and scannable that each stakeholder spends **less than 60 seconds** (target) to **2 minutes max** getting fully up to speed.

**You are not designing templates. You are designing information weapons.** Every pixel, every word, every data point must earn its place. If a stakeholder has to scroll, search, or decode — you've failed.

---

## The Product

Vantage (PM Sync) aggregates project data from Jira, Monday.com, and Asana into a unified dashboard. Users are PMs, engineering leads, executives, and team members managing cross-tool portfolios.

### Tech Context
- **Stack**: Next.js 15, Tailwind CSS, TypeScript, Prisma, PostgreSQL
- **Design tokens**: CSS variables (`--color-primary: #0066CC`, neutral scale 50-900, semantic colors for success/warning/danger)
- **Dark mode**: CSS variable inversion via `html[data-theme="dark"]` — all neutral colors swap. Do NOT use `dark:` Tailwind prefixes.
- **UI components available**: Button, Badge, Card, Skeleton, EmptyState
- **Data available per task**: id, title, status (todo/in_progress/done/blocked/in_review), priority (critical/highest/high/medium/low/lowest), taskType (epic/story/task/subtask/bug), assigneeName, dueDate, startDate, completedAt, labels, parentId, metadata (Jira key, issue links, blocker info)
- **Data available per project**: name, key, source (jira/monday/asana), status, lastSyncedAt, task counts
- **Computed stats**: byStatus, byPriority, byAssignee, byProject, completionRate, blockedCount, overdueTasks, recentlyCompleted, unassignedCount

### What Exists Today (and why it's inadequate)
1. **Executive Summary** (852 lines) — bloated, mostly mock data, no audience targeting, too many sections
2. **Sprint Summary** (964 lines) — massive, kitchen-sink approach, fake sprint data
3. **Team Workload** (915 lines) — mock heatmaps and capacity data, no real utility
4. **Status Report Modal** — generates status reports with audience/tone config, but outputs a generic wall of text
5. **Report Hub** — lists templates, shows generated/scheduled reports — good skeleton but empty
6. **Scheduling API** — CRUD for schedules exists but no execution engine

**The problem**: These are all the SAME report wearing different hats. A CEO and an IC engineer get fundamentally the same density and structure. Nobody reads them.

---

## Your Deliverable

Create `jeff/REPORTING_SUITE_PRD.md` — a comprehensive product requirements document that specifies:

### 1. Stakeholder Personas (Define exactly who gets what)

Design reports for these distinct personas:

| Persona | Who they are | What they care about | Time budget |
|---------|-------------|---------------------|-------------|
| **CEO / C-Suite** | Funding the project, board reporting | Are we on track? What's at risk? Do I need to act? | 30 seconds |
| **VP / Director** | Owns multiple projects, reports upward | Portfolio health, team capacity, escalations | 60 seconds |
| **Project Manager** | Owns 1-2 projects day-to-day | Sprint health, blockers, task completion, what's slipping | 90 seconds |
| **Engineering Lead** | Owns technical execution | Velocity, code health, blocked work, who needs help | 90 seconds |
| **Team Member / IC** | Executes tasks | My work, my blockers, what's expected of me this week | 45 seconds |
| **Client / External Stakeholder** | Paying customer or partner | Is the project on track? Key milestones? Any concerns? | 30 seconds |

### 2. Report Designs (for EACH persona)

For each report, specify:
- **Layout**: Exact sections, order, hierarchy. What's above the fold? What's expandable?
- **Data points**: Exactly which metrics/data appear. No filler. Every element must answer a question the persona actually has.
- **Visual treatment**: How each data point is rendered (number, chart, badge, progress bar, traffic light, etc.)
- **Color coding**: Use the design system. Traffic light (green/amber/red) for status. Primary blue for actions.
- **Interaction model**: What's static vs. clickable vs. expandable? What can they drill into?
- **Empty/zero states**: What shows when there's nothing to report? (This matters — "no blockers" is a data point)
- **Dark mode considerations**: Specify colors that work with the CSS variable inversion system

### 3. Information Density Rules

Enforce these constraints ruthlessly:
- **CEO report**: 1 screen. No scroll. Traffic lights + 3 numbers + 1 action item. That's it.
- **Director report**: 2 screens max. Portfolio grid + escalation list.
- **PM report**: 3 screens max. Sprint snapshot + blocker details + completion trend.
- **Eng Lead report**: 3 screens max. Velocity + blocked work + team distribution.
- **IC report**: 1 screen. My tasks, my blockers, my deadlines. Personal dashboard.
- **Client report**: 1 screen. Milestone progress + risk summary. Clean, branded, no internal jargon.

### 4. The "Glance Test"

Every report must pass the **Glance Test**: If a stakeholder looks at it for 5 seconds, they should be able to answer:
1. **Are we OK or not?** (Green/amber/red — instant)
2. **What's the one thing I need to know?** (Bold headline)
3. **Do I need to act?** (Action badge or "all clear" signal)

### 5. Delivery & Scheduling

How each report gets to its audience:
- Email digest (formatted HTML, not just a link)
- Slack message (condensed summary + link)
- In-app notification
- Shareable link (with optional auth for client reports)
- Scheduled delivery (daily/weekly/sprint-end/monthly)
- On-demand generation

### 6. Competitive References

Study these for inspiration:
- **Linear** — minimal, scannable project updates
- **Notion** — clean typography, hierarchical information
- **Stripe Dashboard** — metrics that tell a story at a glance
- **GitHub Insights** — contribution graphs, activity summaries
- **Datadog** — status pages that communicate health instantly

---

## Hard Requirements (Non-Negotiable)

1. **Each persona gets a DIFFERENT report.** Not the same report with different filters. Different layout, different density, different language.
2. **Time budgets are real constraints.** If a CEO can't consume it in 30 seconds, redesign it. Actually time yourself reading your spec — if it takes longer than the budget, cut content.
3. **Real data only.** Design for the data we actually have (Jira/Monday/Asana tasks with status, priority, assignee, dates, hierarchy). Don't design for data we don't have (code metrics, time tracking, capacity scores).
4. **Dark mode first.** Every color choice must work in both modes. Specify the CSS variable or Tailwind class, not a hex code.
5. **Mobile-friendly.** IC and PM reports especially must work on phone. CEO report must work on phone.
6. **No jargon in client reports.** No "sprint velocity," no "story points," no "blocked." Use plain English.
7. **Progressive disclosure.** Surface-level = instant status. Click to expand = details. This is how you stay under the time budget.
8. **Actionable, not informational.** Every report should end with "Here's what needs your attention" — not just "here's what happened."

---

## What I'll Judge Your Output On

1. **Specificity** — Vague wireframes are useless. I want exact data points, exact layout, exact visual treatment.
2. **Differentiation** — If two personas' reports look similar, you haven't done your job.
3. **Ruthless editing** — What you LEAVE OUT matters more than what you include. Less is more. Then cut more.
4. **Practicality** — Can this be built with Next.js + Tailwind + the data we have? If not, flag it.
5. **Taste** — This should look like it belongs in Linear or Stripe, not Jira or Confluence.

---

## Output Format

Structure your PRD as:
1. Executive Summary (your overall vision in 3 sentences)
2. Persona Definitions (expanded from above)
3. Report Specifications (one major section per persona, with subsections for layout/data/visual/interaction)
4. Shared Components (any reusable patterns across reports)
5. Information Architecture (how reports are accessed, navigation, URL structure)
6. Delivery Specifications (email/Slack/scheduling details)
7. Priority & Build Order (what to build first, second, third)
8. Open Questions (anything you need clarified)

**Go. Make this exceptional. The current reporting is mediocre and you know it. Fix it.**
