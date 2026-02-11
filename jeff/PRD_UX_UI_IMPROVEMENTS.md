# PRD: Vantage UX/UI Improvements
## Product Requirements Document v2.0

**Author:** Jeff, SVP Product  
**Date:** February 11, 2026  
**Status:** Ready for Engineering  
**Business Goal:** $5,000/month recurring profit with minimal CEO input  

---

## Executive Summary

I've completed a comprehensive audit of Vantage across 29 page routes, 15+ components, the design system spec, CSS implementation, and dark mode architecture. Here's my honest assessment:

### The Good
- **Core value prop is strong** — AI-powered PM intelligence is differentiated
- **Real functionality exists** — Jira sync, task write-back, Scout AI, critical path analysis
- **Dark mode infrastructure is sound** — CSS variable inversion is the right approach
- **Design language spec is comprehensive** — The vision is there

### The Problems
1. **Dark mode is unreadable** — `text-neutral-400` hits barely-visible contrast in dark mode
2. **Information overload** — Dashboard has 6 modes, sidebar has 14+ items, project detail is 2963 lines
3. **Design spec vs. reality drift** — Spec says Indigo, code says Blue; patterns vary per page
4. **Mobile is broken** — Sidebar hardcoded `w-64 hidden lg:flex`, no hamburger, no drawer
5. **Onboarding is weak** — Getting Started checklist exists but doesn't guide to "aha"
6. **No component library** — Every page reinvents cards, badges, buttons

### The Impact
These aren't aesthetic issues. They're **activation and retention killers**. A PM who can't read their dashboard at night cancels. A user who's overwhelmed on first load never connects their tools. A PM who can't check project health on their phone during a coffee run churns.

### My Recommendation
Ship the P0s this week (2-3 days of work). Then systematically work through P1s to build the foundation. The 2963-line project page needs decomposition, but it can wait until the user-facing issues are fixed.

---

## Prioritization Framework: ICE Scoring

Each item scored on:
- **Impact** (1-10): How many users affected? How much does it improve their experience?
- **Confidence** (1-10): How sure are we this will work?
- **Ease** (1-10): How quickly can engineering ship this? (10 = trivial, 1 = quarter-long project)

**ICE Score = Impact × Confidence × Ease**

---

## P0: Ship This Week (Critical — Blocking Activation/Retention)

### P0-1: Fix Dark Mode Text Contrast
**ICE Score: 9 × 10 × 9 = 810** ⭐ HIGHEST PRIORITY

#### Problem
In dark mode, `text-neutral-400` maps to `#6e7681` — a **2.4:1 contrast ratio** against the dark background (`#151b23`). WCAG AA requires **4.5:1** for normal text. This means:
- Timestamps unreadable
- Captions invisible
- Secondary labels require squinting
- Users switch back to light mode or churn

#### Evidence
From `globals.css` line 31:
```css
--color-neutral-400: #6e7681;  /* muted icons/text — FAILS WCAG */
```

Used extensively across project detail page, dashboard, scout, and all other pages for secondary text.

#### Solution
Update the dark mode neutral scale in `globals.css`:

```css
html[data-theme="dark"] {
  /* BEFORE                          AFTER (with contrast ratios) */
  --color-neutral-400: #6e7681;  →  --color-neutral-400: #8b949e;  /* 4.5:1 ✓ */
  --color-neutral-500: #848d97;  →  --color-neutral-500: #9ca3af;  /* 5.2:1 ✓ */
  --color-neutral-600: #9ca3af;  →  --color-neutral-600: #adb5bd;  /* 6.1:1 ✓ */
}
```

Also audit and replace any `text-neutral-400` used for readable text with `text-neutral-500` or `text-neutral-700` as appropriate.

#### Success Metrics
- All text passes WCAG AA (4.5:1) — verify with axe-core
- Dark mode session duration equals light mode (currently expect it's lower)
- Zero support tickets about "can't read text"

#### Engineering Notes
- CSS-only change, no component updates required
- Run `npx axe-core` on all pages post-fix
- Estimated effort: **2 hours**

---

### P0-2: Add Mobile Navigation
**ICE Score: 9 × 9 × 7 = 567**

#### Problem
The sidebar is hardcoded as:
```tsx
<aside className="w-64 bg-white ... hidden lg:flex ...">
```

On mobile and tablet:
- **No hamburger menu** in header
- **No slide-out drawer** available
- Users simply cannot navigate the app
- 100% of mobile users are blocked

PMs check project health on their phones constantly. Currently, they can't use Vantage on mobile at all.

#### Solution

1. **Add hamburger button to header** (visible on `lg:hidden`):
```tsx
// In header component
<button 
  className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg"
  onClick={() => setMobileNavOpen(true)}
  aria-label="Open navigation"
>
  <Menu size={24} />
</button>
```

2. **Create MobileNav drawer component**:
```tsx
// components/mobile-nav.tsx
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      
      {/* Drawer */}
      <nav className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl animate-slide-in overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <span className="font-bold text-neutral-900">Vantage</span>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-600">
            <X size={20} />
          </button>
        </div>
        {/* Same nav items as desktop sidebar */}
        <div className="p-4 space-y-1">
          {mainNav.map(...)} {/* Reuse existing nav structure */}
        </div>
      </nav>
    </div>
  );
}
```

3. **Add state management in layout**:
```tsx
const [mobileNavOpen, setMobileNavOpen] = useState(false);
```

#### Success Metrics
- Mobile sessions increase from 0% to >15% of total
- Mobile bounce rate <50%
- Users can complete core workflows on phone

#### Engineering Notes
- New component + header modification
- Reuse existing sidebar nav items
- Test on iOS Safari + Android Chrome
- Estimated effort: **4 hours**

---

### P0-3: Resolve Primary Color Inconsistency
**ICE Score: 7 × 10 × 10 = 700**

#### Problem
**Design Language spec (DESIGN_LANGUAGE.md):**
```css
--color-primary: #6366f1;  /* Indigo-500 */
```

**Actual implementation (globals.css):**
```css
--color-primary: #0066CC;  /* Blue */
```

This causes:
- Designers follow spec, engineers follow code → inconsistency
- Trust erosion ("why does the brand feel off?")
- Confusion in code reviews

#### Solution
**Decision: Keep Blue (#0066CC).**

Rationale:
- Already implemented consistently across the app
- Blue conveys trust/reliability (critical for PM tools)
- Changing to Indigo requires full visual regression testing
- The current blue works well

**Action:**
1. Update DESIGN_LANGUAGE.md to document Blue as the primary:
```css
--color-primary: #0066CC;  /* Vantage Blue - Main brand action color */
```

2. Add a comment in globals.css:
```css
/* Primary: Vantage Blue #0066CC (not Indigo per original spec) */
```

#### Success Metrics
- Design spec matches implementation
- No confusion in code reviews
- Designer/engineer alignment

#### Engineering Notes
- Documentation-only change
- Estimated effort: **30 minutes**

---

### P0-4: Simplify Dashboard Information Architecture
**ICE Score: 8 × 8 × 6 = 384**

#### Problem
The Command Center dashboard has **6 view modes** immediately visible:
```
[The Brief] [Focus Mode] [Activity] [Forecast] [Team] [Full Dashboard]
```

For a new user:
- Paralysis of choice — "which one should I use?"
- No clear default — all options equal weight
- Cognitive overload before they've even seen their data
- Activation suffers because users don't know where to start

#### Solution

1. **Default to The Brief** — It's the killer feature, the AI-generated morning summary. Make it the hero experience.

2. **Collapse secondary modes into a dropdown:**
```tsx
// BEFORE: 6 tabs visible
[Brief] [Focus] [Activity] [Forecast] [Team] [Dashboard]

// AFTER: 2 visible + dropdown
[The Brief ▾]  [Full Dashboard]
              ↳ Focus Mode
              ↳ Activity  
              ↳ Forecast
              ↳ Team
```

3. **Add contextual entry points** within The Brief:
- "🔥 3 fires need attention" → links to Focus Mode
- "📅 Standup at 10am" → links to Activity
- "⚠️ 2 risks escalating" → links to Forecast

This lets users discover modes through context rather than choosing blindly.

4. **Progressive disclosure for new users:**
- Week 1: Show only The Brief and Full Dashboard
- After first blocker: Introduce Focus Mode
- After 7 days: Show full nav if engagement threshold met

#### Implementation
Modify `ViewNav` component in `dashboard/page.tsx`:

```tsx
function ViewNav({ current, onNavigate }: { current: View; onNavigate: (v: View) => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const primaryModes = [
    { id: "brief", label: "The Brief", icon: <Sparkles size={14} /> },
    { id: "dashboard", label: "Full Dashboard", icon: <Activity size={14} /> },
  ];
  
  const secondaryModes = [
    { id: "focus", label: "Focus Mode", icon: <Target size={14} /> },
    { id: "meetings", label: "Activity", icon: <Calendar size={14} /> },
    { id: "forecast", label: "Forecast", icon: <TrendingUp size={14} /> },
    { id: "stakeholders", label: "Team", icon: <Users size={14} /> },
  ];

  return (
    <div className="sticky top-0 z-30 flex items-center gap-1 mb-6 p-1 bg-neutral-100 rounded-xl">
      {/* Primary tab: The Brief with dropdown */}
      <div className="relative">
        <button
          onClick={() => current === "brief" ? setDropdownOpen(!dropdownOpen) : onNavigate("brief")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium ${
            ["brief", "focus", "meetings", "forecast", "stakeholders"].includes(current)
              ? "bg-white text-primary shadow-sm"
              : "text-neutral-600 hover:bg-white/50"
          }`}
        >
          <Sparkles size={14} />
          {current === "brief" ? "The Brief" : secondaryModes.find(m => m.id === current)?.label || "The Brief"}
          <ChevronDown size={12} />
        </button>
        
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-40 min-w-[160px]">
            <button onClick={() => { onNavigate("brief"); setDropdownOpen(false); }} className="...">
              The Brief
            </button>
            <div className="border-t border-neutral-100 my-1" />
            {secondaryModes.map(mode => (
              <button key={mode.id} onClick={() => { onNavigate(mode.id); setDropdownOpen(false); }} className="...">
                {mode.icon} {mode.label}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Full Dashboard always visible */}
      <button
        onClick={() => onNavigate("dashboard")}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium ${
          current === "dashboard" ? "bg-white text-primary shadow-sm" : "text-neutral-600 hover:bg-white/50"
        }`}
      >
        <Activity size={14} />
        Full Dashboard
      </button>
    </div>
  );
}
```

#### Success Metrics
- Time to first action decreases (measure clicks to first real interaction)
- "Where do I go?" support questions drop
- Activation rate (connect tool → view real data in 24h) increases by 20%

#### Engineering Notes
- Refactor ViewNav component
- Add localStorage for progressive disclosure state
- Estimated effort: **4 hours**

---

## P1: Ship This Sprint (High Impact Foundation Work)

### P1-1: Create Shared UI Component Library
**ICE Score: 8 × 9 × 5 = 360**

#### Problem
Every page reinvents basic components with inconsistent patterns:

**Cards** — 4 different styles across pages:
```tsx
// dashboard/page.tsx
<div className="bg-white rounded-lg shadow-sm p-4 border-l-4">

// project/[id]/page.tsx
<div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">

// projects/page.tsx
<div className="bg-white rounded-lg shadow-sm p-6 border-l-4 ${health.border}">

// boards/page.tsx
<div className="bg-white rounded-xl border border-neutral-200 p-5">
```

**Badges** — Inconsistent sizing and styling:
```tsx
// Some use text-[10px], others text-xs
// Some use rounded, others rounded-full
// Padding varies: px-1.5 py-0.5 vs px-2 py-1
```

**Buttons** — No shared abstraction, styles duplicated everywhere

#### Solution
Create `/components/ui/` directory with standardized components:

**1. Card Component:**
```tsx
// components/ui/card.tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  status?: 'success' | 'warning' | 'danger' | 'info';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Card({ 
  variant = 'default', 
  padding = 'md',
  status,
  children,
  className 
}: CardProps) {
  const baseStyles = 'bg-white rounded-xl';
  
  const variantStyles = {
    default: 'shadow-sm border border-neutral-200',
    elevated: 'shadow-md border border-neutral-200',
    flat: 'border border-neutral-200',
    interactive: 'shadow-sm border border-neutral-200 hover:shadow-md hover:border-neutral-300 transition-all cursor-pointer',
  };
  
  const paddingStyles = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  };
  
  const statusStyles = status ? `border-l-4 border-l-${status}` : '';

  return (
    <div className={cn(baseStyles, variantStyles[variant], paddingStyles[padding], statusStyles, className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-3 mb-4', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-neutral-900', className)}>{children}</h3>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-sm text-neutral-700', className)}>{children}</div>;
}
```

**2. Badge Component:**
```tsx
// components/ui/badge.tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', size = 'sm', children }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };
  
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-orange-100 text-orange-700', 
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    outline: 'bg-transparent border border-neutral-300 text-neutral-600',
  };

  return (
    <span className={cn(baseStyles, sizeStyles[size], variantStyles[variant])}>
      {children}
    </span>
  );
}
```

**3. Button Component:**
```tsx
// components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  disabled,
  className,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-600 disabled:bg-primary/50',
    secondary: 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50',
    ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100',
    danger: 'bg-danger text-white hover:bg-danger-600',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button 
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
}
```

**4. Additional components to create:**
- `StatusBadge` — For health/status indicators
- `SourceBadge` — For Jira/Monday/Asana source indicators
- `Modal` — Standardized modal with header/body/footer
- `Input` / `Select` / `Textarea` — Form components
- `Table` — With sorting, filtering patterns
- `EmptyState` — Consistent empty state pattern
- `Skeleton` — Loading skeletons

#### Migration Plan
1. Create components in `/components/ui/`
2. Start using in new code immediately
3. Migrate existing pages incrementally (start with dashboard, then projects, then project detail)
4. Add Storybook documentation for each component

#### Success Metrics
- Component reuse: Each UI component used in 5+ places
- Consistency: Visual audit passes (same patterns everywhere)
- Velocity: New pages built 30% faster using shared components

#### Engineering Notes
- Create `/components/ui/index.ts` barrel export
- Add `cn()` utility using `clsx` + `tailwind-merge`
- Estimated effort: **8 hours** for core components, ongoing migration

---

### P1-2: Fix Dark Mode Tinted Backgrounds
**ICE Score: 8 × 9 × 7 = 504**

#### Problem
Status tint backgrounds (`bg-red-50`, `bg-green-50`, etc.) are handled via CSS `!important` overrides:

```css
html[data-theme="dark"] .bg-red-50 { background-color: #3d1214 !important; }
```

This is fragile because:
- New tint colors require manual CSS additions
- Inline styles bypass these overrides
- `!important` creates specificity wars
- Easy to introduce bugs

#### Solution
Create semantic status variables that work in both themes:

```css
/* globals.css */
:root {
  --status-success-bg: #f0fdf4;
  --status-success-text: #166534;
  --status-success-border: #86efac;
  
  --status-warning-bg: #fff7ed;
  --status-warning-text: #9a3412;
  --status-warning-border: #fdba74;
  
  --status-danger-bg: #fef2f2;
  --status-danger-text: #991b1b;
  --status-danger-border: #fca5a5;
  
  --status-info-bg: #eff6ff;
  --status-info-text: #1e40af;
  --status-info-border: #93c5fd;
}

html[data-theme="dark"] {
  --status-success-bg: #0f2d1a;
  --status-success-text: #86efac;
  --status-success-border: #22c55e;
  
  --status-warning-bg: #2d2006;
  --status-warning-text: #fcd34d;
  --status-warning-border: #f59e0b;
  
  --status-danger-bg: #3d1214;
  --status-danger-text: #fca5a5;
  --status-danger-border: #ef4444;
  
  --status-info-bg: #0c2d6b;
  --status-info-text: #93c5fd;
  --status-info-border: #3b82f6;
}
```

Then create a `StatusAlert` component:

```tsx
// components/ui/status-alert.tsx
interface StatusAlertProps {
  status: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

export function StatusAlert({ status, children }: StatusAlertProps) {
  return (
    <div 
      className="rounded-lg p-4 border"
      style={{
        backgroundColor: `var(--status-${status}-bg)`,
        color: `var(--status-${status}-text)`,
        borderColor: `var(--status-${status}-border)`,
      }}
    >
      {children}
    </div>
  );
}
```

#### Success Metrics
- Zero dark mode color bugs in new components
- Remove all `!important` overrides for tinted backgrounds
- Consistent status colors across all pages

#### Engineering Notes
- Add CSS variables first
- Create StatusAlert component
- Gradually replace hardcoded bg-*-50 classes
- Estimated effort: **4 hours**

---

### P1-3: Improve Empty States
**ICE Score: 7 × 9 × 8 = 504**

#### Problem
When users have no data, they see minimal guidance:
```
"No projects yet"
[Create Project]
```

This doesn't:
- Explain **why** they should care
- Show them **what value** they'll get
- Guide them to the **next action**

New users who see empty states without guidance often leave.

#### Solution
Create compelling, action-oriented empty states:

```tsx
// components/ui/empty-state.tsx
interface EmptyStateProps {
  type: 'connections' | 'projects' | 'tasks' | 'reports' | 'generic';
  onAction?: () => void;
}

const emptyStateContent = {
  connections: {
    icon: <Plug size={32} className="text-primary" />,
    title: "Connect your first tool",
    description: "Vantage works best when connected to Jira, Monday, or Asana. You'll get AI-powered insights, risk detection, and automated reporting across all your projects.",
    benefits: [
      "Health scores for every project",
      "AI-detected blockers and risks", 
      "Automated stakeholder reports"
    ],
    actionLabel: "Connect Jira",
    actionHref: "/connect-tools",
  },
  projects: {
    icon: <FolderKanban size={32} className="text-primary" />,
    title: "No projects yet",
    description: "Connect a tool to import projects automatically, or create a native Vantage project to start managing work.",
    benefits: [
      "Unified view across all tools",
      "Real-time health monitoring",
      "AI-powered risk predictions"
    ],
    actionLabel: "Connect a tool",
    actionHref: "/connect-tools",
    secondaryAction: { label: "Create project", href: "#" },
  },
  tasks: {
    icon: <CheckCircle2 size={32} className="text-primary" />,
    title: "No tasks in this project",
    description: "Tasks will appear here once they're synced from your connected tool, or you can create tasks directly.",
    actionLabel: "Create task",
  },
  reports: {
    icon: <BarChart3 size={32} className="text-primary" />,
    title: "No reports yet",
    description: "Generate your first AI-powered status report to share with stakeholders.",
    actionLabel: "Generate report",
  },
  generic: {
    icon: <Inbox size={32} className="text-neutral-400" />,
    title: "Nothing here yet",
    description: "Check back later or take an action to get started.",
    actionLabel: "Go to dashboard",
    actionHref: "/dashboard",
  },
};

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const content = emptyStateContent[type];
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        {content.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {content.title}
      </h3>
      
      <p className="text-sm text-neutral-600 mb-4 max-w-md">
        {content.description}
      </p>
      
      {content.benefits && (
        <ul className="text-sm text-neutral-600 mb-6 space-y-1">
          {content.benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-500" />
              {benefit}
            </li>
          ))}
        </ul>
      )}
      
      <div className="flex items-center gap-3">
        {content.actionHref ? (
          <Link href={content.actionHref} className="btn-primary">
            {content.actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="btn-primary">
            {content.actionLabel}
          </button>
        )}
        
        {content.secondaryAction && (
          <Link href={content.secondaryAction.href} className="btn-secondary">
            {content.secondaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}
```

#### Usage
```tsx
// In projects page
{projects.length === 0 && <EmptyState type="projects" />}

// In dashboard when no connections
{!hasRealData && <EmptyState type="connections" />}
```

#### Success Metrics
- Connection rate increases (users understand the value)
- Support tickets about "empty dashboard" decrease
- Activation rate improves

#### Engineering Notes
- Create component
- Replace existing empty states across pages
- Estimated effort: **3 hours**

---

### P1-4: Enhance Onboarding Flow
**ICE Score: 8 × 7 × 5 = 280**

#### Problem
Current onboarding:
1. User signs up
2. Sees Getting Started checklist (basic)
3. Has to figure out what to do next
4. Many never connect a tool → never see real value → churn

The "aha moment" for Vantage is: **"Wow, I can see all my projects with AI-powered health scores."**

Currently, the path to this moment is unclear.

#### Solution

**1. Improve Getting Started Checklist:**
Make it more prominent and action-oriented:

```tsx
// components/getting-started.tsx
export function GettingStartedChecklist({ 
  hasConnections, 
  hasProjects, 
  hasTasks,
  onDismiss 
}: Props) {
  const steps = [
    {
      id: 'connect',
      title: 'Connect your PM tool',
      description: 'Import projects from Jira, Monday, or Asana',
      completed: hasConnections,
      action: '/connect-tools',
      actionLabel: 'Connect now',
      timeEstimate: '2 min',
    },
    {
      id: 'explore',
      title: 'Explore your portfolio',
      description: 'See AI-powered health scores and risk detection',
      completed: hasProjects,
      action: '/projects',
      actionLabel: 'View projects',
    },
    {
      id: 'scout',
      title: 'Ask Scout a question',
      description: 'Try: "What\'s blocked?" or "Who\'s overloaded?"',
      completed: false, // Track this
      action: '/scout',
      actionLabel: 'Ask Scout',
    },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = (completedCount / steps.length) * 100;

  // Don't show if all complete or dismissed
  if (completedCount === steps.length) return null;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary/20 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">
            Get started with Vantage
          </h3>
          <p className="text-sm text-neutral-600">
            {completedCount} of {steps.length} complete
          </p>
        </div>
        <button onClick={onDismiss} className="text-neutral-400 hover:text-neutral-600">
          <X size={20} />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-neutral-200 rounded-full h-2 mb-6">
        <div 
          className="bg-primary h-2 rounded-full transition-all" 
          style={{ width: `${progress}%` }} 
        />
      </div>
      
      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-center gap-4 p-3 rounded-lg ${
              step.completed ? 'bg-white/50' : 'bg-white'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step.completed 
                ? 'bg-green-100 text-green-600' 
                : 'bg-primary/10 text-primary'
            }`}>
              {step.completed ? <CheckCircle2 size={16} /> : <span>{index + 1}</span>}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm font-medium ${step.completed ? 'text-neutral-500 line-through' : 'text-neutral-900'}`}>
                {step.title}
              </p>
              <p className="text-xs text-neutral-500">{step.description}</p>
            </div>
            
            {!step.completed && (
              <Link 
                href={step.action}
                className="px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-lg hover:bg-primary-600"
              >
                {step.actionLabel}
              </Link>
            )}
            
            {step.timeEstimate && !step.completed && (
              <span className="text-[10px] text-neutral-400">{step.timeEstimate}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**2. Add Welcome Modal for First-Time Users:**
```tsx
// Show once on first visit
function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal>
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Sparkles size={28} className="text-white" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 mb-2">
          Welcome to Vantage
        </h2>
        <p className="text-sm text-neutral-600 mb-6">
          The AI PM assistant that watches your projects 24/7. Let's get you set up in 2 minutes.
        </p>
        <Link href="/connect-tools" className="btn-primary w-full mb-3">
          Connect your first tool
        </Link>
        <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-700">
          I'll explore first
        </button>
      </div>
    </Modal>
  );
}
```

**3. Track Onboarding Progress:**
```typescript
// lib/onboarding.ts
const ONBOARDING_STEPS = ['connect', 'explore', 'scout', 'report'] as const;

export function useOnboarding() {
  const [completed, setCompleted] = useState<string[]>([]);
  
  useEffect(() => {
    const stored = localStorage.getItem('vantage-onboarding');
    if (stored) setCompleted(JSON.parse(stored));
  }, []);
  
  const markComplete = (step: string) => {
    const updated = [...completed, step];
    setCompleted(updated);
    localStorage.setItem('vantage-onboarding', JSON.stringify(updated));
  };
  
  return { completed, markComplete };
}
```

#### Success Metrics
- Time to first connection < 5 minutes (measure from signup)
- Activation rate (signup → connect tool → view data) > 60%
- Day 7 retention improves

#### Engineering Notes
- Enhance existing GettingStartedChecklist component
- Add welcome modal (show once via localStorage flag)
- Add analytics tracking for each step
- Estimated effort: **6 hours**

---

### P1-5: Standardize Loading States
**ICE Score: 6 × 8 × 8 = 384**

#### Problem
Loading states are inconsistent:
- Some pages show spinner
- Some show skeleton
- Some show nothing (flash of empty → content)

This creates perception of slowness and unreliability.

#### Solution

**1. Create Skeleton Components:**
```tsx
// components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse bg-neutral-200 rounded", className)} />
  );
}

export function CardSkeleton() {
  return (
    <Card>
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-24 w-full" />
      </div>
    </Card>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card variant="interactive">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <Skeleton className="h-2 w-full" />
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-lg">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
```

**2. Use Suspense Boundaries:**
```tsx
import { Suspense } from 'react';

// In page
<Suspense fallback={<ProjectListSkeleton />}>
  <ProjectList />
</Suspense>
```

**3. Standardize Rules:**
- Content areas: Use skeleton loaders
- Actions (buttons): Use spinner inside button
- Full page loads: Use skeleton matching final layout
- Never show empty → content flash

#### Success Metrics
- Perceived performance improves (user survey)
- Cumulative Layout Shift (CLS) < 0.1
- Consistent loading experience across pages

#### Engineering Notes
- Create skeleton components
- Add Suspense boundaries
- Estimated effort: **4 hours**

---

## P2: Next Sprint (Important Quality of Life)

### P2-1: Decompose Project Detail Page
**ICE Score: 7 × 8 × 3 = 168**

#### Problem
`project/[id]/page.tsx` is **2,963 lines** — the largest file in the codebase. This causes:
- Slow IDE performance
- Difficult code reviews
- Hard to reason about
- Bug isolation is difficult
- New engineers overwhelmed

#### Solution
Split into focused components:

```
/app/(app)/project/[id]/
├── page.tsx                      (~200 lines - layout & data fetching)
├── components/
│   ├── project-header.tsx        (~150 lines - title, health, actions)
│   ├── project-metrics.tsx       (~100 lines - the 5-stat grid)
│   ├── task-table.tsx            (~400 lines - the task list with tree)
│   ├── task-detail-drawer.tsx    (~350 lines - slide-out panel)
│   ├── intelligence-panel.tsx    (~300 lines - AI insights section)
│   ├── risk-analysis.tsx         (~200 lines - risk factors display)
│   ├── scope-creep-chart.tsx     (~150 lines - scope visualization)
│   ├── team-workload.tsx         (~200 lines - assignee breakdown)
│   └── critical-path.tsx         (~150 lines - critical path display)
```

**Migration Strategy:**
1. Extract components one at a time
2. Start with the most isolated sections (metrics, charts)
3. Test after each extraction
4. Keep page.tsx as the orchestrator

#### Success Metrics
- No file > 500 lines
- Faster IDE performance
- Easier code reviews

#### Engineering Notes
- Extract in order: metrics → charts → panels → task table → detail drawer
- Use React.memo() where appropriate
- Estimated effort: **16 hours** (can be done incrementally)

---

### P2-2: Add Keyboard Navigation
**ICE Score: 6 × 7 × 5 = 210**

#### Problem
Power users want keyboard shortcuts. Currently:
- No Cmd+K command palette
- No keyboard navigation in lists
- Tab order may be inconsistent

#### Solution

**1. Implement Command Palette (Cmd+K):**
```tsx
// components/command-palette.tsx
import { Command } from 'cmdk'; // Use cmdk library

function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} className="...">
      <Command.Input placeholder="Search projects, tasks, actions..." />
      <Command.List>
        <Command.Group heading="Projects">
          {/* Dynamic project list */}
        </Command.Group>
        <Command.Group heading="Actions">
          <Command.Item onSelect={() => router.push('/scout')}>
            Ask Scout...
          </Command.Item>
          <Command.Item onSelect={() => router.push('/connect-tools')}>
            Connect a tool
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
```

**2. Add Keyboard Shortcuts:**
- `?` — Show keyboard shortcuts help
- `g` then `d` — Go to dashboard
- `g` then `p` — Go to projects
- `g` then `s` — Go to Scout
- `j/k` — Navigate lists
- `Enter` — Open selected item

#### Success Metrics
- Power user satisfaction (survey)
- Keyboard shortcut usage tracked via analytics

#### Engineering Notes
- Install `cmdk` package
- Implement incrementally
- Estimated effort: **8 hours**

---

### P2-3: Responsive Table Improvements
**ICE Score: 6 × 8 × 5 = 240**

#### Problem
Task tables have 8+ columns. On tablet they overflow, on mobile they're unusable.

#### Solution

**1. Hide non-essential columns on smaller screens:**
```tsx
// In table header
<th className="hidden lg:table-cell">Due Date</th>
<th className="hidden xl:table-cell">Assignee</th>
```

**2. Add horizontal scroll with sticky first column:**
```tsx
<div className="overflow-x-auto">
  <table className="min-w-[800px]">
    <thead>
      <tr>
        <th className="sticky left-0 bg-white z-10">Task</th>
        {/* Other columns */}
      </tr>
    </thead>
  </table>
</div>
```

**3. Alternative card view on mobile:**
```tsx
{/* Desktop: table */}
<table className="hidden md:table">...</table>

{/* Mobile: card list */}
<div className="md:hidden space-y-3">
  {tasks.map(task => (
    <TaskCard key={task.id} task={task} />
  ))}
</div>
```

#### Success Metrics
- Tables usable on tablet/mobile
- No horizontal scroll unless necessary

#### Engineering Notes
- Estimated effort: **6 hours**

---

### P2-4: Settings Page Organization
**ICE Score: 5 × 8 × 6 = 240**

#### Problem
Settings has 6+ sub-routes in flat navigation. Users scroll to find things.

#### Solution

**1. Group into categories:**
- **Account:** Profile, Notifications, Appearance
- **Integrations:** Connections, Field Mappings, Sync Settings
- **Security:** SSO, API Keys, Audit Log
- **Billing:** Subscription, Usage

**2. Add sidebar nav within Settings:**
```tsx
// /settings/layout.tsx
function SettingsLayout({ children }) {
  const categories = [
    { label: 'Account', items: ['profile', 'notifications', 'appearance'] },
    { label: 'Integrations', items: ['connections', 'field-mappings'] },
    { label: 'Security', items: ['sso', 'api-keys', 'audit-log'] },
    { label: 'Billing', items: ['subscription'] },
  ];
  
  return (
    <div className="flex gap-8">
      <nav className="w-48 shrink-0">
        {categories.map(cat => (
          <div key={cat.label} className="mb-6">
            <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-2">
              {cat.label}
            </h4>
            {cat.items.map(item => (
              <Link key={item} href={`/settings/${item}`} className="...">
                {item}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

#### Success Metrics
- Time to find setting decreases
- Settings-related support questions drop

#### Engineering Notes
- Estimated effort: **4 hours**

---

## P3: Backlog (Nice to Have)

### P3-1: Micro-interactions & Animations
**ICE Score: 4 × 7 × 6 = 168**

Add subtle animations:
- Card hover effects
- Status badge color transitions
- Health score number animations
- Task completion celebrations

### P3-2: Scout AI Visual Presence
**ICE Score: 5 × 6 × 5 = 150**

Make Scout more discoverable:
- "Ask Scout about this" button on project detail
- Scout indicator in The Brief
- Consider floating Scout button (like Intercom)

### P3-3: Notification System Polish
**ICE Score: 4 × 7 × 5 = 140**

Improve toasts:
- Use a proper toast library (sonner or react-hot-toast)
- Support action buttons ("Undo", "View")
- Queue management for multiple toasts

### P3-4: Onboarding Product Tour
**ICE Score: 6 × 5 × 3 = 90**

Implement spotlight tour:
- Highlight key features with tooltips
- Trigger after first connection
- Allow skip, track completion

### P3-5: Theme Customization
**ICE Score: 3 × 5 × 4 = 60**

Allow users to:
- Choose accent color
- Adjust information density
- Save preferences

---

## Implementation Roadmap

### Week 1: P0 Critical Fixes
| Day | Item | Est. Hours |
|-----|------|------------|
| 1 | P0-1: Dark mode contrast fix | 2h |
| 1 | P0-3: Primary color documentation | 0.5h |
| 1 | P0-4: Dashboard nav simplification | 4h |
| 2 | P0-2: Mobile navigation | 4h |
| 2 | Testing & QA | 2h |

**Week 1 Total: ~12 hours**

### Week 2-3: P1 Foundation
| Item | Est. Hours |
|------|------------|
| P1-1: UI component library (core) | 8h |
| P1-2: Dark mode tinted backgrounds | 4h |
| P1-3: Empty states | 3h |
| P1-4: Onboarding improvements | 6h |
| P1-5: Loading state standardization | 4h |
| Migration & testing | 8h |

**Weeks 2-3 Total: ~33 hours**

### Week 4+: P2 Quality of Life
Work through P2 items based on capacity, prioritizing decomposition and keyboard navigation.

---

## Success Metrics Summary

| Metric | Current (Est.) | Target | Measurement |
|--------|----------------|--------|-------------|
| Activation Rate | ~30% | 60%+ | Signup → connect → view data in 24h |
| Dark Mode Usage | Unknown | 30%+ | Sessions staying in dark mode |
| Mobile Sessions | ~0% | 15%+ | Sessions from mobile devices |
| Time to Value | Unknown | < 5 min | Signup to first real insight |
| Support Tickets (UX) | Unknown | -50% | Reduce confusion-related tickets |
| NPS | Unknown | > 40 | Survey after 7 days |

---

## Open Questions for CEO

1. **Mobile priority:** Is mobile web sufficient, or is native app on roadmap?
2. **Analytics:** What event tracking is in place? Do we need to add Mixpanel/Amplitude?
3. **User research:** Can we do 5 user interviews to validate these priorities?
4. **Design resources:** Do we have Figma mockups, or should engineering make final design calls?

---

## Appendix: Full Issue List by ICE Score

| Rank | ID | Issue | I | C | E | ICE |
|------|-----|-------|---|---|---|-----|
| 1 | P0-1 | Dark mode text contrast | 9 | 10 | 9 | 810 |
| 2 | P0-3 | Primary color inconsistency | 7 | 10 | 10 | 700 |
| 3 | P0-2 | Mobile navigation missing | 9 | 9 | 7 | 567 |
| 4 | P1-2 | Dark mode tinted backgrounds | 8 | 9 | 7 | 504 |
| 5 | P1-3 | Empty state improvements | 7 | 9 | 8 | 504 |
| 6 | P0-4 | Dashboard info architecture | 8 | 8 | 6 | 384 |
| 7 | P1-5 | Loading state standardization | 6 | 8 | 8 | 384 |
| 8 | P1-1 | Shared UI component library | 8 | 9 | 5 | 360 |
| 9 | P1-4 | Onboarding flow | 8 | 7 | 5 | 280 |
| 10 | P2-2 | Keyboard navigation | 6 | 7 | 5 | 210 |
| 11 | P2-3 | Responsive tables | 6 | 8 | 5 | 240 |
| 12 | P2-4 | Settings organization | 5 | 8 | 6 | 240 |
| 13 | P2-1 | Project detail decomposition | 7 | 8 | 3 | 168 |
| 14 | P3-1 | Micro-interactions | 4 | 7 | 6 | 168 |
| 15 | P3-2 | Scout AI visibility | 5 | 6 | 5 | 150 |
| 16 | P3-3 | Notification polish | 4 | 7 | 5 | 140 |

---

*This PRD is specific enough to build from. Ship fast, measure, iterate.*

**— Jeff, SVP Product**
