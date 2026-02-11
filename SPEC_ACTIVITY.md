# Screen Spec: Activity / Audit Log
## /activity

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The Activity / Audit Log provides a comprehensive timeline of all changes across Vantage. It tracks who changed what, when, and from where—essential for accountability, debugging, and compliance.

**Core Value:** When something changes unexpectedly, PMs need to understand what happened. The Activity Log answers "who changed this and when?" without requiring detective work across multiple tools.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| A-1 | PM | See recent changes to my projects | I stay aware of what's happening |
| A-2 | PM | Filter activity by project | I can focus on specific work |
| A-3 | Admin | See all activity across the org | I can monitor for issues |
| A-4 | Admin | Track sync events | I can verify data is flowing correctly |
| A-5 | PM | See who made a specific change | I know who to ask about it |
| A-6 | Admin | Export activity logs | I can meet compliance requirements |
| A-7 | PM | Filter by activity type | I can focus on specific kinds of changes |
| A-8 | PM | See changes within a date range | I can investigate a specific period |

---

## 3. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Activity Log                                      [Export ↓]    │ │
│         │  │ Showing activity from the last 7 days                            │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [All Activity] [Changes] [Syncs] [Access] [System]              │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [Search activity...]   [Project ▼] [User ▼] [Date range ▼]     │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │                                                                       │
│         │  TODAY                                                               │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ ●  2:45 PM                                                      │ │
│         │  │    [Avatar] Jake Martinez updated AUTH-123                      │ │
│         │  │    Status: In Progress → Blocked                                │ │
│         │  │    Payments Portfolio                                           │ │
│         │  │                                                   [View item →] │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │      │                                                               │
│         │  ┌───┴─────────────────────────────────────────────────────────────┐ │
│         │  │ ●  2:30 PM                                                      │ │
│         │  │    [Jira icon] Jira sync completed                              │ │
│         │  │    12 projects · 847 items updated                              │ │
│         │  │                                                   [View sync →] │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │      │                                                               │
│         │  ┌───┴─────────────────────────────────────────────────────────────┐ │
│         │  │ ●  1:15 PM                                                      │ │
│         │  │    [Avatar] Sarah Chen created Mobile App                       │ │
│         │  │    New project from Asana import                                │ │
│         │  │                                                  [View project]│ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │      │                                                               │
│         │  ┌───┴─────────────────────────────────────────────────────────────┐ │
│         │  │ ●  11:30 AM                                                     │ │
│         │  │    [Avatar] Mike Johnson commented on API-456                   │ │
│         │  │    "We need to revisit the caching strategy..."                │ │
│         │  │    API Platform                                                 │ │
│         │  │                                                   [View item →] │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │      │                                                               │
│         │  ────┴───────────────────────────────────────────────────────────── │
│         │                                                                       │
│         │  YESTERDAY                                                           │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ ●  5:30 PM                                                      │ │
│         │  │    [Avatar] Admin invited 3 new members                         │ │
│         │  │    sarah@co.com, mike@co.com, lisa@co.com                       │ │
│         │  │                                                                  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │      │                                                               │
│         │  [Load more activity...]                                             │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab Structure

### Tab 1: All Activity (Default)
Everything in chronological order.

### Tab 2: Changes
Task and project updates only.

### Tab 3: Syncs
Integration sync events.

### Tab 4: Access
User logins, invites, permission changes.

### Tab 5: System
System events, errors, maintenance.

---

## 5. Component Breakdown

### 5.1 Page Header

```tsx
<PageHeader
  title="Activity Log"
  subtitle="Showing activity from the last 7 days"
  actions={
    <DropdownButton icon={<Download />} label="Export">
      <DropdownItem onClick={exportCSV}>Export as CSV</DropdownItem>
      <DropdownItem onClick={exportJSON}>Export as JSON</DropdownItem>
    </DropdownButton>
  }
/>
```

### 5.2 Filter Bar

**Search:**
```tsx
<SearchInput
  placeholder="Search activity..."
  icon={<Search />}
/>
```

**Filters:**
- **Project:** Dropdown of all projects + "All Projects"
- **User:** Dropdown of all users + "All Users"
- **Date Range:** Presets (Today, 7 days, 30 days, 90 days) + custom range

### 5.3 Activity Entry Component

**Structure:**
```
┌────────────────────────────────────────────────────────────────┐
│ ●  [Timestamp]                                                 │
│    [Actor avatar/icon]  [Actor name] [action verb] [object]    │
│    [Change details - what specifically changed]                │
│    [Context - project name, additional info]                   │
│                                                    [Action →]  │
└────────────────────────────────────────────────────────────────┘
```

**Component:**
```tsx
interface ActivityEntryProps {
  id: string;
  type: ActivityType;
  actor: {
    type: 'user' | 'system' | 'integration';
    id?: string;
    name: string;
    avatar?: string;
  };
  action: string;           // "updated", "created", "deleted", etc.
  object: {
    type: 'task' | 'project' | 'comment' | 'user' | 'integration' | 'setting';
    id: string;
    name: string;
    url?: string;
  };
  changes?: Array<{
    field: string;
    oldValue: string | null;
    newValue: string | null;
  }>;
  context?: {
    projectId?: string;
    projectName?: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

### 5.4 Activity Type Styles

| Type | Icon | Color |
|------|------|-------|
| Task created | `Plus` | `text-success-500` |
| Task updated | `Pencil` | `text-primary-500` |
| Task deleted | `Trash2` | `text-danger-500` |
| Status change | `ArrowRight` | `text-primary-500` |
| Comment added | `MessageSquare` | `text-primary-500` |
| Project created | `FolderPlus` | `text-success-500` |
| Sync completed | `RefreshCw` | `text-success-500` |
| Sync failed | `AlertTriangle` | `text-danger-500` |
| User invited | `UserPlus` | `text-primary-500` |
| User login | `LogIn` | `text-neutral-500` |
| Settings changed | `Settings` | `text-neutral-500` |
| Integration connected | `Link` | `text-success-500` |

### 5.5 Timeline Connector

Vertical line connecting entries:
```tsx
<div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-neutral-200" />
```

### 5.6 Date Group Header

```tsx
<div className="flex items-center gap-4 py-4">
  <div className="h-px flex-1 bg-neutral-200" />
  <span className="text-sm font-medium text-neutral-500">{dateLabel}</span>
  <div className="h-px flex-1 bg-neutral-200" />
</div>
```

Groups: Today, Yesterday, [Day name] (within week), [Date] (older)

---

## 6. Activity Entry Variants

### 6.1 Task Update

```
●  2:45 PM
   [Avatar] Jake Martinez updated AUTH-123
   Status: In Progress → Blocked
   Assignee: Unassigned → Jake Martinez
   Payments Portfolio
                                                    [View item →]
```

**Change Display:**
- Show field name and old → new value
- Limit to 3 changes visible, "+X more" expands
- Color code: red strikethrough for old, green for new

### 6.2 Task Created

```
●  1:15 PM
   [Avatar] Sarah Chen created MOBILE-42
   "User Authentication Flow"
   Mobile App
                                                    [View item →]
```

### 6.3 Comment Added

```
●  11:30 AM
   [Avatar] Mike Johnson commented on API-456
   "We need to revisit the caching strategy before the release..."
   API Platform
                                                    [View item →]
```

**Comment Preview:**
- Truncate at 100 chars with ellipsis
- Full comment visible on click/expand

### 6.4 Sync Event

```
●  2:30 PM
   [Jira icon] Jira sync completed
   12 projects · 847 items updated · 23 created · 5 deleted
                                                    [View sync →]
```

**Sync Variants:**
- Completed (green checkmark)
- Partial (yellow warning)
- Failed (red X)

### 6.5 User Access Event

```
●  5:30 PM
   [Avatar] Admin (you) invited 3 new members
   sarah@company.com, mike@company.com, lisa@company.com
   Role: Member
```

### 6.6 System Event

```
●  3:00 AM
   [System icon] Scheduled maintenance completed
   Database optimization · Duration: 12 minutes
```

---

## 7. Detailed View Panel

When clicking an activity entry, show slide-out panel with full details.

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Activity Details                                         [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ TASK UPDATED                                                    │
│ AUTH-123 · Auth Service Refactor                               │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ WHO                                                             │
│ [Avatar] Jake Martinez                                          │
│ jake@company.com                                                │
│                                                                 │
│ WHEN                                                            │
│ February 8, 2026 at 2:45:32 PM EST                             │
│                                                                 │
│ WHAT CHANGED                                                    │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Status                                                      │ │
│ │ In Progress → Blocked                                       │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Assignee                                                    │ │
│ │ Unassigned → Jake Martinez                                  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ Priority                                                    │ │
│ │ Medium → High                                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ SOURCE                                                          │
│ Synced from Jira · company.atlassian.net                       │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ [View AUTH-123]                    [View Jake's activity →]    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Export Functionality

### 8.1 Export Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Export Activity Log                                      [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Date Range                                                      │
│ [February 1, 2026] to [February 8, 2026]                       │
│                                                                 │
│ Activity Types                                                  │
│ ☑ All types                                                    │
│ ○ Select specific types                                        │
│                                                                 │
│ Format                                                          │
│ ● CSV (spreadsheet compatible)                                 │
│ ○ JSON (machine readable)                                      │
│                                                                 │
│ Include                                                         │
│ ☑ User information                                             │
│ ☑ Change details                                               │
│ ☑ Metadata                                                     │
│                                                                 │
│ Estimated size: ~2.4 MB (12,847 entries)                       │
│                                                                 │
│                                         [Cancel] [Export →]     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 CSV Format

```csv
timestamp,actor_name,actor_email,action,object_type,object_id,object_name,project,field_changed,old_value,new_value
2026-02-08T14:45:32Z,Jake Martinez,jake@company.com,updated,task,AUTH-123,Auth Service Refactor,Payments Portfolio,status,In Progress,Blocked
```

---

## 9. Real-time Updates

### 9.1 WebSocket Events

```typescript
// New activity event
{
  type: 'activity:new';
  payload: ActivityEntry;
}
```

### 9.2 UI Behavior

- New activities appear at top with subtle slide-in animation
- "New activity" banner if user has scrolled down: "↑ 3 new activities"
- Click banner to scroll to top

---

## 10. Data Requirements

### 10.1 API Endpoints

**GET /api/activity**
```typescript
// Query params
{
  type?: ActivityType[];
  projectId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;       // default 50
  cursor?: string;
}

// Response
{
  activities: ActivityEntry[];
  nextCursor: string | null;
  totalCount: number;
}
```

**GET /api/activity/:id**
```typescript
// Response
{
  activity: ActivityEntry;
  relatedActivities?: ActivityEntry[];  // Same object, different times
}
```

**GET /api/activity/export**
```typescript
// Query params (same as GET /api/activity)
{
  format: 'csv' | 'json';
}

// Response: File download
```

### 10.2 Data Model

```typescript
interface ActivityEntry {
  id: string;
  organizationId: string;
  type: ActivityType;
  actor: {
    type: 'user' | 'system' | 'integration';
    userId?: string;
    integrationId?: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  action: 'created' | 'updated' | 'deleted' | 'commented' | 'invited' | 'connected' | 'synced' | 'logged_in' | 'other';
  object: {
    type: ObjectType;
    id: string;
    name: string;
    externalId?: string;
    url?: string;
  };
  changes?: Array<{
    field: string;
    fieldDisplayName?: string;
    oldValue: any;
    newValue: any;
  }>;
  context?: {
    projectId?: string;
    projectName?: string;
    integrationId?: string;
    integrationName?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

type ActivityType = 
  | 'task_change'
  | 'project_change'
  | 'comment'
  | 'sync'
  | 'user_access'
  | 'settings'
  | 'integration'
  | 'system';

type ObjectType =
  | 'task'
  | 'project'
  | 'comment'
  | 'user'
  | 'team'
  | 'integration'
  | 'setting'
  | 'report';
```

### 10.3 Activity Logging (Backend)

Activities should be logged for:
- All CRUD operations on tasks, projects, comments
- All sync events (start, complete, fail)
- User authentication events
- Admin actions (invites, role changes, settings)
- Integration connections/disconnections
- System maintenance events

---

## 11. Edge Cases

| Case | Handling |
|------|----------|
| Actor user deleted | Show "Deleted User" with original name if available |
| Object deleted | Show with strikethrough, note "This item was deleted" |
| Bulk changes (100+ items) | Group into single entry: "Updated 147 tasks" |
| Very long change value | Truncate with "Show more" expansion |
| Sensitive data in changes | Redact passwords, tokens (show "[redacted]") |
| No activity in time range | Empty state: "No activity in this time period" |
| Export too large | Paginate export or offer async download |
| Time zone differences | Display in user's local timezone |

---

## 12. Permissions

### 12.1 Visibility Rules

| User Role | Can See |
|-----------|---------|
| Owner | All activity in org (including billing events) |
| Admin | All activity in org (excluding billing) |
| Member | All non-sensitive activity (V1); project-scoped in V2 |
| Viewer | All non-sensitive activity (read-only) |

### 12.2 Sensitive Activities

Some activities are admin-only visible:
- User login events
- Permission changes
- Billing events
- Integration OAuth events

---

## 13. Mobile Considerations

### 13.1 Responsive Layout

- Timeline: Full width, connector line hidden
- Filters: Collapsible filter panel
- Export: Available but simplified options

### 13.2 Mobile Wireframe

```
┌─────────────────────────────────┐
│ ← Activity Log     [Filter] [↓] │
├─────────────────────────────────┤
│ TODAY                           │
├─────────────────────────────────┤
│ ● 2:45 PM                       │
│ Jake Martinez                   │
│ Updated AUTH-123                │
│ Status: In Progress → Blocked   │
├─────────────────────────────────┤
│ ● 2:30 PM                       │
│ Jira sync completed             │
│ 847 items updated               │
├─────────────────────────────────┤
│ ...                             │
└─────────────────────────────────┘
```

---

## 14. Accessibility

- Timeline entries are `<article>` elements with proper headings
- Timestamps use `<time>` element with ISO datetime
- Change visualizations have text alternatives
- Filter changes announced via aria-live

---

## 15. Analytics Events

| Event | Properties |
|-------|------------|
| `activity_viewed` | `filter_type`, `date_range` |
| `activity_filtered` | `filters_applied` |
| `activity_detail_viewed` | `activity_id`, `activity_type` |
| `activity_exported` | `format`, `date_range`, `entry_count` |
| `activity_search` | `query`, `result_count` |

---

## 16. Retention Policy

- Activity logs retained for 90 days by default
- Enterprise plans: Configurable up to 1 year
- Exports available for compliance beyond retention

---

## 17. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Activity logging middleware: decorator pattern vs. explicit calls? | Engineering | Decided: Decorator/middleware pattern from day one (see A3). |
| 2 | Large export handling: async download threshold? | Engineering | Async via pg-boss for exports >10MB (see A4). |
| 3 | IP address storage: GDPR compliance approach? | Legal + Engineering | Hash IPs, security events only, 1-year retention (see A7). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Activity Log provides complete auditability and answers "what happened?" across all of Vantage.*
