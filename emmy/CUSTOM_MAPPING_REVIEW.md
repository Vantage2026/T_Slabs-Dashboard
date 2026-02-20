# Custom Mapping PRD — Technical Feasibility Review

**Reviewer:** Emmy, Principal Engineer  
**Date:** February 11, 2026  
**Status:** APPROVED WITH MODIFICATIONS  

---

## Executive Summary

Jeff's Custom Mapping PRD solves a real problem (only 20% of Jira market addressable without it), and the technical architecture is sound. However, the spec over-engineers the UI layer with unnecessary complexity:

- **Drag-and-drop** → Replace with click-to-assign (simpler, accessible, mobile-friendly)
- **Elaborate preview modal** → Replace with inline count ("34 tasks will update")
- **Confidence scoring** → Cut entirely (adds noise, not signal)
- **Mobile-specific components** → Cut (responsive desktop components are sufficient)
- **First-time wizard flow** → Defer to Phase 2 (settings-only MVP first)

**Good news:** We already have 70% of the backend infrastructure:
- Jira adapter has `normalizeStatus()` with pattern matching
- Jira adapter has `getTransitions()` and `transitionTask()` for write-back
- `FieldMapping` schema exists (needs extension for status mappings)
- Jira Cloud API v3 provides field metadata with display names

**Build time (AI agent):** 4-6 days total, not 4 weeks.

---

## 1. Jira API Feasibility

### ✅ Field Metadata API — Available
```
GET /rest/api/3/field
```
Returns all fields with `id`, `name`, `schema.type`. Custom fields include human-readable names ("Story Points", not "customfield_10024"). **PRD assumption is correct.**

### ✅ Workflow/Status API — Available
```
GET /rest/api/3/project/{projectId}/statuses
GET /rest/api/3/status
```
Returns all statuses with `id`, `name`, `statusCategory.key`. The category maps to "new", "indeterminate", "done" — our fallback for unmapped statuses. **PRD assumption is correct.**

### ✅ Transitions API — Already Implemented
We have `getTransitions()` and `transitionTask()` in `jira.ts`. The PRD's "transition resolution algorithm" is already mostly implemented. **No new work needed for basic write-back.**

### ⚠️ Field Options API — Needs New Endpoint
For priority/type value mapping, we need to fetch allowed values:
```
GET /rest/api/3/priority
GET /rest/api/3/issuetype
```
**New adapter methods needed:** `listPriorities()`, `listIssueTypes()`, `getFieldOptions(fieldId)`.

---

## 2. Schema Changes

### Current FieldMapping Model
```prisma
model FieldMapping {
  connectionId String
  sourceField  String   // e.g., "customfield_10024"
  sourceLabel  String   // Human-readable label
  targetField  String   // Vantage field
  transform    String?  // Value mapping JSON
  enabled      Boolean
}
```

### Required Changes

**Option A: Extend Existing Model (Recommended)**
```prisma
model FieldMapping {
  connectionId String
  mappingType  String   @default("field") // "field" | "status" | "priority_value" | "type_value"
  sourceField  String   // Field ID or status name
  sourceValue  String?  // For value mappings (e.g., "Waiting for Client")
  sourceLabel  String   // Human-readable
  targetField  String   // Vantage field (e.g., "status", "dueDate")
  targetValue  String?  // For value mappings (e.g., "blocked")
  transform    String?  // Legacy JSON transform (deprecated, migrate to targetValue)
  enabled      Boolean  @default(true)
  autoDetected Boolean  @default(false)
  
  @@unique([connectionId, mappingType, sourceField, sourceValue])
}
```

**Migration strategy:** Add new columns as nullable, backfill existing rows with `mappingType: "field"`, then make required.

**Why not Jeff's enum?** Prisma enums require migrations for new values. A string field with validation is more flexible for future mapping types.

---

## 3. What to Cut

### ❌ Cut: Drag-and-Drop Status Buckets
**Why:** HTML5 drag-and-drop is accessibility-hostile, breaks on touch devices, and adds significant complexity for marginal UX gain.

**Replace with:** Click-to-assign. Each Jira status has a dropdown showing Vantage statuses. One click to change. Mobile-friendly. Screen-reader compatible.

```tsx
// Instead of drag buckets:
function StatusMappingRow({ jiraStatus, currentMapping, onSelect }) {
  return (
    <div className="flex items-center justify-between p-3 border-b border-neutral-200">
      <span className="text-sm text-neutral-900">{jiraStatus.name}</span>
      <select
        value={currentMapping || ''}
        onChange={(e) => onSelect(jiraStatus.name, e.target.value)}
        className="px-3 py-1.5 border border-neutral-200 rounded-lg text-sm"
      >
        <option value="">— Unmapped —</option>
        <option value="backlog">📥 Backlog</option>
        <option value="todo">📋 To Do</option>
        <option value="in_progress">🔄 In Progress</option>
        <option value="in_review">👀 In Review</option>
        <option value="done">✅ Done</option>
        <option value="blocked">🚫 Blocked</option>
      </select>
    </div>
  );
}
```

### ❌ Cut: Preview Modal with Sample Tasks
**Why:** Fetching and displaying sample tasks adds API latency, requires task-level computation, and provides marginal value over a simple count.

**Replace with:** Inline impact count above the save button.

```tsx
// Instead of modal with sample tasks:
function MappingImpactBanner({ changedCount, totalCount }) {
  return (
    <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg text-sm mb-4">
      <strong>{changedCount}</strong> of {totalCount} tasks will update when you save.
    </div>
  );
}
```

### ❌ Cut: Confidence Scoring
**Why:** "High/medium/low" confidence labels add UI clutter without actionable value. Users either accept the auto-detection or change it — they don't care about our confidence.

**Keep:** Auto-detection. Just don't expose the confidence score.

### ❌ Cut: Mobile-Specific Components
**Why:** The desktop components (with click-to-assign instead of drag-drop) work fine on mobile with standard responsive sizing. No need for separate `MobileStatusBucket` etc.

### ❌ Cut: First-Time Setup Wizard
**Why:** A wizard flow interrupting OAuth completion adds friction and complexity. Users can configure mappings in settings.

**Defer to Phase 2:** If user feedback shows wizard demand, add it then.

### ❌ Cut: `MappingType` Enum
**Why:** Enums require schema migrations to extend. A validated string is more flexible.

---

## 4. What to Keep

### ✅ Keep: Auto-Detection Logic
The PRD's `STATUS_PATTERNS` and `FIELD_PATTERNS` are solid. However, **we already have this in `jira.ts`!** The adapter's `normalizeStatus()` has a comprehensive pattern map. Reuse it.

```typescript
// Already exists in jira.ts:normalizeStatus()
const nameMap: Record<string, UnifiedStatus> = {
  "waiting for client": "blocked",
  "on hold": "blocked",
  // ... 40+ patterns
};
```

**Action:** Extract pattern maps from adapter to a shared module. Use them for:
1. Auto-detecting mappings on first sync
2. Falling back when no explicit mapping exists

### ✅ Keep: Visual Status Mapping Editor (Simplified)
A settings page showing all Jira statuses with dropdown selectors for Vantage status. No drag-drop, no buckets.

### ✅ Keep: Visual Field Mapping Editor
Show Vantage fields (Due Date, Start Date, Priority, Estimate) with dropdown selectors populated from Jira field metadata.

### ✅ Keep: Bidirectional Write-Back
When user changes status in Vantage → look up mapping → find transition → execute. We have 90% of this; just need to consult FieldMapping before calling `transitionTask()`.

### ✅ Keep: Unmapped Status Warning
Banner showing "X tasks have unmapped statuses" with link to settings. Simple, useful.

### ✅ Keep: Schema Extension for MappingType
Add `mappingType` column to distinguish status mappings from field mappings.

---

## 5. Dark Mode Compliance

### Issues in PRD Components

| Component | Issue | Fix |
|-----------|-------|-----|
| `MappingCard` | `bg-white` hardcoded | Use `bg-white` (we have CSS override) |
| `MappingCard` | `border-neutral-100` | Change to `border-neutral-200` |
| `StatusBucket` | `bg-neutral-100` for empty state | Change to `bg-neutral-200` |
| `StatusChip` | `bg-white border-neutral-200` | Fine (CSS override handles bg-white) |
| `MappingPreviewModal` | `bg-black/50` backdrop | Fine |
| Jira icon container | `bg-[#0052CC]` hardcoded | Add dark mode override in globals.css |

### Required CSS Addition
```css
/* globals.css */
html[data-theme="dark"] .bg-\[\#0052CC\] {
  background-color: #1d4ed8 !important; /* Brighter blue on dark */
}
```

### ⚠️ Do NOT Use
- `dark:` Tailwind prefix (doesn't work with our system)
- `border-neutral-100` for visible borders (too faint in dark mode)
- `hover:bg-neutral-100` (use `hover:bg-neutral-200/30`)

---

## 6. Build Order (AI Agent)

### Phase 1: Schema + API (Day 1)

1. **Migrate FieldMapping schema**
   - Add `mappingType`, `sourceValue`, `targetValue`, `autoDetected` columns
   - Write migration script for existing rows
   - Update unique constraint

2. **Add Jira metadata endpoints**
   - `GET /api/connections/:id/jira/fields` — proxy to Jira field API
   - `GET /api/connections/:id/jira/statuses` — proxy to Jira status API
   - Add `listPriorities()`, `listIssueTypes()` to Jira adapter

3. **Extract auto-detection patterns**
   - Move `nameMap` from `jira.ts:normalizeStatus()` to `lib/mappings/patterns.ts`
   - Export `autoDetectStatusMapping(jiraStatuses)` function
   - Export `autoDetectFieldMapping(jiraFields)` function

### Phase 2: Status Mapping UI (Day 2)

4. **New route: `/settings/connections/[id]/status-mapping`**
   - Fetch Jira statuses via new API
   - Fetch existing status mappings from FieldMapping
   - Render table: Jira status → Vantage status dropdown
   - Save button → upsert FieldMapping rows with `mappingType: "status"`

5. **Auto-detect on first load**
   - If no status mappings exist, call `autoDetectStatusMapping()`
   - Pre-fill the form with auto-detected values
   - Show "Auto-detected, review and save" banner

### Phase 3: Field Mapping UI (Day 3)

6. **New route: `/settings/connections/[id]/field-mapping`**
   - Fetch Jira fields via new API (filter by data type compatibility)
   - Show Vantage fields (dueDate, startDate, estimate, priority, labels)
   - Dropdown selectors populated with compatible Jira fields
   - Save button → upsert FieldMapping rows with `mappingType: "field"`

7. **Value mapping for priority**
   - If user maps priority field, show secondary "Map Values" button
   - Modal: Jira priority names → Vantage priority dropdowns
   - Save as FieldMapping rows with `mappingType: "priority_value"`

### Phase 4: Adapter Integration (Day 4)

8. **Modify `normalizeStatus()` to consult mappings**
   - Load FieldMapping rows with `mappingType: "status"` for connection
   - Check explicit mapping first, fall back to pattern matching
   - Cache mappings in memory (invalidate on settings save)

9. **Modify `normalizeIssue()` to consult field mappings**
   - Load FieldMapping rows with `mappingType: "field"` for connection
   - Apply custom field mappings (e.g., `customfield_10024` → `dueDate`)

10. **Modify `transitionTask()` to respect reverse mappings**
    - When user sets Vantage status → look up mapped Jira statuses
    - Find transition that reaches one of those statuses
    - Already implemented logic, just needs to consult FieldMapping

### Phase 5: Polish (Day 5-6)

11. **Unmapped status warning**
    - On sync, detect tasks with unmapped Jira statuses
    - Store count in SyncLog metadata
    - Show banner on dashboard: "X tasks have unmapped statuses"

12. **Connection settings restructure**
    - Add tabs: Overview | Status Mapping | Field Mapping | Sync Settings
    - Move existing field-mappings page content to new location
    - Update navigation

13. **Dark mode pass**
    - Audit all new components for `border-neutral-100` → `border-neutral-200`
    - Add Jira brand color dark override to globals.css

---

## 7. Deferred to Phase 2

| Feature | Reason | Trigger |
|---------|--------|---------|
| First-time setup wizard | Adds onboarding friction | User feedback requests it |
| Drag-and-drop buckets | Accessibility/mobile issues | Power user demand |
| Preview modal with sample tasks | Marginal value vs. complexity | User confusion with counts |
| Per-project workflow overrides | Complexity explosion | Enterprise customer request |
| Mapping version history | Audit trail overkill | Enterprise/compliance requirement |

---

## 8. Open Questions (Resolved)

### Q1: Per-project or per-connection mappings?
**A:** Per-connection for MVP. Jira allows different workflows per project, but most orgs use 1-3 workflows total. Per-project adds 10x complexity for 10% of users. Add override capability in Phase 2 if needed.

### Q2: What about transitions that require resolution?
**A:** Jira transitions to "Done" often require a resolution field. For MVP, attempt the transition and surface the error gracefully: "Couldn't close in Jira: resolution required. Update in Jira directly." Phase 2: detect required fields and prompt.

### Q3: Re-sync after mapping change?
**A:** Yes, trigger sync immediately after save. Show progress indicator. If user wants to batch changes, they can toggle mappings off, make changes, toggle back on.

---

## 9. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Jira field API missing custom field names | Low | High | Test with real customer Jira instance |
| Mapping cache staleness | Medium | Medium | Invalidate cache on settings save, on webhook config change |
| Transition failures on status change | Medium | Medium | Clear error message, link to Jira, log for debugging |
| Performance with 50+ Jira statuses | Low | Low | Pagination, but most orgs have <20 |

---

## 10. Final Verdict

**Build this.** The core problem is real, the API support exists, and most of the backend infrastructure is already in place. Jeff's UX vision is correct at the conceptual level but over-specced at the implementation level.

**Cut the drag-and-drop, cut the preview modal, cut the wizard.** Build a clean settings page with dropdowns. Ship in 1 week, iterate based on feedback.

---

*This review is ready for implementation. Assign to AI agent with this document as spec.*
