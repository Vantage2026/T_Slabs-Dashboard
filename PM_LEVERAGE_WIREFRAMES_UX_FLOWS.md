# PM Leverage Tool - Wireframes & UX Flows
*Created: 2026-02-07 18:30 UTC*
*Designer: Jeff (Product Director)*
*Status: MVP Wireframes v1.0*

---

## DESIGN PHILOSOPHY

**Core Principles:**
1. **Clarity over cleverness** - PM tools are for getting work done, not showing off design
2. **Speed to value** - Every screen should answer "What do I do next?"
3. **Progressive disclosure** - Show simple by default, reveal complexity on demand
4. **Data-dense but not overwhelming** - PMs need lots of info, but organized
5. **Familiar patterns** - Use conventions from Monday/Jira/Asana so it feels intuitive

**Visual Style:**
- Clean, modern, professional (think Linear, Notion, Superhuman)
- Generous whitespace
- Clear visual hierarchy
- Color-coded alerts (green/yellow/red for health)
- Icons for quick scanning

---

## FLOW 1: ONBOARDING / SETUP

### SCREEN 1.1: WELCOME LANDING
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] PM Leverage                              [Sign Up]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│         The AI PM Assistant That Scales Your Team            │
│                                                               │
│      Strategic intelligence for project leaders who          │
│            manage across Jira, Monday, and Asana             │
│                                                               │
│                   [Get Started Free →]                       │
│                   50 developers included                     │
│                                                               │
│  ✓ Unified dashboard across all tools                       │
│  ✓ AI-powered risk detection                                │
│  ✓ Stakeholder communication assistant                      │
│  ✓ DORA metrics & team health                               │
│                                                               │
│  "Makes 1 PM as effective as 3" - Sarah Chen, PMO Director  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Clear value prop immediately visible
- Social proof (testimonial)
- Free tier size prominent (addresses pricing concern)
- Single CTA (Get Started Free)

---

### SCREEN 1.2: SIGN UP
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] PM Leverage                                  Step 1/4│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                    Create Your Account                        │
│                                                               │
│  Work Email:  [_____________________________]                │
│                                                               │
│  Password:    [_____________________________]                │
│                                                               │
│  [ ] I agree to Terms of Service and Privacy Policy          │
│                                                               │
│                   [Continue →]                               │
│                                                               │
│           or sign up with:                                   │
│                                                               │
│         [Google] [Microsoft] [Slack]                         │
│                                                               │
│  Already have an account? [Log In]                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Progress indicator (Step 1/4) sets expectations
- OAuth options for faster signup
- Minimal fields (just email + password)

---

### SCREEN 1.3: CONNECT TOOLS (Critical Flow)
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] PM Leverage                                  Step 2/4│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              Connect Your Project Management Tools            │
│                                                               │
│  We'll pull data from your existing tools to give you a      │
│  unified view. You can connect more tools later.             │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Jira Icon]  Jira                         [Connect]  │  │
│  │  Sync projects, issues, sprints, and teams            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Monday Icon]  Monday.com                 [Connect]  │  │
│  │  Sync boards, items, and workflows                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Asana Icon]  Asana                       [Connect]  │  │
│  │  Sync projects, tasks, and portfolios                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│             [Skip for now]        [Continue →]               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Clear explanation of what will happen
- Each tool is a card (visual hierarchy)
- Icons + names for quick recognition
- Can skip (doesn't force connection)
- Will trigger OAuth flows when "Connect" clicked

---

### SCREEN 1.4: OAUTH FLOW (Jira Example)
```
┌─────────────────────────────────────────────────────────────┐
│  Atlassian                                          [Close X]│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  PM Leverage wants to access your Jira data                  │
│                                                               │
│  This app will be able to:                                   │
│  ✓ Read projects, issues, and sprints                       │
│  ✓ Read team members and permissions                        │
│  ✓ Read comments and attachments                            │
│                                                               │
│  This app will NOT be able to:                               │
│  ✗ Modify or delete any data                                │
│  ✗ Create new issues or projects                            │
│                                                               │
│  Select Jira workspace:                                      │
│  [Dropdown: yourcompany.atlassian.net ▼]                    │
│                                                               │
│                [Cancel]      [Authorize]                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Standard OAuth modal (Atlassian's UI, not ours)
- Read-only permissions for MVP (de-risks data safety)
- User selects workspace if they have multiple
- After authorization, returns to our app

---

### SCREEN 1.5: CONNECTION SUCCESS
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] PM Leverage                                  Step 2/4│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              Connect Your Project Management Tools            │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Jira Icon]  Jira                    ✓ Connected     │  │
│  │  yourcompany.atlassian.net                            │  │
│  │  [Disconnect]                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Monday Icon]  Monday.com                 [Connect]  │  │
│  │  Sync boards, items, and workflows                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [Asana Icon]  Asana                       [Connect]  │  │
│  │  Sync projects, tasks, and portfolios                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│             [Skip for now]        [Continue →]               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Jira now shows "Connected" with workspace name
- Disconnect option available (can revoke)
- Can continue to connect other tools or proceed

---

### SCREEN 1.6: SYNCING DATA
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] PM Leverage                                  Step 3/4│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                   Setting Up Your Dashboard                   │
│                                                               │
│  We're pulling data from your tools...                       │
│                                                               │
│  [===============================>          ] 75%             │
│                                                               │
│  ✓ Connected to Jira                                         │
│  ✓ Fetched 23 projects                                       │
│  ✓ Analyzed 1,247 issues                                     │
│  ⏳ Calculating team health scores...                        │
│                                                               │
│  This usually takes 30-60 seconds.                           │
│                                                               │
│                 [Loading animation]                           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Progress bar with percentage
- Step-by-step status updates (shows what's happening)
- Time estimate (manages expectations)
- Keeps user engaged during wait

---

### SCREEN 1.7: ONBOARDING COMPLETE
```
┌─────────────────────────────────────────────────────────────┐
│  [LOGO] PM Leverage                                  Step 4/4│
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                   🎉 You're All Set!                         │
│                                                               │
│  Your dashboard is ready with insights from:                 │
│  ✓ 23 projects                                               │
│  ✓ 1,247 issues                                              │
│  ✓ 47 team members                                           │
│                                                               │
│  Here's what you can do now:                                 │
│                                                               │
│  📊 View unified project health across all tools             │
│  🚨 Get AI-powered risk alerts                              │
│  💬 Generate stakeholder updates                            │
│  📈 Track DORA metrics and team performance                 │
│                                                               │
│                 [Go to Dashboard →]                          │
│                                                               │
│  Want a quick tour? [Yes, show me around] [No, I'll explore]│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Celebration moment (emoji, positive messaging)
- Summarizes what was synced
- Lists immediate value available
- Optional tour (doesn't force)
- Clear CTA to dashboard

---

## FLOW 2: UNIFIED DASHBOARD

### SCREEN 2.1: MAIN DASHBOARD
```
┌─────────────────────────────────────────────────────────────┐
│  [☰] PM Leverage    [Search...]        [Alerts: 3] [Avatar] │
├─────────────────────────────────────────────────────────────┤
│  Sidebar                   Main Content Area                 │
│  ┌─────────┐  ┌─────────────────────────────────────────┐  │
│  │ Home    │  │  Portfolio Overview          🔄 Synced 2m│  │
│  │ Projects│  │                                           │  │
│  │ Teams   │  │  ┌─────────┬─────────┬─────────┬────────┐│  │
│  │ Metrics │  │  │ 23      │ 18      │ 3       │ 2      ││  │
│  │ Alerts  │  │  │ Projects│ On Track│ At Risk │ Blocked││  │
│  │ Settings│  │  └─────────┴─────────┴─────────┴────────┘│  │
│  │         │  │                                           │  │
│  │         │  │  Active Projects                          │  │
│  │         │  │  ┌────────────────────────────────────┐  │  │
│  │         │  │  │ 🟢 Web App Redesign        Jira   │  │  │
│  │         │  │  │ Health: 87/100 | On Track          │  │  │
│  │         │  │  │ Sprint 12 | 15 issues | 8 devs     │  │  │
│  │         │  │  │ Next: Deploy to staging (2 days)   │  │  │
│  │         │  │  └────────────────────────────────────┘  │  │
│  │         │  │                                           │  │
│  │         │  │  ┌────────────────────────────────────┐  │  │
│  │         │  │  │ 🟡 Mobile App Launch      Monday   │  │  │
│  │         │  │  │ Health: 64/100 | At Risk           │  │  │
│  │         │  │  │ 23 tasks | 5 team members          │  │  │
│  │         │  │  │ ⚠️ Behind schedule by 1 week       │  │  │
│  │         │  │  └────────────────────────────────────┘  │  │
│  │         │  │                                           │  │
│  │         │  │  ┌────────────────────────────────────┐  │  │
│  │         │  │  │ 🔴 API Migration           Jira    │  │  │
│  │         │  │  │ Health: 42/100 | Blocked           │  │  │
│  │         │  │  │ Sprint 8 | 31 issues | 12 devs     │  │  │
│  │         │  │  │ 🚨 3 critical blockers detected    │  │  │
│  │         │  │  └────────────────────────────────────┘  │  │
│  │         │  │                                           │  │
│  │         │  │  [View All Projects →]                    │  │
│  └─────────┘  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- **Top bar:** Logo, search, alerts bell (with count), user avatar
- **Sidebar:** Main navigation (collapsible with hamburger)
- **Main content:** Portfolio overview at top (high-level stats)
- **Project cards:** Color-coded health (green/yellow/red)
- **Data from multiple tools:** Each card shows source (Jira/Monday/Asana icon)
- **Unified view:** All projects together, regardless of source tool
- **Quick scan:** Health score prominent, key metrics visible
- **Last synced:** Shows data freshness (builds trust)

**Key Design Decisions:**
1. **Unified, not siloed:** Don't show "Jira projects" vs "Monday projects" separately - that defeats the purpose
2. **Health score front and center:** 0-100 number everyone understands
3. **Color coding:** Green (>80), Yellow (50-79), Red (<50) - consistent across app
4. **Next action visible:** "Next: Deploy to staging" gives context
5. **Alerts inline:** "⚠️ Behind schedule" shows immediately, no need to click

---

### SCREEN 2.2: PROJECT DETAIL VIEW
```
┌─────────────────────────────────────────────────────────────┐
│  [☰] PM Leverage    [Search...]        [Alerts: 3] [Avatar] │
├─────────────────────────────────────────────────────────────┤
│  [< Back to Projects]                                        │
│                                                               │
│  Mobile App Launch                            [Monday Icon]  │
│  Health: 64/100 🟡 At Risk                                   │
│                                                               │
│  ┌─────────────┬─────────────┬─────────────┬──────────────┐ │
│  │ Progress    │ Team        │ Timeline    │ Blockers     │ │
│  │ 67% (23/34) │ 5 members   │ 2 weeks late│ 1 critical   │ │
│  └─────────────┴─────────────┴─────────────┴──────────────┘ │
│                                                               │
│  🚨 Active Alerts (2)                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⚠️ Timeline Risk Detected                   [Details →]│ │
│  │ Project is trending 2 weeks behind schedule             │ │
│  │ AI Recommendation: Rescope or add 1-2 team members     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🔴 Critical Blocker                         [Details →]│ │
│  │ Task "API Integration" blocked for 5 days               │ │
│  │ AI Recommendation: Escalate to backend team lead        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  📊 Team Health                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Velocity:        18 pts/sprint    ↓ 15% vs last sprint │ │
│  │ PR Cycle Time:   2.3 days         ↑ 30% (warning)      │ │
│  │ Code Reviews:    Avg 1.2 reviewers ↓ (need 2+)        │ │
│  │ Deployment Freq: 3x/week          → (stable)           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Recent Activity                     [View in Monday.com →] │
│  • Sarah updated "User Auth Flow" 2h ago                    │
│  • Mike completed "Payment Integration" 5h ago              │
│  • 3 new tasks added by Product team 1d ago                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Breadcrumb navigation (Back to Projects)
- Project name + health prominently displayed
- Key metrics in cards at top (quick scan)
- Alerts section prominent (this is where value is)
- Team health metrics with trend indicators (↑↓→)
- Link to original tool (Monday.com) if user needs to take action there
- Recent activity shows what's happening (context)

**Key Design Decisions:**
1. **Alerts are the hero:** They're what differentiates us, so they get prime real estate
2. **AI recommendations inline:** Don't hide the value - show what to do
3. **Trend indicators:** Up/down arrows quickly communicate change
4. **Link back to source tool:** We don't replace Monday/Jira, we complement them
5. **Metrics balance:** Show enough to be useful, not so much it's overwhelming

---

## FLOW 3: RECOMMENDATIONS SYSTEM

### SCREEN 3.1: ALERT DETAILS (Modal)
```
┌─────────────────────────────────────────────────────────────┐
│                     Timeline Risk Detected              [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Project: Mobile App Launch                                  │
│  Severity: ⚠️ Medium | Detected: 2 hours ago                │
│                                                               │
│  📊 What We Found:                                           │
│  • Project is trending 2 weeks behind original deadline      │
│  • Velocity has dropped 15% in last sprint                   │
│  • 8 tasks still in "In Progress" longer than 5 days         │
│  • Team capacity at 110% (overallocated)                     │
│                                                               │
│  🤖 AI Recommendation:                                       │
│                                                               │
│  Option 1: Rescope (Remove 5-7 non-critical features)       │
│  ├─ Impact: Back on track by next sprint                    │
│  ├─ Risk: Product team may resist                           │
│  └─ Confidence: High (85%)                                   │
│                                                               │
│  Option 2: Add Team Capacity (1-2 developers for 3 weeks)   │
│  ├─ Impact: Can maintain scope and timeline                 │
│  ├─ Risk: Ramp-up time, increased cost                      │
│  └─ Confidence: Medium (70%)                                 │
│                                                               │
│  Option 3: Extend Deadline (Push launch date by 2 weeks)    │
│  ├─ Impact: Team can complete at current pace               │
│  ├─ Risk: Market window, stakeholder expectations           │
│  └─ Confidence: High (90%)                                   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 💬 Generate Stakeholder Update                          │ │
│  │ Create a message to inform leadership about this issue  │ │
│  │                                                          │ │
│  │ [Choose Audience: Senior Leadership ▼]                  │ │
│  │                                                          │ │
│  │ [Generate Message →]                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Dismiss Alert]      [Mark as Resolved]      [Take Action] │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Modal overlay (focused experience)
- Clear severity and timing
- "What We Found" explains the problem in bullet points
- AI gives 3 options (not prescriptive - PM decides)
- Each option shows: Impact, Risk, Confidence score
- Integrated stakeholder communication (bridges to Flow 4)
- Multiple action options (dismiss, resolve, take action)

**Key Design Decisions:**
1. **Multiple options, not one recommendation:** PMs need agency, not orders
2. **Transparency:** Show confidence scores, explain reasoning
3. **Integrated workflow:** Don't make PM go to a different screen to communicate
4. **Actionable:** Clear next steps, not just information
5. **Modal, not inline:** Keeps user focused on decision

---

### SCREEN 3.2: RECOMMENDATION SIDEBAR (Alternative Design)
```
┌─────────────────────────────────────────────────────────────┐
│  [☰] PM Leverage    [Search...]        [Alerts: 3] [Avatar] │
├─────────────────────────────────────────────────────────────┤
│  Main Dashboard                │  Recommendations (3) [>]    │
│  ┌────────────────────────────┐│  ┌──────────────────────┐ │
│  │  Portfolio Overview        ││  │ ⚠️ Timeline Risk     │ │
│  │                            ││  │ Mobile App Launch    │ │
│  │  Projects: 23              ││  │ Detected 2h ago      │ │
│  │  On Track: 18              ││  │ [View Details]       │ │
│  │  At Risk: 3                ││  └──────────────────────┘ │
│  │  Blocked: 2                ││                            │
│  │                            ││  ┌──────────────────────┐ │
│  │  [Project Cards Below...]  ││  │ 🔴 Critical Blocker  │ │
│  │                            ││  │ API Migration        │ │
│  │                            ││  │ Detected 1d ago      │ │
│  │                            ││  │ [View Details]       │ │
│  └────────────────────────────┘│  └──────────────────────┘ │
│                                 │                            │
│                                 │  ┌──────────────────────┐ │
│                                 │  │ 💡 Optimization      │ │
│                                 │  │ Web Redesign         │ │
│                                 │  │ Detected 3h ago      │ │
│                                 │  │ [View Details]       │ │
│                                 │  └──────────────────────┘ │
│                                 │                            │
│                                 │  [View All Alerts →]       │
│                                 │                            │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Persistent sidebar (always visible)
- Collapsible with [>] button (can hide for more space)
- Shows count (3 recommendations)
- Categorized by severity (⚠️🔴💡)
- Quick preview cards
- Click to see full details in modal

**Key Design Decisions:**
1. **Sidebar vs modal:** Sidebar = always visible, modal = focused action
2. **Recommendation:** Use modal for detailed view (Screen 3.1), sidebar for quick access
3. **Count badge:** Shows how many alerts need attention
4. **Collapsible:** Power users can hide if they want more dashboard space

---

## FLOW 4: STAKEHOLDER PERSONA MESSAGING

### SCREEN 4.1: GENERATE MESSAGE (Modal)
```
┌─────────────────────────────────────────────────────────────┐
│             Generate Stakeholder Update                 [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  What do you want to communicate?                            │
│                                                               │
│  Selected Issue:                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⚠️ Timeline Risk - Mobile App Launch (2 weeks behind)  │ │
│  │ [Change Selection]                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Who is your audience?                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [ ] Engineering Team (Technical details, code-focused) │ │
│  │ [✓] Senior Leadership (High-level, business impact)    │ │
│  │ [ ] Commercial/Sales (Customer impact, timeline)       │ │
│  │ [ ] Finance Team (Budget, resource allocation)         │ │
│  │ [ ] Product Team (Feature prioritization)              │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  Tone:  [●] Professional   [ ] Casual   [ ] Urgent          │
│                                                               │
│  Include:                                                    │
│  [✓] Current status    [✓] Options to resolve               │
│  [✓] Impact analysis   [ ] Detailed metrics                 │
│                                                               │
│                     [Generate Message →]                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Context shown at top (what issue we're communicating about)
- Persona selection with descriptions (what each cares about)
- Tone selector (professional/casual/urgent)
- Checkboxes for what to include (customization)
- Single action button

**Key Design Decisions:**
1. **Persona descriptions:** Help PM choose right audience
2. **Multiple selections allowed:** Can generate for multiple audiences
3. **Tone selector:** One message to CEO vs dev team should feel different
4. **Include/exclude options:** PM controls what information goes out
5. **Context-aware:** Pre-filled based on alert clicked

---

### SCREEN 4.2: MESSAGE PREVIEW & EDIT
```
┌─────────────────────────────────────────────────────────────┐
│             Generated Message for Senior Leadership     [X]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Preview:                                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Subject: Mobile App Launch - Timeline Update           │ │
│  │                                                          │ │
│  │ Hi [Name],                                              │ │
│  │                                                          │ │
│  │ I wanted to give you a quick update on the Mobile App  │ │
│  │ Launch project.                                         │ │
│  │                                                          │ │
│  │ Current Status:                                         │ │
│  │ • The project is currently tracking 2 weeks behind our │ │
│  │   original timeline                                     │ │
│  │ • Team velocity has decreased 15% in the recent sprint │ │
│  │ • Several tasks are taking longer than anticipated     │ │
│  │                                                          │ │
│  │ Business Impact:                                        │ │
│  │ • If unaddressed, we'll miss our Q1 launch target      │ │
│  │ • This could affect our go-to-market strategy          │ │
│  │                                                          │ │
│  │ Options to Get Back on Track:                          │ │
│  │ 1. Rescope: Remove 5-7 non-critical features           │ │
│  │ 2. Add capacity: Bring in 1-2 developers temporarily   │ │
│  │ 3. Extend timeline: Push launch by 2 weeks             │ │
│  │                                                          │ │
│  │ I recommend Option 1 (rescoping) to maintain our       │ │
│  │ timeline while managing team capacity. Happy to        │ │
│  │ discuss in more detail.                                │ │
│  │                                                          │ │
│  │ Best,                                                   │ │
│  │ [Your Name]                                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  [Edit Message] (Opens text editor)                         │
│                                                               │
│  Actions:                                                    │
│  [Copy to Clipboard]  [Send via Email]  [Export to Slack]   │
│                                                               │
│  Generate for different audience:                            │
│  [Engineering Team]  [Commercial Team]  [Finance Team]       │
│                                                               │
│  [← Back]                              [Mark as Sent]        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Message displayed in readable format (preview mode)
- Edit button available (gives PM control)
- Multiple export options (copy, email, Slack)
- Can generate alternate versions for different audiences
- "Mark as Sent" tracks that communication happened

**Key Design Decisions:**
1. **Preview first:** Let PM review before using
2. **Edit option:** AI is helpful but PM has final say
3. **Multiple export methods:** Different orgs use different tools
4. **Alternate versions:** Easy to generate for other stakeholders
5. **Track communication:** "Mark as Sent" helps with accountability

---

### SCREEN 4.3: STAKEHOLDER MESSAGING STANDALONE (Alternative Access)
```
┌─────────────────────────────────────────────────────────────┐
│  [☰] PM Leverage    [Search...]        [Alerts: 3] [Avatar] │
├─────────────────────────────────────────────────────────────┤
│  Sidebar                   Main Content Area                 │
│  ┌─────────┐  ┌─────────────────────────────────────────┐  │
│  │ Home    │  │  💬 Stakeholder Communication              │  │
│  │ Projects│  │                                           │  │
│  │ Teams   │  │  Generate updates for any project issue   │  │
│  │ Metrics │  │                                           │  │
│  │ Alerts  │  │  1. Select Project or Issue               │  │
│  │ Settings│  │  ┌──────────────────────────────────────┐│  │
│  │ ───     │  │  │ [Search projects and issues...]      ││  │
│  │ 💬 Comms│←─  │  └──────────────────────────────────────┘│  │
│  └─────────┘  │                                           │  │
│               │  Recent Updates:                          │  │
│               │  ┌──────────────────────────────────────┐ │  │
│               │  │ Senior Leadership                    │ │  │
│               │  │ "Mobile App Launch - Timeline Update"│ │  │
│               │  │ Sent 2 hours ago to: CEO, CTO        │ │  │
│               │  │ [View] [Edit] [Resend]               │ │  │
│               │  └──────────────────────────────────────┘ │  │
│               │                                           │  │
│               │  ┌──────────────────────────────────────┐ │  │
│               │  │ Engineering Team                     │ │  │
│               │  │ "API Migration - Blocker Update"     │ │  │
│               │  │ Sent 1 day ago                       │ │  │
│               │  │ [View] [Edit] [Resend]               │ │  │
│               │  └──────────────────────────────────────┘ │  │
│               │                                           │  │
│               │  Templates:                               │  │
│               │  • Weekly status update (all stakeholders)│  │
│               │  • Risk/blocker escalation                │  │
│               │  • Project milestone celebration          │  │
│               │  • Budget/resource request                │  │
│               │                                           │  │
│               └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**UX Notes:**
- Dedicated "Communications" section in sidebar
- Can access anytime (not just from alerts)
- Search for any project/issue to communicate about
- History of past communications
- Pre-built templates for common scenarios

**Key Design Decisions:**
1. **Standalone section:** Not just tied to alerts - PM can proactively communicate
2. **History tracking:** Shows what was sent, to whom, when
3. **Templates:** Common scenarios pre-built (saves time)
4. **Resend option:** Can send same update to additional people
5. **Integration point:** This is where value accumulates over time

---

## TECHNICAL FEASIBILITY NOTES (For Emmy)

### OAuth Integrations
**What we need:**
- Jira OAuth 2.0 (Atlassian Connect)
- Monday.com OAuth (v2 API)
- Asana OAuth (v1 API)

**Considerations:**
- Each has different scopes/permissions
- Need to store refresh tokens securely
- Handle token expiration gracefully
- User can revoke access anytime (need to detect and prompt reconnection)

**MVP Constraints:**
- Read-only access only (de-risks data safety)
- Webhook support for real-time updates (or polling every 15 min)
- Rate limiting (each API has different limits)

---

### Data Synchronization
**Challenge:** Unifying data from 3 different tools with different data models

**Approach:**
1. **Normalize on ingestion:** Map Jira issues, Monday items, Asana tasks → unified "Work Item" model
2. **Common fields:** Title, status, assignee, due date, priority
3. **Tool-specific fields:** Store in metadata JSON (don't force uniform schema)
4. **Health scoring:** Need algorithm that works across all 3 tools

**Open Questions for Emmy:**
- Real-time sync or batch (every 15 min)?
- How to handle conflicts (user changes data in Jira while we're syncing)?
- Storage: Do we cache all data or just metadata?

---

### AI Recommendations Engine
**Challenge:** Generating smart, actionable recommendations

**MVP Approach:**
1. **Rule-based heuristics first:**
   - Behind schedule = compare actual vs planned dates
   - Velocity drop = compare last 3 sprints
   - Blockers = tasks in "blocked" status >3 days
2. **GPT-4 for option generation:**
   - Given problem context, ask GPT-4 to suggest 2-3 options
   - Include impact/risk/confidence scoring
3. **Learning over time:**
   - Track which recommendations PM accepts/dismisses
   - Refine scoring based on outcomes

**Open Questions for Emmy:**
- Do we need ML model or can GPT-4 API do this?
- How to handle cost (GPT-4 is expensive per call)?
- Caching strategy for similar problems?

---

### Stakeholder Persona System
**Challenge:** Generating messages tailored to different audiences

**MVP Approach (Option A - Simpler):**
- Predefined personas (5-7 archetypes):
  - Senior Leadership (CEO, CTO, VP)
  - Engineering Team (developers, tech leads)
  - Commercial Team (sales, customer success)
  - Product Team (product managers, designers)
  - Finance Team (CFO, controllers)
- Each persona has:
  - Template structure
  - Preferred level of detail
  - Key concerns/priorities
  - Tone/formality level

**GPT-4 Prompt Engineering:**
```
You are writing a project update for [PERSONA].
Context: [ISSUE DETAILS]
Style: [PERSONA PREFERENCES]
Include: [SELECTED SECTIONS]
Generate a professional update that addresses their concerns.
```

**Advanced Features (Phase 2):**
- Customizable personas (user-defined)
- Learning from PM edits (what did they change?)
- Multi-stakeholder messages (one message, multiple audiences)

**Open Questions for Emmy:**
- Store persona definitions in database or code?
- How to version control persona templates?
- Cost management for GPT-4 calls?

---

## INTERACTION PATTERNS

### Loading States
**When data is syncing:**
- Show skeleton screens (gray boxes where content will appear)
- Progress indicators with percentage
- "Last synced X minutes ago" timestamp
- Error states if sync fails (with retry button)

### Empty States
**When user has no data:**
- Onboarding: "Connect your first tool to get started"
- No alerts: "🎉 All projects healthy! No alerts right now."
- No projects: "No active projects. Create one in [Jira/Monday/Asana]"

### Error Handling
**When something goes wrong:**
- Clear error message (avoid technical jargon)
- Suggested action ("Try reconnecting your Jira account")
- Support link if user is stuck
- Don't block entire app if one integration fails

### Mobile Responsiveness
**Not MVP, but design for it:**
- Stack cards vertically on mobile
- Hamburger menu for sidebar
- Simplified dashboard (fewer metrics visible)
- Swipe gestures for actions

---

## COMPONENT LIBRARY (For Consistency)

### Colors
- **Primary:** #0066CC (blue - trust, professional)
- **Success/Green:** #00A86B (healthy projects)
- **Warning/Yellow:** #FFA500 (at-risk projects)
- **Danger/Red:** #E63946 (critical issues)
- **Neutral/Gray:** #6B7280 (secondary text)
- **Background:** #F9FAFB (off-white, easy on eyes)

### Typography
- **Headlines:** Inter Bold, 24-32px
- **Body:** Inter Regular, 14-16px
- **Captions:** Inter Regular, 12px
- **Code/Data:** JetBrains Mono, 14px (for metrics)

### Spacing
- **Base unit:** 8px (all spacing is multiples of 8)
- **Card padding:** 16px
- **Section margin:** 24px
- **Page padding:** 32px

### Icons
- **Library:** Heroicons or Lucide (consistent, modern)
- **Size:** 20px default, 24px for important actions
- **Style:** Outline for secondary, filled for primary

---

## ACCESSIBILITY CONSIDERATIONS

### WCAG 2.1 AA Compliance
- Color contrast ratio 4.5:1 minimum (text on background)
- All interactive elements keyboard accessible (tab navigation)
- Screen reader support (ARIA labels)
- Focus indicators visible (blue outline on focused elements)

### Specific Patterns:
- **Alerts:** Use icons + color (don't rely on color alone)
- **Forms:** Clear labels, error messages
- **Modals:** Trap focus, ESC to close
- **Charts:** Provide data table alternative

---

## NEXT STEPS & OPEN QUESTIONS

### For Emmy (Technical):
1. **OAuth feasibility:** Can we do all 3 integrations in MVP? Or start with 1-2?
2. **Sync frequency:** Real-time webhooks or 15-min polling?
3. **Data storage:** How much Jira/Monday/Asana data do we cache?
4. **Cost estimate:** GPT-4 API calls for recommendations + messaging (per user/month)?
5. **Tech stack:** What framework for frontend? (Next.js? React? Vue?)

### For CEO:
1. **Scope confirmation:** Are these 4 flows the complete MVP or is there more?
2. **Priority:** If we had to cut one flow for faster launch, which?
3. **Branding:** Company name (Vantage?) affects logo, colors, domain
4. **Analytics:** What metrics do you want to track (usage, adoption, churn)?

### For Me (Jeff):
1. **High-fidelity mockups:** Should I create Figma designs or are low-fi wireframes sufficient?
2. **User testing:** Should we test these flows with beta PMs before building?
3. **Design system:** Do we need a full component library or can we use a framework (Material UI, Chakra)?
4. **Prototype:** Should I build an interactive Lovable prototype to demo flow?

---

## SUMMARY

**What I've Delivered:**
✅ Complete onboarding flow (7 screens)
✅ Unified dashboard design (main view + detail view)
✅ Recommendations system (modal + sidebar options)
✅ Stakeholder messaging flow (3 screens + standalone access)
✅ Technical feasibility notes for Emmy
✅ Interaction patterns and accessibility
✅ Component library foundations

**Key UX Principles Applied:**
1. **Unified, not siloed:** All projects together regardless of source tool
2. **Alerts are the hero:** Recommendations get prime real estate
3. **Progressive disclosure:** Simple by default, complexity on demand
4. **PM has agency:** Multiple options, not prescriptive
5. **Integrated workflow:** Don't make PM context-switch between features

**Design Confidence:** 8/10
- **Strong:** Clear user flows, familiar patterns, focused on PM needs
- **Needs validation:** Actual PM user testing, Emmy's technical constraints

**Estimated Development Time (Emmy's input needed):**
- Onboarding + OAuth: 2-3 weeks
- Dashboard + data unification: 3-4 weeks
- Recommendations engine: 2-3 weeks
- Stakeholder messaging: 2 weeks
- **Total: 9-12 weeks** (matches CEO's 12-week MVP timeline)

**Ready for:**
- Emmy's technical review
- CEO approval on UX direction
- High-fidelity mockups (if needed)
- Interactive prototype (if needed)

---

**Jeff (Product Director)**  
*2026-02-07 18:30 UTC*
