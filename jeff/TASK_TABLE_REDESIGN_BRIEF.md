# Task Table Redesign Brief
**For:** Jeff (SVP Product) + Emmy (Principal Engineer)  
**Date:** February 11, 2026  
**Priority:** P0 — CEO flagged this as unreadable  

---

## The Problem (CEO Feedback)

The CEO looked at the task table in dark mode and said: **"Things are fairly unreadable, specifically the ticket numbers."**

This is not a new issue — we've attempted to fix dark mode readability multiple times. The CSS variable bump (neutral-400 → #8b949e) helped general text, but the **ticket number badges and overall task table row design** remain problematic.

---

## What the CEO Sees (Dark Mode)

The task table displays rows with these columns:
- **TICKET** — e.g. `MOBV2-14`, `MOBV2-10`, `MOBV2-6` (monospace badge)
- **TITLE** — task name text
- **STATUS** — colored badge (In Progress, To Do, Done)
- **ASSIGNEE** — person's name
- **DUE DATE** — date, sometimes red when overdue
- **PRIORITY** — colored badge (Critical, High, Medium)
- **TYPE** — Epic, Bug, Story

The table also has **hierarchical rows** — epics with indented child tasks showing `↳` arrows.

### What's Broken

1. **Ticket number badges** are nearly invisible — they use `bg-neutral-100 text-neutral-700 border-neutral-200` which in dark mode becomes a dark pill (`#151b23` bg) with light-ish text (`#c9d1d9`) on a dark row background (`#0d1117`). The badge barely distinguishes from the row.

2. **The overall table density** makes it hard to scan — rows blend together.

3. **Visual hierarchy is weak** — Epic parent rows don't stand out enough from child tasks.

4. **The child indent indicators** (`↳`) use `text-neutral-400` which is now `#8b949e` but still subtle.

---

## Current Code (What Renders Each Row)

### Ticket Key Badge (line 404-409 of page.tsx)
```tsx
<span
  className="text-[11px] font-mono flex-shrink-0 truncate px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 w-auto max-w-24"
  title={getTicketKey(task)}
>
  {getTicketKey(task)}
</span>
```

### Title Text
```tsx
<span className={`text-sm flex-1 truncate ${hasChildren ? "font-semibold text-neutral-900" : "text-neutral-800"}`}>
  {task.title}
</span>
```

### Status Badge
```tsx
<span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium ${cfg.bg} ${cfg.color}`}>
  {cfg.icon} {cfg.label}
</span>
```

### Assignee
```tsx
<span className="text-sm text-neutral-700 truncate max-w-[120px]">
  {task.assigneeName || "—"}
</span>
```

### Due Date  
```tsx
<span className={`text-sm tabular-nums ${isOverdue ? "text-red-600 font-medium" : "text-neutral-600"}`}>
  {task.dueDate ? new Date(task.dueDate).toLocaleDateString(...) : "—"}
</span>
```

### Priority Badge
```tsx
<span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pcfg.bg} ${pcfg.color}`}>
  {task.priority}
</span>
```

### Type Badge
```tsx
<span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
  {task.taskType}
</span>
```

### Row Container
```tsx
<tr
  className="group cursor-pointer hover:bg-neutral-50 transition-colors"
  onClick={() => onSelectTask(task)}
>
```

### Epic Parent Row (has children)
Same as above but title uses `font-semibold text-neutral-900` and has a progress bar and count.

---

## Dark Mode Color Mapping (Critical Context)

The app uses CSS variable inversion. In dark mode:

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `neutral-50` | `#F9FAFB` | `#0d1117` | Page background |
| `neutral-100` | `#F3F4F6` | `#151b23` | Badge/card backgrounds |
| `neutral-200` | `#E5E7EB` | `#212830` | Borders |
| `neutral-300` | `#D1D5DB` | `#313840` | Strong borders |
| `neutral-400` | `#9CA3AF` | `#8b949e` | Muted text (WCAG AA now) |
| `neutral-500` | `#6B7280` | `#9ca3af` | Secondary text |
| `neutral-600` | `#4B5563` | `#adb5bd` | Body text secondary |
| `neutral-700` | `#374151` | `#c9d1d9` | Body text |
| `neutral-800` | `#1F2937` | `#e0e6eb` | Strong text |
| `neutral-900` | `#111827` | `#f0f3f6` | Headings |
| `bg-white` | `#FFFFFF` | `#151b23` | Card surfaces (via !important) |
| `primary` | `#0066CC` | `#4a9eff` | Brand blue |

**Key insight:** `bg-neutral-100` in dark mode = `#151b23`, and the page/table bg is `#0d1117`. The difference is only ~4 hex values — practically invisible. This is why badges disappear.

---

## Design Requirements

The CEO wants:
1. **Sleek and modern** — Think Linear, Notion, GitHub, Figma task views
2. **Easily ingestible** — A PM should be able to scan 50 tasks in seconds
3. **All needed information visible** — Ticket key, title, status, assignee, due date, priority, type
4. **Works beautifully in BOTH light and dark mode**
5. **Hierarchy is clear** — Epic parents vs child tasks instantly distinguishable
6. **Ticket numbers are prominent** — They're how PMs reference tasks in meetings

---

## Competitive References (What "Sleek" Looks Like)

### Linear
- Clean monochrome with subtle color accents
- Status icons (not text badges) — colored dots/circles
- Priority icons (not text) — bars/dots
- Ticket keys in muted but readable monospace
- Hover reveals actions
- Dense but scannable

### GitHub Issues
- Clean white/dark backgrounds
- Labels as small colored pills
- Strong title text, muted metadata
- Clear hierarchy with tree lines

### Notion Databases
- Clean cells with proper spacing
- Colored select tags
- Assignee avatars (not text)
- Clear column headers

---

## What Jeff Should Deliver

A detailed redesign specification for the task table that includes:

1. **Visual design** — Exact Tailwind classes for every element
2. **Dark mode treatment** — How every element looks in dark mode (using our CSS variable system)
3. **Hierarchy design** — How epic parents and child tasks visually relate
4. **Information density** — What's shown by default vs. on hover vs. hidden
5. **Row interaction patterns** — Hover, selected, expanded states
6. **Responsive behavior** — How the table adapts on smaller screens

Save the redesign to: `jeff/TASK_TABLE_REDESIGN.md`
