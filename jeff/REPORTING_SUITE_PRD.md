# Reporting Suite PRD — Stakeholder-Targeted Intelligence
**Author:** Jeff, SVP Product  
**Date:** February 11, 2026  
**Version:** 1.0  
**Status:** Ready for Engineering Review  

---

## Executive Summary

**The current reporting is broken.** We serve the same 900-line kitchen-sink report to CEOs and ICs alike. Nobody reads it because nobody should — it's a wall of noise pretending to be signal.

**The fix:** Six radically different reports, each designed for a specific stakeholder's decision-making context. A CEO gets a traffic light and three numbers. An IC gets their personal task list. A client gets milestone progress without internal jargon. Same data, completely different presentations.

**The standard:** Linear's project updates, Stripe's dashboard clarity, GitHub's activity density. If our reports don't feel as effortless to consume, we've failed.

---

## 1. Persona Definitions

### 1.1 CEO / C-Suite
| Attribute | Value |
|-----------|-------|
| **Who** | Funding the project, reports to board |
| **Question** | "Should I worry or can I move on?" |
| **Decision** | Escalate to team, ask for status call, or ignore |
| **Time budget** | 30 seconds |
| **Context** | Checking between meetings, often on phone |
| **Delivery** | Email digest, Slack DM, mobile-first |

### 1.2 VP / Director
| Attribute | Value |
|-----------|-------|
| **Who** | Owns 3-8 projects, reports to C-suite |
| **Question** | "Which of my projects need attention?" |
| **Decision** | Where to focus 1:1s, what to escalate up |
| **Time budget** | 60 seconds |
| **Context** | Portfolio triage between meetings |
| **Delivery** | Email digest, in-app dashboard |

### 1.3 Project Manager
| Attribute | Value |
|-----------|-------|
| **Who** | Owns 1-2 projects day-to-day |
| **Question** | "What's slipping and who's blocked?" |
| **Decision** | Unblock tasks, adjust scope, update stakeholders |
| **Time budget** | 90 seconds |
| **Context** | Start of day planning, standup prep |
| **Delivery** | Email, Slack channel, in-app |

### 1.4 Engineering Lead
| Attribute | Value |
|-----------|-------|
| **Who** | Owns technical execution for a team |
| **Question** | "Who needs help and what's stuck?" |
| **Decision** | Reassign work, pair with blocked engineers |
| **Time budget** | 90 seconds |
| **Context** | Before standup, end of day check |
| **Delivery** | Slack, in-app |

### 1.5 Team Member / IC
| Attribute | Value |
|-----------|-------|
| **Who** | Individual contributor executing tasks |
| **Question** | "What do I need to do today?" |
| **Decision** | Which task to work on next |
| **Time budget** | 45 seconds |
| **Context** | Start of day, between tasks |
| **Delivery** | Slack DM, in-app personal view |

### 1.6 Client / External Stakeholder
| Attribute | Value |
|-----------|-------|
| **Who** | Paying customer or external partner |
| **Question** | "Is my project on track?" |
| **Decision** | Maintain confidence or escalate concerns |
| **Time budget** | 30 seconds |
| **Context** | Weekly check-in, board prep |
| **Delivery** | Shareable link (with auth), email |

---

## 2. Report Specifications

---

### 2.1 CEO PULSE — "The Traffic Light"

**Philosophy:** A CEO has 30 seconds between board prep and investor calls. They need exactly one thing: should they worry or not? Everything else is noise.

**Screen budget:** 1 screen. No scroll. Ever.

#### Layout (Single Card)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  [TRAFFIC LIGHT]         Portfolio Health                    │  │
│  │      ●                   "All systems operational"           │  │
│  │    GREEN                 — or —                              │  │
│  │                          "2 projects need attention"         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │     12      │  │      3      │  │     87%     │                 │
│  │  Projects   │  │  At Risk    │  │  On Track   │                 │
│  │   Active    │  │  (tap →)    │  │  This Week  │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ⚠️ ACTION NEEDED: Mobile App v2 blocked on API review        │  │
│  │     Owner: Sarah Chen · 3 days blocked · [View →]            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Generated Feb 11, 2026 9:00 AM · Next: Tomorrow 9:00 AM          │
└─────────────────────────────────────────────────────────────────────┘
```

#### Data Points (Exactly These, No More)

| Element | Data Source | Computation |
|---------|-------------|-------------|
| Traffic Light | Worst project health | If any `healthStatus === 'blocked'` → RED; if any `at_risk` → AMBER; else GREEN |
| Headline | Conditional | GREEN: "All systems operational" / AMBER: "{n} projects need attention" / RED: "{n} projects blocked" |
| Projects Active | `projects.length` | Count of projects with tasks updated in last 14 days |
| At Risk | `projects.filter(p => p.healthStatus !== 'on_track').length` | Clickable → opens Director report filtered |
| On Track % | `onTrackCount / totalCount * 100` | Rounded to nearest integer |
| Action Item | Highest priority blocker | Single most critical: oldest blocked task with `priority === 'critical' OR 'highest'` |

#### Visual Treatment

**Traffic Light:**
```tsx
// Container
<div className="flex flex-col items-center justify-center p-8">
  {/* The Light */}
  <div className={`w-20 h-20 rounded-full ${
    status === 'green' ? 'bg-success shadow-[0_0_30px_rgba(0,168,107,0.4)]' :
    status === 'amber' ? 'bg-warning shadow-[0_0_30px_rgba(255,165,0,0.4)]' :
    'bg-danger shadow-[0_0_30px_rgba(230,57,70,0.4)]'
  }`} />
  
  {/* Label */}
  <span className={`mt-3 text-sm font-semibold uppercase tracking-wider ${
    status === 'green' ? 'text-success' :
    status === 'amber' ? 'text-warning' :
    'text-danger'
  }`}>
    {status === 'green' ? 'On Track' : status === 'amber' ? 'Attention' : 'Blocked'}
  </span>
</div>
```

**Stat Cards:**
```tsx
<div className="flex gap-4">
  {stats.map(stat => (
    <div 
      key={stat.label}
      className="flex-1 p-4 bg-neutral-100 rounded-xl text-center"
    >
      <div className="text-3xl font-bold text-neutral-900 tabular-nums">
        {stat.value}
      </div>
      <div className="text-xs text-neutral-500 mt-1">
        {stat.label}
      </div>
    </div>
  ))}
</div>
```

**Action Item (only if exists):**
```tsx
{actionItem && (
  <div className="p-4 bg-danger-50 border border-danger-200 rounded-xl">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="font-medium text-neutral-900 truncate">
          {actionItem.projectName}: {actionItem.title}
        </div>
        <div className="text-sm text-neutral-600 mt-1">
          Owner: {actionItem.assigneeName} · {actionItem.daysBlocked} days blocked
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-neutral-400" />
    </div>
  </div>
)}
```

**Empty State (No Action Needed):**
```tsx
<div className="p-4 bg-success-50 border border-success-200 rounded-xl">
  <div className="flex items-center gap-3">
    <CheckCircle className="w-5 h-5 text-success" />
    <span className="text-neutral-700">No action needed. All projects progressing.</span>
  </div>
</div>
```

#### Interaction Model
- **Traffic light**: Tap → expands to show mini list of problem projects (max 3)
- **At Risk count**: Tap → opens Director Portfolio Report
- **Action item**: Tap → opens project detail in new tab
- **Everything else**: Static, no interaction

#### Mobile Layout
Stack vertically. Traffic light at top (40% of viewport), stats row, action item. Same data, same density.

```tsx
<div className="flex flex-col min-h-screen p-4 pb-safe">
  {/* Traffic Light - 40% */}
  <div className="flex-[0.4] flex items-center justify-center">
    {/* traffic light */}
  </div>
  
  {/* Stats - fixed height */}
  <div className="grid grid-cols-3 gap-3 py-4">
    {/* stat cards */}
  </div>
  
  {/* Action Item - remaining */}
  <div className="flex-1">
    {/* action item */}
  </div>
</div>
```

---

### 2.2 DIRECTOR PORTFOLIO — "The Grid"

**Philosophy:** A Director owns multiple projects. They need to see which ones are healthy and which need intervention — at a glance. Think Stripe's payment status grid.

**Screen budget:** 2 screens max. Grid above fold, escalation list below.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  Portfolio Health                               Week of Feb 10      │
│  8 projects · 3 on track · 4 at risk · 1 blocked                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PROJECT GRID (clickable cards, 2x4 or 3x3 responsive)             │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ ● Mobile v2  │ │ ● Backend    │ │ ● Analytics  │ │ ● Auth     │ │
│  │   72% done   │ │   85% done   │ │   45% done   │ │   Done ✓   │ │
│  │   ⚠ 2 risk   │ │   On Track   │ │   🔴 Blocked │ │            │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │ ● Dashboard  │ │ ● Onboard    │ │ ● Payments   │ │ ● Search   │ │
│  │   60% done   │ │   30% done   │ │   90% done   │ │   15% done │ │
│  │   On Track   │ │   ⚠ Slipping │ │   On Track   │ │   On Track │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ESCALATIONS (sorted by severity × age)                            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Analytics: API integration blocked on vendor response      │ │
│  │    Blocked 5 days · Owner: Mike · 3 tasks dependent          │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ ⚠️ Mobile v2: Design review overdue by 2 days                 │ │
│  │    Owner: Sarah · Blocking 2 engineers                       │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ ⚠️ Onboarding: Sprint scope increased 40% mid-sprint          │ │
│  │    Added: 8 tasks · Original: 20 tasks                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### Project Card Component

```tsx
interface ProjectCardProps {
  project: {
    name: string;
    completionRate: number;
    healthStatus: 'on_track' | 'at_risk' | 'blocked';
    taskCount: number;
    blockedCount: number;
    overdueCount: number;
  };
}

function ProjectCard({ project }: ProjectCardProps) {
  const statusConfig = {
    on_track: { 
      dot: 'bg-success', 
      label: 'On Track', 
      labelClass: 'text-success',
      border: 'border-transparent hover:border-neutral-300'
    },
    at_risk: { 
      dot: 'bg-warning', 
      label: `${project.overdueCount} at risk`,
      labelClass: 'text-warning',
      border: 'border-warning/30 hover:border-warning'
    },
    blocked: { 
      dot: 'bg-danger', 
      label: 'Blocked',
      labelClass: 'text-danger',
      border: 'border-danger/30 hover:border-danger'
    },
  };
  
  const config = statusConfig[project.healthStatus];
  
  return (
    <div className={`p-4 bg-white rounded-xl border-2 ${config.border} cursor-pointer transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
        <span className="font-semibold text-neutral-900 truncate text-sm">
          {project.name}
        </span>
      </div>
      
      {/* Progress */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-neutral-500 mb-1">
          <span>{project.completionRate}% complete</span>
          <span>{project.taskCount} tasks</span>
        </div>
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              project.healthStatus === 'blocked' ? 'bg-danger' :
              project.healthStatus === 'at_risk' ? 'bg-warning' : 'bg-success'
            }`}
            style={{ width: `${project.completionRate}%` }}
          />
        </div>
      </div>
      
      {/* Status */}
      <div className={`text-xs font-medium ${config.labelClass}`}>
        {config.label}
      </div>
    </div>
  );
}
```

#### Escalation Row Component

```tsx
function EscalationRow({ item }: { item: Escalation }) {
  const severityConfig = {
    blocked: { icon: XCircle, bg: 'bg-danger-50', border: 'border-danger-200', iconColor: 'text-danger' },
    at_risk: { icon: AlertTriangle, bg: 'bg-warning-50', border: 'border-warning-200', iconColor: 'text-warning' },
  };
  
  const config = severityConfig[item.severity];
  const Icon = config.icon;
  
  return (
    <div className={`p-4 ${config.bg} border ${config.border} rounded-lg`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-neutral-900">
            {item.projectName}: {item.title}
          </div>
          <div className="text-sm text-neutral-600 mt-1">
            {item.severity === 'blocked' 
              ? `Blocked ${item.daysBlocked} days · Owner: ${item.owner} · ${item.dependentTasks} tasks dependent`
              : `Owner: ${item.owner} · ${item.impact}`
            }
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
      </div>
    </div>
  );
}
```

#### Data Points

| Element | Data Source | Notes |
|---------|-------------|-------|
| Project cards | `projects[]` | Sorted: blocked first, then at_risk, then on_track |
| Completion % | `project.completionRate` | `doneCount / totalCount * 100` |
| Health status | `project.healthStatus` | From API computed field |
| Escalations | Computed | Tasks where `status === 'blocked'` OR `dueDate < today && status !== 'done'` |
| Days blocked | `daysSince(task.updatedAt)` where status changed to blocked | Track status change time |
| Dependent tasks | `tasks.filter(t => t.parentId === blockedTask.id || t.metadata?.blockedBy === blockedTask.id)` | Count children + linked issues |

#### Interaction
- **Project card**: Click → opens PM Report for that project
- **Escalation row**: Click → opens task detail / project detail page
- **Header counts**: Static summary, no interaction

---

### 2.3 PM COCKPIT — "The Sprint Controller"

**Philosophy:** PMs live in the weeds. They need sprint health, blockers with context, and completion velocity. This is their war room.

**Screen budget:** 3 screens. Sprint snapshot (screen 1), blockers (screen 2), burndown trend (screen 3).

#### Layout — Screen 1: Sprint Snapshot

```
┌─────────────────────────────────────────────────────────────────────┐
│  Mobile App v2 — Sprint 14                              Feb 5-19    │
│  ────────────────────────────────────────────────────────────────── │
│                                                                     │
│  SPRINT HEALTH                                                      │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │  ████████████████████░░░░░░░░░░░░░  62% Complete               ││
│  │  ────────────────────────────────────────────────────────────  ││
│  │  Day 7 of 14 · Expected: 50% · Status: On Track               ││
│  └────────────────────────────────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │     28      │ │     12      │ │      2      │ │      4      │  │
│  │   Total     │ │    Done     │ │   Blocked   │ │   Overdue   │  │
│  │   Tasks     │ │    (43%)    │ │             │ │             │  │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘  │
│                                                                     │
│  TODAY'S FOCUS (tasks due today or overdue, sorted by priority)    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ● MOBV2-142  API error handling           Sarah   Due Today   │ │
│  │ ● MOBV2-138  Push notification setup      Mike    Overdue 2d  │ │
│  │ ● MOBV2-145  Unit tests for auth flow     —       Due Today   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [↓ 2 Blockers Need Attention]                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### Layout — Screen 2: Blockers (Expandable)

```
┌─────────────────────────────────────────────────────────────────────┐
│  BLOCKERS (2)                                                       │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔴 MOBV2-128  Payment SDK integration                         │ │
│  │    ──────────────────────────────────────────────────────     │ │
│  │    Blocked: Waiting on Stripe webhook config from DevOps      │ │
│  │    Owner: Mike Chen · Blocked 3 days                          │ │
│  │    Impact: Blocking MOBV2-130, MOBV2-131, MOBV2-132           │ │
│  │    [Escalate] [Add Comment] [View in Jira →]                  │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ 🔴 MOBV2-135  Design system tokens                            │ │
│  │    ──────────────────────────────────────────────────────     │ │
│  │    Blocked: Waiting on design review from Sarah               │ │
│  │    Owner: Alex Kim · Blocked 1 day                            │ │
│  │    Impact: Blocking MOBV2-140, MOBV2-141                      │ │
│  │    [Escalate] [Add Comment] [View in Jira →]                  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  AT RISK (4 tasks overdue or slipping)                             │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ MOBV2-138  Push notifications   Mike    2 days overdue        │ │
│  │ MOBV2-142  Error handling       Sarah   Due today             │ │
│  │ MOBV2-147  Analytics events     —       Due tomorrow, not started│
│  │ MOBV2-150  Accessibility audit  Alex    Due in 2d, 0% done    │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### Sprint Health Bar Component

```tsx
function SprintHealthBar({ 
  completionRate, 
  dayOfSprint, 
  sprintLength,
  healthStatus 
}: SprintHealthProps) {
  const expectedProgress = (dayOfSprint / sprintLength) * 100;
  const delta = completionRate - expectedProgress;
  
  const statusText = 
    delta >= 10 ? 'Ahead of schedule' :
    delta >= -10 ? 'On track' :
    delta >= -20 ? 'Slightly behind' : 'At risk';
    
  const statusColor =
    delta >= -10 ? 'text-success' :
    delta >= -20 ? 'text-warning' : 'text-danger';
  
  return (
    <div className="p-4 bg-neutral-100 rounded-xl">
      {/* Progress bar */}
      <div className="relative h-3 bg-neutral-300 rounded-full overflow-hidden mb-3">
        {/* Actual progress */}
        <div 
          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
            healthStatus === 'blocked' ? 'bg-danger' :
            healthStatus === 'at_risk' ? 'bg-warning' : 'bg-success'
          }`}
          style={{ width: `${completionRate}%` }}
        />
        {/* Expected marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-neutral-900"
          style={{ left: `${expectedProgress}%` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-sm">
        <span className="font-semibold text-neutral-900">
          {completionRate}% Complete
        </span>
        <span className={`font-medium ${statusColor}`}>
          Day {dayOfSprint} of {sprintLength} · Expected: {Math.round(expectedProgress)}% · {statusText}
        </span>
      </div>
    </div>
  );
}
```

#### Today's Focus Row Component

```tsx
function TodaysFocusRow({ task }: { task: Task }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  
  return (
    <div className="flex items-center gap-4 py-2.5 px-3 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors">
      {/* Status dot */}
      <span className={`w-2 h-2 rounded-full ${
        task.status === 'blocked' ? 'bg-danger' :
        task.status === 'in_progress' ? 'bg-primary' : 'bg-neutral-400'
      }`} />
      
      {/* Ticket key */}
      <span className="text-xs font-mono text-primary bg-primary-50 px-1.5 py-0.5 rounded">
        {getTicketKey(task)}
      </span>
      
      {/* Title */}
      <span className="flex-1 text-sm text-neutral-800 truncate">
        {task.title}
      </span>
      
      {/* Assignee */}
      <span className="text-xs text-neutral-500 w-20 truncate text-right">
        {task.assigneeName || '—'}
      </span>
      
      {/* Due date */}
      <span className={`text-xs font-medium w-24 text-right ${
        isOverdue ? 'text-danger' : 'text-neutral-600'
      }`}>
        {isOverdue 
          ? `Overdue ${daysSince(task.dueDate)}d`
          : task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()
            ? 'Due Today'
            : formatDate(task.dueDate)
        }
      </span>
    </div>
  );
}
```

#### Data Points

| Element | Source | Computation |
|---------|--------|-------------|
| Sprint dates | Project metadata | Need to add sprint tracking or infer from task dates |
| Completion % | Tasks | `tasks.filter(t => t.status === 'done').length / tasks.length * 100` |
| Expected % | Date math | `(today - sprintStart) / (sprintEnd - sprintStart) * 100` |
| Blocked count | Tasks | `tasks.filter(t => t.status === 'blocked').length` |
| Overdue count | Tasks | `tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'done').length` |
| Today's focus | Tasks | `tasks.filter(t => t.dueDate === today OR (t.dueDate < today && t.status !== 'done'))` sorted by priority |
| Blocker impact | Task relationships | Count tasks with `parentId === blockedTask.id` or linked via metadata |

---

### 2.4 ENG LEAD DASHBOARD — "The Team Radar"

**Philosophy:** Eng leads care about people and flow. Who's overloaded? Who's blocked? Where's work piling up? This is about team health, not task status.

**Screen budget:** 3 screens. Team distribution (screen 1), blocked work (screen 2), completion trend (screen 3).

#### Layout — Screen 1: Team Distribution

```
┌─────────────────────────────────────────────────────────────────────┐
│  Engineering — Week of Feb 10                                       │
│  12 engineers · 47 active tasks · 3 blocked                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  WORKLOAD DISTRIBUTION                                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Sarah Chen      ████████████████░░░░  8 tasks  ⚠️ Heavy       │ │
│  │ Mike Johnson    ████████████░░░░░░░░  6 tasks  ✓ Normal       │ │
│  │ Alex Kim        ████████████░░░░░░░░  6 tasks  ✓ Normal       │ │
│  │ Jordan Lee      ████████░░░░░░░░░░░░  4 tasks  ✓ Normal       │ │
│  │ Taylor Park     █████████████████░░░  9 tasks  🔴 Overloaded  │ │
│  │ Casey Morgan    ████░░░░░░░░░░░░░░░░  2 tasks  Light          │ │
│  │ — Unassigned    ██████████████░░░░░░  7 tasks  ⚠️ Needs owner │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  WHO NEEDS HELP (blocked or struggling)                            │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔴 Taylor Park — 2 tasks blocked, 1 overdue                    │ │
│  │    MOBV2-128: Waiting on DevOps for webhook config (3 days)   │ │
│  │    [Reassign] [Pair With] [Message →]                         │ │
│  ├───────────────────────────────────────────────────────────────┤ │
│  │ ⚠️ Sarah Chen — All tasks in progress, none completing         │ │
│  │    Last completion: 4 days ago · WIP: 4 tasks                 │ │
│  │    [Check In] [Review Tasks →]                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

#### Workload Row Component

```tsx
function WorkloadRow({ person }: { person: PersonWorkload }) {
  const maxTasks = 10; // Baseline for "full" workload
  const fillPercent = Math.min((person.taskCount / maxTasks) * 100, 100);
  
  const status = 
    person.taskCount === 0 ? { label: 'Idle', className: 'text-neutral-400' } :
    person.taskCount <= 3 ? { label: 'Light', className: 'text-neutral-500' } :
    person.taskCount <= 6 ? { label: 'Normal', className: 'text-success' } :
    person.taskCount <= 8 ? { label: 'Heavy', className: 'text-warning' } :
    { label: 'Overloaded', className: 'text-danger' };
  
  const barColor = 
    person.blockedCount > 0 ? 'bg-danger' :
    person.taskCount > 8 ? 'bg-danger' :
    person.taskCount > 6 ? 'bg-warning' : 'bg-primary';
  
  return (
    <div className="flex items-center gap-4 py-2">
      {/* Name */}
      <span className="w-32 text-sm font-medium text-neutral-900 truncate">
        {person.name || '— Unassigned'}
      </span>
      
      {/* Bar */}
      <div className="flex-1 h-3 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
      
      {/* Count */}
      <span className="w-16 text-sm text-neutral-600 tabular-nums">
        {person.taskCount} tasks
      </span>
      
      {/* Status */}
      <span className={`w-20 text-xs font-medium ${status.className}`}>
        {person.blockedCount > 0 && '🔴 '}{status.label}
      </span>
    </div>
  );
}
```

#### Data Points

| Element | Source | Computation |
|---------|--------|-------------|
| Engineer list | `tasks.assigneeName` | `groupBy(tasks, 'assigneeName')` |
| Task count | Tasks | Count per assignee where `status !== 'done'` |
| Blocked count | Tasks | Per assignee where `status === 'blocked'` |
| Overloaded flag | Heuristic | `taskCount > 8` OR `blockedCount > 1` |
| Struggling flag | Heuristic | `inProgressCount > 3` AND `completedLast7Days === 0` |
| Unassigned | Tasks | `tasks.filter(t => !t.assigneeName && t.status !== 'done')` |

---

### 2.5 MY WORK — IC Personal Dashboard

**Philosophy:** ICs don't need dashboards. They need a task list that answers: "What should I do next?" Brutally simple.

**Screen budget:** 1 screen. Their tasks. That's it.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  My Work                                                   Feb 11   │
│  ────────────────────────────────────────────────────────────────── │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  📬 You have 6 tasks · 1 blocked · 2 due today                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  DUE TODAY (2)                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ● MOBV2-142  API error handling for payments     ⚡ Critical  │ │
│  │ ● MOBV2-145  Unit tests for auth flow            → Medium     │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  BLOCKED (1) — needs attention                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 🔴 MOBV2-128  Payment SDK integration                         │ │
│  │    Waiting on: DevOps webhook config                          │ │
│  │    [Add Update] [Request Help →]                              │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  IN PROGRESS (2)                                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ○ MOBV2-150  Accessibility audit          Due Feb 13  → Med   │ │
│  │ ○ MOBV2-152  Performance optimization     Due Feb 15  → Low   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  UP NEXT (1)                                                        │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ○ MOBV2-160  Documentation updates        Due Feb 18  → Low   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ✓ Completed this week: 4 tasks                      [View All →]  │
└─────────────────────────────────────────────────────────────────────┘
```

#### Summary Banner Component

```tsx
function MySummaryBanner({ tasks }: { tasks: Task[] }) {
  const blocked = tasks.filter(t => t.status === 'blocked').length;
  const dueToday = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate).toDateString() === new Date().toDateString() &&
    t.status !== 'done'
  ).length;
  const total = tasks.filter(t => t.status !== 'done').length;
  
  const urgency = blocked > 0 ? 'danger' : dueToday > 0 ? 'warning' : 'neutral';
  const bgClass = urgency === 'danger' ? 'bg-danger-50 border-danger-200' :
                  urgency === 'warning' ? 'bg-warning-50 border-warning-200' :
                  'bg-neutral-100 border-neutral-200';
  
  return (
    <div className={`p-4 rounded-xl border ${bgClass}`}>
      <span className="text-sm text-neutral-700">
        📬 You have <strong>{total} tasks</strong>
        {blocked > 0 && <> · <span className="text-danger font-medium">{blocked} blocked</span></>}
        {dueToday > 0 && <> · <span className="text-warning font-medium">{dueToday} due today</span></>}
      </span>
    </div>
  );
}
```

#### Task Row Component (IC version — simpler)

```tsx
function MyTaskRow({ task }: { task: Task }) {
  const priorityConfig = {
    critical: { icon: '⚡', label: 'Critical', className: 'text-danger' },
    highest: { icon: '⚡', label: 'Highest', className: 'text-danger' },
    high: { icon: '↑', label: 'High', className: 'text-warning' },
    medium: { icon: '→', label: 'Medium', className: 'text-neutral-600' },
    low: { icon: '↓', label: 'Low', className: 'text-neutral-400' },
    lowest: { icon: '↓', label: 'Lowest', className: 'text-neutral-400' },
  };
  
  const prio = priorityConfig[task.priority] || priorityConfig.medium;
  
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 hover:bg-neutral-100 rounded-lg cursor-pointer transition-colors">
      {/* Status indicator */}
      <span className={`w-2 h-2 rounded-full ${
        task.status === 'blocked' ? 'bg-danger' :
        task.status === 'in_progress' ? 'bg-primary' :
        task.status === 'in_review' ? 'bg-purple-500' : 'bg-neutral-400'
      }`} />
      
      {/* Ticket */}
      <span className="text-xs font-mono text-primary bg-primary-50 px-1.5 py-0.5 rounded flex-shrink-0">
        {getTicketKey(task)}
      </span>
      
      {/* Title */}
      <span className="flex-1 text-sm text-neutral-800 truncate">
        {task.title}
      </span>
      
      {/* Due date (if exists and not blocked) */}
      {task.dueDate && task.status !== 'blocked' && (
        <span className="text-xs text-neutral-500">
          Due {formatShortDate(task.dueDate)}
        </span>
      )}
      
      {/* Priority */}
      <span className={`text-xs font-medium ${prio.className}`}>
        {prio.icon} {prio.label}
      </span>
    </div>
  );
}
```

#### Data Points

| Element | Source | Filter |
|---------|--------|--------|
| My tasks | Tasks | `tasks.filter(t => t.assigneeName === currentUser.name)` |
| Due today | Date comparison | `dueDate.toDateString() === today.toDateString()` |
| Blocked | Status | `status === 'blocked'` |
| In progress | Status | `status === 'in_progress'` |
| Up next | Status + Priority | `status === 'todo'` sorted by priority desc, dueDate asc |
| Completed this week | Status + Date | `status === 'done' && completedAt >= startOfWeek` |

#### Mobile Layout
This IS the mobile layout. No changes needed. Vertical stack, touch-friendly row heights (44px minimum).

---

### 2.6 CLIENT STATUS — External Stakeholder Report

**Philosophy:** Clients don't care about sprints, velocity, or internal process. They care: "Is my project on track? When will I get the thing?" Clean, professional, no jargon.

**Screen budget:** 1 screen. Milestone progress + any concerns.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  PROJECT STATUS                                                     │
│  ────────────────────────────────────────────────────────────────── │
│  Mobile App v2                                        February 2026 │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                                                               │ │
│  │     ████████████████████████░░░░░░░░░░░  72%                  │ │
│  │                                                               │ │
│  │     Project is ON TRACK for March 15 delivery                 │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  MILESTONES                                                         │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ✓  Phase 1: Core Features              Completed Jan 20       │ │
│  │ ✓  Phase 2: Payment Integration        Completed Feb 5        │ │
│  │ ●  Phase 3: Polish & Testing           In Progress (60%)      │ │
│  │ ○  Phase 4: Launch Preparation         Starts Feb 20          │ │
│  │ ○  Final Delivery                      Target: March 15       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  HIGHLIGHTS THIS PERIOD                                             │
│  • Payment processing fully integrated and tested                  │
│  • Performance optimizations reduced load time by 40%              │
│  • User testing feedback incorporated into design                  │
│                                                                     │
│  ATTENTION ITEMS                                                    │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ ⚠️ Third-party API integration pending vendor response         │ │
│  │    Expected resolution: Feb 14 · No impact on delivery date   │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ──────────────────────────────────────────────────────────────────│
│  Prepared by: Vantage · Last updated: Feb 11, 2026 9:00 AM        │
│  Questions? Contact your project lead: sarah@company.com          │
└─────────────────────────────────────────────────────────────────────┘
```

#### Key Differences from Internal Reports

| Aspect | Internal | Client |
|--------|----------|--------|
| Language | "Sprint 14", "2 blocked", "velocity" | "On track", "in progress", "pending response" |
| Metrics | Task counts, completion % | Milestone progress, delivery date |
| Concerns | "Blocked: waiting on DevOps" | "Pending vendor response, no impact on delivery" |
| Tone | Operational, direct | Professional, reassuring but honest |
| Assignees | Individual names | Not shown (internal detail) |

#### Progress Ring Component

```tsx
function ProjectProgressRing({ percent, status }: { percent: number; status: 'on_track' | 'at_risk' | 'delayed' }) {
  const statusConfig = {
    on_track: { color: 'text-success', label: 'ON TRACK', sublabel: 'for' },
    at_risk: { color: 'text-warning', label: 'ATTENTION NEEDED', sublabel: 'target:' },
    delayed: { color: 'text-danger', label: 'DELAYED', sublabel: 'revised target:' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="flex flex-col items-center py-6">
      {/* Simple bar instead of ring for clarity */}
      <div className="w-full max-w-md">
        <div className="h-4 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              status === 'on_track' ? 'bg-success' :
              status === 'at_risk' ? 'bg-warning' : 'bg-danger'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-2xl font-bold text-neutral-900">{percent}%</span>
          <span className={`font-semibold ${config.color}`}>{config.label}</span>
        </div>
      </div>
    </div>
  );
}
```

#### Milestone Row Component

```tsx
function MilestoneRow({ milestone }: { milestone: Milestone }) {
  return (
    <div className="flex items-center gap-3 py-3">
      {/* Status icon */}
      <span className="flex-shrink-0">
        {milestone.status === 'completed' ? (
          <CheckCircle className="w-5 h-5 text-success" />
        ) : milestone.status === 'in_progress' ? (
          <div className="w-5 h-5 rounded-full border-2 border-primary bg-primary/20" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-neutral-300" />
        )}
      </span>
      
      {/* Title */}
      <span className={`flex-1 ${
        milestone.status === 'completed' ? 'text-neutral-500' : 'text-neutral-900'
      }`}>
        {milestone.title}
      </span>
      
      {/* Date/status */}
      <span className={`text-sm ${
        milestone.status === 'completed' ? 'text-neutral-400' :
        milestone.status === 'in_progress' ? 'text-primary font-medium' :
        'text-neutral-500'
      }`}>
        {milestone.status === 'completed' 
          ? `Completed ${formatShortDate(milestone.completedAt)}`
          : milestone.status === 'in_progress'
            ? `In Progress (${milestone.progress}%)`
            : `Starts ${formatShortDate(milestone.startDate)}`
        }
      </span>
    </div>
  );
}
```

#### Data Mapping

Client reports require data transformation to hide internal details:

```typescript
function transformForClient(project: Project, tasks: Task[]): ClientReport {
  // Group tasks by epic/milestone
  const epics = tasks.filter(t => t.taskType === 'epic');
  const milestones = epics.map(epic => {
    const children = tasks.filter(t => t.parentId === epic.id);
    const done = children.filter(t => t.status === 'done').length;
    const total = children.length;
    
    return {
      title: sanitizeTitle(epic.title), // Remove internal prefixes
      status: done === total ? 'completed' : 
              children.some(t => t.status === 'in_progress') ? 'in_progress' : 'upcoming',
      progress: Math.round((done / total) * 100),
      completedAt: epic.completedAt,
      startDate: epic.startDate,
    };
  });
  
  // Translate blockers to "attention items"
  const blockers = tasks.filter(t => t.status === 'blocked');
  const attentionItems = blockers.map(b => ({
    title: translateBlockerForClient(b), // "Waiting on vendor response" not "DevOps hasn't configured webhook"
    resolution: estimateResolution(b),
    impact: assessDeliveryImpact(b, project.targetDate),
  }));
  
  return {
    projectName: project.name,
    overallProgress: project.completionRate,
    status: determineClientStatus(project),
    targetDate: project.targetDate,
    milestones,
    highlights: generateHighlights(tasks), // AI-generated from recent completions
    attentionItems,
  };
}
```

---

## 3. Shared Components

### 3.1 Traffic Light Indicator

Used in: CEO Pulse, Project Cards

```tsx
interface TrafficLightProps {
  status: 'green' | 'amber' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-20 h-20'
};

function TrafficLight({ status, size = 'md' }: TrafficLightProps) {
  const colorClass = 
    status === 'green' ? 'bg-success shadow-[0_0_12px_rgba(0,168,107,0.4)]' :
    status === 'amber' ? 'bg-warning shadow-[0_0_12px_rgba(255,165,0,0.4)]' :
    'bg-danger shadow-[0_0_12px_rgba(230,57,70,0.4)]';
    
  return (
    <div className={`rounded-full ${sizeConfig[size]} ${colorClass}`} />
  );
}
```

### 3.2 Stat Card

Used in: CEO Pulse, PM Cockpit, Eng Lead Dashboard

```tsx
interface StatCardProps {
  value: number | string;
  label: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
  onClick?: () => void;
  highlight?: 'danger' | 'warning' | 'success' | 'neutral';
}

function StatCard({ value, label, trend, trendValue, onClick, highlight = 'neutral' }: StatCardProps) {
  const highlightClass = {
    danger: 'bg-danger-50 border-danger-200',
    warning: 'bg-warning-50 border-warning-200',
    success: 'bg-success-50 border-success-200',
    neutral: 'bg-neutral-100 border-transparent',
  };
  
  return (
    <div 
      className={`p-4 rounded-xl border ${highlightClass[highlight]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="text-3xl font-bold text-neutral-900 tabular-nums">
        {value}
      </div>
      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
        {label}
        {trend && (
          <span className={`flex items-center ${
            trend === 'up' ? 'text-success' :
            trend === 'down' ? 'text-danger' : 'text-neutral-400'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> :
             trend === 'down' ? <TrendingDown size={12} /> :
             <Minus size={12} />}
            {trendValue && <span className="ml-0.5">{trendValue}</span>}
          </span>
        )}
      </div>
    </div>
  );
}
```

### 3.3 Progress Bar

Used in: All reports

```tsx
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'auto';
  showLabel?: boolean;
}

function ProgressBar({ value, max = 100, size = 'md', color = 'auto', showLabel = false }: ProgressBarProps) {
  const percent = Math.round((value / max) * 100);
  
  const autoColor = 
    percent >= 80 ? 'bg-success' :
    percent >= 50 ? 'bg-primary' :
    percent >= 25 ? 'bg-warning' : 'bg-danger';
    
  const colorClass = color === 'auto' ? autoColor : `bg-${color}`;
  
  const sizeClass = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };
  
  return (
    <div className="w-full">
      <div className={`bg-neutral-200 rounded-full overflow-hidden ${sizeClass[size]}`}>
        <div 
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-neutral-500 mt-1">{percent}%</span>
      )}
    </div>
  );
}
```

### 3.4 Empty State — No Issues

Used when there are no blockers/risks/issues to show.

```tsx
function AllClearState({ message = "No issues to report" }: { message?: string }) {
  return (
    <div className="p-6 bg-success-50 border border-success-200 rounded-xl text-center">
      <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
      <p className="text-neutral-700">{message}</p>
    </div>
  );
}
```

### 3.5 Report Header

```tsx
interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  date: Date;
  actions?: React.ReactNode;
}

function ReportHeader({ title, subtitle, date, actions }: ReportHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-400">
          {formatDate(date)}
        </span>
        {actions}
      </div>
    </div>
  );
}
```

---

## 4. Information Architecture

### 4.1 URL Structure

```
/reports                          # Report Hub (list of available reports)
/reports/ceo-pulse               # CEO Traffic Light
/reports/portfolio               # Director Portfolio Grid
/reports/sprint/[projectId]      # PM Cockpit for specific project
/reports/team                    # Eng Lead Team Radar
/reports/my-work                 # IC Personal Dashboard
/reports/client/[shareToken]     # Client-facing (public with token)

/reports/schedule                # Manage delivery schedules
/reports/history                 # Past generated reports
```

### 4.2 Report Hub Navigation

```
┌─────────────────────────────────────────────────────────────────────┐
│  Reports                                                            │
│  ────────────────────────────────────────────────────────────────── │
│                                                                     │
│  FOR YOU                                                            │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ 📊 My Work       │ │ 🎯 Sprint Health │ │ 👥 Team Radar    │    │
│  │ Your tasks       │ │ Project status   │ │ Workload view    │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                     │
│  LEADERSHIP                                                         │
│  ┌──────────────────┐ ┌──────────────────┐                         │
│  │ 🚦 CEO Pulse     │ │ 📈 Portfolio     │                         │
│  │ Executive view   │ │ All projects     │                         │
│  └──────────────────┘ └──────────────────┘                         │
│                                                                     │
│  EXTERNAL                                                           │
│  ┌──────────────────┐                                              │
│  │ 🔗 Client Status │                                              │
│  │ Shareable report │                                              │
│  └──────────────────┘                                              │
│                                                                     │
│  SCHEDULED DELIVERIES                                               │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ CEO Pulse      → exec@company.com      Daily 9:00 AM         │ │
│  │ Team Update    → #engineering          Weekly Monday 9:00 AM │ │
│  │ Client Status  → client@acme.com       Weekly Friday 5:00 PM │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Access Control

| Report | Default Access | Shareable |
|--------|---------------|-----------|
| CEO Pulse | Admin, Owner roles | No |
| Portfolio | Admin, Owner, Manager roles | No |
| PM Cockpit | Project members | No |
| Eng Lead | Project members with lead role | No |
| My Work | Authenticated user (own data only) | No |
| Client Status | Public with signed token | Yes (expiring links) |

---

## 5. Delivery Specifications

### 5.1 Email Digest Format

**CEO Pulse Email:**
```html
Subject: 🚦 Portfolio Status — All Systems Operational

[Company Logo]

──────────────────────────────────────

     ● ON TRACK

12 Projects Active · 87% On Track · 3 Need Attention

──────────────────────────────────────

⚠️ ACTION: Mobile App v2 blocked on API review
   Owner: Sarah Chen · 3 days blocked
   [View Details →]

──────────────────────────────────────

View full report: [link]
Unsubscribe: [link]
```

**Key email design principles:**
- Plain HTML, no complex layouts (email clients are garbage)
- Traffic light as large colored circle (inline CSS, not image)
- Single CTA button
- Mobile-width optimized (600px max)
- Dark mode email support via `@media (prefers-color-scheme: dark)`

### 5.2 Slack Message Format

**CEO Pulse Slack:**
```
🚦 *Portfolio Status* — All Systems Operational

*12* projects active · *87%* on track · *3* need attention

⚠️ *ACTION:* Mobile App v2 blocked on API review
_Owner: Sarah Chen · 3 days blocked_

<View Report|https://app.vantage.com/reports/ceo-pulse>
```

**Slack formatting:**
- Use Slack Block Kit for rich formatting
- Keep under 3000 characters
- Include action buttons for common actions
- Use emoji sparingly but consistently

### 5.3 Scheduling Options

| Schedule | Use Case |
|----------|----------|
| Daily (time) | CEO Pulse, My Work |
| Weekly (day + time) | Portfolio, Client Status |
| Sprint end | PM Cockpit |
| On demand | All |
| On status change | Alert when project health changes |

### 5.4 Schedule Configuration UI

```tsx
interface ReportSchedule {
  reportType: string;
  frequency: 'daily' | 'weekly' | 'sprint_end' | 'on_change';
  time?: string;           // HH:MM in user's timezone
  dayOfWeek?: number;      // 0-6 for weekly
  recipients: {
    email?: string[];
    slack?: string[];      // channel IDs
    inApp?: boolean;
  };
  filters?: {
    projectIds?: string[];
    minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  };
}
```

---

## 6. Priority & Build Order

### Phase 1: Core Reports (Week 1-2)

| Priority | Report | Effort | Rationale |
|----------|--------|--------|-----------|
| P0 | My Work (IC) | 3 days | Highest frequency, simplest data |
| P0 | CEO Pulse | 2 days | Highest visibility, simplest layout |
| P1 | PM Cockpit | 4 days | Core PM workflow |

### Phase 2: Extended Reports (Week 3-4)

| Priority | Report | Effort | Rationale |
|----------|--------|--------|-----------|
| P1 | Director Portfolio | 3 days | Leadership visibility |
| P1 | Eng Lead Dashboard | 3 days | Team management |
| P2 | Client Status | 3 days | External sharing |

### Phase 3: Delivery System (Week 5-6)

| Priority | Feature | Effort | Rationale |
|----------|---------|--------|-----------|
| P1 | Email delivery | 3 days | Most requested |
| P1 | Slack integration | 2 days | Team workflow |
| P2 | Scheduling engine | 4 days | Automation |
| P2 | Share links (client) | 2 days | External access |

### Phase 4: Polish (Week 7-8)

| Priority | Feature | Effort | Rationale |
|----------|---------|--------|-----------|
| P2 | Mobile optimization | 3 days | CEO/IC on-the-go |
| P2 | Report history | 2 days | Audit trail |
| P3 | Custom reports | 5 days | Power users |

---

## 7. Technical Implementation Notes

### 7.1 Data Layer

Reports should query the existing data layer, not duplicate it:

```typescript
// API endpoint structure
GET /api/reports/ceo-pulse
GET /api/reports/portfolio
GET /api/reports/sprint/:projectId
GET /api/reports/team
GET /api/reports/my-work
GET /api/reports/client/:projectId (with share token)

// Response shape (CEO Pulse example)
interface CEOPulseResponse {
  generatedAt: string;
  status: 'green' | 'amber' | 'red';
  headline: string;
  stats: {
    activeProjects: number;
    atRiskCount: number;
    onTrackPercent: number;
  };
  actionItem: {
    projectName: string;
    title: string;
    assigneeName: string;
    daysBlocked: number;
    url: string;
  } | null;
}
```

### 7.2 Caching Strategy

| Report | Cache TTL | Invalidation |
|--------|-----------|--------------|
| CEO Pulse | 5 minutes | On sync complete |
| Portfolio | 5 minutes | On sync complete |
| PM Cockpit | 1 minute | On task update |
| Eng Lead | 5 minutes | On sync complete |
| My Work | No cache | Real-time |
| Client Status | 15 minutes | On sync complete |

### 7.3 Dark Mode Implementation

All colors use CSS variables. Example enforcement:

```tsx
// ❌ WRONG - hardcoded color
<div className="bg-[#E6F2FF]">

// ✅ RIGHT - CSS variable via Tailwind
<div className="bg-primary-50">

// ❌ WRONG - dark: prefix (doesn't work with our system)
<div className="bg-white dark:bg-neutral-800">

// ✅ RIGHT - single class, CSS handles the swap
<div className="bg-white"> // globals.css overrides this in dark mode
```

---

## 8. Open Questions

### 8.1 Data Questions

1. **Sprint tracking**: Do we have sprint metadata (start/end dates, sprint number) in the API? If not, PM Cockpit needs to infer from task dates.

2. **Blocker reasons**: Do we sync blocker reason text from Jira? Needed for PM Cockpit and Eng Lead dashboard.

3. **Completion timestamps**: Do we track `completedAt` for tasks? Needed for velocity calculations.

4. **User roles**: How do we determine if someone is a lead vs. IC? Needed for access control and default views.

### 8.2 Product Questions

1. **Milestone definition**: How do clients define milestones? Are they always epics, or do we need a separate milestone entity?

2. **AI highlights**: Should we use AI to generate "highlights this period" for client reports? What model/approach?

3. **Historical comparison**: Do reports need week-over-week or sprint-over-sprint comparisons?

4. **Custom reports**: Future scope — should users be able to build custom report layouts?

---

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Report generation time | < 2 seconds | P95 latency |
| Email delivery rate | > 98% | Delivery success |
| Report open rate | > 60% | Email/Slack analytics |
| Time to consume (CEO) | < 30 seconds | User research |
| Time to consume (PM) | < 90 seconds | User research |
| NPS for reporting | > 40 | In-app survey |

---

## 10. Appendix: Glance Test Verification

For each report, verify it passes the Glance Test:

| Report | "Are we OK?" | "What's the one thing?" | "Do I need to act?" |
|--------|--------------|------------------------|---------------------|
| CEO Pulse | Traffic light (green/amber/red) | Status headline | Action item box (or "All clear") |
| Portfolio | Grid coloring (green/amber/red cards) | Escalation count in header | Escalation list |
| PM Cockpit | Sprint health bar + status text | Blocker count badge | Blocker section |
| Eng Lead | Team summary stats | "Who needs help" section | Help badges on rows |
| My Work | Summary banner color | Blocked/due today counts | Blocked section |
| Client Status | Progress bar + status label | Delivery date | Attention items box |

---

*This PRD is ready for engineering review. The bar is Linear/Stripe quality. Ship it right or don't ship it.*
