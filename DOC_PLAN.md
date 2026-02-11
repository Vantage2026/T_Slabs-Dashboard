# Vantage Engineering Documentation Plan
## Day-One Productivity for New Engineers

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Planning  

---

## Overview

This document defines the complete documentation suite required for a new engineer to be productive on day one at Vantage. Documentation is organized into six categories, each targeting a specific need.

**Goal:** A new engineer should be able to clone the repo, set up their environment, understand the codebase architecture, and ship their first PR within their first week—without needing to interrupt anyone.

---

## Documentation Index

| # | Document | Category | Priority | Owner |
|---|----------|----------|----------|-------|
| 1 | README.md | Onboarding | P0 | Engineering Lead |
| 2 | CONTRIBUTING.md | Workflow | P0 | Engineering Lead |
| 3 | ARCHITECTURE.md | Codebase | P0 | Engineering Lead |
| 4 | LOCAL_SETUP.md | Environment | P0 | Engineering Lead |
| 5 | DEPLOYMENT.md | DevOps | P0 | Engineering Lead |
| 6 | DESIGN_LANGUAGE.md | Components | P0 | Product (exists) |
| 7 | COMPONENT_LIBRARY.md | Components | P1 | Frontend Lead |
| 8 | API_REFERENCE.md | Backend | P1 | Backend Lead |
| 9 | DATA_MODEL.md | Backend | P1 | Backend Lead |
| 10 | INTEGRATIONS.md | Backend | P1 | Backend Lead |
| 11 | TESTING.md | Quality | P1 | Engineering Lead |
| 12 | SECURITY.md | Compliance | P2 | Engineering Lead |
| 13 | TROUBLESHOOTING.md | Support | P2 | Engineering Lead |
| 14 | GLOSSARY.md | Reference | P2 | Product |

---

## Document Specifications

### 1. README.md

**Purpose:** First point of contact. Quick orientation and links to everything else.

**Audience:** All engineers (new and existing)

**Location:** Repository root

**Outline:**

```markdown
# Vantage

One-paragraph description of what Vantage is.

## Quick Start
- Prerequisites (Node version, etc.)
- Clone, install, run (3 commands max)
- Link to LOCAL_SETUP.md for full details

## Documentation
- Links to all other docs with one-line descriptions

## Tech Stack
- Bullet list: Next.js 16, TypeScript, Tailwind v4, etc.

## Project Structure
- High-level folder tree with descriptions
- Link to ARCHITECTURE.md for details

## Contributing
- Link to CONTRIBUTING.md

## License
```

---

### 2. CONTRIBUTING.md

**Purpose:** Define how to contribute code. Standards, process, expectations.

**Audience:** All engineers

**Location:** Repository root

**Outline:**

```markdown
# Contributing to Vantage

## Code of Conduct
- Brief statement or link to policy

## Getting Started
- Link to LOCAL_SETUP.md
- How to pick up a task (Jira/Linear workflow)

## Branch Naming Convention
- Format: `type/ticket-short-description`
- Types: feature, fix, chore, refactor, docs
- Examples: `feature/VAT-123-add-risk-radar`, `fix/VAT-456-modal-close`

## Commit Message Convention
- Format: `type(scope): description`
- Use conventional commits
- Examples provided

## Pull Request Process
1. Create branch from `main`
2. Write code following standards
3. Write/update tests
4. Self-review checklist
5. Open PR with template
6. Request review (auto-assign rules)
7. Address feedback
8. Squash and merge

## PR Template
- What does this PR do?
- How to test?
- Screenshots (if UI)
- Checklist: tests, types, a11y, responsive

## Code Review Guidelines
- For authors: keep PRs small, provide context
- For reviewers: be constructive, timely, thorough

## Code Standards
- Link to ESLint/Prettier config
- TypeScript strict mode expectations
- Component patterns (link to COMPONENT_LIBRARY.md)

## Testing Requirements
- Link to TESTING.md
- Minimum coverage expectations

## Definition of Done
- Code complete and reviewed
- Tests pass
- Types pass
- Lint passes
- Documentation updated (if applicable)
- Deployed to staging
- Product sign-off (if user-facing)
```

---

### 3. ARCHITECTURE.md

**Purpose:** Explain how the codebase is structured and why. Mental model for navigation.

**Audience:** All engineers, especially new hires

**Location:** `/docs/ARCHITECTURE.md`

**Outline:**

```markdown
# Vantage Architecture

## Overview
- High-level system diagram
- Frontend (Next.js) + Backend (API) + External Services

## Tech Stack Deep Dive
- Next.js 16: App Router, Server Components, why we chose it
- TypeScript: Config philosophy, strict mode
- Tailwind CSS v4: Custom config, design tokens
- State management approach
- Data fetching patterns

## Directory Structure

```
/app                    # Next.js App Router pages
  /api                  # API routes
  /(auth)               # Auth-grouped routes
  /(dashboard)          # Dashboard-grouped routes
/components
  /ui                   # Primitive components (Button, Card, etc.)
  /layout               # Layout components (Header, Sidebar)
  /features             # Feature-specific components
/lib                    # Utilities, helpers, constants
/hooks                  # Custom React hooks
/services               # API service layer
/types                  # TypeScript type definitions
/styles                 # Global styles, tokens
/public                 # Static assets
```

## Key Architectural Decisions

### ADR-001: App Router over Pages Router
- Context, decision, consequences

### ADR-002: No External UI Library
- Why we built custom components
- Trade-offs

### ADR-003: CSS Custom Properties for Theming
- How tokens work
- Dark mode implementation

### ADR-004: Server Components by Default
- When to use client components
- Data fetching patterns

## Data Flow
- Diagram: User action → Component → Service → API → Database
- How state flows through the app

## Authentication & Authorization
- Auth flow diagram
- Session management
- Role-based access

## External Integrations
- Jira, Monday, Asana sync architecture
- Webhook handling
- OAuth flow
- Link to INTEGRATIONS.md

## Performance Considerations
- Server components for initial load
- Client-side caching strategy
- Image optimization
- Bundle splitting

## Future Architecture Notes
- Planned changes
- Technical debt acknowledgment
```

---

### 4. LOCAL_SETUP.md

**Purpose:** Get a new engineer from zero to running app in <30 minutes.

**Audience:** New engineers

**Location:** `/docs/LOCAL_SETUP.md`

**Outline:**

```markdown
# Local Development Setup

## Prerequisites

### Required
- Node.js v22+ (recommend using nvm)
- pnpm v9+ (not npm or yarn)
- Git

### Optional but Recommended
- VS Code with extensions: ESLint, Prettier, Tailwind CSS IntelliSense
- Docker (for local database)

## Installation

### 1. Clone the Repository
```bash
git clone git@github.com:vantage/vantage-app.git
cd vantage-app
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```
- Explanation of each env variable
- How to get API keys for development

### 4. Database Setup
- Local database options (Docker Postgres or cloud dev instance)
- Migration commands
- Seed data

### 5. Run the App
```bash
pnpm dev
```
- App runs at http://localhost:3000

## Verification Checklist
- [ ] Can access http://localhost:3000
- [ ] Can log in with test credentials
- [ ] Can see synced test data
- [ ] Hot reload works

## Common Setup Issues

### Issue: Node version mismatch
Solution: ...

### Issue: pnpm not found
Solution: ...

### Issue: Database connection failed
Solution: ...

## IDE Configuration

### VS Code Settings
- Recommended settings.json
- Required extensions

### Other IDEs
- JetBrains setup
- Vim/Neovim setup

## Running Tests
```bash
pnpm test           # Run all tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage
```

## Useful Commands
```bash
pnpm dev            # Development server
pnpm build          # Production build
pnpm lint           # Run linter
pnpm type-check     # TypeScript check
pnpm format         # Format code
```
```

---

### 5. DEPLOYMENT.md

**Purpose:** Explain how code gets to production. CI/CD, environments, rollback.

**Audience:** All engineers, especially those doing releases

**Location:** `/docs/DEPLOYMENT.md`

**Outline:**

```markdown
# Deployment Guide

## Environments

| Environment | URL | Branch | Auto-deploy |
|-------------|-----|--------|-------------|
| Development | dev.vantage.io | `develop` | Yes |
| Staging | staging.vantage.io | `staging` | Yes |
| Production | app.vantage.io | `main` | Manual |

## CI/CD Pipeline

### On Pull Request
1. Lint check
2. Type check
3. Unit tests
4. Build verification
5. Preview deployment (Vercel)

### On Merge to Main
1. All PR checks
2. Integration tests
3. Deploy to staging
4. Smoke tests
5. Manual approval gate
6. Deploy to production

## Deployment Process

### Standard Release
1. Merge PR to `main`
2. Verify staging deployment
3. Run smoke tests
4. Click "Promote to Production" in [deployment dashboard]
5. Monitor for 15 minutes

### Hotfix Process
1. Branch from `main`: `hotfix/description`
2. Fix, test, PR
3. Fast-track review
4. Merge and immediate deploy

## Rollback Procedure
1. Go to [deployment dashboard]
2. Click "Rollback" on production
3. Select previous stable deployment
4. Confirm rollback
5. Notify team in #engineering

## Environment Variables
- How to add/update env vars
- Where they're stored (Vercel, etc.)
- Secrets management

## Database Migrations
- How to run migrations in each environment
- Rollback procedures
- Zero-downtime migration patterns

## Monitoring & Alerts
- Where to find logs
- Error tracking (Sentry, etc.)
- Performance monitoring
- Alert channels

## Post-Deployment Checklist
- [ ] Check error rates
- [ ] Check performance metrics
- [ ] Verify critical flows
- [ ] Monitor for 15 minutes
```

---

### 6. DESIGN_LANGUAGE.md

**Purpose:** Visual design system. Colors, typography, spacing, dark mode rules.

**Audience:** Frontend engineers, designers

**Location:** `/docs/DESIGN_LANGUAGE.md`

**Status:** ✅ Already exists (this document)

---

### 7. COMPONENT_LIBRARY.md

**Purpose:** Document every reusable component. Props, variants, usage examples.

**Audience:** Frontend engineers

**Location:** `/docs/COMPONENT_LIBRARY.md`

**Outline:**

```markdown
# Vantage Component Library

## Overview
- Philosophy: No external UI library, custom components
- Link to DESIGN_LANGUAGE.md for tokens

## Component Index
- Alphabetical list with links

## Primitives

### Button
- Import statement
- Props table (variant, size, disabled, loading, icon, etc.)
- Variants visual (Primary, Secondary, Ghost, Danger)
- Sizes visual (sm, md, lg)
- Code examples
- Accessibility notes

### Badge
- Same structure as Button

### Card
- Same structure

### Input
- Same structure
- Form integration patterns

### Select
- Same structure
- Async loading pattern

### Modal
- Same structure
- Focus trap behavior
- Keyboard shortcuts

### Table
- Same structure
- Sorting, filtering, pagination patterns

### Toast
- Same structure
- Toast provider setup
- Usage via hook

## Layout Components

### Header
- Usage, props, customization

### Sidebar
- Navigation patterns
- Collapsed state

### PageLayout
- Standard page structure

## Feature Components

### RiskRadarCard
- Feature-specific component docs

### ProjectCard
- Feature-specific component docs

### ScoutChat
- Feature-specific component docs

## Patterns

### Form Patterns
- Controlled vs uncontrolled
- Validation
- Error handling
- Submit loading states

### Loading States
- Skeleton pattern
- Spinner pattern
- When to use which

### Empty States
- Standard empty state pattern
- CTA patterns

### Error Boundaries
- Usage
- Fallback UI

## Storybook
- How to run Storybook locally
- How to add stories
```

---

### 8. API_REFERENCE.md

**Purpose:** Document all API endpoints. Request/response formats, auth, errors.

**Audience:** Frontend engineers, potential API consumers

**Location:** `/docs/API_REFERENCE.md`

**Outline:**

```markdown
# Vantage API Reference

## Overview
- Base URL
- Versioning strategy
- Content types

## Authentication
- Auth method (JWT, session, etc.)
- How to obtain tokens
- Token refresh flow
- Including auth in requests

## Error Handling
- Standard error response format
- Error codes and meanings
- Rate limiting

## Endpoints

### Projects

#### GET /api/projects
- Description
- Query parameters
- Response schema
- Example request/response

#### GET /api/projects/:id
...

#### POST /api/projects
...

#### PATCH /api/projects/:id
...

#### DELETE /api/projects/:id
...

### Tasks
...

### Risk Radar
...

### Scout AI
...

### Integrations
...

### Users & Teams
...

## Webhooks
- Available webhook events
- Payload formats
- Retry policy
- Verification

## Rate Limits
- Limits by endpoint
- Headers to watch
- Handling 429s
```

---

### 9. DATA_MODEL.md

**Purpose:** Document the database schema. Entities, relationships, constraints.

**Audience:** Backend engineers, full-stack engineers

**Location:** `/docs/DATA_MODEL.md`

**Outline:**

```markdown
# Vantage Data Model

## Overview
- Database: PostgreSQL
- ORM: Prisma (or Drizzle, etc.)
- Schema location

## Entity Relationship Diagram
- Visual diagram of main entities

## Core Entities

### User
- Fields table (name, type, constraints, description)
- Relationships
- Indexes

### Organization
- Same structure

### Project
- Same structure

### Task
- Same structure

### Integration
- Same structure

### Sync Log
- Same structure

## Enums
- List of all enums with values

## Migrations
- How to create migrations
- How to run migrations
- Naming convention

## Seeding
- How to seed dev data
- Test fixtures

## Query Patterns
- Common queries
- Performance considerations
- N+1 avoidance

## Multi-tenancy
- How org isolation works
- Query filters
```

---

### 10. INTEGRATIONS.md

**Purpose:** Document each external integration. Auth, sync, data mapping.

**Audience:** Backend engineers working on integrations

**Location:** `/docs/INTEGRATIONS.md`

**Outline:**

```markdown
# Vantage Integrations

## Overview
- Integration architecture
- Sync philosophy (bi-directional, conflict resolution)

## Jira Integration

### Authentication
- OAuth 2.0 flow
- Scopes required
- Token refresh

### Data Mapping
| Jira Entity | Vantage Entity | Notes |
|-------------|----------------|-------|
| Project | Project | ... |
| Issue | Task | ... |
| Sprint | Sprint | ... |

### Sync Process
- Initial sync
- Incremental sync
- Webhook events handled
- Conflict resolution

### API Endpoints Used
- List of Jira APIs we call

### Testing
- How to test locally
- Sandbox accounts

## Monday.com Integration
- Same structure as Jira

## Asana Integration
- Same structure as Jira

## Confluence Integration
- Same structure (when built)

## Slack Integration
- Same structure (when built)

## Calendar Integration
- Same structure (when built)

## Adding New Integrations
- Integration interface
- Required implementations
- Registration process
```

---

### 11. TESTING.md

**Purpose:** Testing philosophy, how to write tests, how to run tests.

**Audience:** All engineers

**Location:** `/docs/TESTING.md`

**Outline:**

```markdown
# Testing at Vantage

## Philosophy
- Test pyramid (unit > integration > e2e)
- What to test, what not to test

## Tools
- Vitest for unit/integration
- Playwright for e2e
- React Testing Library for components
- MSW for API mocking

## Running Tests

```bash
pnpm test              # All unit tests
pnpm test:watch        # Watch mode
pnpm test:coverage     # With coverage
pnpm test:e2e          # Playwright e2e
pnpm test:e2e:ui       # Playwright UI mode
```

## Unit Tests

### What to Unit Test
- Utility functions
- Hooks
- Pure components (rendering logic)

### Patterns
- File naming: `*.test.ts`
- Test structure
- Mocking patterns

### Examples
- Code examples for common patterns

## Integration Tests

### What to Integration Test
- API routes
- Complex component interactions
- Data flow

### Database Testing
- Test database setup
- Fixtures
- Cleanup

## E2E Tests

### What to E2E Test
- Critical user flows
- Happy paths
- Key failure modes

### Writing E2E Tests
- Page object pattern
- Selectors strategy
- Waiting patterns

### Running Locally
- Setup
- Debugging

## Coverage Requirements
- Minimum coverage: 70%
- Critical paths: 90%
- How to check coverage

## CI Testing
- What runs on PR
- What runs on merge
```

---

### 12. SECURITY.md

**Purpose:** Security practices, vulnerability handling, compliance.

**Audience:** All engineers

**Location:** `/docs/SECURITY.md`

**Outline:**

```markdown
# Security at Vantage

## Overview
- Security-first mindset
- Compliance requirements (SOC2, etc.)

## Authentication & Authorization
- Auth implementation details
- Session management
- Role-based access control

## Data Protection
- Encryption at rest
- Encryption in transit
- PII handling
- Data retention

## Input Validation
- Validation patterns
- Sanitization
- SQL injection prevention
- XSS prevention

## Secrets Management
- How to handle secrets
- Environment variables
- Never commit secrets

## Dependency Security
- Dependabot setup
- How to handle alerts
- Approval process for new deps

## Security Headers
- CSP policy
- Other headers

## Vulnerability Reporting
- How to report internally
- Response process

## Security Checklist for PRs
- [ ] No secrets committed
- [ ] Inputs validated
- [ ] Auth checks in place
- [ ] No sensitive data logged
```

---

### 13. TROUBLESHOOTING.md

**Purpose:** Common issues and solutions. Save debugging time.

**Audience:** All engineers

**Location:** `/docs/TROUBLESHOOTING.md`

**Outline:**

```markdown
# Troubleshooting Guide

## Local Development

### Build Errors

#### "Module not found"
- Cause
- Solution

#### "Type error: ..."
- Cause
- Solution

### Runtime Errors

#### White screen on load
- Cause
- Solution

#### API returning 401
- Cause
- Solution

### Performance Issues

#### Slow hot reload
- Cause
- Solution

## Deployment Issues

### Vercel build fails
- Common causes
- Solutions

### Database migration fails
- Common causes
- Solutions

## Integration Issues

### Jira sync not working
- Debugging steps
- Common fixes

### OAuth callback failing
- Debugging steps
- Common fixes

## Debugging Tips
- How to use React DevTools
- How to inspect network requests
- How to read Vercel logs
- How to connect to production database (safely)

## Getting Help
- Check this doc first
- Search Slack
- Ask in #engineering
- Escalation path
```

---

### 14. GLOSSARY.md

**Purpose:** Define Vantage-specific terms. Shared vocabulary.

**Audience:** All engineers, especially new hires

**Location:** `/docs/GLOSSARY.md`

**Outline:**

```markdown
# Vantage Glossary

## Product Terms

**Portfolio Pulse**
The real-time risk and health intelligence panel in Command Center.

**The Brief**
AI-generated daily summary of portfolio status and recommended actions.

**Scout**
Vantage's AI assistant for natural language queries.

**Risk Radar**
System that identifies and scores project risks.

**Command Center**
The main dashboard view showing Portfolio Pulse and key metrics.

**Focus Mode**
View showing only the top 3 highest-leverage actions.

## Technical Terms

**Sync**
The process of pulling data from external tools (Jira, Monday, Asana).

**Source**
The external tool a task or project originated from.

**Native**
Items created directly in Vantage (not synced from external tools).

**Health Score**
0-100 numeric score indicating project health.

**Cascade**
The downstream impact of a blocked task.

## Acronyms

**PM** - Project Manager (our users), or Product Manager (context-dependent)
**IC** - Individual Contributor
**MAU** - Monthly Active Users
```

---

## Implementation Plan

### Phase 1: Critical Path (Week 1)
- [ ] README.md
- [ ] LOCAL_SETUP.md
- [ ] CONTRIBUTING.md
- [ ] ARCHITECTURE.md (basic version)

### Phase 2: Complete Foundations (Week 2-3)
- [ ] DEPLOYMENT.md
- [ ] COMPONENT_LIBRARY.md
- [ ] API_REFERENCE.md
- [ ] TESTING.md

### Phase 3: Deep Documentation (Week 4+)
- [ ] DATA_MODEL.md
- [ ] INTEGRATIONS.md
- [ ] SECURITY.md
- [ ] TROUBLESHOOTING.md
- [ ] GLOSSARY.md

---

## Maintenance

### Ownership
Each document has an owner responsible for keeping it current.

### Review Cadence
- Quarterly review of all docs
- Update on major changes
- New engineers flag gaps during onboarding

### Documentation in PRs
- PRs that change behavior must update relevant docs
- Reviewers check for doc updates

---

*A new engineer's first impression of the codebase comes from the documentation. Make it excellent.*
