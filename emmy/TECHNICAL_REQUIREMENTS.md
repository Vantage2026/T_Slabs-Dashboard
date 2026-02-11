# Technical Requirements: UX/UI Improvements
## Emmy's Engineering Review of Jeff's PRD

**Author:** Emmy, Principal Engineer  
**Date:** February 11, 2026  
**Status:** Engineering Review Complete  
**Input Document:** jeff/PRD_UX_UI_IMPROVEMENTS.md

---

## Executive Summary

Jeff's PRD is solid product thinking, but it misses critical infrastructure work and underestimates technical complexity in several areas. The good news: with an AI coding agent doing the work, we can be more aggressive about doing things right the first time instead of cutting corners.

**My biggest concerns:**
1. The codebase has zero API rate limiting — this is a production risk that should be fixed before adding more features
2. The 2963-line project page needs decomposition *before* we make UI changes to it, not after
3. Jeff's mobile navigation solution will break — it needs proper React state architecture
4. The component library should come *first*, not alongside other work — otherwise we'll build more inconsistent components

**My recommendation:** Reorder Jeff's priorities. Infrastructure and architecture first, then UI polish.

---

## A. Technical Review of Jeff's PRD

### P0-1: Fix Dark Mode Text Contrast
**Jeff's Assessment:** ICE 810, CSS-only change, 2 hours  
**My Assessment:** ✅ Technically sound, but incomplete

**What Jeff Got Right:**
- Correctly identified the contrast issue
- Correctly identified the solution (bump `--color-neutral-400` to `#8b949e`)
- CSS variable change is the right approach

**What Jeff Missed:**
1. **Audit required after change.** Bumping `neutral-400` will fix some contrast issues but may break visual hierarchy elsewhere. The neutral scale is used for borders, backgrounds, *and* text. We need to audit every use of `text-neutral-400` to ensure we're not making muted things too prominent.

2. **Some components use hardcoded colors.** I see `!important` overrides in `globals.css` for specific color classes. If any component uses hardcoded hex values instead of CSS variables, they won't pick up the fix.

3. **No automated contrast checking.** Jeff mentions "verify with axe-core" but we have no CI integration for accessibility. This fix will regress if someone adds new low-contrast text later.

**Hidden Gotchas:**
- The change is safe but needs manual QA across all 29 page routes in both themes
- Any third-party components (Recharts, etc.) may have their own color issues

**Revised Estimate:** 2-3 hours for the fix, +2 hours for full visual audit

**Human Review Needed:** Yes — final visual approval before merge

---

### P0-2: Add Mobile Navigation
**Jeff's Assessment:** ICE 567, 4 hours  
**My Assessment:** ⚠️ Technically naive — needs rethinking

**What Jeff Got Wrong:**
Jeff's solution puts `mobileNavOpen` state in the layout component:
```tsx
const [mobileNavOpen, setMobileNavOpen] = useState(false);
```

This will cause **full page re-renders** every time the nav opens/closes because the state lives in the layout that wraps all pages. On mobile devices, this will be janky.

**The Right Approach:**
1. Create a dedicated `MobileNavProvider` context that manages nav state
2. Use CSS transforms for the drawer animation (GPU-accelerated, doesn't trigger React re-renders)
3. Implement proper focus trapping for accessibility
4. Handle body scroll lock when drawer is open
5. Support swipe-to-close gesture (expected on mobile)

**Implementation:**
```tsx
// contexts/mobile-nav-context.tsx
export const MobileNavContext = createContext<{
  isOpen: boolean;
  open: () => void;
  close: () => void;
} | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);
  
  return (
    <MobileNavContext.Provider value={{ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
    </MobileNavContext.Provider>
  );
}
```

**Additional Requirements Jeff Missed:**
- Close nav on route change (otherwise it stays open when user taps a link)
- Handle Escape key
- Focus first focusable element in drawer on open
- Return focus to hamburger button on close
- Support `prefers-reduced-motion` for users who don't want animations

**Hidden Gotchas:**
- The sidebar currently imports 14+ icons from lucide-react — that's a lot of JS to load on mobile. Consider lazy-loading the drawer content.
- Current sidebar has hardcoded `hidden lg:flex` — need to ensure the responsive breakpoint is consistent

**Revised Estimate:** 6-8 hours for production-quality mobile nav

**Human Review Needed:** Yes — needs manual testing on iOS Safari and Android Chrome (simulators aren't enough)

---

### P0-3: Resolve Primary Color Inconsistency
**Jeff's Assessment:** ICE 700, 30 minutes  
**My Assessment:** ✅ Correct, but do it properly

This is just documentation alignment. Jeff is right that Blue (#0066CC) is already implemented and should be documented as the official color.

**Additional Action:**
Add a comment at the top of `globals.css` explaining the design token system:
```css
/*
 * VANTAGE DESIGN TOKENS
 * 
 * Primary: #0066CC (Vantage Blue) — Not Indigo per original spec
 * Dark mode: CSS variables are overridden in html[data-theme="dark"] block
 * Never use `dark:` prefix — it does nothing in this codebase
 *
 * See DESIGN_LANGUAGE.md for full spec.
 */
```

**Estimate:** 30 minutes ✓

---

### P0-4: Simplify Dashboard Information Architecture
**Jeff's Assessment:** ICE 384, 4 hours  
**My Assessment:** ⚠️ Technically sound, but I'd do it differently

**What Jeff Got Right:**
- The 6-tab cognitive overload is real
- "The Brief" should be the hero experience
- Contextual entry points are smart

**What I'd Change:**
Jeff proposes a dropdown menu. Dropdowns are fine, but they add a click. Better approach: **just hide the secondary modes entirely** until the user has been active for a week. New users don't need Focus Mode, Forecast, or Team views on day one.

```tsx
// Simpler approach
const shouldShowAdvancedModes = useHasBeenActiveForDays(7);

const visibleModes = shouldShowAdvancedModes 
  ? ['brief', 'focus', 'meetings', 'forecast', 'stakeholders', 'dashboard']
  : ['brief', 'dashboard'];
```

This is progressive disclosure done right — no dropdown complexity, just show less to new users.

**Implementation Notes:**
- Track "first seen" timestamp in localStorage or user profile
- Add analytics events when users click each mode
- Consider A/B testing dropdown vs. progressive disclosure

**Estimate:** 3-4 hours

---

### P1-1: Create Shared UI Component Library
**Jeff's Assessment:** ICE 360, 8 hours for core components  
**My Assessment:** ⚠️ Underestimated, and should be P0

**Why This Should Be P0:**
Every other UI change will create *more* inconsistent components if we don't have the library first. Building the library is **prerequisite work**, not parallel work.

**What Jeff Missed:**

1. **Need `cn()` utility first.** Every component needs the `clsx` + `tailwind-merge` pattern:
```tsx
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

2. **Need design token types.** Create a types file that enforces valid variants:
```tsx
// lib/ui-types.ts
export type StatusVariant = 'success' | 'warning' | 'danger' | 'info';
export type SizeVariant = 'sm' | 'md' | 'lg';
export type CardVariant = 'default' | 'elevated' | 'flat' | 'interactive';
```

3. **Compound components pattern.** Jeff's Card example is fine, but we should use the compound components pattern consistently:
```tsx
// Usage
<Card variant="interactive">
  <Card.Header>
    <Card.Title>Project Health</Card.Title>
    <Card.Badge variant="success">On Track</Card.Badge>
  </Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

4. **Storybook.** Jeff mentions it offhand, but we need it. Storybook serves as:
   - Living documentation
   - Visual regression testing baseline
   - Design handoff reference

**Core Components to Build (in order):**
1. `cn()` utility + design tokens
2. `Button` (most used, establishes patterns)
3. `Badge` / `StatusBadge` / `SourceBadge`
4. `Card` + `Card.*` compound components
5. `Input` / `Select` / `Textarea`
6. `Modal` / `Drawer`
7. `Skeleton` loaders
8. `EmptyState`
9. `Table` with sorting/filtering

**Estimate:** 16-20 hours for production-quality library

**Build Order Dependency:** Must complete before P0-4 (dashboard simplification) so the dashboard uses shared components.

---

### P1-2: Fix Dark Mode Tinted Backgrounds
**Jeff's Assessment:** ICE 504, 4 hours  
**My Assessment:** ✅ Sound approach

Jeff's solution (semantic status variables) is correct. The `!important` overrides in the current CSS are a maintenance nightmare.

**One Addition:**
Create a `StatusArea` component that automatically handles the background/border/text combination:
```tsx
interface StatusAreaProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function StatusArea({ status, children, className }: StatusAreaProps) {
  return (
    <div 
      className={cn(
        'rounded-lg p-4 border',
        // These classes should use the new CSS variables
        `bg-status-${status}`,
        `border-status-${status}-border`,
        `text-status-${status}-text`,
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Estimate:** 4-5 hours ✓

---

### P1-3: Improve Empty States
**Jeff's Assessment:** ICE 504, 3 hours  
**My Assessment:** ✅ Good, with one concern

Jeff's empty state designs are well thought out. The value props and benefits lists are good activation content.

**Concern:** The copy is hardcoded in the component. We should:
1. Extract copy to a constants file for easy iteration
2. Consider internationalization structure even if we don't support i18n yet

**Estimate:** 3-4 hours ✓

---

### P1-4: Enhance Onboarding Flow
**Jeff's Assessment:** ICE 280, 6 hours  
**My Assessment:** ⚠️ Missing key technical requirements

**What Jeff Missed:**

1. **Server-side onboarding state.** Jeff suggests localStorage, but this means:
   - State is lost if user clears browser data
   - State doesn't sync across devices
   - Can't trigger server-side actions based on onboarding progress

   Better: Add `onboardingCompletedAt` and `onboardingDismissedAt` to the User model.

2. **Analytics events.** Need to track:
   - `onboarding.step_viewed` (which step)
   - `onboarding.step_completed` (which step)
   - `onboarding.dismissed` (at which step)
   - `onboarding.completed` (finished all steps)

3. **Time-to-value measurement.** We need to actually measure "time to first real insight" — this requires:
   - Tracking signup timestamp (already have via `createdAt`)
   - Tracking "first connection" event
   - Tracking "first project view" event
   - Computing the delta

**Estimate:** 8-10 hours

---

### P1-5: Standardize Loading States
**Jeff's Assessment:** ICE 384, 4 hours  
**My Assessment:** ✅ Correct approach

Skeleton loaders + Suspense boundaries is the right pattern. The implementation is straightforward.

**Addition:** Create a `PageSkeleton` for each major page route that matches the final layout structure. This prevents layout shift (CLS).

**Estimate:** 4-5 hours ✓

---

### P2-1: Decompose Project Detail Page
**Jeff's Assessment:** ICE 168, 16 hours (incremental)  
**My Assessment:** ⚠️ This should be P0, not P2

**Why This Is Urgent:**
The 2963-line `project/[id]/page.tsx` is not just a code smell — it's a **risk multiplier**. Every UI change to this page:
- Has higher chance of introducing bugs
- Takes longer to review
- Is harder to test
- Compiles slower (impacts DX)

If we make Jeff's UI changes *before* decomposing, we're making the problem worse. The decomposition should happen **first**.

**Decomposition Strategy:**

```
project/[id]/
├── page.tsx                       (~150 lines - layout + data fetching)
├── loading.tsx                    (Suspense fallback)
├── components/
│   ├── index.ts                   (barrel export)
│   ├── project-header.tsx         (~120 lines)
│   ├── project-metrics-grid.tsx   (~100 lines)
│   ├── task-tree/
│   │   ├── task-tree.tsx          (~200 lines - main component)
│   │   ├── task-row.tsx           (~150 lines - individual row)
│   │   ├── task-filters.tsx       (~80 lines)
│   │   └── use-task-tree.ts       (~100 lines - tree logic hook)
│   ├── task-detail-drawer.tsx     (~250 lines)
│   ├── intelligence/
│   │   ├── intelligence-panel.tsx (~200 lines - container)
│   │   ├── risk-factors.tsx       (~100 lines)
│   │   ├── scope-creep-chart.tsx  (~150 lines)
│   │   ├── critical-path.tsx      (~100 lines)
│   │   └── team-workload.tsx      (~150 lines)
│   └── modals/
│       ├── status-report-modal.tsx (already exists as shared component)
│       └── create-task-modal.tsx  (~150 lines)
├── hooks/
│   ├── use-project-data.ts        (~50 lines - data fetching)
│   └── use-task-actions.ts        (~80 lines - CRUD operations)
└── types.ts                       (~50 lines - component prop types)
```

**Extraction Order (dependency-aware):**
1. Extract types to `types.ts`
2. Extract `use-project-data.ts` hook (data fetching logic)
3. Extract `task-row.tsx` (no dependencies)
4. Extract `task-filters.tsx` (no dependencies)
5. Extract `task-tree.tsx` (depends on row + filters)
6. Extract `task-detail-drawer.tsx`
7. Extract intelligence sub-components
8. Wire everything together in slimmed-down `page.tsx`

**Estimate:** 12-16 hours

**Build Order:** MUST happen before any P1 UI work on the project page.

---

### P2-2: Add Keyboard Navigation (Cmd+K)
**Jeff's Assessment:** ICE 210, 8 hours  
**My Assessment:** ✅ Sound, use cmdk library

Using `cmdk` is the right call — don't reinvent this.

**Additional Scope:**
- Need to index projects and tasks for search
- Consider debounced search with loading state
- Support fuzzy matching

**Estimate:** 8-10 hours ✓

---

### P2-3: Responsive Table Improvements
**Jeff's Assessment:** ICE 240, 6 hours  
**My Assessment:** ✅ Sound approach

Sticky first column + mobile card view is the right pattern.

**Estimate:** 6 hours ✓

---

### P2-4: Settings Page Organization
**Jeff's Assessment:** ICE 240, 4 hours  
**My Assessment:** ✅ Simple refactor

**Estimate:** 4 hours ✓

---

## B. Counter-Proposals

### B1: Add API Rate Limiting (CRITICAL — Jeff Didn't Include This)
**Why:** The codebase has **zero rate limiting** on Vantage's own API endpoints. Any bad actor (or buggy client) can DDoS the API. This is a production risk.

**The Catch:** The current in-memory token bucket (`rateLimit.ts`) is useless on Vercel serverless because each function invocation is a fresh process.

**Solution Options:**

1. **Vercel Edge Config** (fastest to implement):
   ```typescript
   import { ipAddress } from '@vercel/edge';
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';
   
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
   });
   ```

2. **Redis via existing ioredis** (we already have the dependency):
   - Use existing Redis connection for rate limit counters
   - Implement sliding window in middleware

**Recommendation:** Use Upstash + Vercel Edge. It's 30 minutes of setup and provides:
- IP-based rate limiting
- Per-user rate limiting (for authenticated endpoints)
- Configurable limits per route

**Estimate:** 2-4 hours

**Priority:** P0 — this is a security issue

---

### B2: Remove Dead Code (engine.ts, BullMQ)
**Why:** The codebase has two sync implementations:
- `cron-sync.ts` (717 lines) — **active**, runs on Vercel cron
- `engine.ts` (BullMQ-based) — **dead code**, never runs

Plus BullMQ and ioredis dependencies that are potentially unused.

**Action:**
1. Verify BullMQ/ioredis are not used anywhere
2. Remove `engine.ts` if confirmed dead
3. Remove unused npm dependencies
4. Document sync architecture in README

**Why This Matters:**
- Reduces bundle size
- Reduces confusion for future engineers
- Removes unused dependency attack surface

**Estimate:** 2-3 hours

**Priority:** P1

---

### B3: Add Integration Tests for Sync Engine
**Why:** The sync engine (`cron-sync.ts`) is 717 lines of critical business logic with **zero tests**. It touches:
- OAuth token refresh
- External API calls (Jira, Monday, Asana)
- Database upserts
- Error handling
- Rate limiting against external APIs

If sync breaks, the entire product breaks.

**Test Strategy:**
1. Mock external adapters (don't call real Jira/Monday/Asana in tests)
2. Use in-memory SQLite or test Postgres for database tests
3. Test key scenarios:
   - Full sync happy path
   - Token refresh flow
   - Partial sync failure recovery
   - Conflict detection
   - Rate limit backoff

**Estimate:** 12-16 hours

**Priority:** P1 — should happen alongside or before major feature work

---

### B4: Add Pagination to Task Lists
**Why:** The `/api/projects/:id/tasks` endpoint returns **all tasks** with no pagination. A project with 500 tasks will:
- Return a huge JSON payload
- Timeout on Vercel's 10-second function limit
- Cause UI performance issues

**Solution:**
```typescript
// API
GET /api/projects/:id/tasks?page=1&limit=50&status=in_progress

// Response
{
  tasks: [...],
  pagination: {
    page: 1,
    limit: 50,
    total: 487,
    hasMore: true
  }
}
```

**UI Changes:**
- Implement infinite scroll or "Load More" button
- Show total count ("Showing 50 of 487 tasks")

**Estimate:** 6-8 hours

**Priority:** P1

---

### B5: Add Caching Layer
**Why:** Every page load hits the Neon database directly. With serverless, this means:
- Cold connection overhead
- No request coalescing
- Redundant queries for unchanged data

**Solution:** Use Vercel KV or Upstash Redis for caching:
- Cache project list for 60 seconds
- Cache task counts for 30 seconds
- Invalidate on write operations

**Estimate:** 8-12 hours

**Priority:** P2 (not urgent until scale issues appear)

---

## C. Revised Priority & Build Order

### Engineering Priority (Different from Jeff's Product Priority)

| Engineering Priority | Item | Rationale |
|---------------------|------|-----------|
| **E0** | API Rate Limiting | Security hole — must fix first |
| **E0** | Project page decomposition | Prerequisite for safe UI changes |
| **E0** | Component library foundation | Prerequisite for consistent UI work |
| **E1** | Dark mode contrast fix | User-facing bug, quick fix |
| **E1** | Mobile navigation (proper) | User-facing bug, moderate fix |
| **E1** | Primary color documentation | 30-minute doc fix |
| **E2** | Dashboard simplification | UI polish, depends on components |
| **E2** | Dark mode tinted backgrounds | Technical debt |
| **E2** | Empty states | UX improvement |
| **E2** | Loading state standardization | UX improvement |
| **E3** | Onboarding flow | Activation improvement |
| **E3** | Remove dead code | Hygiene |
| **E3** | Add sync engine tests | Risk reduction |
| **E3** | Add pagination | Scale preparation |
| **P4** | Keyboard navigation | Nice to have |
| **P4** | Responsive tables | Nice to have |
| **P4** | Settings organization | Nice to have |

### Build Order (Dependency Chain)

```
PHASE 1: Foundation (Week 1)
├── B1: API Rate Limiting (can parallel)
├── P1-1: Component library foundation
│   ├── cn() utility
│   ├── Design token types
│   └── Core components (Button, Badge, Card)
└── P2-1: Project page decomposition
    ├── Extract types
    ├── Extract hooks
    └── Extract components

PHASE 2: Critical Fixes (Week 1-2)
├── P0-1: Dark mode contrast fix (depends on components)
├── P0-2: Mobile navigation (depends on nothing)
├── P0-3: Primary color documentation (immediate)
└── P1-2: Dark mode tinted backgrounds (depends on components)

PHASE 3: UX Polish (Week 2-3)
├── P0-4: Dashboard simplification (depends on components)
├── P1-3: Empty states (depends on components)
├── P1-5: Loading skeletons (depends on components)
└── Remaining component library

PHASE 4: Activation & Hygiene (Week 3-4)
├── P1-4: Onboarding flow
├── B2: Remove dead code
├── B3: Sync engine tests
└── B4: Pagination

PHASE 5: Nice-to-Have (Backlog)
├── P2-2: Keyboard navigation
├── P2-3: Responsive tables
├── P2-4: Settings organization
└── B5: Caching layer
```

---

## D. Risk Assessment

### What Could Break in Production

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Dark mode contrast change affects visual hierarchy | Medium | Low | Manual QA on all pages |
| Mobile nav causes full-page re-renders | High (if done Jeff's way) | Medium | Use context + memo properly |
| Project page decomposition introduces bugs | Medium | High | Extract one component at a time, test after each |
| Rate limiting blocks legitimate users | Low | High | Start with generous limits (1000/min), monitor |
| Pagination breaks existing integrations | Low | Medium | Version the API, maintain backwards compat |

### What the AI Agent Might Miss

1. **Dark mode visual regression.** The AI can make the code changes but can't visually verify contrast across all states. **Needs human review.**

2. **Mobile touch interactions.** Swipe gestures, touch targets, iOS Safari quirks — these need real device testing. **Needs human testing.**

3. **Animation performance.** The AI can add CSS animations but can't feel if they're janky on low-end devices. **Needs human testing on throttled CPU.**

4. **Accessibility focus order.** The AI can add `tabIndex` but can't verify the focus order makes sense. **Needs human keyboard testing.**

5. **Edge cases in tree rendering.** The task tree has complex parent-child relationships. Deep nesting, orphaned tasks, circular references (from bad data) — the AI might not anticipate all edge cases. **Needs human code review + manual testing.**

### What Needs Human Review After AI Builds It

- [ ] All dark mode changes (visual review)
- [ ] Mobile navigation (real device testing)
- [ ] Component library API design (architecture review)
- [ ] Project page decomposition (architecture review + bug testing)
- [ ] Rate limiting configuration (security review)
- [ ] Any database schema changes (migration review)

---

## E. Architecture Recommendations

### E1: Component Decomposition Strategy for Project Page

**Current State:** 2963-line monolith mixing:
- Data fetching
- State management
- UI rendering
- Business logic

**Target State:** Feature-sliced architecture

```
project/[id]/
├── page.tsx              # Server component — data fetching only
├── project-view.tsx      # Client component — layout + state
├── components/           # UI components
├── hooks/                # Custom hooks for state/actions
└── types.ts              # Shared types
```

**Key Principle:** Each component should be testable in isolation.

### E2: Shared Component Library Approach

**Directory Structure:**
```
components/
├── ui/                   # Primitive components (Button, Card, Badge)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   ├── modal.tsx
│   ├── skeleton.tsx
│   └── index.ts          # Barrel export
├── patterns/             # Composed patterns (EmptyState, StatusArea)
│   ├── empty-state.tsx
│   ├── status-area.tsx
│   └── index.ts
└── features/             # Feature-specific components (existing)
    ├── the-brief.tsx
    ├── focus-mode.tsx
    └── ...
```

**Design Principles:**
1. **Composition over configuration.** Prefer `<Card.Header>` over `headerContent` prop.
2. **Sensible defaults.** `<Button>` should look good with zero props.
3. **Escape hatches.** Always accept `className` for customization.
4. **Type safety.** Use discriminated unions for variant props.

### E3: Dark Mode System Improvements

**Current:** CSS variable overrides with `!important` hacks

**Recommended:**
1. Define semantic tokens that abstract light/dark:
```css
:root {
  --surface-primary: var(--color-neutral-50);
  --surface-secondary: var(--color-white);
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-muted: var(--color-neutral-500);
  /* etc. */
}

html[data-theme="dark"] {
  --surface-primary: var(--color-neutral-100);
  --surface-secondary: var(--color-neutral-100);
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-700);
  --text-muted: var(--color-neutral-600);
}
```

2. Use semantic tokens in components:
```tsx
<div className="bg-surface-secondary text-primary">
```

3. Remove all `!important` overrides over time.

### E4: Testing Strategy

**Current State:** 7 unit test files, zero integration tests

**Target State:**

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Vitest | Utility functions, pure logic |
| Component | Vitest + Testing Library | Component rendering, interactions |
| Integration | Vitest + MSW | API routes, data fetching |
| E2E | Playwright | Critical user flows |
| Visual | Chromatic or Percy | Dark mode, responsive |

**Priority Tests to Add:**
1. Sync engine integration tests (mocked adapters)
2. API route tests (auth, validation, error handling)
3. Component tests for shared library
4. E2E test: Connect tool → View project → See tasks

---

## Appendix: Questions for Jeff/CEO

1. **Mobile priority:** Is mobile web sufficient, or is React Native on the horizon? Affects how much we invest in mobile web UX.

2. **Accessibility requirements:** Any compliance requirements (WCAG AA, Section 508)? Affects how rigorous our contrast/keyboard testing needs to be.

3. **Analytics stack:** What's the plan for event tracking? We need this for onboarding metrics. Mixpanel? Amplitude? PostHog?

4. **Design handoff:** Do we have Figma files, or is engineering making final visual decisions? Affects component library fidelity.

5. **API versioning:** Any external consumers of the API? Affects how carefully we need to version pagination changes.

---

*This document represents engineering's assessment of technical requirements. Product priorities may differ, but build order should respect dependency chains.*

**— Emmy, Principal Engineer** ⚡
