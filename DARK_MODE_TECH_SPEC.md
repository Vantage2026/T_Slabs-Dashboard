# Dark Mode Technical Specification - Vantage Application

**Version:** 1.0  
**Author:** Emmy (Principal Engineer)  
**Date:** 2025-01-20  
**Status:** Ready for Implementation

---

## 1. APPROACH: CSS Custom Properties & Design Tokens

### Strategy
Implement a **design token system** using CSS custom properties (CSS variables) that map semantic color names to theme-specific values. This approach enables:
- Single source of truth for all colors
- Runtime theme switching without page reload
- Maintainable, scalable theming across the entire application
- Zero JavaScript required for color application (JS only for toggle logic)

### Architecture
```css
:root {
  /* Light mode (default) */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-text-primary: #1a1a1a;
  /* ... all tokens ... */
}

[data-theme="dark"] {
  /* Dark mode overrides */
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-text-primary: #e6edf3;
  /* ... all tokens ... */
}
```

### Token Naming Convention
Format: `--color-[category]-[variant]-[state?]`

**Categories:**
- `bg` - backgrounds
- `text` - text colors
- `border` - borders and dividers
- `surface` - elevated surfaces (cards, modals)
- `accent` - primary brand colors
- `status` - semantic colors (success, warning, error, info)
- `chart` - data visualization colors

**Examples:**
- `--color-bg-primary`
- `--color-text-secondary`
- `--color-border-default`
- `--color-surface-raised`
- `--color-accent-primary`
- `--color-status-success`

---

## 2. COLOR SYSTEM: Complete Palette Mappings

### Base Color Tokens

#### Backgrounds
```css
:root {
  --color-bg-primary: #ffffff;           /* Main page background */
  --color-bg-secondary: #f8f9fa;         /* Subtle backgrounds */
  --color-bg-tertiary: #e9ecef;          /* Disabled states */
  --color-bg-inverse: #1a1a1a;           /* Dark elements in light mode */
  --color-bg-overlay: rgba(0,0,0,0.5);   /* Modal overlays */
}

[data-theme="dark"] {
  --color-bg-primary: #0d1117;
  --color-bg-secondary: #161b22;
  --color-bg-tertiary: #21262d;
  --color-bg-inverse: #f0f6fc;
  --color-bg-overlay: rgba(0,0,0,0.7);
}
```

#### Text
```css
:root {
  --color-text-primary: #1a1a1a;         /* Body text */
  --color-text-secondary: #6c757d;       /* Muted text */
  --color-text-tertiary: #adb5bd;        /* Placeholder text */
  --color-text-inverse: #ffffff;         /* Text on dark backgrounds */
  --color-text-link: #0969da;            /* Links */
  --color-text-link-hover: #0550ae;      /* Link hover */
}

[data-theme="dark"] {
  --color-text-primary: #e6edf3;
  --color-text-secondary: #8b949e;
  --color-text-tertiary: #6e7681;
  --color-text-inverse: #0d1117;
  --color-text-link: #2f81f7;
  --color-text-link-hover: #539bf5;
}
```

#### Borders
```css
:root {
  --color-border-default: #d0d7de;       /* Standard borders */
  --color-border-muted: #e9ecef;         /* Subtle dividers */
  --color-border-strong: #8b949e;        /* Emphasized borders */
  --color-border-focus: #0969da;         /* Focus rings */
}

[data-theme="dark"] {
  --color-border-default: #30363d;
  --color-border-muted: #21262d;
  --color-border-strong: #6e7681;
  --color-border-focus: #2f81f7;
}
```

#### Surfaces (Cards, Modals, Elevated Elements)
```css
:root {
  --color-surface-base: #ffffff;         /* Card backgrounds */
  --color-surface-raised: #f8f9fa;       /* Elevated cards */
  --color-surface-sunken: #e9ecef;       /* Inset areas */
  --color-surface-hover: #f1f3f5;        /* Hover states */
}

[data-theme="dark"] {
  --color-surface-base: #161b22;
  --color-surface-raised: #21262d;
  --color-surface-sunken: #0d1117;
  --color-surface-hover: #30363d;
}
```

#### Accents (Primary Brand Colors)
```css
:root {
  --color-accent-primary: #0969da;       /* Primary CTA */
  --color-accent-primary-hover: #0550ae;
  --color-accent-secondary: #6c63ff;     /* Secondary accent */
  --color-accent-secondary-hover: #5a52d5;
}

[data-theme="dark"] {
  --color-accent-primary: #2f81f7;
  --color-accent-primary-hover: #539bf5;
  --color-accent-secondary: #8b83ff;
  --color-accent-secondary-hover: #a39fff;
}
```

#### Status Colors
```css
:root {
  --color-status-success: #28a745;
  --color-status-success-bg: #d4edda;
  --color-status-warning: #ffc107;
  --color-status-warning-bg: #fff3cd;
  --color-status-error: #dc3545;
  --color-status-error-bg: #f8d7da;
  --color-status-info: #17a2b8;
  --color-status-info-bg: #d1ecf1;
}

[data-theme="dark"] {
  --color-status-success: #3fb950;
  --color-status-success-bg: #0f3a1c;
  --color-status-warning: #d29922;
  --color-status-warning-bg: #4a3807;
  --color-status-error: #f85149;
  --color-status-error-bg: #4a1a1c;
  --color-status-info: #58a6ff;
  --color-status-info-bg: #0c2d4a;
}
```

#### Chart Colors (Data Visualization)
```css
:root {
  --color-chart-1: #0969da;
  --color-chart-2: #6c63ff;
  --color-chart-3: #28a745;
  --color-chart-4: #ffc107;
  --color-chart-5: #dc3545;
  --color-chart-6: #17a2b8;
  --color-chart-7: #6f42c1;
  --color-chart-8: #fd7e14;
}

[data-theme="dark"] {
  --color-chart-1: #2f81f7;
  --color-chart-2: #8b83ff;
  --color-chart-3: #3fb950;
  --color-chart-4: #d29922;
  --color-chart-5: #f85149;
  --color-chart-6: #58a6ff;
  --color-chart-7: #b083f0;
  --color-chart-8: #ff9e64;
}
```

---

## 3. COMPONENT INVENTORY: Dark Mode Updates Required

### Navigation & Layout
- **Sidebar** - Background, text, active state, hover state, dividers
- **Top Navigation Bar** - Background, links, dropdowns, search bar
- **Breadcrumbs** - Text, separators, hover states
- **Footer** - Background, text, links

### Core Components
- **Cards** - Background, borders, shadows, headers
- **Modals/Dialogs** - Overlay, background, borders, close button
- **Dropdowns** - Background, border, hover states, selected item
- **Tooltips** - Background, text, arrow
- **Notifications/Toasts** - Background, text, close button, status variants
- **Badges** - Background, text, border

### Forms & Inputs
- **Text Inputs** - Background, border, text, placeholder, focus state, disabled state
- **Textareas** - Same as text inputs
- **Select Dropdowns** - Background, options, selected state
- **Checkboxes** - Border, checked background, checkmark color
- **Radio Buttons** - Border, selected state
- **Toggle Switches** - Background (on/off), slider
- **Date Pickers** - Calendar background, selected date, hover states
- **File Upload** - Border, background, drag-over state

### Buttons
- **Primary Button** - Background, text, hover, active, disabled
- **Secondary Button** - Border, text, hover, active, disabled
- **Tertiary/Ghost Button** - Text, hover background, active
- **Icon Buttons** - Hover background, active state
- **Button Groups** - Borders, selected state

### Tables & Lists
- **Table** - Background, row borders, header background, hover row, selected row
- **List Items** - Background, hover state, selected state, dividers
- **Pagination** - Active page, hover state, disabled state

### Project Management Views
- **Gantt Chart** - Background, grid lines, task bars, milestones, dependencies, today marker
- **Kanban Board** - Column backgrounds, card backgrounds, borders, drag preview
- **Scrum Board** - Sprint header, backlog section, card backgrounds, story points
- **Waterfall View** - Phase backgrounds, progress bars, milestone markers
- **Calendar View** - Grid lines, event backgrounds, selected date, today marker

### Data Visualization
- **Risk Radar (SVG)** - Axes, grid, data points, labels, background
- **Bar Charts** - Bars, axes, grid lines, labels, tooltips
- **Line Charts** - Lines, points, grid, area fills, tooltips
- **Pie/Donut Charts** - Slices, labels, tooltips
- **Progress Bars** - Background, fill, text

### Content
- **Code Blocks** - Background, syntax highlighting, border, copy button
- **Blockquotes** - Border, background, text
- **Horizontal Rules** - Color, opacity
- **Avatars** - Border, placeholder background
- **Icons** - Fill/stroke color (inherit from text color)

### Overlays & Feedback
- **Loading Spinners** - Color
- **Skeleton Loaders** - Background, shimmer effect
- **Empty States** - Icon color, text color
- **Error States** - Icon color, text color, background

### Third-Party Components
- **Rich Text Editor (TinyMCE/Quill)** - Toolbar, editor background, text
- **Date Range Picker** - Calendar backgrounds, selected range
- **File Manager** - File icons, folder backgrounds, hover states
- **PDF Viewer** - Background, controls, borders

---

## 4. TOGGLE MECHANISM: Implementation

### Theme Detection & Toggle Flow

#### 1. System Preference Detection
```javascript
// On initial load, detect system preference
const getInitialTheme = () => {
  // Check localStorage first (user preference)
  const stored = localStorage.getItem('vantage-theme');
  if (stored) return stored;
  
  // Fall back to system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return systemPrefersDark ? 'dark' : 'light';
};
```

#### 2. Theme Application
```javascript
// Apply theme to document
const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('vantage-theme', theme);
};
```

#### 3. Toggle Component
```javascript
// Theme toggle button
const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme());
  
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <button onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
```

#### 4. System Preference Change Listener
```javascript
// Listen for system preference changes (respect user's OS-level toggle)
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    // Only sync if user hasn't manually overridden
    if (!localStorage.getItem('vantage-theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  return () => mediaQuery.removeEventListener('change', handleChange);
}, []);
```

### Persistence Strategy
- **localStorage key:** `vantage-theme`
- **Values:** `"light"` | `"dark"`
- **Clear preference:** Remove localStorage key to revert to system preference

### Flash Prevention
Add inline script in `<head>` to apply theme before render:
```html
<script>
  (function() {
    const stored = localStorage.getItem('vantage-theme');
    const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

---

## 5. TAILWIND INTEGRATION: Dark Mode Strategy

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Use class strategy (not media query)
  theme: {
    extend: {
      colors: {
        // Map design tokens to Tailwind color names
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          tertiary: 'var(--color-bg-tertiary)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        },
        // ... map all tokens
      },
    },
  },
};
```

### CSS Class Strategy
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode tokens */
    --color-bg-primary: #ffffff;
    /* ... all tokens ... */
  }
  
  [data-theme="dark"] {
    /* Dark mode tokens */
    --color-bg-primary: #0d1117;
    /* ... all tokens ... */
  }
}
```

### Applying Dark Mode in Components
```jsx
// Use Tailwind's dark: variant (requires darkMode: 'class' and data-theme attribute)
<div className="bg-bg-primary dark:bg-bg-primary text-text-primary dark:text-text-primary">
  Content
</div>

// Simplified with design tokens (tokens handle theme switching automatically)
<div className="bg-bg-primary text-text-primary">
  Content
</div>
```

**Recommendation:** Use design token approach (second example) for cleaner code. The `dark:` variant is redundant when tokens handle theme switching.

---

## 6. MIGRATION PLAN: Step-by-Step Conversion

### Phase 1: Foundation (Week 1)
**Goal:** Establish token system and toggle mechanism

1. **Create design token CSS file** (`tokens.css`)
   - Define all color tokens for light and dark modes
   - Import in global CSS

2. **Configure Tailwind**
   - Update `tailwind.config.js` to use custom colors mapped to CSS variables
   - Set `darkMode: 'class'`

3. **Implement theme toggle**
   - Create `ThemeToggle` component
   - Add to top navigation bar
   - Implement localStorage persistence and system preference detection

4. **Add flash prevention script**
   - Inline script in `<head>` to apply theme before render

**Deliverable:** Theme toggle works, tokens defined, no visual changes yet

---

### Phase 2: Core Layout (Week 1-2)
**Goal:** Convert navigation, layout, and common components

5. **Update global styles**
   - Replace hardcoded body background with `--color-bg-primary`
   - Replace text color with `--color-text-primary`

6. **Convert navigation components**
   - Sidebar
   - Top navigation bar
   - Breadcrumbs
   - Footer

7. **Convert layout components**
   - Cards
   - Modals
   - Dropdowns
   - Tooltips

**Testing:** Verify all navigation and layout elements render correctly in both themes

---

### Phase 3: Forms & Inputs (Week 2)
**Goal:** All form elements support dark mode

8. **Convert input components**
   - Text inputs, textareas
   - Select dropdowns
   - Checkboxes, radio buttons
   - Toggle switches
   - Date pickers

9. **Convert buttons**
   - Primary, secondary, tertiary variants
   - Icon buttons
   - Button groups

10. **Update form validation styles**
    - Error states
    - Success states
    - Focus rings

**Testing:** Fill out forms in both themes, verify focus states and validation

---

### Phase 4: Data Components (Week 2-3)
**Goal:** Tables, lists, and data views support dark mode

11. **Convert tables**
    - Table headers
    - Row backgrounds
    - Hover states
    - Selected states

12. **Convert lists**
    - List items
    - Dividers
    - Hover/selected states

13. **Update pagination**
    - Active page
    - Hover states

**Testing:** Navigate through paginated tables in both themes

---

### Phase 5: Project Management Views (Week 3-4)
**Goal:** All PM views (Gantt, Kanban, Scrum, Waterfall) support dark mode

14. **Convert Gantt Chart**
    - Grid lines
    - Task bars
    - Milestones
    - Dependencies
    - Today marker

15. **Convert Kanban Board**
    - Column backgrounds
    - Card backgrounds
    - Drag preview

16. **Convert Scrum Board**
    - Sprint header
    - Story point badges
    - Backlog section

17. **Convert Waterfall View**
    - Phase backgrounds
    - Progress bars

18. **Convert Calendar View**
    - Grid lines
    - Event backgrounds
    - Selected date

**Testing:** Create, move, and edit tasks in all views in both themes

---

### Phase 6: Data Visualization (Week 4)
**Goal:** All charts and SVGs support dark mode

19. **Update chart library configuration**
    - Pass theme-aware colors to chart options
    - Update grid line colors
    - Update tooltip backgrounds

20. **Convert Risk Radar SVG**
    - Axes and grid lines
    - Data points
    - Labels

21. **Update progress bars**
    - Background and fill colors

**Testing:** Verify all charts render with appropriate colors in both themes

---

### Phase 7: Content & Feedback (Week 5)
**Goal:** All content and feedback elements support dark mode

22. **Convert content elements**
    - Code blocks (update syntax highlighting theme)
    - Blockquotes
    - Horizontal rules

23. **Convert feedback elements**
    - Loading spinners
    - Skeleton loaders
    - Empty states
    - Error states

24. **Update notification system**
    - Toast backgrounds
    - Status colors

**Testing:** Trigger all notification types in both themes

---

### Phase 8: Third-Party Components (Week 5-6)
**Goal:** All third-party components support dark mode

25. **Configure rich text editor**
    - TinyMCE/Quill dark theme
    - Toolbar colors

26. **Configure date range picker**
    - Calendar backgrounds
    - Selected range colors

27. **Update PDF viewer**
    - Background and controls

**Testing:** Use all third-party components in both themes

---

### Phase 9: Polish & Edge Cases (Week 6)
**Goal:** Fix edge cases, ensure consistency

28. **Audit all pages**
    - Manually test every page in both themes
    - Document inconsistencies

29. **Fix edge cases**
    - Shadows on elevated surfaces
    - Hover states on interactive elements
    - Focus states on form elements

30. **Add smooth transitions**
    - Transition colors when toggling theme (optional, may cause flicker)

**Testing:** Full regression test of entire application

---

### Phase 10: Accessibility & Performance (Week 7)
**Goal:** Ensure dark mode meets accessibility standards

31. **Contrast ratio verification**
    - Run automated accessibility tests (Lighthouse, axe DevTools)
    - Verify WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)

32. **Focus state verification**
    - Ensure focus indicators are visible in both themes

33. **Performance audit**
    - Verify theme toggle is instant (no layout shift)
    - Check for CSS variable inheritance issues

**Deliverable:** Dark mode is production-ready

---

## 7. EDGE CASES: Special Considerations

### Charts & Data Visualization

**Problem:** Chart libraries (Chart.js, Recharts, D3) often don't automatically adapt to theme changes.

**Solution:**
1. Pass theme-aware color variables to chart options
2. Re-render charts when theme changes (listen to theme toggle event)
3. Use CSS variables in chart configuration where supported

```javascript
const chartOptions = {
  scales: {
    x: {
      grid: {
        color: getComputedStyle(document.documentElement)
          .getPropertyValue('--color-border-muted'),
      },
    },
  },
};
```

### SVG Elements

**Problem:** SVGs don't inherit CSS custom properties by default unless explicitly styled.

**Solution:**
1. Apply `fill` and `stroke` as inline styles with `currentColor`
2. Use CSS variables in SVG `<style>` tags
3. Generate theme-aware SVG markup server-side or client-side

```jsx
<svg>
  <style>
    {`
      .axis { stroke: var(--color-border-default); }
      .label { fill: var(--color-text-secondary); }
    `}
  </style>
  <line className="axis" x1="0" y1="0" x2="100" y2="0" />
</svg>
```

### Third-Party Component Libraries

**Problem:** Libraries (Material-UI, Ant Design) may have their own theming systems.

**Solution:**
1. Configure library's theme provider to use our design tokens
2. Override library styles with custom CSS using design tokens
3. For complex libraries, maintain two theme configurations (light/dark)

```jsx
// Material-UI example
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: currentTheme, // 'light' or 'dark'
    primary: {
      main: getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-primary'),
    },
  },
});
```

### Smooth Transitions

**Problem:** Transitioning colors can cause visual flicker and poor performance.

**Recommendation:**
- **DO NOT** add `transition: all 0.3s` to root elements (causes layout shifts)
- **DO** transition specific properties if needed: `transition: background-color 0.2s, color 0.2s`
- **CONSIDER** instant theme switching (no transition) for better UX

### Shadows & Elevation

**Problem:** Drop shadows designed for light backgrounds don't work well on dark backgrounds.

**Solution:**
1. Define shadow tokens with theme-specific values
2. Use lighter shadows in dark mode (or no shadows)

```css
:root {
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.5);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
}
```

### Images & Logos

**Problem:** Some images (logos, illustrations) don't work well on dark backgrounds.

**Solution:**
1. Provide separate light/dark variants of logos
2. Use `filter: invert()` for simple icons (use sparingly)
3. Add semi-transparent background to images if needed

```jsx
<img 
  src={theme === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} 
  alt="Vantage Logo" 
/>
```

### Accessibility: Contrast Ratios

**Problem:** Some color combinations may fail WCAG contrast requirements in dark mode.

**Solution:**
1. Use contrast checker tools (WebAIM, Lighthouse) during design
2. Ensure text meets minimum ratios:
   - **Normal text:** 4.5:1 (WCAG AA) or 7:1 (WCAG AAA)
   - **Large text (18pt+):** 3:1 (WCAG AA) or 4.5:1 (WCAG AAA)
3. Test with automated tools and manual inspection

### Focus Indicators

**Problem:** Focus rings designed for light mode may be invisible in dark mode.

**Solution:**
1. Use high-contrast focus colors in both themes
2. Consider using outline instead of box-shadow for better visibility

```css
:root {
  --color-focus-ring: #0969da; /* Blue for light mode */
}

[data-theme="dark"] {
  --color-focus-ring: #58a6ff; /* Lighter blue for dark mode */
}

*:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
```

---

## 8. TESTING PLAN: Verification & QA

### Automated Testing

#### 1. Unit Tests (Jest + React Testing Library)
- Test `ThemeToggle` component
- Test theme detection logic
- Test localStorage persistence
- Test system preference detection

```javascript
test('toggles theme on button click', () => {
  render(<ThemeToggle />);
  const button = screen.getByLabelText('Toggle theme');
  
  fireEvent.click(button);
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  
  fireEvent.click(button);
  expect(document.documentElement.getAttribute('data-theme')).toBe('light');
});
```

#### 2. Accessibility Tests (axe-core)
- Run automated contrast ratio checks
- Verify focus indicators are visible in both themes
- Test with screen readers (NVDA, JAWS, VoiceOver)

```javascript
import { axe } from 'jest-axe';

test('dark mode meets accessibility standards', async () => {
  const { container } = render(<App theme="dark" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### 3. Visual Regression Tests (Percy, Chromatic)
- Capture screenshots of all pages in light and dark modes
- Compare against baseline to detect unintended changes
- Automate with CI/CD pipeline

### Manual Testing

#### 1. Component Checklist
For EACH component in the inventory:
- [ ] Renders correctly in light mode
- [ ] Renders correctly in dark mode
- [ ] Hover states work in both themes
- [ ] Focus states are visible in both themes
- [ ] Active/selected states work in both themes
- [ ] Disabled states render appropriately in both themes

#### 2. Page-by-Page Audit
For EACH page in the application:
- [ ] All components render correctly in dark mode
- [ ] No hardcoded colors remain (use browser DevTools to inspect)
- [ ] Text is readable (sufficient contrast)
- [ ] Borders and dividers are visible but not too harsh
- [ ] Charts and SVGs render correctly
- [ ] No visual glitches or layout shifts when toggling theme

#### 3. User Flow Testing
Test complete user workflows in dark mode:
- [ ] Sign up / log in
- [ ] Create a new project
- [ ] Add tasks to Kanban board
- [ ] Create a Gantt chart with dependencies
- [ ] Generate reports and charts
- [ ] Upload files
- [ ] Send notifications
- [ ] Use search functionality

#### 4. Cross-Browser Testing
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome on Android
- [ ] Safari on iOS

#### 5. Device Testing
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Tablet (iPad, Android tablet)
- [ ] Mobile (iPhone, Android phone)

#### 6. Performance Testing
- [ ] Theme toggle is instant (no delay or flicker)
- [ ] No layout shift when toggling theme
- [ ] Page load performance is not degraded (Lighthouse score)
- [ ] No console errors related to CSS variables

### Acceptance Criteria

Dark mode is **production-ready** when:
1. ✅ All components pass manual checklist
2. ✅ All automated tests pass
3. ✅ WCAG AA contrast ratios met for all text
4. ✅ No visual regressions detected
5. ✅ Theme toggle persists across sessions
6. ✅ System preference detection works
7. ✅ No performance degradation
8. ✅ Cross-browser compatibility verified
9. ✅ Mobile responsiveness maintained
10. ✅ CEO approval obtained

---

## 9. IMPLEMENTATION TIMELINE

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Foundation | Week 1 (3 days) | Token system, toggle, flash prevention |
| Phase 2: Core Layout | Week 1-2 (4 days) | Navigation, cards, modals converted |
| Phase 3: Forms & Inputs | Week 2 (3 days) | All form elements support dark mode |
| Phase 4: Data Components | Week 2-3 (3 days) | Tables, lists, pagination |
| Phase 5: PM Views | Week 3-4 (5 days) | Gantt, Kanban, Scrum, Waterfall |
| Phase 6: Data Viz | Week 4 (2 days) | Charts, Risk Radar |
| Phase 7: Content | Week 5 (2 days) | Code blocks, notifications |
| Phase 8: Third-Party | Week 5-6 (3 days) | Rich text editor, date picker |
| Phase 9: Polish | Week 6 (2 days) | Edge cases, consistency |
| Phase 10: Accessibility | Week 7 (3 days) | Contrast verification, testing |

**Total Estimated Time:** 30 working days (6 weeks with 1 engineer)

---

## 10. RISKS & MITIGATIONS

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Chart libraries don't support CSS variables | High | Medium | Pass computed values to chart options; re-render on theme change |
| Third-party components have conflicting themes | Medium | High | Override with custom CSS; configure library theme providers |
| Performance degradation from CSS variable inheritance | Medium | Low | Benchmark before/after; optimize token usage |
| Contrast ratio failures in dark mode | High | Medium | Use automated testing tools; validate during design phase |
| Inconsistent colors across components | Medium | High | Centralized token system prevents this; enforce code review |
| Flash of unstyled content on load | Medium | Medium | Inline script in `<head>` applies theme before render |
| Scope creep (adding features beyond dark mode) | Low | Medium | Stick to spec; defer enhancements to post-launch |

---

## 11. POST-LAUNCH IMPROVEMENTS (Future Work)

These are **out of scope** for the initial dark mode implementation but should be considered for future iterations:

1. **Multiple themes** - Add more color schemes (high contrast, colorblind-friendly)
2. **Auto theme switching** - Automatically switch based on time of day
3. **Customizable accent colors** - Let users choose their primary accent color
4. **Theme preview** - Show live preview of theme before applying
5. **Per-page theme preferences** - Different theme for different sections of the app
6. **Gradual transition animations** - Smooth color transitions when toggling (if performance allows)

---

## 12. DEPENDENCIES & PREREQUISITES

### Required Before Starting
- [x] CEO approval for dark mode feature
- [x] Design mockups/guidelines for dark mode color palette (use this spec as baseline)
- [ ] Tailwind CSS configured in project
- [ ] Access to all third-party component documentation

### External Dependencies
- Tailwind CSS v3.0+
- React 18+ (for `useEffect`, `useState`)
- Modern browser support (CSS custom properties)

### Team Dependencies
- **Jeff (Product Director)**: Provide design feedback on color choices
- **Susan (Director)**: Prioritize dark mode in sprint planning
- **CEO**: Final approval on color palette and launch readiness

---

## 13. SUCCESS METRICS

### User Metrics (Post-Launch)
- **Dark mode adoption rate**: % of users who enable dark mode
- **User feedback**: Survey responses, support tickets, feature requests
- **Session duration**: Does dark mode increase time spent in app?

### Technical Metrics
- **Performance**: Lighthouse score before/after
- **Accessibility**: WCAG compliance (automated + manual testing)
- **Bug count**: Dark mode-related bugs in first 30 days

### Business Metrics
- **User retention**: Does dark mode improve retention?
- **Premium feature**: Consider dark mode as premium feature in future

---

## 14. ROLLOUT STRATEGY

### Option A: Feature Flag (Recommended)
- Deploy dark mode behind feature flag
- Enable for internal team first (dogfooding)
- Enable for beta users (10%)
- Monitor for bugs and performance issues
- Gradual rollout to all users (25% → 50% → 100%)

### Option B: Opt-In Beta
- Launch as "Beta" feature with toggle in settings
- Announce to users via email/in-app notification
- Collect feedback before making it default
- Remove "Beta" label after stabilization

### Option C: Hard Launch
- Deploy to all users at once
- Default to system preference
- Announce via blog post, social media, email

**Recommendation:** **Option A** (feature flag) for lowest risk.

---

## 15. DOCUMENTATION & HANDOFF

### Developer Documentation
- Update README with dark mode implementation details
- Document design token system in Storybook
- Create component examples showing both themes
- Document Tailwind config changes

### User Documentation
- Add "Dark Mode" section to help docs
- Create video tutorial on toggling theme
- Add FAQ entry for dark mode issues

### Design System
- Update design system with dark mode tokens
- Provide Figma/Sketch files with dark mode variants
- Document color token usage guidelines

---

## APPROVAL & SIGN-OFF

**Prepared by:** Emmy (Principal Engineer)  
**Date:** 2025-01-20  
**Status:** Awaiting CEO Approval

**Approval Required From:**
- [ ] CEO (final approval)
- [ ] Jeff (product feasibility)
- [ ] Susan (timeline and resource allocation)

**Next Steps:**
1. CEO reviews and approves spec
2. Jeff prioritizes in sprint planning
3. Emmy begins Phase 1 implementation

---

**END OF SPECIFICATION**
