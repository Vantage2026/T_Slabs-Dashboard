# Screen Spec: Notifications Center
## /notifications

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The Notifications Center is the centralized hub for all alerts, updates, and activity across Vantage. It aggregates risk alerts, sync events, AI insights, @mentions, and team activity into a single, actionable feed.

**Core Value:** PMs shouldn't have to hunt across the app to know what needs attention. The Notifications Center surfaces everything in one place, prioritized by urgency.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| N-1 | PM | See all my notifications in one place | I don't miss important updates |
| N-2 | PM | Filter notifications by type | I can focus on specific categories (risks, mentions, etc.) |
| N-3 | PM | Mark notifications as read individually or in bulk | I can track what I've addressed |
| N-4 | PM | Click a notification to navigate to its source | I can take action immediately |
| N-5 | PM | See unread count in the header | I know when new things need attention |
| N-6 | PM Leader | Filter by project | I can focus on specific projects I own |
| N-7 | PM | Clear all read notifications | I can keep my feed clean |
| N-8 | PM | Receive real-time notifications | I see updates without refreshing |

---

## 3. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header - standard app header with notifications bell showing unread count]     │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Notifications                                    [Mark all read] │ │
│         │  │ You have 12 unread notifications                                 │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [All] [Risks] [Mentions] [Scout] [Sync] [Activity]              │ │
│         │  │                                                                   │ │
│         │  │ Project: [All Projects ▼]              [Today ▼]  [Clear read]  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ TODAY                                                            │ │
│         │  │                                                                   │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │ ● 🔴 Risk Alert                                    2m ago   │ │ │
│         │  │ │   Auth Service blocked for 3 days                           │ │ │
│         │  │ │   Payments Portfolio · Critical                             │ │ │
│         │  │ │                                           [View] [Dismiss]  │ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                   │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │ ● 💬 Mention                                       15m ago  │ │ │
│         │  │ │   Sarah Chen mentioned you in API Team Sync notes           │ │ │
│         │  │ │   API Integration Project                                   │ │ │
│         │  │ │                                           [View] [Dismiss]  │ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                   │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │   ✨ Scout Insight                                  1h ago  │ │ │
│         │  │ │   "Velocity trending down 15% - recommend reviewing         │ │ │
│         │  │ │   workload distribution"                                    │ │ │
│         │  │ │   Mobile App Project                                        │ │ │
│         │  │ │                                           [View] [Dismiss]  │ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                   │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │   🔄 Sync Complete                                  2h ago  │ │ │
│         │  │ │   Jira sync completed · 47 items updated                    │ │ │
│         │  │ │   3 projects affected                                       │ │ │
│         │  │ │                                                   [Details] │ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                   │ │
│         │  ├─────────────────────────────────────────────────────────────────┤ │
│         │  │ YESTERDAY                                                        │ │
│         │  │                                                                   │ │
│         │  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│         │  │ │   📋 Task Update                                   Yesterday │ │ │
│         │  │ │   "Payment Gateway Integration" moved to Done               │ │ │
│         │  │ │   Checkout Flow · Completed by Jake Martinez               │ │ │
│         │  │ │                                                      [View] │ │ │
│         │  │ └─────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                   │ │
│         │  │ [Load more...]                                                   │ │
│         │  │                                                                   │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Breakdown

### 4.1 Page Header

```tsx
<PageHeader
  title="Notifications"
  subtitle="You have {unreadCount} unread notifications"
  actions={
    <Button variant="secondary" onClick={markAllRead} disabled={unreadCount === 0}>
      Mark all read
    </Button>
  }
/>
```

**Styling:**
- Title: `text-2xl font-semibold text-neutral-900`
- Subtitle: `text-sm text-neutral-500`
- Uses standard PageHeader component pattern

### 4.2 Filter Bar

**Tab Filter (Notification Type):**
```
[All] [Risks] [Mentions] [Scout] [Sync] [Activity]
```

- Uses pill-style tab navigation
- Active tab: `bg-primary-500 text-white` (#0066CC)
- Inactive tab: `text-neutral-600 hover:text-neutral-900`
- Container: `bg-neutral-100 rounded-xl p-1`

**Secondary Filters:**

| Filter | Type | Options |
|--------|------|---------|
| Project | Select dropdown | All Projects, [list of user's projects] |
| Time | Select dropdown | All time, Today, Last 7 days, Last 30 days |
| Clear read | Ghost button | Removes read notifications from view |

### 4.3 Notification Card

**Structure:**
```
┌────────────────────────────────────────────────────────────────┐
│ [●] [Icon] [Type Label]                           [Timestamp]  │
│     [Primary Message - bold if unread]                         │
│     [Context line - project, source, etc.]                     │
│                                          [Action] [Dismiss]    │
└────────────────────────────────────────────────────────────────┘
```

**Component Props:**
```tsx
interface NotificationCardProps {
  id: string;
  type: 'risk' | 'mention' | 'scout' | 'sync' | 'activity';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  context: {
    projectName?: string;
    sourceName?: string;
    userName?: string;
  };
  timestamp: Date;
  isRead: boolean;
  actionUrl: string;
  onDismiss: () => void;
  onMarkRead: () => void;
}
```

**Styling by State:**

| State | Card Style |
|-------|------------|
| Unread | `bg-white border-l-4 border-l-primary-500` + unread dot |
| Read | `bg-white border border-neutral-100` |
| Hover | `hover:bg-neutral-50` |

**Unread Indicator:**
- Blue dot: `w-2 h-2 rounded-full bg-primary-500` (#0066CC)
- Positioned left of icon

**Type Icons & Colors:**

| Type | Icon | Badge Color |
|------|------|-------------|
| Risk (Critical) | `AlertTriangle` | `bg-danger-100 text-danger-700` |
| Risk (High) | `AlertTriangle` | `bg-warning-100 text-warning-700` |
| Risk (Medium) | `AlertTriangle` | `bg-warning-50 text-warning-600` |
| Risk (Low) | `AlertTriangle` | `bg-success-100 text-success-700` |
| Mention | `MessageSquare` | `bg-primary-100 text-primary-700` |
| Scout | `Sparkles` | `bg-purple-100 text-purple-700` |
| Sync | `RefreshCw` | `bg-neutral-100 text-neutral-700` |
| Activity | `Activity` | `bg-neutral-100 text-neutral-700` |

**Timestamp Format:**
- < 1 hour: "Xm ago"
- < 24 hours: "Xh ago"
- Yesterday: "Yesterday"
- This week: Day name ("Monday")
- Older: Date ("Feb 5")

### 4.4 Date Group Header

```tsx
<div className="px-4 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wider bg-neutral-50">
  Today
</div>
```

Groups: Today, Yesterday, This Week, Last Week, Older

### 4.5 Empty State

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                    [Bell icon - 48px]                          │
│                                                                │
│                  You're all caught up!                         │
│            No new notifications to show.                       │
│                                                                │
│                  [Go to Command Center]                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

- Icon: `Bell` from Lucide, `w-12 h-12 text-neutral-300`
- Heading: `text-lg font-semibold text-neutral-900`
- Subtext: `text-sm text-neutral-500`
- Button: Primary variant

### 4.6 Load More

```tsx
<button className="w-full py-3 text-sm text-primary-600 hover:text-primary-700 hover:bg-neutral-50 rounded-lg transition-colors">
  Load more notifications...
</button>
```

Or use infinite scroll with loading spinner at bottom.

---

## 5. Notification Types Detail

### 5.1 Risk Alerts

**Trigger:** Risk Radar detects new or escalated risk

**Content:**
- Title: Risk description (e.g., "Auth Service blocked for 3 days")
- Message: Impact summary
- Context: Project name, severity badge
- Action: "View" → navigates to project detail or Risk Radar

**Example:**
```
🔴 Risk Alert
Auth Service blocked for 3 days
Payments Portfolio · Critical · 7 tasks affected
[View in Risk Radar] [Dismiss]
```

### 5.2 Mentions

**Trigger:** User @mentioned in comments, notes, or reports

**Content:**
- Title: "{User} mentioned you in {location}"
- Message: Snippet of the mention context
- Context: Project name
- Action: "View" → navigates to the mention location

### 5.3 Scout Insights

**Trigger:** Scout AI surfaces a proactive insight

**Content:**
- Title: "Scout Insight"
- Message: The AI-generated insight
- Context: Project/portfolio it relates to
- Action: "View" → opens Scout with context, or "Ask Scout" → opens chat

**Example:**
```
✨ Scout Insight
"Velocity trending down 15% across API team. Recommend reviewing workload."
Mobile App Project
[Ask Scout about this] [Dismiss]
```

### 5.4 Sync Events

**Trigger:** Integration sync completes (success, partial, or failure)

**Content:**
- Title: "Sync {status}" (Complete, Partial, Failed)
- Message: Summary of changes
- Context: Source (Jira, Monday, etc.), projects affected
- Action: "Details" → opens sync details modal

**Variants:**
- Success: neutral styling
- Partial (with warnings): warning styling
- Failed: danger styling with retry action

### 5.5 Activity Updates

**Trigger:** Significant task/project updates

**Content:**
- Title: Item name
- Message: What changed (status, assignee, etc.)
- Context: Project, who made the change
- Action: "View" → navigates to item

**Filter Options:** Users can control which activity updates generate notifications in Settings.

---

## 6. Interactions & States

### 6.1 Real-time Updates

- Use WebSocket or polling for new notifications
- New notifications slide in at top with subtle animation
- Unread count in header updates immediately
- Optional: toast notification for critical risks

### 6.2 Mark as Read

**Single notification:**
- Click card → mark as read + navigate to action URL
- Click "Dismiss" → mark as read, stay on page
- Hover → show "Mark read" icon button

**Bulk actions:**
- "Mark all read" button in header
- Select multiple (future enhancement)

### 6.3 Dismiss vs. Archive

- "Dismiss" marks as read and hides from feed
- "Clear read" removes all read notifications from current view
- Notifications are never truly deleted (audit trail)

### 6.4 Filter Persistence

- Active filters persist in URL query params
- Shareable filtered views (e.g., `/notifications?type=risk&project=abc`)

### 6.5 Keyboard Navigation

| Key | Action |
|-----|--------|
| `j` / `↓` | Next notification |
| `k` / `↑` | Previous notification |
| `Enter` | Open/navigate to notification |
| `x` | Dismiss notification |
| `r` | Mark as read |
| `Shift+R` | Mark all as read |

---

## 7. Data Requirements

### 7.1 API Endpoints

**GET /api/notifications**
```typescript
// Query params
{
  type?: 'risk' | 'mention' | 'scout' | 'sync' | 'activity';
  projectId?: string;
  since?: string;      // ISO date
  limit?: number;      // default 20
  cursor?: string;     // pagination cursor
  unreadOnly?: boolean;
}

// Response
{
  notifications: Notification[];
  nextCursor: string | null;
  unreadCount: number;
}
```

**PATCH /api/notifications/:id**
```typescript
// Body
{ isRead: boolean }
```

**PATCH /api/notifications/mark-all-read**
```typescript
// Body (optional filters)
{ type?: string; projectId?: string }
```

### 7.2 Data Model

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'risk' | 'mention' | 'scout' | 'sync' | 'activity';
  severity?: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  context: {
    projectId?: string;
    projectName?: string;
    taskId?: string;
    sourceType?: 'jira' | 'monday' | 'asana' | 'native';
    userId?: string;
    userName?: string;
  };
  actionUrl: string;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
  readAt?: string;
}
```

### 7.3 Real-time Subscription

WebSocket event: `notification:new`
```typescript
{
  type: 'notification:new';
  payload: Notification;
}
```

---

## 8. Edge Cases

| Case | Handling |
|------|----------|
| No notifications | Show empty state with CTA |
| All filtered results empty | "No {type} notifications" message |
| Failed to load | Error state with retry button |
| Notification source deleted | Show notification but gray out action, note "Item no longer exists" |
| Very long notification message | Truncate at 2 lines with ellipsis, full text on hover/click |
| 100+ unread | Show "99+" in badge |
| Bulk sync creates many notifications | Group into single "Sync complete: X items updated" |
| User mentioned in their own comment | Don't create self-mention notification |

---

## 9. Mobile Considerations

### 9.1 Responsive Layout

**Breakpoint: < 768px (md)**

- Full-width notification cards
- Filter tabs scroll horizontally
- Secondary filters collapse into "Filter" button → opens bottom sheet
- Swipe actions: swipe left to dismiss, swipe right to mark read

### 9.2 Mobile Wireframe

```
┌─────────────────────────────────┐
│ ← Notifications          [...] │
│ 12 unread                       │
├─────────────────────────────────┤
│ [All][Risks][Mentions][Scout]→  │
├─────────────────────────────────┤
│ TODAY                           │
│ ┌─────────────────────────────┐ │
│ │ ● 🔴 Risk Alert       2m    │ │
│ │ Auth Service blocked...     │ │
│ │ Payments Portfolio          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ● 💬 Mention         15m    │ │
│ │ Sarah mentioned you...      │ │
│ │ API Integration             │ │
│ └─────────────────────────────┘ │
│                                 │
│ YESTERDAY                       │
│ ...                             │
└─────────────────────────────────┘
```

### 9.3 Touch Interactions

- Tap card → view notification
- Long press → context menu (mark read, dismiss, share)
- Pull to refresh

---

## 10. Accessibility

- All notifications accessible via keyboard
- Screen reader announces new notifications
- Unread indicator has `aria-label="Unread notification"`
- Filter tabs use proper `role="tablist"` and `role="tab"`
- Notification cards are `role="article"` with proper headings
- Dismiss buttons have `aria-label="Dismiss notification: {title}"`

---

## 11. Analytics Events

| Event | Properties |
|-------|------------|
| `notifications_viewed` | `unread_count`, `filter_type`, `filter_project` |
| `notification_clicked` | `notification_id`, `notification_type`, `is_unread` |
| `notification_dismissed` | `notification_id`, `notification_type` |
| `notifications_mark_all_read` | `count` |
| `notifications_filtered` | `filter_type`, `filter_project`, `filter_time` |

---

## 12. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Real-time delivery mechanism: polling interval and backoff strategy? | Engineering | V1 uses polling (see TECHNICAL_DECISIONS.md N1). SSE in V2. |
| 2 | Notification producer pipeline: which domain events trigger which notification types? | Engineering + Product | Event mapping needs formal definition before build. |
| 3 | Notification preferences: exact toggle set for V1? | Product | See TECHNICAL_DECISIONS.md N4 for minimum viable set. |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Notifications Center provides a unified, actionable feed that keeps PMs informed without information overload.*
