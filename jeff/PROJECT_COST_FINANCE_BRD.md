# Project Cost & Finance Intelligence
## Business Requirements Document (BRD)

**Author:** Jeff, SVP Product  
**Version:** 1.0  
**Date:** January 2025  
**Status:** Draft for Engineering Review

---

## Executive Summary

Cloud cost management has matured from "show me my bill" to "help me understand unit economics." Yet a critical gap remains: **connecting cloud spend to business outcomes at the project level.**

Today, FinOps teams can tell you AWS spent $2.3M last month. What they *can't* easily tell you: How much did Project Phoenix cost? Is Feature X profitable? Should we kill that ML experiment before it bleeds us dry?

**Project Cost & Finance Intelligence** bridges this gap. We're building a system that lets organizations define projects as first-class citizens, automatically allocates spend across complex multi-service architectures, and surfaces the financial intelligence needed to make build/buy/kill decisions with confidence.

This isn't another tagging enforcement tool. This is the financial nervous system for modern engineering organizations.

**Target outcome:** Reduce time-to-insight for project-level cost questions from days → seconds. Enable $50M+ organizations to operate with the cost visibility of a scrappy startup.

---

## Problem Statement

### The Core Problem

Engineering leaders are flying blind on project economics. They have two choices today:

1. **Manual spreadsheet hell:** Finance exports bills, engineering provides allocation guesses, someone spends 3 days reconciling. Results are stale before they're shared.

2. **Tag-and-pray:** Mandate tagging, watch compliance crater, argue about untaggeable shared resources, give up.

Neither approach answers the questions that actually matter:

- "What's the fully-loaded cost of our checkout service, including shared infra?"
- "How has Project Atlas cost trended against its approved budget?"
- "If we sunset Feature X, what's the *actual* savings after accounting for shared dependencies?"

### Why Now?

Three market forces make this urgent:

1. **CFO scrutiny is permanent.** Post-ZIRP, every dollar needs justification. "Cloud is complicated" no longer flies.

2. **Platform engineering demands chargebacks.** Internal platforms need usage-based billing to create accountability.

3. **AI/ML spend is exploding unpredictably.** GPU costs can 10x overnight. Organizations need project-level guardrails, not just account-level alerts.

### The Opportunity

Organizations with mature project-level cost visibility report:
- 23% faster resource allocation decisions
- 31% reduction in "zombie" projects (running but abandoned)
- 18% improvement in engineering productivity (less time justifying spend)

We can be the system of record for project economics.

---

## Personas

### Primary: Platform Engineering Lead — "Morgan"

**Demographics:** Senior IC or Engineering Manager, 8-12 YOE, reports to VP Eng  
**Responsibilities:** Internal developer platform, shared infrastructure, cost allocation to consuming teams

**Goals:**
- Implement fair, defensible chargebacks to product teams
- Prove platform ROI to leadership
- Reduce "why is my bill so high?" Slack messages by 90%

**Pain Points:**
- Shared resources (K8s clusters, databases, observability) are allocation nightmares
- No single source of truth—finance has one number, eng has another
- Tagging compliance is a losing battle

**Quote:** *"I spend 20% of my time being a human cost allocation engine. That's not what I was hired for."*

---

### Secondary: FinOps Practitioner — "Jordan"

**Demographics:** FinOps Certified, 3-6 YOE, either dedicated FinOps or finance-adjacent  
**Responsibilities:** Cost optimization, budget forecasting, anomaly investigation

**Goals:**
- Deliver monthly project cost reports without heroic effort
- Proactively surface cost risks before they become crises
- Build trust with engineering through accurate data

**Pain Points:**
- Reconciling cloud bills to internal project structures is manual
- Can't answer "what if we did X?" questions quickly
- Anomalies detected at account level, not project level

**Quote:** *"Engineering asks great questions. I just can't answer them fast enough to be useful."*

---

### Tertiary: VP of Engineering — "Alex"

**Demographics:** Executive, manages 50-200 engineers, P&L adjacent  
**Responsibilities:** Roadmap prioritization, resource allocation, board-level reporting

**Goals:**
- Make data-driven build/buy/kill decisions
- Defend engineering spend to CFO with confidence
- Identify high-ROI vs. money-pit projects

**Pain Points:**
- Project cost data arrives too late to influence decisions
- Can't easily compare cost efficiency across teams
- "What does Project X actually cost?" triggers a 2-week analysis

**Quote:** *"I have 47 active projects and zero confidence in the cost of any of them."*

---

## Jobs to Be Done (JTBD)

### Job 1: Define What Constitutes a "Project"

**When** I'm setting up cost tracking for a new initiative,  
**I want to** define a project boundary that captures all relevant cloud resources,  
**So that** I have a single source of truth for that project's spend.

**Success Criteria:**
- Can define projects using tags, accounts, services, resource patterns, or combinations
- Can model hierarchies (Project → Sub-projects → Components)
- Can handle resources that belong to multiple projects (shared infra)

---

### Job 2: Allocate Shared Costs Fairly

**When** I have shared infrastructure (K8s, databases, networking) used by multiple projects,  
**I want to** allocate those costs based on actual usage,  
**So that** each project's cost reflects reality and teams accept the numbers.

**Success Criteria:**
- Support multiple allocation strategies (proportional, fixed, usage-based)
- Allocation logic is transparent and auditable
- Can re-run historical allocations when rules change

---

### Job 3: Track Project Spend Against Budget

**When** a project has an approved budget,  
**I want to** see real-time spend vs. budget with forecasted end-state,  
**So that** I can course-correct before overruns become crises.

**Success Criteria:**
- Set budgets at project level with time granularity (monthly, quarterly, total)
- Visual burn-down/burn-up with forecast
- Alerts at configurable thresholds (50%, 80%, 100%, 120%)

---

### Job 4: Investigate Cost Changes Instantly

**When** a project's cost spikes or drops unexpectedly,  
**I want to** drill down from project → service → resource → change event,  
**So that** I can identify root cause in minutes, not days.

**Success Criteria:**
- Anomaly detection at project level, not just account
- One-click drill-down with context preserved
- Surface correlated events (deployments, scaling events, pricing changes)

---

### Job 5: Model Financial Scenarios

**When** I'm considering changes (sunset feature, migrate region, adopt reserved capacity),  
**I want to** model the cost impact on affected projects,  
**So that** I can make informed decisions with quantified trade-offs.

**Success Criteria:**
- "What-if" scenario builder
- Impact shown at project level, not just aggregate
- Save and compare multiple scenarios

---

### Job 6: Report to Leadership with Confidence

**When** it's time for monthly/quarterly business reviews,  
**I want to** generate executive-ready project cost reports,  
**So that** leadership trusts the numbers and makes informed decisions.

**Success Criteria:**
- One-click report generation
- Customizable views (by project, team, cost center)
- Trend analysis and variance explanations included

---

## Vision & Guiding Principles

### Vision Statement

**Vantage becomes the financial source of truth for every project in the organization.**

Not just a cost dashboard—a decision-making engine that connects cloud spend to business outcomes.

### Principle 1: Projects Are First-Class Citizens

Everything in the product should be filterable, alertable, and reportable by project. Projects aren't a lens—they're the default unit of analysis.

### Principle 2: Allocation Must Be Defensible

If teams don't trust the numbers, they'll build shadow systems. Every allocation must be:
- **Transparent:** Show the math
- **Auditable:** Track changes over time
- **Adjustable:** Rules can evolve without losing history

### Principle 3: Seconds, Not Spreadsheets

Any question that takes a spreadsheet today should take a click tomorrow. If users export to Excel, we've failed.

### Principle 4: Progressive Disclosure

Start simple, drill deep. The VP sees project totals. The platform lead sees allocation breakdowns. The engineer sees resource-level detail. Same data, different depths.

### Principle 5: Proactive, Not Reactive

Don't wait for users to notice problems. Surface anomalies, forecast overruns, and recommend actions before they're asked.

### Principle 6: Integrate, Don't Replicate

We're not rebuilding the GL. Connect to existing financial systems, project management tools, and CI/CD pipelines. Be the cost layer, not another silo.

---

## Core UX Flows

### Flow 1: Project Setup Wizard

**Entry Point:** "New Project" button in Projects section

**Steps:**

1. **Name & Metadata**
   - Project name (required)
   - Description
   - Owner (user or team)
   - Cost center / GL code (optional, for finance integration)
   - Budget (optional, can add later)

2. **Resource Boundary Definition**
   - Visual builder for inclusion rules:
     - Tag matches (e.g., `project=phoenix`)
     - Account membership
     - Service + resource name patterns (regex supported)
     - Kubernetes namespace/label matches
   - Preview panel shows matched resources in real-time
   - "Unmatched resources" warning if orphan spend detected

3. **Shared Cost Allocation**
   - Prompt: "This project uses shared resources. How should costs be allocated?"
   - Options:
     - Proportional (by project's % of total tagged spend)
     - Usage-based (link to usage metrics—CPU, requests, storage)
     - Fixed percentage (manual override)
     - Exclude (don't allocate shared costs to this project)
   - Can configure per shared cost pool

4. **Review & Create**
   - Summary card with estimated monthly cost
   - Backfill option: "Apply to last N months of data"
   - Create button → redirects to project dashboard

---

### Flow 2: Project Dashboard (The Daily Driver)

**Layout:** Three-column responsive, dense but scannable

**Left Column: Vitals**
- **Cost This Period:** Big number + trend indicator
- **Budget Status:** Progress bar with forecast line
- **Alerts:** Active alert count, click to expand
- **Quick Actions:** Edit project, Export, Share

**Center Column: Cost Breakdown**
- **Tabbed views:** By Service | By Environment | By Team | By Time
- **Interactive chart:** Stacked area (default), switchable to bar/line
- **Table below chart:** Sortable, with inline sparklines
- **Every row is clickable** → drills to that dimension's detail

**Right Column: Intelligence**
- **Anomalies:** Cards for detected anomalies with severity
- **Recommendations:** Cost optimization opportunities scoped to this project
- **Activity Feed:** Recent changes (budget edits, rule changes, alerts triggered)

---

### Flow 3: Clickable Drill-Down (The Magic)

**Philosophy:** Every number is a doorway. Clicking doesn't navigate away—it reveals depth.

**Implementation Pattern:**

1. **Click any cost number** → Slide-in panel appears (doesn't lose context)
2. **Panel shows next level of granularity:**
   - Project total → Services within project
   - Service → Resource types within service
   - Resource type → Individual resources
   - Resource → Daily cost + usage metrics + change log
3. **Breadcrumb trail** at top of panel for navigation
4. **"Open in new tab"** option for deep investigation
5. **"Why this number?"** explainer available at every level (shows allocation rules applied)

**Example Journey:**
```
Project Phoenix ($142,000/mo)
  ↓ click
AWS EC2 ($89,000/mo)
  ↓ click
EC2 Instances - r5.4xlarge ($34,000/mo)
  ↓ click
Instance i-0a1b2c3d4e5f ($1,247/mo)
  ↓ click
Daily breakdown + utilization metrics + "This instance was launched on 12/3 by deploy-bot"
```

---

### Flow 4: Shared Cost Allocation Console

**Entry Point:** Settings → Shared Cost Pools (or linked from project setup)

**Views:**

1. **Pool List**
   - All defined shared cost pools
   - Monthly cost of each pool
   - Number of projects allocated to
   - Allocation method badge

2. **Pool Detail**
   - What's in this pool (resources, accounts, tags)
   - Allocation rules and weights
   - Allocation preview: "If we ran this today, here's how $X would be distributed"
   - Historical allocation ledger

3. **Simulation Mode**
   - Change allocation rules
   - See before/after impact on all affected projects
   - Save as draft → requires approval to apply (optional governance)

---

### Flow 5: Budget Management

**Entry Point:** Project Dashboard → Budget card → "Manage Budget"

**Capabilities:**

1. **Set Budget**
   - Amount + period (monthly, quarterly, annual, custom range)
   - Rollover rules (unused budget carries forward, or doesn't)
   - Multiple budgets per project (e.g., separate compute vs. storage)

2. **Track Budget**
   - Burn-down chart with actual vs. planned
   - Forecast line based on current run rate
   - Confidence interval (based on historical variance)

3. **Alert Configuration**
   - Threshold alerts (%, $ amount, or forecasted)
   - Recipients (email, Slack, PagerDuty)
   - Escalation rules (VP gets notified at 100%, CFO at 120%)

4. **Budget vs. Actual Report**
   - Exportable variance analysis
   - Drill-down on over/under categories

---

### Flow 6: What-If Scenario Modeling

**Entry Point:** Projects → "Model Scenario" button

**Capabilities:**

1. **Scenario Types:**
   - **Sunset:** "What if we decommission Project X?"
   - **Migration:** "What if we move to a different region/service?"
   - **Commitment:** "What if we buy reserved capacity for this project?"
   - **Custom:** Free-form resource addition/removal

2. **Builder:**
   - Select affected resources (from project or global)
   - Define change (remove, resize, replace, re-price)
   - Time range for projection

3. **Results:**
   - Side-by-side: Current state vs. Scenario
   - Savings/cost by project affected
   - "Gotchas" flagged (e.g., "This shared resource is used by 3 other projects")

4. **Actions:**
   - Save scenario for later
   - Share with stakeholders
   - Convert to recommendation (creates trackable action item)

---

## Clickable Drill-Down Philosophy

### The Manifesto

> "The answer to 'why?' should never be 'export this and figure it out.'"

Every cost number in Vantage should be explorable in-place. The user's mental context is precious—don't break it with page navigations or CSV exports.

### Implementation Requirements

1. **Universal Click Targets**
   - Any number rendered in the UI should be tappable
   - Hover state indicates interactivity (subtle highlight + cursor change)
   - Tooltip preview: "Click to explore EC2 costs ($89K)"

2. **Slide Panel Architecture**
   - Drill-down opens a side panel (right-side, 40% width default, resizable)
   - Panel can drill further (panels stack, max 3 deep, then navigates)
   - Parent context always visible to the left
   - Keyboard support: Escape to close, Arrow keys to navigate

3. **Consistent Information Hierarchy**
   - Every drill level shows:
     - What you're looking at (title + breadcrumb)
     - Key metrics (cost, change, % of parent)
     - Breakdown chart (what comprises this cost)
     - Table with next-level drill targets
     - Contextual actions (alert, budget, recommend)

4. **"Explain This" Feature**
   - Every cost panel has an info icon
   - Click reveals:
     - How this number was calculated
     - What allocation rules affected it
     - Data freshness (last updated timestamp)
     - Confidence indicator (if estimated/allocated)

5. **Deep Link Support**
   - Every drill state has a unique URL
   - Can share link to specific drill context
   - Bookmarkable for repeat analysis

---

## Data Model Requirements

### Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│                         ORGANIZATION                            │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌─────────────┐         ┌─────────────────┐
            │   PROJECT   │         │ SHARED COST     │
            │             │◄────────│ POOL            │
            └─────────────┘         └─────────────────┘
                    │                       │
         ┌──────────┴──────────┐           │
         ▼                     ▼           ▼
  ┌─────────────┐      ┌─────────────┐  ┌──────────────┐
  │ PROJECT     │      │ BUDGET      │  │ ALLOCATION   │
  │ RULE        │      │             │  │ RULE         │
  └─────────────┘      └─────────────┘  └──────────────┘
         │
         ▼
  ┌─────────────┐
  │ RESOURCE    │ (from existing Vantage data model)
  │ COST        │
  └─────────────┘
```

### Project

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organization |
| name | String(255) | Display name |
| slug | String(100) | URL-safe identifier |
| description | Text | Optional description |
| owner_type | Enum | 'user' or 'team' |
| owner_id | UUID | FK to user or team |
| cost_center | String(50) | External finance reference |
| parent_project_id | UUID | FK for hierarchy (nullable) |
| status | Enum | 'active', 'archived', 'draft' |
| created_at | Timestamp | |
| updated_at | Timestamp | |

### Project Rule (Defines Resource Boundaries)

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to project |
| rule_type | Enum | 'include', 'exclude' |
| match_type | Enum | 'tag', 'account', 'service', 'resource_pattern', 'k8s_namespace', 'custom' |
| match_config | JSONB | Flexible match parameters |
| priority | Integer | Rule evaluation order |
| created_at | Timestamp | |

**match_config examples:**
```json
// Tag match
{"tag_key": "project", "tag_value": "phoenix", "operator": "equals"}

// Resource pattern
{"service": "ec2", "resource_type": "instance", "name_pattern": "^prod-api-.*"}

// K8s namespace
{"cluster": "prod-east", "namespace": "phoenix-*", "label_selector": "app=api"}
```

### Shared Cost Pool

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to organization |
| name | String(255) | Display name |
| description | Text | What this pool represents |
| default_allocation_method | Enum | 'proportional', 'usage', 'fixed', 'even' |
| created_at | Timestamp | |

### Allocation Rule

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| shared_cost_pool_id | UUID | FK to pool |
| project_id | UUID | FK to project |
| method | Enum | Overrides pool default if set |
| fixed_percentage | Decimal | For 'fixed' method |
| usage_metric_config | JSONB | For 'usage' method (metric source, aggregation) |
| effective_from | Date | When this rule takes effect |
| effective_to | Date | Nullable, for time-bound rules |
| created_at | Timestamp | |

### Budget

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to project |
| name | String(255) | Budget name (for multiple budgets per project) |
| amount | Decimal | Budget amount |
| period_type | Enum | 'monthly', 'quarterly', 'annual', 'custom' |
| period_start | Date | Budget period start |
| period_end | Date | For custom periods |
| rollover_enabled | Boolean | Unused budget carries forward |
| created_at | Timestamp | |

### Project Cost (Materialized/Aggregated)

| Field | Type | Description |
|-------|------|-------------|
| project_id | UUID | FK to project |
| date | Date | Cost date |
| provider | String | Cloud provider |
| service | String | Service name |
| cost_type | Enum | 'direct', 'allocated' |
| source_pool_id | UUID | FK if allocated (nullable) |
| cost | Decimal | Cost amount |
| currency | String(3) | ISO currency code |
| updated_at | Timestamp | Last aggregation time |

**Indexes:**
- (project_id, date) - primary access pattern
- (project_id, date, service) - service breakdown
- (date, cost_type) - allocation analysis

### Audit Log

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| entity_type | Enum | 'project', 'rule', 'budget', 'allocation' |
| entity_id | UUID | FK to entity |
| action | Enum | 'create', 'update', 'delete' |
| changes | JSONB | Before/after state |
| actor_id | UUID | User who made change |
| timestamp | Timestamp | |

---

## Key Performance Indicators (KPIs)

### Product Success Metrics

| Metric | Definition | Target (6mo) | Target (12mo) |
|--------|------------|--------------|---------------|
| **Projects Created** | Total projects across all orgs | 5,000 | 25,000 |
| **Active Projects** | Projects viewed in last 30 days | 70% of created | 75% of created |
| **Allocation Adoption** | % of orgs using shared cost allocation | 30% | 50% |
| **Budget Adoption** | % of projects with budgets set | 25% | 45% |
| **Drill-Down Depth** | Avg. drill-down clicks per session | 3.5 | 4.5 |
| **Time in Project Views** | % of Vantage time in project features | 20% | 35% |

### User Outcome Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Time to Answer** | Time from question to insight (surveyed) | <5 min (vs. hours today) |
| **Export Reduction** | % decrease in CSV exports (proxy for self-service) | -40% |
| **Alert Response Time** | Time from project alert → user action | <2 hours |
| **Report Generation** | Time to create monthly project report | <10 min |

### Business Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| **Feature Attach Rate** | % of new deals including Project Finance | 60% |
| **Expansion Revenue** | Upsell revenue attributed to feature | $500K ARR (Y1) |
| **Retention Impact** | Churn reduction in accounts using feature | -15% vs. baseline |
| **NPS Delta** | NPS difference for feature users vs. non-users | +10 points |

---

## Phased Delivery Roadmap

### MVP (Phase 1) — "Foundation"
**Timeline:** 10-12 weeks  
**Theme:** Basic project tracking with manual setup

**Scope:**
- [ ] Project CRUD with tag/account-based rules
- [ ] Project dashboard with cost breakdown by service
- [ ] Basic drill-down (2 levels: project → service → resource type)
- [ ] Simple budget tracking (monthly, threshold alerts)
- [ ] Project list view with search/filter

**Explicitly Out:**
- Shared cost allocation
- What-if scenarios
- Advanced drill-down (resource-level detail)
- Hierarchical projects

**Success Criteria:**
- 100 beta customers create projects
- 60% return to project view weekly
- <10% support tickets related to project setup

---

### Phase 2 — "Allocation Engine"
**Timeline:** 8-10 weeks post-MVP  
**Theme:** Shared cost allocation and advanced boundaries

**Scope:**
- [ ] Shared cost pool management
- [ ] Allocation rules (proportional, fixed %, usage-based)
- [ ] Kubernetes namespace/label matching
- [ ] Resource pattern rules (regex)
- [ ] Allocation transparency ("Why this number?" panel)
- [ ] Historical reallocation (backfill with new rules)

**Success Criteria:**
- 30% of orgs define shared cost pools
- Allocation satisfaction score >7/10 (surveyed)
- Platform engineering persona adoption +40%

---

### Phase 3 — "Intelligence Layer"
**Timeline:** 8-10 weeks post-Phase 2  
**Theme:** Proactive insights and scenario modeling

**Scope:**
- [ ] Project-level anomaly detection
- [ ] What-if scenario builder
- [ ] Hierarchical projects (parent/child)
- [ ] Custom reporting/dashboards per project
- [ ] API for project costs (for internal integration)
- [ ] Forecasting with confidence intervals

**Success Criteria:**
- 50% of projects have anomaly alerts enabled
- Scenario feature used by 25% of active orgs
- Executive reporting adoption +50%

---

### Future Considerations (Phase 4+)

- **Unit economics:** Cost per transaction, cost per customer, cost per feature
- **CI/CD integration:** Auto-create projects from deployment pipelines
- **Project templates:** Pre-built configurations for common patterns
- **Showback/chargeback automation:** Generate invoices, integrate with billing systems
- **ML recommendations:** "Based on similar projects, you could save 18% by..."
- **Multi-cloud project rollup:** Unified view across AWS, GCP, Azure

---

## Risks & Mitigations

### Risk 1: Allocation Complexity Overwhelms Users

**Risk Level:** High  
**Description:** Shared cost allocation is inherently complex. Users may configure incorrectly, distrust results, or abandon the feature.

**Mitigations:**
- Start with simple defaults (proportional allocation) that require no config
- "Explain this number" feature to build trust
- Guided setup wizard with real-time preview
- Allocation simulation mode (see impact before applying)
- Clear documentation with worked examples

---

### Risk 2: Data Scale Performance

**Risk Level:** Medium  
**Description:** Large organizations may have millions of resources. Project cost aggregation could become slow or expensive.

**Mitigations:**
- Materialized views for project costs (pre-aggregated, not computed on read)
- Incremental aggregation (only process new/changed data)
- Tiered storage for historical detail
- Query optimization focus in Phase 1 architecture
- Graceful degradation (show cached data with staleness indicator)

---

### Risk 3: Rule Complexity Creates Orphan Costs

**Risk Level:** Medium  
**Description:** Complex include/exclude rules may leave resources unassigned, creating an "unallocated" bucket that grows over time.

**Mitigations:**
- "Unallocated costs" always visible in org-level view
- Project setup wizard shows coverage % ("This project captures 94% of tagged resources")
- Periodic coverage reports sent to admins
- "Catch-all" project option for remaining costs

---

### Risk 4: Tagging Quality Dependency

**Risk Level:** High  
**Description:** Many organizations have inconsistent tagging. Projects based on tags will inherit this chaos.

**Mitigations:**
- Support multiple boundary types (accounts, patterns) not just tags
- Tagging compliance dashboard (separate feature, but synergy)
- "Suggested rules" based on resource naming patterns
- Education content on tagging best practices
- Position as *complement* to better tagging, not replacement

---

### Risk 5: Budget Fatigue

**Risk Level:** Low  
**Description:** If every project requires budget setup, users may skip the step or set arbitrary numbers.

**Mitigations:**
- Budgets are optional (projects work without them)
- "Suggest budget" based on historical spend
- Bulk budget import from CSV/financial systems
- Smart defaults (e.g., previous month + 10%)

---

### Risk 6: Scope Creep into Full FP&A

**Risk Level:** Medium  
**Description:** Finance teams may expect full financial planning features (invoicing, GL integration, variance analysis) that expand scope significantly.

**Mitigations:**
- Clear positioning: "Cloud cost allocation, not financial planning"
- Integration strategy (export to FP&A tools) rather than building
- Phase 4 consideration list for future evaluation
- Sales enablement to set accurate expectations

---

## Open Decisions for Engineering

### Decision 1: Aggregation Architecture

**Question:** How do we compute and store project costs?

**Options:**
1. **On-demand aggregation:** Query raw cost data with project rules applied at read time
   - Pro: Always fresh, simple data model
   - Con: Slow for large datasets, expensive queries

2. **Materialized views:** Pre-compute project costs on write/schedule
   - Pro: Fast reads, predictable performance
   - Con: Storage cost, staleness window, recomputation complexity

3. **Hybrid:** Materialized for historical, on-demand for current period
   - Pro: Balances freshness and performance
   - Con: Complexity in query routing

**Recommendation:** Start with materialized (Option 2), optimize staleness window. Need eng input on recomputation strategy when rules change.

---

### Decision 2: Rule Evaluation Engine

**Question:** How do we evaluate complex project rules against resources?

**Considerations:**
- Rules can be nested (AND/OR conditions)
- Need regex support for resource patterns
- Must handle 100K+ resources per org efficiently
- Backfill scenarios require evaluating rules against historical data

**Options:**
1. **SQL-based:** Translate rules to SQL predicates, execute in DB
2. **In-memory engine:** Load rules and resources, evaluate in application layer
3. **Streaming evaluation:** Evaluate rules as cost data ingests

**Need from eng:** Performance benchmarks for each approach at scale (1M resources, 500 rules).

---

### Decision 3: Multi-Tenancy for Shared Cost Pools

**Question:** Can shared cost pools span multiple organizations (for enterprises with multiple Vantage accounts)?

**Current assumption:** No, pools are org-scoped.  
**Enterprise request likelihood:** High.

**Need from eng:** Data model implications of cross-org pools. Security/isolation concerns.

---

### Decision 4: Real-Time vs. Batch Processing

**Question:** What's the latency target for project cost updates?

**Options:**
1. **Daily batch:** Costs appear next day
2. **Hourly refresh:** Near-real-time for current day
3. **Streaming:** Sub-minute latency

**Recommendation:** Hourly for Phase 1, evaluate streaming for Phase 3 anomaly detection.

**Need from eng:** Infrastructure cost delta for each option.

---

### Decision 5: Historical Recomputation Scope

**Question:** When a project rule changes, how far back do we recompute?

**Options:**
1. **No backfill:** New rules apply forward only
2. **Configurable window:** User chooses (last 30/90/365 days)
3. **Full history:** Recompute all time

**Trade-offs:** Storage, compute cost, user expectations for consistency

**Recommendation:** Configurable window with sensible default (90 days). Need cost modeling from eng.

---

### Decision 6: Usage Metrics for Allocation

**Question:** For usage-based allocation, what metrics do we support and how do we source them?

**Known metrics needed:**
- CPU/memory utilization (for K8s, EC2)
- Request counts (for API gateways, load balancers)
- Storage reads/writes (for databases)
- Data transfer (for networking)

**Options:**
1. **Native cloud metrics:** Pull from CloudWatch, Stackdriver, etc.
2. **Third-party integration:** Datadog, Prometheus, etc.
3. **Vantage-computed:** Derive from cost data where possible

**Need from eng:** Feasibility assessment for each metric source. Integration complexity ranking.

---

### Decision 7: Drill-Down Panel Implementation

**Question:** How do we implement the sliding panel architecture?

**Considerations:**
- Must preserve parent context (no full page reloads)
- Deep linking support (URL reflects drill state)
- Accessibility requirements (keyboard navigation, screen readers)
- Mobile responsiveness

**Need from eng:** Frontend architecture recommendation. Component library evaluation if needed.

---

### Decision 8: Budget Alert Delivery

**Question:** How do we handle alert delivery infrastructure?

**Options:**
1. **Extend existing alerting:** Add project-level alerts to current system
2. **Dedicated budget alerting:** Separate pipeline for budget alerts
3. **Third-party integration:** Route to PagerDuty, OpsGenie, etc.

**Need from eng:** Current alerting system capacity and modification effort. Third-party integration scope.

---

## Appendix A: Competitive Landscape

| Competitor | Project-Level Costing | Shared Cost Allocation | Drill-Down Depth |
|------------|----------------------|----------------------|-----------------|
| CloudHealth | Tags + accounts | Basic proportional | 3 levels |
| Cloudability | Tags only | Manual split | 2 levels |
| Kubecost | K8s native | Yes (K8s only) | 4 levels |
| Spot.io | Limited | No | 2 levels |
| **Vantage (proposed)** | **Multi-method** | **Usage + proportional + fixed** | **5 levels** |

**Differentiation opportunity:** No one does click-to-drill well. Make it buttery.

---

## Appendix B: User Research Quotes

> "I've got 200 microservices. I know our AWS bill. I don't know what any individual service costs. That's insane." — Platform Lead, Series C Fintech

> "We tried to implement chargebacks. Gave up after 6 months. The manual work was killing us." — FinOps Manager, E-commerce Enterprise

> "My CFO asks 'what does Project X cost?' and I say 'give me two weeks.' That's not a good answer." — VP Eng, B2B SaaS

> "Tags are supposed to solve this. They don't. People forget, resources aren't taggable, shared stuff can't be tagged. We need a smarter approach." — DevOps Lead, Healthcare Tech

---

## Appendix C: Glossary

| Term | Definition |
|------|------------|
| **Project** | A user-defined grouping of cloud resources representing a business initiative, product, or team |
| **Shared Cost Pool** | A collection of resources whose costs should be distributed across multiple projects |
| **Allocation** | The process of distributing shared costs to projects based on defined rules |
| **Boundary Rule** | A condition that determines whether a resource belongs to a project |
| **Chargeback** | Billing internal teams for their cloud usage |
| **Showback** | Displaying costs to internal teams without actual billing |
| **Unit Economics** | Cost metrics normalized by business output (e.g., cost per transaction) |

---

*End of Document*

**Next Steps:**
1. Engineering review for feasibility and open decisions
2. Design sprint for core UX flows
3. Customer advisory board review (5 target customers)
4. Phase 1 sprint planning

**Document Owner:** Jeff, SVP Product  
**Review Cycle:** Bi-weekly until Phase 1 kickoff
