# Screen Spec: Team / People
## /team

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The Team / People screen provides visibility into team members across all connected tools. It surfaces workload distribution, availability, capacity, and helps PMs identify overloaded team members and resource gaps.

**Core Value:** PMs often don't have visibility into who's overloaded or available. Vantage aggregates team data across Jira, Monday, and Asana to show the real picture—enabling better work distribution and preventing burnout.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| T-1 | PM | See all team members in one view | I know who's on my projects |
| T-2 | PM | View each person's workload | I can identify overloaded team members |
| T-3 | PM | See availability/capacity | I can plan assignments appropriately |
| T-4 | PM Leader | View workload across teams | I can balance resources |
| T-5 | PM | Filter by project or skill | I can find the right person for a task |
| T-6 | PM | See a person's assigned tasks | I can understand their current focus |
| T-7 | PM | Identify blocked team members | I can help unblock them |
| T-8 | Admin | Manage team membership | I can control who has access |

---

## 3. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Team                                               [Invite +]   │ │
│         │  │ 24 members across 4 teams                                        │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [All Members] [By Team] [Workload] [Availability]               │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [Search members...]        [Team: All ▼] [Role: All ▼]          │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │  ALL MEMBERS VIEW                                                    │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │                                                                  │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │ [Avatar] Jake Martinez                                      │ │ │
│         │  │ │          Senior Engineer · API Team                         │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │ Workload      ████████████████░░░░  85%  ⚠️ High            │ │ │
│         │  │ │ Active Tasks  12 (3 blocked)                                │ │ │
│         │  │ │ Sources       [Jira] [Monday]                               │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │                                    [View Profile] [Assign →]│ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                  │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │ [Avatar] Sarah Chen                                         │ │ │
│         │  │ │          Product Manager · Payments Team                    │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │ Workload      ████████████░░░░░░░░  62%  ✓ Normal           │ │ │
│         │  │ │ Active Tasks  8 (0 blocked)                                 │ │ │
│         │  │ │ Sources       [Jira] [Asana]                                │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │                                    [View Profile] [Assign →]│ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                  │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │ [Avatar] Maria Lopez                                        │ │ │
│         │  │ │          Designer · Mobile Team                             │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │ Workload      ██████░░░░░░░░░░░░░░  35%  ✓ Available        │ │ │
│         │  │ │ Active Tasks  4 (0 blocked)                                 │ │ │
│         │  │ │ Sources       [Asana]                                       │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │                                    [View Profile] [Assign →]│ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab Structure

### Tab 1: All Members (Default)
Card grid of all team members with key stats.

### Tab 2: By Team
Grouped view organized by team.

### Tab 3: Workload
Sorted view highlighting over/under-utilized members.

### Tab 4: Availability
Workload-based availability in V1. Calendar-aware availability (Google Calendar, Outlook) is **V2** — requires separate OAuth integrations.

---

## 5. Component Breakdown

### 5.1 Page Header

```tsx
<PageHeader
  title="Team"
  subtitle="24 members across 4 teams"
  actions={
    <Button variant="primary" icon={<UserPlus />} onClick={openInviteModal}>
      Invite
    </Button>
  }
/>
```

### 5.2 Filter Bar

**Search:**
```tsx
<SearchInput
  placeholder="Search members..."
  icon={<Search />}
  value={searchQuery}
  onChange={setSearchQuery}
/>
```

**Filters:**
- Team: Dropdown with all teams + "All Teams"
- Role: Dropdown with roles (Engineer, Designer, PM, etc.)
- Source: Dropdown with sources (Jira, Monday, Asana, All)

### 5.3 Team Member Card

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│ [Avatar 48px]  Name                                            │
│                Role · Team                                     │
│                                                                │
│ Workload      [Progress Bar]  XX%  [Status Badge]              │
│ Active Tasks  X (Y blocked)                                    │
│ Sources       [Source Badges]                                  │
│                                                                │
│                                   [View Profile] [Assign →]    │
└────────────────────────────────────────────────────────────────┘
```

**Component:**
```tsx
interface TeamMemberCardProps {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  team: string;
  workload: {
    percentage: number;
    status: 'available' | 'normal' | 'high' | 'overloaded';
  };
  activeTasks: number;
  blockedTasks: number;
  sources: Array<'jira' | 'monday' | 'asana'>;
  onViewProfile: () => void;
  onAssign: () => void;
}
```

**Workload Status Colors:**

| Status | Percentage | Bar Color | Badge |
|--------|------------|-----------|-------|
| Available | 0-40% | `bg-success-500` (#00A86B) | "✓ Available" green |
| Normal | 41-70% | `bg-primary-500` (#0066CC) | "✓ Normal" blue |
| High | 71-90% | `bg-warning-500` (#FFA500) | "⚠️ High" orange |
| Overloaded | 91%+ | `bg-danger-500` (#E63946) | "🔴 Overloaded" red |

**Card Styling:**
- Container: `bg-white rounded-xl border border-neutral-100 p-4 hover:shadow-md transition-shadow`
- Avatar: `w-12 h-12 rounded-full`
- Name: `text-base font-semibold text-neutral-900`
- Role/Team: `text-sm text-neutral-500`

### 5.4 Workload Progress Bar

```tsx
<div className="flex items-center gap-3">
  <span className="text-sm text-neutral-600 w-20">Workload</span>
  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full ${getWorkloadColor(percentage)}`}
      style={{ width: `${percentage}%` }}
    />
  </div>
  <span className="text-sm font-medium text-neutral-700 w-12">{percentage}%</span>
  <Badge variant={workloadStatus}>{statusLabel}</Badge>
</div>
```

### 5.5 Source Badges

Small integration badges showing where data comes from:

```tsx
<div className="flex gap-1">
  <SourceBadge source="jira" />   // Blue #0052CC
  <SourceBadge source="monday" /> // Red #FF3D57
  <SourceBadge source="asana" />  // Salmon #F06A6A
</div>
```

---

## 6. By Team View

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ API Team                                              8 members │
│ Avg workload: 72%                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]                                     │
│ [Card] [Card] [Card] [Card]                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Payments Team                                         6 members │
│ Avg workload: 58%                                               │
├─────────────────────────────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]                                     │
│ [Card] [Card]                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Team Section Header

```tsx
<div className="flex items-center justify-between py-3 border-b border-neutral-100">
  <div>
    <h3 className="text-lg font-semibold text-neutral-900">{teamName}</h3>
    <p className="text-sm text-neutral-500">Avg workload: {avgWorkload}%</p>
  </div>
  <Badge>{memberCount} members</Badge>
</div>
```

**Team Health Indicator:**
- If avg workload > 80%: Show warning icon
- If any member overloaded: Show count ("2 overloaded")

---

## 7. Workload View

### 7.1 Layout

Sorted table/list view, highest workload first:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ 3 team members are overloaded                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Member              │ Team          │ Workload                │ Tasks      │
├─────────────────────┼───────────────┼─────────────────────────┼────────────┤
│ [Av] Jake Martinez  │ API Team      │ ████████████████████ 98%│ 15 (4 blk) │
│ [Av] Tom Wilson     │ API Team      │ ███████████████████░ 92%│ 14 (2 blk) │
│ [Av] Lisa Park      │ Mobile Team   │ ███████████████████░ 91%│ 12 (3 blk) │
│ [Av] Sarah Chen     │ Payments Team │ ████████████░░░░░░░░ 62%│ 8          │
│ [Av] Maria Lopez    │ Mobile Team   │ ██████░░░░░░░░░░░░░░ 35%│ 4          │
│ ...                                                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Workload Alert Banner

When members are overloaded:
```tsx
<Alert variant="warning" icon={<AlertTriangle />}>
  3 team members are overloaded. Consider redistributing work.
  <Button variant="ghost" size="sm">View recommendations</Button>
</Alert>
```

---

## 8. Availability View

### 8.1 Concept

Shows availability based on:
- Current workload (capacity - assigned work)
- Calendar events (if calendar integration enabled)
- PTO / time off (if available from source)

### 8.2 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Available Now (5)                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Card] Maria Lopez     │ [Card] Alex Kim      │ [Card] Chris Brown         │
│ 65% available          │ 50% available        │ 45% available              │
├─────────────────────────────────────────────────────────────────────────────┤
│ Limited Availability (8)                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Card] Sarah Chen      │ [Card] Mike Johnson  │ ...                        │
│ 38% available          │ 28% available        │                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ At Capacity (6)                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Card] Jake Martinez   │ [Card] Tom Wilson    │ ...                        │
│ 2% available           │ 8% available         │                            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Out of Office (2)                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Card] Jennifer Wu - PTO until Feb 12                                       │
│ [Card] David Lee - Conference until Feb 10                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Person Profile Panel

Slide-out panel showing detailed information about a team member.

### 9.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                                                            [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│        [Large Avatar 80px]                                      │
│        Jake Martinez                                            │
│        Senior Engineer                                          │
│        API Team                                                 │
│        jake@company.com                                         │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ WORKLOAD                                                        │
│ ████████████████████░░░░  85%                                  │
│                                                                 │
│ Tasks by Status                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ In Progress   ████████████  8                               │ │
│ │ Blocked       ████          3                               │ │
│ │ To Do         ██            1                               │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ ACTIVE TASKS                                    [View all →]   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔴 BLOCKED                                                  │ │
│ │ AUTH-123 Auth Service Refactor                              │ │
│ │ Payments Portfolio · Blocked 3 days                         │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 🟡 IN PROGRESS                                              │ │
│ │ API-456 Gateway Migration                                   │ │
│ │ API Platform · Due Feb 12                                   │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 🟡 IN PROGRESS                                              │ │
│ │ API-457 Response Validation                                 │ │
│ │ API Platform · Due Feb 14                                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ PROJECTS (3)                                                    │
│ • Payments Portfolio                                            │
│ • API Platform                                                  │
│ • Mobile App                                                    │
│                                                                 │
│ ───────────────────────────────────────────────────────────── │
│                                                                 │
│ SOURCES                                                         │
│ [Jira] jake.martinez@company.atlassian.net                     │
│ [Monday] jake.martinez                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Actions

- **Message:** (future) Send direct message
- **Assign Task:** Open task assignment modal
- **View in Source:** Link to profile in Jira/Monday/Asana

---

## 10. Invite Modal

### 10.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Invite Team Members                                      [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Email addresses (one per line or comma-separated)               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ sarah@company.com                                           │ │
│ │ mike@company.com                                            │ │
│ │                                                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Role                                                            │
│ [Member ▼]                                                      │
│                                                                 │
│ Team (optional)                                                 │
│ [Select team... ▼]                                              │
│                                                                 │
│ Personal message (optional)                                     │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Welcome to our Vantage workspace!                           │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                    [Cancel] [Send 2 Invitations] │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Role Options

- **Owner:** Full access including billing, org deletion, and ownership transfer
- **Admin:** Full access including settings and member management
- **Member:** Full access to projects and reports
- **Viewer:** Read-only access

---

## 11. Interactions & States

### 11.1 Card Interactions

- **Click card:** Open profile panel
- **Hover card:** Subtle shadow lift
- **Click "Assign":** Open task assignment dropdown/modal

### 11.2 Search Behavior

- Searches name, email, role, team
- Debounced (300ms)
- Highlights matching text

### 11.3 Loading States

- Card grid: Skeleton cards with avatar, lines
- Profile panel: Skeleton content

### 11.4 Empty States

**No team members:**
```
┌────────────────────────────────────────────────────────────────┐
│                    [Users icon - 48px]                         │
│                                                                │
│               No team members yet                              │
│    Invite your team or connect integrations to                 │
│    automatically sync team members.                            │
│                                                                │
│         [Invite Team]    [Connect Tools]                       │
└────────────────────────────────────────────────────────────────┘
```

**No search results:**
"No members match your search. Try different keywords."

---

## 12. Data Requirements

### 12.1 API Endpoints

**GET /api/team/members**
```typescript
{
  search?: string;
  teamId?: string;
  role?: string;
  source?: string;
  sortBy?: 'name' | 'workload' | 'availability';
  sortOrder?: 'asc' | 'desc';
}

// Response
{
  members: TeamMember[];
  teams: Team[];
  totalCount: number;
}
```

**GET /api/team/members/:id**
```typescript
// Response
{
  member: TeamMember;
  tasks: Task[];
  projects: Project[];
  workloadHistory: Array<{ date: string; percentage: number }>;
}
```

**POST /api/team/invite**
```typescript
{
  emails: string[];
  role: 'admin' | 'member' | 'viewer';
  teamId?: string;
  message?: string;
}
```

### 12.2 Data Model

```typescript
interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  teamId: string;
  teamName: string;
  workload: {
    percentage: number;
    status: 'available' | 'normal' | 'high' | 'overloaded';
    capacity: number;      // Total capacity (hours or points)
    assigned: number;      // Currently assigned
  };
  activeTasks: number;
  blockedTasks: number;
  sources: Array<{
    type: 'jira' | 'monday' | 'asana';
    externalId: string;
    username: string;
  }>;
  availability?: {
    status: 'available' | 'limited' | 'busy' | 'out';
    until?: string;        // For PTO/OOO
    reason?: string;
  };
  createdAt: string;
  lastActiveAt: string;
}
```

### 12.3 Workload Calculation

```typescript
// Workload percentage calculation
workloadPercentage = (assignedPoints / capacityPoints) * 100;

// Capacity sources:
// - Jira: From user's sprint capacity settings
// - Monday: From capacity/workload column
// - Asana: From portfolio capacity
// - Default: Configurable org-wide default (e.g., 40 points/week)
```

---

## 13. Edge Cases

| Case | Handling |
|------|----------|
| User in multiple sources with different names | Show primary (first synced) with aliases in profile |
| User has no tasks | Show 0% workload, "Available" status |
| User over 100% workload | Cap bar at 100%, show actual % in text, "Overloaded" badge |
| Pending invite | Show in separate "Pending" section with re-send option |
| User removed from source | Mark as "Inactive" but keep history |
| Team has no members | Show team section with empty state |
| Very long team name | Truncate with ellipsis |

---

## 14. Mobile Considerations

### 14.1 Responsive Layout

- Card grid: 2 columns → 1 column on mobile
- Filter bar: Collapses to filter button + bottom sheet
- Profile panel: Full-screen modal instead of slide-out

### 14.2 Mobile Card

Condensed version:
```
┌─────────────────────────────────────────────┐
│ [Avatar] Jake Martinez              ⚠️ 85%  │
│          API Team · 12 tasks                │
└─────────────────────────────────────────────┘
```

---

## 15. Accessibility

- Cards are focusable with keyboard
- Profile panel traps focus when open
- Workload percentages announced by screen readers
- Color-coded statuses have text equivalents
- Invite form has proper labels and error announcements

---

## 16. Analytics Events

| Event | Properties |
|-------|------------|
| `team_viewed` | `tab`, `filter_team`, `filter_role` |
| `team_member_clicked` | `member_id`, `source_tab` |
| `team_invite_sent` | `count`, `role` |
| `team_member_assigned` | `member_id`, `task_id` |
| `workload_alert_viewed` | `overloaded_count` |

---

## 17. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Workload normalization: what is the default story-point-to-hours ratio? | Product + Customers | Default 1 SP = 4 hours, org-configurable (see T1). |
| 2 | Privacy default: which visibility mode ships as default? | Product | Decided: Team Aggregate (see T4). |
| 3 | Identity resolution: what happens when auto-match fails at scale? | Engineering | Manual linking UI + admin dedup queue (see T2). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Team / People gives PMs visibility into workload and availability across all connected tools.*
