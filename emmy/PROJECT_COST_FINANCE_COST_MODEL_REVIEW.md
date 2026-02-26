# Technical Review: Salary-Free Cost Modeling Strategy
## Principal Engineer Assessment

**Reviewer:** Emmy, Principal Engineer  
**Date:** February 2025  
**Document Under Review:** PROJECT_COST_FINANCE_COST_MODEL_ADDENDUM.md (Jeff, SVP Product)  
**Reference Architecture:** pm-sync (Next.js 14 + Prisma + PostgreSQL + Vercel)

---

## 1. Executive Recommendation

**Overall Assessment: GO with modifications**

Jeff's proposal is strategically sound and technically achievable within our current stack. The core insight—that salary data is a non-starter for enterprise—is correct and the confidence-based approach is the right architecture. However, the MVP timeline (4-6 weeks) is optimistic given invoice processing complexity and the UX work required for confidence visualization.

**Adjusted recommendation:**
- **MVP (Honest Estimates):** 7-9 weeks realistic
- **Phase 2 (Rate Intelligence):** 10-12 weeks (aligns with doc)
- **Phase 3 (Predictive):** 14-16 weeks (doc underestimates ML/forecasting complexity)

**Key technical risks:**
1. Invoice parsing accuracy without dedicated ML investment
2. Confidence score aggregation edge cases creating misleading outputs
3. Prisma JSON column performance at scale for `source_breakdown`
4. Vercel function timeout constraints for batch invoice processing

**Bottom line:** This is buildable and valuable. Ship a tighter MVP (cloud + headcount + confidence display), defer invoice ingestion to Phase 1.5, and invest properly in the confidence scoring system—it's the product differentiator, not a checkbox feature.

---

## 2. What Is Technically Feasible Now vs Later

### Feasible in MVP (4-6 weeks, stretched to 7-9)

| Capability | Feasibility | Notes |
|------------|-------------|-------|
| Confidence score display on existing costs | ✅ High | UI work, minimal backend |
| Headcount-based labor estimation | ✅ High | Simple form + calculation |
| Industry benchmark rate defaults | ✅ High | Config/seed data |
| Confidence badges/drill-down UI | ✅ High | Component library addition |
| Basic CSV invoice upload | ⚠️ Medium | Manual column mapping needed |
| `labor_estimate` table + API | ✅ High | Standard Prisma model |

### Requires Phase 2 Investment (8-12 weeks)

| Capability | Feasibility | Blocker |
|------------|-------------|---------|
| PDF invoice parsing with AI | ⚠️ Medium | Need external service or fine-tuned model |
| Jira/Linear OAuth integration | ⚠️ Medium | Each integration is 2-3 weeks |
| Role-band administration UI | ✅ High | But requires org hierarchy model |
| Time allocation rules engine | ⚠️ Medium | Rule DSL complexity |
| Historical rate backfill | ⚠️ Medium | Migration + recalculation jobs |

### Requires Phase 3+ or Significant R&D

| Capability | Feasibility | Blocker |
|------------|-------------|---------|
| Cost forecasting with confidence intervals | ⚠️ Low-Medium | Needs time-series modeling, not just arithmetic |
| Anomaly detection | ⚠️ Low | Requires baseline establishment + ML |
| Peer comparison benchmarks | ❌ Low (MVP) | Needs critical mass of anonymized data |
| Auto-refinement/learning | ❌ Low | Feedback loop infrastructure |

### Explicitly NOT Feasible Without Major Investment

| Capability | Why |
|------------|-----|
| Real-time invoice processing | Vercel function limits (10s default, 60s max on Pro) |
| Complex multi-currency handling | Requires FX rate service + temporal accuracy |
| SOC 2 Type II for invoice storage | 6-12 month compliance process |

---

## 3. Schema and Migration Changes Needed

### Critical Issues with Proposed Schema

**Issue 1: Missing foreign key on `invoice_upload.organization_id`**
```sql
-- Jeff's version (missing FK)
organization_id UUID,

-- Correct version
organization_id UUID NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
```

**Issue 2: `labor_estimate` needs composite uniqueness**
Multiple estimates per project over time is valid, but we need to prevent duplicate "current" estimates:
```sql
-- Add status column for versioning
ALTER TABLE labor_estimate ADD COLUMN status VARCHAR(20) DEFAULT 'active';
-- Add constraint
CREATE UNIQUE INDEX idx_labor_estimate_active 
  ON labor_estimate(project_id) WHERE status = 'active';
```

**Issue 3: JSONB columns need indexing strategy**
```sql
-- For source_breakdown queries
CREATE INDEX idx_project_cost_source ON project_cost 
  USING GIN (source_breakdown jsonb_path_ops);

-- For project_attributions queries  
CREATE INDEX idx_invoice_attributions ON invoice_upload
  USING GIN (project_attributions jsonb_path_ops);
```

**Issue 4: Decimal precision is insufficient**
```sql
-- Jeff's version
confidence_score DECIMAL(3,2)  -- Max 9.99, should be 0.00-1.00

-- Correct version (allows 0.00-1.00 with precision)
confidence_score DECIMAL(5,4)  -- Allows 0.0000 to 1.0000
```

### Recommended Schema (Prisma Format)

```prisma
model LaborEstimate {
  id                 String   @id @default(uuid())
  projectId          String   @map("project_id")
  project            Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  headcount          Int
  timeAllocationPct  Decimal  @map("time_allocation_pct") @db.Decimal(5, 4)
  rateSource         RateSource @map("rate_source")
  hourlyRate         Decimal  @map("hourly_rate") @db.Decimal(10, 2)
  confidenceScore    Decimal  @map("confidence_score") @db.Decimal(5, 4)
  status             EstimateStatus @default(ACTIVE)
  effectiveDate      DateTime @map("effective_date") @default(now())
  createdAt          DateTime @map("created_at") @default(now())
  updatedAt          DateTime @map("updated_at") @updatedAt

  @@unique([projectId, status], name: "unique_active_estimate")
  @@map("labor_estimate")
}

enum RateSource {
  BENCHMARK
  ROLE_BAND
  CUSTOM
  CONTRACT
}

enum EstimateStatus {
  ACTIVE
  SUPERSEDED
  ARCHIVED
}

model InvoiceUpload {
  id                  String   @id @default(uuid())
  organizationId      String   @map("organization_id")
  organization        Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  filename            String   @db.VarChar(255)
  fileHash            String   @map("file_hash") @db.VarChar(64) // SHA-256 for dedup
  vendorName          String?  @map("vendor_name") @db.VarChar(255)
  invoiceDate         DateTime? @map("invoice_date") @db.Date
  totalAmount         Decimal  @map("total_amount") @db.Decimal(14, 2) // Increased precision
  currency            String   @db.VarChar(3) @default("USD")
  projectAttributions Json     @map("project_attributions") @db.JsonB
  processingStatus    InvoiceStatus @map("processing_status") @default(PENDING)
  processingError     String?  @map("processing_error")
  rawExtraction       Json?    @map("raw_extraction") @db.JsonB // Store AI extraction for audit
  createdAt           DateTime @map("created_at") @default(now())
  updatedAt           DateTime @map("updated_at") @updatedAt

  @@index([organizationId, processingStatus])
  @@index([vendorName])
  @@map("invoice_upload")
}

enum InvoiceStatus {
  PENDING
  PROCESSING
  NEEDS_REVIEW
  CONFIRMED
  FAILED
}

// Extend existing ProjectCost model
model ProjectCost {
  // ... existing fields ...
  
  confidenceScore   Decimal? @map("confidence_score") @db.Decimal(5, 4)
  sourceBreakdown   Json?    @map("source_breakdown") @db.JsonB
  estimateMethod    String?  @map("estimate_method") @db.VarChar(50)
  
  @@index([projectId, confidenceScore])
}
```

### Migration Strategy

**Migration 1:** Add confidence columns to `project_cost` (non-breaking, nullable)
**Migration 2:** Create `labor_estimate` table
**Migration 3:** Create `invoice_upload` table
**Migration 4:** Backfill confidence scores for existing cloud costs (set to 0.95)
**Migration 5:** Add indexes (run during low-traffic window)

**Estimated migration risk:** Low. All additive, no data transforms on existing tables.

---

## 4. API and Backend Processing Design

### API Endpoints Required

```typescript
// Labor Estimation
POST   /api/projects/:projectId/labor-estimate
GET    /api/projects/:projectId/labor-estimate
PUT    /api/projects/:projectId/labor-estimate/:estimateId
DELETE /api/projects/:projectId/labor-estimate/:estimateId

// Invoice Management
POST   /api/invoices/upload          // Multipart form, returns upload ID
GET    /api/invoices/:invoiceId      // Get invoice details + status
PUT    /api/invoices/:invoiceId      // Update attributions after review
POST   /api/invoices/:invoiceId/confirm  // Mark as confirmed
GET    /api/organizations/:orgId/invoices // List with pagination

// Confidence & Cost Aggregation
GET    /api/projects/:projectId/cost-breakdown  // Full breakdown with confidence
GET    /api/projects/:projectId/confidence-score // Aggregate confidence only

// Rate Configuration (Phase 2)
GET    /api/organizations/:orgId/rate-bands
PUT    /api/organizations/:orgId/rate-bands

// Benchmarks (read-only)
GET    /api/benchmarks/rates?role=:role&region=:region
```

### Backend Processing Architecture

**Problem:** Invoice processing can't run synchronously in Vercel functions.

**Solution:** Async processing with status polling

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │────▶│  Upload API  │────▶│  Vercel Blob │
│   (upload)   │     │  (validates) │     │  (storage)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Queue      │  (Vercel KV or Upstash)
                    │   (job ref)  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │  Cron Job    │────▶│  AI Parser   │
                    │  (1 min)     │     │  (external)  │
                    └──────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  PostgreSQL  │
                    │  (results)   │
                    └──────────────┘
```

**Implementation notes:**
- Use Vercel Blob for invoice storage (included in Pro plan)
- Use Vercel KV (Redis) for job queue—simple LPUSH/BRPOP pattern
- Cron function runs every minute, processes up to 5 invoices per run
- Client polls `/api/invoices/:id` for status updates

### Cost Calculation Service

```typescript
// services/costCalculation.ts

interface CostComponent {
  category: 'cloud' | 'vendor' | 'labor' | 'platform' | 'other';
  amount: number;
  confidence: number;
  source: string;
  sourceId?: string;
  attribution: 'direct' | 'rule_based' | 'proportional' | 'estimated';
}

interface ProjectCostBreakdown {
  projectId: string;
  period: { start: Date; end: Date };
  components: CostComponent[];
  totalAmount: number;
  aggregateConfidence: number;
  confidenceBand: { low: number; high: number };
  improvementSuggestions: string[];
}

export async function calculateProjectCost(
  projectId: string,
  period: DateRange
): Promise<ProjectCostBreakdown> {
  const [cloudCosts, vendorCosts, laborEstimate] = await Promise.all([
    getCloudCosts(projectId, period),
    getVendorCosts(projectId, period),
    getLaborEstimate(projectId),
  ]);

  const components: CostComponent[] = [
    ...mapCloudToComponents(cloudCosts),
    ...mapVendorToComponents(vendorCosts),
    ...mapLaborToComponents(laborEstimate, period),
  ];

  return {
    projectId,
    period,
    components,
    totalAmount: sumAmounts(components),
    aggregateConfidence: calculateAggregateConfidence(components),
    confidenceBand: calculateConfidenceBand(components),
    improvementSuggestions: generateSuggestions(components),
  };
}
```

---

## 5. Confidence Scoring Implementation Details and Caveats

### The Formula Problem

Jeff's formula is conceptually correct but implementation has edge cases:

```
confidence = source_quality × data_freshness × attribution_clarity
```

**Problem 1: Multiplicative collapse**
If any factor is low, confidence collapses disproportionately:
- Source: 1.0, Freshness: 1.0, Attribution: 0.4 → 0.40 (seems reasonable)
- Source: 0.7, Freshness: 0.7, Attribution: 0.6 → 0.29 (too harsh for decent data)

**Recommendation:** Use weighted geometric mean with floor:
```typescript
function calculateComponentConfidence(
  sourceQuality: number,    // 0-1
  dataFreshness: number,    // 0-1  
  attributionClarity: number // 0-1
): number {
  const weights = { source: 0.5, freshness: 0.25, attribution: 0.25 };
  
  const weightedProduct = 
    Math.pow(sourceQuality, weights.source) *
    Math.pow(dataFreshness, weights.freshness) *
    Math.pow(attributionClarity, weights.attribution);
  
  // Floor at 0.20 to avoid "zero confidence" on any real data
  return Math.max(0.20, weightedProduct);
}
```

**Problem 2: Aggregate confidence calculation**

Jeff doesn't specify how to aggregate component confidences. Options:

| Method | Formula | Issue |
|--------|---------|-------|
| Simple average | Σ(conf) / n | Ignores component size |
| Weighted by amount | Σ(conf × amt) / Σ(amt) | One low-conf big component dominates |
| Minimum | min(conf) | Too conservative |
| Harmonic mean | n / Σ(1/conf) | Punishes outliers appropriately |

**Recommendation:** Amount-weighted harmonic mean with smoothing:
```typescript
function aggregateConfidence(components: CostComponent[]): number {
  if (components.length === 0) return 0;
  
  const totalAmount = components.reduce((sum, c) => sum + c.amount, 0);
  if (totalAmount === 0) return 0;
  
  // Weighted harmonic mean
  const weightedReciprocals = components.reduce((sum, c) => {
    const weight = c.amount / totalAmount;
    return sum + (weight / Math.max(c.confidence, 0.1)); // Avoid division by near-zero
  }, 0);
  
  return Math.min(1 / weightedReciprocals, 0.99); // Cap at 99%
}
```

**Problem 3: Confidence band calculation**

The doc shows bands like "±30%" but doesn't explain derivation.

**Recommendation:** Use confidence to derive standard deviation estimate:
```typescript
function calculateConfidenceBand(
  totalAmount: number,
  aggregateConfidence: number
): { low: number; high: number } {
  // Map confidence to coefficient of variation
  // High confidence (0.9) → CV of 0.05 (±5%)
  // Low confidence (0.4) → CV of 0.50 (±50%)
  const cv = 0.55 - (aggregateConfidence * 0.5);
  
  // 80% confidence interval (±1.28 std devs)
  const marginPct = cv * 1.28;
  
  return {
    low: Math.round(totalAmount * (1 - marginPct)),
    high: Math.round(totalAmount * (1 + marginPct)),
  };
}
```

### Caveat: Confidence ≠ Accuracy

**Critical UX note:** Confidence score measures *data quality*, not *estimate accuracy*. A 90% confidence score means "we have good data sources," not "we're 90% sure this number is right."

Users will conflate these. The explainer copy must be precise:
- ❌ "90% accurate"  
- ❌ "90% certain"
- ✅ "90% data quality — based on direct measurements and verified sources"

---

## 6. UX/Data-Trust Requirements to Avoid False Precision

### Mandatory Display Rules

**Rule 1: No false precision in display**
```typescript
// BAD: Shows false precision
formatCurrency(124412.37) // "$124,412.37"

// GOOD: Rounds based on confidence
function formatCostWithConfidence(amount: number, confidence: number): string {
  if (confidence >= 0.85) return formatCurrency(round(amount, -2));  // $124,400
  if (confidence >= 0.70) return formatCurrency(round(amount, -3));  // $124,000
  if (confidence >= 0.50) return `~${formatCurrency(round(amount, -3))}`; // ~$124,000
  return `~${formatCurrency(round(amount, -4))}`; // ~$120,000
}
```

**Rule 2: Always show confidence indicator (no exceptions)**

Even on dashboard cards, summary views, exports. If we show a number, we show its confidence.

**Rule 3: Drill-down must be one click away**

Never require navigation to see data sources. Use expandable panels or popovers.

**Rule 4: Mixed-precision warning**

When displaying totals that mix high and low confidence components:
```
Total: $124,000/month
⚠️ This total includes estimated components. 
   Breakdown: $89K verified + ~$35K estimated
```

### Export Requirements

All exports (CSV, PDF, API) must include:
- Confidence score per line item
- Source attribution per line item
- Methodology description header
- Generation timestamp
- "Estimate" watermark on PDF if aggregate confidence < 70%

### Component Library Additions

```typescript
// components/ConfidenceBadge.tsx
interface ConfidenceBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// components/CostDisplay.tsx
interface CostDisplayProps {
  amount: number;
  confidence: number;
  currency?: string;
  showBand?: boolean;
  onDrillDown?: () => void;
}

// components/CostBreakdownPanel.tsx
interface CostBreakdownPanelProps {
  breakdown: ProjectCostBreakdown;
  onImproveClick?: (suggestion: string) => void;
}

// components/ConfidenceExplainer.tsx
// Standardized explainer content for "what does this confidence score mean"
```

---

## 7. Data Ingestion Strategy for Invoices and Allocations

### Invoice Processing Pipeline

**Phase 1 (MVP): CSV-only with manual mapping**

```
Upload CSV → Column mapping UI → Validation → Store
```

- User uploads CSV from their AP system
- UI presents column mapping (vendor, date, amount, description)
- Validation: required fields, amount format, date parsing
- Manual project attribution via dropdown
- No AI, no PDF support

**Phase 1.5 (Post-MVP): Basic PDF support**

```
Upload PDF → External extraction → Review UI → Store
```

- Integrate Mindee or Amazon Textract for extraction
- Extracted data goes to review queue
- User confirms/corrects extraction before save
- Store both raw extraction and confirmed data for training

**Phase 2: Intelligent attribution**

- Suggest project attribution based on vendor history
- Auto-attribute recurring invoices from same vendor
- Multi-project split UI for shared costs

### Invoice Processing Implementation

```typescript
// api/invoices/upload.ts
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  
  // Validate file
  if (!file) throw new BadRequestError('No file provided');
  if (file.size > 10 * 1024 * 1024) throw new BadRequestError('File too large (10MB max)');
  
  const allowedTypes = ['text/csv', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new BadRequestError('Only CSV and PDF files supported');
  }
  
  // Store file
  const blob = await put(`invoices/${orgId}/${uuid()}`, file, {
    access: 'private',
    contentType: file.type,
  });
  
  // Create pending record
  const invoice = await prisma.invoiceUpload.create({
    data: {
      organizationId: orgId,
      filename: file.name,
      fileHash: await hashFile(file),
      totalAmount: 0, // Set after processing
      processingStatus: file.type === 'text/csv' ? 'NEEDS_REVIEW' : 'PENDING',
      rawExtraction: file.type === 'text/csv' ? await parseCSV(file) : null,
    },
  });
  
  // Queue for processing if PDF
  if (file.type === 'application/pdf') {
    await queueInvoiceProcessing(invoice.id);
  }
  
  return NextResponse.json({ invoiceId: invoice.id, status: invoice.processingStatus });
}
```

### Allocation Strategy

For vendor/SaaS costs that span multiple projects:

**Option A: Percentage split (recommended for MVP)**
```typescript
interface ProjectAttribution {
  projectId: string;
  percentage: number; // Must sum to 100
  confidence: number; // User can indicate certainty
}
```

**Option B: Usage-based split (Phase 2)**
```typescript
interface UsageBasedAttribution {
  projectId: string;
  metric: string; // e.g., "api_calls", "storage_gb"
  metricValue: number;
  // System calculates percentage from relative values
}
```

**Option C: Rule-based allocation (Phase 2)**
```typescript
interface AllocationRule {
  vendorPattern: string; // Regex or exact match
  allocationStrategy: 'even' | 'headcount' | 'cloud_proportional' | 'custom';
  projectFilter?: string[]; // Limit to specific projects
}
```

---

## 8. Performance/Scale Concerns

### Known Bottlenecks

**1. Cost aggregation query complexity**

Current query for project cost breakdown joins 5+ tables. At scale (100+ projects, 12 months history), this becomes slow.

**Mitigation:**
- Materialized view for current-month aggregates, refreshed hourly
- Pagination for historical views (month-by-month)
- Consider TimescaleDB extension for time-series optimization if PostgreSQL becomes bottleneck

**2. JSONB column bloat**

`source_breakdown` could grow large for projects with many cost components.

**Mitigation:**
- Normalize to separate `cost_component` table if exceeds 10KB average
- Use JSONB compression (default in PG 14+)
- Index only queried paths, not full document

**3. Invoice storage**

At 1000 organizations × 50 invoices/month × 500KB average = 25GB/month

**Mitigation:**
- Vercel Blob pricing is reasonable ($0.15/GB storage, $0.05/GB egress)
- Implement retention policy (archive after 24 months)
- Compress PDFs on upload

**4. Vercel function cold starts**

Cost calculation functions may cold start frequently for low-traffic orgs.

**Mitigation:**
- Keep functions small (tree-shake aggressively)
- Consider edge functions for read-heavy endpoints
- Pre-warm critical paths via cron

### Scaling Thresholds

| Metric | Comfortable | Warning | Redesign Needed |
|--------|-------------|---------|-----------------|
| Projects per org | <500 | 500-2000 | >2000 |
| Cost components per project | <100 | 100-500 | >500 |
| Invoice uploads per month | <10,000 | 10K-50K | >50K |
| Concurrent cost calculations | <50 | 50-200 | >200 |

### Caching Strategy

```typescript
// Aggressive caching for read-heavy paths
const CACHE_TTL = {
  benchmarkRates: 24 * 60 * 60,      // 24 hours
  projectCostBreakdown: 5 * 60,       // 5 minutes
  aggregateConfidence: 5 * 60,        // 5 minutes
  organizationRateBands: 60 * 60,     // 1 hour
};

// Use Vercel KV for caching
async function getCachedOrCompute<T>(
  key: string,
  compute: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await kv.get<T>(key);
  if (cached) return cached;
  
  const result = await compute();
  await kv.set(key, result, { ex: ttlSeconds });
  return result;
}
```

---

## 9. Security/Privacy/Compliance Implications

### Data Classification

| Data Type | Classification | Handling |
|-----------|---------------|----------|
| Cloud cost data | Business Confidential | Encrypted at rest, org-scoped access |
| Labor estimates (headcount) | Business Confidential | Encrypted, audit logged |
| Role rate bands | HR Sensitive | Encrypted, admin-only access |
| Uploaded invoices | Business Confidential + PII risk | Encrypted, retention policy, access logged |
| Individual salary data | NOT STORED | Explicitly rejected at API layer |

### Invoice Security Concerns

**Risk: Invoices may contain PII**
- Employee names on expense reports
- SSNs on contractor 1099s (shouldn't be uploaded, but users make mistakes)
- Personal addresses

**Mitigations:**
1. Pre-upload warning about PII
2. Automated PII detection before storage (use AWS Macie or similar)
3. Option to redact detected PII before confirmation
4. Shorter retention for invoice files (12 months) vs. extracted data (indefinite)

### Access Control Additions

```typescript
// New permissions needed
enum CostPermission {
  VIEW_PROJECT_COSTS = 'cost:view',
  EDIT_LABOR_ESTIMATES = 'cost:labor:edit',
  UPLOAD_INVOICES = 'cost:invoice:upload',
  CONFIRM_INVOICES = 'cost:invoice:confirm',
  MANAGE_RATE_BANDS = 'cost:rates:manage', // Admin only
  EXPORT_COST_DATA = 'cost:export',
}

// Role mappings
const ROLE_PERMISSIONS = {
  viewer: [CostPermission.VIEW_PROJECT_COSTS],
  member: [CostPermission.VIEW_PROJECT_COSTS, CostPermission.EDIT_LABOR_ESTIMATES],
  manager: [...member, CostPermission.UPLOAD_INVOICES, CostPermission.CONFIRM_INVOICES, CostPermission.EXPORT_COST_DATA],
  admin: [...manager, CostPermission.MANAGE_RATE_BANDS],
};
```

### Audit Requirements

All cost-related mutations must be audit logged:
- Labor estimate changes (who, when, old value, new value)
- Invoice uploads and confirmations
- Rate band modifications
- Cost allocation changes

```typescript
interface CostAuditEvent {
  eventType: 'labor_estimate' | 'invoice' | 'rate_band' | 'allocation';
  action: 'create' | 'update' | 'delete' | 'confirm';
  actorId: string;
  organizationId: string;
  resourceId: string;
  previousValue?: unknown;
  newValue?: unknown;
  timestamp: Date;
  ipAddress?: string;
}
```

### Compliance Considerations

**SOC 2 Impact:**
- Invoice storage adds data handling scope
- Need documented retention and deletion procedures
- Access logging becomes mandatory (already recommended)

**GDPR Impact:**
- Invoices may contain EU personal data
- Need data processing agreement update
- Right to deletion must include invoice files

**Recommendation:** Engage compliance before Phase 1.5 (PDF invoice support). CSV-only MVP has lower risk surface.

---

## 10. Phased Build Order with Estimates and Risk Mitigation

### Phase 1: MVP "Honest Estimates" (7-9 weeks)

**Week 1-2: Schema & Infrastructure**
- [ ] Prisma schema additions (LaborEstimate, confidence columns)
- [ ] Database migrations
- [ ] Vercel KV setup for caching
- [ ] Audit logging infrastructure

**Week 3-4: Labor Estimation**
- [ ] Labor estimate API endpoints
- [ ] Headcount + time allocation input UI
- [ ] Benchmark rate service (hardcoded initially)
- [ ] Labor cost calculation logic

**Week 5-6: Confidence System**
- [ ] Confidence calculation service
- [ ] ConfidenceBadge component
- [ ] CostDisplay component with confidence
- [ ] Cost breakdown drill-down panel

**Week 7-8: Integration & Polish**
- [ ] Integrate confidence into existing cost views
- [ ] Improvement suggestion engine
- [ ] Export updates (include confidence in CSV/PDF)
- [ ] Documentation and help content

**Week 9: Buffer & QA**
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Security review
- [ ] Beta customer feedback

**Risks & Mitigations:**
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Confidence formula edge cases | High | Medium | Extensive unit tests, manual QA pass |
| UI complexity creep | Medium | Medium | Strict scope, defer "nice to haves" |
| Benchmark rate sourcing | Low | Low | Hardcode reasonable defaults, iterate |

### Phase 1.5: Basic Invoice Support (4-5 weeks)

**Week 1-2: CSV Upload**
- [ ] File upload API with validation
- [ ] Column mapping UI
- [ ] Manual project attribution
- [ ] Invoice list view

**Week 3-4: Attribution & Integration**
- [ ] Vendor cost integration into cost breakdown
- [ ] Attribution editing UI
- [ ] Recurring vendor detection

**Week 5: QA & Documentation**

**Risks & Mitigations:**
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| CSV format variations | High | Medium | Flexible parser, good error messages |
| User confusion on attribution | Medium | Medium | Guided flow, smart defaults |

### Phase 2: Rate Intelligence (10-12 weeks)

**Weeks 1-4: Role Band Administration**
- [ ] Rate band data model
- [ ] Admin UI for rate configuration
- [ ] Rate band application to labor estimates
- [ ] Historical rate versioning

**Weeks 5-8: Integrations**
- [ ] Jira OAuth integration
- [ ] Time allocation extraction from Jira
- [ ] Linear integration (if customer demand)

**Weeks 9-10: PDF Invoice Support**
- [ ] External parser integration (Mindee evaluation)
- [ ] Extraction review UI
- [ ] Confidence scoring for extracted data

**Weeks 11-12: Polish & Scale**
- [ ] Performance optimization
- [ ] Advanced allocation rules
- [ ] Bulk operations

**Risks & Mitigations:**
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Jira API rate limits | Medium | High | Aggressive caching, incremental sync |
| PDF extraction accuracy | High | Medium | Human review required, train over time |
| Scope creep from integrations | High | High | Strict integration scope, say no often |

### Phase 3: Predictive Intelligence (14-16 weeks)

**Not scoped in detail.** Key dependencies:
- Minimum 6 months of historical data per customer
- Statistical modeling expertise (may need hire or contractor)
- Baseline establishment period before anomaly detection works

**Recommendation:** Re-evaluate Phase 3 scope after Phase 2 ships and we have real usage data.

---

## 11. Explicit Go/No-Go on Each Modeling Approach

### Approach A: Unit Economics Model
**Verdict: GO (Phase 2)**

Technically straightforward. User defines output metrics, we compute cost/unit. Main challenge is UI for metric definition and ensuring metrics are consistently tracked.

**Implementation complexity:** Medium  
**Value:** High for infrastructure-heavy customers  
**Dependency:** Requires solid cost aggregation foundation (Phase 1)

### Approach B: Blended Role-Rate Bands
**Verdict: GO (MVP core)**

This is the core of the salary-free strategy. Implementation is straightforward—it's essentially a lookup table with user overrides.

**Implementation complexity:** Low  
**Value:** Critical for product positioning  
**Caveat:** Must clearly communicate that bands are organization-provided or benchmarks

### Approach C: Contract/Invoice Ingestion
**Verdict: CONDITIONAL GO (Phase 1.5 for CSV, Phase 2 for PDF)**

CSV ingestion is low-risk and high-value. PDF parsing requires external dependency and human review loop—don't underestimate the UX complexity.

**Implementation complexity:** Medium (CSV) / High (PDF)  
**Value:** High for vendor-heavy projects  
**Caveat:** Scope creep risk. Keep invoice features minimal in MVP.

### Approach D: Service Cost Allocation
**Verdict: GO (MVP, leverage existing)**

We already have cloud cost allocation. Extending this to SaaS/vendor is natural. The "labor multiplier" concept is viable but needs careful UX—it's essentially a guess multiplier.

**Implementation complexity:** Low (builds on existing)  
**Value:** Medium  
**Caveat:** Don't position labor multiplier as accurate; it's a rough proxy

### Approach E: Throughput/Value Proxy
**Verdict: DEFER (Phase 3+)**

Conceptually interesting but practically challenging. Requires customers to have well-defined value metrics, which most don't. This is research territory.

**Implementation complexity:** High  
**Value:** Potentially high but unproven  
**Recommendation:** Run as opt-in experiment with 2-3 sophisticated customers before committing engineering resources

### Hybrid Strategy (as proposed)
**Verdict: GO**

The progressive enhancement approach is exactly right. Ship with cloud + benchmarks, improve over time. This is the correct architecture.

**Critical success factor:** The confidence scoring system must ship with MVP. Without it, the hybrid approach looks like sloppy guessing rather than principled estimation.

---

## Summary: Top Recommendations

1. **Extend MVP timeline to 7-9 weeks.** The proposed 4-6 weeks is achievable only by cutting corners on confidence scoring, which is the differentiator.

2. **Defer PDF invoice processing to Phase 1.5/2.** CSV-only for MVP reduces risk and compliance surface.

3. **Invest heavily in confidence UX.** This is what separates "honest estimates" from "made-up numbers." Budget 2+ weeks of design/eng time.

4. **Fix the confidence formula.** Use weighted geometric mean with floor instead of straight multiplication. Document the methodology publicly.

5. **Implement proper audit logging from day one.** Cost data is sensitive; enterprises will ask for audit trails.

6. **Add invoice PII detection before Phase 2 PDF support.** Non-negotiable for enterprise trust.

7. **Don't build the labor multiplier (Approach D) as a first-class feature.** Keep it as an advanced setting, not a recommended path.

8. **Re-scope Phase 3 after Phase 2 ships.** Predictive features depend on data we don't have yet. Don't commit to timelines.

---

*Review complete. Ready to discuss schema details, API contracts, or confidence scoring implementation in depth.*

**— Emmy, Principal Engineer**
