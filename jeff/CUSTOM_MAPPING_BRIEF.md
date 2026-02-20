# Custom Field Mapping — Product Brief for Jeff

## The Problem

Vantage currently hardcodes how Jira fields map to our internal model. This breaks for any org that doesn't use default Jira configuration:

- **Status**: We hardcode "Blocked" → blocked, "On Hold" → blocked, etc. But many orgs have custom status names like "Waiting for Client", "Parked", "Needs Review" that should also map to blocked.
- **Due Date**: We hardcode `fields.duedate`. But orgs often use custom fields like "Target Tech Completion Date" (`customfield_10024`), "Release Date", or "Client Deadline" as their real due date.
- **Start Date**: We hardcode `customfield_10015`. But every Jira instance uses a different custom field ID.
- **Status transitions**: When a user moves a ticket to "Blocked" in Vantage, we need to execute the correct Jira transition. But which Jira status corresponds to our "Blocked"? It depends on the org's workflow.

**Bottom line**: Without custom mappings, Vantage only works for teams with vanilla Jira. That's ~20% of the market. The other 80% will churn.

## What Exists Today

### Database Schema
```prisma
model FieldMapping {
  id           String   @id @default(cuid())
  connectionId String
  sourceField  String   // e.g., "customfield_10024"
  sourceLabel  String   // Human-readable
  targetField  String   // "status" | "priority" | "dueDate" | "startDate" | etc.
  transform    String?  // JSON value mapping: {"In QA": "in_review"}
  enabled      Boolean  @default(true)
}
```

### Settings Page
`/settings/field-mappings` — Basic CRUD UI for mappings. Functional but not user-friendly:
- User must know the Jira custom field ID
- No field discovery / auto-detection
- No visual indication of what's mapped vs. unmapped
- No preview of how values will transform
- No status transition mapping

### Jira Adapter
- Has `getTransitions()` and `transitionTask()` for write-back
- Has `normalizeStatus()` with hardcoded status name → unified status mapping
- Has `denormalizeToJira()` for write-back with hardcoded field names
- Does NOT read from the `field_mappings` table at all

### API Routes
- CRUD for field_mappings exists (`/api/field-mappings`)
- We also have Jira's field metadata API access for discovery

## What We Need You to Design

### 1. Status Mapping Configuration
The admin needs to:
- See all their Jira workflow statuses (fetched from Jira's API)
- Map each one to a Vantage status (backlog, todo, in_progress, in_review, done, blocked)
- This mapping is BIDIRECTIONAL: reads use it to normalize, writes use it to find the right Jira transition
- Handle the fact that Jira workflows are per-project (different projects can have different statuses)
- Preview: "When a Jira task is in 'Waiting for Client', Vantage will show it as 'Blocked'"

### 2. Field Mapping Configuration
The admin needs to:
- See available Jira fields (standard + custom) — fetched from Jira's field metadata API
- Map Jira fields to Vantage fields (dueDate, startDate, estimate, priority, labels, etc.)
- Some fields need VALUE transforms too (e.g., Jira priority "P0" → Vantage "critical")
- This must also be bidirectional for write-back

### 3. The UX Challenge
- Non-technical project managers will be configuring this
- They don't know what `customfield_10024` means
- They DO know what "Target Tech Completion Date" means
- The UI must show human-readable Jira field names (Jira's API provides display names)
- Smart defaults: auto-detect common patterns (e.g., if a Jira field is named "Due Date" or "Target Date", suggest it as the due date mapping)
- Guided setup: Walk the admin through essential mappings on first connection (status, due date, start date, priority)

### 4. Status Transition Write-Back
When a user changes a ticket's status in Vantage:
- We need to know which Jira transition to execute
- Jira transitions are directional (you can only go from certain statuses to certain others)
- The admin's status mapping tells us WHICH Jira status corresponds to each Vantage status
- We then use Jira's transitions API to find the right transition to get there
- If no valid transition exists (e.g., can't go directly from "Done" to "In Progress"), we need to handle that gracefully

## Constraints

- **Dark mode first** — Use CSS variables, Tailwind semantic classes
- **Must work for Jira, Monday, and Asana** — The mapping schema is source-agnostic, but the field discovery API differs per tool
- **Must be backwards-compatible** — Existing hardcoded mappings should serve as defaults that can be overridden
- **Must handle edge cases**: What if the admin deletes a mapping? What if Jira adds new statuses? What if two Jira statuses map to the same Vantage status (that's fine)? What if a Vantage status has no Jira equivalent (should warn)?
- **Must be per-connection** — Different Jira instances can have different mappings

## Competitive References

- **Linear Settings → Integrations → Jira**: Clean mapping of Linear statuses ↔ Jira statuses
- **Notion's Jira Sync**: Visual status mapping with drag-and-drop
- **Zapier/Make field mapping**: Two-column picker with auto-suggest
- **Fivetran schema mapping**: Source ↔ destination field matching

## Deliverable

Output a PRD to: `/Users/tyleraberg/Desktop/untitled folder/jeff/CUSTOM_MAPPING_PRD.md`

Include:
1. Exact UX flow for first-time setup (guided wizard vs. settings page)
2. Exact UX flow for ongoing management
3. Status mapping UI spec with visual treatment
4. Field mapping UI spec with visual treatment
5. How auto-detection works
6. Error states and edge cases
7. Component specs with Tailwind classes
8. Data model changes (if any beyond existing schema)

**This is the feature that determines whether orgs adopt or abandon Vantage. Make it effortless.**
