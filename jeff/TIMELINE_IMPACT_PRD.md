# Timeline Impact & Delivery Date Intelligence

## Product Requirements Document
**Author:** Jeff, SVP Product  
**Status:** Ready for Review  
**Priority:** P0 — Core Value Proposition  
**Last Updated:** 2025-01-14

---

## Executive Summary

This is not a feature. This is **the reason Vantage exists.**

When a PM looks at their portfolio, they need to instantly understand: *"Am I on track, and if not, what broke?"* Today, that answer requires mental gymnastics—cross-referencing dates, calculating cascades, building timelines in their head. We're going to make that answer **visible, visceral, and undeniable.**

Timeline Impact transforms Vantage from a "nice visualization tool" into an **early warning system for delivery risk**. It's the difference between finding out your launch slipped in a stakeholder meeting vs. knowing it 3 weeks ago when you could still do something about it.

---

## Design Philosophy

### 1. Truth Should Be Uncomfortable

When dates slip, we don't soften it. A 5-day delay shows up in **urgent red**, impossible to ignore. The UI creates *productive anxiety*—the kind that makes you take action before it's too late.

### 2. Glanceability Over Completeness

A PM in a meeting has 3 seconds to check if they're in trouble. We optimize for that moment. Deep analysis is available on demand, but the headline is always visible.

### 3. Context Without Clicks

No modals to understand impact. No drilling down to find the story. The cascade is visible inline, always. Hover reveals depth; the surface shows intent.

### 4. The "Screenshot Test"

Every view should be self-explanatory when screenshotted and sent to a CEO. No legend required. Red means late. Green means early. The number is the delta. Done.

---

## Core Concepts

### Baseline Date
The **original commitment**—the date you told stakeholders the work would ship. This is sacred. It only changes when explicitly reset (new quarter planning, scope change acknowledgment). It's the "what we promised."

### Projected Date  
The **computed reality**—when the work will actually ship based on current child task dates, velocity, and blockers. It's the "what will happen."

### Drift
The delta between Baseline and Projected. Positive drift = late. Negative drift = early. This is the number that haunts PMs.

### Cascade
How a child's drift propagates to its parent. A story slipping 5 days might slip the epic 5 days, which might slip the initiative 5 days—or it might not, depending on parallelization. We compute and visualize this.

---

## Data Model

### Schema Changes

```prisma
model Task {
  // Existing fields
  id            String    @id @default(cuid())
  title         String
  startDate     DateTime?
  dueDate       DateTime? // Current projected completion
  status        TaskStatus
  taskType      TaskType
  parentId      String?
  parent        Task?     @relation("TaskHierarchy", fields: [parentId], references: [id])
  children      Task[]    @relation("TaskHierarchy")
  metadata      Json?
  
  // NEW: Timeline Intelligence Fields
  baselineStartDate   DateTime?  // Original planned start
  baselineDueDate     DateTime?  // Original planned completion  
  projectedDueDate    DateTime?  // Computed from children (for epics/initiatives)
  driftDays           Int?       // Computed: projectedDueDate - baselineDueDate
  driftDirection      DriftDirection? // EARLY, ON_TRACK, LATE
  lastDriftChange     DateTime?  // When drift last changed
  driftChangeCount    Int        @default(0) // How many times has this slipped
  
  // Relationships
  timelineEvents      TimelineEvent[]
  
  @@index([parentId])
  @@index([driftDirection])
  @@index([driftDays])
}

enum DriftDirection {
  EARLY      // Ahead of baseline
  ON_TRACK   // Within tolerance (±2 days)
  LATE       // Behind baseline
  CRITICAL   // >14 days behind baseline
}

model TimelineEvent {
  id              String    @id @default(cuid())
  taskId          String
  task            Task      @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  eventType       TimelineEventType
  previousDate    DateTime?
  newDate         DateTime?
  driftDelta      Int       // Change in drift (e.g., +3 days)
  totalDrift      Int       // Cumulative drift after this event
  
  // Cascade tracking
  cascadedFrom    String?   // Child task ID that caused this change
  cascadedTo      String[]  // Parent task IDs affected by this change
  
  // Context
  reason          String?   // Auto-detected or user-provided
  triggeredBy     String?   // "sync", "manual", "blocker", "dependency"
  
  createdAt       DateTime  @default(now())
  
  @@index([taskId])
  @@index([createdAt])
  @@index([eventType])
}

enum TimelineEventType {
  BASELINE_SET        // Initial baseline established
  BASELINE_RESET      // Baseline intentionally changed
  DUE_DATE_CHANGED    // Direct date change on task
  PROJECTED_CHANGED   // Computed projection changed
  CASCADE_RECEIVED    // Inherited drift from child
  BLOCKER_ADDED       // Task blocked (potential drift cause)
  BLOCKER_REMOVED     // Task unblocked
}
```

### Metadata Structure (for extended tracking)

```typescript
interface TimelineMetadata {
  // Baseline history (for auditing)
  baselineHistory: Array<{
    date: string;       // ISO date
    setAt: string;      // ISO timestamp
    setBy: string;      // User or "system"
    reason?: string;
  }>;
  
  // Cascade path (for visualization)
  cascadeImpact?: {
    immediateParent: {
      id: string;
      title: string;
      driftContribution: number; // How many days this task contributed
    };
    initiative?: {
      id: string;
      title: string;
      driftContribution: number;
    };
  };
  
  // Confidence scoring
  projectionConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceFactors: string[]; // ["missing_estimates", "high_blocker_rate", etc.]
}
```

---

## Computation Logic

### 1. Projected Date Calculation

For **leaf tasks** (stories, bugs, subtasks):
```
projectedDueDate = dueDate (user-set or synced from Jira)
```

For **container tasks** (epics, initiatives):
```typescript
function computeProjectedDate(task: Task): Date | null {
  const children = task.children.filter(c => c.status !== 'DONE' && c.status !== 'CANCELLED');
  
  if (children.length === 0) {
    // All children complete or no children
    return task.dueDate;
  }
  
  // Projected = latest child's projected date
  // This assumes finish-to-start; we take the max
  const childProjections = children
    .map(c => c.projectedDueDate || c.dueDate)
    .filter(Boolean) as Date[];
  
  if (childProjections.length === 0) {
    return null; // Can't project without child dates
  }
  
  return max(childProjections);
}
```

### 2. Drift Calculation

```typescript
function computeDrift(task: Task): DriftResult {
  const baseline = task.baselineDueDate;
  const projected = task.projectedDueDate || task.dueDate;
  
  if (!baseline || !projected) {
    return { days: null, direction: null };
  }
  
  const driftDays = differenceInDays(projected, baseline);
  
  let direction: DriftDirection;
  if (driftDays <= -3) direction = 'EARLY';
  else if (driftDays <= 2) direction = 'ON_TRACK';
  else if (driftDays <= 14) direction = 'LATE';
  else direction = 'CRITICAL';
  
  return { days: driftDays, direction };
}
```

### 3. Cascade Propagation

When a task's date changes, we propagate up the hierarchy:

```typescript
async function propagateDateChange(taskId: string, tx: Transaction): Promise<CascadeResult> {
  const task = await tx.task.findUnique({ 
    where: { id: taskId },
    include: { parent: true }
  });
  
  if (!task.parent) return { affectedIds: [] };
  
  const parent = task.parent;
  const previousProjected = parent.projectedDueDate;
  const newProjected = await computeProjectedDate(parent);
  
  if (previousProjected?.getTime() === newProjected?.getTime()) {
    return { affectedIds: [] }; // No change, stop propagation
  }
  
  // Update parent
  await tx.task.update({
    where: { id: parent.id },
    data: {
      projectedDueDate: newProjected,
      ...computeDrift({ ...parent, projectedDueDate: newProjected }),
      lastDriftChange: new Date(),
      driftChangeCount: { increment: 1 }
    }
  });
  
  // Record timeline event
  await tx.timelineEvent.create({
    data: {
      taskId: parent.id,
      eventType: 'CASCADE_RECEIVED',
      previousDate: previousProjected,
      newDate: newProjected,
      driftDelta: differenceInDays(newProjected, previousProjected),
      totalDrift: computeDrift({ ...parent, projectedDueDate: newProjected }).days,
      cascadedFrom: taskId,
      triggeredBy: 'cascade'
    }
  });
  
  // Continue propagation up
  const upstreamResult = await propagateDateChange(parent.id, tx);
  
  return { 
    affectedIds: [parent.id, ...upstreamResult.affectedIds]
  };
}
```

### 4. Baseline Setting Logic

```typescript
async function setBaseline(taskId: string, options: BaselineOptions = {}): Promise<void> {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  
  // Default baseline to current dueDate if not explicitly provided
  const baselineDate = options.date || task.dueDate;
  
  await prisma.$transaction(async (tx) => {
    // Update task
    await tx.task.update({
      where: { id: taskId },
      data: {
        baselineDueDate: baselineDate,
        // Reset drift calculations
        driftDays: 0,
        driftDirection: 'ON_TRACK',
        driftChangeCount: options.isReset ? 0 : task.driftChangeCount
      }
    });
    
    // Record event
    await tx.timelineEvent.create({
      data: {
        taskId,
        eventType: options.isReset ? 'BASELINE_RESET' : 'BASELINE_SET',
        newDate: baselineDate,
        driftDelta: 0,
        totalDrift: 0,
        reason: options.reason,
        triggeredBy: 'manual'
      }
    });
  });
}
```

---

## UI/UX Design

### Design Tokens

```typescript
// Color system (dark mode primary)
const driftColors = {
  early: {
    bg: 'rgba(52, 211, 153, 0.15)',    // Emerald with transparency
    text: '#34D399',                    // Emerald 400
    border: 'rgba(52, 211, 153, 0.4)',
    glow: '0 0 12px rgba(52, 211, 153, 0.3)'
  },
  onTrack: {
    bg: 'rgba(148, 163, 184, 0.1)',     // Slate subtle
    text: '#94A3B8',                     // Slate 400
    border: 'rgba(148, 163, 184, 0.3)',
    glow: 'none'
  },
  late: {
    bg: 'rgba(251, 191, 36, 0.15)',     // Amber with transparency
    text: '#FBBF24',                     // Amber 400
    border: 'rgba(251, 191, 36, 0.4)',
    glow: '0 0 12px rgba(251, 191, 36, 0.25)'
  },
  critical: {
    bg: 'rgba(239, 68, 68, 0.15)',      // Red with transparency
    text: '#EF4444',                     // Red 500
    border: 'rgba(239, 68, 68, 0.5)',
    glow: '0 0 16px rgba(239, 68, 68, 0.4)',
    pulse: true                          // Subtle pulse animation
  }
};

// Typography
const driftType = {
  badge: 'font-mono text-xs font-semibold tracking-tight',
  delta: 'font-mono text-sm font-bold tabular-nums',
  label: 'text-xs text-slate-500 uppercase tracking-wider'
};
```

### Component: DriftBadge

The atomic unit of timeline communication. Used everywhere.

```tsx
interface DriftBadgeProps {
  days: number | null;
  direction: DriftDirection | null;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animate?: boolean;
}

function DriftBadge({ days, direction, size = 'md', showIcon = true, animate = true }: DriftBadgeProps) {
  if (days === null || direction === null) {
    return (
      <span className="text-slate-600 text-xs italic">No baseline</span>
    );
  }
  
  const config = driftColors[direction];
  const absdays = Math.abs(days);
  
  // Format: "+5d" or "-3d" or "On track"
  const label = direction === 'ON_TRACK' 
    ? 'On track'
    : `${days > 0 ? '+' : ''}${days}d`;
  
  const icons = {
    EARLY: '↑',      // Trending up (good)
    ON_TRACK: '→',   // Steady
    LATE: '↓',       // Trending down (warning)
    CRITICAL: '⚠'    // Alert
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
        'border transition-all duration-200',
        config.pulse && animate && 'animate-pulse-subtle',
        sizeClasses[size]
      )}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
        boxShadow: config.glow
      }}
    >
      {showIcon && <span className="text-[10px]">{icons[direction]}</span>}
      <span className={driftType.badge}>{label}</span>
    </span>
  );
}
```

**Sizes:**
- `sm`: 20px height, used in dense tables
- `md`: 24px height, default
- `lg`: 28px height, used in headers/cards

### Component: DateWithDrift

Combined date display with inline drift indication.

```tsx
interface DateWithDriftProps {
  baselineDate: Date | null;
  projectedDate: Date | null;
  driftDays: number | null;
  driftDirection: DriftDirection | null;
  format?: 'short' | 'medium' | 'long';
}

function DateWithDrift({ 
  baselineDate, 
  projectedDate, 
  driftDays, 
  driftDirection,
  format = 'medium'
}: DateWithDriftProps) {
  const formatDate = (d: Date) => {
    if (format === 'short') return formatDistanceToNow(d, { addSuffix: true });
    if (format === 'medium') return format(d, 'MMM d');
    return format(d, 'MMMM d, yyyy');
  };
  
  return (
    <div className="flex items-center gap-2">
      {/* Primary: Projected Date */}
      <span className={cn(
        'font-medium',
        driftDirection === 'CRITICAL' && 'text-red-400',
        driftDirection === 'LATE' && 'text-amber-400',
        driftDirection === 'EARLY' && 'text-emerald-400',
        (!driftDirection || driftDirection === 'ON_TRACK') && 'text-slate-200'
      )}>
        {projectedDate ? formatDate(projectedDate) : '—'}
      </span>
      
      {/* Secondary: Drift Badge */}
      <DriftBadge 
        days={driftDays} 
        direction={driftDirection} 
        size="sm"
        showIcon={false}
      />
      
      {/* Tertiary: Baseline (on hover) */}
      {baselineDate && (
        <Tooltip content={`Baseline: ${formatDate(baselineDate)}`}>
          <span className="text-slate-600 text-xs">
            (was {formatDate(baselineDate)})
          </span>
        </Tooltip>
      )}
    </div>
  );
}
```

### Component: CascadeIndicator

Shows how drift flows through the hierarchy. The "wow" component.

```tsx
interface CascadeIndicatorProps {
  task: TaskWithRelations;
  expanded?: boolean;
}

function CascadeIndicator({ task, expanded = false }: CascadeIndicatorProps) {
  const cascade = useMemo(() => computeCascadeChain(task), [task]);
  
  if (!cascade.length) return null;
  
  return (
    <div className={cn(
      'flex items-center gap-1',
      expanded ? 'flex-col items-start' : 'flex-row'
    )}>
      {cascade.map((node, i) => (
        <Fragment key={node.id}>
          {i > 0 && (
            <span className="text-slate-600">
              {expanded ? '↳' : '→'}
            </span>
          )}
          <CascadeNode 
            node={node} 
            isSource={i === 0}
            isTerminal={i === cascade.length - 1}
          />
        </Fragment>
      ))}
    </div>
  );
}

function CascadeNode({ node, isSource, isTerminal }) {
  return (
    <Tooltip content={
      <div className="text-xs">
        <div className="font-medium">{node.title}</div>
        <div className="text-slate-400">
          {node.taskType} • {node.driftContribution > 0 ? '+' : ''}{node.driftContribution}d contribution
        </div>
      </div>
    }>
      <div className={cn(
        'flex items-center gap-1 px-2 py-1 rounded',
        'bg-slate-800/50 border border-slate-700/50',
        isTerminal && node.driftDirection === 'CRITICAL' && 'border-red-500/30 bg-red-500/10'
      )}>
        <TaskTypeIcon type={node.taskType} size={12} />
        <span className="text-xs text-slate-300 max-w-[100px] truncate">
          {node.title}
        </span>
        <DriftBadge 
          days={node.driftDays} 
          direction={node.driftDirection}
          size="sm"
          showIcon={false}
        />
      </div>
    </Tooltip>
  );
}
```

### Component: TimelineHistory

Sparkline + event list showing drift over time.

```tsx
interface TimelineHistoryProps {
  taskId: string;
  events: TimelineEvent[];
  compact?: boolean;
}

function TimelineHistory({ taskId, events, compact = false }: TimelineHistoryProps) {
  const driftOverTime = useMemo(() => 
    events
      .filter(e => e.totalDrift !== null)
      .map(e => ({ date: e.createdAt, drift: e.totalDrift })),
    [events]
  );
  
  return (
    <div className="space-y-3">
      {/* Drift Sparkline */}
      <div className="h-12 w-full">
        <DriftSparkline 
          data={driftOverTime}
          showZeroLine
          colorByValue // Green below 0, red above
        />
      </div>
      
      {/* Event List */}
      {!compact && (
        <div className="space-y-2">
          {events.slice(0, 5).map(event => (
            <TimelineEventRow key={event.id} event={event} />
          ))}
          {events.length > 5 && (
            <button className="text-xs text-slate-500 hover:text-slate-300">
              View {events.length - 5} more events
            </button>
          )}
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="flex gap-4 text-xs text-slate-500">
        <span>
          <strong className="text-slate-300">{events.filter(e => e.driftDelta > 0).length}</strong> delays
        </span>
        <span>
          <strong className="text-slate-300">{events.filter(e => e.driftDelta < 0).length}</strong> accelerations
        </span>
      </div>
    </div>
  );
}

function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const eventLabels = {
    BASELINE_SET: 'Baseline set',
    BASELINE_RESET: 'Baseline reset',
    DUE_DATE_CHANGED: 'Date changed',
    PROJECTED_CHANGED: 'Projection updated',
    CASCADE_RECEIVED: 'Inherited from child',
    BLOCKER_ADDED: 'Blocked',
    BLOCKER_REMOVED: 'Unblocked'
  };
  
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="text-slate-500 text-xs">
          {format(event.createdAt, 'MMM d')}
        </span>
        <span className="text-slate-300 text-sm">
          {eventLabels[event.eventType]}
        </span>
      </div>
      <DriftBadge 
        days={event.driftDelta}
        direction={event.driftDelta > 2 ? 'LATE' : event.driftDelta < -2 ? 'EARLY' : 'ON_TRACK'}
        size="sm"
      />
    </div>
  );
}
```

---

## Surface-Specific Designs

### 1. Task Table View

**Goal:** Instant scanning of timeline health across many items.

**Column: "Timeline"** (new column, can replace or supplement "Due Date")

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Title               │ Status      │ Timeline                    │ Assignee   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🎯 Auth Epic        │ In Progress │ Mar 15  ⚠ +12d  [▓▓▓░░]    │ —          │
│   ├─ Login flow     │ Done        │ Feb 28  ✓                   │ Sarah      │
│   ├─ OAuth setup    │ Blocked     │ Mar 10  ↓ +8d              │ Mike       │
│   └─ Token refresh  │ To Do       │ Mar 15  ↓ +4d              │ —          │
│ 🎯 Payments Epic    │ On Track    │ Apr 1   → On track          │ —          │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Implementation:**

```tsx
function TimelineCell({ task }: { task: Task }) {
  const isContainer = ['EPIC', 'INITIATIVE'].includes(task.taskType);
  
  return (
    <div className="flex items-center gap-2 min-w-[180px]">
      {/* Date */}
      <span className={cn(
        'font-medium tabular-nums w-16',
        task.driftDirection === 'CRITICAL' && 'text-red-400',
        task.driftDirection === 'LATE' && 'text-amber-400'
      )}>
        {task.projectedDueDate 
          ? format(task.projectedDueDate, 'MMM d')
          : '—'
        }
      </span>
      
      {/* Drift Badge */}
      <DriftBadge 
        days={task.driftDays}
        direction={task.driftDirection}
        size="sm"
      />
      
      {/* Mini progress bar for containers */}
      {isContainer && (
        <MiniTimelineBar 
          baseline={task.baselineDueDate}
          projected={task.projectedDueDate}
          className="w-16 h-2"
        />
      )}
    </div>
  );
}
```

**Hover State:**

On hover, show a popover card with:
- Full date details (baseline vs projected)
- Cascade chain (if drift inherited)
- Quick actions: "Reset baseline", "View history"

### 2. Project Detail View (Epic/Initiative Page)

**Goal:** Deep understanding of timeline health for a single item.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  🎯 Q1 Auth Overhaul                                          [Epic] [In Prog] │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │  TIMELINE HEALTH                                                ⚠ AT RISK │   │
│  │                                                                          │   │
│  │  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │   │
│  │  │ Baseline │    │ Projected│    │  Drift   │    │    Confidence    │  │   │
│  │  │  Mar 1   │ →  │  Mar 13  │ =  │  +12 days│    │   ▓▓▓░░ Medium  │  │   │
│  │  │          │    │          │    │          │    │   (2 unknowns)   │  │   │
│  │  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘  │   │
│  │                                                                          │   │
│  │  Drift Trend (30d)                                                       │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │     ^                                        ╭───╮                 │ │   │
│  │  │  +10│                              ╭────────╯   │  current: +12d  │ │   │
│  │  │   +5│                    ╭────────╯             │                 │ │   │
│  │  │────0│──────╮────────────╯                      │                 │ │   │
│  │  │   -5│      ╰────╮                               │                 │ │   │
│  │  │     └──────────────────────────────────────────────────────────── │ │   │
│  │  │     Jan 15    Jan 22    Jan 29    Feb 5    Feb 12    Today       │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                          │   │
│  │  What's causing this? ─────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  OAuth Integration  ──→  Auth Epic  ──→  Q1 Launch Initiative           │   │
│  │  [Story] +8d             [Epic] +12d     [Initiative] +12d              │   │
│  │  ↑ Blocked 5 days        ↑ Inherited     ↑ Inherited                    │   │
│  │                                                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  Timeline History                                                    [View All] │
│  ─────────────────────────────────────────────────────────────────────────────  │
│  Feb 12  Inherited +4d from "OAuth Integration"                         +12d   │
│  Feb 8   Inherited +4d from "OAuth Integration" (blocked)               +8d    │
│  Feb 3   "OAuth Integration" blocked by external dependency             +4d    │
│  Jan 20  Baseline set                                                   0d     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Component:**

```tsx
function TimelineHealthCard({ task }: { task: TaskWithTimeline }) {
  const { events, isLoading } = useTimelineEvents(task.id);
  const cascadeChain = useCascadeChain(task);
  
  const statusConfig = {
    EARLY: { label: 'Ahead of Schedule', color: 'emerald', icon: '🚀' },
    ON_TRACK: { label: 'On Track', color: 'slate', icon: '✓' },
    LATE: { label: 'At Risk', color: 'amber', icon: '⚠' },
    CRITICAL: { label: 'Critical', color: 'red', icon: '🚨' }
  };
  
  const status = statusConfig[task.driftDirection || 'ON_TRACK'];
  
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-slate-400">
          TIMELINE HEALTH
        </CardTitle>
        <Badge variant={status.color}>
          {status.icon} {status.label}
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <MetricBox 
            label="Baseline"
            value={task.baselineDueDate ? format(task.baselineDueDate, 'MMM d') : '—'}
          />
          <MetricBox 
            label="Projected"
            value={task.projectedDueDate ? format(task.projectedDueDate, 'MMM d') : '—'}
            highlight={task.driftDirection}
          />
          <MetricBox 
            label="Drift"
            value={task.driftDays !== null ? `${task.driftDays > 0 ? '+' : ''}${task.driftDays} days` : '—'}
            highlight={task.driftDirection}
          />
          <MetricBox 
            label="Confidence"
            value={<ConfidenceBar confidence={task.metadata?.projectionConfidence} />}
          />
        </div>
        
        {/* Drift Trend Chart */}
        <div className="h-32">
          <DriftTrendChart events={events} />
        </div>
        
        {/* Cascade Attribution */}
        {cascadeChain.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              What's causing this?
            </h4>
            <CascadeIndicator task={task} expanded />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### 3. Timeline / Gantt View

**Goal:** Visual comparison of baseline vs. actual across time.

**Design: Ghost Bars**

Each task shows two bars:
1. **Ghost bar** (baseline): Faded, dashed outline showing original plan
2. **Solid bar** (current): Actual/projected dates

```
Timeline View:
                    Feb           Mar           Apr
                    ────────────────────────────────────────
Auth Epic           
  Baseline:         [╌╌╌╌╌╌╌╌╌╌╌╌╌╌]
  Current:          [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓]  ← +12d overhang
                                           ↑ Delta indicator

Payments Epic
  Baseline:                       [╌╌╌╌╌╌╌╌╌╌╌╌╌╌]
  Current:                        [▓▓▓▓▓▓▓▓▓▓▓▓▓▓]  ← On track
```

**Implementation:**

```tsx
interface GanttBarProps {
  task: Task;
  scale: TimeScale;
  showBaseline?: boolean;
}

function GanttBar({ task, scale, showBaseline = true }: GanttBarProps) {
  const currentStart = scale.toPixels(task.startDate);
  const currentEnd = scale.toPixels(task.projectedDueDate || task.dueDate);
  const currentWidth = currentEnd - currentStart;
  
  const baselineStart = task.baselineStartDate ? scale.toPixels(task.baselineStartDate) : null;
  const baselineEnd = task.baselineDueDate ? scale.toPixels(task.baselineDueDate) : null;
  const baselineWidth = baselineStart && baselineEnd ? baselineEnd - baselineStart : null;
  
  const barColor = {
    EARLY: 'bg-emerald-500',
    ON_TRACK: 'bg-blue-500',
    LATE: 'bg-amber-500',
    CRITICAL: 'bg-red-500'
  }[task.driftDirection || 'ON_TRACK'];
  
  return (
    <div className="relative h-8">
      {/* Baseline Ghost Bar */}
      {showBaseline && baselineStart !== null && baselineWidth !== null && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-4 
                     border border-dashed border-slate-600 rounded
                     bg-slate-800/30"
          style={{ 
            left: baselineStart, 
            width: baselineWidth 
          }}
        />
      )}
      
      {/* Current/Projected Bar */}
      <div 
        className={cn(
          'absolute top-1/2 -translate-y-1/2 h-6 rounded',
          barColor,
          'shadow-lg transition-all duration-300'
        )}
        style={{ 
          left: currentStart, 
          width: currentWidth,
          boxShadow: task.driftDirection === 'CRITICAL' 
            ? '0 0 20px rgba(239, 68, 68, 0.4)' 
            : undefined
        }}
      >
        {/* Title inside bar */}
        <span className="absolute inset-0 flex items-center px-2 
                         text-xs font-medium text-white truncate">
          {task.title}
        </span>
        
        {/* Drift indicator at end */}
        {task.driftDays !== null && task.driftDays !== 0 && (
          <div className={cn(
            'absolute -right-1 top-1/2 -translate-y-1/2 translate-x-full',
            'px-1.5 py-0.5 rounded text-xs font-mono font-bold',
            task.driftDays > 0 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
          )}>
            {task.driftDays > 0 ? '+' : ''}{task.driftDays}d
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Mobile View

**Goal:** Quick status check in meetings—hold up phone, get answer.

**Design Principles:**
- Single-column, card-based
- Drift status is the headline, not the date
- Swipe for details
- Large touch targets

```tsx
function MobileTaskCard({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      className="bg-slate-900 rounded-xl p-4 space-y-3"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <TaskTypeIcon type={task.taskType} size={16} />
            <h3 className="font-medium text-slate-100 truncate">
              {task.title}
            </h3>
          </div>
        </div>
        
        {/* BIG drift badge - the main info */}
        <DriftBadge 
          days={task.driftDays}
          direction={task.driftDirection}
          size="lg"
        />
      </div>
      
      {/* Date Row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          Due {task.projectedDueDate ? format(task.projectedDueDate, 'MMM d') : '—'}
        </span>
        {task.baselineDueDate && task.driftDays !== 0 && (
          <span className="text-slate-600">
            was {format(task.baselineDueDate, 'MMM d')}
          </span>
        )}
      </div>
      
      {/* Expanded: Cascade Chain */}
      {expanded && task.driftDays !== 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="pt-3 border-t border-slate-800"
        >
          <p className="text-xs text-slate-500 mb-2">Impact chain:</p>
          <CascadeIndicator task={task} expanded />
        </motion.div>
      )}
    </div>
  );
}
```

---

## Interaction Patterns

### 1. Hover States

**Quick peek (200ms delay):**
```
┌─────────────────────────────────────────┐
│  Auth Epic                              │
│  ─────────────────────────────────────  │
│  Baseline:    Mar 1, 2024               │
│  Projected:   Mar 13, 2024              │
│  Drift:       +12 days                  │
│  ─────────────────────────────────────  │
│  Slipped 3 times since Jan 20           │
│  Main blocker: OAuth Integration        │
│                                         │
│  [Reset Baseline]  [View History →]     │
└─────────────────────────────────────────┘
```

### 2. Click Actions

**On DriftBadge click:** Open slide-over panel with full timeline history

**On cascade node click:** Navigate to that task

**On "Reset Baseline" click:**
```tsx
function ResetBaselineDialog({ task, onConfirm }) {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Baseline for {task.title}?</DialogTitle>
          <DialogDescription>
            This will set {format(task.projectedDueDate, 'MMM d, yyyy')} as the new baseline.
            The drift will reset to 0. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Reason (optional)</Label>
            <Textarea 
              placeholder="e.g., Scope change approved in Q1 planning"
              {...register('reason')}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button onClick={onConfirm}>Reset Baseline</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### 3. Animations

**Drift change animation:**
When drift changes (via real-time sync), the badge briefly pulses and shows the delta:

```tsx
function AnimatedDriftBadge({ days, direction, previousDays }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const delta = days - previousDays;
  
  useEffect(() => {
    if (delta !== 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [days]);
  
  return (
    <div className="relative">
      <DriftBadge days={days} direction={direction} />
      
      {isAnimating && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 0, y: -20 }}
          className={cn(
            'absolute -top-2 right-0 text-xs font-bold',
            delta > 0 ? 'text-red-400' : 'text-emerald-400'
          )}
        >
          {delta > 0 ? '+' : ''}{delta}d
        </motion.div>
      )}
    </div>
  );
}
```

**Cascade flow animation:**
When viewing cascade, animate a "pulse" flowing from child → parent → grandparent to visualize the propagation.

---

## Edge Cases

### 1. No Baseline Set

**Behavior:** Show "Set baseline" prompt instead of drift

```tsx
{!task.baselineDueDate ? (
  <button className="text-xs text-blue-400 hover:text-blue-300">
    + Set baseline
  </button>
) : (
  <DriftBadge ... />
)}
```

**Auto-baseline:** On first sync, if task has a due date and no baseline, offer to auto-set baseline = due date.

### 2. No Due Date

**Behavior:** Show "No date" in muted style, exclude from cascade calculations

```tsx
{!task.dueDate && !task.projectedDueDate ? (
  <span className="text-slate-600 text-xs italic">No date</span>
) : (
  <DateWithDrift ... />
)}
```

### 3. Partial Child Data

If some children have dates and some don't:
- Projected date = max of children WITH dates
- Show confidence indicator as "Low" with tooltip: "3 of 7 tasks missing dates"

### 4. Manual Override

Users can manually set projectedDueDate on epics (override computation):

```tsx
{task.isManuallyOverridden && (
  <Tooltip content="Manually set—not computed from children">
    <span className="text-xs text-amber-500">✏️</span>
  </Tooltip>
)}
```

### 5. First Sync

On initial Jira sync:
1. Import due dates as-is
2. Prompt user: "Set today's dates as baselines for all items?"
3. If yes, bulk-set baselines
4. If no, leave baselines null (user sets manually)

### 6. Circular Dependencies

If somehow a circular parent-child relationship exists:
- Detect during cascade propagation (track visited IDs)
- Log error, skip cascade, surface warning in UI

### 7. Timezone Handling

All dates stored as UTC. Display in user's local timezone. Drift calculated on calendar days, not timestamps.

---

## Component Architecture

```
src/
├── components/
│   └── timeline/
│       ├── DriftBadge.tsx           # Atomic drift indicator
│       ├── DateWithDrift.tsx        # Combined date + drift display
│       ├── CascadeIndicator.tsx     # Shows drift flow through hierarchy
│       ├── TimelineHistory.tsx      # Event list + sparkline
│       ├── TimelineHealthCard.tsx   # Full card for detail views
│       ├── GanttBar.tsx             # Single bar with baseline ghost
│       ├── MiniTimelineBar.tsx      # Compact bar for tables
│       ├── DriftTrendChart.tsx      # 30-day drift chart
│       ├── ConfidenceBar.tsx        # Projection confidence indicator
│       ├── ResetBaselineDialog.tsx  # Confirmation dialog
│       └── index.ts                 # Barrel export
│
├── hooks/
│   └── timeline/
│       ├── useTimelineEvents.ts     # Fetch timeline events for task
│       ├── useCascadeChain.ts       # Compute cascade visualization
│       ├── useDriftAnimation.ts     # Handle drift change animations
│       └── useBaselineMutation.ts   # Set/reset baseline operations
│
├── lib/
│   └── timeline/
│       ├── computeProjectedDate.ts  # Projection calculation
│       ├── computeDrift.ts          # Drift calculation
│       ├── propagateCascade.ts      # Cascade propagation logic
│       └── formatDrift.ts           # Display formatting utilities
│
└── api/
    └── timeline/
        ├── events.ts                # GET /api/timeline/events/:taskId
        ├── baseline.ts              # POST /api/timeline/baseline
        └── recalculate.ts           # POST /api/timeline/recalculate
```

---

## API Endpoints

### GET /api/timeline/events/:taskId

Returns timeline events for a task.

```typescript
interface TimelineEventsResponse {
  events: TimelineEvent[];
  summary: {
    totalSlips: number;
    totalAccelerations: number;
    largestSlip: number;
    currentDrift: number;
  };
}
```

### POST /api/timeline/baseline

Set or reset baseline for a task.

```typescript
interface SetBaselineRequest {
  taskId: string;
  date?: string;        // ISO date, defaults to current dueDate
  reason?: string;
  isReset?: boolean;    // If true, resets drift count
  cascade?: boolean;    // If true, also set baselines for children
}
```

### POST /api/timeline/recalculate

Force recalculation of projections (admin/debug).

```typescript
interface RecalculateRequest {
  taskId?: string;      // Specific task, or
  projectId?: string;   // All tasks in project
}
```

---

## Build Order

### Phase 1: Foundation (Week 1-2)
**Ship:** Core data model + computation

1. **Schema migration**
   - Add baseline fields to Task model
   - Create TimelineEvent model
   - Add indexes

2. **Computation engine**
   - `computeProjectedDate()` for containers
   - `computeDrift()` calculation
   - `propagateCascade()` on task update

3. **Sync integration**
   - On Jira sync, detect date changes
   - Trigger cascade propagation
   - Create timeline events

4. **API endpoints**
   - Timeline events endpoint
   - Baseline set/reset endpoint

**Demo:** Show terminal output of cascade propagation working

### Phase 2: Core UI (Week 3-4)
**Ship:** Table + Detail view components

1. **DriftBadge component**
   - All variants (early/on-track/late/critical)
   - Size variants
   - Animation states

2. **Table integration**
   - New "Timeline" column
   - DateWithDrift display
   - Hover popovers

3. **TimelineHealthCard**
   - For epic/initiative detail pages
   - Key metrics display
   - Drift trend chart (basic)

4. **CascadeIndicator**
   - Horizontal chain display
   - Tooltips on nodes

**Demo:** PM can see drift in task table, click into epic and see full timeline card

### Phase 3: Visualization (Week 5-6)
**Ship:** Gantt enhancements + History

1. **GanttBar with baseline**
   - Ghost bar rendering
   - Delta indicators
   - Color coding

2. **Timeline view updates**
   - Baseline toggle
   - Filter by drift status

3. **TimelineHistory component**
   - Event list
   - Sparkline chart
   - Summary stats

4. **DriftTrendChart**
   - 30-day view
   - Zero line
   - Color by value

**Demo:** PM can see baseline vs. current in Gantt, drill into full history

### Phase 4: Polish + Mobile (Week 7-8)
**Ship:** Mobile + Animations + Edge cases

1. **Mobile components**
   - MobileTaskCard
   - Responsive adjustments
   - Touch interactions

2. **Animations**
   - Drift change animation
   - Cascade flow animation
   - Micro-interactions

3. **Edge case handling**
   - No baseline prompts
   - Partial data warnings
   - Manual override indicators

4. **Baseline management UX**
   - Bulk baseline setting
   - Reset confirmation
   - First-sync experience

**Demo:** Full feature in production, including mobile

---

## Success Metrics

### Quantitative
- **Time to understand impact:** Target < 5 seconds (user research)
- **Feature adoption:** 80%+ of active users view timeline data weekly
- **Baseline coverage:** 70%+ of epics have baselines set within 30 days

### Qualitative
- **Screenshot test:** Users share timeline views with stakeholders
- **"I can't live without it":** Mentioned in churn interviews as reason to stay
- **Reduced surprise:** Fewer "why did this slip?" conversations

---

## Open Questions

1. **Baseline inheritance:** When epic baseline is set, auto-set child baselines?
2. **Notification triggers:** Alert when drift exceeds threshold? (Future feature)
3. **Comparison mode:** Show "planned vs. actual" for completed items?
4. **Export:** Include baseline data in CSV/report exports?

---

## Appendix: Visual Reference

### Color Reference (Dark Mode)

| State | Background | Text | Border | Use |
|-------|-----------|------|--------|-----|
| Early | `rgba(52,211,153,0.15)` | `#34D399` | `rgba(52,211,153,0.4)` | ≤-3 days |
| On Track | `rgba(148,163,184,0.1)` | `#94A3B8` | `rgba(148,163,184,0.3)` | -2 to +2 days |
| Late | `rgba(251,191,36,0.15)` | `#FBBF24` | `rgba(251,191,36,0.4)` | +3 to +14 days |
| Critical | `rgba(239,68,68,0.15)` | `#EF4444` | `rgba(239,68,68,0.5)` | >+14 days |

### Icon Reference

| State | Icon | Meaning |
|-------|------|---------|
| Early | ↑ | Trending ahead |
| On Track | → | Stable |
| Late | ↓ | Trending behind |
| Critical | ⚠ | Needs attention |

---

*This is how we make PMs fall in love with Vantage. Let's build it.*
