# Contributing Guide

Code standards, conventions, and process for working on Vantage.

---

## Getting Started

1. Read [SETUP.md](SETUP.md) to get your dev environment running
2. Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand the codebase structure
3. Read [COMPONENTS.md](COMPONENTS.md) to understand the component catalog

## Code Standards

### TypeScript

- **Strict mode** is enabled. No `any` types unless absolutely necessary (and add a comment explaining why).
- Use **interfaces** for component props, **types** for unions/intersections.
- Export types from the file where they're defined.

```typescript
// Good
interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

// Avoid
type Props = any;
```

### React

- All components are **functional** (no class components).
- Use `"use client"` directive only when the component needs interactivity (state, effects, event handlers).
- Server Components are the default in App Router — keep them server-side when possible.
- Colocate state as close to where it's used as possible.

### File Naming

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case `.tsx` | `kanban-board.tsx` |
| Pages | `page.tsx` in route folder | `app/(app)/dashboard/page.tsx` |
| Layouts | `layout.tsx` in route folder | `app/(app)/layout.tsx` |
| Lib/utils | kebab-case `.ts` | `mock-data.ts`, `impact-engine.ts` |
| Types | In the file that uses them, or `types.ts` | `ai-mock-data.ts` exports types |

### Component Structure

Follow this order within a component file:

```typescript
"use client"; // 1. Client directive (if needed)

import { ... } from "react"; // 2. React imports
import { ... } from "next/..."; // 3. Next.js imports
import { ... } from "lucide-react"; // 4. External library imports
import { ... } from "@/lib/..."; // 5. Internal lib imports
import { ... } from "@/components/..."; // 6. Internal component imports

// 7. Types/interfaces
interface MyComponentProps { ... }

// 8. Constants/helpers (if component-specific)
const ITEMS_PER_PAGE = 10;

// 9. Component function
export function MyComponent({ ... }: MyComponentProps) {
  // State
  const [x, setX] = useState(...);

  // Computed values
  const filtered = useMemo(...);

  // Effects
  useEffect(...);

  // Handlers
  const handleClick = () => { ... };

  // Render
  return ( ... );
}
```

## Styling

### Tailwind CSS

- Use **Tailwind utility classes** for all styling. No inline styles except for dynamic values (e.g., `style={{ width: `${percent}%` }}`).
- Use the **design token classes** (e.g., `bg-primary`, `text-neutral-900`, `border-danger-50`) not raw color values.
- Never use `@apply` in component files. If you need shared styles, create a component.

### Color Rules

| Do | Don't |
|----|-------|
| `bg-primary` | `bg-[#0066CC]` |
| `text-danger-600` | `text-[#CC2F3C]` |
| `border-neutral-200` | `border-[#E5E7EB]` |

**Exception:** Integration source badges (Jira blue, Monday red, Asana salmon) use hardcoded hex because they represent third-party brand colors.

**Exception:** Always-dark banners use hardcoded hex (`#0d1117`) because theme tokens would invert them in dark mode.

### Dark Mode

- Don't use Tailwind's `dark:` prefix. Our dark mode works via CSS variable overrides in `globals.css`.
- If you add a new color token, add its dark mode override in the `html[data-theme="dark"]` block.
- Test every change in both light and dark mode.

## Icons

- Use **Lucide React** exclusively. Don't add other icon libraries.
- Import individual icons: `import { Search } from "lucide-react"` — never import the entire library.
- Use the `size` prop for sizing: `<Search size={16} />`.
- See [COMPONENTS.md](COMPONENTS.md) for the icon-to-concept mapping.

## Data

### Mock Data

All mock data lives in `src/lib/`. When adding new features:

1. Add mock data to the appropriate file (or create a new one)
2. Export typed arrays/objects
3. Use realistic, consistent data that connects to the existing mock universe
4. Keep the "Sarah at FanDuel managing 15 projects" persona consistent

### Future: Real Data

When swapping mock data for real APIs:
1. Implement the adapter interface in `src/lib/adapters/`
2. Components should not change — they consume normalized data
3. The data layer is the only thing that changes

## Git Workflow

### Branch Naming

```
feature/short-description    # New features
fix/short-description        # Bug fixes
docs/short-description       # Documentation
refactor/short-description   # Code refactoring
```

### Commit Messages

Use conventional commits:

```
feat: add notifications center page
fix: dark mode text contrast in Portfolio Pulse
docs: add component reference for stakeholder radar
refactor: extract shared card component
chore: update dependencies
```

Keep the first line under 72 characters. Add a body for complex changes.

### Pull Request Process

1. Create a branch from `main`
2. Make your changes
3. Run `npm run lint` — fix any errors
4. Run `npm run build` — verify it builds clean
5. Test in both light and dark mode
6. Open a PR with:
   - **Summary:** What changed and why
   - **Screenshots:** Before/after for UI changes
   - **Test plan:** How to verify the change works
7. Get approval, then merge

### Pre-Merge Checklist

- [ ] TypeScript compiles with no errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Works in light mode
- [ ] Works in dark mode
- [ ] No hardcoded colors (uses design tokens)
- [ ] Component follows file structure convention
- [ ] Mock data is realistic and consistent with existing data

## Adding a New Page

1. Create the route folder: `src/app/(app)/your-page/page.tsx`
2. Add `"use client"` if it needs interactivity
3. Import layout components as needed
4. Add navigation link in `sidebar.tsx`
5. Update [ARCHITECTURE.md](ARCHITECTURE.md) route table
6. Update [COMPONENTS.md](COMPONENTS.md) if new components are created

## Adding a New Component

1. Create in `src/components/your-component.tsx`
2. Define props interface
3. Follow the component structure order
4. Use design tokens for all colors
5. Test in both themes
6. Document in [COMPONENTS.md](COMPONENTS.md)
