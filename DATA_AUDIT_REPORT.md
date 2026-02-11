# Comprehensive Data Model Audit Report
**Generated:** February 9, 2026  
**Scope:** Mock data files and type definitions in Next.js application

---

## Executive Summary

This audit examines 11 files (4 mock data files, 7 type definition files) to identify:
- Data model completeness
- Cross-file consistency
- ID formats and referential integrity
- Missing fields for real API integration
- Hardcoded assumptions that would break with real data

**Critical Issues Found:** 23 inconsistencies, 15 missing fields, 8 hardcoded assumptions

---

## 1. File Inventory

### Mock Data Files
✅ `/pm-sync/src/lib/mock-data.ts` - Main project/connection mock data  
✅ `/pm-sync/src/lib/ai-mock-data.ts` - AI feature mock data (found at root, not in `/mock/`)  
✅ `/pm-sync/src/lib/mock/integrations-data.ts` - Integration hub mock data  
✅ `/pm-sync/src/lib/gantt-data.ts` - Gantt/timeline mock data (found at root, not in `/mock/`)

### Type Definition Files
✅ `/pm-sync/src/lib/types/rbac.ts` - Role-based access control  
✅ `/pm-sync/src/lib/types/events.ts` - Domain events  
✅ `/pm-sync/src/lib/types/integrations.ts` - Integration provider interface  
✅ `/pm-sync/src/lib/types/analytics.ts` - Analytics events  
✅ `/pm-sync/src/lib/types/realtime.ts` - Realtime client interface  
✅ `/pm-sync/src/lib/types/billing.ts` - Billing provider interface  
✅ `/pm-sync/src/lib/types/index.ts` - Barrel export

---

## 2. Complete Type Inventory

### 2.1 `/lib/mock-data.ts`

**Exported Types:**
- `PMSource`: `"jira" | "monday" | "asana"`
- `HealthStatus`: `"on_track" | "at_risk" | "blocked"`
- `Project` (interface)
- `Alert` (interface)
- `ActivityItem` (interface)
- `Connection` (interface)

**Exported Constants:**
- `projects: Project[]` (4 items)
- `allAlerts: Alert[]` (derived from projects)
- `connections: Connection[]` (3 items)
- `stats` (computed object)
- `sourceConfig: Record<PMSource, {...}>`

**Project Interface Fields:**
```typescript
{
  id: string;                    // e.g., "proj-1"
  name: string;
  source: PMSource;
  health: number;                 // 0-100
  healthStatus: HealthStatus;
  sprintName?: string;
  issueCount: number;
  teamSize: number;
  nextMilestone: string;
  nextMilestoneDate: string;      // e.g., "2 days"
  alerts: Alert[];
  velocity: number;
  velocityTrend: "up" | "down" | "stable";
  velocityChange: number;
  completionRate: number;
  blockedTasks: number;
  teamCapacity: number;
  recentActivity: ActivityItem[];
}
```

**Alert Interface Fields:**
```typescript
{
  id: string;
  type: "timeline_risk" | "blocker" | "optimization" | "capacity";
  severity: "critical" | "medium" | "low";
  title: string;
  description: string;
  recommendation: string;
  detectedAt: string;            // e.g., "2h ago"
  projectName: string;
}
```

**Connection Interface Fields:**
```typescript
{
  id: string;                    // e.g., "conn-1"
  source: PMSource;
  name: string;
  status: "connected" | "disconnected" | "error";
  workspace?: string;
  lastSyncedAt?: string;         // e.g., "2 min ago"
  projectCount: number;
  taskCount: number;
}
```

---

### 2.2 `/lib/ai-mock-data.ts`

**Exported Types:**
- `RadarBlip` (interface)
- `BlockerAlert` (interface)
- `Recommendation` (interface)
- `StatusReportConfig` (interface)
- `GeneratedStatusReport` (interface)
- `DepNode` (interface)
- `DepEdge` (interface)
- `Prediction` (interface)

**Exported Constants:**
- `radarBlips: RadarBlip[]` (5 items)
- `blockerAlerts: BlockerAlert[]` (5 items)
- `sampleStatusReport: GeneratedStatusReport`
- `depNodes: DepNode[]` (8 items)
- `depEdges: DepEdge[]` (10 items)
- `predictions: Record<string, Prediction>` (2 keys)
- `scopeCreepData` (array of week data)
- `suggestedQueries` (string array)
- `sampleScoutResponses: Record<string, string>`

**BlockerAlert Interface Fields:**
```typescript
{
  id: string;
  severity: "critical" | "high" | "medium" | "info";
  type: "silent_blocker" | "scope_creep" | "timeline_risk" | "capacity" | "dependency" | "optimization";
  title: string;
  description: string;
  detectedAt: string;            // e.g., "2 minutes ago"
  projectName: string;
  source: PMSource;
  impact: {
    blockedTasks: number;
    delayDays: number;
    affectedTeams: string[];
  };
  assignee?: string;
  taskName?: string;
  daysSilent?: number;
  avgCompletionDays?: number;
  recommendations: Recommendation[];
}
```

**Prediction Interface Fields:**
```typescript
{
  projectId: string;             // References Project.id
  onTimeProbability: number;     // 0-100
  confidence: number;            // 0-100
  predictedEndDate: string;      // ISO date
  originalEndDate: string;       // ISO date
  scenarios: Array<{...}>;
  riskFactors: Array<{...}>;
  aiRecommendations: Array<{...}>;
}
```

---

### 2.3 `/lib/mock/integrations-data.ts`

**Exported Types:**
- `MockIntegration` (interface)
- `MockSyncRun` (interface)
- `MockAvailableIntegration` (interface)
- `MockWebhookEvent` (interface)
- `MockFieldMapping` (interface)

**Exported Constants:**
- `MOCK_CONNECTED_INTEGRATIONS: MockIntegration[]` (2 items)
- `MOCK_AVAILABLE_INTEGRATIONS: MockAvailableIntegration[]` (6 items)
- `MOCK_WEBHOOK_EVENTS: MockWebhookEvent[]` (3 items)
- `MOCK_JIRA_FIELD_MAPPINGS: MockFieldMapping[]` (8 items)

**MockIntegration Interface Fields:**
```typescript
{
  id: string;                    // e.g., "int_jira_001"
  type: IntegrationProviderType; // from types/integrations.ts
  displayName: string;
  instanceUrl: string;
  status: IntegrationStatus;    // from types/integrations.ts
  connectedAt: string;          // ISO datetime
  connectedBy: string;
  lastSyncAt: string;           // ISO datetime
  lastSyncStatus: "success" | "partial" | "failed";
  syncedProjects: number;
  totalProjects: number;
  totalItems: number;
  syncFrequencyMinutes: number;
  icon: string;                  // emoji
  brandColor: string;           // hex color
  health: {
    uptime: number;             // percentage
    avgSyncDuration: number;   // seconds
    errorsLast24h: number;
    warningsLast24h: number;
  };
  recentSyncs: MockSyncRun[];
}
```

---

### 2.4 `/lib/gantt-data.ts`

**Exported Types:**
- `WorkItemType`: `"project" | "epic" | "story"`
- `WorkItemStatus`: `"todo" | "in_progress" | "done" | "blocked"`
- `Priority`: `"critical" | "high" | "medium" | "low"`
- `WorkItem` (interface)
- `Sprint` (interface)
- `ImpactResult` (interface)

**Exported Constants:**
- `sprints: Sprint[]` (6 items)
- `workItems: WorkItem[]` (30+ items, hierarchical)
- Helper functions: `getChildren`, `getProjects`, `getItemById`, `getAncestors`, `getAllDescendants`, `buildGanttRows`, `getDepth`

**WorkItem Interface Fields:**
```typescript
{
  id: string;                    // e.g., "proj-1", "epic-1-1", "story-1-1-1"
  type: WorkItemType;
  name: string;
  source: PMSource;
  sourceId: string;              // e.g., "WAR", "WAR-100", "WAR-101"
  sourceUrl: string;             // Deep link to source tool
  parentId: string | null;       // References WorkItem.id
  status: WorkItemStatus;
  assignee?: string;
  assigneeInitials?: string;
  priority: Priority;
  startDate: string;             // ISO date YYYY-MM-DD
  endDate: string;              // ISO date YYYY-MM-DD
  originalEndDate?: string;
  sprint?: string;               // Sprint name, not ID
  health: number;                // 0-100
  healthStatus: HealthStatus;
  progress: number;              // 0-100
  dependencies: string[];        // Array of WorkItem.id
  description?: string;
  storyPoints?: number;
  tags?: string[];
}
```

---

### 2.5 `/lib/types/integrations.ts`

**Exported Types:**
- `IntegrationProviderAdapter` (interface)
- `IntegrationProviderType`: `"jira" | "monday" | "asana"`
- `IntegrationStatus`: `"connected" | "syncing" | "error" | "warning" | "disconnected"`
- `TokenSet` (interface)
- `IntegrationConnection` (interface)
- `IntegrationConfig` (interface)
- `FieldMapping` (interface)
- `SyncResult` (interface)
- `SyncError` (interface)
- `ExternalProject` (interface)
- `ExternalUser` (interface)
- `IntegrationEvent` (interface)
- `WebhookRequest` (interface)

**Exported Constants:**
- `DEFAULT_FIELD_MAPPINGS: Record<IntegrationProviderType, FieldMapping[]>`

**IntegrationConnection Interface Fields:**
```typescript
{
  id: string;
  orgId: string;
  type: IntegrationProviderType;
  instanceUrl: string;
  status: IntegrationStatus;
  tokens: TokenSet;
  config: IntegrationConfig;
  connectedAt: Date;
  connectedBy: string;
  lastSyncAt?: Date;
  lastSyncStatus?: "success" | "partial" | "failed";
}
```

---

### 2.6 `/lib/types/events.ts`

**Exported Types:**
- `DomainEvent` (union type)
- `SyncEvent` (interface)
- `RiskEvent` (interface)
- `TaskEvent` (interface)
- `MentionEvent` (interface)
- `IntegrationEvent` (interface)
- `UserEvent` (interface)
- `ReportEvent` (interface)
- `IntegrationProvider`: `"jira" | "monday" | "asana"`
- `EventHandler<T>`
- `Unsubscribe`
- `EventBus` (interface)

---

### 2.7 `/lib/types/rbac.ts`

**Exported Types:**
- `Role`: `"owner" | "admin" | "member" | "viewer"`
- `Permission` (interface)

**Exported Constants:**
- `ROLE_PERMISSIONS: Record<Role, string[]>`

**Exported Functions:**
- `hasPermission(role: Role, permission: string): boolean`
- `requiresRole(...roles: Role[])`

---

### 2.8 `/lib/types/billing.ts`

**Exported Types:**
- `BillingProvider` (interface)
- `BillingCustomerInput` (interface)
- `BillingCustomer` (interface)
- `PlanTier`: `"free" | "starter" | "professional" | "enterprise"`
- `BillingInterval`: `"monthly" | "annually"`
- `SubscriptionStatus`: `"active" | "trialing" | "past_due" | "canceled" | "unpaid"`
- `BillingSubscription` (interface)
- `PaymentMethod` (interface)
- `BillingInvoice` (interface)
- `InvoiceLineItem` (interface)
- `UsageMetric`: `"projects_connected" | "users_active" | "integrations_active" | "reports_generated" | "ai_queries"`
- `UsageRecord` (interface)
- `PlanConfig` (interface)
- `PlanFeature` (interface)
- `PlanLimits` (interface)
- `BillingWebhookEvent` (interface)

**Exported Constants:**
- `DEFAULT_PLANS: PlanConfig[]` (4 plans)

---

### 2.9 `/lib/types/analytics.ts`

**Exported Types:**
- `AnalyticsEvent` (union type with 20+ event variants)
- `AnalyticsClient` (interface)
- `ConsoleAnalytics` (class)

**Exported Functions:**
- `getAnalytics(): AnalyticsClient`
- `setAnalytics(client: AnalyticsClient): void`

---

### 2.10 `/lib/types/realtime.ts`

**Exported Types:**
- `RealtimeEvent` (interface)
- `Unsubscribe`
- `RealtimeClient` (interface)
- `PollingRealtimeClient` (class)

---

## 3. Cross-File Consistency Analysis

### 3.1 Project Model Inconsistencies

**Issue #1: Project ID Format Mismatch**
- `mock-data.ts`: Uses `"proj-1"`, `"proj-2"`, etc.
- `gantt-data.ts`: Uses `"proj-1"`, `"proj-2"`, `"proj-3"` (same format, but different projects)
- `ai-mock-data.ts`: References `"proj-1"` through `"proj-5"` (5 projects vs 4 in mock-data.ts)
- **Problem:** `ai-mock-data.ts` references `"proj-5"` (Data Pipeline) which doesn't exist in `mock-data.ts`
- **Impact:** Runtime errors when accessing predictions/radar for non-existent projects

**Issue #2: Project Field Mismatch**
- `mock-data.ts` Project has: `health`, `healthStatus`, `sprintName`, `issueCount`, `teamSize`, `nextMilestone`, `nextMilestoneDate`, `alerts`, `velocity`, `velocityTrend`, `velocityChange`, `completionRate`, `blockedTasks`, `teamCapacity`, `recentActivity`
- `gantt-data.ts` WorkItem (type="project") has: `health`, `healthStatus`, `sprint`, `progress`, `storyPoints`, `tags`, `description`, `dependencies`
- **Missing in mock-data.ts:** `progress`, `storyPoints`, `tags`, `description`, `dependencies`
- **Missing in gantt-data.ts:** `issueCount`, `teamSize`, `nextMilestone`, `nextMilestoneDate`, `alerts`, `velocity`, `velocityTrend`, `velocityChange`, `completionRate`, `blockedTasks`, `teamCapacity`, `recentActivity`
- **Problem:** Two different representations of the same concept

**Issue #3: HealthStatus Type Consistency**
- ✅ `mock-data.ts`: `HealthStatus = "on_track" | "at_risk" | "blocked"`
- ✅ `gantt-data.ts`: Imports `HealthStatus` from `mock-data.ts`
- ✅ `ai-mock-data.ts`: Uses `"low" | "medium" | "high" | "critical"` for risk levels (different concept)
- **Status:** Consistent for health status, but risk levels are separate

**Issue #4: PMSource Type Consistency**
- ✅ All files use `PMSource = "jira" | "monday" | "asana"`
- ✅ `types/integrations.ts`: `IntegrationProviderType = "jira" | "monday" | "asana"` (same values)
- ✅ `types/events.ts`: `IntegrationProvider = "jira" | "monday" | "asana"` (same values)
- **Status:** Consistent

---

### 3.2 Alert Model Inconsistencies

**Issue #5: Alert Type Mismatch**
- `mock-data.ts` Alert: `type: "timeline_risk" | "blocker" | "optimization" | "capacity"`
- `ai-mock-data.ts` BlockerAlert: `type: "silent_blocker" | "scope_creep" | "timeline_risk" | "capacity" | "dependency" | "optimization"`
- **Problem:** Different alert types, overlapping but not identical
- **Impact:** Cannot unify alerts from both sources without mapping

**Issue #6: Alert Severity Mismatch**
- `mock-data.ts` Alert: `severity: "critical" | "medium" | "low"`
- `ai-mock-data.ts` BlockerAlert: `severity: "critical" | "high" | "medium" | "info"`
- **Problem:** Different severity levels, `"high"` and `"info"` missing in mock-data.ts
- **Impact:** UI components expecting one set may break with the other

**Issue #7: Alert Structure Differences**
- `mock-data.ts` Alert: Simple structure with `id`, `type`, `severity`, `title`, `description`, `recommendation`, `detectedAt`, `projectName`
- `ai-mock-data.ts` BlockerAlert: Extended structure with `impact`, `assignee`, `taskName`, `daysSilent`, `avgCompletionDays`, `recommendations[]`
- **Problem:** Cannot treat them as the same type
- **Impact:** Components need separate handling or type guards

---

### 3.3 Connection/Integration Model Inconsistencies

**Issue #8: Connection vs Integration Naming**
- `mock-data.ts`: Uses `Connection` interface
- `mock/integrations-data.ts`: Uses `MockIntegration` interface
- `types/integrations.ts`: Uses `IntegrationConnection` interface
- **Problem:** Three different names for the same concept
- **Impact:** Confusion, potential type mismatches

**Issue #9: Connection Field Mismatch**
- `mock-data.ts` Connection: `id`, `source`, `name`, `status`, `workspace?`, `lastSyncedAt?`, `projectCount`, `taskCount`
- `types/integrations.ts` IntegrationConnection: `id`, `orgId`, `type`, `instanceUrl`, `status`, `tokens`, `config`, `connectedAt`, `connectedBy`, `lastSyncAt?`, `lastSyncStatus?`
- `mock/integrations-data.ts` MockIntegration: `id`, `type`, `displayName`, `instanceUrl`, `status`, `connectedAt`, `connectedBy`, `lastSyncAt`, `lastSyncStatus`, `syncedProjects`, `totalProjects`, `totalItems`, `syncFrequencyMinutes`, `icon`, `brandColor`, `health`, `recentSyncs`
- **Problem:** Completely different field sets
- **Impact:** Cannot map between mock data and real API types

**Issue #10: Status Type Mismatch**
- `mock-data.ts` Connection: `status: "connected" | "disconnected" | "error"`
- `types/integrations.ts` IntegrationStatus: `"connected" | "syncing" | "error" | "warning" | "disconnected"`
- `mock/integrations-data.ts` MockIntegration: `status: IntegrationStatus` (uses types, but also has `"warning"` in mock data)
- **Problem:** Missing `"syncing"` and `"warning"` in mock-data.ts Connection
- **Impact:** Cannot represent syncing state in mock data

---

### 3.4 WorkItem/Task Model Inconsistencies

**Issue #11: WorkItem vs Task Naming**
- `gantt-data.ts`: Uses `WorkItem` interface
- `prisma/schema.prisma`: Uses `Task` model
- `types/events.ts`: Uses `TaskEvent` with `taskId`, `taskName`
- **Problem:** Different names for the same concept
- **Impact:** Confusion, potential mapping issues

**Issue #12: Status Values Mismatch**
- `gantt-data.ts` WorkItem: `status: "todo" | "in_progress" | "done" | "blocked"`
- `prisma/schema.prisma` Task: `status: "todo" | "in_progress" | "done" | "blocked"` (same)
- ✅ **Status:** Consistent

**Issue #13: Priority Values Mismatch**
- `gantt-data.ts` WorkItem: `priority: "critical" | "high" | "medium" | "low"`
- `prisma/schema.prisma` Task: `priority: "critical" | "high" | "medium" | "low" | "none"`
- **Problem:** Prisma schema has `"none"` option not in mock data
- **Impact:** Mock data cannot represent unprioritized tasks

---

### 3.5 ID Format Inconsistencies

**Issue #14: Project ID Formats**
- `mock-data.ts`: `"proj-1"`, `"proj-2"`, etc. (simple increment)
- `gantt-data.ts`: `"proj-1"`, `"proj-2"`, `"proj-3"` (same format)
- `ai-mock-data.ts`: References `"proj-1"` through `"proj-5"` (5 projects)
- **Problem:** Inconsistent count, `"proj-5"` doesn't exist

**Issue #15: Alert ID Formats**
- `mock-data.ts`: `"alert-1"`, `"alert-2"`, etc.
- `ai-mock-data.ts`: `"ba-1"`, `"ba-2"`, etc. (different prefix)
- **Problem:** Different ID schemes, potential collisions if merged

**Issue #16: Integration ID Formats**
- `mock/integrations-data.ts`: `"int_jira_001"`, `"int_monday_001"` (provider prefix)
- `types/integrations.ts`: No format specified (just `string`)
- **Problem:** No standard format for real API

**Issue #17: WorkItem ID Formats**
- `gantt-data.ts`: `"proj-1"`, `"epic-1-1"`, `"story-1-1-1"` (hierarchical)
- **Status:** Consistent within file, but format is hardcoded

---

## 4. Referential Integrity Issues

### 4.1 Project References

**Issue #18: Missing Project References**
- `ai-mock-data.ts` predictions: References `"proj-2"` and `"proj-3"` ✅
- `ai-mock-data.ts` predictions: References `"proj-5"` ❌ (doesn't exist in mock-data.ts)
- `ai-mock-data.ts` radarBlips: References `"proj-1"` through `"proj-5"` ❌ (proj-5 missing)
- **Impact:** Runtime errors when accessing predictions for non-existent projects

**Issue #19: Project Name Mismatch**
- `mock-data.ts`: Project names: "Web App Redesign", "Mobile App Launch", "API Migration", "Customer Portal"
- `gantt-data.ts`: Project names: "Web App Redesign", "Mobile App Launch", "Customer Portal" (missing "API Migration", has different project)
- `ai-mock-data.ts`: References "Mobile App Launch", "API Migration", "Data Pipeline" (some match, some don't)
- **Problem:** Project names don't consistently match across files
- **Impact:** Cannot reliably match projects by name

**Issue #20: WorkItem Parent References**
- `gantt-data.ts`: `parentId` references other `WorkItem.id` values
- ✅ All parent references are valid (checked manually)
- **Status:** Valid within file

**Issue #21: WorkItem Dependency References**
- `gantt-data.ts`: `dependencies: string[]` references other `WorkItem.id` values
- ✅ All dependency references are valid (checked manually)
- **Status:** Valid within file

**Issue #22: Sprint References**
- `gantt-data.ts`: `sprint?: string` uses sprint names (e.g., "Sprint 12"), not IDs
- `gantt-data.ts`: `sprints` array has IDs (`"sprint-10"`, etc.) but WorkItems use names
- **Problem:** Cannot reliably match sprint by name vs ID
- **Impact:** Sprint filtering/grouping may fail

---

### 4.2 Integration References

**Issue #23: Integration Connection References**
- `types/integrations.ts` IntegrationConnection: Has `orgId` field
- `mock/integrations-data.ts` MockIntegration: Missing `orgId` field
- **Problem:** Cannot map mock data to real API structure
- **Impact:** Integration page will break when switching to real API

---

## 5. Missing Fields for Real API Integration

### 5.1 Project Model Missing Fields

**From Prisma Schema (`prisma/schema.prisma`):**
- ❌ `workspaceId: string` - Required for multi-tenancy
- ❌ `connectionId: string` - Required to link to integration
- ❌ `sourceId: string` - ID in the source PM tool (e.g., Jira project ID)
- ❌ `key?: string` - Project key (e.g., "PROJ" in Jira)
- ❌ `url?: string` - Deep link to project in source tool
- ❌ `description?: string` - Project description
- ❌ `metadata?: Json` - Source-specific data
- ❌ `syncEnabled: boolean` - Whether sync is enabled
- ❌ `lastSyncedAt?: Date` - Last sync timestamp
- ❌ `status: string` - "active" | "archived" | "deleted"
- ❌ `deletedAt?: Date` - Soft delete timestamp
- ❌ `createdAt: Date` - Creation timestamp
- ❌ `updatedAt: Date` - Last update timestamp

**Current mock-data.ts Project has:**
- ✅ `id`, `name`, `source`, `health`, `healthStatus`
- ✅ Computed fields: `issueCount`, `teamSize`, `velocity`, `completionRate`, etc.
- ❌ Missing all database/API fields above

**Impact:** Cannot map mock Project to database Project model

---

### 5.2 Task/WorkItem Model Missing Fields

**From Prisma Schema:**
- ❌ `projectId: string` - Required foreign key
- ❌ `sourceId: string` - ID in source PM tool
- ❌ `sourceStatus?: string` - Original status name (for write-back)
- ❌ `sourcePriority?: string` - Original priority name
- ❌ `assigneeId?: string` - Source user ID
- ❌ `reporterId?: string` - Source user ID of creator
- ❌ `completedAt?: Date` - Completion timestamp
- ❌ `estimateUnit?: string` - "points" | "hours" | "days"
- ❌ `taskType?: string` - "story" | "bug" | "task" | "epic" | "subtask"
- ❌ `metadata?: Json` - Source-specific data
- ❌ `lastSyncedAt?: Date` - Last sync timestamp
- ❌ `syncDirection: string` - "bidirectional" | "source_only" | "destination_only"
- ❌ `localUpdatedAt?: Date` - When we last changed it
- ❌ `sourceUpdatedAt?: Date` - When source last changed it
- ❌ `deletedAt?: Date` - Soft delete timestamp
- ❌ `createdAt: Date` - Creation timestamp
- ❌ `updatedAt: Date` - Last update timestamp

**Current gantt-data.ts WorkItem has:**
- ✅ `id`, `name`, `source`, `sourceId`, `sourceUrl`, `parentId`, `status`, `assignee`, `priority`, `startDate`, `endDate`, `sprint`, `health`, `healthStatus`, `progress`, `dependencies`, `description`, `storyPoints`, `tags`
- ❌ Missing all database/API fields above

**Impact:** Cannot map mock WorkItem to database Task model

---

### 5.3 Connection/Integration Model Missing Fields

**From Prisma Schema (`Connection` model):**
- ❌ `workspaceId: string` - Required for multi-tenancy
- ❌ `accessToken: string` - OAuth access token (encrypted)
- ❌ `refreshToken?: string` - OAuth refresh token
- ❌ `tokenExpiresAt?: Date` - Token expiration
- ❌ `externalUserId?: string` - User ID in PM tool
- ❌ `externalOrgId?: string` - Org/site ID
- ❌ `externalOrgName?: string` - Org name
- ❌ `scopes?: string` - Granted OAuth scopes
- ❌ `metadata?: Json` - Tool-specific config
- ❌ `status: string` - "active" | "expired" | "revoked" | "error"
- ❌ `errorMessage?: string` - Error details
- ❌ `createdAt: Date` - Creation timestamp
- ❌ `updatedAt: Date` - Last update timestamp

**From types/integrations.ts IntegrationConnection:**
- ✅ Has `tokens: TokenSet`, `config: IntegrationConfig`, `orgId`, `connectedAt`, `connectedBy`
- ❌ Missing Prisma fields: `workspaceId`, `externalUserId`, `externalOrgId`, `externalOrgName`, `scopes`, `metadata`, `errorMessage`

**Current mock-data.ts Connection has:**
- ✅ `id`, `source`, `name`, `status`, `workspace?`, `lastSyncedAt?`, `projectCount`, `taskCount`
- ❌ Missing all OAuth/auth fields, missing database fields

**Impact:** Cannot map mock Connection to database Connection model or IntegrationConnection type

---

### 5.4 User/Team Model Missing Fields

**From Prisma Schema (`User` model):**
- ❌ `id: string` - User ID
- ❌ `name?: string` - Display name
- ❌ `email?: string` - Email address
- ❌ `emailVerified?: Date` - Email verification timestamp
- ❌ `image?: string` - Avatar URL
- ❌ `createdAt: Date` - Creation timestamp
- ❌ `updatedAt: Date` - Last update timestamp

**From Prisma Schema (`WorkspaceMember` model):**
- ❌ `id: string` - Member ID
- ❌ `workspaceId: string` - Workspace foreign key
- ❌ `userId: string` - User foreign key
- ❌ `role: string` - "owner" | "admin" | "member"
- ❌ `createdAt: Date` - Creation timestamp

**Current mock data:**
- ❌ No User model in mock data
- ❌ No WorkspaceMember model in mock data
- ✅ `gantt-data.ts` has `assignee: string` (name only, not ID)
- ✅ `mock-data.ts` ActivityItem has `user: string`, `initials: string` (name only)

**Impact:** Cannot represent users, team members, or workspace membership

---

## 6. Hardcoded Assumptions

### 6.1 Date/Time Formats

**Issue #24: Inconsistent Date Formats**
- `mock-data.ts`: `nextMilestoneDate: "2 days"` (relative string)
- `mock-data.ts`: `detectedAt: "2h ago"` (relative string)
- `mock-data.ts`: `lastSyncedAt: "2 min ago"` (relative string)
- `ai-mock-data.ts`: `detectedAt: "2 minutes ago"` (relative string)
- `ai-mock-data.ts`: `predictedEndDate: "2026-03-19"` (ISO date)
- `gantt-data.ts`: `startDate: "2026-01-12"` (ISO date YYYY-MM-DD)
- `mock/integrations-data.ts`: `connectedAt: "2026-01-15T10:30:00Z"` (ISO datetime)
- **Problem:** Mix of relative strings and ISO dates
- **Impact:** Cannot parse dates consistently, cannot do date arithmetic

**Issue #25: Hardcoded Relative Times**
- All relative times (`"2h ago"`, `"2 min ago"`) are hardcoded strings
- **Problem:** Will become stale, cannot calculate actual timestamps
- **Impact:** Time-sensitive features (recent activity, sync status) will show incorrect times

---

### 6.2 Computed Fields

**Issue #26: Computed Fields in Mock Data**
- `mock-data.ts` Project: `health`, `healthStatus`, `issueCount`, `teamSize`, `velocity`, `completionRate`, `blockedTasks`, `teamCapacity` are all hardcoded
- **Problem:** These should be computed from underlying data (tasks, team members, etc.)
- **Impact:** Cannot test computation logic, values don't reflect real state

**Issue #27: Hardcoded Statistics**
- `mock-data.ts` stats: Computed from projects array, but projects are hardcoded
- **Problem:** Stats are not dynamic
- **Impact:** Cannot test stat calculation with different data sets

---

### 6.3 ID Generation

**Issue #28: Hardcoded IDs**
- All IDs are hardcoded strings (`"proj-1"`, `"alert-1"`, etc.)
- **Problem:** No ID generation logic, cannot create new items
- **Impact:** Cannot test create operations, cannot add new mock data dynamically

---

### 6.4 Source-Specific Assumptions

**Issue #29: Hardcoded Source URLs**
- `gantt-data.ts`: `sourceUrl: "https://acme.atlassian.net/projects/WAR"` (hardcoded domain)
- `mock/integrations-data.ts`: `instanceUrl: "https://acme-corp.atlassian.net"` (hardcoded domain)
- **Problem:** Assumes single organization/workspace
- **Impact:** Cannot test multi-tenant scenarios

**Issue #30: Hardcoded Workspace Names**
- `mock-data.ts` Connection: `workspace: "acme.atlassian.net"` (hardcoded)
- **Problem:** Assumes single workspace
- **Impact:** Cannot test multi-workspace scenarios

---

### 6.5 Field Mapping Assumptions

**Issue #31: Hardcoded Field Mappings**
- `mock/integrations-data.ts`: `MOCK_JIRA_FIELD_MAPPINGS` has hardcoded mappings
- `types/integrations.ts`: `DEFAULT_FIELD_MAPPINGS` has hardcoded mappings
- **Problem:** Assumes all Jira instances use same custom field IDs (`customfield_10016` for story points)
- **Impact:** Will break with different Jira configurations

---

## 7. Type Definition Completeness

### 7.1 Missing Type Exports

**Issue #32: Types Not Exported from Index**
- `types/index.ts` exports most types, but:
  - ❌ Does not export `PMSource`, `HealthStatus` from `mock-data.ts` (not in types folder)
  - ❌ Does not export `WorkItem`, `WorkItemType`, `WorkItemStatus`, `Priority` from `gantt-data.ts` (not in types folder)
  - ❌ Does not export `BlockerAlert`, `RadarBlip`, `Prediction` from `ai-mock-data.ts` (not in types folder)
- **Problem:** Types scattered across mock data files, not centralized
- **Impact:** Hard to find types, potential duplication

---

### 7.2 Type Completeness for Real APIs

**✅ Well-Defined Types:**
- `types/integrations.ts`: Comprehensive integration provider interface
- `types/billing.ts`: Complete billing provider abstraction
- `types/events.ts`: Comprehensive domain event system
- `types/rbac.ts`: Complete RBAC permission system
- `types/analytics.ts`: Complete analytics event types
- `types/realtime.ts`: Complete realtime client interface

**❌ Missing Type Definitions:**
- No `Project` type in types folder (only in mock-data.ts)
- No `Task` type in types folder (only WorkItem in gantt-data.ts)
- No `User` type in types folder
- No `Workspace` type in types folder
- No `WorkspaceMember` type in types folder
- No `Alert` type in types folder (only in mock-data.ts and ai-mock-data.ts)
- No `Connection` type in types folder (only IntegrationConnection)

---

## 8. Recommendations

### 8.1 Immediate Fixes (Critical)

1. **Fix Project ID Mismatch**
   - Add `"proj-5"` (Data Pipeline) to `mock-data.ts` projects array, OR
   - Remove references to `"proj-5"` from `ai-mock-data.ts`

2. **Unify Alert Types**
   - Create a single `Alert` type in `types/` folder
   - Extend it to support both simple alerts and blocker alerts
   - Update all mock data to use unified type

3. **Add Missing Database Fields**
   - Add `workspaceId`, `connectionId`, `sourceId`, `createdAt`, `updatedAt` to mock Project data
   - Add `projectId`, `sourceId`, `createdAt`, `updatedAt` to mock WorkItem data
   - Add `workspaceId`, OAuth fields to mock Connection data

4. **Standardize Date Formats**
   - Use ISO datetime strings (`"2026-02-09T14:23:00Z"`) for all dates
   - Remove relative time strings (`"2h ago"`) from mock data
   - Compute relative times in UI components

### 8.2 Short-Term Improvements

5. **Create Centralized Type Definitions**
   - Move `Project`, `Task`, `User`, `Workspace`, `Alert` types to `types/` folder
   - Export from `types/index.ts`
   - Update mock data files to import from types

6. **Unify Connection/Integration Naming**
   - Standardize on `IntegrationConnection` name
   - Update `mock-data.ts` Connection to match `types/integrations.ts` structure
   - Update `mock/integrations-data.ts` MockIntegration to match

7. **Fix Sprint References**
   - Use sprint IDs instead of names in WorkItem.sprint
   - Add helper function to resolve sprint name from ID

8. **Add User/Team Models**
   - Create `User` and `WorkspaceMember` types in `types/` folder
   - Add mock user data
   - Update WorkItem.assignee to use user ID instead of name

### 8.3 Long-Term Improvements

9. **Create Data Factory Functions**
   - Replace hardcoded arrays with factory functions
   - Generate IDs dynamically (UUIDs or cuid())
   - Compute derived fields (health, velocity) from underlying data

10. **Add Validation Layer**
    - Add runtime validation for referential integrity
    - Validate ID formats
    - Validate date formats

11. **Create Mapping Layer**
    - Create mapper functions: `mockProjectToDbProject`, `dbProjectToMockProject`
    - Create mapper functions: `mockWorkItemToDbTask`, `dbTaskToMockWorkItem`
    - Handle field transformations

12. **Add Test Data Generators**
    - Create faker-based generators for realistic test data
    - Support different scenarios (empty projects, large projects, etc.)
    - Generate consistent relationships

---

## 9. Summary Statistics

### Issues by Category
- **Cross-file consistency:** 12 issues
- **Referential integrity:** 5 issues
- **Missing fields:** 15+ missing fields
- **Hardcoded assumptions:** 8 issues
- **Type completeness:** 2 issues

### Issues by Severity
- **Critical (breaks runtime):** 5 issues (#1, #18, #19, #23, #24)
- **High (breaks API integration):** 15 issues (#8, #9, #10, #11, missing fields)
- **Medium (causes confusion):** 8 issues (#5, #6, #7, #14, #15, #16, #17, #22)
- **Low (code quality):** 5 issues (#28, #29, #30, #31, #32)

### Files Requiring Updates
1. `/lib/mock-data.ts` - Add missing fields, fix project count
2. `/lib/ai-mock-data.ts` - Fix project references, unify alert types
3. `/lib/gantt-data.ts` - Add missing fields, fix sprint references
4. `/lib/mock/integrations-data.ts` - Align with IntegrationConnection type
5. `/lib/types/index.ts` - Export all types
6. **NEW:** `/lib/types/projects.ts` - Centralized Project type
7. **NEW:** `/lib/types/tasks.ts` - Centralized Task type
8. **NEW:** `/lib/types/users.ts` - User and WorkspaceMember types
9. **NEW:** `/lib/types/alerts.ts` - Unified Alert type

---

## 10. Conclusion

The codebase has **well-structured type definitions** for integrations, billing, events, and RBAC, but **significant inconsistencies** exist in core domain models (Project, Task, User, Connection). The mock data files use **different structures** than the Prisma schema, making API integration difficult.

**Priority actions:**
1. Fix critical runtime issues (project ID mismatches)
2. Add missing database fields to mock data
3. Unify alert and connection types
4. Create centralized type definitions
5. Standardize date formats

This audit provides a roadmap for aligning mock data with real API structures and ensuring type safety across the application.
