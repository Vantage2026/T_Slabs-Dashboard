# Screen Spec: Onboarding Steps 3-4
## /onboarding/team & /onboarding/workspace

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

Onboarding Steps 3-4 complete the new user setup flow. After account creation (Step 1) and connecting tools (Step 2), users invite their team (Step 3) and configure their workspace (Step 4).

**Core Value:** A well-designed onboarding flow reduces time-to-value. Users who invite teammates and configure their workspace are significantly more likely to become active users.

---

## 2. Onboarding Flow Overview

```
Step 1: Sign Up          → Account creation (exists)
Step 2: Connect Tools    → Jira/Monday/Asana integration (exists)
Step 3: Invite Team      → Invite teammates via email (THIS SPEC)
Step 4: Configure        → Workspace preferences (THIS SPEC)
        ↓
    Command Center       → User lands in product
```

---

## 3. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| O-1 | New user | Invite my teammates during setup | We can collaborate from day one |
| O-2 | New user | Skip invites if I want to explore first | I'm not forced through unnecessary steps |
| O-3 | New user | Set my organization name | The workspace is properly branded |
| O-4 | New user | Configure basic preferences | The app works the way I expect |
| O-5 | New user | See my progress through onboarding | I know how much is left |
| O-6 | New user | Go back to previous steps | I can change my earlier choices |

---

## 4. Step 3: Invite Team

### 4.1 Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         [Vantage Logo]                                   │   │
│  │                                                                          │   │
│  │           ●────────●────────●────────○                                  │   │
│  │        Account   Tools    Team    Setup                                 │   │
│  │                                                                          │   │
│  │  ═══════════════════════════════════════════════════════════════════   │   │
│  │                                                                          │   │
│  │                      👥 Invite Your Team                                │   │
│  │                                                                          │   │
│  │           Vantage works best when your whole team is                    │   │
│  │           connected. Invite teammates to collaborate.                   │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  Enter email addresses (one per line or comma-separated)                 │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ sarah@company.com                                                │   │   │
│  │  │ mike@company.com                                                 │   │   │
│  │  │ lisa@company.com                                                 │   │   │
│  │  │                                                                  │   │   │
│  │  │                                                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  Or import from:                                                         │   │
│  │  [📋 Paste from spreadsheet]  [Import from connected tools]             │   │
│  │  ℹ️ Import buttons shown dynamically based on tools connected in Step 2  │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  PREVIEW (3 invites)                                                     │   │
│  │                                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │   │
│  │  │ sarah@company.com                                          [✗]  │   │   │
│  │  │ mike@company.com                                           [✗]  │   │   │
│  │  │ lisa@company.com                                           [✗]  │   │   │
│  │  └─────────────────────────────────────────────────────────────────┘   │   │
│  │                                                                          │   │
│  │  Role for all invites:                                                   │   │
│  │  [Member ▼]                                                              │   │
│  │                                                                          │   │
│  │  💡 Tip: You can always invite more people later from Team settings.    │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │           [← Back]           [Skip for now]    [Send Invites →]         │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Breakdown

**Progress Indicator:**
```tsx
<div className="flex items-center justify-center gap-2 mb-8">
  {steps.map((step, index) => (
    <React.Fragment key={step.id}>
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
        ${index < currentStep ? 'bg-success-500 text-white' : ''}
        ${index === currentStep ? 'bg-primary-500 text-white' : ''}
        ${index > currentStep ? 'bg-neutral-200 text-neutral-500' : ''}
      `}>
        {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
      </div>
      {index < steps.length - 1 && (
        <div className={`w-12 h-0.5 ${index < currentStep ? 'bg-success-500' : 'bg-neutral-200'}`} />
      )}
    </React.Fragment>
  ))}
</div>
```

**Step Labels:**
1. Account (completed)
2. Tools (completed)
3. Team (current)
4. Setup (upcoming)

**Email Input Textarea:**
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-neutral-700">
    Enter email addresses (one per line or comma-separated)
  </label>
  <textarea
    className="w-full h-32 px-4 py-3 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
    placeholder="name@company.com&#10;another@company.com"
    value={emailText}
    onChange={handleEmailInput}
  />
</div>
```

**Import Buttons:**
```tsx
<div className="flex gap-3">
  <Button variant="secondary" size="sm" icon={<ClipboardList />} onClick={pasteFromClipboard}>
    Paste from spreadsheet
  </Button>
  {hasJiraConnected && (
    <Button variant="secondary" size="sm" icon={<JiraIcon />} onClick={importFromJira}>
      Import from Jira
    </Button>
  )}
  <Button variant="secondary" size="sm" icon={<Slack />} onClick={importFromSlack}>
    Import from Slack
  </Button>
</div>
```

**Email Preview List:**
```tsx
<div className="mt-6">
  <h4 className="text-sm font-medium text-neutral-700 mb-2">
    Preview ({validEmails.length} invites)
  </h4>
  <div className="border border-neutral-100 rounded-lg divide-y divide-neutral-100">
    {validEmails.map((email) => (
      <div key={email} className="flex items-center justify-between px-4 py-2">
        <span className="text-sm text-neutral-700">{email}</span>
        <button
          onClick={() => removeEmail(email)}
          className="p-1 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ))}
  </div>
</div>
```

**Invalid Email Warning:**
```tsx
{invalidEmails.length > 0 && (
  <Alert variant="warning" className="mt-3">
    <AlertTriangle className="w-4 h-4" />
    {invalidEmails.length} invalid email(s) will be skipped: {invalidEmails.join(', ')}
  </Alert>
)}
```

**Role Selector:**
```tsx
<div className="mt-4">
  <label className="text-sm font-medium text-neutral-700">Role for all invites:</label>
  <Select
    value={role}
    onChange={setRole}
    options={[
      { value: 'admin', label: 'Admin - Full access including settings and members' },
      { value: 'member', label: 'Member - Full access to projects and reports' },
      { value: 'viewer', label: 'Viewer - Read-only access' },
      // Note: 'owner' role is auto-assigned to workspace creator, not selectable here
    ]}
    className="mt-1 w-64"
  />
</div>
```

**Navigation Buttons:**
```tsx
<div className="flex items-center justify-between mt-8">
  <Button variant="ghost" onClick={goBack}>
    <ArrowLeft className="w-4 h-4 mr-2" />
    Back
  </Button>
  <div className="flex gap-3">
    <Button variant="ghost" onClick={skipStep}>
      Skip for now
    </Button>
    <Button 
      variant="primary" 
      onClick={sendInvites}
      disabled={validEmails.length === 0}
    >
      Send {validEmails.length > 0 ? `${validEmails.length} ` : ''}Invites
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  </div>
</div>
```

### 4.3 Import from Jira Flow

When user clicks "Import from Jira":

```
┌─────────────────────────────────────────────────────────────────┐
│ Import from Jira                                         [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Select users to invite from your Jira workspace:                │
│                                                                 │
│ [Search users...]                                               │
│                                                                 │
│ ☑ Select all (24 users)                                        │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ☑ Sarah Chen           sarah.chen@company.com              │ │
│ │ ☑ Mike Johnson         mike.johnson@company.com            │ │
│ │ ☑ Lisa Park            lisa.park@company.com               │ │
│ │ ☐ Jake Martinez        jake.martinez@company.com (you)     │ │
│ │ ☑ Tom Wilson           tom.wilson@company.com              │ │
│ │ ...                                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 23 users selected                                               │
│                                                                 │
│                                     [Cancel] [Add Selected]     │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Invite Sent Confirmation

After clicking "Send Invites":

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                           ✓                                     │
│                                                                 │
│                 Invitations Sent!                               │
│                                                                 │
│        3 teammates will receive an email invitation            │
│        to join your Vantage workspace.                          │
│                                                                 │
│                                                                 │
│                    [Continue to Setup →]                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Auto-advances to Step 4 after 2 seconds or on button click.

---

## 5. Step 4: Workspace Configuration

### 5.1 Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         [Vantage Logo]                                   │   │
│  │                                                                          │   │
│  │           ●────────●────────●────────●                                  │   │
│  │        Account   Tools    Team    Setup                                 │   │
│  │                                                                          │   │
│  │  ═══════════════════════════════════════════════════════════════════   │   │
│  │                                                                          │   │
│  │                      ⚙️ Configure Your Workspace                        │   │
│  │                                                                          │   │
│  │           Just a few more settings to get you started.                  │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  ORGANIZATION                                                            │   │
│  │                                                                          │   │
│  │  Organization name                                                       │   │
│  │  [Acme Corp                                                       ]     │   │
│  │  This appears in reports and invitations.                               │   │
│  │                                                                          │   │
│  │  Workspace URL                                                           │   │
│  │  vantage.io / [acme-corp                                          ]     │   │
│  │  ✓ Available                                                            │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  PREFERENCES                                                             │   │
│  │                                                                          │   │
│  │  Default timezone                                                        │   │
│  │  [America/New_York (EST)                                        ▼]      │   │
│  │  Used for reports and scheduled notifications.                          │   │
│  │                                                                          │   │
│  │  Work week                                                               │   │
│  │  [Mon] [Tue] [Wed] [Thu] [Fri] [Sat] [Sun]                             │   │
│  │   ●     ●     ●     ●     ●     ○     ○                                │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  SYNC SETTINGS                                                           │   │
│  │                                                                          │   │
│  │  How often should Vantage sync with your tools?                         │   │
│  │                                                                          │   │
│  │  ○ Every 5 minutes                        Recommended                   │   │
│  │  ○ Every 15 minutes                                                     │   │
│  │  ○ Hourly (every 60 minutes)                                            │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │  APPEARANCE                                                              │   │
│  │                                                                          │   │
│  │  Theme                                                                   │   │
│  │  [☀️ Light] [🌙 Dark] [💻 System]                                       │   │
│  │                                                                          │   │
│  │  ─────────────────────────────────────────────────────────────────────  │   │
│  │                                                                          │   │
│  │           [← Back]                              [Launch Vantage →]      │   │
│  │                                                                          │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Component Breakdown

**Organization Name:**
```tsx
<FormField label="Organization name" required>
  <Input
    value={orgName}
    onChange={setOrgName}
    placeholder="Your company name"
    maxLength={100}
  />
  <FormHelper>This appears in reports and invitations.</FormHelper>
</FormField>
```

**Workspace URL:**
```tsx
<FormField label="Workspace URL">
  <div className="flex items-center">
    <span className="px-3 py-2 text-sm text-neutral-500 bg-neutral-50 border border-r-0 border-neutral-200 rounded-l-lg">
      vantage.io/
    </span>
    <Input
      value={workspaceSlug}
      onChange={handleSlugChange}
      className="rounded-l-none"
      placeholder="your-company"
    />
  </div>
  {slugStatus === 'available' && (
    <span className="text-sm text-success-600 flex items-center gap-1 mt-1">
      <Check className="w-4 h-4" /> Available
    </span>
  )}
  {slugStatus === 'taken' && (
    <span className="text-sm text-danger-600 flex items-center gap-1 mt-1">
      <X className="w-4 h-4" /> Already taken
    </span>
  )}
  {slugStatus === 'checking' && (
    <span className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
      <Spinner className="w-4 h-4" /> Checking...
    </span>
  )}
</FormField>
```

**Work Week Selector:**
```tsx
<FormField label="Work week">
  <div className="flex gap-2">
    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
      <button
        key={day}
        onClick={() => toggleDay(index)}
        className={`
          w-12 h-10 rounded-lg text-sm font-medium transition-colors
          ${workDays.includes(index)
            ? 'bg-primary-500 text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }
        `}
      >
        {day}
      </button>
    ))}
  </div>
</FormField>
```

**Sync Frequency:**
```tsx
<FormField label="How often should Vantage sync with your tools?">
  <div className="space-y-3">
    {[
      { value: 'frequent', label: 'Every 5 minutes', badge: 'Recommended' },
      { value: 'standard', label: 'Every 15 minutes' },
      { value: 'hourly', label: 'Hourly (every 60 minutes)' },
      // Note: Webhook-based real-time sync added in V2 once webhook infra is built
    ].map((option) => (
      <label
        key={option.value}
        className={`
          flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
          ${syncFrequency === option.value
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-200 hover:border-neutral-300'
          }
        `}
      >
        <input
          type="radio"
          name="syncFrequency"
          value={option.value}
          checked={syncFrequency === option.value}
          onChange={(e) => setSyncFrequency(e.target.value)}
          className="text-primary-500"
        />
        <span className="text-sm text-neutral-700">{option.label}</span>
        {option.badge && (
          <Badge variant="primary" size="sm">{option.badge}</Badge>
        )}
      </label>
    ))}
  </div>
</FormField>
```

**Theme Selector:**
```tsx
<FormField label="Theme">
  <div className="flex gap-2">
    {[
      { value: 'light', icon: <Sun />, label: 'Light' },
      { value: 'dark', icon: <Moon />, label: 'Dark' },
      { value: 'system', icon: <Monitor />, label: 'System' },
    ].map((option) => (
      <button
        key={option.value}
        onClick={() => setTheme(option.value)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${theme === option.value
            ? 'bg-primary-500 text-white'
            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }
        `}
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
</FormField>
```

**Launch Button:**
```tsx
<Button
  variant="primary"
  size="lg"
  onClick={completeOnboarding}
  className="px-8"
>
  Launch Vantage
  <Rocket className="w-4 h-4 ml-2" />
</Button>
```

---

## 6. Onboarding Completion

### 6.1 Welcome Modal (First Load)

After completing onboarding, user lands on Command Center with a welcome modal:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                          🎉                                     │
│                                                                 │
│              Welcome to Vantage, Jake!                          │
│                                                                 │
│      Your workspace is set up and ready to go.                  │
│      Here's what you can do next:                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📊 Explore your Command Center                          │   │
│  │    See your portfolio health and key insights           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🤖 Ask Scout anything                                   │   │
│  │    "What's at risk this week?"                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📈 Check out Reports                                    │   │
│  │    Generate your first status report                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│               [Let's Go!]        [Take a Tour]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Onboarding Checklist (Persistent)

Show a small checklist in the Command Center until key actions are complete:

```
┌─────────────────────────────────────────────────┐
│ Getting Started                          [Hide] │
├─────────────────────────────────────────────────┤
│ ✓ Create your account                           │
│ ✓ Connect your tools                            │
│ ✓ Invite teammates (3 invited)                  │
│ ○ Explore the Command Center                    │
│ ○ Ask Scout your first question                 │
│ ○ Generate your first report                    │
├─────────────────────────────────────────────────┤
│ ████████████████░░░░░░░░░░ 50% complete        │
└─────────────────────────────────────────────────┘
```

---

## 7. Interactions & States

### 7.1 Email Validation

- Real-time validation as user types
- Check for valid email format
- Deduplicate entries
- Check against existing workspace members
- Highlight invalid emails in red

### 7.2 Workspace Slug Validation

- Debounced API check (300ms)
- Allowed characters: lowercase letters, numbers, hyphens
- Minimum 3 characters
- Cannot start/end with hyphen
- Check availability against existing workspaces

### 7.3 Navigation

- Back button returns to previous step
- Can navigate to any completed step
- Skip allowed on Step 3 (invites)
- Step 4 cannot be skipped (required config)

### 7.4 Progress Persistence

- Onboarding progress saved to database
- User can close browser and resume
- Show "Continue where you left off" on return

---

## 8. Data Requirements

### 8.1 API Endpoints

**POST /api/onboarding/invites**
```typescript
// Body
{
  emails: string[];
  role: 'admin' | 'member' | 'viewer'; // Note: 'owner' is auto-assigned to creator
}

// Response
{
  sent: number;
  skipped: Array<{ email: string; reason: string }>;
}
```

**GET /api/integrations/:id/users**
```typescript
// For importing from Jira/Slack
// Response
{
  users: Array<{
    email: string;
    name: string;
    avatar?: string;
  }>;
}
```

**POST /api/onboarding/workspace**
```typescript
// Body
{
  organizationName: string;
  workspaceSlug: string;
  timezone: string;
  workDays: number[];
  syncFrequency: 'frequent' | 'standard' | 'hourly'; // 'realtime' added in V2 with webhooks
  theme: 'light' | 'dark' | 'system';
}
```

**GET /api/workspace/check-slug**
```typescript
// Query: ?slug=acme-corp
// Response
{
  available: boolean;
  suggestions?: string[];
}
```

**POST /api/onboarding/complete**
```typescript
// Marks onboarding as complete
// Returns redirect URL
```

### 8.2 Onboarding State

```typescript
interface OnboardingState {
  userId: string;
  currentStep: 1 | 2 | 3 | 4;
  completedSteps: number[];
  data: {
    // Step 1
    accountCreated: boolean;
    // Step 2
    connectedTools: string[];
    // Step 3
    invitesSent: number;
    inviteEmails: string[];
    // Step 4
    organizationName?: string;
    workspaceSlug?: string;
    timezone?: string;
    workDays?: number[];
    syncFrequency?: string;
    theme?: string;
  };
  startedAt: string;
  completedAt?: string;
}
```

---

## 9. Edge Cases

| Case | Handling |
|------|----------|
| User already in workspace | Skip to Step 4 or Command Center |
| Invalid email domain (if restricted) | Show error: "Only @company.com emails allowed" |
| User invites themselves | Auto-remove from list |
| All emails already invited | Show: "All emails are already pending invites" |
| Workspace slug taken | Suggest alternatives (e.g., "acme-corp-1") |
| Browser closed mid-onboarding | Resume on next login |
| Connected tools have no users | Hide "Import from Jira" option |
| Network error during invite | Show error, allow retry |
| Jira import returns 100+ users | Paginate with search |

---

## 10. Mobile Considerations

### 10.1 Responsive Layout

- Single column layout
- Full-width inputs
- Progress indicator simplified (dots only, no labels)
- Import buttons stack vertically

### 10.2 Mobile Wireframe - Step 3

```
┌─────────────────────────────────┐
│         [Vantage Logo]          │
│         ● ● ● ○                 │
├─────────────────────────────────┤
│                                 │
│     👥 Invite Your Team         │
│                                 │
│ Enter email addresses:          │
│ ┌─────────────────────────────┐ │
│ │ sarah@company.com           │ │
│ │ mike@company.com            │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ [📋 Paste] [Import from Jira]  │
│                                 │
│ Preview (2 invites)             │
│ sarah@company.com          [✗]  │
│ mike@company.com           [✗]  │
│                                 │
│ Role: [Member ▼]                │
│                                 │
│ [Skip]      [Send 2 Invites →]  │
│                                 │
└─────────────────────────────────┘
```

### 10.3 Mobile Wireframe - Step 4

```
┌─────────────────────────────────┐
│         [Vantage Logo]          │
│         ● ● ● ●                 │
├─────────────────────────────────┤
│                                 │
│    ⚙️ Configure Workspace       │
│                                 │
│ Organization name               │
│ [Acme Corp                   ]  │
│                                 │
│ Workspace URL                   │
│ vantage.io/[acme-corp       ]   │
│ ✓ Available                     │
│                                 │
│ Timezone                        │
│ [America/New_York (EST)    ▼]   │
│                                 │
│ Work week                       │
│ [M][T][W][T][F][S][S]          │
│  ●  ●  ●  ●  ●  ○  ○           │
│                                 │
│ Sync frequency                  │
│ ● Every 5 min (recommended)     │
│ ○ Every 15 min                  │
│ ○ Hourly                        │
│                                 │
│ Theme                           │
│ [☀️][🌙][💻]                    │
│                                 │
│      [Launch Vantage →]         │
│                                 │
└─────────────────────────────────┘
```

---

## 11. Accessibility

- Progress indicator has aria-valuenow and aria-valuemax
- Steps have aria-current="step" for current
- Form fields have proper labels
- Error messages linked via aria-describedby
- Skip link available for keyboard users
- Email list supports keyboard navigation

---

## 12. Analytics Events

| Event | Properties |
|-------|------------|
| `onboarding_step_viewed` | `step` |
| `onboarding_step_completed` | `step`, `duration` |
| `onboarding_step_skipped` | `step` |
| `onboarding_invites_sent` | `count`, `role` |
| `onboarding_invite_import` | `source` (jira, slack, paste) |
| `onboarding_workspace_configured` | `settings` |
| `onboarding_completed` | `total_duration`, `steps_skipped` |
| `onboarding_abandoned` | `last_step` |

---

## 13. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Multi-tenancy: path-based routing confirmed for V1? | Engineering | Yes, path-based. Custom subdomains V2 (see O2). |
| 2 | Trial period: 14-day free trial confirmed? | Product | Decided: 14 days, no CC required (see B6). |
| 3 | Import sources: dynamically shown based on Step 2 connections? | Engineering | Yes, only show connected sources (see O1). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Onboarding Steps 3-4 ensure new users bring their team and configure their workspace for success.*
