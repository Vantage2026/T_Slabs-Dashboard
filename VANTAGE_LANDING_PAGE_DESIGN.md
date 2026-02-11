# Vantage Landing Page - High-Fidelity Design Spec

## Brand Identity
- **Product Name:** Vantage
- **Tagline:** Strategic vantage for PM leaders
- **Positioning:** Intelligence layer above Monday/Jira/Asana

---

## Design System

### Color Palette
- **Primary Brand:** `#0066FF` (Vantage Blue) - Trust, intelligence, enterprise
- **Primary Dark:** `#0052CC` (Hover states)
- **Secondary:** `#6B46C1` (Purple accent) - Innovation, strategic
- **Success Green:** `#10B981` (Health scores, positive metrics)
- **Warning Yellow:** `#F59E0B` (At-risk alerts)
- **Critical Red:** `#EF4444` (Critical alerts)
- **Neutral Gray Scale:**
  - Gray 900: `#111827` (Headings)
  - Gray 700: `#374151` (Body text)
  - Gray 500: `#6B7280` (Secondary text)
  - Gray 300: `#D1D5DB` (Borders)
  - Gray 100: `#F3F4F6` (Backgrounds)
  - White: `#FFFFFF`

### Typography
- **Headings:** Inter, Sans-serif (modern, professional)
  - H1: 56px/64px, Weight 700 (Bold)
  - H2: 36px/44px, Weight 700
  - H3: 24px/32px, Weight 600 (Semibold)
- **Body:** Inter, Sans-serif
  - Large: 18px/28px, Weight 400 (Regular)
  - Regular: 16px/24px, Weight 400
  - Small: 14px/20px, Weight 400
- **Buttons:** Inter, 16px, Weight 600 (Semibold)
- **Captions:** Inter, 12px/16px, Weight 500 (Medium)

### Spacing System (8px grid)
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px
- 4xl: 96px

---

## Landing Page Layout

### Section 1: Hero (Above the Fold)
**Viewport:** 1440px × 800px
**Background:** White with subtle gradient overlay (Gray 100 → White, top to bottom)

**Navigation Bar:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Vantage Logo]    Product  Pricing  Blog    [Sign In] [Start Free Trial] │
│  24px height                                   (link)  (button-primary)    │
└─────────────────────────────────────────────────────────────┘
```
- Logo: Bold "Vantage" wordmark (24px height), Vantage Blue (#0066FF)
- Navigation links: Gray 700, 16px, hover → Vantage Blue
- Sign In: Text link, Gray 700
- Start Free Trial: Primary button (see button specs below)
- Spacing: 16px padding top/bottom, 48px padding left/right
- Sticky on scroll

**Hero Content:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           Strategic vantage for PM leaders                  │
│           ──────────────────────────────────                │
│           (Caption, 14px, Gray 500, uppercase, letter-spacing) │
│                                                             │
│   Stop drowning in task boards.                             │
│   Get the intelligence layer you need.                      │
│   ─────────────────────────────────────                     │
│   (H1, 56px/64px, Gray 900, max-width 800px, center-aligned) │
│                                                             │
│   Vantage analyzes your projects across Monday, Jira, and  │
│   Asana—then tells you what's at risk, why, and what to do │
│   about it. In 30 seconds.                                  │
│   ─────────────────────────────────────────                 │
│   (Body Large, 18px/28px, Gray 700, max-width 700px, center) │
│                                                             │
│                  [Start Free Trial →]                       │
│              (Primary button, 48px height, 32px padding)    │
│                                                             │
│              No credit card required · 14-day trial         │
│              (Caption, 14px, Gray 500)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
- Layout: Center-aligned, vertical stack
- Spacing: 96px padding top, 64px padding bottom
- Max content width: 800px, centered

**Hero Visual:**
Below the CTA, show a **dashboard preview screenshot** with subtle drop shadow:
- Width: 1200px (responsive)
- Border radius: 12px
- Drop shadow: 0px 20px 60px rgba(0, 0, 0, 0.15)
- Screenshot shows: Unified dashboard with 3 projects (Green, Yellow, Red health scores), alerts panel visible

---

### Section 2: Social Proof
**Background:** Gray 100
**Padding:** 48px top/bottom

```
┌─────────────────────────────────────────────────────────────┐
│         Trusted by PM leaders at growing companies          │
│         (Body Regular, 16px, Gray 700, center)              │
│                                                             │
│   [Company Logo] [Company Logo] [Company Logo] [Company Logo]│
│   (Grayscale logos, 120px width, opacity 0.6, spaced 48px)  │
└─────────────────────────────────────────────────────────────┘
```
- If no customers yet, replace with: "Designed by PMs who shipped products at Google, Meta, and Apple"

---

### Section 3: Problem/Solution (Two-Column)
**Background:** White
**Padding:** 96px top/bottom

**Left Column (Problem):**
```
The Problem
(Caption, 12px, uppercase, Red, letter-spacing)

You're managing 8 projects across 
3 different tools. You have no idea 
which one is actually at risk until 
it's too late.

(Body Large, 18px/28px, Gray 900)

→ Deployment frequency dropping? Didn't notice.
→ Timeline slipping? Found out at standup.
→ Blocker for 3 days? No alert.

(Bulleted list, Body Regular, 16px, Gray 700, checkmarks in Red)
```

**Right Column (Solution):**
```
The Vantage Difference
(Caption, 12px, uppercase, Vantage Blue, letter-spacing)

Vantage connects to your tools, 
analyzes project health in real-time, 
and alerts you to risks before they 
become crises.

(Body Large, 18px/28px, Gray 900)

✓ Unified view across Monday, Jira, Asana
✓ AI-powered risk detection (DORA metrics, timelines)
✓ Recommendations in 30 seconds

(Bulleted list, Body Regular, 16px, Gray 700, checkmarks in Success Green)
```

- Layout: 50/50 split, 48px gap between columns
- Max width: 1200px, centered
- Alignment: Left-aligned text

---

### Section 4: How It Works (Three Steps)
**Background:** Gray 100
**Padding:** 96px top/bottom

```
┌─────────────────────────────────────────────────────────────┐
│                    How Vantage Works                         │
│              (H2, 36px, Gray 900, center)                    │
│                                                             │
│   [Step 1 Icon]          [Step 2 Icon]          [Step 3 Icon] │
│   Connect Tools          Analyze Health         Act Fast     │
│   (H3, 24px, Gray 900)   (H3, 24px, Gray 900)   (H3, 24px)   │
│                                                             │
│   OAuth to Monday,       Vantage builds         See alerts,  │
│   Jira, Asana in         unified dashboards     recommendations│
│   5 minutes. No          and surfaces risks     and stakeholder│
│   data migration.        automatically.         messages—     │
│                                                 all in one.   │
│   (Body Regular, 16px, Gray 700, max 280px per column)       │
└─────────────────────────────────────────────────────────────┘
```

- Layout: 3 columns, equal width, 32px gap
- Icons: Simple line icons (64px, Vantage Blue)
  - Step 1: Link/Chain icon
  - Step 2: Dashboard/Chart icon
  - Step 3: Lightning bolt icon
- Center-aligned text, max content width 1200px

---

### Section 5: Key Features (Grid)
**Background:** White
**Padding:** 96px top/bottom

```
┌─────────────────────────────────────────────────────────────┐
│              Intelligence Your Team Actually Uses            │
│              (H2, 36px, Gray 900, center)                    │
│                                                             │
│   ┌──────────────────┐  ┌──────────────────┐              │
│   │ 🎯 DORA Metrics  │  │ 📊 Unified View  │              │
│   │ Intelligence     │  │                  │              │
│   │                  │  │ All projects     │              │
│   │ Track deployment │  │ across Monday,   │              │
│   │ frequency, lead  │  │ Jira, Asana in   │              │
│   │ time, MTTR...    │  │ one dashboard    │              │
│   └──────────────────┘  └──────────────────┘              │
│                                                             │
│   ┌──────────────────┐  ┌──────────────────┐              │
│   │ 🤖 AI-Powered    │  │ 💬 Stakeholder   │              │
│   │ Recommendations  │  │ Messaging        │              │
│   │                  │  │                  │              │
│   │ Get 3-5 options  │  │ Generate persona-│              │
│   │ to address risks,│  │ specific updates │              │
│   │ ranked by impact │  │ in 30 seconds    │              │
│   └──────────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

- Layout: 2×2 grid, 32px gap
- Cards: White background, 1px Gray 300 border, 16px border radius, 32px padding
- Card hover: Lift effect (0px 8px 24px rgba(0, 0, 0, 0.1))
- Icon: 48px, left-aligned, Vantage Blue
- Title: H3, 24px, Gray 900
- Description: Body Regular, 16px, Gray 700

---

### Section 6: Pricing Preview
**Background:** Gray 100
**Padding:** 96px top/bottom

```
┌─────────────────────────────────────────────────────────────┐
│                  Simple, Transparent Pricing                 │
│                  (H2, 36px, Gray 900, center)                │
│                                                             │
│        ┌─────────────┐        ┌─────────────┐              │
│        │   Starter   │        │     Pro     │              │
│        │             │        │             │              │
│        │   $99/mo    │        │   $299/mo   │              │
│        │ (H2, center)│        │ (H2, center)│              │
│        │             │        │             │              │
│        │ • 1-5 PMs   │        │ • 6-20 PMs  │              │
│        │ • 2 tools   │        │ • All tools │              │
│        │ • Basic     │        │ • Advanced  │              │
│        │             │        │   features  │              │
│        │             │        │             │              │
│        │[Start Trial]│        │[Start Trial]│              │
│        └─────────────┘        └─────────────┘              │
│                                                             │
│          Enterprise? Contact us for custom pricing.         │
│          (Caption, 14px, Gray 500, center)                  │
└─────────────────────────────────────────────────────────────┘
```

- Layout: 2 columns, centered
- Cards: White background, 2px border (Pro has Vantage Blue border), 16px border radius, 48px padding
- Spacing: 32px gap between cards
- Buttons: Primary style (see button specs)

---

### Section 7: Final CTA
**Background:** Vantage Blue (#0066FF) gradient to Primary Dark (#0052CC)
**Padding:** 96px top/bottom

```
┌─────────────────────────────────────────────────────────────┐
│            Ready to get strategic vantage?                   │
│            (H2, 36px, White, center)                         │
│                                                             │
│     Start your 14-day free trial. No credit card required.  │
│     (Body Large, 18px, White/90% opacity, center)           │
│                                                             │
│                  [Start Free Trial →]                       │
│              (White button with Vantage Blue text)          │
└─────────────────────────────────────────────────────────────┘
```

- Text: White
- Button: White background, Vantage Blue text, hover → Gray 100 background

---

### Footer
**Background:** Gray 900
**Padding:** 48px top/bottom
**Text:** Gray 500 (links), Gray 300 (copyright)

```
┌─────────────────────────────────────────────────────────────┐
│  Product    Company    Resources    Legal                   │
│  • Features • About    • Blog       • Privacy               │
│  • Pricing  • Careers  • Docs       • Terms                 │
│  • Security • Contact  • Support    • Security              │
│                                                             │
│  © 2026 Vantage. All rights reserved.                       │
└─────────────────────────────────────────────────────────────┘
```

- Layout: 4 columns, left-aligned
- Links: 14px, hover → White

---

## Component Specifications

### Primary Button
- Background: Vantage Blue (#0066FF)
- Text: White, 16px, Weight 600
- Padding: 12px 24px (regular), 16px 32px (large hero)
- Border radius: 8px
- Hover: Primary Dark (#0052CC)
- Active: Slight scale (0.98)
- Transition: 150ms ease-in-out

### Secondary Button (Outlined)
- Background: Transparent
- Text: Vantage Blue, 16px, Weight 600
- Border: 2px solid Vantage Blue
- Padding: 12px 24px
- Border radius: 8px
- Hover: Background Gray 100

### Input Field
- Background: White
- Border: 1px solid Gray 300
- Border radius: 8px
- Padding: 12px 16px
- Font: 16px, Gray 900
- Placeholder: Gray 500
- Focus: Border Vantage Blue (2px), box-shadow

---

## Responsive Breakpoints

### Desktop (1440px+)
- Default layout as specified

### Tablet (768px - 1439px)
- Hero H1: 48px
- Two-column sections → single column stacked
- Feature grid: 2×2 → 1×4 stacked
- Max content width: 720px

### Mobile (< 768px)
- Hero H1: 36px
- All sections: Single column, 24px padding left/right
- Navigation: Hamburger menu
- Feature cards: Full width, 16px padding

---

## Accessibility
- Color contrast: AA compliant (minimum 4.5:1 for body text, 3:1 for large text)
- Focus states: 2px Vantage Blue outline
- Alt text for all images
- Semantic HTML (h1, h2, h3, nav, section, footer)
- Keyboard navigable

---

## Animation & Interaction
- Page load: Fade in hero content (300ms delay)
- Scroll reveal: Features fade up on scroll (stagger 100ms)
- Hover states: 150ms ease-in-out transitions
- Button click: Slight scale animation

---

This spec provides everything needed to build high-fidelity Figma mockups or hand off to a designer for implementation.
