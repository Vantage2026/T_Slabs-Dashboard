# BRIEF: Timeline Impact & Delivery Date Intelligence

## To: Jeff (SVP Product)
## From: CEO
## Priority: CRITICAL — this is core to our value proposition

---

## The Problem

Vantage exists so stakeholders can clearly understand **how things impact delivery timelines**. Right now, when a ticket gets blocked, unblocked late, or has its date pushed — there is ZERO visibility into how that cascades to the parent epic/initiative delivery date. The user has to mentally reconstruct impact. That's unacceptable.

### Real scenario:
1. A story was supposed to ship Feb 10
2. It got blocked on Feb 3, sat blocked for 5 days
3. Dev finally unblocks it, pushes the due date to Feb 17
4. **Question the PM desperately needs answered:** "Does this push my epic's delivery date? By how much? What about the initiative?"

We give them NOTHING today. They have to go figure it out themselves. That defeats the entire purpose of this tool.

---

## What I Need From You

Design a **beautifully creative** system for tracking and visualizing timeline changes. Think about this deeply. This is the feature that makes PMs say "I can't live without Vantage."

### Requirements (non-negotiable):
1. **Baseline vs. Current delivery dates** — Every epic and initiative needs to show both the original target AND the current projected date
2. **Change detection** — When a child task's date moves, the system must surface how it impacts the parent's delivery
3. **Visual distinction** — It must be IMMEDIATELY obvious when a date has shifted. Not subtle. Not "look closely." Obvious.
4. **Direction & magnitude** — Show whether the date moved earlier or later, and by how much (days/weeks)
5. **Cascade visualization** — If a story slips, show how it ripples up to the epic, and how the epic ripples up to the initiative
6. **History** — Track the timeline changes over time so users can see patterns ("this epic has slipped 3 times")

### Design considerations:
- Dark mode first (our users live in dark mode)
- Must work in the task table, timeline/Gantt, and project detail views
- Information must be consumable in < 5 seconds
- Think about color, iconography, animation, micro-interactions
- Consider inline indicators vs. dedicated sections vs. both
- Don't forget mobile — PMs check this on their phones in meetings

### What I DON'T want:
- A boring "Date Changed" text field
- Something that requires clicking into a modal to understand
- Anything that adds clutter without adding clarity
- Complex configuration — this should just WORK out of the box

---

## Data We Have Today

From our Prisma schema, tasks already have:
- `startDate` and `dueDate` fields
- `metadata` JSON field (can store baseline dates, change history)
- `status` field (blocked, in_progress, done, etc.)
- Parent-child relationships via `parentId`
- `taskType` (epic, story, task, bug, subtask, initiative)
- Critical path scoring from `computeCriticalPath()`
- Health score from `computeWeightedHealthScore()`

We sync from Jira which gives us `created`, `updated`, and custom field values.

---

## Competitive Reference

- **Jira Advanced Roadmaps**: Has baseline comparison but it's buried and ugly
- **Monday.com**: Has timeline comparison but it's basic
- **Linear**: Clean but no baseline tracking
- **Smartsheet**: Good at baselines but enterprise-ugly

**Beat all of them.** Make it so intuitive that a PM screenshots it and sends it to their CEO.

---

## Deliverable

Produce `TIMELINE_IMPACT_PRD.md` with:
1. Feature overview & philosophy
2. Data model changes (be specific about schema)
3. Computation logic (how do we calculate projected dates, detect drift, cascade)
4. UI/UX design for each surface (task table, project detail, timeline, Gantt bars)
5. Component architecture
6. Interaction patterns (hover states, click-throughs, animations)
7. Edge cases (no dates set, partial data, first sync, manual overrides)
8. Build order (what ships first)

**Think like a designer, not just a PM. I want to feel something when I see this feature.**
