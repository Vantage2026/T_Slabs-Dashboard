# Project Cost & Finance Intelligence
## Technical Review

**Reviewer:** Emmy, Principal Engineer  
**Date:** January 2025  
**Status:** Review Complete

---

## Executive Recommendation

**Ship a smaller MVP faster. The vision is sound, but the proposed 10-12 week MVP is 16-20 weeks of actual work.**

Jeff nailed the problem space and the UX vision. The "every number is clickable" philosophy is the right differentiator. The data model is mostly correct. But the BRD conflates "what we want" with "what's achievable in a quarter."

**My call:** Cut MVP scope by 40%, ship in 8 weeks, iterate based on real usage. The proposed Phase 1 tries to boil the ocean with budgets, alerts, multi-level drill-down, and complex rule matching all at once. Users need to see project costs *first*—everything else is optimization.

**Green light with conditions:**
1. Accept the trimmed MVP scope below
2. Staff with 2 backend + 1 frontend + 0.5 design for 8 weeks
3. Defer shared cost allocation entirely to Phase 2 (it's the complexity monster)

---

## Feasible Now vs. Later

### Build Now (MVP)
| Feature | Complexity | Notes |
|---------|------------|-------|
| Project CRUD | Low | Standard Prisma models |
| Tag-based matching (exact match only) | Low | Simple SQL WHERE clauses |
| Account-based matching | Low | FK relationship |
| Pre-aggregated project costs | Medium | Daily batch job, not real-time |
| Project dashboard (cost by service) | Medium | Chart + table, single level |
| Project list with search | Low | Standard pagination + filtering |
| Basic budget (monthly amount + threshold) | Low | Simple comparison logic |
| Email alerts for budget threshold | Low | Extend existing alert system |

### Build Later (Phase 2+)
| Feature | Complexity | Why Defer |
|---------|------------|-----------|
| Regex resource patterns | Medium | Edge case; most users won't need |
| K8s namespace/label matching | High | Requires K8s metadata integration |
| Shared cost pools + allocation | High | This is 6-8 weeks alone |
| Usage-based allocation | Very High | Requires metrics pipeline integration |
| Multi-level drill-down (3+ levels) | Medium | Nice-to-have, not need-to-have |
| What-if scenarios | High | Requires cost simulation engine |
| Forecasting with confidence intervals | High | ML component, data science work |
| Hierarchical projects | Medium | Complicates queries significantly |
| Historical recomputation | High | Expensive, complex invalidation logic |
| Real-time/streaming updates | Very High | Infrastructure overhaul |

### Never Build (Wrong Layer)
| Feature | Reason |
|---------|--------|
| Full FP&A integration | We're not an accounting system |
| Invoice generation | Partner with billing tools |
| GL reconciliation | Export + integrate, don't replicate |

---

## Schema & Data Model Recommendations

### Proposed Changes to Jeff's Model

**1. Simplify ProjectRule for MVP**

Jeff's model is over-engineered for Phase 1. Start simpler:

```prisma
model Project {
  id             String    @id @default(cuid())
  organizationId String
  name           String
  slug           String
  description    String?
  ownerId        String
  costCenter     String?
  status         ProjectStatus @default(ACTIVE)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  organization   Organization @relation(fields: [organizationId], references: [id])
  rules          ProjectRule[]
  budgets        Budget[]
  costs          ProjectCost[]
  
  @@unique([organizationId, slug])
  @@index([organizationId, status])
}

enum ProjectStatus {
  DRAFT
  ACTIVE
  ARCHIVED
}

model ProjectRule {
  id         String   @id @default(cuid())
  projectId  String
  ruleType   RuleType @default(INCLUDE)
  matchType  MatchType
  matchValue String   // Simple string for MVP: tag value, account ID, or service name
  tagKey     String?  // Only for TAG match type
  priority   Int      @default(0)
  createdAt  DateTime @default(now())
  
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
}

enum RuleType {
  INCLUDE
  EXCLUDE
}

enum MatchType {
  TAG          // Exact tag match
  ACCOUNT      // AWS account ID
  SERVICE      // Service name (e.g., "ec2", "rds")
}
```

**Why simpler:**
- No JSONB for `match_config` in MVP—Prisma's JSONB support is fine but adds query complexity
- Regex and K8s matching deferred—add `MatchType` enum values later
- `matchValue` as simple string covers 80% of use cases

**2. ProjectCost: Use Composite Key, Partition by Date**

```prisma
model ProjectCost {
  projectId  String
  date       DateTime @db.Date
  provider   String
  service    String
  cost       Decimal  @db.Decimal(16, 6)
  currency   String   @default("USD") @db.Char(3)
  costType   CostType @default(DIRECT)
  updatedAt  DateTime @updatedAt
  
  project    Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@id([projectId, date, provider, service])
  @@index([date])
  @@index([projectId, date])
}

enum CostType {
  DIRECT
  ALLOCATED
}
```

**Critical:** Run a raw SQL migration to create a partitioned table by month:

```sql
-- After Prisma creates the table, convert to partitioned
-- (Prisma doesn't support partitioning natively)
CREATE TABLE project_costs_partitioned (
  project_id TEXT NOT NULL,
  date DATE NOT NULL,
  provider TEXT NOT NULL,
  service TEXT NOT NULL,
  cost DECIMAL(16,6) NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  cost_type TEXT DEFAULT 'DIRECT',
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (project_id, date, provider, service)
) PARTITION BY RANGE (date);

-- Create monthly partitions
CREATE TABLE project_costs_y2025m01 PARTITION OF project_costs_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
-- etc.
```

**Why partition:** 
- Query patterns are always date-bounded
- Makes historical purging trivial (drop partition)
- Prevents table bloat as we scale

**3. Budget Model: Keep Simple**

```prisma
model Budget {
  id            String      @id @default(cuid())
  projectId     String
  amount        Decimal     @db.Decimal(16, 2)
  periodType    PeriodType  @default(MONTHLY)
  alertThresholds Int[]     @default([50, 80, 100]) // Percentages
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  
  project       Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  @@index([projectId])
}

enum PeriodType {
  MONTHLY
  QUARTERLY
  ANNUAL
}
```

**Deferred:** Rollover, multiple budgets per project, custom date ranges—all Phase 2.

**4. Add Audit Logging via Prisma Middleware**

Don't create an `AuditLog` model managed by Prisma. Use middleware + append-only table:

```typescript
// prisma/middleware/audit.ts
prisma.$use(async (params, next) => {
  const result = await next(params);
  
  if (['create', 'update', 'delete'].includes(params.action) && 
      ['Project', 'ProjectRule', 'Budget'].includes(params.model)) {
    await prisma.$executeRaw`
      INSERT INTO audit_log (entity_type, entity_id, action, changes, actor_id, timestamp)
      VALUES (${params.model}, ${result.id}, ${params.action}, ${JSON.stringify(params.args)}, ${getCurrentUserId()}, NOW())
    `;
  }
  
  return result;
});
```

**Why middleware:** Audit shouldn't be a Prisma model—it's write-only, never queried through ORM.

---

## API & Backend Architecture

### Next.js API Routes: Fine for MVP

Don't over-engineer. Next.js API routes + Prisma is sufficient for Phase 1.

```
/api/projects
  GET    - List projects (paginated)
  POST   - Create project

/api/projects/[id]
  GET    - Get project with rules
  PATCH  - Update project
  DELETE - Archive project (soft delete)

/api/projects/[id]/rules
  POST   - Add rule
  DELETE - Remove rule

/api/projects/[id]/costs
  GET    - Get aggregated costs (with date range, groupBy params)

/api/projects/[id]/budget
  GET    - Get budget
  PUT    - Set/update budget

/api/projects/[id]/drill
  GET    - Drill-down data (accepts dimension + filter params)
```

### Cost Aggregation: Background Job, Not Real-Time

**Architecture:**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Raw Cost Data  │────▶│  Aggregation Job │────▶│  ProjectCost    │
│  (existing)     │     │  (Vercel Cron)   │     │  (materialized) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  Project Rules   │
                        │  Evaluation      │
                        └──────────────────┘
```

**Implementation:**

```typescript
// app/api/cron/aggregate-project-costs/route.ts
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const yesterday = subDays(new Date(), 1);
  
  // Get all active projects with their rules
  const projects = await prisma.project.findMany({
    where: { status: 'ACTIVE' },
    include: { rules: true }
  });

  for (const project of projects) {
    await aggregateProjectCosts(project, yesterday);
  }

  return Response.json({ processed: projects.length });
}

async function aggregateProjectCosts(project: ProjectWithRules, date: Date) {
  // Build WHERE clause from rules
  const whereClause = buildWhereClauseFromRules(project.rules);
  
  // Aggregate from raw costs
  const costs = await prisma.$queryRaw`
    SELECT provider, service, SUM(cost) as cost, currency
    FROM raw_costs
    WHERE date = ${date}
    AND (${whereClause})
    GROUP BY provider, service, currency
  `;

  // Upsert into ProjectCost
  await prisma.$transaction(
    costs.map(c => 
      prisma.projectCost.upsert({
        where: {
          projectId_date_provider_service: {
            projectId: project.id,
            date,
            provider: c.provider,
            service: c.service
          }
        },
        create: { projectId: project.id, date, ...c },
        update: { cost: c.cost, updatedAt: new Date() }
      })
    )
  );
}
```

**Vercel Cron config (vercel.json):**
```json
{
  "crons": [
    {
      "path": "/api/cron/aggregate-project-costs",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Why daily batch:**
- Cloud billing data is inherently delayed (AWS CUR is 24-48h behind)
- Hourly provides false precision—the source data doesn't support it
- Keeps Vercel costs predictable

### Rule Evaluation: SQL-Based

Don't build a rules engine. Translate rules to SQL predicates.

```typescript
function buildWhereClauseFromRules(rules: ProjectRule[]): Prisma.Sql {
  const includes = rules.filter(r => r.ruleType === 'INCLUDE');
  const excludes = rules.filter(r => r.ruleType === 'EXCLUDE');

  const includeConditions = includes.map(r => {
    switch (r.matchType) {
      case 'TAG':
        return Prisma.sql`(tags->>${r.tagKey} = ${r.matchValue})`;
      case 'ACCOUNT':
        return Prisma.sql`(account_id = ${r.matchValue})`;
      case 'SERVICE':
        return Prisma.sql`(service = ${r.matchValue})`;
    }
  });

  const excludeConditions = excludes.map(r => {
    // Same logic, will be negated
  });

  return Prisma.sql`
    (${Prisma.join(includeConditions, ' OR ')})
    ${excludes.length > 0 ? Prisma.sql`AND NOT (${Prisma.join(excludeConditions, ' OR ')})` : Prisma.empty}
  `;
}
```

**Why SQL-based:**
- Postgres is already optimized for this
- No additional infrastructure
- Rules are evaluated at aggregation time, not query time
- Easy to test (just run the query)

---

## Frontend Architecture

### Stack Recommendation

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | Next.js App Router | Already in stack, RSC for data loading |
| State | Zustand | Lightweight, URL sync for drill-down state |
| Charts | Recharts | Best React integration, good accessibility |
| Tables | TanStack Table | Handles sorting, pagination, virtual scrolling |
| Forms | React Hook Form + Zod | Type-safe validation for rule builder |
| UI Components | Existing design system | Don't introduce new dependencies |

### Drill-Down Panel Architecture

This is the critical UX. Get it right.

```typescript
// stores/drill-down.ts
interface DrillState {
  panels: DrillPanel[];  // Stack of open panels
  push: (panel: DrillPanel) => void;
  pop: () => void;
  clear: () => void;
}

interface DrillPanel {
  id: string;
  type: 'service' | 'resource-type' | 'resource';
  title: string;
  filters: Record<string, string>;
}

// Sync with URL
const useDrillStore = create<DrillState>()(
  persist(
    (set) => ({
      panels: [],
      push: (panel) => set((s) => ({ 
        panels: s.panels.length < 3 ? [...s.panels, panel] : s.panels 
      })),
      pop: () => set((s) => ({ panels: s.panels.slice(0, -1) })),
      clear: () => set({ panels: [] })
    }),
    {
      name: 'drill-state',
      storage: createURLStorage() // Custom storage that syncs to URL
    }
  )
);
```

**Panel Component:**

```tsx
// components/drill-panel.tsx
export function DrillPanel({ panel, index }: { panel: DrillPanel; index: number }) {
  const { pop } = useDrillStore();
  
  return (
    <Sheet 
      open={true} 
      onOpenChange={() => pop()}
      style={{ 
        width: `${40 - index * 5}%`,  // Narrower as we go deeper
        right: `${index * 2}%`         // Offset to show stack
      }}
    >
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <Breadcrumb panels={panels.slice(0, index + 1)} />
          <SheetTitle>{panel.title}</SheetTitle>
        </SheetHeader>
        
        <DrillContent panel={panel} />
        
        <SheetFooter>
          <Button variant="ghost" onClick={() => pop()}>
            ← Back
          </Button>
          <Button variant="outline" asChild>
            <Link href={getDeepLink(panel)} target="_blank">
              Open in new tab
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

**Deep Linking:**

```typescript
// URL structure: /projects/[id]?drill=service:ec2,resource-type:instance
function createURLStorage(): StateStorage {
  return {
    getItem: () => {
      const params = new URLSearchParams(window.location.search);
      const drill = params.get('drill');
      if (!drill) return null;
      return JSON.stringify({ panels: parseDrillParam(drill) });
    },
    setItem: (_, value) => {
      const { panels } = JSON.parse(value);
      const drill = serializeDrillPanels(panels);
      const url = new URL(window.location.href);
      if (drill) url.searchParams.set('drill', drill);
      else url.searchParams.delete('drill');
      window.history.replaceState({}, '', url);
    },
    removeItem: () => {
      const url = new URL(window.location.href);
      url.searchParams.delete('drill');
      window.history.replaceState({}, '', url);
    }
  };
}
```

### Project Dashboard Layout

```tsx
// app/projects/[id]/page.tsx
export default async function ProjectDashboard({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);
  const costSummary = await getProjectCostSummary(params.id);
  
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Left: Vitals */}
      <aside className="col-span-3">
        <CostCard 
          amount={costSummary.currentPeriod} 
          trend={costSummary.trend}
          onClick={() => drillStore.push({ type: 'service', ... })}
        />
        <BudgetCard project={project} />
        <AlertsList projectId={params.id} />
      </aside>
      
      {/* Center: Breakdown */}
      <main className="col-span-6">
        <Tabs defaultValue="service">
          <TabsList>
            <TabsTrigger value="service">By Service</TabsTrigger>
            <TabsTrigger value="time">By Time</TabsTrigger>
          </TabsList>
          <TabsContent value="service">
            <CostBreakdownChart data={costSummary.byService} />
            <CostBreakdownTable data={costSummary.byService} onRowClick={handleDrill} />
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Right: Intelligence (Phase 2 placeholder) */}
      <aside className="col-span-3">
        <Card>
          <CardHeader>Insights</CardHeader>
          <CardContent>Coming in Phase 2</CardContent>
        </Card>
      </aside>
      
      {/* Drill panels render as portals */}
      <DrillPanelStack />
    </div>
  );
}
```

---

## Performance Considerations

### Query Patterns & Indexes

**Primary queries and required indexes:**

```sql
-- Query 1: Project list for org (frequent)
SELECT * FROM projects 
WHERE organization_id = ? AND status = 'ACTIVE'
ORDER BY name;
-- Index: (organization_id, status) INCLUDE (name)

-- Query 2: Project costs for date range (very frequent)
SELECT date, SUM(cost) as daily_cost
FROM project_costs
WHERE project_id = ? AND date BETWEEN ? AND ?
GROUP BY date;
-- Index: PRIMARY KEY (project_id, date, ...) handles this

-- Query 3: Cost breakdown by service (frequent)
SELECT service, SUM(cost) as total
FROM project_costs
WHERE project_id = ? AND date BETWEEN ? AND ?
GROUP BY service
ORDER BY total DESC;
-- Index: Same PK

-- Query 4: Budget check (daily cron)
SELECT p.id, p.name, b.amount, SUM(pc.cost) as spent
FROM projects p
JOIN budgets b ON b.project_id = p.id
JOIN project_costs pc ON pc.project_id = p.id
WHERE pc.date >= date_trunc('month', CURRENT_DATE)
GROUP BY p.id, b.amount
HAVING SUM(pc.cost) > b.amount * 0.8;
-- Consider materialized view for this
```

### Caching Strategy

**Layer 1: React Query (Client)**
```typescript
// 5 minute stale time for cost data (it's daily anyway)
const { data: costs } = useQuery({
  queryKey: ['project-costs', projectId, dateRange],
  queryFn: () => fetchProjectCosts(projectId, dateRange),
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000
});
```

**Layer 2: Next.js Cache (Server)**
```typescript
// app/api/projects/[id]/costs/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const costs = await unstable_cache(
    async () => getProjectCosts(params.id),
    [`project-costs-${params.id}`],
    { revalidate: 3600, tags: [`project-${params.id}`] }
  )();
  
  return Response.json(costs);
}

// Invalidate when costs are updated
revalidateTag(`project-${projectId}`);
```

**Layer 3: Database (Materialized View for Dashboards)**
```sql
CREATE MATERIALIZED VIEW project_cost_summary AS
SELECT 
  project_id,
  date_trunc('month', date) as month,
  provider,
  service,
  SUM(cost) as total_cost
FROM project_costs
GROUP BY project_id, date_trunc('month', date), provider, service;

-- Refresh daily after aggregation job
REFRESH MATERIALIZED VIEW CONCURRENTLY project_cost_summary;
```

### Pagination

**Do:** Use cursor-based pagination for cost tables.
```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['project-costs', projectId],
  queryFn: ({ pageParam }) => fetchCosts({ cursor: pageParam }),
  getNextPageParam: (lastPage) => lastPage.nextCursor
});
```

**Don't:** Use offset pagination—gets slow as offset increases.

### Vercel Limits to Watch

| Resource | Limit | Our Usage | Risk |
|----------|-------|-----------|------|
| Function duration | 60s (Pro) | Aggregation job | Medium—batch by org if needed |
| Memory | 1024MB | Query results | Low—paginate |
| Cron jobs | 1/day (Hobby) | Aggregation | Low—on Pro plan |
| Database connections | Pool-dependent | Prisma pool | Medium—use `@prisma/adapter-vercel` |

---

## Data Quality & Trust

### The Trust Problem

Jeff is right: if users don't trust the numbers, they'll build shadow spreadsheets. Here's how we build trust:

### 1. Show Your Work

Every cost number needs an "explain" affordance:

```tsx
function CostCell({ amount, projectId, service, date }: CostCellProps) {
  return (
    <HoverCard>
      <HoverCardTrigger>
        {formatCurrency(amount)}
      </HoverCardTrigger>
      <HoverCardContent>
        <h4>How this was calculated</h4>
        <dl>
          <dt>Direct costs</dt>
          <dd>{formatCurrency(breakdown.direct)}</dd>
          <dt>Allocated costs</dt>
          <dd>{formatCurrency(breakdown.allocated)} (Phase 2)</dd>
          <dt>Rules applied</dt>
          <dd>{breakdown.rulesApplied.map(r => r.name).join(', ')}</dd>
          <dt>Last updated</dt>
          <dd>{formatRelative(breakdown.updatedAt)}</dd>
        </dl>
      </HoverCardContent>
    </HoverCard>
  );
}
```

### 2. Data Freshness Indicators

Always show when data was last updated:

```tsx
function ProjectDashboard() {
  return (
    <>
      <header>
        <h1>Project Phoenix</h1>
        <Badge variant="outline">
          <ClockIcon className="w-3 h-3 mr-1" />
          Costs updated {formatRelative(lastAggregationTime)}
        </Badge>
      </header>
    </>
  );
}
```

### 3. Rule Version History

When rules change, keep the old versions:

```prisma
model ProjectRuleVersion {
  id           String   @id @default(cuid())
  ruleId       String
  version      Int
  matchType    MatchType
  matchValue   String
  tagKey       String?
  validFrom    DateTime
  validTo      DateTime?
  createdBy    String
  
  @@index([ruleId, validFrom])
}
```

**Why:** Enables "why did my costs change last month?" investigations.

### 4. Coverage Metrics

Show users how much spend is captured:

```sql
-- Calculate coverage
WITH project_costs AS (
  SELECT SUM(cost) as captured FROM project_costs WHERE date = ?
),
total_costs AS (
  SELECT SUM(cost) as total FROM raw_costs WHERE date = ?
)
SELECT 
  captured,
  total,
  ROUND(captured / total * 100, 1) as coverage_pct
FROM project_costs, total_costs;
```

Display prominently: "Projects capture 87% of total spend. $23,456 unallocated."

---

## Security & Permissions

### Current Model Assumption

Assuming existing Vantage authz model extends to projects. If not, here's what we need:

### Project-Level Permissions

```prisma
model ProjectMember {
  id         String          @id @default(cuid())
  projectId  String
  userId     String
  role       ProjectRole
  createdAt  DateTime        @default(now())
  
  project    Project         @relation(fields: [projectId], references: [id])
  
  @@unique([projectId, userId])
}

enum ProjectRole {
  VIEWER     // See costs and budgets
  EDITOR     // Modify rules and budgets
  ADMIN      // Delete project, manage members
}
```

### Authorization Checks

```typescript
// middleware/project-auth.ts
export async function requireProjectAccess(
  projectId: string, 
  userId: string, 
  minRole: ProjectRole = 'VIEWER'
): Promise<void> {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } }
  });
  
  // Also check org-level admin
  const isOrgAdmin = await checkOrgAdmin(userId, projectId);
  
  if (!membership && !isOrgAdmin) {
    throw new ForbiddenError('No access to this project');
  }
  
  if (membership && !roleAtLeast(membership.role, minRole)) {
    throw new ForbiddenError(`Requires ${minRole} role`);
  }
}

// Usage in API routes
export async function PATCH(request: Request, { params }) {
  const user = await getUser(request);
  await requireProjectAccess(params.id, user.id, 'EDITOR');
  // ... proceed with update
}
```

### Data Isolation

**Critical:** Project queries must always be scoped by organization.

```typescript
// BAD - SQL injection and cross-org leak risk
const project = await prisma.project.findUnique({ where: { id } });

// GOOD - Always scope by org
const project = await prisma.project.findFirst({
  where: { 
    id,
    organizationId: user.organizationId  // Always include
  }
});
```

### Sensitive Fields

Budget amounts may be confidential. Add field-level visibility:

```typescript
function serializeProject(project: Project, userRole: ProjectRole) {
  return {
    ...project,
    // Only editors+ see budgets
    budgets: roleAtLeast(userRole, 'EDITOR') ? project.budgets : undefined,
    // Only admins see member list
    members: roleAtLeast(userRole, 'ADMIN') ? project.members : undefined
  };
}
```

---

## MVP Scope Trim & Build Order

### Trimmed MVP Scope (8 weeks)

**In:**
- [ ] Project CRUD (name, description, owner, status)
- [ ] Tag-based rules (exact match only—no regex, no K8s)
- [ ] Account-based rules
- [ ] Daily cost aggregation job
- [ ] Project list page (search, filter by status)
- [ ] Project dashboard (cost this month, trend vs last month)
- [ ] Cost breakdown by service (table + simple bar chart)
- [ ] Single-level drill-down (project → service detail)
- [ ] Monthly budget with 3 fixed thresholds (50%, 80%, 100%)
- [ ] Budget alerts via email only

**Out (deferred to Phase 2):**
- Service-based rules (too close to regex complexity)
- Regex patterns
- K8s namespace matching
- Shared cost pools
- Multi-level drill-down
- Alert destinations beyond email
- Budget rollover
- Multiple budgets per project
- Forecasting
- Scenarios
- Custom date range budgets
- Historical backfill
- API for external consumers

### Build Order with Estimates

| Week | Deliverable | Team | Notes |
|------|-------------|------|-------|
| 1 | Schema + migrations | Backend | Project, ProjectRule, Budget, ProjectCost tables |
| 1 | Seed data + test fixtures | Backend | Need realistic test data |
| 2 | Cost aggregation job v1 | Backend | Tag rules only, single org test |
| 2 | Project CRUD API | Backend | Standard REST endpoints |
| 3 | Project list UI | Frontend | Search, filter, pagination |
| 3 | Project create wizard | Frontend | Name, rules builder, preview |
| 4 | Project dashboard shell | Frontend | Layout, vitals cards |
| 4 | Cost breakdown chart | Frontend | Recharts integration |
| 5 | Aggregation job v2 | Backend | Account rules, all orgs, error handling |
| 5 | Drill-down panel | Frontend | Service detail view |
| 6 | Budget CRUD | Backend | API + validation |
| 6 | Budget UI | Frontend | Set budget, threshold config |
| 7 | Budget alert job | Backend | Threshold check, email send |
| 7 | Integration testing | All | End-to-end flows |
| 8 | Performance tuning | All | Index optimization, caching |
| 8 | Bug fixes + polish | All | Buffer for unknowns |

### Staffing

- **Backend:** 2 engineers (one senior for aggregation, one mid for CRUD)
- **Frontend:** 1 senior engineer (owns dashboard, drill-down, budget UI)
- **Design:** 0.5 (finalize drill-down interaction, review)

---

## Risks & Mitigations

### Risk 1: Aggregation Job Performance at Scale

**Severity:** High  
**Likelihood:** Medium

**Problem:** Daily aggregation for orgs with 10K+ projects and 1M resources could exceed Vercel function limits.

**Mitigations:**
1. Batch by organization, not global
2. Parallelize with Vercel Cron + edge functions (one job per org)
3. Failsafe: fall back to async processing via queue (Upstash QStash)
4. Set up monitoring from day 1 (alert if job > 30s)

### Risk 2: Rule Complexity Creep

**Severity:** Medium  
**Likelihood:** High

**Problem:** Users will immediately want regex, K8s, OR logic, etc.

**Mitigations:**
1. Document the Phase 2 roadmap clearly
2. Provide workaround guidance (multiple rules as OR)
3. Track feature requests to validate priority
4. Don't promise timelines until Phase 1 is stable

### Risk 3: Budget Alert Spam

**Severity:** Low  
**Likelihood:** Medium

**Problem:** Noisy alerts train users to ignore them.

**Mitigations:**
1. Only alert once per threshold per budget period
2. Clear "acknowledged" state to suppress re-alerts
3. Batched digest option (Phase 2)

### Risk 4: Data Freshness Confusion

**Severity:** Medium  
**Likelihood:** High

**Problem:** Users expect real-time but cloud billing is inherently delayed.

**Mitigations:**
1. Always show data freshness timestamp
2. Education in UI ("Cloud costs are typically 24-48h delayed")
3. Don't over-promise—call it "daily" not "real-time"

### Risk 5: Multi-Tenant Isolation Bug

**Severity:** Critical  
**Likelihood:** Low

**Problem:** Cross-org data leakage would be catastrophic.

**Mitigations:**
1. Mandatory `organizationId` in all queries (Prisma middleware)
2. Security review before launch
3. Automated test suite for isolation
4. Bug bounty for critical auth issues

---

## Open Decisions: My Recommendations

### Decision 1: Aggregation Architecture
**Jeff's options:** On-demand vs. Materialized vs. Hybrid

**My recommendation:** **Materialized (Option 2)** with daily refresh.

Rationale:
- Source data (cloud bills) is daily anyway
- Read patterns dominate (dashboards, reports)
- Staleness is acceptable—users understand cloud billing lag
- On-demand is a scaling trap; hybrid adds complexity without benefit at our scale

**When rules change:** Queue a backfill job for affected projects (configurable window, default 30 days). Run async.

---

### Decision 2: Rule Evaluation Engine
**Jeff's options:** SQL vs. In-memory vs. Streaming

**My recommendation:** **SQL-based (Option 1)** for MVP.

Rationale:
- Rules are evaluated at write time (aggregation job), not query time
- Postgres is excellent at this
- No new infrastructure
- We're not evaluating rules against live requests

Defer in-memory engine until rule complexity demands it (regex, nested logic).

---

### Decision 3: Multi-Tenancy for Shared Cost Pools
**Jeff's question:** Can pools span orgs?

**My recommendation:** **No, org-scoped only** for MVP and likely forever.

Rationale:
- Cross-org pools create security nightmares
- Enterprise multi-account is better solved with org hierarchy
- Data model complexity doubles
- No customer has explicitly requested this

If enterprises need this, solve with org consolidation feature instead.

---

### Decision 4: Real-Time vs. Batch Processing
**Jeff's options:** Daily vs. Hourly vs. Streaming

**My recommendation:** **Daily batch** for MVP, evaluate hourly for Phase 2.

Rationale:
- Cloud billing data is 24-48h delayed
- Hourly provides false precision
- Streaming is infrastructure overkill
- Daily fits Vercel Cron model perfectly

Revisit for Phase 3 anomaly detection—but even then, hourly is probably sufficient.

---

### Decision 5: Historical Recomputation Scope
**Jeff's options:** None vs. Configurable vs. Full

**My recommendation:** **Configurable window, default 30 days.**

Rationale:
- 30 days covers most "oops, wrong rule" scenarios
- 90 days is expensive for large projects
- Full history is cost-prohibitive and rarely needed
- Make it user-selectable at recomputation time

**Implementation:** Backfill job accepts `days` param, caps at 90, warns if > 60.

---

### Decision 6: Usage Metrics for Allocation
**Jeff's question:** What metrics and how to source them?

**My recommendation:** **Defer to Phase 2. Use proportional allocation only for MVP.**

Rationale:
- Usage-based allocation requires metrics pipeline
- CloudWatch/Datadog integration is 4-6 weeks alone
- Proportional allocation covers 70% of use cases
- Don't let perfect be enemy of shipped

Phase 2 priority: CloudWatch native metrics first (free tier), then Datadog integration (partnership opportunity).

---

### Decision 7: Drill-Down Panel Implementation
**Jeff's question:** How to implement sliding panels?

**My recommendation:** Use **Radix Sheet component + Zustand state + URL sync.**

Details in Frontend Architecture section above. Key points:
- Stack max 3 panels (more is confusing)
- Each panel narrows by 5% (visual hierarchy)
- URL reflects drill state (deep linking)
- Escape key closes, arrow keys navigate

Don't build custom—Radix Sheet handles accessibility correctly.

---

### Decision 8: Budget Alert Delivery
**Jeff's options:** Extend existing vs. Dedicated vs. Third-party

**My recommendation:** **Extend existing alerting** for MVP.

Rationale:
- Budget alerts are just another alert type
- No need for separate pipeline
- Third-party integration (PagerDuty, Slack) is Phase 2
- Email-only is sufficient for MVP

Add `alert_type = 'BUDGET'` to existing alerts table. Reuse email sending infrastructure.

---

## Summary: Top Actions

1. **Cut MVP scope 40%**—ship in 8 weeks, not 12
2. **Defer shared cost allocation** entirely—it's Phase 2
3. **Daily batch aggregation**, not hourly or real-time
4. **SQL-based rule evaluation**—don't build a rules engine
5. **Simple schema first**—no JSONB match_config in MVP
6. **Partition ProjectCost by month**—critical for scale
7. **Budget alerts via existing system**—email only for MVP
8. **Trust through transparency**—show the math everywhere

---

*Review complete. Happy to walk through any section in detail.*

**— Emmy**
