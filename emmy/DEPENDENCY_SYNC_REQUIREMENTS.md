# Technical Requirements: First-Class Dependency Sync

**Author:** Assistant  
**Date:** February 15, 2026  
**For Review By:** Emmy (Principal Engineer)

---

## Problem Statement

The critical path engine and timeline drift system cannot perform real dependency-based analysis because issue links are trapped in an unstructured `metadata` JSON blob. A task that blocks 5 others looks identical to an isolated task unless you parse JSON at runtime. The projected delivery date, health score, and cascade propagation all suffer from this blind spot.

**Current state:**
- Jira adapter fetches `issuelinks` via `fields=*all` and normalizes them into `metadata.issueLinks` (array of `{ type, direction, key, id, summary, status }`) plus `blocksCount` / `blockedByCount`
- The sync engine stores this in `Task.metadata` (Prisma Json field) without interpretation
- The critical path engine reads `metadata.blocksCount` and `metadata.issueLinks` to build a blocker graph — but only using Jira keys, not internal task IDs
- No relational model exists — you can't query "all tasks blocked by X" without scanning every task's metadata JSON
- Monday.com and Asana dependencies are not captured at all

**What breaks without first-class dependencies:**
1. Critical path analysis uses Jira keys that may not resolve to synced tasks
2. Timeline cascade only propagates vertically (child → parent), not horizontally (blocker → blocked)
3. Delivery date projections ignore dependency chains entirely
4. Health scores underestimate risk when unlinked tasks have hidden dependencies
5. No way to visualize or query the dependency graph

---

## Proposed Approach

### 1. New Prisma Model: `TaskDependency`

```prisma
model TaskDependency {
  id              String   @id @default(cuid())
  
  // The task that is blocking/preceding
  sourceTaskId    String
  sourceTask      Task     @relation("DependencySource", fields: [sourceTaskId], references: [id])
  
  // The task that is blocked/dependent
  targetTaskId    String
  targetTask      Task     @relation("DependencyTarget", fields: [targetTaskId], references: [id])
  
  // Relationship type
  dependencyType  String   // "blocks", "is_blocked_by", "relates_to", "duplicates", "clones"
  
  // Source system info (for sync reconciliation)
  externalLinkId  String?  // Jira link ID, Monday dependency ID, etc.
  source          String   // "jira", "monday", "asana", "vantage"
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([sourceTaskId, targetTaskId, dependencyType])
  @@index([sourceTaskId])
  @@index([targetTaskId])
  @@map("task_dependencies")
}
```

Add to `Task` model:
```prisma
  // Dependencies
  dependenciesAsSource  TaskDependency[] @relation("DependencySource")
  dependenciesAsTarget  TaskDependency[] @relation("DependencyTarget")
```

### 2. Dependency Resolution in Sync Engine

After `upsertTask` stores a task with `metadata.issueLinks`, a new `syncDependencies` function would:

1. For each `issueLink` in the task's metadata:
   - Look up the linked Jira key/ID in our database (`Task` where `metadata.key = link.key` or `sourceId = link.id`)
   - If the target task exists locally, create/update a `TaskDependency` row
   - If the target task doesn't exist yet (not synced), store in a pending resolution queue
2. After all tasks in a project are synced, run a second pass to resolve any pending links
3. Clean up stale dependencies (links that existed in our DB but were removed in Jira)

### 3. Adapter-Level Normalization

Extend `NormalizedTask` to include a standard dependency shape:

```typescript
interface NormalizedDependency {
  sourceId: string;       // External ID of the source task
  targetSourceId: string; // External ID of the target task  
  type: string;           // "blocks", "is_blocked_by", "relates_to"
  externalLinkId?: string;
}

// Add to NormalizedTask:
dependencies?: NormalizedDependency[];
```

Each adapter (Jira, Monday, Asana) maps its native link format to this shared shape.

### 4. Critical Path Engine Upgrade

Replace the current Jira-key-based graph with internal task ID graph:

```typescript
// Instead of:
const blocksGraph = new Map<string, string[]>(); // key -> keys
// Use:
const deps = await prisma.taskDependency.findMany({
  where: { sourceTaskId: { in: taskIds }, dependencyType: "blocks" }
});
// Build graph from actual resolved internal IDs
```

### 5. Timeline Cascade: Horizontal Propagation

When a task's due date changes, in addition to vertical cascade (child → parent):

1. Query `TaskDependency` where `sourceTaskId = changedTaskId` and `dependencyType = "blocks"`
2. For each blocked task: if the blocker's new due date > blocked task's start date, flag the blocked task
3. Optionally auto-adjust the blocked task's projected date
4. Record a `TimelineEvent` with `cascadedFrom` = blocker task ID and `eventType = "dependency_cascade"`

### 6. Monday.com + Asana Dependency Mapping

- **Monday.com:** `dependency` column type → map to `NormalizedDependency`
- **Asana:** `task.dependencies` and `task.dependents` API fields → map to `NormalizedDependency`

---

## Scope Questions for Emmy

1. **Schema design:** Is `TaskDependency` the right model, or should we use a simpler approach (e.g., just store resolved task IDs in a `blockedByIds` array on `Task`)?

2. **Resolution timing:** Should we resolve Jira keys → internal IDs during sync (requires two-pass), or lazily at query time?

3. **Horizontal cascade:** Should blocked tasks auto-adjust their projected dates, or just get flagged with a warning? Auto-adjusting could cause cascading chaos if dependencies are messy.

4. **Stale link cleanup:** When a Jira link is removed, should we delete the `TaskDependency` immediately, or soft-delete with a grace period?

5. **Cross-project dependencies:** A task in Project A blocks a task in Project B. Should we support this? The current sync is per-project.

6. **Performance:** With potentially thousands of dependencies, should the critical path engine query the DB or receive pre-loaded data?

7. **What's the MVP?** Which subset of this can ship first to deliver the most value with least risk?

---

## Files That Would Change

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add `TaskDependency` model + relations on `Task` |
| `src/types/index.ts` | Add `NormalizedDependency` to `NormalizedTask` |
| `src/lib/adapters/jira.ts` | Emit `dependencies[]` from `normalizeIssue` |
| `src/lib/adapters/monday.ts` | Map dependency columns to `NormalizedDependency` |
| `src/lib/adapters/asana.ts` | Map task dependencies to `NormalizedDependency` |
| `src/lib/sync/engine.ts` | Add `syncDependencies()` after task upsert |
| `src/lib/critical-path.ts` | Use `TaskDependency` table instead of metadata parsing |
| `src/lib/timeline/propagate-cascade.ts` | Add horizontal cascade via dependency graph |
| `src/app/api/timeline/recalculate/route.ts` | Include dependency data in recalculation |
| `src/components/gantt-chart.tsx` | Render dependency arrows between linked bars |
