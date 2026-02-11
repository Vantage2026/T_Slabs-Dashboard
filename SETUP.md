# Setup Guide

How to get Vantage running on your local machine.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ (comes with Node.js)
- **Git**

Optional (for future backend work):
- **PostgreSQL** 15+ (for Prisma)
- **Redis** 7+ (for BullMQ job queue)

## Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd pm-sync

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` file in the project root. Currently only needed for production features:

```bash
# .env

# Prototype access gate (optional - defaults to "vantage2026")
PROTOTYPE_PASSWORD=vantage2026

# Database (not yet wired - needed for future backend)
DATABASE_URL=postgresql://user:password@localhost:5432/vantage

# NextAuth (not yet wired - needed for production auth)
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000

# Redis (not yet wired - needed for sync queue)
REDIS_URL=redis://localhost:6379

# PM Tool API Keys (not yet wired - needed for integrations)
JIRA_CLIENT_ID=
JIRA_CLIENT_SECRET=
MONDAY_API_TOKEN=
ASANA_CLIENT_ID=
ASANA_CLIENT_SECRET=
```

**For local development, no `.env` file is required.** The prototype runs entirely on mock data.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint |

## Project Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | React framework (App Router) |
| `react` / `react-dom` | 19.2.3 | UI library |
| `lucide-react` | 0.563.0 | Icon library |
| `next-auth` | 5.0.0-beta.30 | Authentication (future) |
| `@prisma/client` / `prisma` | 7.3.0 | Database ORM (future) |
| `bullmq` / `ioredis` | 5.67.3 / 5.9.2 | Job queue (future) |
| `zod` | 4.3.6 | Schema validation |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | 4.x | Utility-first CSS |
| `typescript` | 5.x | Type safety |
| `eslint` / `eslint-config-next` | 9.x | Linting |
| `prettier` / `prettier-plugin-tailwindcss` | 3.8.1 | Code formatting |

## Common Issues

### Port 3000 already in use

```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Build cache errors (ENOTEMPTY)

```bash
# Clear the .next cache
rm -rf .next
npm run build
```

### Dark mode not applying

The theme is controlled by the `data-theme` attribute on `<html>`. It's set by a blocking script in `layout.tsx` that reads from `localStorage`. If themes aren't switching:
1. Check browser localStorage for `vantage-theme` key
2. Check that `globals.css` has the `html[data-theme="dark"]` block
3. Verify the `ThemeProvider` wraps `{children}` in `layout.tsx`

### Tailwind classes not reflecting dark mode

Vantage uses Tailwind v4 `@theme` (NOT `@theme inline`). If dark mode tokens aren't applying, ensure `globals.css` uses `@theme { ... }` — never `@theme inline`. The `inline` variant bakes literal values into utilities, bypassing CSS variable overrides.

## IDE Setup

### VS Code / Cursor (recommended)

Install these extensions:
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **ESLint** — inline linting
- **Prettier** — format on save
- **TypeScript Importer** — auto-imports

Recommended settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```
