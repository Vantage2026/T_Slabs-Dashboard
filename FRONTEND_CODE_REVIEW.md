# Vantage MVP Frontend Code Review
**Commit**: 26ee920  
**Reviewer**: Emmy (Principal Engineer)  
**Date**: 2026-02-07 22:35 UTC  
**Repository**: /root/pm-sync.git

---

## Executive Summary

**Overall Assessment**: Good foundation with several critical issues that need immediate attention

**Total Issues Found**: 18  
- **P1 Critical**: 4
- **P2 High**: 6
- **P3 Medium**: 5
- **P4 Low**: 3

**Key Concerns**:
1. Date/timezone calculation bugs in impact engine (off-by-one errors)
2. Missing React keys in list renders
3. Type safety issues with any types and unsafe type assertions
4. Accessibility gaps (ARIA labels, keyboard navigation)
5. Performance concerns (unnecessary re-renders)

---

## P1 CRITICAL ISSUES

### 1. Off-by-One Error in Forward-Pass Scheduling
**File**: `src/lib/impact-engine.ts`  
**Line**: 86-91  
**Severity**: P1 (Critical)

**Issue**:
```typescript
if (depEndDate > itemStartDate) {
  const duration = daysBetween(item.startDate, item.endDate);
  // Start the day after the dependency ends
  item.startDate = addDays(latestDependencyEnd, 1);
  item.endDate = addDays(item.startDate, duration);
}
```

The logic has an off-by-one error. When calculating `duration`, it uses `daysBetween(startDate, endDate)` which does NOT include both endpoints. This causes the rescheduled task to be 1 day shorter than intended.

**Example**:
- Original task: Jan 1 → Jan 5 (5 days inclusive: 1, 2, 3, 4, 5)
- `daysBetween("2026-01-01", "2026-01-05")` returns 4 (NOT 5)
- Rescheduled task: Jan 10 → Jan 14 (only 5 days: 10, 11, 12, 13, 14)
- **Missing day 15!**

**Fix**:
```typescript
if (depEndDate > itemStartDate) {
  // FIXED: Duration should be end - start + 1 (inclusive of both dates)
  const duration = daysBetween(item.startDate, item.endDate) + 1;
  // Start the day after the dependency ends
  item.startDate = addDays(latestDependencyEnd, 1);
  // FIXED: Subtract 1 because we want end date inclusive
  item.endDate = addDays(item.startDate, duration - 1);
}
```

**Impact**: Timeline calculations will be incorrect, cascading delays will be understated by 1 day per dependency level.

---

### 2. Timezone-Unsafe Date Parsing
**File**: `src/lib/impact-engine.ts`  
**Line**: 14-16  
**Severity**: P1 (Critical)

**Issue**:
```typescript
function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T00:00:00");
}
```

This creates dates in the **local timezone**, not UTC. If a user's browser is in PST (UTC-8), the date "2026-01-15" becomes "2026-01-15 00:00:00 PST" which is actually "2026-01-15 08:00:00 UTC". This causes off-by-one errors when comparing dates across timezones.

**Fix**:
```typescript
function parseDate(dateStr: string): Date {
  // FIXED: Force UTC to avoid timezone issues
  return new Date(dateStr + "T00:00:00Z");
}
```

**Impact**: Users in different timezones will see different timeline calculations. Critical for a global product.

---

### 3. Missing React Keys in List Renders
**File**: `src/components/gantt-chart.tsx`  
**Lines**: Multiple locations  
**Severity**: P1 (Critical)

**Issue**:
```typescript
// Line 510: Missing key in map
{visibleRows.map((item, rowIndex) => {
  const dates = getDates(item);
  return item.dependencies
    .map((depId) => {
      // ...
      return (
        <g key={`dep-${depId}-${item.id}`}>  // ✅ Key exists here
          {/* ... */}
        </g>
      );
    })
    .filter(Boolean);  // ⚠️ Problem: filter(Boolean) returns array without keys
})}
```

After `.filter(Boolean)`, React loses track of keys because the returned array elements don't have keys on the outer level.

**Fix**:
```typescript
{visibleRows.map((item, rowIndex) => {
  const dates = getDates(item);
  // FIXED: Use flatMap and filter in one step, or wrap in Fragment with key
  return item.dependencies
    .filter((depId) => visibleRows.findIndex((r) => r.id === depId) !== -1)
    .map((depId) => {
      const depIndex = visibleRows.findIndex((r) => r.id === depId);
      const dep = visibleRows[depIndex];
      // ... rest of logic
      return (
        <g key={`dep-${depId}-${item.id}`}>
          {/* ... */}
        </g>
      );
    });
})}
```

**Impact**: React reconciliation will fail, causing unnecessary re-renders and potential state loss.

---

### 4. Type Safety Violation with `any`
**File**: `src/lib/gantt-data.ts`  
**Line**: N/A (general issue)  
**Severity**: P1 (Critical)

**Issue**:
The `WorkItem` type uses `string` for `status` and `priority`, but the code treats them as strict unions:

```typescript
export type WorkItemStatus = "todo" | "in_progress" | "done" | "blocked";
export type Priority = "critical" | "high" | "medium" | "low";

export interface WorkItem {
  status: WorkItemStatus;  // ✅ Correct
  priority: Priority;      // ✅ Correct
  // But then:
  sourceStatus: string | null;     // ⚠️ Should be WorkItemStatus | string
  sourcePriority: string | null;   // ⚠️ Should be Priority | string
}
```

Later in the code (gantt-chart.tsx line 65), we have unsafe type assertions:

```typescript
const statusColors: Record<string, string> = {
  done: "bg-success",
  in_progress: "bg-primary",
  todo: "bg-neutral-300",
  blocked: "bg-danger",
};

// Line 364: Unsafe access - status could be undefined
<div className={`w-2.5 h-2.5 rounded-full ${statusColors[item.status]}`} />
```

If `item.status` is an unknown value (e.g., "cancelled" from a PM tool), `statusColors[item.status]` returns `undefined`, causing `className="w-2.5 h-2.5 rounded-full undefined"`.

**Fix**:
```typescript
// In gantt-data.ts:
export interface WorkItem {
  status: WorkItemStatus;
  priority: Priority;
  sourceStatus: string | null;  // Keep as string (source tools may have custom statuses)
  sourcePriority: string | null;
}

// In gantt-chart.tsx:
const statusColors: Record<WorkItemStatus, string> = {
  done: "bg-success",
  in_progress: "bg-primary",
  todo: "bg-neutral-300",
  blocked: "bg-danger",
};

// FIXED: Handle unknown statuses
<div className={`w-2.5 h-2.5 rounded-full ${
  statusColors[item.status as WorkItemStatus] || "bg-neutral-300"
}`} />
```

**Impact**: Runtime errors with undefined CSS classes, potential crashes.

---

## P2 HIGH PRIORITY ISSUES

### 5. Stale Closure in useCallback
**File**: `src/components/gantt-chart.tsx`  
**Line**: 119-126  
**Severity**: P2 (High)

**Issue**:
```typescript
const toggleCollapse = useCallback((id: string) => {
  setCollapsed((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });
}, []); // ⚠️ Empty dependency array - seems correct BUT...
```

The dependency array is empty `[]`, which is correct for this specific case since we're using the functional update form of `setCollapsed`. However, this pattern is confusing for future maintainers who might add dependencies later without realizing they need to update the array.

**Better Pattern**:
```typescript
// FIXED: Use useReducer for complex state updates
const [collapsed, dispatch] = useReducer(
  (state: Set<string>, action: { type: "toggle"; id: string }) => {
    const next = new Set(state);
    if (action.type === "toggle") {
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
    }
    return next;
  },
  new Set<string>()
);

const toggleCollapse = (id: string) => dispatch({ type: "toggle", id });
```

**Impact**: Medium risk of bugs if code is modified later. Not a current bug, but a maintainability issue.

---

### 6. Missing Error Boundary
**File**: `src/app/(app)/timeline/page.tsx`  
**Severity**: P2 (High)

**Issue**:
The page has no error boundary. If the impact analysis engine throws an exception (e.g., circular dependency detected), the entire page crashes with a white screen.

**Fix**:
```typescript
// Create error-boundary.tsx
"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-danger-50 border border-danger rounded-lg">
          <h2 className="text-lg font-semibold text-danger">Something went wrong</h2>
          <p className="text-sm text-neutral-700 mt-2">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-danger text-white rounded-lg"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// In timeline/page.tsx:
export default function TimelinePage() {
  return (
    <ErrorBoundary>
      {/* existing content */}
    </ErrorBoundary>
  );
}
```

**Impact**: Production crashes are user-hostile. Error boundaries are React best practice.

---

### 7. Infinite Loop Risk in useEffect
**File**: `src/components/ticket-detail-panel.tsx`  
**Line**: N/A (pattern issue)  
**Severity**: P2 (High)

**Issue**:
While not present in the current code, the pattern of using object/array dependencies in `useMemo` is risky:

```typescript
const ancestors = getAncestors(item.id);  // Returns new array every time
const children = getChildren(item.id);     // Returns new array every time
```

If these are used as dependencies in a `useEffect`, it creates an infinite loop:

```typescript
// DON'T DO THIS:
useEffect(() => {
  console.log("Ancestors changed", ancestors);
}, [ancestors]); // ❌ New array every render = infinite loop
```

**Fix**:
```typescript
// FIXED: Use primitive dependencies
useEffect(() => {
  const ancestors = getAncestors(item.id);
  console.log("Ancestors changed", ancestors);
}, [item.id]); // ✅ Primitive value
```

**Impact**: Not a current bug, but a code smell that could lead to infinite loops if code is extended.

---

### 8. Accessibility: Missing ARIA Labels
**File**: `src/components/gantt-chart.tsx`  
**Lines**: 300-320  
**Severity**: P2 (High)

**Issue**:
```typescript
<button
  className="w-5 h-5 flex items-center justify-center shrink-0"
  onClick={(e) => {
    e.stopPropagation();
    if (hasChildren) toggleCollapse(item.id);
  }}
>
  {/* Icon only, no accessible label */}
  {hasChildren && (isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />)}
</button>
```

Screen readers cannot interpret icon-only buttons. Users with visual impairments cannot navigate the tree.

**Fix**:
```typescript
<button
  aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${item.name}`}
  aria-expanded={!isCollapsed}
  className="w-5 h-5 flex items-center justify-center shrink-0"
  onClick={(e) => {
    e.stopPropagation();
    if (hasChildren) toggleCollapse(item.id);
  }}
>
  {hasChildren && (isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />)}
</button>
```

**Impact**: Violates WCAG 2.1 AA. Product is not accessible to users with disabilities.

---

### 9. No Keyboard Navigation for Tree View
**File**: `src/app/(app)/timeline/page.tsx`  
**Line**: 376-480 (TreeNode component)  
**Severity**: P2 (High)

**Issue**:
The tree view has no keyboard navigation. Users cannot:
- Use arrow keys to navigate items
- Use Enter/Space to select items
- Use Tab to focus interactive elements

**Fix**:
```typescript
<div
  role="treeitem"
  aria-expanded={!isCollapsed}
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(item);
    } else if (e.key === "ArrowRight" && hasChildren && isCollapsed) {
      onToggle(item.id);
    } else if (e.key === "ArrowLeft" && hasChildren && !isCollapsed) {
      onToggle(item.id);
    }
  }}
  className="flex items-center gap-2 border-b border-neutral-50 px-3 py-2.5 cursor-pointer hover:bg-neutral-50 transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
  // ...
>
```

**Impact**: Keyboard-only users (including accessibility users and power users) cannot use the tree view efficiently.

---

### 10. Performance: Unnecessary Re-renders
**File**: `src/components/gantt-chart.tsx`  
**Line**: 89-94  
**Severity**: P2 (High)

**Issue**:
```typescript
const visibleRows = useMemo(() => {
  const allRows = buildGanttRows();
  return allRows.filter((item) => {
    // Check if any ancestor is collapsed
    let parent = item.parentId;
    while (parent) {
      if (collapsed.has(parent)) return false;
      const p = workItems.find((w) => w.id === parent);  // ⚠️ O(n) lookup in loop
      parent = p?.parentId ?? null;
    }
    return true;
  });
}, [collapsed]);
```

For each item, we call `workItems.find()` in a loop. If there are 100 items with 3 levels of hierarchy, this is **300 array scans**. That's O(n²) complexity.

**Fix**:
```typescript
// Build a parent lookup map once
const parentMap = useMemo(() => {
  const map = new Map<string, string | null>();
  for (const item of workItems) {
    map.set(item.id, item.parentId);
  }
  return map;
}, []); // Only rebuild if workItems changes

const visibleRows = useMemo(() => {
  const allRows = buildGanttRows();
  return allRows.filter((item) => {
    let parent = item.parentId;
    while (parent) {
      if (collapsed.has(parent)) return false;
      parent = parentMap.get(parent) || null;  // ✅ O(1) lookup
    }
    return true;
  });
}, [collapsed, parentMap]);
```

**Impact**: Noticeable lag when expanding/collapsing large project trees (100+ items).

---

## P3 MEDIUM PRIORITY ISSUES

### 11. Inconsistent Date Formatting
**File**: `src/app/(app)/timeline/page.tsx`  
**Line**: 436  
**Severity**: P3 (Medium)

**Issue**:
```typescript
{new Date(item.startDate + "T00:00:00").toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
})}
```

This hardcodes "en-US" locale, ignoring user's browser locale.

**Fix**:
```typescript
{new Date(item.startDate + "T00:00:00Z").toLocaleDateString(undefined, {
  month: "short",
  day: "numeric",
})}
```

Using `undefined` respects the user's locale.

**Impact**: Users in non-US locales see US-formatted dates (confusing for international users).

---

### 12. Magic Numbers Without Constants
**File**: `src/components/gantt-chart.tsx`  
**Lines**: 20-23  
**Severity**: P3 (Medium)

**Issue**:
```typescript
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 56;
const DAY_WIDTH = 32;
const LEFT_PANEL_WIDTH = 400;
```

These are defined at the top but used throughout. If someone changes `ROW_HEIGHT`, they might forget to update `y = rowIndex * ROW_HEIGHT + 8` (line 444).

**Fix**:
```typescript
// Create a config object
const GANTT_CONFIG = {
  ROW_HEIGHT: 44,
  HEADER_HEIGHT: 56,
  DAY_WIDTH: 32,
  LEFT_PANEL_WIDTH: 400,
  BAR_VERTICAL_PADDING: 8,  // Document the magic "8"
  BAR_HEIGHT: {
    project: 28,
    epic: 24,
    story: 20,
  },
} as const;

// Usage:
const y = rowIndex * GANTT_CONFIG.ROW_HEIGHT + GANTT_CONFIG.BAR_VERTICAL_PADDING;
const barHeight = GANTT_CONFIG.BAR_HEIGHT[item.type];
```

**Impact**: Maintainability issue. Changes are error-prone.

---

### 13. Console Errors in Production
**File**: Multiple files  
**Severity**: P3 (Medium)

**Issue**:
No environment check for `console.log` statements:

```typescript
// src/lib/impact-engine.ts, line 51:
console.log(`[OUTBOUND] Found ${tasksToSync.length} tasks with local changes`);
```

**Fix**:
```typescript
// Create a logger utility
export const logger = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(...args);
    }
  },
  warn: (...args: any[]) => {
    console.warn(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  },
};

// Usage:
logger.log(`[OUTBOUND] Found ${tasksToSync.length} tasks`);
```

**Impact**: Console spam in production. Minor UX issue.

---

### 14. Hardcoded Mock Data in Production
**File**: `src/lib/mock-data.ts`  
**Severity**: P3 (Medium)

**Issue**:
Mock data is imported directly into components. There's no clear separation between dev/prod data sources.

**Fix**:
```typescript
// Create data-provider.ts
export function getProjects(): Project[] {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true") {
    return mockProjects;
  }
  // In production, fetch from API
  throw new Error("API not implemented");
}
```

**Impact**: Makes it harder to switch to real API later. Technical debt.

---

### 15. Missing Loading States
**File**: `src/components/ticket-detail-panel.tsx`  
**Line**: 67-75  
**Severity**: P3 (Medium)

**Issue**:
```typescript
const handleSave = async () => {
  setSyncStatus("syncing");
  await new Promise((resolve) => setTimeout(resolve, 1500));
  // ... success or error
};
```

While there IS a loading state (`syncStatus === "syncing"`), the UI doesn't disable the form inputs during sync. Users can continue editing while the save is in progress, causing race conditions.

**Fix**:
```typescript
<input
  disabled={syncStatus === "syncing"}
  // ...
/>

<button
  disabled={syncStatus === "syncing" || !editing}
  // ...
>
  {syncStatus === "syncing" ? (
    <>
      <Loader2 size={16} className="animate-spin" />
      Saving...
    </>
  ) : (
    <>
      <Save size={16} />
      Save Changes
    </>
  )}
</button>
```

**Impact**: Users can create conflicting edits. Data integrity risk.

---

## P4 LOW PRIORITY ISSUES

### 16. Unused Imports
**File**: Multiple files  
**Severity**: P4 (Low)

**Issue**:
```typescript
// src/components/ticket-detail-panel.tsx, line 9:
import { GitBranch } from "lucide-react";  // ⚠️ Never used
```

**Fix**:
Remove unused imports. Use ESLint rule `no-unused-vars`.

**Impact**: Slightly larger bundle size. Code cleanliness.

---

### 17. Inconsistent Naming Conventions
**File**: `src/lib/gantt-data.ts`  
**Severity**: P4 (Low)

**Issue**:
```typescript
export function getChildren(parentId: string): WorkItem[] { }
export function getProjects(): WorkItem[] { }
export function getItemById(id: string): WorkItem | undefined { }
```

Mix of `get` prefix and no prefix. Should be consistent.

**Fix**:
Either use `get` prefix for all (Java style) or omit it for all (JavaScript style).

**Recommendation**:
```typescript
export function findChildren(parentId: string): WorkItem[] { }
export function findProjects(): WorkItem[] { }
export function findItemById(id: string): WorkItem | undefined { }
```

**Impact**: Code consistency. Readability.

---

### 18. Magic String Literals
**File**: `src/components/gantt-chart.tsx`  
**Line**: 65-73  
**Severity**: P4 (Low)

**Issue**:
```typescript
const statusColors: Record<string, string> = {
  done: "bg-success",  // ⚠️ Magic string "bg-success"
  in_progress: "bg-primary",
  // ...
};
```

Tailwind class names are magic strings. If someone typos `"bg-succes"` (missing 's'), it silently fails.

**Fix**:
Use const enums or TypeScript template literal types:

```typescript
type TailwindBg = `bg-${string}`;

const statusColors: Record<WorkItemStatus, TailwindBg> = {
  done: "bg-success",
  in_progress: "bg-primary",
  todo: "bg-neutral-300",
  blocked: "bg-danger",
};
```

**Impact**: Minor type safety improvement.

---

## Summary by File

| File | P1 | P2 | P3 | P4 | Total |
|------|----|----|----|----|-------|
| `src/lib/impact-engine.ts` | 2 | 0 | 1 | 0 | 3 |
| `src/components/gantt-chart.tsx` | 2 | 3 | 2 | 2 | 9 |
| `src/app/(app)/timeline/page.tsx` | 0 | 2 | 1 | 0 | 3 |
| `src/components/ticket-detail-panel.tsx` | 0 | 1 | 1 | 1 | 3 |
| `src/lib/gantt-data.ts` | 0 | 0 | 0 | 1 | 1 |
| **TOTAL** | **4** | **6** | **5** | **4** | **19** |

---

## Recommended Fix Priority

### Immediate (Fix before any deployment)
1. **Issue #1**: Off-by-one error in timeline calculations (P1)
2. **Issue #2**: Timezone bugs (P1)
3. **Issue #3**: Missing React keys (P1)
4. **Issue #4**: Type safety with status colors (P1)

### Before Beta Launch
5. **Issue #5**: Stale closure pattern (P2)
6. **Issue #6**: Error boundary (P2)
7. **Issue #8**: ARIA labels (P2)
8. **Issue #9**: Keyboard navigation (P2)
9. **Issue #10**: Performance optimization (P2)

### Post-Launch Improvements
10. **Issue #11**: Date formatting (P3)
11. **Issue #12**: Magic numbers (P3)
12. **Issue #13**: Console logs (P3)
13. **Issue #15**: Loading state improvements (P3)

### Technical Debt
14. **Issue #14**: Mock data separation (P3)
15. **Issue #16-18**: Code quality improvements (P4)

---

## Testing Recommendations

### Unit Tests (Missing)
```typescript
// tests/lib/impact-engine.test.ts
describe("calculateImpact", () => {
  it("should preserve task duration when rescheduling", () => {
    const result = calculateImpact("story-1-2-2", 7);
    const affected = result.affectedItems.find(a => a.item.id === "story-1-2-3");
    
    // Verify duration is preserved
    const originalDuration = daysBetween(
      "2026-02-16",
      "2026-02-20"
    );
    const newDuration = daysBetween(
      affected.item.startDate,
      affected.newEnd
    );
    
    expect(newDuration).toBe(originalDuration);
  });
  
  it("should handle timezone-independent dates", () => {
    // Run this test in different timezones
    const result1 = calculateImpact("story-1-2-2", 7);
    
    // Change system timezone
    process.env.TZ = "America/Los_Angeles";
    const result2 = calculateImpact("story-1-2-2", 7);
    
    expect(result1).toEqual(result2);
  });
});
```

### Integration Tests (Missing)
```typescript
// tests/components/gantt-chart.test.tsx
describe("GanttChart", () => {
  it("should not re-render when unrelated props change", () => {
    const { rerender } = render(<GanttChart onSelectItem={jest.fn()} />);
    
    const renderCount = getRenderCount();
    
    rerender(<GanttChart onSelectItem={jest.fn()} />);
    
    // Should not re-render because onSelectItem is new function
    // (unless properly memoized)
    expect(getRenderCount()).toBe(renderCount);
  });
});
```

### Accessibility Tests (Missing)
```typescript
// tests/a11y/gantt-chart.test.tsx
describe("GanttChart Accessibility", () => {
  it("should have proper ARIA labels", () => {
    const { container } = render(<GanttChart />);
    
    const buttons = container.querySelectorAll("button");
    buttons.forEach(button => {
      expect(button).toHaveAttribute("aria-label");
    });
  });
  
  it("should be keyboard navigable", () => {
    const { container } = render(<GanttChart />);
    
    const tree = container.querySelector('[role="tree"]');
    expect(tree).toBeInTheDocument();
    
    // Test arrow key navigation
    fireEvent.keyDown(tree, { key: "ArrowDown" });
    // ... verify focus moves
  });
});
```

---

## Architecture Recommendations

### 1. Separate Business Logic from UI
Current:
```typescript
// gantt-chart.tsx contains both rendering AND impact calculation logic
```

Better:
```typescript
// hooks/useImpactAnalysis.ts
export function useImpactAnalysis(targetId: string | null, delayDays: number) {
  return useMemo(() => {
    if (!targetId) return null;
    return calculateImpact(targetId, delayDays);
  }, [targetId, delayDays]);
}

// gantt-chart.tsx just uses the hook
const impactResult = useImpactAnalysis(impactTarget, impactDays);
```

### 2. Add State Management
Current: Props drilling through 3+ levels

Better: Use Context API or Zustand:
```typescript
// store/timeline-store.ts
export const useTimelineStore = create((set) => ({
  selectedItem: null,
  impactTarget: null,
  impactDays: 14,
  setSelectedItem: (item) => set({ selectedItem: item }),
  setImpactTarget: (target, days) => set({ impactTarget: target, impactDays: days }),
}));
```

### 3. Type-Safe Date Library
Replace custom date functions with `date-fns` or `dayjs`:

```typescript
import { parseISO, formatISO, addDays, differenceInDays } from "date-fns";

// Type-safe, timezone-aware, battle-tested
```

---

## Conclusion

The codebase has a solid foundation with good component structure and clear separation of concerns. The critical issues are primarily in the **impact engine** (date calculations) and **accessibility**. These are fixable with focused effort.

**Estimated Fix Time**:
- P1 Issues: **4 hours**
- P2 Issues: **8 hours**
- P3 Issues: **6 hours**
- **Total: 18 hours** (2-3 days)

**Recommendation**: Fix P1 issues **before any user testing**. The off-by-one errors will cause incorrect timeline predictions, which undermines the core value proposition.

---

**Next Steps**:
1. Create tickets in backlog for each issue
2. Fix P1 issues immediately (commit to bare repo)
3. Write unit tests for impact engine
4. Schedule P2 fixes for next sprint
5. Add ESLint rules to prevent future issues

---

**Reviewed by**: Emmy (Principal Engineer)  
**Status**: Ready for developer action  
**Severity**: Moderate (no security issues, but critical functionality bugs)
