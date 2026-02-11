# Screen Spec: Billing & Subscription
## /billing

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The Billing & Subscription screen allows admins to manage their Vantage subscription, view usage, update payment methods, and access invoices. It's the financial control center for the workspace.

**Core Value:** Transparent billing builds trust. Admins need clear visibility into costs, usage, and the ability to manage their subscription without contacting support.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| B-1 | Admin | See my current plan and pricing | I understand what I'm paying for |
| B-2 | Admin | View my usage against limits | I know if I need to upgrade |
| B-3 | Admin | Upgrade or downgrade my plan | I can adjust as needs change |
| B-4 | Admin | Update my payment method | I can ensure uninterrupted service |
| B-5 | Admin | Download invoices | I can submit for expense reports |
| B-6 | Admin | See upcoming charges | I can budget appropriately |
| B-7 | Admin | Cancel my subscription | I can leave if needed |
| B-8 | Finance | Access billing without full admin | I can manage payments securely |

---

## 3. Access Control

- **Owner:** Full access to all billing features, subscription cancellation, ownership transfer
- **Admins:** Can view billing, update payment methods, download invoices (cannot cancel subscription or transfer ownership)
- **Billing contacts:** Can view/manage payment methods and download invoices
- **Members/Viewers:** No access (redirect to 403 or hide nav item)

---

## 4. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Billing & Subscription                                          │ │
│         │  │ Manage your plan, usage, and payment methods                     │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [Overview] [Usage] [Payment Methods] [Invoices]                 │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │  OVERVIEW TAB                                                        │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ CURRENT PLAN                                                    │ │
│         │  │                                                                  │ │
│         │  │ ┌────────────────────────────────────────────────────────────┐ │ │
│         │  │ │                                                             │ │ │
│         │  │ │  🏢 Team Plan                                              │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │  $29 /user/month · billed monthly                          │ │ │
│         │  │ │  24 users · $696/month                                     │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │  Next billing date: March 1, 2026                          │ │ │
│         │  │ │                                                             │ │ │
│         │  │ │                          [Change Plan]  [Cancel Subscription]│ │
│         │  │ │                                                             │ │ │
│         │  │ └────────────────────────────────────────────────────────────┘ │ │
│         │  │                                                                  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ USAGE SUMMARY                                                   │ │
│         │  │                                                                  │ │
│         │  │ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────┐│ │
│         │  │ │ Users              │ │ Projects           │ │ Integrations   ││ │
│         │  │ │ 24 of 50           │ │ 12 of unlimited    │ │ 3 of 5         ││ │
│         │  │ │ ████████░░░░ 48%   │ │ ✓ Unlimited        │ │ ████████████60%││ │
│         │  │ └────────────────────┘ └────────────────────┘ └────────────────┘│ │
│         │  │                                                                  │ │
│         │  │ ┌────────────────────┐ ┌────────────────────┐ ┌────────────────┐│ │
│         │  │ │ Storage            │ │ API Calls          │ │ Reports        ││ │
│         │  │ │ 2.4 GB of 10 GB    │ │ 45K of 100K/mo     │ │ 12 of unlimited││ │
│         │  │ │ ████░░░░░░░░ 24%   │ │ █████████░░░ 45%   │ │ ✓ Unlimited    ││ │
│         │  │ └────────────────────┘ └────────────────────┘ └────────────────┘│ │
│         │  │                                                                  │ │
│         │  │                                         [View detailed usage →] │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ PAYMENT METHOD                                                  │ │
│         │  │                                                                  │ │
│         │  │ 💳 Visa ending in 4242                    Expires 12/2027      │ │
│         │  │                                                                  │ │
│         │  │                                              [Update Payment]   │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ RECENT INVOICES                                                 │ │
│         │  │                                                                  │ │
│         │  │ Feb 1, 2026    $696.00    Paid    [Download]                    │ │
│         │  │ Jan 1, 2026    $638.00    Paid    [Download]                    │ │
│         │  │ Dec 1, 2025    $580.00    Paid    [Download]                    │ │
│         │  │                                                                  │ │
│         │  │                                         [View all invoices →]   │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tab Structure

### Tab 1: Overview (Default)
Current plan, usage summary, payment method, recent invoices.

### Tab 2: Usage
Detailed usage breakdown and historical trends.

### Tab 3: Payment Methods
Manage credit cards and billing contacts.

### Tab 4: Invoices
Complete invoice history with download options.

---

## 6. Component Breakdown

### 6.1 Page Header

```tsx
<PageHeader
  title="Billing & Subscription"
  subtitle="Manage your plan, usage, and payment methods"
/>
```

### 6.2 Current Plan Card

```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-5 h-5 text-primary-500" />
          <h3 className="text-xl font-semibold text-neutral-900">{plan.name}</h3>
          {plan.isPopular && <Badge variant="primary">Popular</Badge>}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-neutral-900">
            ${plan.pricePerUser}
            <span className="text-base font-normal text-neutral-500">/user/month</span>
          </p>
          <p className="text-sm text-neutral-500">
            {subscription.userCount} users · ${subscription.monthlyTotal}/month
          </p>
          <p className="text-sm text-neutral-500">
            Billed {subscription.billingInterval}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-neutral-500">Next billing date</p>
        <p className="text-sm font-medium text-neutral-900">{formatDate(subscription.nextBillingDate)}</p>
      </div>
    </div>
    
    <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-100">
      <Button variant="primary" onClick={openChangePlanModal}>
        Change Plan
      </Button>
      <Button variant="ghost" className="text-danger-600 hover:text-danger-700" onClick={openCancelModal}>
        Cancel Subscription
      </Button>
    </div>
  </CardContent>
</Card>
```

### 6.3 Usage Summary Cards

**Grid Layout:** 3 columns on desktop, 2 on tablet, 1 on mobile

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {usageMetrics.map((metric) => (
    <UsageCard
      key={metric.name}
      name={metric.name}
      current={metric.current}
      limit={metric.limit}
      unit={metric.unit}
      isUnlimited={metric.isUnlimited}
    />
  ))}
</div>
```

**Usage Card Component:**
```tsx
<Card className="p-4">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-neutral-700">{name}</span>
    {isUnlimited ? (
      <span className="text-xs text-success-600">✓ Unlimited</span>
    ) : (
      <span className="text-xs text-neutral-500">{current} of {limit}{unit}</span>
    )}
  </div>
  {!isUnlimited && (
    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${getUsageColor(percentage)}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  )}
  {percentage > 80 && !isUnlimited && (
    <p className="text-xs text-warning-600 mt-2">
      Approaching limit. Consider upgrading.
    </p>
  )}
</Card>
```

**Usage Color Logic:**
```typescript
function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'bg-danger-500';
  if (percentage >= 75) return 'bg-warning-500';
  return 'bg-primary-500';
}
```

### 6.4 Payment Method Card

```tsx
<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold text-neutral-900">Payment Method</h3>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-8 bg-neutral-100 rounded flex items-center justify-center">
          <CreditCardIcon brand={card.brand} />
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {card.brand} ending in {card.last4}
          </p>
          <p className="text-xs text-neutral-500">Expires {card.expMonth}/{card.expYear}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={openUpdatePaymentModal}>
        Update Payment
      </Button>
    </div>
  </CardContent>
</Card>
```

### 6.5 Recent Invoices List

```tsx
<Card>
  <CardHeader className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-neutral-900">Recent Invoices</h3>
    <Button variant="ghost" size="sm" onClick={goToInvoicesTab}>
      View all invoices →
    </Button>
  </CardHeader>
  <CardContent>
    <div className="divide-y divide-neutral-100">
      {invoices.slice(0, 3).map((invoice) => (
        <div key={invoice.id} className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-neutral-900">{formatDate(invoice.date)}</p>
            <p className="text-xs text-neutral-500">{invoice.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-900">${invoice.amount.toFixed(2)}</span>
            <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
              {invoice.status}
            </Badge>
            <Button variant="ghost" size="sm" icon={<Download />} onClick={() => downloadInvoice(invoice.id)}>
              Download
            </Button>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## 7. Plan Comparison Modal

> **NOTE:** Pricing tiers and feature limits must be config-driven (stored in database), not hardcoded. This enables A/B testing pricing without code changes. The values shown below are illustrative defaults per TECHNICAL_DECISIONS.md B2.

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Change Plan                                                              [X]    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Choose the plan that fits your team                                            │
│                                                                                 │
│  Billing: [Monthly ▼]                                                           │
│                                                                                 │
│  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐            │
│  │ FREE              │ │ TEAM              │ │ ENTERPRISE        │            │
│  │                   │ │ ★ Current Plan    │ │                   │            │
│  │ $0                │ │ $29               │ │ Custom            │            │
│  │ /user/month       │ │ /user/month       │ │ /user/month       │            │
│  │                   │ │                   │ │                   │            │
│  │ Up to 5 users     │ │ Up to 50 users    │ │ Unlimited users   │            │
│  │ 2 integrations    │ │ 5 integrations    │ │ Unlimited integ.  │            │
│  │ 1 GB storage      │ │ 10 GB storage     │ │ Unlimited storage │            │
│  │ 10K API calls/mo  │ │ 100K API calls/mo │ │ Unlimited API     │            │
│  │ Email support     │ │ Priority support  │ │ Dedicated support │            │
│  │                   │ │ Scout AI          │ │ Custom AI models  │            │
│  │                   │ │ Reports           │ │ SSO/SAML          │            │
│  │                   │ │                   │ │ Audit logs        │            │
│  │                   │ │                   │ │ SLA guarantee     │            │
│  │                   │ │                   │ │                   │            │
│  │ [Downgrade]       │ │ Current Plan      │ │ [Contact Sales]   │            │
│  └───────────────────┘ └───────────────────┘ └───────────────────┘            │
│                                                                                 │
│  ─────────────────────────────────────────────────────────────────────────────  │
│                                                                                 │
│  💡 Save 20% with annual billing                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Plan Card Component

```tsx
<div className={`
  border rounded-xl p-6 relative
  ${isCurrent ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'}
`}>
  {isCurrent && (
    <Badge className="absolute -top-3 left-4" variant="primary">
      ★ Current Plan
    </Badge>
  )}
  
  <h3 className="text-lg font-semibold text-neutral-900">{plan.name}</h3>
  
  <div className="mt-4">
    <span className="text-3xl font-bold text-neutral-900">
      {plan.price === 0 ? 'Free' : `$${plan.price}`}
    </span>
    {plan.price > 0 && (
      <span className="text-neutral-500">/user/month</span>
    )}
  </div>
  
  <ul className="mt-6 space-y-3">
    {plan.features.map((feature) => (
      <li key={feature} className="flex items-center gap-2 text-sm text-neutral-600">
        <Check className="w-4 h-4 text-success-500" />
        {feature}
      </li>
    ))}
  </ul>
  
  <div className="mt-6">
    {isCurrent ? (
      <Button variant="secondary" disabled className="w-full">Current Plan</Button>
    ) : isUpgrade ? (
      <Button variant="primary" className="w-full" onClick={() => selectPlan(plan.id)}>
        Upgrade
      </Button>
    ) : isDowngrade ? (
      <Button variant="secondary" className="w-full" onClick={() => selectPlan(plan.id)}>
        Downgrade
      </Button>
    ) : (
      <Button variant="secondary" className="w-full" onClick={contactSales}>
        Contact Sales
      </Button>
    )}
  </div>
</div>
```

### 7.3 Upgrade Confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│ Confirm Plan Change                                      [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ You're upgrading to Enterprise Plan                             │
│                                                                 │
│ Changes:                                                        │
│ • Users: 50 → Unlimited                                        │
│ • Integrations: 5 → Unlimited                                  │
│ • Storage: 10 GB → Unlimited                                   │
│ • +SSO/SAML, Audit logs, SLA                                   │
│                                                                 │
│ Pricing:                                                        │
│ Current: $29/user/month × 24 users = $696/month                │
│ New: $49/user/month × 24 users = $1,176/month                  │
│                                                                 │
│ ⚡ Prorated charge today: $240.00                               │
│    (remainder of current billing cycle)                         │
│                                                                 │
│                               [Cancel] [Confirm Upgrade →]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Usage Tab (Detailed)

### 8.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ USAGE DETAILS                                                   │
│                                                                 │
│ Billing period: Feb 1 - Feb 28, 2026                           │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ USERS                                                        │ │
│ │                                                              │ │
│ │ Active users this period: 24                                 │ │
│ │ Plan limit: 50 users                                         │ │
│ │                                                              │ │
│ │ User growth (last 6 months):                                 │ │
│ │     24 ┤                                         ●           │ │
│ │     20 ┤                              ●──────────            │ │
│ │     16 ┤                    ●─────────                       │ │
│ │     12 ┤          ●─────────                                 │ │
│ │      8 ┤●─────────                                           │ │
│ │        └─────────────────────────────────────────            │ │
│ │         Sep  Oct  Nov  Dec  Jan  Feb                         │ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ API CALLS                                                    │ │
│ │                                                              │ │
│ │ This period: 45,230 of 100,000                              │ │
│ │ ████████████████████████░░░░░░░░░░░░░░░░░ 45%               │ │
│ │                                                              │ │
│ │ Daily average: 5,653 calls                                   │ │
│ │ Peak day: Feb 5 (8,924 calls)                               │ │
│ │                                                              │ │
│ │ [View API call breakdown →]                                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ STORAGE                                                      │ │
│ │                                                              │ │
│ │ Current usage: 2.4 GB of 10 GB                              │ │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 24%               │ │
│ │                                                              │ │
│ │ Breakdown:                                                   │ │
│ │ • Attachments: 1.8 GB                                        │ │
│ │ • Cached data: 0.4 GB                                        │ │
│ │ • Reports: 0.2 GB                                            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Payment Methods Tab

### 9.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ PAYMENT METHODS                                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💳 Visa ending in 4242                          DEFAULT      │ │
│ │    Expires 12/2027                                          │ │
│ │                                        [Edit] [Remove]      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💳 Mastercard ending in 8888                                │ │
│ │    Expires 06/2026                                          │ │
│ │                               [Make Default] [Remove]       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [+ Add Payment Method]                                          │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ BILLING INFORMATION                                             │
│                                                                 │
│ Company name: Acme Corporation                                  │
│ Billing email: billing@acme.com                                │
│ Address: 123 Main St, New York, NY 10001                       │
│ Tax ID: US123456789                                            │
│                                                                 │
│                                        [Edit Billing Info]      │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ BILLING CONTACTS                                                │
│                                                                 │
│ These users receive invoices and billing notifications:         │
│                                                                 │
│ [Avatar] Jake Martinez (Admin)                    [Primary]     │
│          jake@acme.com                                          │
│                                                                 │
│ [Avatar] Sarah Chen                               [Remove]      │
│          sarah@acme.com                                         │
│                                                                 │
│ [+ Add Billing Contact]                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Add Payment Method Modal

Uses Stripe Elements or similar for PCI compliance:

```
┌─────────────────────────────────────────────────────────────────┐
│ Add Payment Method                                       [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Card information                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 💳 [Card number                                           ] │ │
│ │    [MM/YY     ]  [CVC    ]  [ZIP         ]                 │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ☐ Set as default payment method                                │
│                                                                 │
│ 🔒 Your payment information is encrypted and secure.           │
│                                                                 │
│                                         [Cancel] [Add Card]     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Invoices Tab

### 10.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ INVOICES                                                                    │
│                                                                             │
│ [Search invoices...]                [Year: 2026 ▼]  [Status: All ▼]        │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Invoice       │ Date         │ Amount    │ Status  │ Actions           │ │
│ ├───────────────┼──────────────┼───────────┼─────────┼───────────────────┤ │
│ │ INV-2026-002  │ Feb 1, 2026  │ $696.00   │ ✓ Paid  │ [View] [Download] │ │
│ │ INV-2026-001  │ Jan 1, 2026  │ $638.00   │ ✓ Paid  │ [View] [Download] │ │
│ │ INV-2025-012  │ Dec 1, 2025  │ $580.00   │ ✓ Paid  │ [View] [Download] │ │
│ │ INV-2025-011  │ Nov 1, 2025  │ $522.00   │ ✓ Paid  │ [View] [Download] │ │
│ │ INV-2025-010  │ Oct 1, 2025  │ $464.00   │ ✓ Paid  │ [View] [Download] │ │
│ │ INV-2025-009  │ Sep 1, 2025  │ $406.00   │ ✓ Paid  │ [View] [Download] │ │
│ └───────────────┴──────────────┴───────────┴─────────┴───────────────────┘ │
│                                                                             │
│ [← Previous]  Page 1 of 3  [Next →]                                        │
│                                                                             │
│ [Download All as ZIP]                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Invoice Detail Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Invoice INV-2026-002                                     [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Vantage Logo]                           Invoice #INV-2026-002│
│ │                                                              │ │
│ │ Bill To:                         Invoice Date: Feb 1, 2026   │ │
│ │ Acme Corporation                 Due Date: Feb 1, 2026       │ │
│ │ 123 Main St                      Status: Paid Feb 1, 2026    │ │
│ │ New York, NY 10001                                           │ │
│ │                                                              │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │                                                              │ │
│ │ Description                      Qty    Unit Price   Amount  │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │ Team Plan - Monthly              24     $29.00      $696.00  │ │
│ │ (Feb 1 - Feb 28, 2026)                                       │ │
│ │                                                              │ │
│ │ ──────────────────────────────────────────────────────────── │ │
│ │                                  Subtotal           $696.00  │ │
│ │                                  Tax (0%)             $0.00  │ │
│ │                                  ────────────────────────── │ │
│ │                                  Total              $696.00  │ │
│ │                                                              │ │
│ │ Payment Method: Visa ending in 4242                          │ │
│ │ Transaction ID: ch_3abc123def456                             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                           [Download PDF]  [Send to Email]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Cancel Subscription Flow

### 11.1 Cancellation Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Cancel Subscription                                      [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ 😢 We're sorry to see you go!                                  │
│                                                                 │
│ Before you cancel, please tell us why:                          │
│                                                                 │
│ ○ Too expensive                                                │
│ ○ Missing features I need                                      │
│ ○ Switching to another tool                                    │
│ ○ Company no longer needs this                                 │
│ ○ Other                                                        │
│                                                                 │
│ Additional feedback (optional):                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ What happens when you cancel:                                   │
│                                                                 │
│ • Your subscription remains active until Feb 28, 2026          │
│ • After that, your workspace becomes read-only                 │
│ • Data is retained for 90 days, then deleted                   │
│ • You can reactivate anytime during the retention period       │
│                                                                 │
│ 💡 Want to talk to someone? [Contact Support]                  │
│                                                                 │
│                            [Keep Subscription] [Cancel Anyway]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Data Requirements

### 12.1 API Endpoints

**GET /api/billing/subscription**
```typescript
// Response
{
  subscription: {
    id: string;
    planId: string;
    planName: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    pricePerUser: number;
    userCount: number;
    monthlyTotal: number;
    billingInterval: 'monthly' | 'annually';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    nextBillingDate: string;
    cancelAtPeriodEnd: boolean;
  };
  usage: {
    users: { current: number; limit: number };
    projects: { current: number; limit: number | null };
    integrations: { current: number; limit: number };
    storage: { current: number; limit: number; unit: 'GB' };
    apiCalls: { current: number; limit: number };
    reports: { current: number; limit: number | null };
  };
  paymentMethod: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}
```

**GET /api/billing/plans**
```typescript
// Response
{
  plans: Array<{
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'annually';
    features: string[];
    limits: Record<string, number | null>;
  }>;
}
```

**POST /api/billing/subscription**
```typescript
// Change plan
// Body
{
  planId: string;
  billingInterval?: 'monthly' | 'annually';
}
```

**DELETE /api/billing/subscription**
```typescript
// Cancel subscription
// Body
{
  reason: string;
  feedback?: string;
}
```

**GET /api/billing/invoices**
```typescript
// Query: ?year=2026&status=paid&page=1
// Response
{
  invoices: Invoice[];
  pagination: { page: number; totalPages: number; totalCount: number };
}
```

**GET /api/billing/invoices/:id/pdf**
```typescript
// Returns PDF file download
```

**POST /api/billing/payment-methods**
```typescript
// Add payment method (Stripe token)
// Body
{
  token: string;  // Stripe payment method token
  setDefault?: boolean;
}
```

**DELETE /api/billing/payment-methods/:id**
```typescript
// Remove payment method
```

### 12.2 Data Model

```typescript
interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  userCount: number;
  billingInterval: 'monthly' | 'annually';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  providerSubscriptionId: string; // Stripe subscription ID in V1, abstracted for portability
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  pdfUrl: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

interface PaymentMethod {
  id: string;
  type: 'card';
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  providerPaymentMethodId: string; // Stripe PM ID in V1, abstracted for portability
}
```

---

## 13. Edge Cases

| Case | Handling |
|------|----------|
| Payment fails | Show banner, allow update payment method, retry |
| User count exceeds limit | Warning banner, soft block on new invites, prompt upgrade |
| Downgrade loses features | Confirm modal listing features that will be lost |
| Last payment method removed | Prevent removal, require adding new one first |
| Invoice payment pending | Show "Processing" status, auto-refresh |
| Annual plan mid-cycle cancel | Show prorated refund amount |
| Trial ending soon | Banner with days remaining, upgrade CTA |
| Past due account | Warning banner, limited functionality notice |

---

## 14. Mobile Considerations

### 14.1 Responsive Layout

- Plan cards: Stack vertically
- Invoice table: Card view instead of table
- Usage cards: 2x3 grid → 1 column

### 14.2 Mobile Wireframe

```
┌─────────────────────────────────┐
│ ← Billing                       │
├─────────────────────────────────┤
│ [Overview][Usage][Pay][Invoices]│
├─────────────────────────────────┤
│                                 │
│ 🏢 Team Plan                    │
│                                 │
│ $29/user/month                  │
│ 24 users · $696/month           │
│                                 │
│ Next billing: Mar 1, 2026       │
│                                 │
│ [Change Plan]                   │
│                                 │
├─────────────────────────────────┤
│ USAGE                           │
│                                 │
│ Users        24/50   ████░░ 48% │
│ Integrations  3/5    ██████ 60% │
│ Storage     2.4/10GB ███░░░ 24% │
│ API Calls   45K/100K █████░ 45% │
│                                 │
├─────────────────────────────────┤
│ PAYMENT                         │
│ 💳 Visa ****4242  [Update]     │
│                                 │
├─────────────────────────────────┤
│ RECENT INVOICES                 │
│ Feb 1  $696.00  Paid  [↓]      │
│ Jan 1  $638.00  Paid  [↓]      │
│ Dec 1  $580.00  Paid  [↓]      │
│            [View all →]         │
└─────────────────────────────────┘
```

---

## 15. Accessibility

- Price information clearly labeled for screen readers
- Usage meters have aria-valuenow and aria-valuemax
- Payment form fields properly labeled
- Status badges have text alternatives
- Confirmation modals trap focus

---

## 16. Analytics Events

| Event | Properties |
|-------|------------|
| `billing_viewed` | `tab` |
| `plan_change_started` | `current_plan`, `target_plan` |
| `plan_changed` | `from_plan`, `to_plan`, `direction` |
| `subscription_canceled` | `reason`, `plan`, `tenure_months` |
| `payment_method_added` | `brand` |
| `payment_method_removed` | `brand` |
| `invoice_downloaded` | `invoice_id` |
| `usage_warning_shown` | `metric`, `percentage` |

---

## 17. Security Considerations

> **VENDOR NOTE:** All billing logic must be behind a `BillingProvider` interface per TECHNICAL_DECISIONS.md B1. Stripe is the V1 implementation, but domain models must not contain Stripe-specific types. Provider-specific IDs stored in metadata fields, not top-level columns.

- Payment details handled by billing provider (PCI compliant)
- Billing page requires admin or billing contact role
- Sensitive actions (cancel, change plan) require re-authentication
- Invoice downloads are signed URLs with expiration
- Billing email changes require verification

---

## 18. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Pricing tiers: validated with customers? | Product + Business | Pricing must be config-driven, not hardcoded (see B2). |
| 2 | Billing provider: Stripe abstraction layer confirmed? | Engineering | Yes, BillingProvider interface required (see B1). |
| 3 | Usage metering: database counters sufficient for V1? | Engineering | Yes, V1 uses DB counters. Dedicated metering V2 (see B5). |
| 4 | Trial flow: integrated into onboarding? | Product | 14-day trial, banner at 7/3/1 days (see B6). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Billing & Subscription provides transparent financial management for Vantage administrators.*
