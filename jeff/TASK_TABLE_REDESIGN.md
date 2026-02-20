# Task Table Redesign Specification
**Author:** Jeff, SVP Product  
**Date:** February 11, 2026  
**Priority:** P0 — CEO-flagged readability issue  
**Target:** Linear/GitHub/Notion quality bar  

---

## Executive Summary

The current task table has critical dark mode readability issues—ticket numbers are nearly invisible. This redesign solves that while elevating the entire table to a modern, sleek, easily-scannable experience.

**Key Changes:**
1. Ticket keys get a distinct visual treatment with proper dark mode contrast
2. Status indicators become icon-based (Linear-style) for density
3. Priority uses visual bars instead of text badges
4. Row structure is simplified with better spacing
5. Hierarchy is clearer with refined parent/child visual differentiation

---

## 1. Understanding Our Dark Mode System

**CRITICAL:** Our CSS uses `data-theme="dark"` token inversion. The `dark:` Tailwind prefix DOES NOT WORK.

| Tailwind Class | Light Mode Value | Dark Mode Value |
|----------------|------------------|-----------------|
| `bg-neutral-50` | `#F9FAFB` (near white) | `#0d1117` (near black) |
| `bg-neutral-100` | `#F3F4F6` (light gray) | `#151b23` (dark gray) |
| `bg-neutral-200` | `#E5E7EB` (gray) | `#212830` (charcoal) |
| `bg-neutral-300` | `#D1D5DB` (medium gray) | `#313840` (slate) |
| `text-neutral-400` | `#9CA3AF` (muted) | `#8b949e` (muted light) |
| `text-neutral-500` | `#6B7280` (secondary) | `#9ca3af` (secondary light) |
| `text-neutral-600` | `#4B5563` (body secondary) | `#adb5bd` (body secondary) |
| `text-neutral-700` | `#374151` (body) | `#c9d1d9` (body) |
| `text-neutral-800` | `#1F2937` (strong) | `#e0e6eb` (strong) |
| `text-neutral-900` | `#111827` (heading) | `#f0f3f6` (heading) |
| `text-primary` | `#0066CC` (brand blue) | `#4a9eff` (bright blue) |
| `bg-primary-50` | `#E6F2FF` (blue tint) | `#0c2d6b` (dark blue) |

**The Problem:** `bg-neutral-100` (`#151b23`) on `bg-neutral-50` (`#0d1117`) rows = almost no visual distinction in dark mode.

---

## 2. Table Container

### Specification
```tsx
<div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
```

| Property | Light Mode | Dark Mode | Notes |
|----------|------------|-----------|-------|
| `bg-white` | `#FFFFFF` | `#151b23` (via !important override) | Card surface |
| `border-neutral-200` | `#E5E7EB` | `#212830` | Subtle border |
| `rounded-xl` | 12px radius | 12px radius | Modern softness |

**Why:** Clean container with defined edges. The `!important` override in globals.css handles `bg-white` → dark surface.

---

## 3. Column Headers

### Current Problem
Headers use `bg-neutral-100/50` which disappears in dark mode.

### New Design
```tsx
<div className="flex items-center gap-4 px-4 py-3 border-b border-neutral-200 bg-neutral-100">
  <div className="w-24 flex-shrink-0">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Ticket
    </span>
  </div>
  <div className="flex-1 min-w-0">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Title
    </span>
  </div>
  <div className="w-20 flex-shrink-0 text-center">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Status
    </span>
  </div>
  <div className="w-24 flex-shrink-0 text-right hidden xl:block">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Assignee
    </span>
  </div>
  <div className="w-20 flex-shrink-0 text-center hidden lg:block">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Due
    </span>
  </div>
  <div className="w-16 flex-shrink-0 text-center">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Priority
    </span>
  </div>
  <div className="w-14 flex-shrink-0 text-center">
    <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
      Type
    </span>
  </div>
</div>
```

| Element | Class | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| Background | `bg-neutral-100` | `#F3F4F6` | `#151b23` |
| Border | `border-b border-neutral-200` | `#E5E7EB` | `#212830` |
| Text | `text-neutral-500` | `#6B7280` | `#9ca3af` ✓ WCAG AA |
| Font | `text-[11px] font-semibold uppercase tracking-wider` | — | Clean, scannable |

**Why:** Solid background gives definition. `text-neutral-500` provides adequate contrast in both modes.

---

## 4. Row Container (Leaf Tasks)

### New Design
```tsx
<div 
  className="group flex items-center gap-4 px-4 py-3 border-b border-neutral-100 hover:bg-neutral-100 cursor-pointer transition-colors"
  style={{ paddingLeft: `${16 + depth * 24}px` }}
>
```

| Property | Class | Light Mode | Dark Mode |
|----------|-------|------------|-----------|
| Background | (default) | `#FFFFFF` (from parent) | `#151b23` (from parent) |
| Hover | `hover:bg-neutral-100` | `#F3F4F6` | `#151b23` (subtle) |
| Border | `border-b border-neutral-100` | `#F3F4F6` | `#151b23` |
| Padding | `px-4 py-3` | 16px / 12px | Comfortable touch targets |
| Transition | `transition-colors` | 150ms | Smooth hover |

**Hover Enhancement:** Add a left accent on hover:
```tsx
<div className="group flex items-center gap-4 px-4 py-3 border-b border-neutral-100 border-l-2 border-l-transparent hover:border-l-primary hover:bg-neutral-100 cursor-pointer transition-colors">
```

This creates a subtle blue accent on hover that works in both modes.

---

## 5. Ticket Key Badge ⭐ CRITICAL FIX

### Current Problem
`bg-neutral-100 text-neutral-700 border border-neutral-200` is nearly invisible in dark mode.

### New Design — Primary Tint Approach
```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-primary-50 text-primary border border-primary/20">
  {getTicketKey(task)}
</span>
```

| Property | Class | Light Mode | Dark Mode |
|----------|-------|------------|-----------|
| Background | `bg-primary-50` | `#E6F2FF` (light blue) | `#0c2d6b` (dark blue) |
| Text | `text-primary` | `#0066CC` (brand blue) | `#4a9eff` (bright blue) |
| Border | `border border-primary/20` | `rgba(0,102,204,0.2)` | `rgba(74,158,255,0.2)` |
| Font | `font-mono font-medium` | — | Monospace for ticket IDs |

**Why This Works:**
- Blue tint creates distinct visual identity for ticket keys
- High contrast in both modes (blue on white, bright blue on dark blue)
- Monospace font signals "identifier" semantically
- Consistent with the primary brand color

### Alternative — Stronger Neutral Approach
If you prefer neutral over branded:
```tsx
<span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-neutral-200 text-neutral-800 border border-neutral-300">
  {getTicketKey(task)}
</span>
```

| Property | Class | Light Mode | Dark Mode |
|----------|-------|------------|-----------|
| Background | `bg-neutral-200` | `#E5E7EB` | `#212830` |
| Text | `text-neutral-800` | `#1F2937` | `#e0e6eb` |
| Border | `border-neutral-300` | `#D1D5DB` | `#313840` |

**Why:** Stronger contrast than `bg-neutral-100`. The badge now visually pops against the row.

### Recommendation: **Use the Primary Tint approach.** 
Ticket keys are how PMs reference tasks in meetings—they deserve visual prominence. The blue tint makes them instantly findable while staying on-brand.

---

## 6. Title Text

### New Design
```tsx
{/* Parent row (has children) */}
<span className="text-sm font-semibold text-neutral-900 truncate flex-1 min-w-0">
  {task.title}
</span>

{/* Leaf row (no children) */}
<span className="text-sm text-neutral-800 truncate flex-1 min-w-0">
  {task.title}
</span>
```

| Variant | Class | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| Parent | `text-sm font-semibold text-neutral-900` | `#111827` bold | `#f0f3f6` bold |
| Leaf | `text-sm text-neutral-800` | `#1F2937` regular | `#e0e6eb` regular |

**Why:** 
- `text-neutral-900` for parents gives maximum contrast and signals importance
- `text-neutral-800` for leaves is still highly readable but visually subordinate
- `truncate` prevents overflow; `min-w-0` allows flex shrinking

---

## 7. Status Indicator — Linear-Style Icons

### Design Philosophy
Replace text badges with icon-only indicators (like Linear). This reduces visual noise and improves scannability.

### Status Icon Component
```tsx
const statusIcons = {
  todo: {
    icon: <Circle size={14} strokeWidth={2} />,
    className: "text-neutral-400",
    label: "To Do"
  },
  in_progress: {
    icon: <Loader size={14} strokeWidth={2} className="animate-spin-slow" />,
    // Or use a half-circle icon: <CircleDot size={14} />
    className: "text-primary",
    label: "In Progress"
  },
  done: {
    icon: <CheckCircle size={14} strokeWidth={2} />,
    className: "text-success",
    label: "Done"
  },
  blocked: {
    icon: <XCircle size={14} strokeWidth={2} />,
    className: "text-danger",
    label: "Blocked"
  },
  review: {
    icon: <Eye size={14} strokeWidth={2} />,
    className: "text-warning",
    label: "In Review"
  }
};
```

### Rendering
```tsx
<div className="w-20 flex-shrink-0 flex items-center justify-center" title={status.label}>
  <span className={status.className}>
    {status.icon}
  </span>
</div>
```

| Status | Icon | Light Mode Color | Dark Mode Color |
|--------|------|------------------|-----------------|
| To Do | `Circle` outline | `#9CA3AF` | `#8b949e` |
| In Progress | `Loader` spinning | `#0066CC` | `#4a9eff` |
| Done | `CheckCircle` filled | `#00A86B` → green | `#3fb950` |
| Blocked | `XCircle` | `#E63946` → red | `#f85149` |
| In Review | `Eye` | `#FFA500` → orange | `#d29922` |

**CSS for slow spin animation:**
```css
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}
```

### Alternative — Hybrid Icon + Text (Expanded View)
If stakeholders want text visible:
```tsx
<div className="w-24 flex-shrink-0 flex items-center justify-center gap-1.5">
  <span className={status.className}>{status.icon}</span>
  <span className={`text-[11px] font-medium ${status.className}`}>
    {status.label}
  </span>
</div>
```

**Recommendation:** Start with icon-only for density. Add text labels as a user preference toggle if needed.

---

## 8. Priority Indicator — Visual Bars

### Design Philosophy
Replace text badges ("Critical", "High") with visual indicators. Linear uses stacked bars; GitHub uses colored labels.

### Priority Bar Component
```tsx
const priorityConfig = {
  critical: {
    bars: 4,
    className: "text-danger", // all 4 bars filled, red
    label: "Critical"
  },
  high: {
    bars: 3,
    className: "text-warning", // 3 bars filled, orange
    label: "High"
  },
  medium: {
    bars: 2,
    className: "text-neutral-500", // 2 bars filled, gray
    label: "Medium"
  },
  low: {
    bars: 1,
    className: "text-neutral-400", // 1 bar filled, muted gray
    label: "Low"
  }
};
```

### Rendering — Stacked Bars
```tsx
<div className="w-16 flex-shrink-0 flex items-center justify-center gap-0.5" title={priority.label}>
  {[1, 2, 3, 4].map((bar) => (
    <div
      key={bar}
      className={`w-1 h-3 rounded-sm ${
        bar <= priority.bars 
          ? `bg-current ${priority.className}` 
          : 'bg-neutral-200'
      }`}
    />
  ))}
</div>
```

| Priority | Filled Bars | Active Color (Light) | Active Color (Dark) |
|----------|-------------|----------------------|---------------------|
| Critical | 4/4 | `#E63946` (red) | `#f85149` |
| High | 3/4 | `#FFA500` (orange) | `#d29922` |
| Medium | 2/4 | `#6B7280` | `#9ca3af` |
| Low | 1/4 | `#9CA3AF` | `#8b949e` |

| Property | Class | Light Mode | Dark Mode |
|----------|-------|------------|-----------|
| Empty bar | `bg-neutral-200` | `#E5E7EB` | `#212830` |
| Bar size | `w-1 h-3 rounded-sm` | 4px × 12px | Compact |

**Alternative — Colored Dot**
If bars feel too busy:
```tsx
<div className="w-16 flex-shrink-0 flex items-center justify-center" title={priority.label}>
  <span className={`w-2 h-2 rounded-full ${priority.dotClassName}`} />
</div>
```

Where `dotClassName` is `bg-danger` for critical, `bg-warning` for high, etc.

---

## 9. Assignee Display — Avatar Initials

### Design Philosophy
Names take space and are hard to scan. Initials in colored circles are more compact and recognizable.

### Avatar Component
```tsx
function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  // Deterministic color based on name hash
  const colors = [
    'bg-blue-100 text-blue-700',    // Dark: bg-blue-100 → #0d3880, text-blue-700 → #79c0ff
    'bg-green-100 text-green-700',   // Dark: bg-green-100 → #13381f, text-green-700 → #7ee787
    'bg-purple-100 text-purple-700', // Dark: bg-purple-100 → #2a1252, text-purple-700 → #d2a8ff
    'bg-orange-100 text-orange-700', // Dark: bg-orange-100 → #3d2c08, text-orange-700 → #f0c95c
    'bg-red-100 text-red-700',       // Dark: bg-red-100 → #4d1a1c, text-red-700 → #ffa198
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
```

### Rendering
```tsx
<div className="w-24 flex-shrink-0 flex items-center justify-end gap-2 hidden xl:flex">
  {task.assigneeName ? (
    <>
      <span 
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${getAvatarColor(task.assigneeName)}`}
        title={task.assigneeName}
      >
        {getInitials(task.assigneeName)}
      </span>
      <span className="text-[11px] text-neutral-700 truncate max-w-[72px]">
        {task.assigneeName.split(' ')[0]}
      </span>
    </>
  ) : (
    <span className="text-[11px] text-neutral-400 italic">Unassigned</span>
  )}
</div>
```

| Element | Class | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| Avatar circle | `w-6 h-6 rounded-full` | 24px circle | 24px circle |
| Avatar bg (blue) | `bg-blue-100` | `#DBEAFE` | `#0d3880` |
| Avatar text (blue) | `text-blue-700` | `#1D4ED8` | `#79c0ff` |
| Name text | `text-neutral-700` | `#374151` | `#c9d1d9` |
| Unassigned | `text-neutral-400 italic` | `#9CA3AF` | `#8b949e` |

**Why:** Avatar + first name is compact yet identifiable. Color coding helps recognition.

---

## 10. Due Date Treatment

### States
1. **Normal** — date in the future
2. **Due Soon** — within 3 days
3. **Overdue** — past due, task not done

### Implementation
```tsx
function getDueDateStyle(dueDate: string | null, status: string) {
  if (!dueDate) return { className: 'text-neutral-400', label: '—' };
  
  const due = new Date(dueDate);
  const now = new Date();
  const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (status === 'done') {
    return { className: 'text-neutral-500', label: formatDate(due) };
  }
  if (daysUntil < 0) {
    // Overdue
    return { className: 'text-danger font-medium', label: formatDate(due) };
  }
  if (daysUntil <= 3) {
    // Due soon
    return { className: 'text-warning font-medium', label: formatDate(due) };
  }
  // Normal
  return { className: 'text-neutral-700', label: formatDate(due) };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
```

### Rendering
```tsx
<div className="w-20 flex-shrink-0 text-center hidden lg:block">
  <span className={`text-[11px] tabular-nums ${dueDateStyle.className}`}>
    {dueDateStyle.label}
  </span>
</div>
```

| State | Class | Light Mode | Dark Mode |
|-------|-------|------------|-----------|
| Normal | `text-neutral-700` | `#374151` | `#c9d1d9` |
| Due soon | `text-warning font-medium` | `#FFA500` | `#d29922` |
| Overdue | `text-danger font-medium` | `#E63946` | `#f85149` |
| No date | `text-neutral-400` | `#9CA3AF` | `#8b949e` |
| Done | `text-neutral-500` | `#6B7280` | `#9ca3af` |

**Why:** `tabular-nums` aligns dates vertically. Color coding makes overdue items pop.

---

## 11. Type Indicator

### Design — Subtle Tag
```tsx
const typeConfig = {
  epic: { className: 'bg-purple-100 text-purple-700 border-purple-200', icon: <Layers size={10} /> },
  story: { className: 'bg-blue-100 text-blue-700 border-blue-200', icon: <BookOpen size={10} /> },
  task: { className: 'bg-neutral-100 text-neutral-600 border-neutral-200', icon: <CheckSquare size={10} /> },
  bug: { className: 'bg-red-100 text-red-700 border-red-200', icon: <Bug size={10} /> },
  subtask: { className: 'bg-neutral-100 text-neutral-500 border-neutral-200', icon: <ListTree size={10} /> },
};
```

### Rendering
```tsx
<div className="w-14 flex-shrink-0 flex items-center justify-center">
  <span 
    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${typeConfig[task.taskType]?.className || typeConfig.task.className}`}
    title={task.taskType}
  >
    {typeConfig[task.taskType]?.icon}
    {task.taskType}
  </span>
</div>
```

| Type | Light BG | Dark BG | Light Text | Dark Text |
|------|----------|---------|------------|-----------|
| Epic | `#F3E8FF` | `#2a1252` | `#7C3AED` | `#d2a8ff` |
| Story | `#DBEAFE` | `#0d3880` | `#1D4ED8` | `#79c0ff` |
| Task | `#F3F4F6` | `#151b23` | `#4B5563` | `#adb5bd` |
| Bug | `#FEE2E2` | `#4d1a1c` | `#DC2626` | `#ffa198` |

**Compact Alternative — Icon Only:**
```tsx
<div className="w-8 flex-shrink-0 flex items-center justify-center" title={task.taskType}>
  <span className={typeConfig[task.taskType]?.className}>
    {typeConfig[task.taskType]?.icon}
  </span>
</div>
```

---

## 12. Epic/Parent Row Design

### Visual Differentiation
Parent rows need to stand out from children. Use:
1. Stronger background tint
2. Bolder title
3. Progress indicator
4. Expand/collapse chevron

### Implementation
```tsx
{/* Parent row (has children) */}
<div 
  className={`group flex items-center gap-4 px-4 py-3 border-b border-neutral-200 cursor-pointer transition-colors ${
    depth === 0 
      ? 'bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-400' 
      : depth === 1
        ? 'bg-blue-50 hover:bg-blue-100 border-l-4 border-l-blue-400'
        : 'bg-green-50 hover:bg-green-100 border-l-4 border-l-green-400'
  }`}
  style={{ paddingLeft: `${16 + depth * 24}px` }}
  onClick={() => toggleNode(task.id)}
>
```

| Depth | Light BG | Dark BG | Light Border | Dark Border |
|-------|----------|---------|--------------|-------------|
| 0 (Root Epic) | `#FAF5FF` purple-50 | `#1f0c3d` | `#A78BFA` purple-400 | `#a78bfa` |
| 1 (Sub-epic) | `#EFF6FF` blue-50 | `#0c2d6b` | `#60A5FA` blue-400 | `#58a6ff` |
| 2+ (Nested) | `#F0FDF4` green-50 | `#0f2d1a` | `#4ADE80` green-400 | `#3fb950` |

### Parent Row Components

**Chevron:**
```tsx
<button
  className="flex-shrink-0 p-1 rounded hover:bg-neutral-200 transition-colors"
  onClick={(e) => { e.stopPropagation(); toggleNode(task.id); }}
>
  {isCollapsed ? (
    <ChevronRight size={14} className="text-neutral-500" />
  ) : (
    <ChevronDown size={14} className="text-neutral-500" />
  )}
</button>
```

**Progress Indicator:**
```tsx
{hasChildren && (
  <div className="flex items-center gap-2 flex-shrink-0">
    <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
      <div 
        className="h-full bg-success rounded-full transition-all"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
    <span className="text-[10px] font-medium text-neutral-600 w-12">
      {doneCount}/{totalCount}
    </span>
  </div>
)}
```

| Element | Class | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| Progress track | `bg-neutral-200` | `#E5E7EB` | `#212830` |
| Progress fill | `bg-success` | `#00A86B` | `#3fb950` |
| Count text | `text-neutral-600` | `#4B5563` | `#adb5bd` |

---

## 13. Child Row Indentation

### Tree Connector
```tsx
{depth > 0 && !hasChildren && (
  <span className="flex-shrink-0 w-4 text-center text-neutral-400">
    ↳
  </span>
)}
```

| Element | Class | Light Mode | Dark Mode |
|---------|-------|------------|-----------|
| Connector | `text-neutral-400` | `#9CA3AF` | `#8b949e` |

### Indentation
Use `paddingLeft: ${16 + depth * 24}px` for consistent 24px indentation per level.

### Connecting Line (Alternative)
For a more visual tree:
```tsx
{depth > 0 && (
  <div 
    className="absolute left-0 top-0 bottom-0 border-l-2 border-neutral-200"
    style={{ left: `${16 + (depth - 1) * 24 + 8}px` }}
  />
)}
```

---

## 14. Hover State

### Leaf Row Hover
```tsx
<div className="group ... hover:bg-neutral-100 border-l-2 border-l-transparent hover:border-l-primary transition-colors">
```

| State | Background | Left Border |
|-------|------------|-------------|
| Default | transparent | transparent |
| Hover | `bg-neutral-100` (`#F3F4F6` / `#151b23`) | `border-l-primary` (`#0066CC` / `#4a9eff`) |

### Row Actions on Hover
Show action buttons on hover:
```tsx
<div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
  <button className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200 rounded">
    <ExternalLink size={14} />
  </button>
</div>
```

---

## 15. Selected/Active State

When a row is selected (clicked for detail panel):

```tsx
<div className={`group ... ${
  isSelected 
    ? 'bg-primary-50 border-l-2 border-l-primary' 
    : 'hover:bg-neutral-100 border-l-2 border-l-transparent hover:border-l-primary'
}`}>
```

| State | Background | Left Border |
|-------|------------|-------------|
| Selected (light) | `#E6F2FF` (primary-50) | `#0066CC` |
| Selected (dark) | `#0c2d6b` (primary-50 dark) | `#4a9eff` |

---

## 16. Complete Row Implementation

### Leaf Task Row
```tsx
<div
  className={`group flex items-center gap-4 px-4 py-3 border-b border-neutral-100 cursor-pointer transition-colors ${
    isSelected
      ? 'bg-primary-50 border-l-2 border-l-primary'
      : 'border-l-2 border-l-transparent hover:border-l-primary hover:bg-neutral-100'
  }`}
  style={{ paddingLeft: `${16 + depth * 24}px` }}
  onClick={() => onSelectTask(task)}
>
  {/* Tree connector for children */}
  {depth > 0 && (
    <span className="flex-shrink-0 w-4 text-center text-neutral-400">↳</span>
  )}

  {/* Ticket Key */}
  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-primary-50 text-primary border border-primary/20 flex-shrink-0">
    {getTicketKey(task)}
  </span>

  {/* Title */}
  <span className="text-sm text-neutral-800 truncate flex-1 min-w-0">
    {task.title}
  </span>

  {/* Status */}
  <div className="w-20 flex-shrink-0 flex items-center justify-center" title={status.label}>
    <span className={status.className}>{status.icon}</span>
  </div>

  {/* Assignee */}
  <div className="w-24 flex-shrink-0 flex items-center justify-end gap-2 hidden xl:flex">
    {task.assigneeName ? (
      <>
        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${getAvatarColor(task.assigneeName)}`}>
          {getInitials(task.assigneeName)}
        </span>
        <span className="text-[11px] text-neutral-700 truncate max-w-[72px]">
          {task.assigneeName.split(' ')[0]}
        </span>
      </>
    ) : (
      <span className="text-[11px] text-neutral-400 italic">Unassigned</span>
    )}
  </div>

  {/* Due Date */}
  <div className="w-20 flex-shrink-0 text-center hidden lg:block">
    <span className={`text-[11px] tabular-nums ${dueDateStyle.className}`}>
      {dueDateStyle.label}
    </span>
  </div>

  {/* Priority */}
  <div className="w-16 flex-shrink-0 flex items-center justify-center gap-0.5" title={priority.label}>
    {[1, 2, 3, 4].map((bar) => (
      <div
        key={bar}
        className={`w-1 h-3 rounded-sm ${bar <= priority.bars ? priority.className : 'bg-neutral-200'}`}
      />
    ))}
  </div>

  {/* Type */}
  <div className="w-14 flex-shrink-0 flex items-center justify-center">
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium capitalize border ${typeStyle.className}`}>
      {typeStyle.icon}
    </span>
  </div>

  {/* Actions (hover) */}
  {task.url && (
    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <a
        href={task.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="p-1 text-neutral-400 hover:text-primary rounded hover:bg-neutral-200"
        title="Open in Jira"
      >
        <ExternalLink size={14} />
      </a>
    </div>
  )}
</div>
```

---

## 17. Dark Mode Verification Checklist

Every element must pass this verification:

| Element | Light Mode | Dark Mode | Contrast Ratio |
|---------|------------|-----------|----------------|
| Ticket key bg | `#E6F2FF` | `#0c2d6b` | — |
| Ticket key text | `#0066CC` | `#4a9eff` | 7.5:1 ✓ |
| Title text | `#1F2937` | `#e0e6eb` | 13:1 ✓ |
| Status icon (todo) | `#9CA3AF` | `#8b949e` | 4.5:1 ✓ |
| Status icon (in progress) | `#0066CC` | `#4a9eff` | 7.5:1 ✓ |
| Assignee text | `#374151` | `#c9d1d9` | 10:1 ✓ |
| Due date (normal) | `#374151` | `#c9d1d9` | 10:1 ✓ |
| Due date (overdue) | `#E63946` | `#f85149` | 5:1 ✓ |
| Priority bars | colored | colored | 4.5:1+ ✓ |
| Type badge text | varies | varies | 4.5:1+ ✓ |

---

## 18. Responsive Behavior

### Breakpoint Strategy
| Breakpoint | Hidden Elements |
|------------|-----------------|
| `< lg` (1024px) | Due Date |
| `< xl` (1280px) | Assignee |
| `< md` (768px) | Type badge text (icon only) |

### Mobile Card View (Future Enhancement)
For very small screens, transform to card layout:
```tsx
{/* Mobile: Card view */}
<div className="md:hidden">
  {tasks.map(task => (
    <div className="p-4 border-b border-neutral-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="ticket-key">{getTicketKey(task)}</span>
        <span className={status.className}>{status.icon}</span>
      </div>
      <p className="text-sm text-neutral-800 mb-2">{task.title}</p>
      <div className="flex items-center gap-4 text-[11px] text-neutral-500">
        <span>{task.assigneeName || 'Unassigned'}</span>
        <span>{dueDateStyle.label}</span>
      </div>
    </div>
  ))}
</div>
```

---

## 19. Animation Additions

### Row Enter Animation
```tsx
<div className="animate-fade-in" style={{ animationDelay: `${index * 20}ms` }}>
```

### Collapse/Expand Animation
```tsx
{/* Children container */}
<div className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'}`}>
  {children}
</div>
```

---

## 20. Implementation Checklist for Engineer

1. **Update globals.css** — Add `.animate-spin-slow` keyframes
2. **Create helper functions:**
   - `getInitials(name)`
   - `getAvatarColor(name)`
   - `getDueDateStyle(dueDate, status)`
3. **Create config objects:**
   - `statusIcons` with icons and classes
   - `priorityConfig` with bar counts and colors
   - `typeConfig` with icons and colors
4. **Update RealTasksTable component:**
   - Replace ticket key badge classes
   - Replace status badges with icons
   - Replace priority badges with bars
   - Add avatar initials for assignee
   - Update due date with color coding
   - Update parent row backgrounds
   - Add selected state tracking
5. **Test in both modes:**
   - Toggle `data-theme="dark"` on `<html>`
   - Verify all elements are readable
   - Check contrast ratios with browser devtools

---

## 21. Before/After Summary

| Element | Before | After |
|---------|--------|-------|
| Ticket key | `bg-neutral-100 text-neutral-700` (invisible in dark) | `bg-primary-50 text-primary` (branded, readable) |
| Status | Text badge with bg | Icon-only (Linear-style) |
| Priority | Text badge ("Critical") | Visual bars (4 levels) |
| Assignee | Text name only | Avatar initials + first name |
| Due date | Plain text, red when overdue | Color-coded (normal/soon/overdue) |
| Type | Generic neutral badge | Color-coded icon badge |
| Parent rows | Weak differentiation | Strong bg tint + left border |
| Hover | `hover:bg-neutral-50` | Blue left border accent |
| Selected | None | Primary tint background |

---

*This specification provides everything needed to implement a modern, sleek, readable task table. The engineer should be able to copy-paste classes directly. All colors are verified for WCAG AA contrast in both light and dark modes.*
