# REVIEW REQUEST: Jeff's Timeline Impact PRD

## To: Emmy (Principal Engineer)
## From: CEO
## Priority: CRITICAL

---

## Your Mission

Read Jeff's PRD at `jeff/TIMELINE_IMPACT_PRD.md` **thoroughly**. Then tear it apart — but constructively.

## CRITICAL INSTRUCTION: Dual Lens Review

You are NOT reviewing this purely through an engineering lens. You must evaluate through **both** lenses equally:

### Lens 1: Engineering Reality
- Is the schema sound? What's missing?
- Is the computation logic correct and performant?
- Does this integrate cleanly with our existing codebase?
- What's the real build effort vs. what Jeff estimated?
- What can we cut for MVP without losing the feature's soul?

### Lens 2: Customer Experience
- Does this actually solve the PM's problem?
- Will a PM in a meeting understand this in 5 seconds?
- Is the information hierarchy right? (What's most important to the user?)
- Are there UX decisions that serve engineering convenience over customer clarity?
- Would a non-technical stakeholder (CEO, client) understand the drift badge?
- Is the "Set Baseline" flow intuitive or will users skip it and then the feature is useless?
- Are we making the user do too much work for the value they get?

**If you cut something that Jeff proposed, explain why from BOTH angles.** Don't just say "too complex to build" — also explain whether the customer would actually miss it.

---

## Context: Our Existing Codebase

Before you review, understand what we already have:

### Current Schema (prisma/schema.prisma)
- Task model with `startDate`, `dueDate`, `metadata` JSON, `parentId`, `status`, `taskType`
- Already have `FieldMapping` for custom Jira mappings
- Already have `Connection`, `Workspace`, `Project` models

### Current Dark Mode System (globals.css)
- Uses CSS variable inversion on `html[data-theme="dark"]`
- Tailwind semantic classes (bg-white, bg-neutral-50, etc.) automatically remap
- **CRITICAL**: Hardcoded colors like `rgba(...)` and hex values do NOT go through the variable system
- Jeff's PRD uses tons of hardcoded colors that will NOT work with our dark mode system

### Current Computation (src/lib/critical-path.ts)
- Already computes critical path scores
- Already has health score computation
- Timeline impact should integrate with, not duplicate, this logic

### Current Components
- Already have `gantt-chart.tsx` with existing bar rendering
- Already have task table in `project/[id]/page.tsx`
- Already have `portfolio-pulse.tsx` dashboard component

---

## Deliverable

Write your review to `emmy/TIMELINE_IMPACT_RECOMMENDATIONS.md` with:

1. **Verdict**: Ship / Ship with changes / Rethink
2. **Customer Impact Assessment**: Will this actually make PMs love Vantage?
3. **What to keep**: Jeff's best ideas (explain why they serve the customer)
4. **What to cut for MVP**: Be ruthless but justify from both lenses
5. **What to change**: Specific modifications with reasoning
6. **Schema recommendation**: Your exact Prisma schema changes
7. **Build order**: Your recommended phasing (what ships first to deliver customer value fastest?)
8. **Dark mode warnings**: Flag every place Jeff's design will break our system
9. **Integration plan**: How this fits into existing code without a rewrite

Be ruthless. Be specific. Think about the customer, not just the code.
