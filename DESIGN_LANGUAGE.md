# Vantage Design Language
## Foundational Design System v1.0

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Canonical Reference  

---

## 1. Design Philosophy

Vantage is a PM intelligence platform that transforms complexity into clarity. The design language reflects this mission:

**Core Principles:**

1. **Clarity Over Density** — Information should be scannable in seconds, not studied for minutes
2. **Warmth Over Coldness** — Enterprise software doesn't have to feel sterile; we're a partner, not a dashboard
3. **Action Over Observation** — Every screen should lead toward doing, not just viewing
4. **Consistency Over Novelty** — Predictable patterns reduce cognitive load
5. **Progressive Disclosure** — Show what matters first; details on demand

**Visual Identity Keywords:** Clean, confident, intelligent, approachable, modern

---

## 2. Color System

### 2.1 Color Tokens (CSS Custom Properties)

All colors are defined as CSS custom properties for consistency and theming.

```css
:root {
  /* Primary Brand — Vantage Blue (NOT Indigo; updated Feb 2026) */
  --color-primary: #0066CC;        /* Vantage Blue - Main brand action color */
  --color-primary-50: #E6F2FF;
  --color-primary-100: #CCE5FF;
  --color-primary-600: #0052A3;
  --color-primary-700: #003D7A;

  /* Neutral (Gray Scale) */
  --color-neutral-50: #fafafa;
  --color-neutral-100: #f4f4f5;
  --color-neutral-200: #e4e4e7;
  --color-neutral-300: #d4d4d8;
  --color-neutral-400: #a1a1aa;
  --color-neutral-500: #71717a;
  --color-neutral-600: #52525b;
  --color-neutral-700: #3f3f46;
  --color-neutral-800: #27272a;
  --color-neutral-900: #18181b;
  --color-neutral-950: #09090b;

  /* Semantic Status Colors */
  --color-success: #22c55e;        /* Green-500 */
  --color-success-50: #f0fdf4;
  --color-success-100: #dcfce7;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-success-700: #15803d;

  --color-warning: #f97316;        /* Orange-500 */
  --color-warning-50: #fff7ed;
  --color-warning-100: #ffedd5;
  --color-warning-500: #f97316;
  --color-warning-600: #ea580c;
  --color-warning-700: #c2410c;

  --color-danger: #ef4444;         /* Red-500 */
  --color-danger-50: #fef2f2;
  --color-danger-100: #fee2e2;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
  --color-danger-700: #b91c1c;

  --color-info: #3b82f6;           /* Blue-500 */
  --color-info-50: #eff6ff;
  --color-info-100: #dbeafe;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
  --color-info-700: #1d4ed8;

  /* Surface Colors */
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;
  --color-surface-overlay: #ffffff;
  --color-surface-sunken: #fafafa;

  /* Border Colors */
  --color-border: #e4e4e7;         /* neutral-200 */
  --color-border-light: #f4f4f5;   /* neutral-100 */
  --color-border-focus: #6366f1;   /* primary */

  /* Text Colors */
  --color-text-primary: #18181b;   /* neutral-900 */
  --color-text-secondary: #52525b; /* neutral-600 */
  --color-text-tertiary: #a1a1aa;  /* neutral-400 */
  --color-text-inverse: #ffffff;
  --color-text-link: #6366f1;      /* primary */
}
```

### 2.2 Integration Source Colors

Each connected tool has a branded color for visual identification:

| Source | Color | Hex | Usage |
|--------|-------|-----|-------|
| Jira | Blue | `#0052CC` | Source badges, sync indicators |
| Monday.com | Red | `#FF3D57` | Source badges, sync indicators |
| Asana | Salmon | `#F06A6A` | Source badges, sync indicators |
| Confluence | Blue | `#1868DB` | Source badges, integration cards |
| Slack | Purple | `#4A154B` | Source badges, integration cards |
| Google Calendar | Blue | `#4285F4` | Calendar indicators |
| Vantage Native | Indigo | `#6366f1` | Items created in Vantage |

### 2.3 Severity/Risk Colors

Used consistently across Risk Radar, alerts, health scores:

| Severity | Dot Color | Background | Text |
|----------|-----------|------------|------|
| Critical | `bg-red-500` | `bg-red-50` | `text-red-700` |
| High | `bg-orange-500` | `bg-orange-50` | `text-orange-700` |
| Medium | `bg-yellow-500` | `bg-yellow-50` | `text-yellow-700` |
| Low | `bg-green-500` | `bg-green-50` | `text-green-700` |

### 2.4 Health Score Color Mapping

Dynamic color based on numeric value:

```typescript
function getHealthColor(score: number): string {
  if (score >= 80) return 'text-success-600';      // Green
  if (score >= 60) return 'text-warning-600';      // Orange
  if (score >= 40) return 'text-warning-700';      // Dark Orange
  return 'text-danger-600';                         // Red
}
```

### 2.5 Always-Dark Surfaces

Certain UI elements maintain dark styling regardless of theme (for visual hierarchy):

```css
.banner-dark {
  background: linear-gradient(135deg, #0d1117 0%, #161b22 100%);
  color: #ffffff;
}
```

Used for: Portfolio Pulse header, The Brief headline banner, critical alert banners.

---

## 3. Typography

### 3.1 Font Family

**Primary:** Inter (Google Fonts)

```css
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

### 3.2 Type Scale

Based on Tailwind's default scale with semantic naming:

| Name | Class | Size | Weight | Line Height | Usage |
|------|-------|------|--------|-------------|-------|
| Display XL | `text-4xl` | 36px | 700 | 1.2 | Landing page heroes |
| Display | `text-3xl` | 30px | 700 | 1.2 | Page titles |
| Heading 1 | `text-2xl` | 24px | 600 | 1.3 | Section headers |
| Heading 2 | `text-xl` | 20px | 600 | 1.4 | Card headers, sub-sections |
| Heading 3 | `text-lg` | 18px | 600 | 1.4 | Sub-sub-sections |
| Body Large | `text-base` | 16px | 400 | 1.5 | Primary body text |
| Body | `text-sm` | 14px | 400 | 1.5 | Default body, form labels |
| Caption | `text-xs` | 12px | 400 | 1.4 | Metadata, timestamps |
| Micro | `text-[10px]` | 10px | 500 | 1.3 | Badges, pills |

### 3.3 Font Weights

```css
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

### 3.4 Semantic Text Styles

```css
/* Page Title */
.text-page-title {
  @apply text-2xl font-semibold text-neutral-900;
}

/* Section Header */
.text-section-header {
  @apply text-xl font-semibold text-neutral-900;
}

/* Card Title */
.text-card-title {
  @apply text-lg font-semibold text-neutral-900;
}

/* Body Primary */
.text-body {
  @apply text-sm text-neutral-700;
}

/* Body Secondary */
.text-body-secondary {
  @apply text-sm text-neutral-500;
}

/* Caption/Meta */
.text-caption {
  @apply text-xs text-neutral-400;
}
```

---

## 4. Spacing System

### 4.1 Base Unit

All spacing derives from a 4px base unit.

### 4.2 Spacing Scale

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--space-0` | 0px | `p-0` | Reset |
| `--space-1` | 4px | `p-1` | Tight internal padding |
| `--space-2` | 8px | `p-2` | Badge padding, icon gaps |
| `--space-3` | 12px | `p-3` | Small card padding |
| `--space-4` | 16px | `p-4` | Default card padding |
| `--space-5` | 20px | `p-5` | Medium card padding |
| `--space-6` | 24px | `p-6` | Large card padding |
| `--space-8` | 32px | `p-8` | Section gaps |
| `--space-10` | 40px | `p-10` | Large section gaps |
| `--space-12` | 48px | `p-12` | Page section margins |
| `--space-16` | 64px | `p-16` | Major layout gaps |

### 4.3 Semantic Spacing

| Context | Spacing |
|---------|---------|
| Card internal padding | `p-4` to `p-6` |
| Card gap (in grid) | `gap-4` to `gap-6` |
| Section gap | `gap-8` |
| Page margin (horizontal) | `px-6` (mobile), `px-8` (desktop) |
| Form field gap | `gap-4` |
| Button icon gap | `gap-2` |
| Badge internal | `px-2 py-0.5` |

---

## 5. Layout System

### 5.1 Page Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ Header (fixed, h-16, full width)                                    │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ Sidebar  │  Main Content Area                                       │
│ (fixed,  │  (scrollable, ml-64)                                     │
│ w-64)    │                                                          │
│          │  ┌──────────────────────────────────────────────────┐   │
│          │  │ Page Header (title, breadcrumb, actions)         │   │
│          │  ├──────────────────────────────────────────────────┤   │
│          │  │ Page Content                                      │   │
│          │  │                                                    │   │
│          │  │                                                    │   │
│          │  └──────────────────────────────────────────────────┘   │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### 5.2 Dimensions

| Element | Value |
|---------|-------|
| Header height | `h-16` (64px) |
| Sidebar width | `w-64` (256px) |
| Main content max-width | `max-w-7xl` (1280px) |
| Content area padding | `p-6` to `p-8` |

### 5.3 Grid System

Use CSS Grid or Flexbox via Tailwind. Common patterns:

```html
<!-- 3-column card grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- 2-column dashboard layout -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2"><!-- Main content --></div>
  <div><!-- Sidebar content --></div>
</div>

<!-- Stats row -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
```

### 5.4 Responsive Breakpoints

Following Tailwind defaults:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |

**Mobile-first:** Default styles are mobile; use breakpoints to enhance for larger screens.

---

## 6. Component Patterns

### 6.1 Cards

The primary container for grouped content.

**Standard Card:**
```html
<div class="bg-white rounded-xl shadow-sm border border-neutral-100 p-6">
  <div class="flex items-center gap-3 mb-4">
    <LucideIcon class="w-5 h-5 text-primary-500" />
    <h3 class="text-lg font-semibold text-neutral-900">Card Title</h3>
  </div>
  <div class="text-sm text-neutral-600">
    Card content goes here.
  </div>
</div>
```

**Card Variants:**

| Variant | Classes | Usage |
|---------|---------|-------|
| Default | `bg-white rounded-xl shadow-sm border border-neutral-100` | Standard content cards |
| Elevated | `bg-white rounded-xl shadow-md border border-neutral-100` | Modals, popovers |
| Flat | `bg-neutral-50 rounded-xl border border-neutral-100` | Nested cards, secondary info |
| Interactive | Add `hover:shadow-md hover:border-neutral-200 transition-all cursor-pointer` | Clickable cards |
| Alert | `bg-[status]-50 border-[status]-200 rounded-xl` | Status-specific cards |

**Card Sections:**
```html
<div class="bg-white rounded-xl shadow-sm border border-neutral-100 divide-y divide-neutral-100">
  <div class="p-4">Section 1</div>
  <div class="p-4">Section 2</div>
  <div class="p-4">Section 3</div>
</div>
```

### 6.2 Buttons

**Primary Button:**
```html
<button class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
  <LucideIcon class="w-4 h-4" />
  Button Label
</button>
```

**Button Variants:**

| Variant | Classes |
|---------|---------|
| Primary | `bg-primary-500 text-white hover:bg-primary-600` |
| Secondary | `bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50` |
| Ghost | `bg-transparent text-neutral-600 hover:bg-neutral-100` |
| Danger | `bg-danger-500 text-white hover:bg-danger-600` |
| Success | `bg-success-500 text-white hover:bg-success-600` |

**Button Sizes:**

| Size | Classes |
|------|---------|
| Small | `px-3 py-1.5 text-xs` |
| Default | `px-4 py-2 text-sm` |
| Large | `px-6 py-3 text-base` |

**Button States:**
- Disabled: `opacity-50 cursor-not-allowed`
- Loading: Replace icon with spinner, add `pointer-events-none`

### 6.3 Badges & Pills

**Standard Badge:**
```html
<span class="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded bg-primary-100 text-primary-700">
  Badge Label
</span>
```

**Status Badges:**

| Status | Classes |
|--------|---------|
| Success | `bg-success-100 text-success-700` |
| Warning | `bg-warning-100 text-warning-700` |
| Danger | `bg-danger-100 text-danger-700` |
| Info | `bg-info-100 text-info-700` |
| Neutral | `bg-neutral-100 text-neutral-700` |

**Source Badges (Integration):**
```html
<span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-medium rounded bg-neutral-100 text-neutral-700">
  <span class="w-2 h-2 rounded-sm" style="background: #0052CC"></span>
  Jira
</span>
```

**Severity Pills:**
```html
<span class="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full bg-danger-100 text-danger-700">
  <span class="w-1.5 h-1.5 rounded-full bg-danger-500"></span>
  Critical
</span>
```

### 6.4 Forms

**Text Input:**
```html
<div class="space-y-1.5">
  <label class="block text-sm font-medium text-neutral-700">
    Label
  </label>
  <input
    type="text"
    class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-neutral-400"
    placeholder="Placeholder text"
  />
  <p class="text-xs text-neutral-500">Helper text goes here.</p>
</div>
```

**Select:**
```html
<select class="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

**Checkbox:**
```html
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox" class="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
  <span class="text-sm text-neutral-700">Checkbox label</span>
</label>
```

**Toggle Switch:**
```html
<button
  class="relative w-11 h-6 bg-neutral-200 rounded-full transition-colors data-[checked]:bg-primary-500"
  data-checked
>
  <span class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform data-[checked]:translate-x-5"></span>
</button>
```

**Form Error State:**
```html
<input class="... border-danger-300 focus:ring-danger-500" />
<p class="text-xs text-danger-600">Error message here.</p>
```

### 6.5 Tables

**Standard Table:**
```html
<div class="bg-white rounded-xl border border-neutral-100 overflow-hidden">
  <table class="w-full">
    <thead>
      <tr class="bg-neutral-50 border-b border-neutral-100">
        <th class="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Column
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-neutral-100">
      <tr class="hover:bg-neutral-50 transition-colors">
        <td class="px-4 py-3 text-sm text-neutral-900">
          Cell content
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

**Table Features:**
- Sortable columns: Add sort icons and hover state to th
- Row actions: Right-aligned cell with icon buttons
- Selection: Checkbox in first column
- Empty state: Full-width row with centered message

### 6.6 Modals

**Modal Structure:**
```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 z-40" />

<!-- Modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
      <h2 class="text-lg font-semibold text-neutral-900">Modal Title</h2>
      <button class="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg hover:bg-neutral-100">
        <X class="w-5 h-5" />
      </button>
    </div>
    
    <!-- Body -->
    <div class="px-6 py-4 overflow-y-auto">
      Modal content
    </div>
    
    <!-- Footer -->
    <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

**Modal Sizes:**

| Size | Max Width |
|------|-----------|
| Small | `max-w-md` (448px) |
| Default | `max-w-lg` (512px) |
| Large | `max-w-2xl` (672px) |
| XL | `max-w-4xl` (896px) |
| Full | `max-w-[90vw]` |

### 6.7 Navigation

**Sidebar Navigation:**
```html
<nav class="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-neutral-100 overflow-y-auto">
  <div class="p-4 space-y-1">
    <!-- Active item -->
    <a class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
      <LayoutDashboard class="w-5 h-5" />
      Dashboard
    </a>
    
    <!-- Inactive item -->
    <a class="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors">
      <FolderKanban class="w-5 h-5" />
      Projects
    </a>
  </div>
</nav>
```

**Tab Navigation (Pill Style):**
```html
<div class="inline-flex p-1 bg-neutral-100 rounded-xl">
  <button class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg">
    Active Tab
  </button>
  <button class="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg">
    Inactive Tab
  </button>
</div>
```

**Tab Navigation (Underline Style):**
```html
<div class="flex border-b border-neutral-200">
  <button class="px-4 py-2 text-sm font-medium text-primary-600 border-b-2 border-primary-500">
    Active
  </button>
  <button class="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-700 border-b-2 border-transparent">
    Inactive
  </button>
</div>
```

### 6.8 Header

**App Header:**
```html
<header class="fixed top-0 left-0 right-0 h-16 bg-white border-b border-neutral-100 z-30">
  <div class="flex items-center justify-between h-full px-6">
    <!-- Logo -->
    <div class="flex items-center gap-2">
      <Logo class="w-8 h-8" />
      <span class="text-xl font-bold text-neutral-900">Vantage</span>
    </div>
    
    <!-- Search -->
    <div class="flex-1 max-w-md mx-8">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input 
          class="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg"
          placeholder="Search projects, tasks, people..."
        />
      </div>
    </div>
    
    <!-- Actions -->
    <div class="flex items-center gap-4">
      <SyncIndicator />
      <ThemeToggle />
      <NotificationBell />
      <Avatar />
    </div>
  </div>
</header>
```

### 6.9 Progress Indicators

**Progress Bar:**
```html
<div class="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
  <div 
    class="h-full bg-primary-500 rounded-full transition-all duration-300"
    style="width: 65%"
  ></div>
</div>
```

**Health Progress Bar (Color-coded):**
```html
<div class="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
  <div 
    class="h-full bg-success-500 rounded-full"
    style="width: 82%"
  ></div>
</div>
```

**Circular Progress (for health scores):**
```html
<div class="relative w-16 h-16">
  <svg class="w-full h-full -rotate-90">
    <circle cx="32" cy="32" r="28" class="fill-none stroke-neutral-100 stroke-[4]" />
    <circle 
      cx="32" cy="32" r="28" 
      class="fill-none stroke-success-500 stroke-[4]"
      stroke-dasharray="176"
      stroke-dashoffset="31.68" <!-- 176 * (1 - 0.82) -->
    />
  </svg>
  <span class="absolute inset-0 flex items-center justify-center text-xl font-bold text-success-600">
    82
  </span>
</div>
```

### 6.10 Empty States

```html
<div class="flex flex-col items-center justify-center py-12 text-center">
  <div class="w-16 h-16 mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
    <FolderOpen class="w-8 h-8 text-neutral-400" />
  </div>
  <h3 class="text-lg font-semibold text-neutral-900 mb-2">No projects yet</h3>
  <p class="text-sm text-neutral-500 mb-4 max-w-sm">
    Connect your tools to import projects, or create one from scratch.
  </p>
  <button class="btn-primary">
    <Plus class="w-4 h-4" />
    Create Project
  </button>
</div>
```

### 6.11 Loading States

**Skeleton:**
```html
<div class="animate-pulse space-y-4">
  <div class="h-4 bg-neutral-200 rounded w-3/4"></div>
  <div class="h-4 bg-neutral-200 rounded w-1/2"></div>
  <div class="h-32 bg-neutral-200 rounded"></div>
</div>
```

**Spinner:**
```html
<svg class="animate-spin w-5 h-5 text-primary-500" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
</svg>
```

### 6.12 Tooltips

```html
<div class="relative group">
  <button>Hover me</button>
  <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-neutral-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
    Tooltip text
    <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></div>
  </div>
</div>
```

### 6.13 Alerts & Toasts

**Inline Alert:**
```html
<div class="flex items-start gap-3 p-4 bg-warning-50 border border-warning-200 rounded-lg">
  <AlertTriangle class="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
  <div>
    <h4 class="text-sm font-medium text-warning-800">Warning Title</h4>
    <p class="text-sm text-warning-700 mt-1">Warning description goes here.</p>
  </div>
</div>
```

**Toast Notification:**
```html
<div class="fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-lg shadow-lg">
  <Check class="w-5 h-5 text-success-400" />
  <span class="text-sm">Changes saved successfully</span>
  <button class="p-1 hover:bg-neutral-800 rounded">
    <X class="w-4 h-4" />
  </button>
</div>
```

---

## 7. Iconography

### 7.1 Icon Library

**Primary:** Lucide React (`lucide-react`)

### 7.2 Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Inline with micro text | 12px | `w-3 h-3` |
| Inline with body text | 16px | `w-4 h-4` |
| Buttons, nav items | 20px | `w-5 h-5` |
| Section headers | 20px | `w-5 h-5` |
| Empty states, feature cards | 32px | `w-8 h-8` |
| Hero illustrations | 48px+ | `w-12 h-12` |

### 7.3 Icon Colors

Icons inherit text color by default. Use these patterns:

| Context | Color |
|---------|-------|
| Primary actions | `text-primary-500` |
| Secondary/muted | `text-neutral-400` |
| In dark banners | `text-white` |
| Status icons | `text-[status]-500` |

### 7.4 Common Icon Mappings

| Concept | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Projects | `FolderKanban` |
| Timeline | `GanttChart` |
| Dependencies | `GitBranch` |
| Scout AI | `Sparkles` |
| Settings | `Settings` |
| Notifications | `Bell` |
| Search | `Search` |
| Risk/Warning | `AlertTriangle` |
| Success | `CheckCircle` |
| Info | `Info` |
| Close | `X` |
| Menu | `Menu` |
| Expand | `ChevronDown` |
| External link | `ExternalLink` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Add | `Plus` |
| Filter | `Filter` |
| Sort | `ArrowUpDown` |
| Calendar | `Calendar` |
| Clock/Time | `Clock` |
| User | `User` |
| Team | `Users` |
| Message | `MessageSquare` |
| Send | `Send` |
| Sync | `RefreshCw` |
| Download | `Download` |
| Upload | `Upload` |

---

## 8. Animation & Transitions

### 8.1 Transition Defaults

```css
/* Standard transition */
.transition-standard {
  transition-property: color, background-color, border-color, opacity, box-shadow, transform;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Tailwind equivalent */
.transition-colors  /* For color changes */
.transition-all     /* For multiple properties */
.duration-150       /* Standard duration */
```

### 8.2 Animation Patterns

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Hover states | 150ms | ease-out | Buttons, cards, links |
| Modal open | 200ms | ease-out | Scale + fade |
| Modal close | 150ms | ease-in | Scale + fade |
| Dropdown open | 150ms | ease-out | Scale-y + fade |
| Toast enter | 300ms | spring | Slide + fade |
| Toast exit | 200ms | ease-in | Fade |
| Skeleton pulse | 2000ms | ease-in-out | Infinite |
| Spinner | 1000ms | linear | Infinite rotate |

### 8.3 Animation Classes

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

/* Slide up */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 200ms ease-out;
}

/* Scale in */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-scale-in {
  animation: scaleIn 200ms ease-out;
}
```

### 8.4 Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Dark Mode

### 9.1 Implementation

Dark mode is controlled via `html[data-theme="dark"]` attribute.

### 9.2 Dark Mode Tokens

```css
html[data-theme="dark"] {
  /* Surfaces */
  --color-surface: #0d1117;
  --color-surface-raised: #161b22;
  --color-surface-overlay: #1c2128;
  --color-surface-sunken: #010409;

  /* Borders */
  --color-border: #30363d;
  --color-border-light: #21262d;

  /* Text */
  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-text-tertiary: #6e7681;

  /* Adjusted status backgrounds */
  --color-success-50: rgba(34, 197, 94, 0.1);
  --color-warning-50: rgba(249, 115, 22, 0.1);
  --color-danger-50: rgba(239, 68, 68, 0.1);
  --color-info-50: rgba(59, 130, 246, 0.1);
}
```

### 9.3 Dark Mode Patterns

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page background | `bg-neutral-50` | `bg-[#0d1117]` |
| Card background | `bg-white` | `bg-[#161b22]` |
| Card border | `border-neutral-100` | `border-[#30363d]` |
| Primary text | `text-neutral-900` | `text-[#e6edf3]` |
| Secondary text | `text-neutral-600` | `text-[#8b949e]` |
| Input background | `bg-white` | `bg-[#0d1117]` |
| Hover background | `hover:bg-neutral-50` | `hover:bg-[#1c2128]` |

### 9.4 Tailwind Dark Mode Classes

Use Tailwind's dark: variant for component-level overrides:

```html
<div class="bg-white dark:bg-[#161b22] border-neutral-100 dark:border-[#30363d]">
```

### 9.5 Always-Dark Elements

Some elements remain dark in both themes (for visual hierarchy):

- Portfolio Pulse header banner
- The Brief headline card
- Critical severity banners
- Tooltips
- Toast notifications

---

## 10. Accessibility

### 10.1 Color Contrast

All text must meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum contrast
- Large text (18px+ or 14px bold): 3:1 minimum contrast
- UI components: 3:1 minimum contrast

### 10.2 Focus States

All interactive elements must have visible focus states:

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}

/* Dark mode offset color */
html[data-theme="dark"] .focus-ring {
  @apply focus:ring-offset-[#0d1117];
}
```

### 10.3 Keyboard Navigation

- All interactive elements reachable via Tab
- Modals trap focus
- Escape closes modals/dropdowns
- Arrow keys navigate within components (tabs, menus)

### 10.4 Screen Reader Support

- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- Add `aria-label` to icon-only buttons
- Use `aria-live` for dynamic content
- Hide decorative elements with `aria-hidden="true"`

### 10.5 ARIA Patterns

```html
<!-- Icon-only button -->
<button aria-label="Close dialog">
  <X class="w-5 h-5" aria-hidden="true" />
</button>

<!-- Loading state -->
<button disabled aria-busy="true">
  <Spinner aria-hidden="true" />
  <span class="sr-only">Loading...</span>
</button>

<!-- Alert -->
<div role="alert" aria-live="polite">
  Your changes have been saved.
</div>
```

---

## 11. Charts & Data Visualization

### 11.1 Chart Colors

Use a consistent palette for multi-series charts:

```javascript
const chartColors = [
  '#6366f1', // Primary (indigo)
  '#22c55e', // Success (green)
  '#f97316', // Warning (orange)
  '#3b82f6', // Info (blue)
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f59e0b', // Amber
];
```

### 11.2 Chart Styling (SVG)

```css
/* Line charts */
.chart-line {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Area charts */
.chart-area {
  fill-opacity: 0.1;
}

/* Grid lines */
.chart-grid {
  stroke: var(--color-neutral-100);
  stroke-width: 1;
}

/* Axis labels */
.chart-label {
  font-size: 10px;
  fill: var(--color-neutral-400);
}
```

### 11.3 Sparklines

Compact inline charts for trend indication:

```html
<svg class="w-20 h-6" viewBox="0 0 80 24">
  <polyline
    points="0,20 10,18 20,15 30,12 40,14 50,8 60,10 70,6 80,4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    class="text-success-500"
  />
</svg>
```

---

## 12. Responsive Patterns

### 12.1 Mobile Navigation

On mobile (`<lg`), sidebar collapses to hamburger menu:

```html
<!-- Mobile: Hamburger button in header -->
<button class="lg:hidden">
  <Menu class="w-6 h-6" />
</button>

<!-- Mobile: Slide-out drawer -->
<div class="fixed inset-0 z-50 lg:hidden">
  <div class="fixed inset-0 bg-black/50" />
  <nav class="fixed left-0 top-0 bottom-0 w-64 bg-white">
    <!-- Navigation items -->
  </nav>
</div>
```

### 12.2 Responsive Tables

On mobile, complex tables transform to cards:

```html
<!-- Desktop: Standard table -->
<table class="hidden md:table">...</table>

<!-- Mobile: Card list -->
<div class="md:hidden space-y-4">
  <div class="bg-white rounded-lg border p-4">
    <!-- Card representation of row -->
  </div>
</div>
```

### 12.3 Responsive Typography

```html
<!-- Hero text scales down on mobile -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">
```

### 12.4 Content Reflow

- Cards: 1 column on mobile, 2-3 on desktop
- Sidebar content: Moves to bottom or modal on mobile
- Horizontal scrolling: Allow for wide tables/timelines on mobile

---

## 13. File Naming & Organization

### 13.1 Component Files

```
/components
  /ui                 # Primitive components
    Button.tsx
    Badge.tsx
    Card.tsx
    Input.tsx
    Modal.tsx
    Table.tsx
  /layout             # Layout components
    Header.tsx
    Sidebar.tsx
    PageHeader.tsx
  /features           # Feature-specific components
    /dashboard
    /projects
    /scout
```

### 13.2 CSS/Style Files

```
/styles
  globals.css         # CSS variables, base styles
  tokens.css          # Design tokens only
```

### 13.3 Naming Conventions

- Components: PascalCase (`ProjectCard.tsx`)
- Files: kebab-case or PascalCase (match project convention)
- CSS classes: kebab-case (`.card-header`)
- CSS variables: kebab-case (`--color-primary`)

---

## 14. Patterns Not Yet Defined (Recommendations)

The following patterns should be established as screens are built:

### 14.1 Breadcrumbs
```html
<nav class="flex items-center gap-2 text-sm">
  <a href="#" class="text-neutral-500 hover:text-neutral-700">Projects</a>
  <ChevronRight class="w-4 h-4 text-neutral-300" />
  <span class="text-neutral-900 font-medium">Project Name</span>
</nav>
```

### 14.2 Pagination
```html
<div class="flex items-center gap-2">
  <button class="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50">
    <ChevronLeft class="w-5 h-5" />
  </button>
  <span class="text-sm text-neutral-600">Page 1 of 10</span>
  <button class="p-2 rounded-lg hover:bg-neutral-100">
    <ChevronRight class="w-5 h-5" />
  </button>
</div>
```

### 14.3 Command Palette
Global search/command interface (Cmd+K pattern) — spec when building Search Results screen.

### 14.4 Date Pickers
Use consistent date picker component — spec when building Reports screen.

### 14.5 File Upload
Drag-and-drop zone pattern — spec when building relevant feature.

---

## 15. Design System Checklist

When building any new screen, verify:

- [ ] Uses defined color tokens (no hardcoded hex except source badges)
- [ ] Typography follows scale (no arbitrary font sizes)
- [ ] Spacing uses 4px grid (Tailwind spacing scale)
- [ ] Cards follow standard pattern
- [ ] Buttons use defined variants and sizes
- [ ] Forms use defined input styles
- [ ] Icons from Lucide at correct sizes
- [ ] Focus states visible
- [ ] Dark mode works correctly
- [ ] Responsive at all breakpoints
- [ ] Animations use defined timing
- [ ] Accessibility requirements met

---

*Design Language v1.0 — February 2026*  
*This document is the source of truth for Vantage visual design.*
