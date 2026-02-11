# TECHNICAL_DECISIONS.md

> **Canonical technical decisions for Vantage**
> Last updated: 2026-02-08
> Authors: Susan (CTO), Emmy (Principal Engineer)
> Status: APPROVED

---

## Governing Constraint

**All technical decisions must be VENDOR-AGNOSTIC.**

- No tight coupling to Vercel, AWS, or any single cloud provider
- Core business logic must run anywhere (Docker, bare metal, any cloud)
- All external dependencies must be behind swappable interfaces
- No vendor-specific patterns in domain logic

This constraint is non-negotiable per CEO directive.

---

## Cross-Cutting Decisions

### C1: Spec Ambiguity Flagging

| | |
|---|---|
| **Risk** | "No open questions" in specs masks unresolved ambiguity, leading to engineering guesswork. |
| **Decision** | APPROVED WITH MODIFICATION — Require an "Assumptions & Open Questions" section in every spec, but frame it constructively. |
| **Rationale** | "No open questions" is a red flag, not a green light. But rather than pushing back adversarially, we establish a template requirement. Every spec must include this section even if the answer is "None — validated with [stakeholders]." This creates accountability and paper trail. |
| **Scope** | V1 — Process change, immediate |
| **Emmy's caveat** | Jeff is shipping specs fast, which is valuable. Don't make this about blame — make it about shared understanding. I'll draft a spec template we can align on. |

---

### C2: Role-Based Access Control (RBAC)

| | |
|---|---|
| **Risk** | No RBAC definition means every screen has undefined permission behavior, creating security holes and inconsistent UX. |
| **Decision** | APPROVED WITH MODIFICATION — Define 4-tier org-level RBAC for V1, project-level granularity in V2. |
| **Rationale** | 3-tier is too flat. We need: **Owner** (billing, delete org, transfer ownership), **Admin** (manage members, manage integrations, access all data), **Member** (full feature access within permissions), **Viewer** (read-only, no mutations). Org-level in V1 keeps it simple. Project-level permissions are a V2 concern when we have multi-team orgs. |
| **Scope** | V1 — Foundational |
| **Emmy's additions** | Every API endpoint and UI action needs an RBAC annotation in the codebase. I recommend a decorator pattern: `@requiresRole('admin')`. We should also define what "Viewer" means per-screen (can they see individual workloads if that toggle is off?). |

**Permission Matrix (V1):**

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| Mark notifications read | ✓ | ✓ | ✓ | ✓ (own only) |
| Mark all read | ✓ | ✓ | ✓ | ✗ |
| Create/schedule reports | ✓ | ✓ | ✓ | ✗ |
| View reports | ✓ | ✓ | ✓ | ✓ |
| Connect/disconnect integrations | ✓ | ✓ | ✗ | ✗ |
| View team workloads | ✓ | ✓ | ✓ | ✓ (if enabled) |
| Manage members | ✓ | ✓ | ✗ | ✗ |
| Billing & org settings | ✓ | ✗ | ✗ | ✗ |

---

### C3: Navigation Pattern (Sidebar vs Top Nav)

| | |
|---|---|
| **Risk** | Specs assume sidebar, prototype uses top nav — building on inconsistent foundation. |
| **Decision** | APPROVED — Settle on sidebar navigation before any new screen work. |
| **Rationale** | Top nav works for 3-5 items. We're looking at 10+: Dashboard, The Brief, Focus Mode, Notifications, Reports, Team, Integrations, Settings, plus future additions. Sidebar scales. Top nav doesn't. |
| **Scope** | V1 — Immediate, blocking |
| **Emmy's recommendation** | Collapsible sidebar with icon-only collapsed state for power users who want more screen real estate. Primary nav in sidebar, user/org actions in top-right corner. Mobile: bottom tab bar for primary nav, hamburger for secondary. |

---

### C4: Analytics Event Infrastructure

| | |
|---|---|
| **Risk** | Every spec lists analytics events but we have no infrastructure — either we skip tracking or we rush a bad implementation. |
| **Decision** | APPROVED — Thin event-bus abstraction now, wire to provider later. |
| **Rationale** | Perfect vendor-agnostic approach. A single `trackEvent(name: string, properties: Record<string, unknown>)` function that's a no-op or console.log in V1. When we choose a provider (PostHog, Mixpanel, Amplitude — all fine), we implement the interface. Zero code changes in feature code. |
| **Scope** | V1 — Interface only, wiring is V2 |
| **Emmy's addition** | The interface should also support `identify(userId, traits)` and `page(name, properties)` for completeness. Also: events should be typed. Define an `AnalyticsEvent` union type so we get autocomplete and catch typos at compile time. |

```typescript
// Example interface (not implementation)
interface AnalyticsClient {
  identify(userId: string, traits?: Record<string, unknown>): void;
  track(event: AnalyticsEvent): void;
  page(name: string, properties?: Record<string, unknown>): void;
}

type AnalyticsEvent = 
  | { name: 'notification_clicked'; properties: { type: string; source: string } }
  | { name: 'report_generated'; properties: { format: 'pdf' | 'csv'; sections: string[] } }
  // ... etc
```

---

### C5: Navigation Hierarchy & Cross-Linking

| | |
|---|---|
| **Risk** | No defined relationship between Command Center features and new pages creates UX confusion and deep-linking failures. |
| **Decision** | APPROVED WITH ADDITION — Define explicit navigation hierarchy AND cross-linking patterns. |
| **Rationale** | Users need mental model of where they are. Notifications should link to the source (report, team member, integration). Reports should link to relevant team views. Everything connects. |
| **Scope** | V1 — Architecture, immediate |
| **Emmy's addition** | We need a formal site map document. But more importantly: every linkable entity needs a canonical URL pattern. |

**Proposed URL Structure:**
```
/dashboard              — Command Center (The Brief, Focus Mode, etc.)
/notifications          — Notification center
/reports                — Reports list
/reports/:id            — Single report
/reports/new            — Report builder
/team                   — Team overview
/team/:personId         — Individual view (if permissions allow)
/integrations           — Integration hub
/integrations/:provider — Provider detail/settings
/settings               — Org settings
/settings/members       — Member management
/settings/billing       — Billing (Owner only)
```

**Cross-linking requirements:**
- Notifications MUST deep-link to source entity
- Reports MUST link to relevant team/integration contexts
- Team view MUST link to source integration for each task

---

## Notifications Decisions

### N1: Real-Time Updates (WebSocket Constraint)

| | |
|---|---|
| **Risk** | WebSocket requires persistent connections; serverless can't hold them. Vendor-specific solutions (Vercel Realtime, Pusher) violate our constraint. |
| **Decision** | APPROVED WITH SPECIFICATION — Polling for V1 behind abstract real-time interface. SSE for V2. |
| **Rationale** | The interface is what matters, not the implementation. V1 polling is boring but works everywhere. SSE is simpler than WebSocket and sufficient for our unidirectional notification use case. |
| **Scope** | V1 — Polling; V2 — SSE |
| **Emmy's specification** | |

```typescript
// The interface (stable)
interface RealtimeClient {
  subscribe(channel: string, callback: (event: RealtimeEvent) => void): Unsubscribe;
}

// V1 implementation: polling
// - Poll every 30 seconds when tab is active
// - Exponential backoff when no changes (30s → 60s → 120s, cap at 5min)
// - Immediate poll after user action (optimistic update + confirm)
// - Pause polling when tab is hidden (visibilitychange API)

// V2 implementation: SSE
// - Single persistent connection per client
// - Reconnect with exponential backoff on disconnect
// - Last-Event-ID header for resume
```

**Emmy's caveat:** Don't over-engineer V1. A simple `setInterval` + `fetch` with visibility detection is fine. The abstraction is for future-proofing, not current complexity.

---

### N2: Notification Producer Pipeline

| | |
|---|---|
| **Risk** | Unspecified notification creation leads to ad-hoc, inconsistent notification logic scattered across codebase. |
| **Decision** | APPROVED — Event-driven architecture with domain events and notification service subscriber. |
| **Rationale** | Services should emit domain events, not create notifications directly. This decouples business logic from notification logic, enables preference filtering, and creates audit trail. |
| **Scope** | V1 — Core architecture |
| **Emmy's specification** | |

```typescript
// Domain events (emitted by services)
type DomainEvent =
  | { type: 'sync.completed'; payload: { integrationId: string; itemsUpdated: number } }
  | { type: 'risk.detected'; payload: { projectId: string; riskLevel: 'high' | 'medium' } }
  | { type: 'blocker.flagged'; payload: { taskId: string; flaggedBy: string } }
  | { type: 'mention.created'; payload: { mentionedUserId: string; context: string } }
  // ... etc

// Notification service subscribes to events
// 1. Receives domain event
// 2. Determines recipients (who cares about this event?)
// 3. Applies user preferences (do they want this notification?)
// 4. Writes to notifications table
// 5. Emits notification.created event for real-time delivery
```

**V1 implementation:** In-process event emitter (Node.js EventEmitter or mitt). Synchronous is fine for V1 scale.

**V2 consideration:** If we need async processing or multiple service instances, upgrade to Redis pub/sub or a proper message queue. The domain event interface stays the same.

---

### N3: Notification Storage Growth

| | |
|---|---|
| **Risk** | "Never deleted" = unbounded storage growth = eventual performance degradation and cost explosion. |
| **Decision** | APPROVED WITH MODIFICATION — Tiered retention policy with user-initiated deletion. |
| **Rationale** | 90-day TTL is reasonable, but we should differentiate read vs unread, and comply with GDPR deletion requirements. |
| **Scope** | V1 — Policy definition |
| **Emmy's modification** | |

**Retention Policy:**
| State | Retention | Action |
|-------|-----------|--------|
| Unread | 90 days | Auto-archive after 90 days |
| Read | 30 days | Auto-archive after 30 days |
| Archived | 1 year | Hard delete after 1 year |
| User-deleted | Immediate | Hard delete (GDPR compliance) |

**Implementation:**
- `archived_at` timestamp column (nullable)
- Daily cron job moves eligible notifications to archived state
- Archived notifications queryable but excluded from default views
- "Delete all" action for GDPR "right to erasure" compliance

---

### N4: Notification Preferences/Settings

| | |
|---|---|
| **Risk** | No preferences = users get spammed = users disable notifications entirely or churn. |
| **Decision** | MODIFIED — Elevate to V1 requirement, not backlog. |
| **Rationale** | This isn't a nice-to-have. Without per-type and per-channel controls, notifications are spam. Spam kills engagement. |
| **Scope** | V1 — Required |
| **Emmy's pushback** | Susan's proposal to "add to backlog" is too weak. I'm escalating this to V1. Minimum viable preferences: |

**V1 Notification Preferences:**
```
Per-channel toggles:
  [ ] In-app notifications (default: ON)
  [ ] Email notifications (default: OFF)
  
Per-type toggles:
  [ ] Sync events (new items, updates)
  [ ] Risk alerts (blockers, delays)
  [ ] Mentions (someone mentioned you)
  [ ] Reports (scheduled report ready)
  
Digest option:
  ( ) Real-time
  ( ) Daily digest (9am local time)
  ( ) Weekly digest (Monday 9am)
```

**V2 additions:** Per-project preferences, quiet hours, vacation mode.

---

## Reports Decisions

### R1: PDF Generation (Serverless Constraint)

| | |
|---|---|
| **Risk** | PDF generation with charts exceeds serverless timeouts. Vendor-specific solutions violate constraint. |
| **Decision** | APPROVED WITH MODIFICATION — V1 uses client-side generation, V2 uses containerized worker. |
| **Rationale** | Browser print-to-PDF is pragmatic for V1 but has UX issues (print dialog, inconsistent styling). For V1, we use `@react-pdf/renderer` for simple reports (no charts) and browser print for chart-heavy reports. V2 moves to Puppeteer in a container. |
| **Scope** | V1 — Hybrid client-side; V2 — Server-side container |
| **Emmy's modification** | |

**V1 Implementation:**
- Simple reports (text, tables): `@react-pdf/renderer` — pure JS, generates PDF in browser, no print dialog
- Chart-heavy reports: Browser print-to-PDF with `@media print` stylesheet — user sees print dialog but it works
- Interface: `generatePDF(report: Report): Promise<Blob>`

**V2 Implementation:**
- Containerized Puppeteer/Playwright service
- Accepts HTML/URL, returns PDF buffer
- Runs anywhere: Docker, Kubernetes, AWS Lambda container, GCP Cloud Run
- Same interface, different implementation

**Emmy's caveat:** `@react-pdf/renderer` can't render arbitrary React components (including Recharts). So V1 chart reports must use browser print. This is a known limitation we accept for V1.

---

### R2: Scout AI / LLM Integration

| | |
|---|---|
| **Risk** | LLM integration without abstraction locks us to OpenAI. Without cost controls, runaway API spend. |
| **Decision** | APPROVED — Abstract LLM interface, provider-agnostic, with org-level spending controls. |
| **Rationale** | The LLM landscape is volatile. OpenAI today, Anthropic tomorrow, self-hosted next year. The interface insulates us. Spending caps are non-negotiable for B2B. |
| **Scope** | V1 — Interface + OpenAI implementation + cost controls |
| **Emmy's specification** | |

```typescript
interface LLMProvider {
  generateText(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  estimateTokens(text: string): number;
}

interface LLMOptions {
  maxTokens?: number;
  temperature?: number;
  model?: string; // provider-specific, but abstracted
}

interface LLMResponse {
  text: string;
  usage: { promptTokens: number; completionTokens: number };
  cost: number; // in cents
}
```

**Cost Controls (V1):**
- Org-level monthly spending cap (configurable, default $50)
- Per-request cost estimation before execution
- Usage tracking in database
- Graceful degradation: if cap reached, show "AI summary unavailable this month" not error
- Admin dashboard showing usage trends

**Emmy's additions:**
- Prompt templates should be separate files, version-controlled, A/B testable
- All LLM calls should be logged (prompt + response + latency + cost) for debugging and optimization
- Rate limiting: max 10 concurrent LLM requests per org to prevent abuse

---

### R3: Scheduled Reports Job Scheduler

| | |
|---|---|
| **Risk** | Job scheduling without abstraction couples us to Vercel Cron or similar. In-process schedulers die with the server. |
| **Decision** | APPROVED WITH MODIFICATION — V1 uses pg-boss (Postgres-backed), V2 evaluates BullMQ only if needed. |
| **Rationale** | Susan proposed node-cron for V1 — I'm rejecting that. node-cron is in-process and loses all jobs on restart. pg-boss uses our existing Postgres database, survives restarts, requires no additional infrastructure, and scales surprisingly far. |
| **Scope** | V1 — pg-boss; V2 — evaluate if migration needed |
| **Emmy's pushback** | node-cron is not acceptable even for V1. If the server restarts at 2am, all scheduled 3am reports fail silently. pg-boss is the right choice: same Postgres we already have, durable, transactional, no new infrastructure. |

```typescript
// Scheduler interface (stable)
interface Scheduler {
  schedule(jobId: string, cronExpr: string, handler: () => Promise<void>): Promise<void>;
  scheduleOnce(jobId: string, runAt: Date, handler: () => Promise<void>): Promise<void>;
  cancel(jobId: string): Promise<void>;
  getJob(jobId: string): Promise<Job | null>;
}

// V1: pg-boss implementation
// - Jobs stored in Postgres
// - Survives server restarts
// - Transactional with other DB operations
// - No Redis dependency
```

---

### R4: Confluence Delivery (Scope)

| | |
|---|---|
| **Risk** | Confluence integration is scope creep that delays V1 delivery. |
| **Decision** | APPROVED — Cut from V1. Ship email + Slack delivery only. |
| **Rationale** | We're already doing Jira OAuth. Adding Confluence is a separate OAuth flow, different API, different permission model. Email + Slack covers 90%+ of use cases. Confluence is V2 at earliest. |
| **Scope** | V1 — Email + Slack; V2+ — Confluence |
| **Emmy's agreement** | No caveats. Cut it. Focus. |

---

### R5: Charting Library

| | |
|---|---|
| **Risk** | Unspecified charting library leads to ad-hoc selection or vendor lock-in. |
| **Decision** | APPROVED — Recharts. |
| **Rationale** | Recharts is React-native, MIT licensed, actively maintained, tree-shakeable, SSR-compatible, dark mode capable. It's the obvious choice. |
| **Scope** | V1 — Immediate |
| **Emmy's notes** | |

**Why Recharts over alternatives:**
- **Chart.js:** Not React-native, requires wrapper
- **Victory:** Good but larger bundle, more complex API
- **Tremor:** Built on Recharts, more opinionated — good for dashboards but less flexible
- **D3 directly:** Too low-level for our needs
- **Nivo:** Good alternative, but Recharts has better docs and larger community

**Standardized chart components we'll need:**
- Line chart (trends over time)
- Bar chart (comparisons)
- Pie/donut chart (distributions)
- Stacked area (cumulative trends)

---

## Team/People Decisions

### T1: Workload Normalization

| | |
|---|---|
| **Risk** | Story points, hours, and effort levels are fundamentally different units. Normalizing incorrectly is worse than not normalizing. |
| **Decision** | APPROVED WITH SPECIFICATION — Abstract "Vantage capacity units" (hours-based), org-configurable mappings, graceful degradation. |
| **Rationale** | Hours are the universal denominator. Story points and effort levels can be converted to hours with org-specific ratios. When conversion confidence is low, show raw data with source labels. |
| **Scope** | V1 — Core architecture |
| **Emmy's specification** | |

**Normalization Model:**

```typescript
interface CapacityConfig {
  // Story points to hours (Jira)
  storyPointToHours: number; // default: 4 (1 SP = 4 hours)
  
  // Effort levels to hours (Asana)
  effortMapping: {
    low: number;    // default: 2
    medium: number; // default: 4
    high: number;   // default: 8
  };
  
  // Monday.com: already in hours, no conversion
  
  // Default capacity per person per week
  defaultWeeklyCapacity: number; // default: 40
}
```

**Display Rules:**
1. Always show normalized "Vantage hours" as primary metric
2. Always show source value in tooltip: "8h (2 story points from Jira)"
3. If normalization confidence < 80%, show warning badge
4. If no mapping configured, show raw value with "Configure mapping" prompt

**Graceful degradation:** If we can't normalize, we show: "12 story points (Jira) + 6 hours (Monday) + 3 tasks (Asana)" — ugly but honest.

---

### T2: Cross-Tool Identity Resolution

| | |
|---|---|
| **Risk** | Same person with different emails/names across tools creates duplicate profiles and wrong workload attribution. |
| **Decision** | APPROVED — Email-first matching, manual linking for conflicts, no fuzzy matching in V1. |
| **Rationale** | Fuzzy matching (name similarity) has false positive rates that destroy trust. Email is deterministic. When emails don't match, humans decide. |
| **Scope** | V1 — Email matching + manual linking |
| **Emmy's specification** | |

**Identity Model:**

```typescript
interface VantageUser {
  id: string;
  primaryEmail: string;
  displayName: string;
  linkedIdentities: ProviderIdentity[];
}

interface ProviderIdentity {
  provider: 'jira' | 'monday' | 'asana';
  providerId: string;
  email: string | null;
  displayName: string;
  linkedAt: Date;
  linkedBy: 'auto' | 'manual';
}
```

**Matching Algorithm (V1):**
1. New identity arrives from provider
2. Look for existing VantageUser with matching email
3. If found: auto-link, record as `linkedBy: 'auto'`
4. If not found: create new VantageUser OR add to dedup queue if name is suspiciously similar
5. Admin reviews dedup queue, manually links or confirms separate people

**Admin Dedup UI:**
- Shows potential duplicates side-by-side
- "Same person" → merge identities
- "Different people" → dismiss, never suggest again
- Bulk actions for efficiency

**V2 consideration:** ML-based suggestions (same name + same company domain = probably same person), but always human-confirmed.

---

### T3: Calendar Integration for Availability

| | |
|---|---|
| **Risk** | Calendar OAuth (Google, Microsoft) is entirely separate from PM tool OAuth — significant additional scope. |
| **Decision** | APPROVED — Defer to V2. V1 uses workload-based availability only. |
| **Rationale** | Calendar integration requires additional OAuth flows (Google, Microsoft at minimum), different permission scopes, and PII handling (meeting titles, attendees). This is a V2 feature. V1 availability = (capacity - assigned work). |
| **Scope** | V1 — Workload-based; V2 — Calendar integration |
| **Emmy's agreement** | Correct call. V1 availability formula: `availableHours = weeklyCapacity - assignedWork`. Simple, no external dependencies. Show "Calendar integration coming in a future update" in UI. |

---

### T4: Individual Workload Visibility (Privacy)

| | |
|---|---|
| **Risk** | Showing individual workloads without consent creates privacy concerns and potential workplace issues. |
| **Decision** | APPROVED WITH MODIFICATION — Three-tier visibility model, default to team-aggregate. |
| **Rationale** | Different orgs have different cultures. Some want full transparency, some don't. We support both. But we default to privacy. |
| **Scope** | V1 — Org-level toggle |
| **Emmy's modification** | Susan proposed 2 modes (individual vs aggregate). I'm proposing 3: |

**Visibility Modes:**

| Mode | You see your workload | You see others' workloads | Use case |
|------|----------------------|---------------------------|----------|
| **Private** | ✓ | ✗ (team aggregate only) | Privacy-conscious orgs |
| **Team Aggregate** | ✓ | Team totals only | Default, balanced |
| **Transparent** | ✓ | ✓ (individual breakdown) | High-trust teams |

**Default:** Team Aggregate

**Implementation:**
- Org-level setting in Settings > Privacy
- Only Owner/Admin can change
- Change is logged for audit
- UI adapts: Transparent mode shows individual bars, other modes show single "Team" bar

---

## Integrations Decisions

### I1: Multi-Provider OAuth Strategy

| | |
|---|---|
| **Risk** | Building OAuth for 3+ providers simultaneously is 3+ months of work and high defect risk. |
| **Decision** | APPROVED — Jira first as reference implementation, extract pattern, ship sequentially. |
| **Rationale** | Jira has the largest market share in our target segment (enterprise PM tools). Building it first lets us discover the right abstraction before committing to it for other providers. |
| **Scope** | V1 — Jira; V1.1 — Monday; V1.2 — Asana |
| **Emmy's specification** | |

```typescript
// Integration provider interface (stable across all providers)
interface IntegrationProvider {
  // OAuth flow
  getAuthUrl(orgId: string, redirectUri: string): string;
  handleCallback(code: string, state: string): Promise<TokenSet>;
  refreshToken(refreshToken: string): Promise<TokenSet>;
  
  // Data sync
  sync(connection: Connection): Promise<SyncResult>;
  
  // Webhook handling
  verifyWebhook(request: Request): Promise<boolean>;
  parseWebhook(payload: unknown): Promise<DomainEvent[]>;
  
  // Webhook lifecycle
  registerWebhooks(connection: Connection): Promise<void>;
  unregisterWebhooks(connection: Connection): Promise<void>;
}

// Each provider implements this interface
// Jira: JiraProvider implements IntegrationProvider
// Monday: MondayProvider implements IntegrationProvider
// Asana: AsanaProvider implements IntegrationProvider
```

**Extraction timeline:**
1. Build Jira integration completely
2. Extract common patterns into base classes / shared utilities
3. Build Monday using extracted patterns, refine abstractions
4. Build Asana, abstractions should be stable by now

---

### I2: Field Mapping Strategy

| | |
|---|---|
| **Risk** | Custom field mapping UI is a mini-product that delays V1 and may not be needed by most users. |
| **Decision** | APPROVED — V1 uses smart defaults only. V2 adds custom mapping UI. |
| **Rationale** | 80% of users use standard fields. Auto-detection covers them. The 20% with custom fields can wait for V2 or use workarounds. |
| **Scope** | V1 — Auto-detection; V2 — Custom mapping UI |
| **Emmy's specification** | |

**V1 Auto-Detected Mappings:**

| Vantage Field | Jira | Monday | Asana |
|---------------|------|--------|-------|
| Title | summary | name | name |
| Status | status.name | status.label | completed + custom_fields |
| Assignee | assignee.emailAddress | person.emails[0] | assignee.email |
| Due Date | duedate | date.date | due_on |
| Priority | priority.name | priority.label | custom_fields (if exists) |
| Estimate | timeestimate OR story_points | numbers (first) | custom_fields (if exists) |

**When auto-detection fails:**
- Show field as "Unmapped" in UI
- Log for analytics (helps us prioritize V2 mapping)
- Don't block sync — just skip unmapped fields

**V2 Custom Mapping UI:**
- Dropdown for each Vantage field → select source field
- Preview of sample data with mapping applied
- Save as org-level configuration per provider

---

### I3: One-Way Sync Architecture (Future Two-Way)

| | |
|---|---|
| **Risk** | One-way sync architecture that precludes two-way sync means rewriting everything later. |
| **Decision** | APPROVED WITH MODIFICATION — Event log pattern (not full event sourcing). |
| **Rationale** | Full event sourcing (CQRS, projections, etc.) is overkill and adds complexity. But we do need an immutable event log for auditability and future two-way sync. |
| **Scope** | V1 — Inbound event log + derived state |
| **Emmy's modification** | Susan proposed "event-sourcing pattern" — I'm narrowing this to "event log pattern" to avoid over-engineering. |

**Architecture:**

```
Inbound webhook/sync
       ↓
┌──────────────────┐
│ integration_events │  ← Immutable log of raw events
│ (append-only)     │
└──────────────────┘
       ↓
   Transform
       ↓
┌──────────────────┐
│ vantage_tasks     │  ← Current state (mutable)
│ vantage_projects  │
└──────────────────┘
```

**Event Log Table:**

```sql
CREATE TABLE integration_events (
  id UUID PRIMARY KEY,
  provider VARCHAR(50) NOT NULL,
  connection_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  external_id VARCHAR(255),
  payload JSONB NOT NULL,
  received_at TIMESTAMP NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP,
  INDEX idx_connection_received (connection_id, received_at)
);
```

**Why this enables two-way sync:**
- We have full history of inbound changes
- We can detect conflicts (inbound change vs outbound change)
- Two-way sync adds: outbound event publisher + conflict resolution UI
- Inbound pipeline doesn't change

---

### I4: Webhook Management

| | |
|---|---|
| **Risk** | Three providers × different webhook formats × different signature schemes = complexity explosion. |
| **Decision** | APPROVED — Unified ingestion endpoint with provider-specific modules. |
| **Rationale** | Single entry point simplifies infrastructure (one URL to monitor, one set of logs). Provider-specific parsing is unavoidable but isolated. |
| **Scope** | V1 — Core architecture |
| **Emmy's specification** | |

**Webhook Architecture:**

```
POST /api/webhooks/jira    ─┐
POST /api/webhooks/monday   ├─→ Signature Verification (provider-specific)
POST /api/webhooks/asana   ─┘           ↓
                              Parse to DomainEvent (provider-specific)
                                        ↓
                              Write to integration_events
                                        ↓
                              Emit internal event for processing
```

**Implementation:**

```typescript
// Unified webhook handler
app.post('/api/webhooks/:provider', async (req, res) => {
  const provider = providers[req.params.provider];
  if (!provider) return res.status(404).send('Unknown provider');
  
  // 1. Verify signature (provider-specific)
  const isValid = await provider.verifyWebhook(req);
  if (!isValid) return res.status(401).send('Invalid signature');
  
  // 2. Parse to domain events (provider-specific)
  const events = await provider.parseWebhook(req.body);
  
  // 3. Store in event log
  await db.integrationEvents.createMany({ data: events });
  
  // 4. Emit for processing
  for (const event of events) {
    eventBus.emit('integration.event', event);
  }
  
  return res.status(200).send('OK');
});
```

**Webhook Lifecycle:**
- On connect: register webhooks with provider API
- On disconnect: unregister webhooks (cleanup)
- On failure: retry registration with exponential backoff
- Health check: periodic verification that webhooks are still registered

---

### I5: "Coming Soon" Integration Labels

| | |
|---|---|
| **Risk** | "Coming Soon" labels create expectations we may not meet, damaging trust. |
| **Decision** | APPROVED WITH MODIFICATION — Show only integrations with concrete roadmap commitment. Add "Request Integration" mechanism. |
| **Rationale** | Susan's 6-month threshold is reasonable. But we should also capture demand signal for integrations we haven't committed to. |
| **Scope** | V1 — Committed integrations + request mechanism |
| **Emmy's modification** | |

**Label Taxonomy:**

| Label | Meaning | Criteria |
|-------|---------|----------|
| **Available** | Live, connect now | Shipped and stable |
| **Coming Soon** | Actively building | In current or next sprint |
| **Planned** | On roadmap | Committed for next 6 months |
| **Request** | Not planned | Shows vote count, request button |

**"Request Integration" Feature:**
- Button on integration card for unplanned integrations
- Records org ID + requested integration
- Shows vote count to other users ("42 teams requested this")
- Feeds into product prioritization

**What we show in V1:**
- Jira: Available
- Monday: Coming Soon (V1.1)
- Asana: Coming Soon (V1.2)
- Linear, Notion, ClickUp, Trello: Request (if we want to gauge interest)

---

## Additional Risks Identified

### M1: Error Handling Strategy

| | |
|---|---|
| **Risk** | No spec defines error states. What happens when LLM fails? Integration times out? Data is missing? |
| **Decision** | NEW — Define graceful degradation patterns for all external dependencies. |
| **Rationale** | External dependencies fail. LLMs hallucinate. Integrations have outages. We must degrade gracefully, not crash. |
| **Scope** | V1 — Foundational |
| **Emmy's specification** | |

**Degradation Patterns:**

| Dependency | Failure Mode | Graceful Degradation |
|------------|--------------|----------------------|
| LLM (Scout AI) | Timeout/error | "AI summary temporarily unavailable" + show raw data |
| LLM | Rate limited | Queue request, show "Generating..." with ETA |
| Integration sync | API error | Show last successful sync data + "Sync failed, retrying" banner |
| Integration sync | Auth expired | Prompt to re-authenticate, don't lose existing data |
| Webhook | Provider outage | Backfill via polling on next successful connection |
| PDF generation | Timeout | Fall back to CSV download, offer retry |

**Error UI Principles:**
- Never show raw error messages to users
- Always offer an action (retry, contact support, use fallback)
- Log full error details for debugging
- Track error rates per feature for alerting

---

### M2: Responsive Design Requirements

| | |
|---|---|
| **Risk** | All specs appear desktop-only. Mobile/tablet experience undefined. |
| **Decision** | NEW — Responsive design from V1, but optimize for desktop. |
| **Rationale** | Our users are PMs at their desks. But they also check things on phones between meetings. Support both, prioritize desktop. |
| **Scope** | V1 — Responsive, desktop-optimized |
| **Emmy's specification** | |

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Per-screen responsiveness:**
- **Dashboard/Brief:** Fully responsive, cards stack on mobile
- **Notifications:** Fully responsive, essential for mobile
- **Reports:** Desktop-optimized, mobile shows simplified view + "View on desktop for full experience"
- **Team:** Desktop-optimized, mobile shows list view (no workload charts)
- **Integrations:** Desktop-only for setup, mobile shows status only

---

### M3: Data Migration Strategy

| | |
|---|---|
| **Risk** | Schema changes between versions without migration strategy = data loss or extended downtime. |
| **Decision** | NEW — Every schema change requires migration plan. Test migrations on production-scale data. |
| **Rationale** | Prisma handles migrations, but we need to validate them. A migration that takes 5 seconds on dev can take 5 hours on production. |
| **Scope** | V1 — Process requirement |
| **Emmy's specification** | |

**Migration Requirements:**
1. Every PR with schema changes must include migration file
2. Migration must be reversible (or explicitly marked irreversible with justification)
3. Migration must be tested on production-scale data copy before deploy
4. Large data migrations must be chunked (not single transaction)
5. Zero-downtime migrations only — no locking entire tables

---

### M4: Testing Strategy

| | |
|---|---|
| **Risk** | No testing requirements means inconsistent quality and fear of refactoring. |
| **Decision** | NEW — Define minimum coverage requirements. |
| **Rationale** | Tests enable confident refactoring. Integration tests catch provider API drift. E2E tests catch user-facing regressions. |
| **Scope** | V1 — Foundational |
| **Emmy's specification** | |

**Coverage Requirements:**

| Test Type | Coverage Target | What to Test |
|-----------|-----------------|--------------|
| Unit | 80% of business logic | Normalization, calculations, transformations |
| Integration | All provider adapters | OAuth flows, API parsing, webhook handling |
| E2E | Critical user paths | Login, connect integration, view dashboard, generate report |

**Critical Paths (must have E2E):**
1. Sign up → connect Jira → see synced data
2. View dashboard → generate report → download PDF
3. Receive notification → click through → see source
4. Change settings → verify persistence

---

### M5: Observability Strategy

| | |
|---|---|
| **Risk** | No logging/monitoring strategy means we can't diagnose production issues or detect outages. |
| **Decision** | NEW — Vendor-agnostic structured logging, health checks, basic alerting. |
| **Rationale** | Observability is non-negotiable for production systems. We need to know when things break before users tell us. |
| **Scope** | V1 — Logging + health checks; V2 — Distributed tracing |
| **Emmy's specification** | |

**V1 Observability:**

```typescript
// Structured logging (pino or winston)
logger.info('sync.completed', {
  integrationId: '...',
  duration: 1234,
  itemsProcessed: 42,
  errors: 0
});

// Health check endpoint
GET /api/health
{
  "status": "healthy",
  "version": "1.2.3",
  "checks": {
    "database": "ok",
    "redis": "ok", // if applicable
    "integrations": {
      "jira": "ok",
      "monday": "degraded" // API slow
    }
  }
}
```

**Alerting (V1):**
- Health check fails → alert
- Error rate > 1% over 5 minutes → alert
- Sync failure for any org > 1 hour → alert
- P95 latency > 5s → alert

**V2 additions:** Distributed tracing (OpenTelemetry), custom dashboards, anomaly detection.

---

## Search Decisions

### S1: Search Infrastructure (Elasticsearch vs Postgres)

| | |
|---|---|
| **Risk** | Elasticsearch adds significant infrastructure (cluster management, memory tuning, separate failure domain), operational burden, and cost. Violates vendor-agnostic constraint if we use managed ES. |
| **Decision** | APPROVED — Postgres full-text search (tsvector + GIN indexes + pg_trgm) for V1. Elasticsearch only if Postgres can't keep up at scale. |
| **Rationale** | Postgres FTS is criminally underrated. It handles 100K-1M documents easily with proper indexing. It's already in our stack, transactional (search results always consistent with data), zero new infrastructure. The key is abstracting the search interface so we can swap implementations later. |
| **Scope** | V1 — Postgres FTS; V2+ — Elasticsearch if needed |
| **Emmy's specification** | |

```typescript
// Search interface (stable, implementation-agnostic)
interface SearchService {
  search(query: SearchQuery): Promise<SearchResults>;
  index(entity: Indexable): Promise<void>;
  remove(entityId: string): Promise<void>;
}

interface SearchQuery {
  text: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
}

// V1: Postgres implementation
// - tsvector column on searchable tables
// - GIN index for fast full-text queries
// - pg_trgm extension for fuzzy/similarity matching
// - ts_rank for relevance scoring
```

**Postgres FTS Setup:**
```sql
-- Add tsvector column with trigger
ALTER TABLE vantage_tasks ADD COLUMN search_vector tsvector;

CREATE INDEX idx_tasks_search ON vantage_tasks USING GIN(search_vector);

-- Update trigger (fires on INSERT/UPDATE)
CREATE TRIGGER tasks_search_update
  BEFORE INSERT OR UPDATE ON vantage_tasks
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.english', title, description);

-- pg_trgm for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_tasks_title_trgm ON vantage_tasks USING GIN(title gin_trgm_ops);
```

**When to consider Elasticsearch:**
- Query latency > 500ms at p95
- Index size > 10GB
- Need for complex aggregations/facets
- Multi-language support beyond English

---

### S2: Command Palette + Search Page Architecture

| | |
|---|---|
| **Risk** | Two search UIs (palette overlay + full page) means duplicated logic, inconsistent behavior, double maintenance. |
| **Decision** | APPROVED — Shared SearchService and SearchResult components. Palette is thin wrapper. |
| **Rationale** | Same data layer, same ranking logic, different presentation. The palette shows top 5 per category; the full page adds filters and pagination. Both use identical search queries under the hood. |
| **Scope** | V1 — Core architecture |
| **Emmy's additions** | |

**Architecture:**
```
┌─────────────────────────────────────────────────┐
│                  SearchService                   │
│  (query parsing, execution, ranking, caching)   │
└─────────────────────────────────────────────────┘
           ↑                        ↑
    ┌──────┴──────┐          ┌──────┴──────┐
    │   Palette   │          │  Full Page  │
    │  (Cmd+K)    │          │  (/search)  │
    │  top 5/cat  │          │  filtered   │
    │  no filters │          │  paginated  │
    └─────────────┘          └─────────────┘
           ↓                        ↓
    ┌─────────────────────────────────────────────┐
    │         Shared SearchResult Components       │
    │   (TaskResult, PersonResult, ProjectResult)  │
    └─────────────────────────────────────────────┘
```

**Additional requirements:**
- Command palette: keyboard navigation (↑↓ to move, Enter to select, Esc to close)
- Command palette: keyboard shortcut Cmd+K (Mac) / Ctrl+K (Windows)
- Full search page: URL-based state (`/search?q=blocked&status=in_progress`) for shareability
- Both: consistent result ranking (same query = same order)

---

### S3: Advanced Search Syntax (Query Parser)

| | |
|---|---|
| **Risk** | Query parser (`status:blocked -completed project:payments`) is significant engineering effort with large testing surface. |
| **Decision** | APPROVED WITH MODIFICATION — V1 = plain text + UI filters. V2 = query syntax parser. |
| **Rationale** | Susan's right that plain text covers 90% of cases. But power users will want filtering. The middle ground: UI-based filters in V1 give the same capability without parser complexity. |
| **Scope** | V1 — Plain text + UI filters; V2 — Query syntax |
| **Emmy's modification** | Don't ship plain text ONLY. Ship plain text + filter dropdowns. |

**V1 Search Interface:**
```
┌──────────────────────────────────────────────────────────┐
│ 🔍 [Search tasks, people, projects...            ] [⌘K] │
├──────────────────────────────────────────────────────────┤
│ Status: [All ▼]  Project: [All ▼]  Assignee: [All ▼]   │
│ Source: [All ▼]  Date range: [Any time ▼]               │
└──────────────────────────────────────────────────────────┘
```

**V2 Query Syntax (deferred):**
- `status:blocked` — filter by status
- `project:payments` — filter by project
- `@john` — filter by assignee
- `-completed` — exclude completed items
- `"exact phrase"` — exact match
- `due:this-week` — date shortcuts

**Emmy's rationale:** UI filters are more discoverable for casual users and still serve power users. Query syntax is a power-user optimization that can wait.

---

### S4: Near-Real-Time Index Freshness

| | |
|---|---|
| **Risk** | "<30s index freshness" requirement means search index must update on every sync and webhook event. |
| **Decision** | APPROVED — Index update is part of the write transaction. No separate indexing job. |
| **Rationale** | With Postgres FTS, indexing is just updating a tsvector column — it's part of the same transaction that writes the data. Transactional consistency means search is always accurate. No eventual consistency lag. |
| **Scope** | V1 — Core architecture |
| **Emmy's specification** | |

**Implementation:**
1. **Sync pipeline:** When sync writes/updates `vantage_tasks`, the tsvector trigger fires automatically
2. **Webhook events:** Same — webhook handler writes to table, trigger updates index
3. **No background indexer needed** — Postgres handles it transactionally

**Performance consideration:** For bulk syncs (initial import of 10K items), we might want to:
- Disable triggers during bulk insert
- Rebuild index after bulk insert completes
- This is an optimization, not a requirement for V1

---

### S5: Typo Correction ("Did you mean...")

| | |
|---|---|
| **Risk** | True typo correction requires Levenshtein distance calculation, phonetic matching, or external service. |
| **Decision** | APPROVED — Defer explicit "Did you mean..." to V2. Use pg_trgm similarity for fuzzy matching in V1. |
| **Rationale** | pg_trgm already handles fuzzy matching via trigram similarity. If someone searches "planing" and we have "planning", the similarity score will surface it. We just need to present results correctly. |
| **Scope** | V1 — pg_trgm fuzzy matching; V2 — Explicit typo suggestions |
| **Emmy's specification** | |

**V1 Behavior:**
- pg_trgm `similarity()` function scores results 0.0-1.0
- Results with similarity > 0.3 are included even if not exact match
- Order by: exact matches first, then by similarity score
- No explicit "Did you mean X?" UI — fuzzy results just appear

**V2 Enhancement:**
- If query returns 0 exact matches but has high-similarity alternatives:
  - Show: "No exact matches. Showing results for 'planning'..."
  - Or: "Did you mean: planning, plane, plan?"

---

### S6: Recent Searches Storage

| | |
|---|---|
| **Risk** | localStorage means no cross-device sync of search history. |
| **Decision** | APPROVED — Accept localStorage for V1. Server-side history is V2. |
| **Rationale** | Zero-cost, zero-infrastructure, covers the primary use case (quick re-search on same device). Cross-device sync is a luxury feature. |
| **Scope** | V1 — localStorage; V2 — Server-side |
| **Emmy's addition** | |

**V1 Implementation:**
```typescript
// Store last 20 searches in localStorage
const RECENT_SEARCHES_KEY = 'vantage_recent_searches';
const MAX_RECENT = 20;

function addRecentSearch(query: string) {
  const recent = getRecentSearches();
  const updated = [query, ...recent.filter(q => q !== query)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
}
```

**Server-side tracking (for analytics, not user-facing):**
- Log all search queries to analytics event bus (C4)
- Track: query text, result count, click-through rate
- Use for: improving ranking, identifying zero-result queries, feature prioritization
- This is NOT the same as user-facing search history

---

### S7: Cross-Source Deduplication

| | |
|---|---|
| **Risk** | Same task in Jira and Monday (manual duplicate or import) appears twice in search results. |
| **Decision** | APPROVED — No deduplication in V1. Show source labels clearly. |
| **Rationale** | Task-level identity resolution is harder than person identity resolution (T2). Tasks don't have universal identifiers like email. Matching on title + project + assignee is fuzzy and error-prone. Wrong deduplication is worse than showing duplicates. |
| **Scope** | V1 — No deduplication, clear source labels; V2 — Evaluate feasibility |
| **Emmy's specification** | |

**V1 UX Mitigation:**
- Every search result shows source badge: `[Jira]` `[Monday]` `[Asana]`
- If same title appears from multiple sources, user can see why
- Tooltip: "This task is synced from Jira. Similar tasks may exist in other connected tools."

**V2 Consideration:**
Task deduplication would require:
- Fuzzy title matching (risky — "Q1 Planning" vs "Q1 Planning Meeting" = same?)
- Same project context (how do we match projects across tools?)
- Same assignee (relies on T2 person resolution working)
- Manual confirmation UI (like T2 dedup queue)

**Emmy's recommendation:** Don't promise this for V2. Evaluate after V1 launch based on user feedback. It may not be a real problem.

---

## Activity Log Decisions

### A1: Activity Log Storage Growth

| | |
|---|---|
| **Risk** | Busy orgs produce thousands of activity entries per day. 90-day retention still means millions of rows. Query performance degrades. |
| **Decision** | APPROVED — Monthly partitioning, composite index, cold storage archival. |
| **Rationale** | Time-series data demands partitioning. Monthly partitions let us drop old data efficiently, query recent data fast, and archive incrementally. |
| **Scope** | V1 — Partitioned table architecture |
| **Emmy's specification** | |

**Table Design:**
```sql
CREATE TABLE activity_log (
  id UUID NOT NULL,
  org_id UUID NOT NULL,
  actor_id UUID,  -- nullable for system events
  actor_type VARCHAR(20) NOT NULL, -- 'user', 'system', 'integration'
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  metadata JSONB,  -- IP, UA for security events
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (org_id, created_at, id)
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE activity_log_2026_01 PARTITION OF activity_log
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE activity_log_2026_02 PARTITION OF activity_log
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... auto-generate via cron job

-- Index for common queries
CREATE INDEX idx_activity_org_time ON activity_log (org_id, created_at DESC);
CREATE INDEX idx_activity_entity ON activity_log (entity_type, entity_id);
```

**Partition Management (pg-boss job):**
- Monthly: create next month's partition
- After retention period: detach old partition, archive to cold storage (S3/GCS), drop table
- Cold storage format: gzipped JSON lines for queryability if needed

---

### A2: Real-Time Activity Updates

| | |
|---|---|
| **Risk** | Activity feed wants real-time updates. Same WebSocket constraint as notifications (N1). |
| **Decision** | APPROVED — Reuse RealtimeClient from N1. No separate implementation. |
| **Rationale** | One real-time abstraction serves all features. Activity feed subscribes to `activity:{orgId}` channel using the same polling mechanism as notifications. Same upgrade path to SSE in V2. |
| **Scope** | V1 — Shared RealtimeClient |
| **Emmy's agreement** | No caveats. DRY principle. Same interface, same implementation. |

**Implementation:**
```typescript
// Activity feed subscription (uses same RealtimeClient as notifications)
const unsubscribe = realtimeClient.subscribe(
  `activity:${orgId}`,
  (event) => {
    if (event.type === 'activity.created') {
      prependToActivityFeed(event.payload);
    }
  }
);
```

---

### A3: Activity Logging as Cross-Cutting Middleware

| | |
|---|---|
| **Risk** | Retrofitting activity logging means missed events, inconsistent formats, weeks of auditing every endpoint. |
| **Decision** | APPROVED — Build as middleware/decorator pattern from day one. |
| **Rationale** | Cross-cutting concerns must be cross-cutting in implementation. A decorator on service methods captures before/after state automatically. Service code stays clean. Coverage is guaranteed by architecture, not discipline. |
| **Scope** | V1 — Foundational |
| **Emmy's specification** | |

**Decorator Pattern:**
```typescript
// Decorator captures before/after state, writes to activity log
@logActivity('task.updated')
async updateTask(taskId: string, data: UpdateTaskInput, actor: Actor): Promise<Task> {
  // Implementation - decorator handles logging
  const task = await this.taskRepo.findById(taskId);
  const updated = await this.taskRepo.update(taskId, data);
  return updated;
}

// Decorator implementation (simplified)
function logActivity(action: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const before = await captureState(args); // Get entity state before
      const result = await original.apply(this, args);
      const after = await captureState(result); // Get entity state after
      await activityService.log({
        action,
        entityId: extractEntityId(args, result),
        changes: diff(before, after),
        actor: extractActor(args),
      });
      return result;
    };
  };
}
```

**What gets logged:**
| Category | Events |
|----------|--------|
| Tasks | created, updated, deleted, status_changed, assigned, commented |
| Projects | created, updated, archived, member_added, member_removed |
| Integrations | connected, disconnected, sync_started, sync_completed, sync_failed |
| Users | invited, joined, role_changed, removed |
| Auth | login, logout, password_changed, oauth_connected |
| Reports | created, generated, scheduled, delivered |
| Settings | updated (with field-level diff) |

---

### A4: Large Dataset Export

| | |
|---|---|
| **Risk** | Enterprise orgs may have 50MB+ activity data. Synchronous export will timeout. |
| **Decision** | APPROVED — Async export via pg-boss job with notification on completion. |
| **Rationale** | Same pattern as large report generation. User initiates, background job processes, notification delivered when ready. |
| **Scope** | V1 — Async export |
| **Emmy's specification** | |

**Export Flow:**
```
User clicks "Export Activity Log"
         ↓
     Validate filters & date range
         ↓
     Estimate row count
         ↓
  ┌──────┴──────────────────┐
  │ < 10K rows              │ > 10K rows
  │ Sync export (immediate) │ Async export
  └─────────────────────────┴──────────────────┐
                                               ↓
                                    Create pg-boss job
                                               ↓
                                    Return job ID + "Processing..."
                                               ↓
                                    Job streams to CSV (chunked)
                                               ↓
                                    Upload to S3-compatible storage
                                               ↓
                                    Generate signed URL (24h expiry)
                                               ↓
                                    Send notification + email
```

**Implementation Details:**
- Stream rows in chunks of 1000 (don't load all into memory)
- CSV format with headers
- Include all visible columns (respect RBAC — don't export security events to Members)
- Signed URL expires in 24 hours
- Progress tracking: job updates progress %, UI can poll for status
- Cancel button: marks job as cancelled, worker checks flag and aborts

---

### A5: Sensitive Data Redaction

| | |
|---|---|
| **Risk** | Activity log may capture passwords, tokens, API keys in change payloads. Spec says "redact" but not how. |
| **Decision** | APPROVED — SensitiveField registry with pre-write redaction. |
| **Rationale** | Redaction MUST happen before database write, not on read. If sensitive data hits the database, it's vulnerable to SQL injection, backup exposure, etc. |
| **Scope** | V1 — Foundational |
| **Emmy's specification** | |

**Sensitive Field Patterns:**
```typescript
const SENSITIVE_PATTERNS: RegExp[] = [
  /password/i,
  /passwd/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /apikey/i,
  /auth/i,
  /credential/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
  /bearer/i,
  /session/i,
  /cookie/i,
];

function redactSensitiveFields(obj: Record<string, any>): Record<string, any> {
  const redacted = { ...obj };
  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_PATTERNS.some(pattern => pattern.test(key))) {
      redacted[key] = '[REDACTED]';
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveFields(redacted[key]); // Recursive
    }
  }
  return redacted;
}
```

**Additional Protections:**
- Org-configurable additional patterns (some orgs have custom sensitive fields)
- Redaction runs in activity logging middleware BEFORE db.insert()
- Unit tests verify redaction works for all known sensitive patterns
- Audit: log when redaction occurs (without the redacted value) for debugging

---

### A6: Activity Log RBAC

| | |
|---|---|
| **Risk** | Spec says "Members see activity on their projects only" but C2 says project-level RBAC is V2. Contradiction. |
| **Decision** | APPROVED — V1 = Members see all activity except security events. Project scoping is V2. |
| **Rationale** | We can't implement project-scoped activity without project-level RBAC. V1 compromise: Members see everything except sensitive security events. |
| **Scope** | V1 — Role-based filtering; V2 — Project-scoped |
| **Emmy's specification** | |

**V1 Activity Visibility:**

| Role | Visible Activity |
|------|------------------|
| Owner | All activity including security events |
| Admin | All activity including security events |
| Member | All activity EXCEPT: login/logout, password changes, OAuth events, billing, permission changes |
| Viewer | No access to Activity Log |

**Why Viewers can't access:**
- Activity Log is primarily mutations (created, updated, deleted)
- Viewers can only read, so their actions aren't logged (we don't log page views)
- Showing them a log of changes they can't make is confusing
- Security events especially should not be visible to Viewers

**V2 Enhancement:**
With project-level RBAC:
- Members see activity for projects they're members of
- "All activity" view for Admins
- Filter by project becomes meaningful

---

### A7: IP Address and User Agent (GDPR)

| | |
|---|---|
| **Risk** | Storing IP and User Agent has GDPR implications. These are personal data in some jurisdictions. |
| **Decision** | APPROVED WITH STRENGTHENING — Store only for security events, hash IP, include in GDPR deletion scope. |
| **Rationale** | Security event logging has "legitimate interest" basis under GDPR. But we must minimize data collection and enable deletion. |
| **Scope** | V1 — Compliant by design |
| **Emmy's modifications** | |

**What We Store (Security Events Only):**
- Login (success and failure)
- Logout
- Password change
- OAuth connection/disconnection
- Permission changes
- Data export requests
- Account deletion

**IP Hashing:**
```typescript
import { createHash } from 'crypto';

function hashIP(ip: string, orgSalt: string): string {
  // SHA-256 with org-specific salt
  // Allows "same IP" correlation within org
  // Prevents rainbow table attacks
  return createHash('sha256')
    .update(ip + orgSalt)
    .digest('hex')
    .substring(0, 16); // Truncate for storage efficiency
}
```

**GDPR Compliance:**
- Right to access: User can request export of their activity (including hashed IPs with explanation)
- Right to erasure: User deletion anonymizes their activity entries:
  ```sql
  UPDATE activity_log 
  SET actor_id = NULL, 
      metadata = metadata - 'ip_hash' - 'user_agent',
      actor_type = 'deleted_user'
  WHERE actor_id = $userId;
  ```
- Retention: Security events retained 1 year (longer than standard 90 days for compliance), then deleted

**User Agent Storage:**
- Full UA string (needed for security analysis — "was this a bot?")
- NOT hashed (low PII value, needed for debugging)
- Deleted on user erasure request

---

## Jeff's Unanswered Questions

Per C1, every spec should surface open questions. Jeff's Search and Activity specs both say "Open Questions: None." Here are questions I would raise before building:

### Search Spec Gaps

| ID | Question | Impact if Unanswered |
|----|----------|----------------------|
| S-Q1 | **Zero results UX:** What do we show when search returns nothing? Empty state copy? Suggestions? | Engineers will invent inconsistent empty states |
| S-Q2 | **Permission filtering:** If a task exists but user doesn't have permission, do we hide it silently or show "X results hidden"? | Security vs. UX tradeoff needs product decision |
| S-Q3 | **Keyboard shortcut:** Is Cmd+K confirmed? What about conflicts with browser shortcuts? | Accessibility and discoverability affected |
| S-Q4 | **Result ranking:** What's the priority order — recency, relevance, or user's own items first? | Search quality depends on this; engineers will guess |
| S-Q5 | **Saved searches:** Can users save frequent searches for one-click access? | If V2, we should design schema to support it |
| S-Q6 | **Scoped search:** Can users search within a specific project/integration, or is it always global? | Affects UI design and query interface |

### Activity Spec Gaps

| ID | Question | Impact if Unanswered |
|----|----------|----------------------|
| A-Q1 | **Cross-user visibility:** Can Member A see Member B's activity, or only their own + shared resources? | Privacy implications; inconsistent implementation |
| A-Q2 | **Deleted entities:** If a task is deleted, how do we show its activity? "Task deleted" with no link? Preserve title? | UX confusion; orphaned references |
| A-Q3 | **Bulk operations:** If someone bulk-updates 50 tasks, is that 50 entries or 1 "bulk update" entry? | Activity log spam vs. loss of detail |
| A-Q4 | **Integration actor:** When Jira webhook updates a task, who's the actor — "Jira Sync" or the Jira user who made the change? | Attribution clarity |
| A-Q5 | **Audit vs Activity:** Is this a compliance audit log or a user-facing activity feed? Spec conflates them. | Different retention, access control, and detail requirements |
| A-Q6 | **Failed operations:** If a sync fails, is that logged? With what detail level? | Debugging vs. noise tradeoff |

**Recommendation:** Schedule 30-minute sync with Jeff to resolve these before engineering starts. These aren't blockers but will cause rework if engineers guess wrong.

---

## Summary: V1 Scope

### Must Have (V1)

**Cross-Cutting:**
- 4-tier RBAC (C2)
- Sidebar navigation (C3)
- Analytics event interface (C4)
- Navigation hierarchy & URLs (C5)
- Error handling patterns (M1)
- Responsive design (M2)
- Migration strategy (M3)
- Testing requirements (M4)
- Observability baseline (M5)

**Notifications:**
- Polling real-time with abstraction (N1)
- Event-driven notification pipeline (N2)
- Notification retention policy (N3)
- **Notification preferences (N4)** — elevated from backlog

**Reports:**
- Client-side PDF generation (R1)
- LLM interface + OpenAI + cost controls (R2)
- pg-boss scheduler (R3)
- Recharts (R5)

**Team/People:**
- Workload normalization with graceful degradation (T1)
- Email-based identity resolution + manual linking (T2)
- Workload-based availability (T3)
- Privacy visibility modes (T4)

**Integrations:**
- Jira integration (I1)
- Auto-detected field mapping (I2)
- Event log architecture (I3)
- Unified webhook handling (I4)
- Committed integrations only + request mechanism (I5)

**Search:**
- Postgres full-text search with tsvector + pg_trgm (S1)
- Shared SearchService architecture (S2)
- **Plain text + UI filters (S3)** — modified from plain text only
- Transactional search index updates (S4)
- pg_trgm fuzzy matching (S5)
- localStorage recent searches (S6)
- No cross-source deduplication, clear source labels (S7)

**Activity:**
- Partitioned activity log table (A1)
- Shared RealtimeClient for activity (A2)
- Activity logging middleware/decorators (A3)
- Async export for large datasets (A4)
- Sensitive data redaction registry (A5)
- Role-based activity visibility (A6)
- GDPR-compliant IP/UA handling (A7)

**Profile:**
- **FileStorage abstraction with Postgres bytea (P1)** — modified from local filesystem
- Password-only auth via NextAuth.js (P6)
- Single session + sign-out-everywhere escape hatch (P3)
- GDPR deletion cascade with ownership transfer requirement (P4)
- Unified notification preferences in Profile (P7)

**Onboarding:**
- Dynamic import buttons for connected integrations only (O1)
- Path-based workspace URLs (O2)
- Polling-only sync options (O3)
- JSONB onboarding state persistence (O4)

**Billing:**
- **BillingProvider abstraction (B1)** — Stripe constraint violation fixed
- Database-driven pricing plans (B2)
- Provider-handled proration (B3)
- Async invoice ZIP export (B4)
- Database counter usage metering (B5)
- 14-day trial with banners (B6)

### V2 and Beyond

**Real-Time & Infrastructure:**
- SSE real-time (N1 V2)
- Elasticsearch if Postgres FTS insufficient (S1 V2)
- S3-compatible file storage (P1 V2)
- Distributed tracing (M5 V2)

**Integrations:**
- Monday.com integration (I1 V1.1)
- Asana integration (I1 V1.2)
- Custom field mapping UI (I2 V2)
- Two-way sync (I3 V2)
- Confluence delivery (R4)
- Calendar integration (T3)
- Webhook sync option (O3 — when ready)

**Search & Activity:**
- Query syntax parser (S3 V2)
- Explicit "Did you mean..." typo correction (S5 V2)
- Server-side search history (S6 V2)
- Cross-source task deduplication (S7 V2 — evaluate feasibility)
- Project-scoped activity visibility (A6 V2)

**Profile & Security:**
- 2FA / TOTP (P2 V2)
- Multi-session management (P3 V2)
- Google/Microsoft SSO (P6 V2)

**Enterprise:**
- Custom subdomains (O2 V2)
- Full notification settings (N4 V2)
- Server-side PDF generation (R1 V2)

---

## Profile Decisions

### P1: Avatar Upload / File Storage

| | |
|---|---|
| **Risk** | Avatar upload requires file storage. No storage strategy defined. S3 coupling violates vendor-agnostic constraint. |
| **Decision** | APPROVED WITH MODIFICATION — Abstract FileStorage interface. V1 uses Postgres bytea. V2 uses S3-compatible storage. |
| **Rationale** | Susan proposed local filesystem as V1 option — I'm rejecting that. In serverless/containerized environments, local filesystem is ephemeral. Files vanish on redeploy. Postgres bytea works for small files (avatars are <5MB), requires zero additional infrastructure, and survives restarts. |
| **Scope** | V1 — Postgres bytea; V2 — S3-compatible |
| **Emmy's modification** | Local filesystem is not acceptable for V1. Postgres blob storage is. |

**FileStorage Interface:**
```typescript
interface FileStorage {
  upload(file: Buffer, metadata: FileMetadata): Promise<FileReference>;
  download(ref: FileReference): Promise<Buffer>;
  delete(ref: FileReference): Promise<void>;
  getUrl(ref: FileReference, expiresIn?: number): Promise<string>;
}

interface FileMetadata {
  filename: string;
  contentType: string;
  size: number;
  context: 'avatar' | 'attachment' | 'export';
}

// V1: PostgresFileStorage
// - Store in files table with bytea column
// - Serve via API endpoint /api/files/:id
// - Works anywhere, zero infrastructure

// V2: S3FileStorage  
// - Works with AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces
// - All use S3-compatible API
// - Signed URLs for direct download
// - CDN integration for avatars
```

**V1 Schema:**
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  context VARCHAR(50) NOT NULL,
  data BYTEA NOT NULL,  -- The actual file content
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for cleanup jobs
CREATE INDEX idx_files_context_created ON files (context, created_at);
```

**Size Limits:**
- Avatars: 5MB max
- Attachments: 25MB max (V2)
- Exports: No limit (generated server-side)

---

### P2: Two-Factor Authentication (2FA)

| | |
|---|---|
| **Risk** | 2FA (TOTP, backup codes, recovery) is non-trivial security-critical feature. |
| **Decision** | APPROVED — V2 feature. V1 ships with password-only authentication. |
| **Rationale** | 2FA is important but not V1 critical. Doing it wrong is worse than not doing it. V1 focus is core product value, not advanced security features. |
| **Scope** | V1 — Password only; V2 — TOTP + backup codes |
| **Emmy's specification for V2** | |

**V2 Implementation Plan:**
- Library: `otplib` (standard, well-tested)
- Secret storage: Encrypted at rest (AES-256-GCM with org-specific key)
- Backup codes: 10 one-time codes, stored as bcrypt hashes
- Recovery: Email-based recovery with 24-hour cooldown
- Enforcement: Optional per-user, org can require for Admins/Owners

---

### P3: Session Management

| | |
|---|---|
| **Risk** | "Active sessions" display requires multi-session tracking with device/location info. |
| **Decision** | APPROVED WITH ADDITION — V1 = single session with "sign out everywhere" escape hatch. V2 = full session management. |
| **Rationale** | Multi-session tracking needs server-side session store, device fingerprinting, IP geolocation. That's V2 scope. But V1 needs a "my device was stolen" escape hatch. |
| **Scope** | V1 — Single session + emergency sign-out; V2 — Multi-session UI |
| **Emmy's addition** | V1 must have "Sign out of all sessions" button. |

**V1 Implementation:**
```typescript
// users table gets a token_version column
ALTER TABLE users ADD COLUMN token_version INT NOT NULL DEFAULT 1;

// JWT includes token_version
const token = jwt.sign({ 
  userId, 
  tokenVersion: user.token_version 
}, secret);

// Validation checks version
if (payload.tokenVersion !== user.token_version) {
  throw new UnauthorizedError('Session invalidated');
}

// "Sign out everywhere" increments version
await db.users.update({ 
  where: { id: userId },
  data: { token_version: { increment: 1 } }
});
```

**V2 Session Management:**
- Server-side session store (Redis or Postgres)
- Track: device type, browser, IP, location (via IP geolocation)
- UI: List all sessions, revoke individual sessions
- Auto-expire: Inactive sessions after 30 days

---

### P4: Account Deletion (GDPR Cascade)

| | |
|---|---|
| **Risk** | "Delete Account" must cascade across all tables for GDPR compliance. Incomplete deletion = legal liability. |
| **Decision** | APPROVED WITH SPECIFICATION — Formal deletion cascade with ownership transfer requirement. |
| **Rationale** | Some data is hard-deleted, some is anonymized (for audit trail integrity). Projects require ownership transfer before deletion is allowed. |
| **Scope** | V1 — Full GDPR compliance |
| **Emmy's specification** | |

**Deletion Cascade:**

| Data Type | Action | Rationale |
|-----------|--------|-----------|
| User record | Hard delete | Personal data |
| Sessions | Hard delete | Personal data |
| Notification preferences | Hard delete | Personal data |
| Notifications (to user) | Hard delete | Personal data |
| Linked OAuth identities | Hard delete | Personal data |
| Activity log (as actor) | Anonymize → "Deleted User" | Audit trail integrity |
| Comments/mentions | Anonymize → "Deleted User" | Content integrity |
| Tasks (assignee) | Set to null | Data integrity |
| Tasks (created_by) | Anonymize → "Deleted User" | Audit trail |
| Team membership | Remove | Relationship cleanup |
| Projects (if owner) | **BLOCK — require transfer first** | Prevent orphaned projects |

**Pre-Deletion Checks:**
```typescript
async function canDeleteAccount(userId: string): Promise<DeleteBlockers> {
  const ownedProjects = await db.projects.count({ where: { ownerId: userId } });
  const pendingExports = await db.exportJobs.count({ 
    where: { userId, status: 'pending' } 
  });
  
  return {
    canDelete: ownedProjects === 0 && pendingExports === 0,
    blockers: {
      ownedProjects, // "Transfer ownership of N projects first"
      pendingExports, // "Wait for N exports to complete"
    }
  };
}
```

**Deletion Flow:**
1. User requests deletion
2. Check for blockers (owned projects, pending jobs)
3. If blocked: show what needs to be resolved
4. If clear: 7-day grace period (can cancel)
5. After grace period: execute cascade deletion
6. Send confirmation email (to a stored email, then delete)

---

### P5: RBAC Role Inconsistency

| | |
|---|---|
| **Risk** | Jeff spec uses 3 roles (admin/member/viewer). C2 decision specifies 4 roles (Owner/Admin/Member/Viewer). Inconsistency. |
| **Decision** | APPROVED — Flag for Jeff spec update. 4-role model is canonical. |
| **Rationale** | This is a documentation issue, not a technical decision. The 4-role model is decided. Jeff's spec needs to be updated before handoff to engineering. |
| **Scope** | V1 — Spec update required |
| **Emmy's note** | Add to Jeff's final punch list: Update all specs to reference 4-role model (Owner/Admin/Member/Viewer). |

---

### P6: Social Sign-On (Google, Microsoft)

| | |
|---|---|
| **Risk** | Google SSO requires OAuth integration, linked account handling, and affects signup flow significantly. |
| **Decision** | APPROVED — V1 = email + password via NextAuth.js. V2 = Google and Microsoft SSO. |
| **Rationale** | NextAuth.js makes adding SSO providers relatively easy in V2. But V1 scope is already full. Email + password is sufficient for launch. |
| **Scope** | V1 — Email/password; V2 — Google + Microsoft SSO |
| **Emmy's notes** | |

**Why NextAuth.js for V1:**
- Handles password auth securely (bcrypt, CSRF, etc.)
- Adding Google/Microsoft in V2 is just adding providers to config
- Session management built-in
- JWT or database sessions (we'll use JWT for simplicity)

**V2 SSO Considerations:**
- Linked accounts: If user signs up with email, then tries Google with same email = link accounts
- Org restrictions: Enterprise orgs may want "Google SSO only" or "must match @company.com domain"
- Microsoft is critical for enterprise (Azure AD / Entra integration)

---

### P7: Notification Preferences (Profile Integration)

| | |
|---|---|
| **Risk** | Notification preferences in Profile tab overlaps with N4 decision. Could create duplicate implementations. |
| **Decision** | APPROVED — This IS the N4 implementation. Single source of truth. |
| **Rationale** | Good alignment between spec and technical decision. The Profile > Notifications tab is where N4 preferences live. Same data model, same API. |
| **Scope** | V1 — Unified implementation |
| **Emmy's specification** | |

**Data Model (single source):**
```typescript
interface NotificationPreferences {
  userId: string;
  
  // Channel preferences
  channels: {
    inApp: boolean;    // Default: true
    email: boolean;    // Default: false
  };
  
  // Type preferences
  types: {
    syncEvents: boolean;   // New items, updates
    riskAlerts: boolean;   // Blockers, delays  
    mentions: boolean;     // Someone mentioned you
    reports: boolean;      // Scheduled report ready
  };
  
  // Digest preference
  digestMode: 'realtime' | 'daily' | 'weekly';
  digestTime: string;  // "09:00" for daily/weekly
  digestDay?: number;  // 1 = Monday, for weekly
}
```

**API Endpoints:**
- `GET /api/users/me/notification-preferences`
- `PATCH /api/users/me/notification-preferences`

**UI Location:** Profile > Notifications tab (as Jeff specced)

---

## Onboarding Decisions

### O1: Integration Import Buttons

| | |
|---|---|
| **Risk** | Spec shows "Import from Slack" but Slack isn't a V1 integration. Creates false expectations. |
| **Decision** | APPROVED — Only show import options for actually connected integrations. |
| **Rationale** | Don't show what we can't deliver. UI must reflect actual state, not aspirational roadmap. |
| **Scope** | V1 — Dynamic UI |
| **Emmy's specification** | |

**Implementation:**
```typescript
// Step 3: Import Data
function ImportStep({ connectedIntegrations }: Props) {
  // Only show buttons for what's actually connected
  return (
    <div>
      {connectedIntegrations.includes('jira') && (
        <ImportButton provider="jira" />
      )}
      {connectedIntegrations.includes('monday') && (
        <ImportButton provider="monday" />
      )}
      {connectedIntegrations.includes('asana') && (
        <ImportButton provider="asana" />
      )}
      {connectedIntegrations.length === 0 && (
        <EmptyState message="Connect an integration in Step 2 to import data" />
      )}
    </div>
  );
}
```

---

### O2: Workspace URL Routing

| | |
|---|---|
| **Risk** | Workspace URLs (vantage.io/acme-corp) imply multi-tenancy routing. Subdomains vs paths have very different infrastructure needs. |
| **Decision** | APPROVED — Path-based routing for V1. Custom subdomains for V2 enterprise. |
| **Rationale** | Path-based is dramatically simpler: no wildcard SSL, no DNS configuration, works with any hosting provider, simpler middleware. Custom subdomains are an enterprise vanity feature. |
| **Scope** | V1 — Path-based; V2 — Custom subdomains (enterprise) |
| **Emmy's specification** | |

**V1 URL Structure:**
```
https://app.vantage.io/acme-corp/dashboard
https://app.vantage.io/acme-corp/notifications
https://app.vantage.io/acme-corp/settings
```

**Routing Middleware:**
```typescript
// Middleware extracts org slug from path
export function withOrg(handler: Handler) {
  return async (req: Request) => {
    const orgSlug = req.nextUrl.pathname.split('/')[1];
    const org = await db.orgs.findBySlug(orgSlug);
    if (!org) return notFound();
    
    // Verify user has access to this org
    const membership = await db.memberships.find({ userId, orgId: org.id });
    if (!membership) return forbidden();
    
    req.org = org;
    req.membership = membership;
    return handler(req);
  };
}
```

**V2 Custom Subdomains (Enterprise):**
- `acme.vantage.io` → requires wildcard SSL cert + DNS configuration
- Stored as `custom_domain` on orgs table
- Enterprise-only feature, additional setup required
- Redirects from path-based to subdomain when configured

---

### O3: Webhook Sync Option

| | |
|---|---|
| **Risk** | "Real-time (webhooks + every 5 min)" option promises webhook infrastructure that may not exist at launch. |
| **Decision** | APPROVED — Only show polling options until webhook infrastructure is ready. |
| **Rationale** | Same principle as O1: don't promise what we can't deliver. Webhooks require registration, ingestion, signature verification, retry logic. Show the option when it works. |
| **Scope** | V1 — Polling only; Webhook option appears when ready |
| **Emmy's specification** | |

**V1 Sync Options:**
```typescript
const SYNC_OPTIONS = [
  { value: 'every_5_min', label: 'Every 5 minutes', default: true },
  { value: 'every_15_min', label: 'Every 15 minutes' },
  { value: 'hourly', label: 'Every hour' },
  { value: 'manual', label: 'Manual only' },
];

// When webhook infra is ready, add:
// { value: 'realtime', label: 'Real-time (webhooks + 5 min backup)', premium: true }
```

**Feature Flag:**
```typescript
const showWebhookOption = await featureFlags.isEnabled('webhook_sync', orgId);
```

---

### O4: Onboarding Progress Persistence

| | |
|---|---|
| **Risk** | Onboarding progress must survive page refresh, browser close, and device switch. |
| **Decision** | APPROVED — Store as JSONB column on users table. |
| **Rationale** | Simple, no new tables, server-side persistence enables cross-device resume. |
| **Scope** | V1 — Core architecture |
| **Emmy's specification** | |

**Schema:**
```sql
ALTER TABLE users ADD COLUMN onboarding_state JSONB DEFAULT '{}';
```

**Data Structure:**
```typescript
interface OnboardingState {
  currentStep: number;           // 1-5
  completedSteps: number[];      // [1, 2]
  startedAt: string;             // ISO timestamp
  completedAt?: string;          // ISO timestamp when finished
  
  // Step-specific data
  workspaceName?: string;
  workspaceSlug?: string;
  selectedIntegrations?: string[];
  syncFrequency?: string;
  importedSources?: string[];
  invitedEmails?: string[];
}
```

**API:**
- `GET /api/onboarding/state` — Get current state
- `PATCH /api/onboarding/state` — Update state
- `POST /api/onboarding/complete` — Mark complete, redirect to dashboard

---

## Billing Decisions

### B1: Stripe Coupling (CONSTRAINT VIOLATION)

| | |
|---|---|
| **Risk** | Spec hardcodes Stripe throughout: `stripeSubscriptionId`, `stripePaymentMethodId`, Stripe Elements. This VIOLATES the vendor-agnostic constraint. |
| **Decision** | APPROVED — Abstract BillingProvider interface. Stripe is V1 implementation but domain models are provider-agnostic. |
| **Rationale** | This is a direct constraint violation that must be fixed. Stripe is fine as the V1 provider, but we cannot have Stripe types in domain models. If we ever need to switch (Stripe pricing changes, regional requirements, acquisition), we need clean abstraction. |
| **Scope** | V1 — Abstraction required |
| **Emmy's specification** | |

**BillingProvider Interface:**
```typescript
interface BillingProvider {
  // Customer management
  createCustomer(org: Organization): Promise<string>;  // Returns provider customer ID
  updateCustomer(customerId: string, data: CustomerUpdate): Promise<void>;
  
  // Subscription management
  createSubscription(customerId: string, planId: string): Promise<Subscription>;
  updateSubscription(subscriptionId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string, immediate?: boolean): Promise<void>;
  
  // Payment methods
  createSetupIntent(customerId: string): Promise<SetupIntent>;
  listPaymentMethods(customerId: string): Promise<PaymentMethod[]>;
  setDefaultPaymentMethod(customerId: string, methodId: string): Promise<void>;
  
  // Invoices
  listInvoices(customerId: string): Promise<Invoice[]>;
  getInvoicePdf(invoiceId: string): Promise<Buffer>;
  
  // Webhooks
  constructEvent(payload: string, signature: string): Promise<BillingEvent>;
}

// Domain models are provider-agnostic
interface Subscription {
  id: string;              // Our ID
  providerId: string;      // Stripe's ID (or Paddle's, etc.)
  planId: string;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}
```

**Database Schema (Provider-Agnostic):**
```sql
CREATE TABLE org_billing (
  org_id UUID PRIMARY KEY REFERENCES orgs(id),
  billing_provider VARCHAR(50) NOT NULL DEFAULT 'stripe',
  provider_customer_id VARCHAR(255),  -- Stripe customer ID, Paddle ID, etc.
  provider_metadata JSONB DEFAULT '{}',  -- Provider-specific data
  plan_id UUID REFERENCES billing_plans(id),
  subscription_status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false
);

-- NOT this (violates constraint):
-- stripe_subscription_id VARCHAR(255)  ❌
-- stripe_payment_method_id VARCHAR(255)  ❌
```

---

### B2: Hardcoded Pricing Tiers

| | |
|---|---|
| **Risk** | Pricing tiers (Free/Team/Enterprise) are baked into spec but not validated with customers. Hardcoding prevents iteration. |
| **Decision** | APPROVED — Config-driven pricing. Store plans in database. |
| **Rationale** | Pricing is the #1 thing that changes post-launch. A/B testing, promotional tiers, grandfather plans, enterprise custom pricing — all require flexibility. |
| **Scope** | V1 — Database-driven plans |
| **Emmy's specification** | |

**Plans Table:**
```sql
CREATE TABLE billing_plans (
  id UUID PRIMARY KEY,
  name VARCHAR(50) NOT NULL,           -- 'free', 'team', 'enterprise'
  display_name VARCHAR(100) NOT NULL,  -- 'Free', 'Team', 'Enterprise'
  description TEXT,
  
  -- Pricing
  price_monthly_cents INT NOT NULL,    -- 0 for free
  price_annual_cents INT NOT NULL,     -- Annual discount
  
  -- Features (for display)
  features JSONB NOT NULL,             -- ["Unlimited projects", "5 integrations", ...]
  
  -- Limits (for enforcement)
  limits JSONB NOT NULL,               -- {"team_members": 5, "integrations": 2, ...}
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,      -- Can new orgs select this?
  is_public BOOLEAN DEFAULT true,      -- Shown on pricing page?
  sort_order INT NOT NULL,
  
  -- Provider mapping
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_annual VARCHAR(255),
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Limit Enforcement:**
```typescript
interface PlanLimits {
  teamMembers: number;      // -1 = unlimited
  integrations: number;
  projects: number;
  apiCallsPerMonth: number;
  storageBytes: number;
  aiSummariesPerMonth: number;
}

async function checkLimit(orgId: string, limit: keyof PlanLimits): Promise<boolean> {
  const org = await getOrg(orgId);
  const plan = await getPlan(org.planId);
  const usage = await getUsage(orgId, limit);
  
  if (plan.limits[limit] === -1) return true;  // Unlimited
  return usage < plan.limits[limit];
}
```

---

### B3: Proration Calculations

| | |
|---|---|
| **Risk** | Mid-cycle upgrade/downgrade proration is complex (daily calculations, credits, edge cases). |
| **Decision** | APPROVED — Defer entirely to billing provider. Zero custom proration logic. |
| **Rationale** | Stripe (and every other billing provider) handles proration correctly. This is exactly why we use a billing provider. Building custom proration logic is inviting bugs and accounting nightmares. |
| **Scope** | V1 — Provider-handled |
| **Emmy's strong agreement** | Do NOT build custom proration. One line of code: |

```typescript
// Upgrade/downgrade — Stripe handles proration
await stripe.subscriptions.update(subscriptionId, {
  items: [{ id: itemId, price: newPriceId }],
  proration_behavior: 'create_prorations',  // Stripe calculates credits/charges
});
```

---

### B4: Invoice ZIP Download

| | |
|---|---|
| **Risk** | "Download All as ZIP" for invoices requires server-side ZIP generation, potentially large files. |
| **Decision** | APPROVED — Async pg-boss job, same pattern as A4 (Activity export). |
| **Rationale** | Consistent pattern across the app. User initiates, job processes in background, notification when ready. |
| **Scope** | V1 — Async export |
| **Emmy's specification** | Same as A4: |

1. User clicks "Download All Invoices"
2. Create pg-boss job with org ID and date range
3. Return job ID, show "Preparing download..."
4. Job fetches invoice PDFs from billing provider
5. Job creates ZIP archive (streaming, chunked)
6. Upload to file storage (P1 interface)
7. Generate signed download URL (24h expiry)
8. Send notification + email

---

### B5: Usage Metering

| | |
|---|---|
| **Risk** | Usage-based limits (API calls, storage) require metering infrastructure. |
| **Decision** | APPROVED — V1 = database counters. V2 = dedicated metering if scale requires. |
| **Rationale** | Database counters are simple and sufficient for V1 scale. Premature optimization to build dedicated metering infrastructure. |
| **Scope** | V1 — Database counters |
| **Emmy's specification** | |

**Usage Tracking Table:**
```sql
CREATE TABLE usage_metrics (
  org_id UUID NOT NULL,
  metric VARCHAR(50) NOT NULL,        -- 'api_calls', 'storage_bytes', 'ai_summaries'
  period VARCHAR(7) NOT NULL,         -- '2026-02' (year-month)
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (org_id, metric, period)
);
```

**Increment Pattern:**
```typescript
// API calls: increment on each request (middleware)
await db.usageMetrics.upsert({
  where: { org_id_metric_period: { orgId, metric: 'api_calls', period: '2026-02' } },
  create: { orgId, metric: 'api_calls', period: '2026-02', value: 1 },
  update: { value: { increment: 1 }, updatedAt: new Date() }
});

// Storage: nightly recalculation job
const storageBytes = await db.files.aggregate({
  where: { orgId },
  _sum: { sizeBytes: true }
});
await db.usageMetrics.upsert({ ... });

// AI summaries: increment when LLM called
// Same pattern as API calls
```

---

### B6: Trial Period

| | |
|---|---|
| **Risk** | "Trial ending soon" banner implies trial flow that isn't specced anywhere. |
| **Decision** | APPROVED — Add trial flow. 14 days, no credit card required, banners at 7/3/1 days. |
| **Rationale** | Standard SaaS trial is expected. Reduces friction to signup. |
| **Scope** | V1 — Trial flow required |
| **Emmy's specification** | |

**Trial Rules:**
- Duration: 14 days from org creation
- Credit card: NOT required to start
- Features: Full Team plan access during trial
- Banners: Show at 7, 3, 1 days remaining
- Expiry: 3-day grace period after trial ends
- Post-grace: Downgrade to Free plan (not lockout)

**Schema Addition:**
```sql
ALTER TABLE orgs ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE orgs ADD COLUMN trial_extended BOOLEAN DEFAULT false;

-- Set on org creation
UPDATE orgs SET trial_ends_at = NOW() + INTERVAL '14 days' WHERE id = $newOrgId;
```

**Banner Logic:**
```typescript
function getTrialBanner(org: Organization): TrialBanner | null {
  if (!org.trialEndsAt) return null;
  if (org.planId !== FREE_PLAN_ID) return null;  // Paid, no banner
  
  const daysLeft = differenceInDays(org.trialEndsAt, new Date());
  
  if (daysLeft > 7) return null;
  if (daysLeft <= 0) return { type: 'expired', daysAgo: Math.abs(daysLeft) };
  if (daysLeft <= 1) return { type: 'urgent', daysLeft: 1 };
  if (daysLeft <= 3) return { type: 'warning', daysLeft };
  return { type: 'info', daysLeft };
}
```

---

### B7: Build Order (Billing Last)

| | |
|---|---|
| **Risk** | Building Billing before core product is premature optimization. Can't charge for a product that doesn't work. |
| **Decision** | APPROVED WITH MODIFICATION — Billing is last. Modified build order specified below. |
| **Rationale** | Susan's order is mostly right. I have one modification: Onboarding needs a stub earlier (can't get users in without it), but polish is late. |
| **Scope** | V1 — Build order |
| **Emmy's recommended build order** | |

**Build Order:**

| Order | Screen | Rationale |
|-------|--------|-----------|
| 1 | **Integrations** | Core value prop. Need data before anything else works. |
| 2 | **Team/People** | Identity resolution needed early. Who is doing what? |
| 3 | **Onboarding (Stub)** | Basic flow to get users into system. Polish later. |
| 4 | **Notifications** | Drives engagement. Needs integrations (sync events) and team (mentions). |
| 5 | **Search** | Usability. Needs data from integrations. |
| 6 | **Activity** | Cross-cutting audit trail. Needs data to log. |
| 7 | **Reports** | Output layer. Needs all the above data. Scout AI integration. |
| 8 | **Profile** | Settings and preferences. Standalone. |
| 9 | **Onboarding (Polish)** | Full flow with all integrations available. |
| 10 | **Billing** | Dead last. Needs everything else working. Can't charge for broken product. |

**Dependency Graph:**
```
Integrations ─────┬───────────────────────────────────────┐
                  │                                       │
                  ▼                                       ▼
            Team/People ──────► Notifications ───► Reports
                  │                   │               │
                  │                   ▼               │
                  └────────────► Search ◄────────────┘
                                    │
                                    ▼
                               Activity
                                    │
                                    ▼
                               Profile
                                    │
                                    ▼
                              Onboarding
                                    │
                                    ▼
                               Billing
```

---

## Final Observations

### Cross-Spec Patterns & Concerns

After reviewing all 9 specs, several patterns emerge that warrant attention:

#### 1. Real-Time Expectations Mismatch

**Pattern:** Almost every spec assumes WebSocket real-time updates.
**Reality:** We've correctly decided on polling with abstraction (N1), but Jeff consistently specs WebSocket behavior.
**Concern:** Engineers may over-build, or users may expect instant updates and be disappointed.
**Mitigation:** Update all specs to say "updates appear within 30 seconds" not "real-time." Set correct expectations.

#### 2. Consistent Feature Creep

**Pattern:** Jeff specs V2+ features without flagging them as future scope.
- 2FA (P2) — specced as if V1
- Advanced query syntax (S3) — specced as if V1
- Google SSO (P6) — specced as if V1
- Custom subdomains (O2) — specced as if V1
- Webhook sync (O3) — specced as if V1

**Concern:** Creates expectation mismatch. Engineering estimates based on spec include V2 features.
**Mitigation:** Go back through specs and add "V2" or "Future" labels to deferred features. This should be Jeff's punch list item.

#### 3. Desktop-Only Design

**Pattern:** Every spec is desktop-focused. Zero mobile/tablet considerations.
**Reality:** We decided responsive design (M2) but Jeff hasn't designed for mobile.
**Concern:** Engineering will have to invent mobile layouts, causing inconsistency and rework.
**Mitigation:** For V1, accept desktop-optimized with responsive basics. Note that mobile-specific designs are needed for V2.

#### 4. RBAC Inconsistency

**Pattern:** Jeff uses 3 roles (admin/member/viewer) in some specs. We decided 4 roles (Owner/Admin/Member/Viewer) in C2.
**Concern:** Engineering builds wrong permission model, or we have inconsistent behavior across screens.
**Mitigation:** Jeff punch list: update all specs to 4-role model.

#### 5. Integration-Specific Assumptions

**Pattern:** Many specs assume Jira-specific concepts: story points, sprints, epics.
**Reality:** Monday.com uses "items" and "effort," Asana uses "tasks" and "sections."
**Concern:** UI designed around Jira won't translate to other providers.
**Mitigation:** Use abstracted Vantage terminology in UI. Jira "Story" = Monday "Item" = Asana "Task" = Vantage "Task." We've addressed this in T1 (normalization) but it affects UI copy too.

#### 6. Missing Error States

**Pattern:** No spec describes error states. What happens when Jira is down? When sync fails? When search returns errors?
**Reality:** We defined error handling strategy (M1) but Jeff hasn't designed error UI.
**Concern:** Engineering will invent inconsistent error presentations.
**Mitigation:** Need a brief "Error States" addendum defining: loading states, error banners, retry patterns, empty states.

---

### V1 Scope Reality Check

**Is V1 achievable for a small team in 3 months?**

Let me count major engineering efforts:

| Component | Estimated Effort | Dependencies |
|-----------|------------------|--------------|
| Auth (NextAuth) | 1 week | None |
| Integrations (Jira + abstraction) | 3-4 weeks | Auth |
| Team/People (identity resolution) | 2-3 weeks | Integrations |
| Notifications (with preferences) | 2 weeks | Integrations, Team |
| Search (Postgres FTS) | 1-2 weeks | Integrations |
| Activity Log | 1-2 weeks | All (cross-cutting) |
| Reports (with Scout AI) | 3-4 weeks | All data sources |
| Profile | 1 week | Auth |
| Onboarding | 1-2 weeks | Integrations |
| Billing (Stripe abstraction) | 2-3 weeks | All (last) |

**Total: 18-24 engineer-weeks**

**Team capacity calculation:**
- 3 engineers × 12 weeks = 36 engineer-weeks
- 4 engineers × 12 weeks = 48 engineer-weeks

**Assessment:** 

With **3 engineers**: TIGHT. 18-24 weeks of work / 36 capacity = 50-67% utilization. Sounds fine, but this leaves no buffer for:
- Bug fixes and rework (typically 20-30% overhead)
- Code review and collaboration overhead (10-15%)
- Testing (M4 requires 80% coverage — that's real work)
- Unexpected technical challenges
- Sick days, vacations, context switching

**Realistic 3-engineer timeline: 4-5 months, not 3.**

With **4 engineers**: ACHIEVABLE with discipline. 48 capacity gives ~50% buffer for overhead. Still tight but doable IF:
- Scope is truly frozen (no creep)
- Dependencies are parallelized correctly
- No major technical surprises

**Recommendation:** 

Option A: **4 engineers, 3 months, aggressive** — possible but high risk
Option B: **3 engineers, 4 months, realistic** — better confidence
Option C: **Cut scope further** — what can we defer?

**Scope cuts to consider if needed:**
1. Activity Log → V1.1 (saves 1-2 weeks)
2. Reports → V1.1, ship without Scout AI summaries (saves 2 weeks)
3. Onboarding → minimal stub only (saves 1 week)

---

### Critical Risks Not Yet Addressed

#### CR1: No Design System / Component Library Spec

**Risk:** We have Tailwind + custom components decision, but no actual design system documentation. No spacing scale, no color tokens, no component API specs.
**Impact:** Engineers will make inconsistent decisions. "What shade of gray?" "How much padding?" Every screen will look slightly different.
**Mitigation:** Need a design system document or Figma file before engineering starts. Even a minimal one: colors, spacing, typography, button variants.

#### CR2: Scout AI Complexity Underestimated

**Risk:** "AI summaries" sounds simple. In reality: prompt engineering, context window management, quality tuning, error handling, cost management, latency optimization.
**Impact:** Could easily consume 2x estimated time. Bad AI output damages product perception.
**Mitigation:** Spike on Scout AI early (week 1-2). Validate prompt quality before committing to full build. Have fallback: "AI summary unavailable" is better than bad AI summary.

#### CR3: Testing Time Not Allocated

**Risk:** M4 specifies 80% unit coverage, critical path E2E, integration tests for all providers. That's real engineering time.
**Impact:** Either testing gets skipped (quality suffers) or timeline slips.
**Mitigation:** Explicitly allocate 20% of engineering time to testing. It's not overhead; it's part of the work.

#### CR4: No Staging Environment Strategy

**Risk:** How do we test integrations without affecting real Jira/Monday/Asana data?
**Impact:** Either we test in production (dangerous) or we can't test properly.
**Mitigation:** Need sandbox/test accounts for each provider. Jira Cloud has free tier, Monday has trial, Asana has free tier. Document test account credentials securely.

#### CR5: Data Migration Path Not Defined

**Risk:** What if we need to change schema after launch? We have M3 (migration strategy) but no specific migration testing plan.
**Impact:** Schema changes on production data could cause outages or data loss.
**Mitigation:** Every PR with schema changes must be tested against production-scale data snapshot. Add to CI/CD pipeline.

---

### Jeff's Final Punch List

Before specs are considered complete, Jeff should:

1. ☐ Add "V2" or "Future" labels to all deferred features
2. ☐ Update all RBAC references to 4-role model (Owner/Admin/Member/Viewer)
3. ☐ Answer the 12 open questions from Search (S-Q1 to S-Q6) and Activity (A-Q1 to A-Q6)
4. ☐ Add error state guidance for each screen (loading, error, empty, degraded)
5. ☐ Review integration-specific terminology for provider-agnostic language
6. ☐ Add "Assumptions" section to specs that currently say "Open Questions: None"

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2026-02-08 | Emmy | Initial document from Susan's proposals |
| 2026-02-08 | Emmy | Elevated N4 (notification preferences) to V1 |
| 2026-02-08 | Emmy | Rejected node-cron for R3, specified pg-boss |
| 2026-02-08 | Emmy | Modified C2 from 3-tier to 4-tier RBAC |
| 2026-02-08 | Emmy | Modified T4 from 2-mode to 3-mode visibility |
| 2026-02-08 | Emmy | Added M1-M5 (missing risks) |
| 2026-02-08 | Emmy | Narrowed I3 from "event sourcing" to "event log" |
| 2026-02-08 | Emmy | Added Search decisions S1-S7 |
| 2026-02-08 | Emmy | Added Activity decisions A1-A7 |
| 2026-02-08 | Emmy | Modified S3 from plain-text-only to plain-text + UI filters |
| 2026-02-08 | Emmy | Added Jeff's unanswered questions (S-Q1 to S-Q6, A-Q1 to A-Q6) |
| 2026-02-08 | Emmy | Added Profile decisions P1-P7 |
| 2026-02-08 | Emmy | Added Onboarding decisions O1-O4 |
| 2026-02-08 | Emmy | Added Billing decisions B1-B7 |
| 2026-02-08 | Emmy | **Rejected local filesystem for P1**, specified Postgres bytea |
| 2026-02-08 | Emmy | **Fixed B1 Stripe constraint violation** with BillingProvider abstraction |
| 2026-02-08 | Emmy | Added Final Observations section with cross-spec analysis |
| 2026-02-08 | Emmy | Added V1 scope reality check (3-4 engineer team assessment) |
| 2026-02-08 | Emmy | Added 5 critical risks (CR1-CR5) |
| 2026-02-08 | Emmy | Added Jeff's final punch list (6 items) |
