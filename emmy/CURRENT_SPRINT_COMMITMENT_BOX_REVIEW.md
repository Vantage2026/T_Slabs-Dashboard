# Technical Review: Current Sprint Commitment Box BRD
## Principal Engineer Assessment

**Reviewer:** Emmy, Principal Engineer  
**Date:** February 2025  
**Document Under Review:** CURRENT_SPRINT_COMMITMENT_BOX_BRD.md (Jeff, SVP Product)  
**Reference Architecture:** pm-sync (Next.js 14 + Prisma + PostgreSQL + Jira Integration)

---

## 1. Executive Verdict

**Overall Assessment: APPROVED with required changes**

This is a well-conceived feature with strong product thinking. Jeff has done excellent work on audience segmentation, progressive disclosure, and edge case enumeration. The core concept—making sprint commitment visible outside Jira—solves a real problem.

However, the BRD has gaps that would result in data trust issues and architectural debt if shipped as specified. The health score formula has mathematical flaws, the commitment baseline logic has race conditions, and the sync architecture underspecifies conflict resolution.

**Verdict breakdown:**

| Aspect | Assessment |
|--------|------------|
| Product vision | ✅ Excellent — clear problem framing, audience understanding |
| UX design | ✅ Strong — progressive disclosure, visual states well-defined |
| Data model | ⚠️ Needs work — baseline immutability has gaps, scope changes need ordering |
| Health calculation | ❌ Requires rework — formula produces incorrect results at edge cases |
| Sync architecture | ⚠️ Needs work — webhook/poll/reconciliation conflict resolution undefined |
| Edge cases | ✅ Good coverage — but missing critical sprint boundary transitions |
| Trust indicators | ⚠️ Needs work — staleness thresholds too generous for exec consumption |

**Bottom line:** Ship this feature, but fix the health score formula, tighten the baseline capture guarantees, and add the missing edge cases before MVP. These aren't optimizations—they're correctness requirements.

---

## 2. What to Keep from Jeff As-Is

### 2.1 Progressive Disclosure Model ✅

The four-level abstraction (Executive → Director → Manager → Engineer) is exactly right. Keep this structure intact:

```
Executive:      🟢 On Track | "7 of 8 committed items in progress or done"
     ↓ click
Director:       Sprint Health 87% | 2 items at risk | 1 scope addition
     ↓ click  
Manager:        [Full breakdown table with status, assignees, blockers]
     ↓ click
Engineer:       [Jira ticket detail, linked in context]
```

**Why it's correct:** Different audiences need different densities. Collapsing these levels (showing everyone the ticket list) would bury executives; hiding detail (showing only traffic light) would frustrate PMs. This layering respects cognitive load per role.

### 2.2 Box Anatomy and Visual States ✅

The box wireframe is well-structured. Keep:
- Header row with sprint metadata and settings gear
- Health banner with color-coded status
- Metrics grid (Committed / In Flight / At Risk / Done)
- Context row (scope changes, velocity trend)
- Action row (View Full Sprint, Sprint History)

**Why it's correct:** Information hierarchy flows correctly. Most important (health status) is most prominent. Actions are discoverable but not distracting.

### 2.3 Scope Change Tracking Concept ✅

The idea of tracking adds/removes post-baseline with timestamp, actor, and reason is essential. Keep the conceptual model:

```
| Type | Definition |
|------|------------|
| Scope addition | Item added to sprint after baseline |
| Scope removal | Item removed from sprint after baseline |
| Unplanned work | Item created AND added after baseline |
```

**Why it's correct:** Scope change is the #1 sprint failure mode. Making it visible creates accountability. The audit trail enables honest retrospectives.

### 2.4 Edge Case Coverage (Partial) ✅

Keep these edge case handlers as specified:
- No Active Sprint (show last sprint summary)
- Very Short/Long Sprints (scale thresholds proportionally)
- Jira Connection Lost (show cached data with warning)
- Story Points Not Used (fall back to issue count)
- Sprint Goal Not Set (omit section, don't show empty)

### 2.5 Alerting Model ✅

The alert types and triggers are well-chosen:
- Sprint Health Drop (>15% in 24h)
- New At-Risk Item
- Scope Change
- Blocker Added
- Sprint Off Track (<50%)

Keep these, but add hysteresis (see Section 3).

### 2.6 Drill-Down Panel Designs ✅

The Health Score Deep Dive, At-Risk Items, Full Sprint View, and Scope Change Log panel specifications are comprehensive and should be implemented as designed.

---

## 3. What to Change and Why

### 3.1 Health Score Formula — MUST FIX

**Problem:** The current formula produces mathematically incorrect results.

**Jeff's formula:**
```
health_score = (
    completion_component × 0.40 +
    progress_component × 0.25 +
    risk_component × 0.20 +
    stability_component × 0.15
)
```

**Issue 1: Progress component is undefined**

The doc says: "Progress adjustment: Expected progress = sprint_day / sprint_length × 100. Actual progress compared to expected, normalized."

This is ambiguous. What does "normalized" mean? If Day 7 of 14 (50% through), and 60% done, is progress 120%? Capped at 100%? What if 30% done at 50% through—is progress 60%? 

**Issue 2: Risk component penalizes too harshly**

Formula: `100 - (at_risk_items / committed_items × 100 × 2)`

If 2 of 8 items are at risk: `100 - (2/8 × 100 × 2) = 100 - 50 = 50%`

This means having 25% of items at-risk tanks the risk component to 50%, which seems right. But if 3 of 8 are at-risk: `100 - (3/8 × 100 × 2) = 100 - 75 = 25%`. And 4 of 8: `100 - (4/8 × 100 × 2) = 0%`.

The `× 2` multiplier is too aggressive and creates a cliff where the score collapses to zero.

**Issue 3: Stability component can go negative**

If 10 scope changes on 8 committed items: `100 - (10/8 × 100) = 100 - 125 = -25%`

Negative components break the weighted sum.

**Issue 4: Components not bounded [0, 100]**

Completion can exceed 100% if team completes more than committed (stretch goals). Progress can exceed 100% if ahead. Need explicit bounds.

**Required fix:** See Section 4.3 for corrected formula.

---

### 3.2 Commitment Baseline Capture — MUST FIX

**Problem:** Race condition between sprint start and baseline capture.

**Jeff's spec:**
> Commitment baseline: Captured at sprint start (default), OR first standup after sprint start (configurable), OR manual "lock commitment" action.

**Issue 1: "Sprint start" is ambiguous in Jira**

When Jira sends `sprint_started` webhook, issues may still be in flux. Sprint planning often continues for 15-30 minutes after "starting" the sprint. The baseline captured at webhook time may not reflect actual commitment.

**Issue 2: No idempotency guarantee**

If webhook fires twice (retry on network failure), do we overwrite the baseline? If baseline exists, is it immutable? The doc says "baseline immutable" but doesn't specify enforcement.

**Issue 3: Scheduled baseline has timezone issues**

"X hours after sprint start" — which timezone? Jira sprint start is typically midnight UTC or board-specific timezone. "First standup" is team-local time. This needs explicit handling.

**Required fix:**
1. Baseline capture uses configurable delay (default: 2 hours after sprint start webhook)
2. Baseline is write-once; subsequent capture attempts logged but rejected
3. Manual lock override is always available and takes precedence
4. All timestamps stored in UTC with explicit timezone context for display

---

### 3.3 At-Risk Detection Thresholds — MUST FIX

**Problem:** Thresholds are absolute when they should be relative to sprint length.

**Jeff's spec:**
> Stale in progress: No status change > 48h while "In Progress"
> Late start: Not started with <30% sprint time remaining

**Issue:** 48h staleness makes sense for a 2-week sprint but not for a 1-week sprint (that's half the sprint!) or a 3-day hotfix sprint (item would never trigger).

**Required fix:** Express all time-based thresholds as percentages of sprint duration:

| Trigger | Threshold |
|---------|-----------|
| Stale in progress | No change for >15% of sprint duration (min 24h, max 72h) |
| Late start | Not started with <25% sprint time remaining |
| Repeated carryover | Carried over from 2+ previous sprints (unchanged) |

---

### 3.4 Sync Architecture Conflict Resolution — MUST FIX

**Problem:** Three sync mechanisms (webhook, poll, daily reconciliation) with no conflict resolution rules.

**Jeff's spec:**
> Primary: Jira webhooks (real-time)
> Fallback: Polling every 5 minutes
> Reconciliation: Daily full sync

**Issue 1: Which source wins?**

If webhook says issue moved to "Done" at 10:00, but poll at 10:05 shows "In Progress" (stale Jira API cache), which state do we persist?

**Issue 2: Event ordering not guaranteed**

Webhooks can arrive out of order. Issue moved In Progress → Done → Reopened could arrive as Done → Reopened → In Progress. Current design doesn't handle this.

**Issue 3: Daily reconciliation can cause flip-flop**

If Jira has issue in Sprint A but our webhook processed it into Sprint B, daily reconciliation "corrects" to Sprint A, then next webhook puts it back in Sprint B. Users see oscillating data.

**Required fix:**
1. Every state change carries a Jira `updated` timestamp (source of truth)
2. On any sync: only apply change if incoming `updated` > stored `updated`
3. Daily reconciliation is append-only: flags discrepancies for review, doesn't auto-correct
4. Add `sync_conflict` table for manual review when timestamps collide

---

### 3.5 Staleness Thresholds for Data Trust — SHOULD FIX

**Problem:** The staleness thresholds are too generous for executive consumption.

**Jeff's spec:**
| Freshness | Display |
|-----------|---------|
| <5 min | "Live" |
| 5-30 min | "Updated X min ago" (Green) |
| 30-60 min | "Updated X min ago" (Amber) |
| >60 min | "⚠️ Data may be stale" (Red) |

**Issue:** If an executive is making a decision based on this data, showing "Live" for data that's 4 minutes old could mislead. And showing amber only at 30 minutes is too late—sprint state can change significantly in that window.

**Required fix:**

| Freshness | Display | Color |
|-----------|---------|-------|
| <1 min | "Live" | Green |
| 1-10 min | "Updated X min ago" | Green |
| 10-30 min | "Updated X min ago" | Amber |
| >30 min | "⚠️ Data may be stale" | Red |
| >4 hours | Health score shows "—", box shows "Sync required" | Red |

---

### 3.6 Alert Hysteresis — SHOULD FIX

**Problem:** Alerts can oscillate if health score bounces around threshold.

**Jeff's spec:**
> Health thresholds: 75-100 (On Track), 50-74 (At Risk), 0-49 (Off Track)

**Issue:** If health score is 74-76 range, it flips between "On Track" and "At Risk" on every minor change. This creates alert fatigue.

**Required fix:** Add hysteresis band:
- Transition from On Track → At Risk requires health < 73 (not 75)
- Transition from At Risk → On Track requires health > 77 (not 75)
- Same pattern for At Risk ↔ Off Track boundary

---

### 3.7 Missing Edge Case: Sprint Boundary Transition — MUST ADD

**Problem:** BRD doesn't specify what happens during sprint transition.

**Missing scenarios:**

**Scenario A: Sprint closes, new sprint hasn't started**
What displays? Current spec says "No Active Sprint" but what about the just-closed sprint's final state? Users want to see final results before they disappear.

**Scenario B: Sprint closes mid-day, new sprint starts same day**
Brief window where both sprints could be "active" in Jira (overlap). Which displays?

**Scenario C: Team forgot to close sprint**
Sprint end date passed but state is still "active" in Jira. Do we show it as current? Show warning?

**Required fix:** Add sprint lifecycle state machine:

```
┌─────────────┐     sprint_started      ┌─────────────┐
│   FUTURE    │ ─────────────────────▶ │   ACTIVE    │
└─────────────┘                         └──────┬──────┘
                                               │
                         sprint_closed OR      │
                         end_date + 24h        │
                                               ▼
                                        ┌─────────────┐
                                        │   CLOSED    │
                                        └──────┬──────┘
                                               │
                         7 days after close    │
                                               ▼
                                        ┌─────────────┐
                                        │  ARCHIVED   │
                                        └─────────────┘
```

Display rules:
- Show ACTIVE sprint if exists
- If no ACTIVE, show most recent CLOSED for 24 hours with "Sprint ended" banner
- After 24 hours, show "No Active Sprint" with link to last sprint
- If sprint past end_date but not closed: show with "⚠️ Sprint overdue for close" warning

---

### 3.8 Missing Edge Case: Mid-Sprint Project Reassignment — MUST ADD

**Problem:** BRD doesn't address what happens if a Jira board is reassigned to a different Vantage project mid-sprint.

**Scenario:** Project A is linked to Board X. Sprint 47 is active. Admin changes Board X link to Project B. What happens to Sprint 47 data?

**Required fix:**
1. Board-project association changes are logged with timestamp
2. Sprint data stays with original project until sprint closes
3. New sprint after reassignment goes to new project
4. Warning shown during reassignment: "Active sprint data will remain with [Project A]"

---

### 3.9 Carryover Item Double-Counting — SHOULD FIX

**Problem:** Carryover items could be counted in both sprints' baselines.

**Scenario:** Item PROJ-123 is in Sprint 46 baseline. Sprint closes with PROJ-123 incomplete. Sprint 47 starts, PROJ-123 auto-added by Jira. PROJ-123 is now in Sprint 47 baseline too.

For historical reporting: Sprint 46 shows "8 committed, 7 done" and Sprint 47 shows "8 committed" including the carryover. Total committed across two sprints = 16, but unique items = 15. This inflates commitment metrics.

**Required fix:**
1. Carryover items flagged in baseline with `is_carryover: true` and `carried_from_sprint_id`
2. Reporting can filter: "committed (excluding carryover)" vs "total in sprint"
3. Health score uses total in sprint (carryover items are real commitment)
4. Velocity calculations exclude carryover to avoid double-counting points

---

## 4. Required Backend/Data Model Changes

### 4.1 Schema Additions

```prisma
// ============================================================
// SPRINT COMMITMENT BOX DATA MODEL
// ============================================================

model JiraSprint {
  id                    String    @id // Jira sprint ID
  projectId             String    @map("project_id")
  project               Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  boardId               String    @map("board_id")
  name                  String
  state                 SprintState
  goal                  String?
  startDate             DateTime? @map("start_date")
  endDate               DateTime? @map("end_date")
  
  // Vantage-computed fields
  healthScore           Decimal?  @map("health_score") @db.Decimal(5, 2)
  healthStatus          SprintHealthStatus? @map("health_status")
  healthComputedAt      DateTime? @map("health_computed_at")
  
  // Sync metadata
  jiraUpdatedAt         DateTime  @map("jira_updated_at")
  lastSyncAt            DateTime  @map("last_sync_at")
  syncStatus            SyncStatus @map("sync_status") @default(HEALTHY)
  
  createdAt             DateTime  @map("created_at") @default(now())
  updatedAt             DateTime  @map("updated_at") @updatedAt

  // Relations
  baseline              SprintCommitmentBaseline?
  issues                SprintIssue[]
  scopeChanges          SprintScopeChange[]
  healthHistory         SprintHealthSnapshot[]

  @@index([projectId, state])
  @@index([boardId, state])
  @@map("jira_sprint")
}

enum SprintState {
  FUTURE
  ACTIVE
  CLOSED
}

enum SprintHealthStatus {
  ON_TRACK
  AT_RISK
  OFF_TRACK
  NO_DATA
}

enum SyncStatus {
  HEALTHY
  DEGRADED
  STALE
  FAILED
}

model SprintCommitmentBaseline {
  id                    String    @id @default(uuid())
  sprintId              String    @unique @map("sprint_id")
  sprint                JiraSprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  
  baselineTimestamp     DateTime  @map("baseline_timestamp")
  baselineType          BaselineType @map("baseline_type")
  capturedBy            String?   @map("captured_by") // User ID if manual
  
  // Snapshot data (immutable after creation)
  issueSnapshots        Json      @map("issue_snapshots") @db.JsonB // Array of issue states
  totalIssues           Int       @map("total_issues")
  totalPoints           Int?      @map("total_points")
  
  // Integrity
  snapshotHash          String    @map("snapshot_hash") // SHA-256 of issueSnapshots
  
  createdAt             DateTime  @map("created_at") @default(now())
  // No updatedAt — baseline is immutable

  @@map("sprint_commitment_baseline")
}

enum BaselineType {
  AUTO_START        // Captured at sprint start + delay
  MANUAL_LOCK       // PM clicked "Lock Commitment"
  SCHEDULED         // Captured at configured time
}

model SprintIssue {
  id                    String    @id @default(uuid())
  sprintId              String    @map("sprint_id")
  sprint                JiraSprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  
  // Jira identifiers
  issueKey              String    @map("issue_key")
  issueId               String    @map("issue_id")
  
  // Current state (updated on sync)
  summary               String
  status                String
  statusCategory        StatusCategory @map("status_category")
  issueType             String    @map("issue_type")
  assignee              String?
  assigneeId            String?   @map("assignee_id")
  storyPoints           Int?      @map("story_points")
  priority              String?
  flagged               Boolean   @default(false)
  
  // Vantage-computed risk assessment
  riskLevel             RiskLevel? @map("risk_level")
  riskReasons           String[]  @map("risk_reasons")
  
  // Carryover tracking
  isCarryover           Boolean   @default(false) @map("is_carryover")
  carriedFromSprintId   String?   @map("carried_from_sprint_id")
  carryoverCount        Int       @default(0) @map("carryover_count") // How many sprints this has been in
  
  // Timestamps
  statusChangedAt       DateTime? @map("status_changed_at")
  jiraUpdatedAt         DateTime  @map("jira_updated_at")
  addedToSprintAt       DateTime  @map("added_to_sprint_at")
  
  createdAt             DateTime  @map("created_at") @default(now())
  updatedAt             DateTime  @map("updated_at") @updatedAt

  @@unique([sprintId, issueKey])
  @@index([sprintId, statusCategory])
  @@index([sprintId, riskLevel])
  @@map("sprint_issue")
}

enum StatusCategory {
  TODO
  IN_PROGRESS
  DONE
}

enum RiskLevel {
  NONE
  LOW
  MEDIUM
  HIGH
}

model SprintScopeChange {
  id                    String    @id @default(uuid())
  sprintId              String    @map("sprint_id")
  sprint                JiraSprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  
  issueKey              String    @map("issue_key")
  issueId               String    @map("issue_id")
  issueSummary          String    @map("issue_summary")
  
  changeType            ScopeChangeType @map("change_type")
  changedAt             DateTime  @map("changed_at")
  changedBy             String?   @map("changed_by") // Jira user display name
  changedByAccountId    String?   @map("changed_by_account_id")
  reason                String?   // Extracted from comment or manual input
  
  storyPoints           Int?      @map("story_points")
  
  // Ordering for audit trail
  sequenceNumber        Int       @map("sequence_number") // Auto-increment per sprint
  
  createdAt             DateTime  @map("created_at") @default(now())

  @@index([sprintId, changedAt])
  @@index([sprintId, sequenceNumber])
  @@map("sprint_scope_change")
}

enum ScopeChangeType {
  ADDED
  REMOVED
  CREATED_AND_ADDED  // Unplanned work
}

model SprintHealthSnapshot {
  id                    String    @id @default(uuid())
  sprintId              String    @map("sprint_id")
  sprint                JiraSprint @relation(fields: [sprintId], references: [id], onDelete: Cascade)
  
  snapshotAt            DateTime  @map("snapshot_at")
  sprintDay             Int       @map("sprint_day")
  
  // Health components
  healthScore           Decimal   @map("health_score") @db.Decimal(5, 2)
  completionScore       Decimal   @map("completion_score") @db.Decimal(5, 2)
  progressScore         Decimal   @map("progress_score") @db.Decimal(5, 2)
  riskScore             Decimal   @map("risk_score") @db.Decimal(5, 2)
  stabilityScore        Decimal   @map("stability_score") @db.Decimal(5, 2)
  
  // Counts at snapshot time
  committedCount        Int       @map("committed_count")
  doneCount             Int       @map("done_count")
  inFlightCount         Int       @map("in_flight_count")
  atRiskCount           Int       @map("at_risk_count")
  scopeChangeCount      Int       @map("scope_change_count")
  
  createdAt             DateTime  @map("created_at") @default(now())

  @@index([sprintId, snapshotAt])
  @@map("sprint_health_snapshot")
}

model SprintSyncConflict {
  id                    String    @id @default(uuid())
  sprintId              String    @map("sprint_id")
  issueKey              String?   @map("issue_key")
  
  conflictType          String    @map("conflict_type")
  localState            Json      @map("local_state") @db.JsonB
  remoteState           Json      @map("remote_state") @db.JsonB
  localTimestamp        DateTime  @map("local_timestamp")
  remoteTimestamp       DateTime  @map("remote_timestamp")
  
  resolution            ConflictResolution?
  resolvedAt            DateTime? @map("resolved_at")
  resolvedBy            String?   @map("resolved_by")
  
  createdAt             DateTime  @map("created_at") @default(now())

  @@index([sprintId, resolution])
  @@map("sprint_sync_conflict")
}

enum ConflictResolution {
  AUTO_LOCAL_WINS
  AUTO_REMOTE_WINS
  MANUAL_LOCAL
  MANUAL_REMOTE
  MANUAL_MERGED
}
```

### 4.2 Baseline Snapshot Schema (JSONB)

```typescript
// Type for issueSnapshots JSONB field
interface IssueSnapshot {
  issueKey: string;
  issueId: string;
  summary: string;
  status: string;
  statusCategory: 'TODO' | 'IN_PROGRESS' | 'DONE';
  issueType: string;
  storyPoints: number | null;
  assignee: string | null;
  isCarryover: boolean;
  carriedFromSprintId: string | null;
}

// Validation: issueSnapshots must be array of IssueSnapshot
// Hash: SHA-256 of JSON.stringify(issueSnapshots.sort(byIssueKey))
```

### 4.3 Health Score Calculation (Corrected)

```typescript
// /lib/sprint/calculateSprintHealth.ts

interface SprintMetrics {
  committedCount: number;
  doneCount: number;
  inFlightCount: number;
  atRiskCount: number;
  scopeChangeCount: number;
  sprintDay: number;      // 1-indexed
  sprintLength: number;   // total days
  committedPoints: number | null;
  completedPoints: number | null;
}

interface HealthComponents {
  completion: number;  // 0-100
  progress: number;    // 0-100
  risk: number;        // 0-100
  stability: number;   // 0-100
}

interface HealthResult {
  score: number;           // 0-100
  status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'NO_DATA';
  components: HealthComponents;
}

const WEIGHTS = {
  completion: 0.40,
  progress: 0.25,
  risk: 0.20,
  stability: 0.15,
};

// Hysteresis thresholds for status transitions
const THRESHOLDS = {
  onTrack: { enter: 77, exit: 73 },
  atRisk: { enter: 52, exit: 48 },
};

export function calculateSprintHealth(
  metrics: SprintMetrics,
  previousStatus?: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK'
): HealthResult {
  // Guard: insufficient data
  if (metrics.committedCount === 0) {
    return { score: 0, status: 'NO_DATA', components: { completion: 0, progress: 0, risk: 0, stability: 0 } };
  }

  // 1. Completion component: done / committed
  const completion = clamp((metrics.doneCount / metrics.committedCount) * 100, 0, 100);

  // 2. Progress component: actual vs expected progress
  const expectedProgress = (metrics.sprintDay / metrics.sprintLength) * 100;
  const actualProgress = ((metrics.doneCount + metrics.inFlightCount) / metrics.committedCount) * 100;
  
  // Progress score: how far ahead/behind expected
  // At expected: 100. Behind: scaled down. Ahead: capped at 100.
  let progress: number;
  if (expectedProgress === 0) {
    progress = actualProgress > 0 ? 100 : 50; // Day 0 edge case
  } else {
    const progressRatio = actualProgress / expectedProgress;
    progress = clamp(progressRatio * 100, 0, 100);
  }

  // 3. Risk component: penalize at-risk items
  // Each at-risk item reduces score proportionally, but with diminishing penalty
  // 0 at-risk = 100, 25% at-risk = 70, 50% at-risk = 50, 100% at-risk = 20
  const atRiskRatio = metrics.atRiskCount / metrics.committedCount;
  const risk = clamp(100 - (atRiskRatio * 100 * 0.8), 20, 100);

  // 4. Stability component: penalize scope changes
  // Each scope change (relative to committed) reduces score
  // 0 changes = 100, 25% changes = 75, 50% changes = 50
  const changeRatio = metrics.scopeChangeCount / metrics.committedCount;
  const stability = clamp(100 - (changeRatio * 100), 0, 100);

  // Weighted score
  const score = Math.round(
    completion * WEIGHTS.completion +
    progress * WEIGHTS.progress +
    risk * WEIGHTS.risk +
    stability * WEIGHTS.stability
  );

  // Status with hysteresis
  const status = determineStatusWithHysteresis(score, previousStatus);

  return {
    score,
    status,
    components: { completion, progress, risk, stability },
  };
}

function determineStatusWithHysteresis(
  score: number,
  previousStatus?: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK'
): 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' {
  // No previous status: use standard thresholds
  if (!previousStatus) {
    if (score >= 75) return 'ON_TRACK';
    if (score >= 50) return 'AT_RISK';
    return 'OFF_TRACK';
  }

  // With hysteresis
  switch (previousStatus) {
    case 'ON_TRACK':
      // Need to drop below exit threshold to change
      if (score < THRESHOLDS.onTrack.exit) {
        return score >= THRESHOLDS.atRisk.exit ? 'AT_RISK' : 'OFF_TRACK';
      }
      return 'ON_TRACK';
    
    case 'AT_RISK':
      // Need to rise above enter threshold OR drop below exit
      if (score >= THRESHOLDS.onTrack.enter) return 'ON_TRACK';
      if (score < THRESHOLDS.atRisk.exit) return 'OFF_TRACK';
      return 'AT_RISK';
    
    case 'OFF_TRACK':
      // Need to rise above enter threshold to improve
      if (score >= THRESHOLDS.atRisk.enter) {
        return score >= THRESHOLDS.onTrack.enter ? 'ON_TRACK' : 'AT_RISK';
      }
      return 'OFF_TRACK';
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
```

---

## 5. Required API and Sync Changes

### 5.1 API Endpoints

```typescript
// Sprint Box Data
GET  /api/projects/:projectId/sprint/current
     → SprintBoxResponse (full box data for current sprint)

GET  /api/projects/:projectId/sprint/:sprintId
     → SprintDetailResponse (specific sprint, for history)

GET  /api/projects/:projectId/sprint/history
     → SprintHistoryResponse (last N sprints with summary)

// Drill-downs
GET  /api/sprints/:sprintId/issues
     ?status=at_risk|in_flight|done|todo
     ?assignee=:userId
     → PaginatedIssueListResponse

GET  /api/sprints/:sprintId/health-breakdown
     → HealthBreakdownResponse (component scores + history)

GET  /api/sprints/:sprintId/scope-changes
     → ScopeChangeLogResponse (ordered list)

// Actions
POST /api/sprints/:sprintId/baseline/lock
     → BaselineLockResponse (manual commitment lock)

POST /api/sprints/:sprintId/refresh
     → RefreshResponse (force sync, rate-limited)

// Admin
GET  /api/projects/:projectId/sprint/sync-status
     → SyncStatusResponse (health, last sync, conflicts)

POST /api/projects/:projectId/sprint/config
     → SprintConfigResponse (thresholds, baseline timing, etc.)
```

### 5.2 Response Schemas

```typescript
interface SprintBoxResponse {
  sprint: {
    id: string;
    name: string;
    state: 'ACTIVE' | 'CLOSED' | 'FUTURE';
    goal: string | null;
    startDate: string;  // ISO
    endDate: string;    // ISO
    currentDay: number;
    totalDays: number;
  };
  
  health: {
    score: number;
    status: 'ON_TRACK' | 'AT_RISK' | 'OFF_TRACK' | 'NO_DATA';
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | null;
  };
  
  metrics: {
    committed: { count: number; points: number | null };
    done: { count: number; points: number | null };
    inFlight: { count: number; points: number | null };
    atRisk: { count: number; items: AtRiskSummary[] };
  };
  
  scopeChanges: {
    added: number;
    removed: number;
    net: number;
    netPoints: number | null;
  };
  
  velocity: {
    current: number | null;        // Points completed this sprint so far
    sprintAverage: number | null;  // Avg of last 4 completed sprints
    trend: number | null;          // % change vs average
  } | null;
  
  baseline: {
    lockedAt: string;
    lockedBy: string | null;
    type: 'AUTO_START' | 'MANUAL_LOCK' | 'SCHEDULED';
  } | null;
  
  sync: {
    lastUpdated: string;  // ISO
    status: 'HEALTHY' | 'DEGRADED' | 'STALE' | 'FAILED';
    staleness: 'LIVE' | 'RECENT' | 'STALE' | 'VERY_STALE';
  };
}

interface AtRiskSummary {
  issueKey: string;
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  primaryReason: string;
}
```

### 5.3 Sync Architecture (Revised)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         JIRA                                         │
└──────────────┬────────────────────────────────┬─────────────────────┘
               │                                │
         Webhooks                          REST API
         (real-time)                       (poll/reconcile)
               │                                │
               ▼                                ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│    Webhook Handler       │      │    Poll Worker           │
│    (Vercel Function)     │      │    (Cron: every 5 min)   │
└──────────────┬───────────┘      └──────────────┬───────────┘
               │                                 │
               │         ┌───────────┐           │
               └────────▶│  Event    │◀──────────┘
                         │  Queue    │
                         │  (Redis)  │
                         └─────┬─────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Sync Processor    │
                    │   (ordered by       │
                    │    jira_updated_at) │
                    └──────────┬──────────┘
                               │
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
        ┌───────────┐   ┌───────────┐   ┌───────────┐
        │  Sprint   │   │  Issue    │   │  Scope    │
        │  Sync     │   │  Sync     │   │  Change   │
        └───────────┘   └───────────┘   │  Detect   │
                                        └───────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Conflict Check    │
                    │   (timestamp comp)  │
                    └──────────┬──────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
        ┌───────────┐                   ┌───────────┐
        │  Apply    │                   │  Log      │
        │  Update   │                   │  Conflict │
        └───────────┘                   └───────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Health Recompute  │
                    │   (if sprint data   │
                    │    changed)         │
                    └─────────────────────┘
```

### 5.4 Conflict Resolution Rules

```typescript
// /lib/sprint/syncConflictResolver.ts

interface SyncEvent {
  entityType: 'sprint' | 'issue';
  entityId: string;
  jiraUpdatedAt: Date;
  payload: unknown;
}

interface StoredEntity {
  jiraUpdatedAt: Date;
  data: unknown;
}

type Resolution = 'APPLY' | 'SKIP' | 'CONFLICT';

export function resolveSync(
  incoming: SyncEvent,
  stored: StoredEntity | null
): Resolution {
  // New entity: always apply
  if (!stored) return 'APPLY';
  
  // Incoming is newer: apply
  if (incoming.jiraUpdatedAt > stored.jiraUpdatedAt) return 'APPLY';
  
  // Incoming is older: skip (we have newer data)
  if (incoming.jiraUpdatedAt < stored.jiraUpdatedAt) return 'SKIP';
  
  // Same timestamp: conflict (log for review)
  return 'CONFLICT';
}
```

### 5.5 Daily Reconciliation Job

```typescript
// /jobs/sprintReconciliation.ts

/**
 * Runs daily at 3 AM UTC
 * Compares Vantage state to Jira source of truth
 * Does NOT auto-correct — flags discrepancies for review
 */
export async function runDailyReconciliation(projectId: string): Promise<ReconciliationReport> {
  const activeSprints = await getActiveSprintsFromJira(projectId);
  const localSprints = await getActiveSprintsFromDb(projectId);
  
  const discrepancies: Discrepancy[] = [];
  
  for (const jiraSprint of activeSprints) {
    const localSprint = localSprints.find(s => s.id === jiraSprint.id);
    
    if (!localSprint) {
      discrepancies.push({
        type: 'MISSING_LOCAL',
        sprintId: jiraSprint.id,
        message: `Sprint ${jiraSprint.name} exists in Jira but not in Vantage`,
      });
      continue;
    }
    
    // Compare issue counts
    const jiraIssues = await getSprintIssuesFromJira(jiraSprint.id);
    const localIssues = await getSprintIssuesFromDb(jiraSprint.id);
    
    const jiraKeys = new Set(jiraIssues.map(i => i.key));
    const localKeys = new Set(localIssues.map(i => i.issueKey));
    
    const missingLocal = [...jiraKeys].filter(k => !localKeys.has(k));
    const extraLocal = [...localKeys].filter(k => !jiraKeys.has(k));
    
    if (missingLocal.length > 0) {
      discrepancies.push({
        type: 'MISSING_ISSUES',
        sprintId: jiraSprint.id,
        issueKeys: missingLocal,
        message: `${missingLocal.length} issues in Jira not in Vantage`,
      });
    }
    
    if (extraLocal.length > 0) {
      discrepancies.push({
        type: 'EXTRA_ISSUES',
        sprintId: jiraSprint.id,
        issueKeys: extraLocal,
        message: `${extraLocal.length} issues in Vantage not in Jira`,
      });
    }
  }
  
  // Log discrepancies, alert if threshold exceeded
  if (discrepancies.length > 0) {
    await logDiscrepancies(projectId, discrepancies);
    
    if (discrepancies.length > ALERT_THRESHOLD) {
      await alertAdmins(projectId, discrepancies);
    }
  }
  
  return { projectId, discrepancies, runAt: new Date() };
}
```

---

## 6. Required UI Behavior/Spec Changes

### 6.1 Staleness Indicator (Revised)

```typescript
// /lib/sprint/staleness.ts

type Staleness = 'LIVE' | 'RECENT' | 'STALE' | 'VERY_STALE';

interface StalenessDisplay {
  level: Staleness;
  label: string;
  color: 'green' | 'amber' | 'red';
  showWarning: boolean;
}

export function getStalenessDisplay(lastUpdated: Date): StalenessDisplay {
  const ageMs = Date.now() - lastUpdated.getTime();
  const ageMinutes = ageMs / (1000 * 60);
  
  if (ageMinutes < 1) {
    return { level: 'LIVE', label: 'Live', color: 'green', showWarning: false };
  }
  
  if (ageMinutes < 10) {
    return { 
      level: 'RECENT', 
      label: `Updated ${Math.floor(ageMinutes)} min ago`, 
      color: 'green', 
      showWarning: false 
    };
  }
  
  if (ageMinutes < 30) {
    return { 
      level: 'STALE', 
      label: `Updated ${Math.floor(ageMinutes)} min ago`, 
      color: 'amber', 
      showWarning: true 
    };
  }
  
  return { 
    level: 'VERY_STALE', 
    label: `⚠️ Data may be stale (${Math.floor(ageMinutes)} min)`, 
    color: 'red', 
    showWarning: true 
  };
}
```

### 6.2 Health Score Display Precision

```typescript
// Never show decimal health scores
// Score of 84.7 displays as "84%"
// Score of 84.5+ rounds to 85%

export function formatHealthScore(score: number): string {
  return `${Math.round(score)}%`;
}

// For component breakdown, show one decimal
export function formatComponentScore(score: number): string {
  return `${score.toFixed(1)}%`;
}
```

### 6.3 Sprint Transition States

```typescript
// /components/sprint/SprintBox.tsx

interface SprintBoxProps {
  projectId: string;
}

export function SprintBox({ projectId }: SprintBoxProps) {
  const { data, isLoading, error } = useSprintData(projectId);
  
  // Loading state
  if (isLoading) {
    return <SprintBoxSkeleton />;
  }
  
  // Error state
  if (error) {
    return <SprintBoxError error={error} onRetry={() => refetch()} />;
  }
  
  // No sprint data at all
  if (!data) {
    return <SprintBoxNoData projectId={projectId} />;
  }
  
  // Active sprint
  if (data.sprint.state === 'ACTIVE') {
    return <SprintBoxActive data={data} />;
  }
  
  // Recently closed (within 24 hours)
  if (data.sprint.state === 'CLOSED' && isWithin24Hours(data.sprint.endDate)) {
    return <SprintBoxRecentlyClosed data={data} />;
  }
  
  // No active sprint, show last sprint summary
  return <SprintBoxNoActive lastSprint={data.sprint} />;
}
```

### 6.4 At-Risk Item Tooltip Content

```typescript
interface AtRiskTooltipProps {
  items: AtRiskSummary[];
}

export function AtRiskTooltip({ items }: AtRiskTooltipProps) {
  if (items.length === 0) return null;
  
  return (
    <TooltipContent>
      <div className="space-y-2 max-w-sm">
        <p className="font-medium">{items.length} items at risk:</p>
        {items.slice(0, 3).map(item => (
          <div key={item.issueKey} className="text-sm">
            <span className={getRiskColor(item.riskLevel)}>●</span>
            <span className="font-mono ml-1">{item.issueKey}</span>
            <span className="text-muted-foreground ml-1">— {item.primaryReason}</span>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-sm text-muted-foreground">
            +{items.length - 3} more
          </p>
        )}
      </div>
    </TooltipContent>
  );
}
```

---

## 7. Edge Case Handling Requirements

### 7.1 Complete Edge Case Matrix

| Edge Case | Detection | Behavior | Test Required |
|-----------|-----------|----------|---------------|
| No active sprint | `state !== 'ACTIVE'` for all sprints | Show last closed sprint summary | ✅ Unit + E2E |
| Multiple active sprints | Count > 1 for board | Show selector, default to most items | ✅ Unit + E2E |
| Sprint past end date, not closed | `endDate < now && state === 'ACTIVE'` | Show with "overdue" warning | ✅ Unit |
| Sprint just closed (<24h) | `state === 'CLOSED' && closedAt > now-24h` | Show with "ended" banner | ✅ Unit |
| Carryover items | `carriedFromSprintId !== null` | Mark with 🔁, count in baseline | ✅ Unit |
| No story points | `totalPoints === null` | Use issue count for all calculations | ✅ Unit |
| All items at risk | `atRiskCount === committedCount` | Health floor at 20%, not 0% | ✅ Unit |
| Negative scope changes | Removed > Added | Show net negative correctly | ✅ Unit |
| Empty baseline | 0 committed items | Health = NO_DATA | ✅ Unit |
| Jira connection lost | Sync failed > 30 min | Show cached data + prominent warning | ✅ E2E |
| Webhook missed | Reconciliation detects discrepancy | Log conflict, don't auto-correct | ✅ Integration |
| Baseline already locked | Duplicate lock attempt | Reject with error message | ✅ API |
| Mid-sprint board reassignment | Board-project link changed | Sprint stays with original project | ✅ Integration |
| Subtasks in sprint | `issueType === 'Sub-task'` | Roll up to parent (configurable) | ✅ Unit |
| Very short sprint (<3 days) | `totalDays < 3` | Simplified progress display | ✅ Unit |
| Very long sprint (>4 weeks) | `totalDays > 28` | Show week number, not day | ✅ Unit |
| Kanban board (no sprints) | Board type = Kanban | Transform to "Current Work" view | ✅ E2E |
| Sprint goal > 500 chars | Jira allows long goals | Truncate with expand | ✅ Unit |
| Unicode in issue summaries | Jira allows emoji | Render correctly | ✅ Visual |
| Timezone edge: sprint spans DST | Start/end in different zones | Use UTC internally, display in user TZ | ✅ Unit |

### 7.2 Required Test Coverage by Edge Case

```typescript
// /lib/sprint/__tests__/edgeCases.test.ts

describe('Sprint Edge Cases', () => {
  describe('No Active Sprint', () => {
    it('returns null sprint with last closed data', async () => {
      // Setup: closed sprint exists, no active
      const result = await getSprintBoxData(projectId);
      expect(result.sprint.state).toBe('CLOSED');
      expect(result.health.status).toBe('NO_DATA'); // Historical, not live
    });
  });

  describe('Sprint Overdue for Close', () => {
    it('shows warning when past end date but still active', async () => {
      // Setup: sprint end date was 2 days ago, state still ACTIVE
      const result = await getSprintBoxData(projectId);
      expect(result.warnings).toContain('OVERDUE_FOR_CLOSE');
    });
  });

  describe('Health Score Floor', () => {
    it('never returns health below 0', () => {
      const result = calculateSprintHealth({
        committedCount: 10,
        doneCount: 0,
        inFlightCount: 0,
        atRiskCount: 10, // 100% at risk
        scopeChangeCount: 20, // 200% scope change
        sprintDay: 14,
        sprintLength: 14,
        committedPoints: null,
        completedPoints: null,
      });
      
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.status).toBe('OFF_TRACK');
    });
  });

  describe('Baseline Immutability', () => {
    it('rejects second baseline lock attempt', async () => {
      // Setup: baseline already exists
      await expect(lockBaseline(sprintId)).rejects.toThrow('Baseline already locked');
    });
  });
});
```

---

## 8. Observability/Audit/Test Requirements

### 8.1 Metrics to Instrument

```typescript
// /lib/sprint/metrics.ts

// Counters
const sprintSyncSuccessTotal = new Counter('sprint_sync_success_total', {
  labels: ['project_id', 'sync_type'], // webhook, poll, reconciliation
});

const sprintSyncFailureTotal = new Counter('sprint_sync_failure_total', {
  labels: ['project_id', 'sync_type', 'error_type'],
});

const sprintScopeChangeTotal = new Counter('sprint_scope_change_total', {
  labels: ['project_id', 'change_type'], // added, removed
});

const sprintHealthCalculationTotal = new Counter('sprint_health_calculation_total', {
  labels: ['project_id', 'health_status'],
});

// Gauges
const sprintHealthScore = new Gauge('sprint_health_score', {
  labels: ['project_id', 'sprint_id'],
});

const sprintSyncLagSeconds = new Gauge('sprint_sync_lag_seconds', {
  labels: ['project_id'],
});

const sprintConflictsPending = new Gauge('sprint_conflicts_pending', {
  labels: ['project_id'],
});

// Histograms
const sprintSyncDurationSeconds = new Histogram('sprint_sync_duration_seconds', {
  labels: ['sync_type'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
});

const sprintBoxRenderDurationMs = new Histogram('sprint_box_render_duration_ms', {
  buckets: [50, 100, 200, 500, 1000],
});
```

### 8.2 Audit Log Events

```typescript
// /lib/audit/sprintAudit.ts

type SprintAuditEvent = 
  | { type: 'BASELINE_LOCKED'; sprintId: string; lockedBy: string; issueCount: number; pointsTotal: number | null }
  | { type: 'SCOPE_CHANGE'; sprintId: string; issueKey: string; changeType: 'ADDED' | 'REMOVED'; changedBy: string }
  | { type: 'HEALTH_STATUS_CHANGE'; sprintId: string; from: string; to: string; score: number }
  | { type: 'SYNC_CONFLICT_DETECTED'; sprintId: string; conflictType: string; details: object }
  | { type: 'SYNC_CONFLICT_RESOLVED'; conflictId: string; resolution: string; resolvedBy: string }
  | { type: 'CONFIG_CHANGED'; projectId: string; field: string; oldValue: unknown; newValue: unknown; changedBy: string };

// All events logged to audit_log table with:
// - event_type, event_data (JSONB), actor_id, actor_type, timestamp, ip_address
```

### 8.3 Alerting Rules

```yaml
# Prometheus alerting rules

groups:
  - name: sprint-box-alerts
    rules:
      - alert: SprintSyncStale
        expr: sprint_sync_lag_seconds > 1800  # 30 min
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Sprint sync is stale for project {{ $labels.project_id }}"
          
      - alert: SprintSyncFailed
        expr: increase(sprint_sync_failure_total[10m]) > 5
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Sprint sync failures increasing for project {{ $labels.project_id }}"
          
      - alert: SprintConflictsAccumulating
        expr: sprint_conflicts_pending > 10
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "Unresolved sprint sync conflicts accumulating"
          
      - alert: SprintBoxSlowRender
        expr: histogram_quantile(0.95, sprint_box_render_duration_ms) > 500
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Sprint box P95 render time exceeding 500ms"
```

### 8.4 Test Matrix

| Test Type | Coverage Target | Tools |
|-----------|-----------------|-------|
| Unit: Health calculation | 100% branch coverage | Jest |
| Unit: Risk detection | All trigger types | Jest |
| Unit: Staleness logic | All thresholds | Jest |
| Integration: Jira sync | Webhook + poll + reconcile | Jest + MSW |
| Integration: Baseline capture | Race conditions | Jest + timing control |
| E2E: Sprint box render | All visual states | Playwright |
| E2E: Drill-down flows | All panels | Playwright |
| Visual regression | Box states, health colors | Chromatic |
| Performance: Render | <500ms P95 | Playwright + metrics |
| Performance: Sync | <60s lag | Load test |
| Chaos: Jira unavailable | Graceful degradation | Chaos toolkit |

---

## 9. Rollout Approach and Risk Controls

### 9.1 Phased Rollout

| Phase | Scope | Duration | Gate Criteria |
|-------|-------|----------|---------------|
| **Alpha** | Internal team only | 1 week | Sync stability >99%, no P0 bugs |
| **Beta** | 5 opt-in customers | 2 weeks | Positive feedback, <5 P1 bugs |
| **GA 10%** | 10% of Jira-connected projects | 1 week | Error rate <0.1%, sync lag <5 min P95 |
| **GA 50%** | 50% of projects | 1 week | No regressions from 10% |
| **GA 100%** | All projects | — | — |

### 9.2 Feature Flag Configuration

```typescript
// Feature flags for gradual rollout
const SPRINT_BOX_FLAGS = {
  // Master toggle
  'sprint-box-enabled': {
    defaultValue: false,
    rules: [
      { condition: 'internal-team', value: true },
      { condition: 'beta-customers', value: true },
      { condition: 'percentage-rollout', percentage: 10, value: true },
    ],
  },
  
  // Sub-feature toggles
  'sprint-box-health-score': {
    defaultValue: false, // Enable after health formula validated
  },
  
  'sprint-box-alerts': {
    defaultValue: false, // Enable in Phase 2
  },
  
  'sprint-box-scope-log': {
    defaultValue: false, // Enable in Phase 2
  },
};
```

### 9.3 Rollback Triggers

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Sync error rate | >5% of syncs fail | Pause rollout, investigate |
| Sync lag | >10 min P95 | Pause rollout, scale workers |
| Client errors | >1% of page loads | Rollback to previous |
| Jira API rate limit | Hit rate limit | Reduce poll frequency |
| Negative user feedback | >3 complaints | Pause, gather feedback |

### 9.4 Monitoring Dashboard

Required dashboard panels:
1. Sync success rate (by type: webhook/poll/reconcile)
2. Sync lag distribution (histogram)
3. Health score distribution across all sprints
4. Scope change rate (per day)
5. Conflict rate and resolution time
6. Sprint box render time (P50, P95, P99)
7. Active sprint count by project
8. Error rate by endpoint

---

## 10. Final Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)

- [ ] **Data Model**
  - [ ] Create Prisma schema for all sprint tables
  - [ ] Run migrations on staging
  - [ ] Add indexes for query patterns
  - [ ] Validate baseline immutability with constraints

- [ ] **Jira Sync Infrastructure**
  - [ ] Implement webhook handler with signature verification
  - [ ] Implement poll worker with rate limiting
  - [ ] Implement conflict resolution logic
  - [ ] Set up Redis queue for event processing
  - [ ] Create daily reconciliation job

- [ ] **Health Calculation**
  - [ ] Implement corrected health formula
  - [ ] Implement hysteresis for status transitions
  - [ ] Add health snapshot capture (daily)
  - [ ] Unit tests: 100% branch coverage

### Phase 2: Core Feature (Weeks 3-4)

- [ ] **API Layer**
  - [ ] Implement all endpoints per spec
  - [ ] Add response caching (5 min TTL)
  - [ ] Add rate limiting on refresh endpoint
  - [ ] Integration tests for all endpoints

- [ ] **Sprint Box Component**
  - [ ] Implement all visual states
  - [ ] Implement staleness indicator
  - [ ] Implement skeleton loading state
  - [ ] Implement error state with retry
  - [ ] Visual regression tests

- [ ] **Drill-Down Panels**
  - [ ] Health breakdown panel
  - [ ] At-risk items panel
  - [ ] Full sprint view panel
  - [ ] Scope change log panel (structure only, detail in Phase 2)

### Phase 3: Edge Cases & Polish (Week 5)

- [ ] **Edge Case Handling**
  - [ ] No active sprint state
  - [ ] Multiple active sprints
  - [ ] Sprint transition states
  - [ ] Jira connection loss
  - [ ] Carryover detection

- [ ] **Observability**
  - [ ] Instrument all metrics
  - [ ] Set up alerting rules
  - [ ] Create monitoring dashboard
  - [ ] Audit logging for key events

### Phase 4: Rollout (Weeks 6-8)

- [ ] **Alpha Testing**
  - [ ] Deploy to internal team
  - [ ] Gather feedback
  - [ ] Fix P0/P1 bugs

- [ ] **Beta Testing**
  - [ ] Recruit 5 beta customers
  - [ ] Monitor sync stability
  - [ ] Iterate on UX based on feedback

- [ ] **GA Rollout**
  - [ ] Enable feature flags progressively
  - [ ] Monitor rollback triggers
  - [ ] Document in user guide

### Done Criteria

This feature is **DONE** when:

1. ✅ All Phase 1-3 checklist items complete
2. ✅ Sync error rate <0.5% over 7 days
3. ✅ Sync lag <5 min P95 over 7 days
4. ✅ Sprint box renders <500ms P95
5. ✅ Health calculation matches expected values in 10 manual audits
6. ✅ 5 beta customers validate feature meets their needs
7. ✅ No P0 bugs, <3 P1 bugs open
8. ✅ Documentation complete (user-facing + internal)
9. ✅ Runbook for incident response complete

---

*Review complete. This feature is well-conceived and should ship. Fix the health formula, tighten the sync architecture, and add the missing edge cases—then execute.*

**— Emmy, Principal Engineer**
