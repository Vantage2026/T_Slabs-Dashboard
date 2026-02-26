# Project Cost & Finance Intelligence
## Addendum: Salary-Free Cost Modeling Strategy

**Author:** Jeff, SVP Product  
**Version:** 1.0  
**Date:** February 2025  
**Status:** Strategic Addendum to Core BRD  
**Reference:** PROJECT_COST_FINANCE_BRD.md

---

## 1. Problem Framing & Assumptions

### The Gap

During enterprise discovery (FanDuel, others), a critical assumption broke: **most enterprise teams cannot access or operationalize per-employee salary data.**

**Why it breaks:**
- HR/compensation data lives in siloed HRIS systems (Workday, ADP, BambooHR)
- Security/compliance prohibits cross-system salary exposure
- Even when accessible, per-person rates create political landmines
- Contractors, outsourced teams, and consultants aren't in the system
- Many orgs have explicit policies against exposing individual compensation

**The implication:** Any cost model that *requires* salary data is DOA for 60-80% of enterprise buyers. We need a complete strategy that treats salary data as **optional enrichment, not foundational dependency.**

### Core Assumptions

| Assumption | Confidence | Validation Path |
|------------|------------|-----------------|
| Orgs can provide cloud bills (AWS, GCP, Azure) | Very High | Current product |
| Orgs can provide vendor/SaaS invoices | High | Most have AP systems |
| Orgs can approximate headcount by team/project | High | Org charts exist |
| Orgs can provide role-level rate bands (not individuals) | Medium | Less politically sensitive |
| Orgs can estimate % time allocation by project | Medium | Sprint data, Jira |
| Orgs *cannot* provide per-person salary data | High | Discovery confirmed |

### Success Criteria for This Model

1. **Usable day 1** without salary data
2. **Progressively accurate** as richer data arrives
3. **Transparent about uncertainty** — never false precision
4. **Defensible in finance conversations** — CFO can trust the methodology
5. **Better than the spreadsheet alternative** — bar is low, but we must clear it

---

## 2. Taxonomy of Non-Salary Cost Dimensions

Projects incur costs across multiple vectors. Salary is just one — and often not the dominant one for infrastructure-heavy projects.

### Direct Costs (High Confidence, Observable)

| Dimension | Description | Data Source |
|-----------|-------------|-------------|
| **Cloud Infrastructure** | Compute, storage, networking, managed services | Provider APIs (existing Vantage core) |
| **Vendor/SaaS Spend** | Third-party tools allocated to project | Invoice ingestion, contract upload |
| **External Contractors** | SOW-based work with project attribution | Contract/invoice data |
| **Licensing** | Per-seat or usage software attributed to project | Vendor invoices, usage APIs |

### Derived Costs (Medium Confidence, Allocated)

| Dimension | Description | Allocation Strategy |
|-----------|-------------|---------------------|
| **Platform Tax** | Shared infra consumed (K8s clusters, observability, CI/CD) | Usage-proportional or fixed % |
| **Observability Overhead** | Monitoring, logging, APM costs | Log volume, span count, metric cardinality |
| **Security/Compliance** | WAF, SIEM, audit tools, compliance certification amortized | Risk tier weighting, headcount proportional |
| **Incident Burn** | MTTR × responder cost × incident count | Incident records + blended rates |
| **Support Allocation** | Internal support team time spent | Ticket volume, escalation count |

### Proxy-Based Costs (Lower Confidence, Estimated)

| Dimension | Description | Proxy Method |
|-----------|-------------|--------------|
| **Labor Investment** | People-time without salary data | Headcount × role-band rates × time % |
| **Opportunity Cost** | What else could this team ship? | Throughput delta × avg value |
| **Rework/Churn** | Cost of defects and re-delivery | Defect rate × avg fix cost |
| **Cost of Delay** | Revenue impact of late delivery | Risk-adjusted CoD models |
| **Technical Debt Service** | Time spent on non-feature work | Sprint allocation % × blended rate |

### External Dependencies (Variable Confidence)

| Dimension | Description | Data Strategy |
|-----------|-------------|---------------|
| **API/Service Consumption** | Third-party API costs | Usage metering, invoice |
| **Data Costs** | Data vendor fees, data transfer | Contract + metered usage |
| **Partner Integration** | Rev-share, integration fees | Contract terms |

---

## 3. Modeling Approaches (Without Salary Data)

### Approach A: Unit Economics Model

**Concept:** Define meaningful output units, compute cost-per-unit, trend over time.

| Pros | Cons |
|------|------|
| Business-aligned (cost per API call, cost per order) | Requires clear output metrics |
| Reveals efficiency trends | Doesn't capture labor well |
| CFO-friendly language | Output definition can be political |
| Works without any people data | Ignores sunk/fixed costs |

**Best for:** Infrastructure-heavy projects, API products, transaction-based systems.

**Implementation:**
- User defines 1-3 output metrics per project
- System computes total project cost ÷ output volume
- Trend chart shows efficiency over time

---

### Approach B: Blended Role-Rate Bands

**Concept:** Use organizational averages by role level, not individuals.

**Example bands:**
| Role Band | Loaded Rate ($/hr) | Source |
|-----------|-------------------|--------|
| Junior IC | $75-95 | Industry benchmark + user override |
| Senior IC | $120-160 | Industry benchmark + user override |
| Staff+ | $180-240 | Industry benchmark + user override |
| Manager | $150-200 | Industry benchmark + user override |
| Contractor | Actual invoice rate | Contract data |

| Pros | Cons |
|------|------|
| No individual salary exposure | Still requires headcount + time allocation |
| Defensible methodology | Wide confidence intervals |
| User can tune bands | Doesn't capture benefits/overhead accurately |
| Works for most orgs | Outliers (expensive specialists) distort |

**Best for:** Organizations with standard role structures, willing to provide headcount.

---

### Approach C: Contract/Invoice Ingestion

**Concept:** Treat external spend as ground truth, minimize labor estimation.

| Pros | Cons |
|------|------|
| High accuracy for vendor costs | Ignores internal labor |
| Audit-ready documentation | Incomplete total cost picture |
| Easy to collect (AP systems) | Attribution can be manual |
| No salary politics | Requires invoice processing |

**Best for:** Heavily outsourced projects, vendor-heavy architectures.

**Implementation:**
- Upload invoices or connect AP integration
- AI-assisted categorization and project attribution
- Manual review/override for ambiguous items

---

### Approach D: Service Cost Allocation

**Concept:** Allocate known costs (cloud, SaaS) down to projects; treat labor as overhead ratio.

| Pros | Cons |
|------|------|
| Uses high-confidence data (cloud bills) | Labor becomes a guess |
| Minimal user input required | May undercount labor-heavy projects |
| Fast to implement | Overhead ratio varies wildly |
| Accurate for infra-dominant projects | Not good for R&D/strategy projects |

**Implementation:**
- Allocate cloud + SaaS costs per existing BRD approach
- Apply configurable "labor multiplier" (e.g., 1.5x-3x infra spend)
- User can override or refine per project

---

### Approach E: Throughput/Value Proxy

**Concept:** Estimate cost by working backward from delivered value.

| Pros | Cons |
|------|------|
| Outcome-oriented | Requires value quantification |
| Supports ROI conversations | Speculative |
| Aligns cost to impact | Hard to compare across projects |
| Novel differentiation | May feel hand-wavy |

**Best for:** Product organizations with outcome metrics, OKR-driven teams.

**Implementation:**
- User defines value metrics (revenue generated, time saved, NPS delta)
- System helps compute "cost to generate $1 value" or efficiency ratio
- Historical trends show improving/declining ROI

---

### Recommended Hybrid Strategy

**Default stack (no config):**
1. Cloud cost (existing Vantage)
2. + Vendor/SaaS allocation
3. + Industry-benchmark labor rates × estimated headcount
4. = **Baseline project cost** (confidence: Medium)

**Progressive enhancement:**
- Provide role-band rates → improves labor accuracy
- Connect sprint/Jira data → improves time allocation
- Upload invoices → improves vendor accuracy
- Define output metrics → enables unit economics view

---

## 4. Data Collection Strategies & Confidence Scoring

### Data Source Hierarchy

| Tier | Source | Confidence | Collection Method |
|------|--------|------------|-------------------|
| **1** | Cloud provider APIs | 95%+ | Automatic (existing) |
| **2** | Uploaded invoices/contracts | 90%+ | Manual upload, AI parsing |
| **3** | Connected SaaS (Jira, Linear, etc.) | 80-90% | OAuth integration |
| **4** | User-provided role rates | 70-85% | Admin input |
| **5** | User-estimated time allocation | 60-80% | Project setup flow |
| **6** | Industry benchmarks | 50-70% | Default fallback |
| **7** | Derived proxies (log volume, etc.) | 40-60% | Computed |

### Confidence Scoring Model

Every cost component carries a **confidence score (0-100)** based on:

```
confidence = source_quality × data_freshness × attribution_clarity
```

| Factor | Scoring |
|--------|---------|
| **Source Quality** | API=1.0, Invoice=0.9, User input=0.7, Benchmark=0.5 |
| **Data Freshness** | <24h=1.0, <7d=0.9, <30d=0.7, >30d=0.5 |
| **Attribution Clarity** | Direct tag=1.0, Rule-based=0.8, Proportional=0.6, Estimated=0.4 |

**Aggregate confidence** for a project cost = weighted average of component confidences.

### Collection Flow

**Phase 1: Passive collection**
- Cloud costs (automatic)
- Basic project definition (user setup)
- Industry benchmark rates (default)

**Phase 2: Active enhancement**
- Prompt for role-rate overrides
- Suggest invoice upload opportunities
- Offer Jira/Linear connection

**Phase 3: Continuous refinement**
- Track estimate accuracy vs. actuals (when available)
- Adjust benchmarks based on org history
- Learn project-specific patterns

---

## 5. UX for Uncertainty Disclosure & Drill-Down

### Core Principle: Transparent Uncertainty

**Never present estimates as facts.** Every cost display includes:

1. **Point estimate:** Best guess value
2. **Confidence band:** Range based on data quality
3. **Confidence indicator:** Visual signal (color, icon)
4. **Data sources:** What contributed to this number

### Visual Language

| Confidence | Color | Icon | Band Width |
|------------|-------|------|------------|
| 85%+ | Green | ✓ | ±5% |
| 70-84% | Blue | ● | ±15% |
| 50-69% | Amber | ◐ | ±30% |
| <50% | Gray | ○ | ±50%+ |

### Example UI Pattern

```
┌─────────────────────────────────────────┐
│ Project Phoenix - Total Cost            │
│                                         │
│   $142,000 /month                       │
│   ◐ 67% confidence | ±$28K              │
│                                         │
│   [Improve estimate →]                  │
└─────────────────────────────────────────┘
```

### Drill-Down Explainer Panel

Clicking any cost reveals:

```
┌─────────────────────────────────────────┐
│ How we calculated $142,000              │
├─────────────────────────────────────────┤
│ ✓ Cloud infrastructure    $89,000  95%  │
│   └─ Source: AWS Cost Explorer API      │
│                                         │
│ ● Vendor/SaaS              $18,000  82%  │
│   └─ Source: 3 uploaded invoices        │
│                                         │
│ ◐ Labor estimate          $35,000  52%  │
│   └─ 4 engineers × $150/hr × 58 hrs/wk  │
│   └─ Rate: Industry benchmark (override)│
│   └─ Allocation: Your estimate (60%)    │
│                                         │
│ [Upload salary bands to improve →]      │
└─────────────────────────────────────────┘
```

### Improvement Prompts

System actively suggests ways to narrow uncertainty:

- "Connect Jira to improve time allocation accuracy (+15% confidence)"
- "Upload team role-rate bands (+20% confidence on labor)"
- "This vendor appears on multiple projects. Allocate once? (+10% accuracy)"

---

## 6. MVP Model (Ship Fast)

### MVP Scope: "Honest Estimates"

**Target:** 4-6 weeks to production

**What ships:**

1. **Cloud + Vendor baseline**
   - Use existing cloud allocation from BRD
   - Add simple invoice upload (PDF/CSV)
   - AI categorization with human confirmation

2. **Headcount-based labor estimation**
   - Ask: "How many people work on this project?"
   - Ask: "What % of their time?"
   - Apply: Industry benchmark rate ($125/hr blended default)
   - Show: Clear "estimated" labeling

3. **Confidence display**
   - Every number gets a confidence badge
   - Drill-down shows component breakdown
   - "Improve this estimate" CTAs throughout

4. **No salary ingestion**
   - Explicitly do not build salary import in MVP
   - Role-band override is Phase 2

### MVP Data Model Addition

```sql
-- Extend project_cost table
ALTER TABLE project_cost ADD COLUMN confidence_score DECIMAL(3,2);
ALTER TABLE project_cost ADD COLUMN source_breakdown JSONB;
ALTER TABLE project_cost ADD COLUMN estimate_method VARCHAR(50);

-- New table: labor_estimate
CREATE TABLE labor_estimate (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES project(id),
  headcount INTEGER,
  time_allocation_pct DECIMAL(3,2),
  rate_source VARCHAR(50), -- 'benchmark', 'role_band', 'custom'
  hourly_rate DECIMAL(10,2),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- New table: invoice_upload
CREATE TABLE invoice_upload (
  id UUID PRIMARY KEY,
  organization_id UUID,
  filename VARCHAR(255),
  vendor_name VARCHAR(255),
  invoice_date DATE,
  total_amount DECIMAL(12,2),
  currency VARCHAR(3),
  project_attributions JSONB, -- [{project_id, amount, confidence}]
  status VARCHAR(50), -- 'pending', 'processed', 'confirmed'
  created_at TIMESTAMP
);
```

### MVP Success Metrics

| Metric | Target |
|--------|--------|
| Projects with labor estimates configured | 50% of active projects |
| Average confidence score (new projects) | 55-65% |
| Users who improve estimates after prompt | 25% |
| Time to first project cost view | <3 minutes |

---

## 7. Phase 2/3 Differentiators

### Phase 2: "Rate Intelligence" (8-10 weeks)

| Capability | Value |
|------------|-------|
| **Role-band rate administration** | Admins set org-specific rates by level, no individuals |
| **Contractor rate ingestion** | Auto-extract rates from uploaded contracts |
| **Time allocation via integrations** | Pull from Jira, Linear, Asana, Harvest |
| **Allocation rules for labor** | Same flexibility as cloud allocation |
| **Historical rate adjustment** | Backfill with updated rates |

**Differentiation:** Only product that lets enterprise model labor cost without exposing salaries.

### Phase 3: "Predictive Cost Intelligence" (10-12 weeks)

| Capability | Value |
|------------|-------|
| **Cost forecasting with confidence intervals** | "Next quarter: $420K ±$60K (72% confidence)" |
| **Cost-of-delay modeling** | Quantify late delivery risk |
| **Scenario planning** | "What if we add 2 engineers?" |
| **Efficiency trending** | Cost per output unit over time |
| **Anomaly detection on estimates** | Flag when actuals diverge from model |

**Differentiation:** Move from descriptive to predictive — unique in market.

### Phase 4+: "Closed-Loop Learning"

- **Actuals reconciliation:** When real data becomes available, learn from delta
- **Org-specific benchmarks:** Build internal benchmark from confirmed projects
- **Peer comparison:** "Your cost structure is 1.2x industry median for similar projects"
- **Auto-refinement:** Confidence scores improve automatically over time

---

## 8. KPI Tree & Guardrails

### KPI Tree

```
                    ┌─────────────────────────┐
                    │ North Star:             │
                    │ Time-to-Project-Cost    │
                    │ Answer (minutes)        │
                    └───────────┬─────────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Data Coverage   │   │ Estimate        │   │ User Trust      │
│                 │   │ Accuracy        │   │                 │
│ % of total cost │   │ Estimate vs.    │   │ % users who     │
│ captured in     │   │ actual (when    │   │ share reports   │
│ model           │   │ available)      │   │ externally      │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
    ┌────┴────┐           ┌────┴────┐           ┌────┴────┐
    ▼         ▼           ▼         ▼           ▼         ▼
┌───────┐ ┌───────┐   ┌───────┐ ┌───────┐   ┌───────┐ ┌───────┐
│Cloud  │ │Labor  │   │Conf.  │ │Delta  │   │Explain│ │Action │
│ %     │ │ %     │   │Score  │ │ %     │   │Views  │ │Rate   │
└───────┘ └───────┘   └───────┘ └───────┘   └───────┘ └───────┘
```

### Guardrails Against False Precision

| Guardrail | Rule |
|-----------|------|
| **Minimum confidence display** | Never hide confidence indicator |
| **Forced range on low-confidence** | <60% confidence → must show ±range, not point estimate |
| **Source attribution required** | Every number must trace to sources |
| **No mixing precision levels** | Don't add $89,412.37 (cloud) + ~$35,000 (labor) and show $124,412.37 |
| **Improvement prompts mandatory** | Low-confidence items must show upgrade path |
| **Export includes methodology** | CSV/PDF exports include confidence and sources |
| **Audit log for estimates** | Track all estimate inputs for defensibility |

### Anti-Metrics (What Not to Optimize)

| Anti-Metric | Why |
|-------------|-----|
| Estimate precision (decimal places) | Encourages false precision |
| Time to configure project | Rushing = bad inputs |
| Projects without labor estimates | Forcing estimates = garbage data |

---

## 9. Example Walkthrough: Project Convergence

### Project: "Checkout Modernization" @ FanDuel

**Day 1: Initial Setup**
```
Cloud costs (auto): $47,000/mo  ✓ 95% confidence
Vendor costs:       $0          ○ No data
Labor estimate:     $0          ○ No data
───────────────────────────────────────────
Total:              $47,000/mo  ◐ 48% coverage
                    "This is incomplete."
```

**Day 3: User adds headcount**
- Input: 6 engineers, estimated 70% allocation
- Applied: Industry benchmark $140/hr
```
Cloud costs:        $47,000/mo  ✓ 95%
Vendor costs:       $0          ○ No data  
Labor estimate:     $71,000/mo  ◐ 55%
                    └─ 6 × 0.70 × 140 × 170hrs
───────────────────────────────────────────
Total:              $118,000/mo ◐ 68% confidence
                    ±$28K range
```

**Week 2: Invoices uploaded**
- 2 vendor invoices: DataDog allocation, Stripe fees
```
Cloud costs:        $47,000/mo  ✓ 95%
Vendor costs:       $12,000/mo  ● 85%
Labor estimate:     $71,000/mo  ◐ 55%
───────────────────────────────────────────
Total:              $130,000/mo ● 72% confidence
                    ±$22K range
```

**Week 4: Jira connected**
- Actual sprint allocation: 62% (not 70% as estimated)
- Auto-adjusts labor estimate
```
Cloud costs:        $47,000/mo  ✓ 95%
Vendor costs:       $12,000/mo  ● 85%
Labor estimate:     $63,000/mo  ● 78%
                    └─ 6 × 0.62 × 140 × 170hrs
                    └─ Time data from Jira
───────────────────────────────────────────
Total:              $122,000/mo ● 84% confidence
                    ±$12K range
```

**Week 8: Role bands configured**
- Org admin sets: Sr. Eng = $165/hr, Eng = $125/hr
- Team: 2 Sr. Eng, 4 Eng
```
Cloud costs:        $47,000/mo  ✓ 95%
Vendor costs:       $12,000/mo  ● 85%
Labor estimate:     $58,000/mo  ✓ 88%
                    └─ (2×165 + 4×125) × 0.62 × 170
───────────────────────────────────────────
Total:              $117,000/mo ✓ 89% confidence
                    ±$8K range
```

**Result:** From 48% coverage → 89% confidence in 8 weeks, without ever ingesting salary data.

---

## 10. Open Product Decisions for Leadership

### Decision 1: Default Rate Positioning

**Question:** How aggressive should industry benchmark defaults be?

**Options:**
| Option | Rate | Risk |
|--------|------|------|
| Conservative (low) | $100/hr | Underestimates labor, good optics |
| Moderate | $125/hr | Balanced |
| Aggressive (high) | $150/hr | More accurate but sticker shock |
| No default | N/A | Forces user input, slower adoption |

**Recommendation:** Moderate default ($125/hr) with prominent "customize" prompt.

---

### Decision 2: Invoice Processing Investment

**Question:** Build or buy invoice parsing?

**Options:**
- **Build:** Full control, higher cost, 6-8 week investment
- **Buy (e.g., Mindee, Rossum):** Faster, per-invoice cost, dependency
- **Hybrid:** Simple in-house CSV, API for complex PDFs

**Recommendation:** Hybrid for MVP, evaluate buy for Phase 2 scale.

---

### Decision 3: Confidence Score Visibility

**Question:** How prominently should uncertainty be displayed?

**Options:**
- **Always visible:** Every number shows confidence
- **On hover:** Clean UI, details on demand
- **Threshold-based:** Only show for <70% confidence

**Recommendation:** Always visible for MVP (build trust), consider threshold later.

---

### Decision 4: Benchmark Data Source

**Question:** Where do industry benchmark rates come from?

**Options:**
- **Public data:** Levels.fyi, Glassdoor, BLS (free, less accurate)
- **Licensed data:** Radford, Mercer, Carta (expensive, more accurate)
- **User-contributed:** Aggregate anonymized org data (scale-dependent)

**Recommendation:** Public data for MVP, evaluate licensed for enterprise tier.

---

### Decision 5: Multi-Tenancy for Rate Bands

**Question:** Can rate bands be set at division level, not just org?

**Use case:** Conglomerates with different comp structures by business unit.

**Recommendation:** Org-level only for MVP. Division support in Phase 3.

---

### Decision 6: Negative Confidence Messaging

**Question:** How do we message when estimates are unreliable?

**Options:**
- **Numeric only:** "42% confidence"
- **Qualitative:** "Low confidence — improve with more data"
- **Actionable:** "This estimate could be off by 50%. Here's how to fix it."

**Recommendation:** Actionable messaging — drives engagement and trust.

---

### Decision 7: Labor Estimation Opt-Out

**Question:** Can users explicitly say "don't estimate labor"?

**Use case:** Teams who only want cloud costs, find labor estimation distracting.

**Recommendation:** Yes, allow opt-out with clear "your total excludes labor" warning.

---

### Decision 8: Competitor Positioning

**Question:** Do we market this as "cost modeling without salary data" explicitly?

**Consideration:** Could highlight a limitation (we need workarounds) or a strength (we solve a real problem).

**Recommendation:** Position as strength: "Enterprise-ready cost intelligence that respects data boundaries."

---

## Summary

This addendum establishes a complete strategy for project cost modeling without salary data dependency. The approach:

1. **Embraces uncertainty** — transparent confidence scoring throughout
2. **Starts usable** — MVP ships with cloud + benchmarks in 4-6 weeks
3. **Grows accurate** — progressive enhancement path to 85%+ confidence
4. **Respects constraints** — works within enterprise data boundaries
5. **Builds trust** — never presents estimates as facts

The FanDuel gap is now a product differentiator: we're the only solution that can model project costs in organizations where salary data is off-limits.

---

*End of Addendum*

**Next Steps:**
1. Engineering review of MVP data model additions
2. UX design for confidence visualization system
3. Benchmark data source evaluation
4. Customer validation with FanDuel and 2 additional enterprises

**Document Owner:** Jeff, SVP Product  
**Parent Document:** PROJECT_COST_FINANCE_BRD.md
