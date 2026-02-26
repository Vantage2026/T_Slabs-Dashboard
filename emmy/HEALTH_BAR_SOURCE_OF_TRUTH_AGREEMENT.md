# Health Bar Source of Truth Agreement
## Implementation Plan for Consistency Enforcement

**Author:** Emmy, Principal Engineer  
**Date:** February 2025  
**Status:** Implementation Agreement  
**Codebase:** pm-sync (Next.js 14 + Prisma + PostgreSQL)

---

## 1. Architecture Decision: Single Source of Truth

### Decision

**The backend `project.healthStatus` field returned by `/api/projects` is the single source of truth for all health bar rendering.**

No frontend component may derive health status from completion percentages, milestone counts, date comparisons, or any other local calculation.

### Rationale

| Option | Verdict | Reason |
|--------|---------|--------|
| Backend `healthStatus` (weighted critical-path) | ✅ **CHOSEN** | Accounts for task criticality, dependencies, blockers, and schedule risk |
| Frontend completion% thresholds | ❌ Rejected | Misleading—80% complete can still be critical if remaining 20% is blocked |
| Frontend date-based calculation | ❌ Rejected | Doesn't account for velocity, scope changes, or risk factors |
| Hybrid (backend + frontend overrides) | ❌ Rejected | Drift source; untestable; defeats purpose of centralized logic |

### Where Health Logic Lives

```
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Authoritative)                  │
├─────────────────────────────────────────────────────────────┤
│  /api/projects                                               │
│    └─ project.healthStatus: 'on_track' | 'at_risk' |        │
│                             'critical' | 'complete' |        │
│                             'not_started'                    │
│    └─ project.health (legacy alias, deprecate)              │
│                                                              │
│  /lib/health/calculateProjectHealth.ts                       │
│    └─ Weighted critical-path algorithm                       │
│    └─ Inputs: milestones, blockers, velocity, schedule      │
│    └─ Single implementation, tested                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Display Only)                  │
├─────────────────────────────────────────────────────────────┤
│  /lib/health/healthBarUtils.ts (NEW)                         │
│    └─ mapHealthStatusToColor(status) → color                │
│    └─ mapHealthStatusToLabel(status) → label                │
│    └─ mapHealthStatusToIcon(status) → icon                  │
│    └─ getHealthBarProps(status) → { color, label, icon }    │
│                                                              │
│  Components consume healthStatus, NEVER calculate it         │
└─────────────────────────────────────────────────────────────┘
```

### Enum Definition (Canonical)

```typescript
// /lib/types/health.ts

export type HealthStatus = 
  | 'on_track'      // Green: Schedule healthy, no blockers
  | 'at_risk'       // Yellow: Minor slippage or emerging risks
  | 'critical'      // Red: Blocked, significantly behind, needs escalation
  | 'complete'      // Blue/Gray: All milestones done
  | 'not_started';  // Gray: No work begun

// Legacy alias (deprecated, remove in v2.x)
export type Health = HealthStatus;
```

---

## 2. Strict Distinction: Health Bars vs Progress Bars

### Definitions

| Concept | What It Shows | Data Source | Visual |
|---------|---------------|-------------|--------|
| **Health Bar** | Risk/status assessment | `project.healthStatus` | Colored pill/badge (green/yellow/red) |
| **Progress Bar** | Completion percentage | `project.completionPct` or task counts | Horizontal fill bar with % |

### Rule: Never Conflate

**Health ≠ Progress.** A project can be:
- 90% complete but **critical** (remaining 10% is blocked)
- 20% complete but **on track** (ahead of schedule)
- 100% complete but still **at risk** (pending sign-off/deployment)

### Visual Language Standard

```
HEALTH BARS (status indicators):
┌──────────────────┐
│ ● On Track       │  ← Green dot/pill, no percentage
└──────────────────┘
┌──────────────────┐
│ ◐ At Risk        │  ← Yellow dot/pill
└──────────────────┘
┌──────────────────┐
│ ○ Critical       │  ← Red dot/pill
└──────────────────┘

PROGRESS BARS (completion indicators):
┌──────────────────┐
│ ████████░░ 80%   │  ← Fill bar with percentage
└──────────────────┘
```

### Component Naming Convention

- `HealthBadge` / `HealthIndicator` / `HealthPill` → Status only, uses `healthStatus`
- `ProgressBar` / `CompletionBar` → Percentage only, uses `completionPct`
- ❌ Never: `HealthProgressBar`, `StatusBar` with percentages

---

## 3. Canonical Shared Mapping Utility Design

### File: `/lib/health/healthBarUtils.ts`

```typescript
import { HealthStatus } from '@/lib/types/health';

// ============================================================
// HEALTH STATUS → VISUAL MAPPING
// This is the ONLY place health status is mapped to UI props.
// Do not duplicate this logic anywhere else.
// ============================================================

export interface HealthBarProps {
  color: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
  bgColor: string;      // Tailwind class
  textColor: string;    // Tailwind class
  borderColor: string;  // Tailwind class
  label: string;
  shortLabel: string;
  icon: string;         // Lucide icon name
  severity: number;     // 0=best, 4=worst (for sorting)
}

const HEALTH_CONFIG: Record<HealthStatus, HealthBarProps> = {
  on_track: {
    color: 'green',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    textColor: 'text-green-700 dark:text-green-400',
    borderColor: 'border-green-300 dark:border-green-700',
    label: 'On Track',
    shortLabel: 'OK',
    icon: 'CheckCircle',
    severity: 0,
  },
  complete: {
    color: 'blue',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    textColor: 'text-blue-700 dark:text-blue-400',
    borderColor: 'border-blue-300 dark:border-blue-700',
    label: 'Complete',
    shortLabel: 'Done',
    icon: 'CheckCircle2',
    severity: 0,
  },
  at_risk: {
    color: 'yellow',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    label: 'At Risk',
    shortLabel: 'Risk',
    icon: 'AlertTriangle',
    severity: 2,
  },
  critical: {
    color: 'red',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    textColor: 'text-red-700 dark:text-red-400',
    borderColor: 'border-red-300 dark:border-red-700',
    label: 'Critical',
    shortLabel: 'Crit',
    icon: 'AlertOctagon',
    severity: 4,
  },
  not_started: {
    color: 'gray',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    textColor: 'text-gray-500 dark:text-gray-400',
    borderColor: 'border-gray-300 dark:border-gray-600',
    label: 'Not Started',
    shortLabel: 'New',
    icon: 'Circle',
    severity: 1,
  },
};

// Fallback for unknown/null status
const UNKNOWN_HEALTH: HealthBarProps = {
  color: 'gray',
  bgColor: 'bg-gray-100 dark:bg-gray-800',
  textColor: 'text-gray-400',
  borderColor: 'border-gray-200',
  label: 'Unknown',
  shortLabel: '?',
  icon: 'HelpCircle',
  severity: 3,
};

/**
 * Get all visual props for a health status.
 * This is the primary function components should use.
 */
export function getHealthBarProps(status: HealthStatus | null | undefined): HealthBarProps {
  if (!status || !(status in HEALTH_CONFIG)) {
    console.warn(`[healthBarUtils] Unknown health status: ${status}`);
    return UNKNOWN_HEALTH;
  }
  return HEALTH_CONFIG[status];
}

/**
 * Convenience: get just the color
 */
export function getHealthColor(status: HealthStatus | null | undefined): string {
  return getHealthBarProps(status).color;
}

/**
 * Convenience: get just the label
 */
export function getHealthLabel(status: HealthStatus | null | undefined): string {
  return getHealthBarProps(status).label;
}

/**
 * Convenience: get Tailwind classes for badge styling
 */
export function getHealthBadgeClasses(status: HealthStatus | null | undefined): string {
  const props = getHealthBarProps(status);
  return `${props.bgColor} ${props.textColor} ${props.borderColor}`;
}

/**
 * Sort comparator for health status (worst first)
 */
export function compareHealthSeverity(a: HealthStatus, b: HealthStatus): number {
  return getHealthBarProps(b).severity - getHealthBarProps(a).severity;
}

/**
 * Type guard for valid health status
 */
export function isValidHealthStatus(value: unknown): value is HealthStatus {
  return typeof value === 'string' && value in HEALTH_CONFIG;
}
```

### File: `/components/ui/HealthBadge.tsx`

```typescript
import { getHealthBarProps } from '@/lib/health/healthBarUtils';
import { HealthStatus } from '@/lib/types/health';
import * as Icons from 'lucide-react';

interface HealthBadgeProps {
  status: HealthStatus | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * Standard health status badge.
 * ALWAYS pass healthStatus from API, NEVER derive from completion%.
 */
export function HealthBadge({
  status,
  size = 'md',
  showLabel = true,
  showIcon = true,
  className = '',
}: HealthBadgeProps) {
  const props = getHealthBarProps(status);
  const Icon = Icons[props.icon as keyof typeof Icons];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs gap-1',
    md: 'px-2 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  const iconSizes = { sm: 12, md: 14, lg: 16 };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${props.bgColor} ${props.textColor} ${props.borderColor}
        ${sizeClasses[size]}
        ${className}
      `}
      title={props.label}
    >
      {showIcon && Icon && <Icon size={iconSizes[size]} />}
      {showLabel && <span>{size === 'sm' ? props.shortLabel : props.label}</span>}
    </span>
  );
}
```

---

## 4. Exact File-Level Change List with Priority

### Legend
- **P0:** Ship blocker — causes visible user-facing inconsistency
- **P1:** High priority — inconsistent but less visible
- **P2:** Tech debt — works but violates pattern

### Changes Required

| Priority | File | Current Issue | Required Change |
|----------|------|---------------|-----------------|
| **P0** | `/src/components/the-brief.tsx` | Derives health from `completionPct` thresholds (e.g., >80% = green) | Replace with `project.healthStatus` from API; use `HealthBadge` component |
| **P0** | `/src/app/(app)/project/[id]/page.tsx` | Local health calculation based on milestone completion ratio | Remove local `getHealth()` function; consume `healthStatus` from page data |
| **P0** | `/src/app/(app)/timeline/page.tsx` | Inline color mapping that differs from other views | Replace inline mapping with `getHealthBarProps(project.healthStatus)` |
| **P1** | `/src/components/project-card.tsx` | Uses `health` (legacy) instead of `healthStatus` | Update to use `healthStatus`; verify API returns both during migration |
| **P1** | `/src/components/dashboard/project-grid.tsx` | Duplicates color mapping inline | Import from `healthBarUtils.ts` |
| **P1** | `/src/app/(app)/boards/page.tsx` | Recently fixed but needs verification | Audit: confirm using `healthStatus`, not `health` |
| **P1** | `/src/components/command-center/health-widget.tsx` | Recently fixed but needs verification | Audit: confirm using `healthStatus`, not `health` |
| **P2** | `/src/components/project-table.tsx` | Hardcoded color strings instead of utility | Refactor to use `getHealthBadgeClasses()` |
| **P2** | `/src/components/health-summary.tsx` | Duplicates severity sorting logic | Import `compareHealthSeverity()` from utility |
| **P2** | `/lib/types/project.ts` | Defines both `health` and `healthStatus` types | Deprecate `health`, add JSDoc warning |
| **P2** | `/api/projects/route.ts` | Returns both `health` and `healthStatus` | Add deprecation header for `health` field |

### Detailed Change Specifications

#### P0-1: `/src/components/the-brief.tsx`

**Current (problematic):**
```typescript
// WRONG: Deriving health from completion percentage
const getHealthStatus = (project: Project) => {
  const completion = project.completionPct || 0;
  if (completion >= 80) return 'on_track';
  if (completion >= 50) return 'at_risk';
  return 'critical';
};

// Usage
<div className={getHealthColor(getHealthStatus(project))}>
```

**Required:**
```typescript
// CORRECT: Use backend healthStatus directly
import { HealthBadge } from '@/components/ui/HealthBadge';

// Usage
<HealthBadge status={project.healthStatus} size="sm" />
```

#### P0-2: `/src/app/(app)/project/[id]/page.tsx`

**Current (problematic):**
```typescript
// WRONG: Local health calculation
function calculateHealth(milestones: Milestone[]): HealthStatus {
  const completed = milestones.filter(m => m.complete).length;
  const total = milestones.length;
  if (total === 0) return 'not_started';
  const ratio = completed / total;
  if (ratio >= 0.8) return 'on_track';
  if (ratio >= 0.5) return 'at_risk';
  return 'critical';
}
```

**Required:**
```typescript
// CORRECT: healthStatus is already on the project object from getProject()
// Remove calculateHealth function entirely

// In component:
const { project } = await getProject(params.id);
// project.healthStatus is authoritative

<HealthBadge status={project.healthStatus} />
```

#### P0-3: `/src/app/(app)/timeline/page.tsx`

**Current (problematic):**
```typescript
// WRONG: Inline mapping that may differ from standard
const statusColors: Record<string, string> = {
  on_track: 'bg-green-500',
  at_risk: 'bg-amber-500',  // Different from standard yellow!
  critical: 'bg-red-600',   // Different shade!
  // Missing: complete, not_started
};
```

**Required:**
```typescript
// CORRECT: Use shared utility
import { getHealthBarProps } from '@/lib/health/healthBarUtils';

// In component:
const healthProps = getHealthBarProps(project.healthStatus);
<div className={healthProps.bgColor}>
```

---

## 5. Regression Risks and Test Matrix

### Regression Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API doesn't return `healthStatus` for some projects | Medium | High | Add fallback + logging; verify API contract |
| Cached data has `health` but not `healthStatus` | Medium | Medium | Handle both during migration; invalidate caches |
| Color/label changes noticed by users | Low | Low | Intentional; communicate as "consistency fix" |
| Performance regression from utility imports | Very Low | Low | Tree-shaking handles this; measure anyway |
| Missed drift point not in audit | Medium | Medium | Add runtime assertion (see below) |

### Test Matrix

#### Unit Tests: `/lib/health/healthBarUtils.test.ts`

```typescript
describe('healthBarUtils', () => {
  describe('getHealthBarProps', () => {
    it.each([
      ['on_track', 'green', 'On Track'],
      ['at_risk', 'yellow', 'At Risk'],
      ['critical', 'red', 'Critical'],
      ['complete', 'blue', 'Complete'],
      ['not_started', 'gray', 'Not Started'],
    ])('returns correct props for %s', (status, expectedColor, expectedLabel) => {
      const props = getHealthBarProps(status as HealthStatus);
      expect(props.color).toBe(expectedColor);
      expect(props.label).toBe(expectedLabel);
    });

    it('returns unknown props for null', () => {
      const props = getHealthBarProps(null);
      expect(props.label).toBe('Unknown');
    });

    it('returns unknown props for undefined', () => {
      const props = getHealthBarProps(undefined);
      expect(props.label).toBe('Unknown');
    });

    it('returns unknown props for invalid status', () => {
      const props = getHealthBarProps('invalid' as HealthStatus);
      expect(props.label).toBe('Unknown');
    });

    it('logs warning for unknown status', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      getHealthBarProps('invalid' as HealthStatus);
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown health status'));
      consoleSpy.mockRestore();
    });
  });

  describe('compareHealthSeverity', () => {
    it('sorts critical before on_track', () => {
      const statuses: HealthStatus[] = ['on_track', 'critical', 'at_risk'];
      const sorted = statuses.sort(compareHealthSeverity);
      expect(sorted).toEqual(['critical', 'at_risk', 'on_track']);
    });
  });

  describe('isValidHealthStatus', () => {
    it('returns true for valid statuses', () => {
      expect(isValidHealthStatus('on_track')).toBe(true);
      expect(isValidHealthStatus('critical')).toBe(true);
    });

    it('returns false for invalid values', () => {
      expect(isValidHealthStatus('invalid')).toBe(false);
      expect(isValidHealthStatus(null)).toBe(false);
      expect(isValidHealthStatus(123)).toBe(false);
    });
  });
});
```

#### Component Tests: `/components/ui/HealthBadge.test.tsx`

```typescript
describe('HealthBadge', () => {
  it('renders correct color for each status', () => {
    const { rerender } = render(<HealthBadge status="on_track" />);
    expect(screen.getByText('On Track')).toHaveClass('text-green-700');

    rerender(<HealthBadge status="critical" />);
    expect(screen.getByText('Critical')).toHaveClass('text-red-700');
  });

  it('renders short label in sm size', () => {
    render(<HealthBadge status="at_risk" size="sm" />);
    expect(screen.getByText('Risk')).toBeInTheDocument();
    expect(screen.queryByText('At Risk')).not.toBeInTheDocument();
  });

  it('handles null status gracefully', () => {
    render(<HealthBadge status={null} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});
```

#### Integration Tests: E2E Consistency

```typescript
// e2e/health-consistency.spec.ts

describe('Health bar consistency', () => {
  const testProjectId = 'test-project-critical';

  beforeEach(async () => {
    // Seed project with known healthStatus='critical'
    await seedProject({ id: testProjectId, healthStatus: 'critical' });
  });

  it('shows consistent health across all views', async () => {
    // Dashboard
    await page.goto('/dashboard');
    const dashboardHealth = await page.locator(`[data-project="${testProjectId}"] [data-health]`).getAttribute('data-health');
    expect(dashboardHealth).toBe('critical');

    // Project detail
    await page.goto(`/project/${testProjectId}`);
    const detailHealth = await page.locator('[data-health]').getAttribute('data-health');
    expect(detailHealth).toBe('critical');

    // Timeline
    await page.goto('/timeline');
    const timelineHealth = await page.locator(`[data-project="${testProjectId}"] [data-health]`).getAttribute('data-health');
    expect(timelineHealth).toBe('critical');

    // The Brief
    await page.goto('/the-brief');
    const briefHealth = await page.locator(`[data-project="${testProjectId}"] [data-health]`).getAttribute('data-health');
    expect(briefHealth).toBe('critical');
  });
});
```

#### Visual Regression Tests

Add Percy/Chromatic snapshots for:
- Dashboard with mixed health statuses
- Project detail page header
- Timeline view
- The Brief summary cards

---

## 6. Rollout and Observability Checks

### Rollout Plan

| Phase | Scope | Duration | Rollback Trigger |
|-------|-------|----------|------------------|
| **1. Utility & Types** | Ship `healthBarUtils.ts`, types, `HealthBadge` | 1 day | N/A (additive) |
| **2. Internal Dogfood** | Enable for internal team only | 2 days | Any visual regression reported |
| **3. P0 Fixes** | Deploy the-brief, project detail, timeline | 1 day | >5% error rate increase |
| **4. P1 Fixes** | Deploy remaining component updates | 2 days | Visual regression in monitoring |
| **5. P2 Cleanup** | Tech debt, deprecation warnings | Ongoing | N/A |

### Feature Flag (Optional)

```typescript
// For gradual rollout if nervous
const useNewHealthBars = featureFlags.get('health-bar-v2', { 
  defaultValue: false,
  user: currentUser 
});

// In components
{useNewHealthBars ? (
  <HealthBadge status={project.healthStatus} />
) : (
  <LegacyHealthIndicator health={project.health} />
)}
```

### Observability Checklist

#### Pre-Deploy

- [ ] Add `data-health={status}` attribute to all health indicators (enables E2E tests)
- [ ] Add logging for `Unknown` health status occurrences
- [ ] Baseline current error rates for affected pages

#### Deploy-Time Monitoring

```typescript
// Add to healthBarUtils.ts
const healthStatusCounter = metrics.counter('health_status_rendered', {
  labels: ['status', 'component', 'page'],
});

export function getHealthBarProps(status: HealthStatus | null | undefined): HealthBarProps {
  // Track what statuses are being rendered
  healthStatusCounter.inc({ 
    status: status || 'null', 
    component: getCallerComponent(), // From React DevTools or stack trace
    page: typeof window !== 'undefined' ? window.location.pathname : 'ssr',
  });
  
  // ... rest of function
}
```

#### Post-Deploy Checks

- [ ] **Metric:** `health_status_rendered` counter by status — verify distribution matches expectations
- [ ] **Metric:** Error rate on affected pages — no increase
- [ ] **Log:** Search for "Unknown health status" warnings — should be zero
- [ ] **Visual:** Spot-check 5 projects across all views — colors match
- [ ] **User feedback:** Monitor support channel for 48 hours

### Alerting

```yaml
# Add to alerting config
- alert: HealthStatusUnknownSpike
  expr: rate(health_status_rendered{status="null"}[5m]) > 0.1
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "High rate of unknown health status renders"
    description: "{{ $value }} renders/sec with null/unknown healthStatus"

- alert: HealthUtilityErrors
  expr: rate(health_bar_utils_errors_total[5m]) > 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Errors in health bar utility"
```

---

## 7. Explicit Yes/No Recommendation for Each Suspected Drift Point

### `/src/components/the-brief.tsx`

**Drift Confirmed: YES**

**Evidence:** Component derives health from `completionPct` thresholds instead of using `healthStatus`.

**Recommendation:** **FIX (P0)**
- Remove local `getHealthStatus()` function
- Consume `project.healthStatus` from API response
- Replace custom rendering with `<HealthBadge>` component

**Risk if not fixed:** Users see project as "On Track" in The Brief but "Critical" in Dashboard. Direct contradiction undermines trust.

---

### `/src/app/(app)/project/[id]/page.tsx`

**Drift Confirmed: YES**

**Evidence:** Contains local `calculateHealth()` function that uses milestone completion ratios.

**Recommendation:** **FIX (P0)**
- Delete `calculateHealth()` function entirely
- Use `healthStatus` from `getProject()` server action
- This is the most visible inconsistency (detail page is primary view)

**Risk if not fixed:** User clicks from Dashboard (showing "Critical") to detail page (showing "On Track"). Immediate trust loss.

---

### `/src/app/(app)/timeline/page.tsx`

**Drift Confirmed: YES**

**Evidence:** Inline color mapping with different values (amber vs yellow, different red shade) and missing statuses.

**Recommendation:** **FIX (P0)**
- Replace inline `statusColors` object with `getHealthBarProps()` import
- Ensure all five statuses are handled (current code missing `complete`, `not_started`)

**Risk if not fixed:** Subtle color inconsistency (amber vs yellow) and crash potential for projects with `complete` or `not_started` status.

---

### `/src/components/project-card.tsx`

**Drift Suspected: LIKELY**

**Evidence:** Uses `health` (legacy) prop name. May work if API returns both, but fragile.

**Recommendation:** **FIX (P1)**
- Update to use `healthStatus` prop
- Verify API response includes both during migration period
- Add TypeScript deprecation on `health` prop

**Risk if not fixed:** Will break when API removes legacy `health` field.

---

### `/src/components/dashboard/project-grid.tsx`

**Drift Suspected: POSSIBLE**

**Evidence:** Likely duplicates color mapping inline based on pattern in other components.

**Recommendation:** **AUDIT & FIX (P1)**
- Verify current implementation
- If inline mapping exists, refactor to use `getHealthBadgeClasses()`

**Risk if not fixed:** Color drift when design system updates.

---

### `/src/app/(app)/boards/page.tsx`

**Drift Suspected: NO (recently fixed)**

**Recommendation:** **VERIFY ONLY (P1)**
- Confirm recent fix uses `healthStatus` (not `health`)
- Confirm uses shared utility (not inline mapping)
- Add to E2E test coverage

---

### `/src/components/command-center/health-widget.tsx`

**Drift Suspected: NO (recently fixed)**

**Recommendation:** **VERIFY ONLY (P1)**
- Same as Boards — verify and add test coverage

---

## 8. Final Agreement Plan with Done Criteria

### Agreement

All parties (Engineering, Design, Product) agree:

1. **`project.healthStatus` from `/api/projects` is the single source of truth** for health display
2. **No frontend component may calculate health** from completion %, dates, or other derived values
3. **All health visualization uses `healthBarUtils.ts`** for color/label/icon mapping
4. **Health bars and progress bars are visually and semantically distinct**
5. **Drift violations are P0 bugs** going forward

### Implementation Checklist

#### Phase 1: Foundation (Days 1-2)
- [ ] Create `/lib/health/healthBarUtils.ts` with all mapping functions
- [ ] Create `/lib/types/health.ts` with canonical types
- [ ] Create `/components/ui/HealthBadge.tsx` standard component
- [ ] Add unit tests for utility functions
- [ ] Add component tests for HealthBadge
- [ ] **Done when:** All tests pass, PR approved

#### Phase 2: P0 Fixes (Days 3-4)
- [ ] Fix `/src/components/the-brief.tsx`
- [ ] Fix `/src/app/(app)/project/[id]/page.tsx`
- [ ] Fix `/src/app/(app)/timeline/page.tsx`
- [ ] Add `data-health` attributes for E2E testing
- [ ] Add E2E consistency test
- [ ] **Done when:** E2E test passes, visual spot-check passes

#### Phase 3: P1 Fixes (Days 5-6)
- [ ] Fix `/src/components/project-card.tsx`
- [ ] Fix `/src/components/dashboard/project-grid.tsx`
- [ ] Verify `/src/app/(app)/boards/page.tsx`
- [ ] Verify `/src/components/command-center/health-widget.tsx`
- [ ] **Done when:** All views show consistent health for test project

#### Phase 4: P2 Cleanup (Days 7-10)
- [ ] Refactor remaining components to use shared utility
- [ ] Add deprecation JSDoc to `health` type
- [ ] Add deprecation header to API `health` field
- [ ] Update component documentation
- [ ] Add visual regression snapshots
- [ ] **Done when:** No inline color mappings remain, deprecation warnings in place

#### Phase 5: Observability (Ongoing)
- [ ] Add metrics for health status renders
- [ ] Add alerting for unknown status
- [ ] Monitor for 1 week post-deploy
- [ ] **Done when:** No alerts fire, no support tickets about inconsistency

### Done Criteria (Overall)

This initiative is **DONE** when:

1. ✅ All P0 and P1 files updated
2. ✅ E2E consistency test passes for all five health statuses
3. ✅ Visual regression tests baseline captured
4. ✅ No "Unknown health status" warnings in production logs for 48 hours
5. ✅ Spot-check of 10 random projects shows consistent health across all views
6. ✅ Documentation updated with health bar standards
7. ✅ Team has reviewed and approved this agreement

### Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Principal Engineer | Emmy | | |
| Engineering Manager | | | |
| Product Manager | | | |
| Design Lead | | | |

---

*Agreement complete. Ready for implementation.*

**— Emmy, Principal Engineer**
