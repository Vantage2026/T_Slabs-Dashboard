# Current Sprint Commitment Box
## Business Requirements Document (BRD)

**Author:** Jeff, SVP Product  
**Version:** 1.0  
**Date:** February 2025  
**Status:** Draft for Engineering Review

---

## Executive Summary

Every project detail page answers "what does this cost?" We need to equally answer **"what is this team actually doing right now?"**

The **Current Sprint Commitment Box** is a prominent, always-visible component on project detail pages that shows the real-time state of what's committed and in-flight for the active sprint. It bridges the gap between engineering execution data (Jira) and stakeholder visibility (Vantage).

**Why it matters:** Leaders make resourcing and prioritization decisions based on what they *think* teams are working on. That mental model is usually wrong or stale. This feature creates a shared, trusted, always-current view of sprint reality.

**Target outcome:** Any stakeholder can glance at a project and know in <5 seconds: What's committed? What's actually happening? Is the sprint healthy or at risk?

---

## 1. Problem Framing & Audience Communication

### The Core Problem

Sprint commitment is invisible outside Jira. This creates cascading communication failures:

| Symptom | Impact |
|---------|--------|
| "What's the team working on?" triggers Slack threads | Engineer context-switching, PM overhead |
| Execs see roadmap items, not execution reality | Misaligned expectations, surprise delays |
| Scope changes happen silently mid-sprint | No audit trail, broken trust |
| "We committed to X" means different things to different people | Endless definition debates |
| Carryover accumulates without visibility | Technical debt becomes invisible |

### Why This Matters by Audience

#### For Developers & Tech Leads
**Need:** "Don't make me explain what I'm working on in three different systems."

**Value:**
- Single source of truth they can point stakeholders to
- Reduces "quick status update" interruptions
- Makes commitment/scope-change decisions visible (covers their back)
- Highlights blocked work to drive faster unblocking

**What they see:** Detailed ticket-level view, accurate status, blocker callouts

---

#### For Engineering Managers & PMs
**Need:** "Is this sprint on track? Where should I intervene?"

**Value:**
- At-a-glance sprint health without opening Jira
- Early warning on at-risk items
- Scope change audit trail for retros
- Velocity context for planning

**What they see:** Completion %, at-risk indicators, scope change log, trend vs. baseline

---

#### For Directors & VPs
**Need:** "Are my teams executing on what we agreed to?"

**Value:**
- Portfolio-level execution visibility
- Commitment reliability metrics over time
- Cross-team comparison (who delivers on commit?)
- Confidence for board/exec reporting

**What they see:** Health score, commit vs. delivered ratio, risk flags, narrative summary

---

#### For Executives & Stakeholders
**Need:** "Is Project X going to ship what was promised?"

**Value:**
- 5-second health check without drilling into details
- Trust that the data reflects reality
- Early warning before surprises
- Simple language, not Jira jargon

**What they see:** Traffic light status, one-line summary, "on track" / "at risk" / "off track"

---

### Communication Design Principle

**Progressive disclosure by role:**
```
Executive:      🟢 On Track | "7 of 8 committed items in progress or done"
     ↓ click
Director:       Sprint Health 87% | 2 items at risk | 1 scope addition
     ↓ click  
Manager:        [Full breakdown table with status, assignees, blockers]
     ↓ click
Engineer:       [Jira ticket detail, linked in context]
```

Same data, four levels of abstraction. Every level is accurate — just different density.

---

## 2. UX Design: The Box

### Placement & Prominence

**Location:** Project detail page, right column, pinned to top (above cost breakdown)

**Rationale:** Sprint commitment is "what's happening now" — it deserves prime real estate. Cost is "what it costs" — important but secondary to execution visibility.

**Responsive behavior:**
- Desktop: Right column, 360px fixed width
- Tablet: Full width, collapsed by default with expand
- Mobile: Card in main flow, summary only with tap-to-expand

---

### Box Anatomy

```
┌─────────────────────────────────────────────────────────────┐
│  📋 Current Sprint                                     ⚙️   │
│  Sprint 47 · Feb 10–24 · Day 8 of 14                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🟢 On Track                                        │   │
│  │  Sprint health: 84%                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Committed        8 items    ████████░░   75% complete     │
│  In Flight        3 items    actively being worked         │
│  At Risk          1 item     blocked > 24h                 │
│  Done             5 items    ✓ completed this sprint       │
│                                                             │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  ⚠️ 1 scope addition since sprint start                    │
│  📊 Velocity trend: +12% vs. 4-sprint avg                  │
│                                                             │
│  [View Full Sprint →]        [Sprint History ↓]            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Header Row
| Element | Content | Interaction |
|---------|---------|-------------|
| Sprint icon | 📋 | — |
| Title | "Current Sprint" | — |
| Sprint name | "Sprint 47" | Hover: shows sprint goal if set |
| Date range | "Feb 10–24" | — |
| Progress | "Day 8 of 14" | — |
| Settings gear | ⚙️ | Opens sprint config (thresholds, alerts) |

#### Health Banner
| State | Color | Icon | Text |
|-------|-------|------|------|
| On Track | Green | 🟢 | "On Track" |
| At Risk | Amber | 🟡 | "At Risk" |
| Off Track | Red | 🔴 | "Off Track" |
| No Data | Gray | ⚪ | "Syncing..." or "No sprint active" |

**Health score calculation:** See Section 3.

#### Metrics Grid

| Metric | Definition | Display |
|--------|------------|---------|
| **Committed** | Items in sprint at commitment point | Count + progress bar + % complete |
| **In Flight** | Items with status = "In Progress" equivalent | Count + descriptor |
| **At Risk** | Items blocked, stale, or unlikely to complete | Count + severity hint |
| **Done** | Items completed within this sprint | Count + checkmark |

#### Context Row

| Element | When Shown | Purpose |
|---------|------------|---------|
| Scope change indicator | If items added/removed post-commit | Audit trail |
| Velocity trend | Always (if 4+ sprints of history) | Execution context |
| Blocker callout | If any item blocked > threshold | Drive action |

#### Action Row

| Button | Action |
|--------|--------|
| "View Full Sprint" | Opens slide panel with full ticket list |
| "Sprint History" | Dropdown showing last 5 sprints with mini health scores |

---

### Visual States

#### State: Healthy Sprint
```
🟢 On Track
Sprint health: 91%
8 committed · 6 done · 2 in flight · 0 at risk
```

#### State: Minor Risk
```
🟡 At Risk
Sprint health: 68%
8 committed · 4 done · 2 in flight · 2 at risk
⚠️ 2 items blocked — may not complete
```

#### State: Significant Risk
```
🔴 Off Track
Sprint health: 42%
8 committed · 2 done · 1 in flight · 5 at risk
🚨 Sprint goal unlikely to be met
```

#### State: No Active Sprint
```
⚪ No Active Sprint
Last sprint ended Feb 10
Next sprint starts Feb 12
[View Last Sprint →]
```

#### State: Data Syncing
```
⚪ Syncing...
Last updated: 2 minutes ago
Jira connection healthy ✓
```

---

### Interaction Patterns

#### Hover States
| Element | Hover Behavior |
|---------|----------------|
| Committed count | Tooltip: "8 items committed at sprint start. 1 added, 0 removed since." |
| At Risk count | Tooltip: List of at-risk items with reason |
| Health score | Tooltip: "Based on: completion rate, blocker time, scope stability" |
| Progress bar | Tooltip: "6 of 8 items complete (75%)" |

#### Click Behaviors
| Element | Click Action |
|---------|--------------|
| Health banner | Opens health breakdown panel |
| Any metric row | Opens filtered ticket list (e.g., "At Risk" shows only at-risk items) |
| Scope change indicator | Opens scope change log |
| Velocity trend | Opens velocity chart overlay |
| Individual ticket (in expanded view) | Opens Jira ticket in new tab |

---

## 3. Key Metrics & Definitions

### Core Status Definitions

#### Committed
**Definition:** Items present in the sprint at the **commitment baseline point**.

**Commitment baseline:** Captured at:
- Sprint start (default), OR
- First standup after sprint start (configurable), OR  
- Manual "lock commitment" action by PM

**Includes:**
- All issues in sprint at baseline, regardless of type (story, bug, task, subtask handling configurable)
- Excludes: Subtasks (rolled into parent), or include if configured

**Data source:** Jira sprint membership at baseline timestamp

---

#### In Flight
**Definition:** Items actively being worked — not waiting, not done.

**Criteria:**
- Status category = "In Progress" (Jira status category mapping)
- AND status changed within last 48 hours (configurable staleness threshold)
- AND not blocked

**Display:** Count + "actively being worked"

**Why "last 48 hours" matters:** An item marked "In Progress" but untouched for 5 days isn't truly in flight — it's stale. We surface this.

---

#### At Risk (In Sprint)
**Definition:** Items unlikely to complete within the sprint without intervention.

**Risk triggers (any of):**
| Trigger | Threshold | Severity |
|---------|-----------|----------|
| Blocked | Flagged blocked in Jira | High |
| Stale in progress | No status change > 48h while "In Progress" | Medium |
| Late start | Not started with <30% sprint time remaining | Medium |
| High estimate, late start | >5 story points AND not started at sprint midpoint | High |
| Repeated carryover | Carried over from 2+ previous sprints | Medium |

**Display:** Count + primary risk reason

---

#### Off-Commit Work
**Definition:** Work happening that wasn't part of original commitment.

**Categories:**
| Type | Definition | Display |
|------|------------|---------|
| **Scope addition** | Item added to sprint after baseline | "⚠️ +2 items added" |
| **Scope removal** | Item removed from sprint after baseline | "📤 1 item removed" |
| **Unplanned work** | Item created AND added to sprint after baseline | "🆕 1 unplanned item" |
| **Stretch goals** | Items explicitly tagged as stretch (not committed) | Shown separately |

**Why this matters:** Scope change is the #1 cause of sprint failure and trust erosion. Making it visible creates accountability.

---

### Health Score Calculation

**Sprint Health Score (0-100):**

```
health_score = (
    completion_component × 0.40 +
    progress_component × 0.25 +
    risk_component × 0.20 +
    stability_component × 0.15
)
```

| Component | Calculation | Weight |
|-----------|-------------|--------|
| **Completion** | (done_items / committed_items) × 100 | 40% |
| **Progress** | (done + in_flight) / committed × 100, adjusted for sprint day | 25% |
| **Risk** | 100 - (at_risk_items / committed_items × 100 × 2) | 20% |
| **Stability** | 100 - (scope_changes / committed_items × 100) | 15% |

**Progress adjustment:** Expected progress = sprint_day / sprint_length × 100. Actual progress compared to expected, normalized.

**Health thresholds:**
| Score | Status | Color |
|-------|--------|-------|
| 75-100 | On Track | Green 🟢 |
| 50-74 | At Risk | Amber 🟡 |
| 0-49 | Off Track | Red 🔴 |

---

### Metric Freshness

| Metric | Update Frequency | Staleness Indicator |
|--------|------------------|---------------------|
| Status counts | Real-time (webhook) or 5-min poll | "Updated X min ago" |
| Health score | Recalculated on any status change | — |
| Scope changes | Real-time (webhook) | — |
| Velocity trend | Daily recalculation | — |

---

## 4. Drill-Down & Navigation Flows

### Flow 1: Health Score Deep Dive

**Trigger:** Click health banner

**Panel content:**
```
┌─────────────────────────────────────────────────────────────┐
│  Sprint Health Breakdown                              [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overall Health: 84%  🟢                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Component          Score    Weight    Contribution  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Completion         75%      40%       30 pts        │   │
│  │ Progress vs Plan   92%      25%       23 pts        │   │
│  │ Risk Items         85%      20%       17 pts        │   │
│  │ Scope Stability    93%      15%       14 pts        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📈 Health Trend This Sprint                               │
│  [Sparkline showing health score over sprint days]         │
│                                                             │
│  Day 1: 100% → Day 4: 88% → Day 8: 84%                    │
│  ⚠️ Health dropped 4% on Day 6 (blocker added)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 2: At-Risk Items Drill-Down

**Trigger:** Click "At Risk" row

**Panel content:**
```
┌─────────────────────────────────────────────────────────────┐
│  At-Risk Items (2)                                    [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 PROJ-1234: Payment gateway integration                 │
│     Status: In Progress (stale 3 days)                     │
│     Assignee: @maria                                        │
│     Risk: No progress in 72 hours                          │
│     Points: 8                                               │
│     [View in Jira ↗]  [Mark as Blocked]  [Reassign]        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  🟡 PROJ-1456: Update user dashboard                       │
│     Status: To Do                                          │
│     Assignee: @chen                                         │
│     Risk: Not started, 4 days remaining                    │
│     Points: 5                                               │
│     [View in Jira ↗]  [Start Work]  [Remove from Sprint]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 3: Full Sprint View

**Trigger:** Click "View Full Sprint"

**Panel content:**
```
┌─────────────────────────────────────────────────────────────┐
│  Sprint 47 · Full View                                [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [All ▼] [Status ▼] [Assignee ▼] [Risk ▼]         │
│  Sort: [Priority ▼]                                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Key       Title              Status   Pts  Risk     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ PROJ-1201 User auth refactor ✓ Done    3    —       │   │
│  │ PROJ-1202 API rate limiting  ✓ Done    5    —       │   │
│  │ PROJ-1234 Payment gateway    ● In Prog 8   🔴 Stale  │   │
│  │ PROJ-1245 Error handling     ● In Prog 3    —       │   │
│  │ PROJ-1256 Cache layer        ○ To Do   5   🟡 Late   │   │
│  │ PROJ-1267 Logging update     ✓ Done    2    —       │   │
│  │ PROJ-1278 Dashboard fix      ○ To Do   3    —       │   │
│  │ PROJ-1289 Config cleanup     ✓ Done    2    —       │   │
│  │ ─────────────────────────────────────────────────── │   │
│  │ +PROJ-1301 Hotfix: login bug ✓ Done    1   ⚠️ Added │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Committed: 8 (31 pts) · Added: 1 (1 pt) · Removed: 0      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Row interactions:**
- Click row → Expands inline with description, comments preview, linked issues
- Click key → Opens Jira in new tab
- Click assignee → Filters to that assignee
- Click risk indicator → Shows risk reason tooltip

---

### Flow 4: Scope Change Log

**Trigger:** Click scope change indicator

**Panel content:**
```
┌─────────────────────────────────────────────────────────────┐
│  Scope Changes · Sprint 47                            [×]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Summary                                                 │
│  Committed at start: 8 items (31 points)                   │
│  Current: 9 items (32 points)                              │
│  Net change: +1 item (+1 point)                            │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  📅 Feb 14, 2:34 PM                                        │
│  ➕ Added: PROJ-1301 "Hotfix: login bug"                   │
│     By: @sarah (PM)                                         │
│     Reason: Production incident response                    │
│     Points: 1                                               │
│                                                             │
│  📅 Feb 12, 9:15 AM                                        │
│  🔄 Moved: PROJ-1199 "Legacy cleanup"                      │
│     By: @mike (Tech Lead)                                   │
│     Action: Removed → moved to Sprint 48                   │
│     Reason: Dependency not ready                           │
│     Points: 5                                               │
│                                                             │
│  📅 Feb 12, 9:15 AM                                        │
│  ➕ Added: PROJ-1245 "Error handling"                      │
│     By: @mike (Tech Lead)                                   │
│     Reason: Replaces PROJ-1199 (similar effort)            │
│     Points: 3                                               │
│                                                             │
│  [Export Log]                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Flow 5: Sprint History

**Trigger:** Click "Sprint History" dropdown

**Dropdown content:**
```
┌─────────────────────────────────────────┐
│  Recent Sprints                         │
├─────────────────────────────────────────┤
│  Sprint 46 · Jan 27–Feb 9   🟢 92%     │
│  Sprint 45 · Jan 13–26      🟡 71%     │
│  Sprint 44 · Dec 30–Jan 12  🟢 88%     │
│  Sprint 43 · Dec 16–29      🟢 85%     │
│  Sprint 42 · Dec 2–15       🔴 48%     │
├─────────────────────────────────────────┤
│  [View All Sprint History →]            │
└─────────────────────────────────────────┘
```

Click any sprint → Opens that sprint's summary in detail panel (read-only historical view).

---

## 5. Edge Cases

### Edge Case 1: No Active Sprint

**Scenario:** Team uses sprints but none currently active (between sprints, sprint planning day).

**Behavior:**
```
┌─────────────────────────────────────────┐
│  📋 Current Sprint                      │
│  ⚪ No Active Sprint                    │
│                                         │
│  Last sprint: Sprint 46 (ended Feb 9)  │
│  Delivered: 7 of 8 items (87%)         │
│                                         │
│  [View Last Sprint →]                   │
└─────────────────────────────────────────┘
```

**Additional handling:**
- If next sprint scheduled in Jira, show: "Next sprint starts Feb 12"
- If team hasn't run a sprint in 30+ days: "No recent sprint activity"

---

### Edge Case 2: Multiple Active Sprints

**Scenario:** Team runs parallel sprints (e.g., "Sprint 47" and "Sprint 47 - Bugs").

**Behavior:**
- Default: Show the sprint with the most items for this project's team
- If ambiguous: Show sprint selector dropdown
- Config option: Admin can set "primary sprint board" per project

```
┌─────────────────────────────────────────┐
│  📋 Current Sprint  [Sprint 47 ▼]       │
│  Sprint 47 · Feb 10–24 · Day 8 of 14   │
│  ─────────────────────────────────────  │
│  Also active: Sprint 47 - Bugs (3 items)│
└─────────────────────────────────────────┘
```

---

### Edge Case 3: Carryover Items

**Scenario:** Items carried over from previous sprints (incomplete, repeatedly rolled).

**Behavior:**
- Carryover items marked with 🔁 icon
- Carryover count shown in box: "Includes 2 carryover items"
- Items carried 2+ times flagged as at-risk automatically
- Hover tooltip: "This item has been in 3 sprints"

```
│  PROJ-1234 Payment gateway    🔁 In Prog   8   🔴 3rd sprint │
```

**Carryover health impact:** Each carryover item reduces scope stability score by 5%.

---

### Edge Case 4: Mid-Sprint Scope Changes

**Scenario:** Items added or removed after commitment baseline.

**Behavior:**
- Scope changes logged with timestamp, actor, and reason (if provided via Jira comment/field)
- Net change shown: "+2 added, -1 removed (net +1)"
- Scope stability component of health score affected
- Visual indicator on affected items in full sprint view

**Scope change capture:** 
- Jira webhook fires on sprint membership change
- We capture: item key, action (add/remove), timestamp, actor, sprint context
- Reason capture: Look for comment added within 5 min of change, or linked to a specific Jira field

---

### Edge Case 5: Sprint Goal Not Set

**Scenario:** Team doesn't use sprint goals in Jira.

**Behavior:**
- Sprint goal section simply omitted (no empty placeholder)
- Hover on sprint name shows "No sprint goal set" rather than blank tooltip
- Consider: Prompt/education "Teams with sprint goals have 23% higher completion rates"

---

### Edge Case 6: Very Short or Very Long Sprints

**Scenario:** Sprint is 1 day (hotfix sprint) or 6 weeks (unusual cadence).

**Behavior:**
- Progress calculation adapts to actual sprint length
- For <3 day sprints: Simplify to "X of Y complete" without day-by-day progress curve
- For >4 week sprints: Show week number instead of day number
- At-risk thresholds scale with sprint length (e.g., "late start" = <25% time remaining, regardless of absolute days)

---

### Edge Case 7: Jira Connection Lost

**Scenario:** Webhook fails, API token expires, Jira down.

**Behavior:**
```
┌─────────────────────────────────────────┐
│  📋 Current Sprint                      │
│  ⚠️ Data may be stale                   │
│  Last synced: 47 minutes ago            │
│                                         │
│  [Cached data shown with warning]       │
│                                         │
│  [Retry Sync]  [Check Connection →]     │
└─────────────────────────────────────────┘
```

- Show last known good data with staleness warning
- Alert project admin if sync fails >1 hour
- Health score shows "—" (not calculated) if data >4 hours stale

---

### Edge Case 8: Team Uses Kanban, Not Sprints

**Scenario:** Project's Jira board is Kanban (no sprints).

**Behavior:**
- Box transforms to "Current Work" view instead of "Current Sprint"
- Shows: In Progress items, WIP limits, cycle time
- No commitment baseline (Kanban has no sprint commitment)
- Health score based on: WIP compliance, cycle time vs. average, blocker count

```
┌─────────────────────────────────────────┐
│  📋 Current Work (Kanban)               │
│                                         │
│  In Progress: 5 items (WIP limit: 6)   │
│  Avg Cycle Time: 3.2 days              │
│  Blocked: 1 item                        │
│                                         │
│  [View Board →]                         │
└─────────────────────────────────────────┘
```

---

### Edge Case 9: Subtask Handling

**Scenario:** Team uses subtasks heavily; counting them inflates numbers.

**Behavior (configurable):**
- **Default:** Subtasks rolled into parent (parent shows as "in progress" if any subtask in progress)
- **Option A:** Count subtasks separately (for teams that commit to subtasks)
- **Option B:** Ignore subtasks entirely (only count parent issues)

Config in project settings: "Subtask handling: [Roll up | Count separately | Ignore]"

---

### Edge Case 10: Story Points Not Used

**Scenario:** Team doesn't estimate or uses T-shirt sizing.

**Behavior:**
- Switch from points to issue count throughout
- Health calculation uses item count, not weighted by points
- If T-shirt sizing: Offer to map (S=1, M=3, L=5, XL=8) or ignore

```
│  Committed: 8 items (no estimates)      │
│  Progress: 6 of 8 complete (75%)        │
```

---

## 6. Data Contract from Jira

### Required Jira Data

#### Sprint Metadata
| Field | Jira Source | Update Trigger | Required |
|-------|-------------|----------------|----------|
| Sprint ID | `sprint.id` | Sprint created/modified | Yes |
| Sprint Name | `sprint.name` | Sprint modified | Yes |
| Sprint State | `sprint.state` (active/closed/future) | State change | Yes |
| Start Date | `sprint.startDate` | Sprint started | Yes |
| End Date | `sprint.endDate` | Sprint created | Yes |
| Sprint Goal | `sprint.goal` | Sprint modified | No |
| Board ID | `sprint.originBoardId` | — | Yes |

#### Issue Data (per sprint)
| Field | Jira Source | Update Trigger | Required |
|-------|-------------|----------------|----------|
| Issue Key | `issue.key` | — | Yes |
| Issue ID | `issue.id` | — | Yes |
| Summary | `issue.fields.summary` | Issue updated | Yes |
| Status | `issue.fields.status.name` | Transition | Yes |
| Status Category | `issue.fields.status.statusCategory.key` | Transition | Yes |
| Issue Type | `issue.fields.issuetype.name` | — | Yes |
| Assignee | `issue.fields.assignee.displayName` | Assignment change | No |
| Story Points | `issue.fields.customfield_XXXXX` | Estimate change | No |
| Priority | `issue.fields.priority.name` | Priority change | No |
| Labels | `issue.fields.labels` | Label change | No |
| Flagged | `issue.fields.customfield_XXXXX` (flagged) | Flag change | No |
| Created Date | `issue.fields.created` | — | Yes |
| Updated Date | `issue.fields.updated` | Any change | Yes |
| Resolution Date | `issue.fields.resolutiondate` | Resolved | No |
| Sprint Membership | `issue.fields.sprint[]` | Sprint change | Yes |

#### Historical/Changelog Data
| Data Point | Jira Source | Purpose |
|------------|-------------|---------|
| Sprint membership changes | `issue.changelog` filtered for sprint field | Scope change log |
| Status transitions | `issue.changelog` filtered for status field | Staleness detection, cycle time |
| Assignment changes | `issue.changelog` filtered for assignee | — |
| Flag changes | `issue.changelog` filtered for flagged field | Blocker detection |

### Commitment Baseline Capture

**Mechanism:** Snapshot all issues in sprint at baseline timestamp.

**Storage:**
```sql
CREATE TABLE sprint_commitment_baseline (
  id UUID PRIMARY KEY,
  sprint_id VARCHAR(50),
  project_id UUID,
  baseline_timestamp TIMESTAMP,
  baseline_type VARCHAR(20), -- 'auto_start', 'manual_lock', 'first_standup'
  issues JSONB, -- [{issue_key, issue_id, summary, points, status}]
  total_issues INTEGER,
  total_points INTEGER,
  captured_by UUID, -- user if manual
  created_at TIMESTAMP
);
```

**Baseline trigger options:**
1. **Sprint start (default):** Webhook on sprint state → active
2. **Manual lock:** PM clicks "Lock Commitment" in Vantage UI
3. **Scheduled:** X hours after sprint start (configurable)

### Scope Change Tracking

**Storage:**
```sql
CREATE TABLE sprint_scope_change (
  id UUID PRIMARY KEY,
  sprint_id VARCHAR(50),
  project_id UUID,
  issue_key VARCHAR(20),
  issue_id VARCHAR(50),
  change_type VARCHAR(20), -- 'added', 'removed'
  changed_at TIMESTAMP,
  changed_by VARCHAR(255), -- Jira user
  reason TEXT, -- Extracted from comment or field
  points INTEGER,
  created_at TIMESTAMP
);
```

### Sync Architecture

**Primary:** Jira webhooks (real-time)
- `sprint_created`, `sprint_updated`, `sprint_started`, `sprint_closed`
- `jira:issue_updated` (filter for status, sprint, assignee, flagged changes)

**Fallback:** Polling every 5 minutes
- Full sprint refresh for active sprints
- Catch any missed webhooks

**Reconciliation:** Daily full sync
- Compare Vantage state to Jira source of truth
- Log and alert on discrepancies

---

## 7. Confidence & Quality Indicators

### Why Trust Matters

Executives will only use this data for decisions if they trust it. Trust requires:
1. **Accuracy:** Data matches Jira reality
2. **Freshness:** Data is current
3. **Transparency:** Methodology is visible
4. **Consistency:** Same inputs = same outputs

### Confidence Indicators

#### Data Freshness Badge
| Freshness | Display | Color |
|-----------|---------|-------|
| <5 min | "Live" | Green dot |
| 5-30 min | "Updated X min ago" | Green |
| 30-60 min | "Updated X min ago" | Amber |
| >60 min | "⚠️ Data may be stale" | Red |

#### Sync Health Indicator
Visible in settings gear menu:
```
Jira Connection: ✓ Healthy
Last sync: 2 min ago
Webhook status: Active
Issues synced: 847
Sync errors (24h): 0
```

#### Calculation Transparency

**Hover any calculated metric → Show formula:**
```
Health Score: 84%
─────────────────
Completion: 75% × 0.40 = 30
Progress:   92% × 0.25 = 23
Risk:       85% × 0.20 = 17
Stability:  93% × 0.15 = 14
─────────────────
Total: 84%
```

#### Baseline Audit Trail
```
Commitment locked: Feb 10, 9:00 AM (auto)
8 items captured (31 points)
[View baseline snapshot]
```

### Quality Guardrails

| Guardrail | Rule |
|-----------|------|
| No data, no score | Health score = "—" if <50% of expected data available |
| Stale = flagged | Any metric >1 hour old shows warning |
| Calculation visible | Every derived number has hover explainer |
| Baseline immutable | Once captured, baseline cannot be edited (only viewed) |
| Change log permanent | Scope changes logged immutably |

---

## 8. Alerting & Narrative Text

### Alert Types

| Alert | Trigger | Default Recipients | Channel |
|-------|---------|-------------------|---------|
| **Sprint Health Drop** | Health drops >15% in 24h | PM, Tech Lead | Slack, Email |
| **New At-Risk Item** | Item moves to at-risk | Assignee, PM | Slack |
| **Scope Change** | Item added/removed post-baseline | PM, Watchers | In-app, Slack |
| **Blocker Added** | Item flagged as blocked | PM, Tech Lead | Slack |
| **Sprint Off Track** | Health < 50% | PM, Tech Lead, EM | Slack, Email |
| **Carryover Warning** | Item in 3rd+ consecutive sprint | PM, Assignee | In-app |

### Alert Configuration

Per-project settings:
```
Sprint Alerts
─────────────
☑ Health drop notifications    Threshold: 15%
☑ At-risk item notifications   
☑ Scope change notifications   
☐ Daily sprint summary         Time: 9:00 AM
☐ End-of-sprint forecast       Days before: 2

Recipients
─────────
Default: Project watchers
Additional: @pm-team (Slack)
```

### Narrative Text Examples

**Daily summary (optional):**
> **Sprint 47 Daily Update**  
> Day 8 of 14 | Health: 84% 🟢
> 
> ✓ 2 items completed yesterday (PROJ-1267, PROJ-1289)  
> ● 3 items in progress  
> ⚠️ 1 item at risk: PROJ-1234 (blocked 2 days)
> 
> On track to complete 7 of 8 committed items.

**Health drop alert:**
> ⚠️ **Sprint 47 health dropped to 68%** (was 84% yesterday)
> 
> What changed:
> - PROJ-1234 marked as blocked (payment API dependency)
> - PROJ-1256 still not started (4 days remaining)
> 
> [View Sprint →]

**Scope change alert:**
> 📋 **Scope change in Sprint 47**
> 
> ➕ Added: PROJ-1301 "Hotfix: login bug" (1 point)  
> Added by @sarah at 2:34 PM
> 
> Sprint now has 9 items (was 8 committed).
> 
> [View Change Log →]

**End-of-sprint forecast:**
> 📊 **Sprint 47 Forecast** (2 days remaining)
> 
> Likely to complete: 7 of 8 items (87%)  
> At risk of missing: PROJ-1234 (blocked)
> 
> Recommendation: Consider moving PROJ-1234 to Sprint 48 or escalating blocker.
> 
> [View Sprint →]

### In-Box Narrative

The box itself generates contextual narrative:

| Condition | Narrative |
|-----------|-----------|
| All on track | "All 8 items progressing as expected" |
| Minor risk | "7 items on track, 1 needs attention" |
| Significant risk | "Sprint goal at risk — 3 items blocked" |
| Ahead of schedule | "Ahead of plan — 80% complete at sprint midpoint" |
| Scope added | "⚠️ 2 items added since sprint start" |
| High carryover | "3 items carried from previous sprint" |

---

## 9. Rollout Plan

### MVP (Phase 1)
**Timeline:** 6-8 weeks  
**Theme:** Core visibility, read-only

**Scope:**
- [x] Sprint commitment box on project detail page
- [x] Basic health score (completion + progress components only)
- [x] Committed / In Flight / Done / At Risk counts
- [x] Scope change indicator (count only, no log detail)
- [x] Full sprint view (list of tickets)
- [x] Jira integration (single board per project)
- [x] Data freshness indicator

**Explicitly out:**
- Alerting
- Scope change log detail
- Sprint history comparison
- Velocity trending
- Multiple board support
- Kanban mode

**Success criteria:**
- 80% of Jira-connected projects show sprint box
- 50% of PMs view sprint box weekly
- Data freshness <5 min for 95% of updates
- Zero critical sync bugs in production

---

### V2 (Phase 2)
**Timeline:** 4-6 weeks post-MVP  
**Theme:** Actionability + history

**Scope:**
- [ ] Full scope change log with audit trail
- [ ] Sprint history view (last 10 sprints)
- [ ] Alerting (Slack integration, email)
- [ ] Configurable commitment baseline timing
- [ ] Velocity trend chart
- [ ] At-risk drill-down with action buttons
- [ ] Daily summary notifications

**Success criteria:**
- 30% of projects configure alerts
- Scope change log viewed on 25% of sprints
- PMs report time savings in sprint tracking (survey)

---

### V3 (Phase 3)
**Timeline:** 6-8 weeks post-V2  
**Theme:** Intelligence + cross-project

**Scope:**
- [ ] Multiple board/sprint support
- [ ] Kanban mode (WIP, cycle time)
- [ ] Predictive sprint completion forecast
- [ ] Cross-project sprint dashboard (portfolio view)
- [ ] Sprint health benchmarking (vs. org average)
- [ ] Integration with cost data (sprint cost estimate)
- [ ] Custom health score weighting

**Success criteria:**
- Portfolio view adopted by 20% of multi-project orgs
- Forecast accuracy within 15% of actual for 80% of sprints
- Cost-sprint correlation insights surfaced

---

### Future Considerations

- **Standup integration:** Auto-generate standup notes from sprint state
- **Retro insights:** "What contributed to this sprint's success/failure?"
- **Commitment recommendations:** "Based on velocity, consider committing 28 points"
- **Cross-tool support:** Linear, Asana, Shortcut (beyond Jira)
- **AI narrative:** Natural language sprint summaries for exec consumption

---

## 10. Acceptance Criteria

### Functional Requirements

#### F1: Sprint Box Display
| # | Requirement | Priority |
|---|-------------|----------|
| F1.1 | Box displays on all project detail pages with Jira integration | P0 |
| F1.2 | Box shows current sprint name, date range, and day progress | P0 |
| F1.3 | Box shows health score with color-coded status (green/amber/red) | P0 |
| F1.4 | Box shows Committed, In Flight, At Risk, Done counts | P0 |
| F1.5 | Box shows scope change indicator when changes exist | P0 |
| F1.6 | Box shows "No Active Sprint" state when applicable | P0 |
| F1.7 | Box shows data freshness indicator | P0 |
| F1.8 | Box is responsive across desktop/tablet/mobile | P1 |

#### F2: Metrics Calculation
| # | Requirement | Priority |
|---|-------------|----------|
| F2.1 | Health score calculated per formula in Section 3 | P0 |
| F2.2 | Commitment baseline captured at sprint start | P0 |
| F2.3 | At-risk items identified by defined triggers (blocked, stale, late) | P0 |
| F2.4 | Scope changes tracked (add/remove) with timestamp and actor | P0 |
| F2.5 | Carryover items identified and marked | P1 |
| F2.6 | Story points used when available; fallback to issue count | P1 |

#### F3: Drill-Down & Navigation
| # | Requirement | Priority |
|---|-------------|----------|
| F3.1 | Click health banner opens health breakdown panel | P1 |
| F3.2 | Click any metric row opens filtered issue list | P0 |
| F3.3 | Full sprint view shows all tickets with status, points, risk | P0 |
| F3.4 | Click ticket key opens Jira in new tab | P0 |
| F3.5 | Scope change log accessible from scope indicator | P1 |
| F3.6 | Sprint history dropdown shows last 5 sprints | P1 |

#### F4: Data Sync
| # | Requirement | Priority |
|---|-------------|----------|
| F4.1 | Real-time sync via Jira webhooks | P0 |
| F4.2 | Fallback polling every 5 minutes | P0 |
| F4.3 | Sync status visible in box settings | P1 |
| F4.4 | Data freshness <5 min for 95th percentile | P0 |
| F4.5 | Graceful degradation when Jira unavailable (show cached + warning) | P0 |

#### F5: Edge Cases
| # | Requirement | Priority |
|---|-------------|----------|
| F5.1 | Handle no active sprint gracefully | P0 |
| F5.2 | Handle multiple active sprints (show selector) | P1 |
| F5.3 | Handle teams without story points | P0 |
| F5.4 | Handle Jira connection loss | P0 |
| F5.5 | Configurable subtask handling | P2 |
| F5.6 | Support Kanban boards (no sprint mode) | P2 |

### Non-Functional Requirements

| # | Requirement | Target |
|---|-------------|--------|
| NF1 | Box renders in <500ms | P0 |
| NF2 | Sync latency (Jira change → Vantage update) <60 seconds | P0 |
| NF3 | Support 1000+ issues per sprint without degradation | P1 |
| NF4 | 99.5% uptime for sprint data sync | P0 |
| NF5 | Accessibility: WCAG 2.1 AA compliant | P1 |

### Definition of Done (MVP)

- [ ] All P0 functional requirements implemented and tested
- [ ] Unit test coverage >80% for health calculation logic
- [ ] Integration tests for Jira sync pipeline
- [ ] Design review approved
- [ ] Performance benchmarks met
- [ ] Documentation complete (user-facing + internal)
- [ ] 5 beta customers validated feature in staging
- [ ] No P0/P1 bugs open
- [ ] Monitoring and alerting configured for sync health
- [ ] Runbook for common failure scenarios

---

## Summary

The Current Sprint Commitment Box transforms project pages from "what does this cost?" to "what is happening right now?" It's designed to:

1. **Communicate across audiences** — exec sees traffic light, PM sees breakdown, engineer sees tickets
2. **Build trust through transparency** — every number has a source, every calculation is visible
3. **Surface risk early** — blockers, staleness, and scope change can't hide
4. **Create accountability** — commitment baseline + scope log = audit trail
5. **Integrate seamlessly** — Jira data, Vantage presentation, zero context-switching

This is the "pulse" of project execution, visible at a glance.

---

*End of Document*

**Next Steps:**
1. Engineering review for Jira data contract validation
2. Design sprint for box component and drill-down panels
3. Beta customer identification (3-5 teams with active Jira usage)
4. Jira webhook infrastructure planning

**Document Owner:** Jeff, SVP Product  
**Review Cycle:** Weekly until MVP launch
