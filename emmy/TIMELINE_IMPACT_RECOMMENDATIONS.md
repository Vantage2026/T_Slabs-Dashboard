# Timeline Impact PRD Review

**Reviewer:** Emmy, Principal Engineer  
**Date:** 2025-01-14  
**PRD Author:** Jeff, SVP Product  

---

## Verdict: Ship with Changes

This is a strong PRD with genuine product vision. Jeff understands the PM's pain point and the "productive anxiety" framing is exactly right. But the scope is too ambitious for the proposed timeline, several technical decisions will cause us pain, and some UX choices serve engineering convenience over customer clarity. 

I'm recommending we ship a focused MVP that delivers the core value—**"am I late, and why?"**—without the complexity that will slow us down and confuse users.

---

## Customer Impact Assessment

### Will PMs Actually Love This?

**Yes, if we execute well. No, if we ship everything Jeff proposed.**

The core insight is correct: PMs need to know instantly if they're on track. A drift badge showing "+12d" next to an epic is *exactly* what they need. The "Screenshot Test" philosophy is spot-on.

But Jeff's PRD has feature creep that will dilute the value:

| Proposed Feature | PM Value | Risk |
|------------------|----------|------|
| Drift badge (EARLY/ON_TRACK/LATE/CRITICAL) | 🔥 **Critical** | Low |
| Baseline vs. projected dates | 🔥 **Critical** | Low |
| Cascade chain visualization | ⚠️ Medium | **High complexity, PMs may not understand** |
| TimelineHistory with sparklines | ⚠️ Medium | Medium |
| 30-day drift trend chart | 🤷 Nice-to-have | High effort |
| driftChangeCount tracking | 🤷 Nice-to-have | Schema bloat |
| Confidence scoring | 🤷 Nice-to-have | Confusing for users |
| Mobile-specific components | 🤷 Nice-to-have | Premature |

**The brutal truth:** A PM in a meeting doesn't need to see a 30-day drift trend sparkline. They need to see "+12d" in red and know the epic is late. Everything else is "explain later" territory.

### UX Concerns

#### 1. The "Set Baseline" Problem

This is the **existential risk** to the entire feature. Jeff's PRD glosses over this:

> *"On first sync, prompt user: 'Set today's dates as baselines for all items?'"*

This is too passive. If users skip this step (and they will—it's friction), the entire feature becomes useless. Every task shows "No baseline" forever.

**What happens in reality:**
1. PM connects Jira
2. We sync 500 tasks  
3. We show a prompt they don't understand
4. They click "Maybe later"
5. They never see drift data
6. They think Vantage is broken

**My recommendation:** Auto-set baselines on first sync. Period. Make it opt-out, not opt-in. Users can reset baselines later if they want a different anchor point. The "purity" of explicit baseline setting isn't worth the adoption risk.

#### 2. Cascade Visualization Is For Engineers, Not PMs

Jeff's cascade chain:

```
OAuth Integration ──→ Auth Epic ──→ Q1 Launch Initiative
[Story] +8d           [Epic] +12d   [Initiative] +12d
```

This is how *we* think about dependency propagation. It's not how PMs think.

A PM looks at their Q1 Launch Initiative and asks: **"Why is this late?"** They don't want to trace a DAG. They want to see:

> "Q1 Launch is **+12 days** because **Auth Epic** is late. Auth Epic is late because **OAuth Integration** is blocked."

**Recommendation:** Replace cascade visualization with plain-language "Why is this late?" attribution. Show the *cause*, not the *graph*.

#### 3. DriftDirection Enum Is Missing a State

Jeff proposes:
```prisma
enum DriftDirection {
  EARLY      // ≤-3 days
  ON_TRACK   // -2 to +2 days
  LATE       // +3 to +14 days
  CRITICAL   // >+14 days
}
```

What about tasks with no baseline? His PRD handles this in UI but not in the enum. Add:

```prisma
enum DriftDirection {
  EARLY
  ON_TRACK
  LATE
  CRITICAL
  UNKNOWN    // No baseline set
}
```

This makes queries cleaner and avoids null-checking everywhere.

---

## What to Keep (Jeff's Best Ideas)

### 1. The DriftBadge Component ✅

This is the atomic unit of value. Jeff's design is correct:
- Color-coded (emerald/slate/amber/red)
- Shows "+5d" or "On track"  
- Fits in tables, cards, everywhere

**Keep exactly as specified**, but fix the colors for dark mode (see below).

### 2. Baseline + Projected Model ✅

The conceptual split between "what we promised" (baseline) and "what will happen" (projected) is correct. This is the foundation.

### 3. TimelineEvent Audit Trail ✅

Recording every date change with `cascadedFrom`, `triggeredBy`, and `reason` is valuable for debugging and for the "why did this slip?" conversation. Keep it.

### 4. Ghost Bars in Gantt ✅

Our `gantt-chart.tsx` already has impact visualization with ghost bars. Jeff's design extends this naturally. The baseline ghost bar showing "where we were supposed to be" is visually powerful.

### 5. The Screenshot Test Philosophy ✅

> *"Every view should be self-explanatory when screenshotted and sent to a CEO."*

This is exactly right. Hold every design decision to this standard.

---

## What to Cut for MVP

### Cut: TimelineHistory Sparklines

**Engineering:** Requires recharts dependency, adds 40KB to bundle, complex date aggregation queries.

**Customer:** PMs don't analyze 30-day drift trends. They care about *right now*. If they want history, they can expand a panel.

**MVP alternative:** Simple event list with "Feb 12: +4d from OAuth Integration". Add sparklines in v2 if customers ask.

### Cut: DriftTrendChart Component

Same reasoning. A line chart showing drift over time is "nice analytics" but not core value.

### Cut: driftChangeCount Field

**Engineering:** Denormalized data that can be derived from TimelineEvent count. One more field to keep in sync.

**Customer:** "This has slipped 3 times" is interesting trivia, not actionable.

**Alternative:** Compute on-demand from TimelineEvent when needed for display.

### Cut: Confidence Scoring

**Engineering:** `projectionConfidence: 'HIGH' | 'MEDIUM' | 'LOW'` with `confidenceFactors` is complex to compute and explain.

**Customer:** "What does 'Medium confidence' mean?" Users won't understand this. It adds cognitive load without clear action.

**Alternative:** Just show "3 of 7 tasks missing dates" as a simple warning, not a confidence score.

### Cut: Mobile-Specific Components

**Engineering:** MobileTaskCard, responsive layouts, touch interactions = 2+ weeks of work.

**Customer:** Our analytics show 3% mobile usage. Not worth the investment for MVP.

**Alternative:** Make the main UI responsive enough to work. Dedicated mobile experience in v2.

### Cut: AnimatedDriftBadge with Delta Popups

The animation showing "+3d" floating up when drift changes is delightful but complex (requires real-time sync state management, animation timing, previous value tracking).

**Alternative:** Just update the badge. Users will notice.

### Cut: Cascade Flow Animation

> *"Animate a 'pulse' flowing from child → parent → grandparent"*

This is engineering showing off. PMs don't need to watch data flow through a DAG.

---

## What to Change

### 1. Auto-Set Baselines on First Sync

Change from opt-in to opt-out:

```typescript
async function handleFirstSync(projectId: string): Promise<void> {
  const tasks = await prisma.task.findMany({
    where: { projectId, baselineDueDate: null, dueDate: { not: null } }
  });
  
  await prisma.task.updateMany({
    where: { id: { in: tasks.map(t => t.id) } },
    data: { 
      baselineDueDate: prisma.raw('due_date'),  // Copy dueDate to baseline
      driftDays: 0,
      driftDirection: 'ON_TRACK'
    }
  });
  
  // Show non-blocking toast: "Baselines set for 47 tasks. You can reset these anytime."
}
```

### 2. Replace Cascade Visualization with Attribution

Instead of:
```
OAuth Integration ──→ Auth Epic ──→ Q1 Launch Initiative
```

Show:
```
Why is this late?
└─ Auth Epic is +12 days late
   └─ Caused by: OAuth Integration (blocked since Feb 8)
```

This is the same information, but framed as "why" instead of "how the graph flows."

### 3. Integrate with Existing Critical Path

Jeff's PRD doesn't mention `src/lib/critical-path.ts`. We already compute:
- Criticality scores
- Health multipliers  
- Blocker chain analysis

Timeline drift should **amplify** these signals, not replace them:

```typescript
// In critical-path.ts, add:
export function computeCriticalPathWithDrift(
  tasks: CriticalPathTask[], 
  driftData: Map<string, { days: number; direction: DriftDirection }>
): CriticalPathSummary {
  // Existing criticality computation...
  
  // NEW: Drift amplifies criticality
  for (const task of tasks) {
    const drift = driftData.get(task.id);
    if (drift && drift.direction === 'CRITICAL') {
      // Critical drift = 1.5x criticality multiplier
      results[task.id].score *= 1.5;
      results[task.id].factors.push(`critical drift (+${drift.days}d)`);
    } else if (drift && drift.direction === 'LATE') {
      results[task.id].score *= 1.2;
      results[task.id].factors.push(`late (+${drift.days}d)`);
    }
  }
}
```

### 4. Simplify Projected Date Computation

Jeff's computation is correct but verbose. Simplify:

```typescript
// In a new src/lib/timeline/compute-projected.ts
export function computeProjectedDueDate(task: Task, childrenMap: Map<string, Task[]>): Date | null {
  const children = childrenMap.get(task.id)?.filter(c => 
    c.status !== 'done' && c.status !== 'cancelled'
  ) ?? [];
  
  if (children.length === 0) return task.dueDate;
  
  const childDates = children
    .map(c => c.projectedDueDate ?? c.dueDate)
    .filter((d): d is Date => d !== null);
  
  return childDates.length > 0 ? new Date(Math.max(...childDates.map(d => d.getTime()))) : null;
}
```

### 5. Use Semantic Colors, Not Hardcoded Values

**This is critical.** Jeff's color system will break dark mode:

```typescript
// ❌ Jeff's approach (breaks dark mode)
const driftColors = {
  early: {
    bg: 'rgba(52, 211, 153, 0.15)',    // Hardcoded = invisible in dark mode
    text: '#34D399',
  }
};
```

**Use our existing design tokens:**

```typescript
// ✅ Correct approach
const driftColors = {
  early: {
    bg: 'bg-success-50',      // Auto-maps via globals.css
    text: 'text-success-600',
    border: 'border-success/30',
  },
  onTrack: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-500', 
    border: 'border-neutral-300',
  },
  late: {
    bg: 'bg-warning-50',
    text: 'text-warning-600',
    border: 'border-warning/30',
  },
  critical: {
    bg: 'bg-danger-50',
    text: 'text-danger-600',
    border: 'border-danger/30',
  },
};
```

---

## Schema Recommendation

Here's my recommended schema—Jeff's model, simplified:

```prisma
model Task {
  // ... existing fields ...
  
  // Timeline Intelligence (add these)
  baselineStartDate   DateTime?
  baselineDueDate     DateTime?
  projectedDueDate    DateTime?  // Computed from children for containers
  driftDays           Int?       // Cached: projectedDueDate - baselineDueDate
  driftDirection      DriftDirection?
  lastDriftChange     DateTime?
  
  // Relationships
  timelineEvents      TimelineEvent[]
  
  @@index([driftDirection])  // For "show me all critical items" queries
}

enum DriftDirection {
  EARLY
  ON_TRACK
  LATE  
  CRITICAL
  UNKNOWN  // No baseline
}

model TimelineEvent {
  id              String    @id @default(cuid())
  taskId          String
  task            Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  eventType       TimelineEventType
  previousDate    DateTime?
  newDate         DateTime?
  driftDelta      Int?      // Change in drift days
  totalDrift      Int?      // Cumulative drift after this event
  
  // Attribution
  cascadedFrom    String?   // Child task ID that caused this
  triggeredBy     String?   // "sync" | "manual" | "cascade"
  reason          String?   // User-provided or auto-detected
  
  createdAt       DateTime  @default(now())
  
  @@index([taskId, createdAt])
}

enum TimelineEventType {
  BASELINE_SET
  BASELINE_RESET
  DUE_DATE_CHANGED
  PROJECTED_CHANGED
  CASCADE_RECEIVED
}
```

**What I removed:**
- `driftChangeCount` — derive from TimelineEvent count
- `cascadedTo String[]` — can be computed from reverse lookup
- `BLOCKER_ADDED/REMOVED` events — we already track blockers elsewhere

---

## Dark Mode Warnings 🚨

Jeff's PRD has **23 instances of hardcoded colors** that will break in dark mode:

| Location | Problem | Fix |
|----------|---------|-----|
| `driftColors.early.bg` | `rgba(52, 211, 153, 0.15)` | Use `bg-success-50` |
| `driftColors.early.text` | `#34D399` | Use `text-success-600` |
| `driftColors.late.bg` | `rgba(251, 191, 36, 0.15)` | Use `bg-warning-50` |
| `driftColors.critical.glow` | `0 0 16px rgba(239, 68, 68, 0.4)` | Use `.glow-danger` utility |
| `CascadeNode` border | `border-red-500/30` | Use `border-danger/30` |
| `GanttBar` shadow | Hardcoded rgba | Use semantic shadow class |
| All `text-slate-*` classes | Slate scale doesn't map | Use `text-neutral-*` |

**Rule:** If it's not in `globals.css` as a variable or override, it will break.

Our dark mode system requires:
1. Use Tailwind semantic classes (`bg-neutral-50`, `text-danger-600`)
2. For custom colors, add explicit `html[data-theme="dark"]` overrides
3. Never use `text-slate-*` — we use `neutral-*` scale

---

## Integration Plan

### File Structure

```
src/
├── lib/
│   └── timeline/
│       ├── index.ts              # Barrel export
│       ├── compute-projected.ts  # Projection calculation  
│       ├── compute-drift.ts      # Drift calculation
│       ├── propagate-cascade.ts  # Cascade logic (integrate with sync)
│       └── format-drift.ts       # Display utilities
│
├── components/
│   └── timeline/
│       ├── DriftBadge.tsx        # Core badge component
│       ├── DateWithDrift.tsx     # Date + badge combo
│       ├── TimelineAttribution.tsx  # "Why is this late?" display
│       ├── BaselinePrompt.tsx    # First-sync baseline setting
│       └── index.ts
│
└── hooks/
    └── useTimelineData.ts        # React Query hook for timeline data
```

### Integration Points

1. **Sync engine** (`src/lib/sync/`): After upserting tasks, call `propagateCascade()` for any task with changed `dueDate`

2. **Critical path** (`src/lib/critical-path.ts`): Import drift data and amplify criticality scores

3. **Gantt chart** (`src/components/gantt-chart.tsx`): Already has ghost bar support — extend with baseline dates

4. **Task table** (`project/[id]/page.tsx`): Add DriftBadge to the existing columns

5. **Project header**: Add overall project drift status badge

---

## Build Order (Recommended Phasing)

### Phase 1: Foundation (2 weeks) — Ship to Dogfood
**Goal:** Data model working, baselines being set

- [ ] Schema migration (add timeline fields to Task, create TimelineEvent)
- [ ] `computeProjectedDate()` and `computeDrift()` functions
- [ ] Auto-baseline on first sync
- [ ] Basic cascade propagation on sync
- [ ] TimelineEvent creation on date changes

**Demo:** "Look, when I change this story's date in Jira, the epic's projected date updates and we log the event."

### Phase 2: Core UI (2 weeks) — Ship to Beta Users
**Goal:** PMs can see drift in their daily workflow

- [ ] DriftBadge component (all states, dark mode correct)
- [ ] Add drift column to task table
- [ ] Drift badge on project/epic header cards
- [ ] "Why is this late?" attribution (simple version)
- [ ] Baseline reset action in task detail panel

**Demo:** "Open your project, see which epics are late at a glance, click to see why."

### Phase 3: Gantt Integration (2 weeks)
**Goal:** Visual timeline shows baseline vs. actual

- [ ] Ghost bars showing baseline dates in Gantt
- [ ] Drift indicator at bar end
- [ ] Filter by drift status
- [ ] Integrate with existing impact analysis

**Demo:** "See the ghost bar? That's where you planned to be. The solid bar is where you actually are."

### Phase 4: Polish (2 weeks)
**Goal:** Production-ready

- [ ] TimelineHistory event list (no sparklines yet)
- [ ] Bulk baseline reset ("Reset all baselines to current dates")
- [ ] Edge case handling (no dates, partial data, cycles)
- [ ] Performance optimization (batch cascade updates)
- [ ] Documentation and help tooltips

**Total: 8 weeks** (matches Jeff's estimate, but with reduced scope)

---

## Final Thoughts

Jeff wrote a good PRD. The vision is right. The core concepts (baseline, projected, drift, cascade) are exactly what we need.

But he fell into the classic PM trap: designing the feature he'd want to *demo* rather than the feature users need to *use*. Sparklines and cascade animations look great in a presentation. A simple "+12d" badge is what actually helps a PM in their Monday standup.

Ship the badge. Ship the "why is this late?" Ship the ghost bars. Cut the rest until users ask for it.

**My recommendation: Approve with the changes above. Let's build Timeline Impact, not Timeline Analytics.**

---

*— Emmy*
