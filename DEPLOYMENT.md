# Deployment Guide

How to deploy and manage Vantage in production.

---

## Current Deployment

Vantage is deployed on **Vercel** at:

- **Production URL:** [pm-sync.vercel.app](https://pm-sync.vercel.app)
- **Vercel Project:** `tylers-projects-8abe2ae5/pm-sync`

## Deploying to Vercel

### First-Time Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (from project root)
cd pm-sync
vercel --yes
```

The CLI auto-detects Next.js and configures the build.

### Subsequent Deploys

```bash
# Deploy to production
vercel --prod

# Deploy preview (staging)
vercel
```

### Via Git (Recommended for Team)

Connect a Git repository in the Vercel dashboard for automatic deploys:
1. Go to [vercel.com](https://vercel.com) → pm-sync → Settings → Git
2. Connect your GitHub/GitLab repository
3. Every push to `main` auto-deploys to production
4. Every PR creates a preview deployment

## Environment Variables

Set these in the Vercel dashboard: **Settings → Environment Variables**

### Required (Current)

| Variable | Value | Description |
|----------|-------|-------------|
| `PROTOTYPE_PASSWORD` | `vantage2026` | Access code for the auth gate. Change this to restrict access. |

### Required (Future — When Backend Is Built)

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random 32+ char string | NextAuth session encryption |
| `NEXTAUTH_URL` | `https://pm-sync.vercel.app` | Canonical app URL |
| `REDIS_URL` | `redis://...` | Redis connection for BullMQ |
| `JIRA_CLIENT_ID` | Atlassian app client ID | Jira OAuth |
| `JIRA_CLIENT_SECRET` | Atlassian app client secret | Jira OAuth |
| `MONDAY_API_TOKEN` | Monday.com API token | Monday.com integration |
| `ASANA_CLIENT_ID` | Asana app client ID | Asana OAuth |
| `ASANA_CLIENT_SECRET` | Asana app client secret | Asana OAuth |

## Build Configuration

Vercel auto-detects these, but for reference:

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

## Prototype Auth Gate

The prototype is protected by a simple password middleware (see `src/middleware.ts`).

**How it works:**
1. Middleware intercepts every request
2. Checks for `vantage-auth` cookie matching `PROTOTYPE_PASSWORD`
3. If invalid → redirects to `/auth` page
4. User enters code → POST to `/api/auth-check` → sets HTTP-only cookie (7 days)

**Bypassed paths:** `/_next/*`, `/api/*`, `/favicon*`, static assets

**To change the password:**
1. Set `PROTOTYPE_PASSWORD` env var in Vercel dashboard
2. Redeploy (or it picks up on next deploy)
3. Existing cookies with the old password will stop working

**To remove the auth gate entirely:**
1. Delete `src/middleware.ts`
2. Delete `src/app/auth/page.tsx`
3. Delete `src/app/api/auth-check/route.ts`
4. Redeploy

## Custom Domain

To add a custom domain (e.g., `app.vantage.pm`):

1. Vercel dashboard → pm-sync → Settings → Domains
2. Add your domain
3. Configure DNS:
   - **A Record:** `76.76.21.21`
   - **CNAME:** `cname.vercel-dns.com` (for subdomains)
4. SSL is automatic via Let's Encrypt

## Monitoring

### Build Logs

```bash
# View latest deployment logs
vercel logs pm-sync.vercel.app

# Or inspect a specific deployment
vercel inspect <deployment-url> --logs
```

### Vercel Dashboard

- **Deployments:** See all deploys, status, build logs
- **Analytics:** (Pro plan) Web vitals, page views
- **Logs:** (Pro plan) Runtime function logs

## Rollback

```bash
# List recent deployments
vercel ls

# Promote a previous deployment to production
vercel promote <deployment-url>
```

Or use the Vercel dashboard: Deployments → click the three dots on any deployment → "Promote to Production."

## Troubleshooting

### Build fails with ENOTEMPTY

The `.next` cache can conflict. This usually resolves on retry. If persistent:
- The build cache can be cleared in Vercel dashboard: Settings → General → "Clear Build Cache"

### Middleware deprecation warning

Next.js 16 shows: `The "middleware" file convention is deprecated. Please use "proxy" instead.`
This is a warning only — middleware still works. We'll migrate to the proxy convention when building production auth.

### Environment variables not taking effect

Env vars require a redeploy. Either push a new commit or run `vercel --prod` manually.
