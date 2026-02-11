# Screen Spec: Integrations Hub
## /integrations

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The Integrations Hub is the central management interface for all tool connections. It handles connecting, configuring, monitoring, and troubleshooting integrations with Jira, Monday.com, Asana, Confluence, Slack, and Calendar services.

**Core Value:** Vantage's power comes from aggregating data across tools. The Integrations Hub makes it easy to connect tools, understand sync status, and troubleshoot issues without leaving Vantage.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| I-1 | Admin | Connect new tools to Vantage | We can start syncing data |
| I-2 | Admin | See sync status for all integrations | I know if data is current |
| I-3 | Admin | Configure which projects sync | We only import relevant data |
| I-4 | Admin | Troubleshoot sync failures | I can resolve issues quickly |
| I-5 | PM | See when data was last synced | I know if I'm seeing current info |
| I-6 | Admin | Disconnect an integration | We can remove a tool we no longer use |
| I-7 | Admin | Manage OAuth permissions | I can control what Vantage accesses |
| I-8 | PM | Manually trigger a sync | I can get fresh data immediately |

---

## 3. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Integrations                                    [+ Add Tool]    │ │
│         │  │ 3 connected, 1 needs attention                                   │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [Connected] [Available] [Sync Log]                              │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │  CONNECTED TAB                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ ┌───┐                                                           │ │
│         │  │ │ J │  Jira                                    ✓ Connected      │ │
│         │  │ └───┘  company.atlassian.net                                    │ │
│         │  │                                                                  │ │
│         │  │        Last sync: 5 minutes ago · 12 projects synced            │ │
│         │  │        ████████████████████████████████ 100%                    │ │
│         │  │                                                                  │ │
│         │  │        [Configure]  [Sync Now]  [View Log]  [•••]               │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ ┌───┐                                                           │ │
│         │  │ │ M │  Monday.com                              ✓ Connected      │ │
│         │  │ └───┘  company.monday.com                                       │ │
│         │  │                                                                  │ │
│         │  │        Last sync: 12 minutes ago · 4 boards synced              │ │
│         │  │        ████████████████████████████████ 100%                    │ │
│         │  │                                                                  │ │
│         │  │        [Configure]  [Sync Now]  [View Log]  [•••]               │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ ┌───┐                                                           │ │
│         │  │ │ A │  Asana                                   ⚠️ Sync Issue    │ │
│         │  │ └───┘  company.asana.com                                        │ │
│         │  │                                                                  │ │
│         │  │        ⚠️ Sync failed 2 hours ago · Rate limit exceeded        │ │
│         │  │        ████████████████░░░░░░░░░░░░░░░░  48%                    │ │
│         │  │                                                                  │ │
│         │  │        [Retry Sync]  [View Error]  [•••]                        │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab Structure

### Tab 1: Connected
Active integrations with status and management options.

### Tab 2: Available
Catalog of available integrations to add. V1: Jira only as "Available." Monday (V1.1), Asana (V1.2) shown as "Coming Soon." Others shown as "Request" with vote mechanism.

### Tab 3: Sync Log
Historical log of all sync events across integrations.

---

## 5. Component Breakdown

### 5.1 Page Header

```tsx
<PageHeader
  title="Integrations"
  subtitle="3 connected, 1 needs attention"
  actions={
    <Button variant="primary" icon={<Plus />} onClick={openAddToolModal}>
      Add Tool
    </Button>
  }
/>
```

**Subtitle Logic:**
- Count connected integrations
- If any have issues: "{count} connected, {issues} need attention"
- If all healthy: "{count} connected, all syncing normally"

### 5.2 Integration Card (Connected)

**Structure:**
```
┌────────────────────────────────────────────────────────────────┐
│ [Logo 48px]  Integration Name                    [Status Badge]│
│              instance-url.com                                  │
│                                                                │
│ [Sync status line with timestamp and stats]                    │
│ [Progress bar - if sync in progress]                           │
│                                                                │
│ [Configure] [Sync Now] [View Log] [•••]                        │
└────────────────────────────────────────────────────────────────┘
```

**Component Props:**
```tsx
interface IntegrationCardProps {
  id: string;
  type: 'jira' | 'monday' | 'asana' | 'confluence' | 'slack' | 'calendar';
  name: string;
  instanceUrl: string;
  status: 'connected' | 'syncing' | 'error' | 'warning' | 'disconnected';
  lastSync?: {
    timestamp: Date;
    status: 'success' | 'partial' | 'failed';
    itemsSynced?: number;
    projectsSynced?: number;
  };
  syncProgress?: number;  // 0-100, only when syncing
  error?: {
    message: string;
    code: string;
    retryable: boolean;
  };
  onConfigure: () => void;
  onSync: () => void;
  onViewLog: () => void;
  onDisconnect: () => void;
}
```

**Status Badge Colors:**

| Status | Badge Style |
|--------|-------------|
| Connected | `bg-success-100 text-success-700` with checkmark |
| Syncing | `bg-primary-100 text-primary-700` with spinner |
| Error | `bg-danger-100 text-danger-700` with X |
| Warning | `bg-warning-100 text-warning-700` with alert |
| Disconnected | `bg-neutral-100 text-neutral-500` |

**Integration Logos/Colors:**

| Integration | Logo Background | Primary Color |
|-------------|-----------------|---------------|
| Jira | `#0052CC` | Blue |
| Monday.com | `#FF3D57` | Red |
| Asana | `#F06A6A` | Salmon |
| Confluence | `#1868DB` | Blue |
| Slack | `#4A154B` | Purple |
| Google Calendar | `#4285F4` | Blue |
| Outlook Calendar | `#0078D4` | Blue |

### 5.3 Sync Progress Bar

```tsx
<div className="mt-3">
  <div className="flex justify-between text-sm text-neutral-500 mb-1">
    <span>Syncing...</span>
    <span>{progress}%</span>
  </div>
  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
    <div
      className="h-full bg-primary-500 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
```

### 5.4 More Actions Menu (•••)

Dropdown with:
- **Re-authenticate:** Re-run OAuth flow
- **View permissions:** Show granted OAuth scopes
- **Disconnect:** Remove integration (with confirmation)

---

## 6. Available Integrations Tab

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ PROJECT MANAGEMENT                                              │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│ │     [Jira]      │ │   [Monday]      │ │    [Asana]      │    │
│ │                 │ │                 │ │                 │    │
│ │  Jira Software  │ │   Monday.com    │ │     Asana       │    │
│ │                 │ │                 │ │                 │    │
│ │   [Connected]   │ │   [Connected]   │ │    [Connect]    │    │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ DOCUMENTATION                                                   │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐                        │
│ │  [Confluence]   │ │   [Notion]      │                        │
│ │                 │ │                 │                        │
│ │   Confluence    │ │     Notion      │                        │
│ │                 │ │                 │                        │
│ │    [Connect]    │ │  [Coming Soon]  │                        │
│ └─────────────────┘ └─────────────────┘                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ COMMUNICATION                                                   │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐                        │
│ │    [Slack]      │ │    [Teams]      │                        │
│ │                 │ │                 │                        │
│ │     Slack       │ │  MS Teams       │                        │
│ │                 │ │                 │                        │
│ │    [Connect]    │ │  [Coming Soon]  │                        │
│ └─────────────────┘ └─────────────────┘                        │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ CALENDAR                                                        │
│                                                                 │
│ ┌─────────────────┐ ┌─────────────────┐                        │
│ │ [Google Cal]    │ │   [Outlook]     │                        │
│ │                 │ │                 │                        │
│ │ Google Calendar │ │ Outlook Calendar│                        │
│ │                 │ │                 │                        │
│ │    [Connect]    │ │    [Connect]    │                        │
│ └─────────────────┘ └─────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Available Integration Card

```tsx
<div className="bg-white rounded-xl border border-neutral-100 p-6 text-center hover:shadow-md transition-shadow">
  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-[integration-color] flex items-center justify-center">
    <IntegrationLogo className="w-8 h-8 text-white" />
  </div>
  <h3 className="text-base font-semibold text-neutral-900 mb-1">{name}</h3>
  <p className="text-sm text-neutral-500 mb-4">{description}</p>
  {isConnected ? (
    <Badge variant="success">Connected</Badge>
  ) : isComingSoon ? (
    <Badge variant="neutral">Coming Soon</Badge>
  ) : (
    <Button variant="primary" size="sm" onClick={onConnect}>Connect</Button>
  )}
</div>
```

---

## 7. Sync Log Tab

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Filter: [All Integrations ▼]  [All Statuses ▼]  [Last 7 days ▼]  [Search...]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Jira                              Today at 2:45 PM                    │ │
│ │   Sync completed · 847 items updated across 12 projects                │ │
│ │   Duration: 2m 34s                                        [View Details]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Monday.com                        Today at 2:30 PM                    │ │
│ │   Sync completed · 124 items updated across 4 boards                   │ │
│ │   Duration: 45s                                           [View Details]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Asana                             Today at 12:15 PM                  │ │
│ │   Sync partially completed · 89 of 156 items updated                   │ │
│ │   Warning: Rate limit approaching                         [View Details]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✗ Asana                              Today at 10:30 AM                  │ │
│ │   Sync failed · Rate limit exceeded                                    │ │
│ │   Error: API_RATE_LIMIT · Retry scheduled for 11:30 AM   [View Details]│ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [Load more...]                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Sync Log Entry

```tsx
interface SyncLogEntry {
  id: string;
  integrationId: string;
  integrationType: IntegrationType;
  status: 'success' | 'partial' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  stats: {
    itemsProcessed: number;
    itemsUpdated: number;
    itemsCreated: number;
    itemsDeleted: number;
    projectsAffected: number;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  warnings?: string[];
}
```

### 7.3 Sync Details Modal

Shows granular breakdown:
- Items created/updated/deleted
- Projects affected (list)
- Warnings encountered
- Error details with stack trace (for debugging)
- Raw API response (collapsible, for advanced users)

---

## 8. OAuth Connection Flow

### 8.1 Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Click      │────▶│  OAuth      │────▶│  Callback   │
│  "Connect"  │     │  Provider   │     │  + Config   │
└─────────────┘     │  (new tab)  │     └─────────────┘
                    └─────────────┘
```

### 8.2 Connection Modal

**Step 1: Pre-connect Info**
```
┌─────────────────────────────────────────────────────────────────┐
│ Connect Jira                                             [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│        [Jira Logo - Large]                                      │
│                                                                 │
│ Vantage will request access to:                                 │
│                                                                 │
│ ✓ Read projects and issues                                     │
│ ✓ Read sprint and board data                                   │
│ ✓ Read user information                                        │
│ ✓ Receive webhooks for updates                                 │
│                                                                 │
│ ℹ️ Vantage will never modify your Jira data.                   │
│                                                                 │
│                                    [Cancel] [Connect to Jira →] │
└─────────────────────────────────────────────────────────────────┘
```

**Step 2: OAuth (external)**
Opens in new tab, user authorizes in Jira/Monday/etc.

**Step 3: Success + Configuration**
```
┌─────────────────────────────────────────────────────────────────┐
│ Jira Connected!                                          [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│        ✓ Successfully connected to company.atlassian.net       │
│                                                                 │
│ Select projects to sync:                                        │
│                                                                 │
│ ☑ All projects (12 found)                                      │
│                                                                 │
│ Or select specific projects:                                    │
│ ☑ Payments Portfolio                                           │
│ ☑ API Platform                                                 │
│ ☑ Mobile App                                                   │
│ ☐ Internal Tools (archived)                                    │
│ ☐ Legacy System                                                │
│ ...                                                             │
│                                                                 │
│ Sync frequency:                                                 │
│ [Every 15 minutes ▼]                                            │
│                                                                 │
│                                      [Skip Setup] [Start Sync →]│
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Configuration Panel

Slide-out panel for managing connected integration.

### 9.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Jira Configuration                                       [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ CONNECTION                                                      │
│ Instance: company.atlassian.net                                 │
│ Connected as: admin@company.com                                 │
│ Connected on: Feb 1, 2026                                       │
│                                           [Re-authenticate]     │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ SYNCED PROJECTS                                                 │
│ ☑ Payments Portfolio                           [View mapping]  │
│ ☑ API Platform                                 [View mapping]  │
│ ☑ Mobile App                                   [View mapping]  │
│ ☐ Internal Tools                                               │
│                                             [+ Add Project]     │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ SYNC SETTINGS                                                   │
│                                                                 │
│ Sync frequency                                                  │
│ [Every 15 minutes ▼]                                            │
│                                                                 │
│ Sync direction                                                  │
│ ● One-way (Jira → Vantage)                                     │
│ ○ Two-way sync (**V2**)                                        │
│                                                                 │
│ Include archived items                                          │
│ [Toggle: Off]                                                   │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ FIELD MAPPING                                                   │
│ [View field mappings →]                                        │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ DANGER ZONE                                                     │
│ [Disconnect Jira]                                               │
│                                                                 │
│                                              [Cancel] [Save]    │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Field Mapping (Sub-panel)

```
┌─────────────────────────────────────────────────────────────────┐
│ Field Mapping: Jira → Vantage                            [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Jira Field              │  Vantage Field                        │
│ ────────────────────────┼───────────────────────────────────── │
│ Summary                 │  Title (required)                     │
│ Description             │  Description                          │
│ Status                  │  Status [mapped]                      │
│ Priority                │  Priority [mapped]                    │
│ Assignee                │  Assignee                             │
│ Story Points            │  Effort                               │
│ Due Date                │  Due Date                             │
│ Sprint                  │  Sprint                               │
│ Labels                  │  Tags                                 │
│ Custom: Team            │  Team [Select... ▼]                   │
│ Custom: Risk Level      │  -- Ignore --                         │
│                                                                 │
│ [View status mapping]   [View priority mapping]                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Error States & Recovery

### 10.1 Error Types

| Error | Display | Recovery Action |
|-------|---------|-----------------|
| OAuth expired | "Authentication expired" | [Re-authenticate] |
| Rate limited | "Rate limit exceeded" | Auto-retry countdown |
| API error | "API error: {message}" | [Retry] + [View Details] |
| Network error | "Connection failed" | [Retry] |
| Permission denied | "Missing permissions" | [Re-authenticate with permissions] |
| Instance unreachable | "Could not reach {instance}" | [Check status] + [Retry] |

### 10.2 Error Banner on Card

```tsx
<Alert variant="danger" className="mt-3">
  <AlertTriangle className="w-4 h-4" />
  <div className="flex-1">
    <span className="font-medium">Sync failed:</span> {errorMessage}
  </div>
  {retryable && (
    <Button variant="danger" size="sm" onClick={onRetry}>Retry</Button>
  )}
</Alert>
```

### 10.3 Disconnect Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│ Disconnect Jira?                                         [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ⚠️ This will:                                                  │
│                                                                 │
│ • Stop syncing data from Jira                                  │
│ • Keep existing synced data in Vantage                         │
│ • Remove webhook subscriptions                                  │
│                                                                 │
│ You can reconnect at any time.                                  │
│                                                                 │
│                                  [Cancel] [Disconnect Jira]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Webhook Status

### 11.1 Real-time Updates

When webhooks are active, show indicator:
```
✓ Real-time updates enabled · Webhook active
```

When webhooks fail:
```
⚠️ Real-time updates unavailable · Falling back to polling
```

---

## 12. Data Requirements

### 12.1 API Endpoints

**GET /api/integrations**
```typescript
// Response
{
  integrations: Integration[];
}
```

**GET /api/integrations/:id**
```typescript
// Response
{
  integration: Integration;
  projects: IntegrationProject[];
  fieldMappings: FieldMapping[];
  syncHistory: SyncLogEntry[];
}
```

**POST /api/integrations/:type/connect**
```typescript
// Initiates OAuth flow, returns redirect URL
{
  redirectUrl: string;
}
```

**POST /api/integrations/:id/sync**
```typescript
// Triggers manual sync
// Response
{
  syncId: string;
  status: 'started';
}
```

**PATCH /api/integrations/:id**
```typescript
// Update configuration
{
  syncFrequency?: number;
  includedProjectIds?: string[];
  fieldMappings?: FieldMapping[];
}
```

**DELETE /api/integrations/:id**
```typescript
// Disconnect integration
```

### 12.2 Data Model

```typescript
interface Integration {
  id: string;
  type: 'jira' | 'monday' | 'asana' | 'confluence' | 'slack' | 'google_calendar' | 'outlook_calendar';
  name: string;
  instanceUrl: string;
  status: 'connected' | 'syncing' | 'error' | 'warning' | 'disconnected';
  connectedAt: string;
  connectedBy: string;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'partial' | 'failed';
  syncFrequency: number;  // minutes
  webhookStatus: 'active' | 'inactive' | 'error';
  error?: {
    code: string;
    message: string;
    occurredAt: string;
    retryAt?: string;
  };
  oauth: {
    scopes: string[];
    expiresAt?: string;
  };
}

interface IntegrationProject {
  externalId: string;
  externalName: string;
  vantageProjectId?: string;
  vantageName?: string;
  isSynced: boolean;
  lastSyncAt?: string;
  itemCount: number;
}
```

### 12.3 WebSocket Events

```typescript
// Sync progress updates
{
  type: 'sync:progress';
  integrationId: string;
  progress: number;
  status: string;
}

// Sync completed
{
  type: 'sync:complete';
  integrationId: string;
  result: SyncLogEntry;
}
```

---

## 13. Edge Cases

| Case | Handling |
|------|----------|
| OAuth token expires during sync | Pause sync, prompt re-auth, resume |
| User revokes OAuth externally | Detect on next sync, show "Re-authenticate" |
| Instance URL changes | Allow updating instance URL in config |
| Project deleted in source | Mark as "Deleted externally", offer cleanup |
| Duplicate connections attempted | Warn "This instance is already connected" |
| Sync takes very long (>10min) | Show progress, allow cancellation |
| Webhook delivery fails | Fall back to polling, log warning |
| Source has 1000+ projects | Paginated project selection, search |

---

## 14. Mobile Considerations

### 14.1 Responsive Layout

- Integration cards: Full width, stacked
- Configuration panel: Full-screen modal
- OAuth flow: Works in mobile browser

### 14.2 Mobile-Specific

- "Sync Now" → confirm dialog (prevent accidental taps)
- Sync log: Simplified view, expand for details

---

## 15. Accessibility

- Integration status announced by screen readers
- OAuth flow: Opens in new tab with proper focus management
- Progress bars have aria-valuenow
- Error messages linked to integrations with aria-describedby

---

## 16. Analytics Events

| Event | Properties |
|-------|------------|
| `integration_connect_started` | `type` |
| `integration_connect_completed` | `type`, `projects_count` |
| `integration_connect_failed` | `type`, `error_code` |
| `integration_sync_manual` | `integration_id`, `type` |
| `integration_disconnected` | `type`, `reason` |
| `integration_configured` | `type`, `changes` |
| `sync_log_viewed` | `integration_id` |

---

## 17. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Jira Cloud vs Jira Server/Data Center: do we support both? | Product | V1: Cloud only. Server/DC is V2 (different auth flow). |
| 2 | Webhook reliability: what's our retry/backfill strategy? | Engineering | See TECHNICAL_DECISIONS.md I4. |
| 3 | Field mapping: auto-detection accuracy threshold before showing "unmapped"? | Engineering | See I2 for V1 smart defaults. |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Integrations Hub is the control center for managing all tool connections that power Vantage intelligence.*
