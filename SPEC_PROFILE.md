# Screen Spec: User Profile
## /profile

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The User Profile screen allows users to manage their personal information, preferences, and account settings. It's the "about me" hub where users control how they appear and interact with Vantage.

**Core Value:** Users need a single place to manage their identity, preferences, and connected accounts without navigating through org-wide settings.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| P-1 | User | Update my profile photo | My teammates can identify me |
| P-2 | User | Change my display name | I'm shown correctly across the app |
| P-3 | User | Set my timezone | Times are displayed correctly for me |
| P-4 | User | Manage my notification preferences | I control what alerts I receive |
| P-5 | User | Change my password | I can maintain account security |
| P-6 | User | See my connected tool accounts | I know which integrations are linked to me |
| P-7 | User | Set my role/title | My teammates know my function |
| P-8 | User | Enable two-factor authentication | My account is more secure |

---

## 3. Layout Wireframe

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ Profile                                                          │ │
│         │  │ Manage your personal information and preferences                 │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ [Profile] [Notifications] [Security] [Connected Accounts]       │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │  PROFILE TAB                                                         │
│         │  ═══════════════════════════════════════════════════════════════════ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │                                                                  │ │
│         │  │  ┌─────────────────────────────────────────────────────────┐   │ │
│         │  │  │                                                          │   │ │
│         │  │  │         ┌───────────┐                                   │   │ │
│         │  │  │         │           │                                   │   │ │
│         │  │  │         │  [Avatar  │   Jake Martinez                   │   │ │
│         │  │  │         │   96px]   │   jake@company.com                │   │ │
│         │  │  │         │           │   Senior Engineer · API Team      │   │ │
│         │  │  │         └───────────┘                                   │   │ │
│         │  │  │         [Change photo]                                  │   │ │
│         │  │  │                                                          │   │ │
│         │  │  └─────────────────────────────────────────────────────────┘   │ │
│         │  │                                                                  │ │
│         │  │  ┌─────────────────────────────────────────────────────────┐   │ │
│         │  │  │ PERSONAL INFORMATION                                     │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Full name                                                │   │ │
│         │  │  │ [Jake Martinez                               ]           │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Email address                                            │   │ │
│         │  │  │ [jake@company.com                            ] [Verified]│   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Job title                                                │   │ │
│         │  │  │ [Senior Engineer                             ]           │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Team                                                     │   │ │
│         │  │  │ [API Team                               ▼]               │   │ │
│         │  │  │                                                          │   │ │
│         │  │  └─────────────────────────────────────────────────────────┘   │ │
│         │  │                                                                  │ │
│         │  │  ┌─────────────────────────────────────────────────────────┐   │ │
│         │  │  │ PREFERENCES                                              │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Timezone                                                 │   │ │
│         │  │  │ [America/New_York (EST)                  ▼]              │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Date format                                              │   │ │
│         │  │  │ [MM/DD/YYYY                              ▼]              │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Start of week                                            │   │ │
│         │  │  │ [Sunday ▼]                                               │   │ │
│         │  │  │                                                          │   │ │
│         │  │  │ Language                                                 │   │ │
│         │  │  │ [English (US)                           ▼]               │   │ │
│         │  │  │                                                          │   │ │
│         │  │  └─────────────────────────────────────────────────────────┘   │ │
│         │  │                                                                  │ │
│         │  │                                              [Save Changes]     │ │
│         │  │                                                                  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tab Structure

### Tab 1: Profile (Default)
Personal information, avatar, and preferences.

### Tab 2: Notifications
Email and in-app notification preferences.

### Tab 3: Security
Password management (V1). Two-factor auth and active session management are **V2** features.

### Tab 4: Connected Accounts
Linked tool accounts. V1: Jira only. Monday and Asana connections are **V1.1/V1.2**. Google SSO and Slack are **V2**.

---

## 5. Component Breakdown

### 5.1 Page Header

```tsx
<PageHeader
  title="Profile"
  subtitle="Manage your personal information and preferences"
/>
```

### 5.2 Profile Header Card

```tsx
<Card className="p-6">
  <div className="flex items-center gap-6">
    <div className="relative">
      <Avatar src={user.avatar} name={user.name} size="xl" /> {/* 96px */}
      <button
        className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full border border-neutral-200 shadow-sm hover:bg-neutral-50"
        onClick={openAvatarUpload}
      >
        <Camera className="w-4 h-4 text-neutral-600" />
      </button>
    </div>
    <div>
      <h2 className="text-xl font-semibold text-neutral-900">{user.name}</h2>
      <p className="text-sm text-neutral-500">{user.email}</p>
      <p className="text-sm text-neutral-500">{user.title} · {user.team}</p>
    </div>
  </div>
</Card>
```

### 5.3 Avatar Upload Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Update Profile Photo                                     [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │                    [Drop zone]                           │   │
│  │                                                          │   │
│  │              📷 Drag and drop an image                   │   │
│  │                 or click to browse                       │   │
│  │                                                          │   │
│  │              PNG, JPG up to 5MB                          │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Or choose an avatar:                                           │
│  [😀] [🧑‍💻] [👩‍💼] [🧑‍🎨] [👨‍🔬] [🦸] [🤖] [🎭]           │
│                                                                 │
│                                      [Cancel] [Save Photo]      │
└─────────────────────────────────────────────────────────────────┘
```

**Crop Interface:** After upload, show circular crop tool.

### 5.4 Form Sections

**Personal Information:**
```tsx
<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold text-neutral-900">Personal Information</h3>
  </CardHeader>
  <CardContent className="space-y-4">
    <FormField label="Full name" required>
      <Input value={name} onChange={setName} />
    </FormField>
    
    <FormField label="Email address">
      <div className="flex items-center gap-2">
        <Input value={email} onChange={setEmail} />
        <Badge variant="success">Verified</Badge>
      </div>
      <FormHelper>Changing your email requires verification.</FormHelper>
    </FormField>
    
    <FormField label="Job title">
      <Input value={title} onChange={setTitle} placeholder="e.g., Product Manager" />
    </FormField>
    
    <FormField label="Team">
      <Select value={teamId} onChange={setTeamId} options={teams} />
    </FormField>
  </CardContent>
</Card>
```

**Preferences:**
```tsx
<Card>
  <CardHeader>
    <h3 className="text-lg font-semibold text-neutral-900">Preferences</h3>
  </CardHeader>
  <CardContent className="space-y-4">
    <FormField label="Timezone">
      <Select value={timezone} onChange={setTimezone} options={timezones} searchable />
    </FormField>
    
    <FormField label="Date format">
      <Select value={dateFormat} onChange={setDateFormat} options={[
        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
      ]} />
    </FormField>
    
    <FormField label="Start of week">
      <Select value={weekStart} onChange={setWeekStart} options={[
        { value: 'sunday', label: 'Sunday' },
        { value: 'monday', label: 'Monday' },
      ]} />
    </FormField>
    
    <FormField label="Language">
      <Select value={language} onChange={setLanguage} options={languages} />
    </FormField>
  </CardContent>
</Card>
```

### 5.5 Save Button

```tsx
<div className="flex justify-end mt-6">
  <Button variant="primary" onClick={saveChanges} disabled={!hasChanges || saving}>
    {saving ? <Spinner className="w-4 h-4 mr-2" /> : null}
    Save Changes
  </Button>
</div>
```

---

## 6. Notifications Tab

### 6.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ NOTIFICATION PREFERENCES                                        │
│                                                                 │
│ Choose how you want to be notified about activity in Vantage.   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ EMAIL NOTIFICATIONS                                         │ │
│ │                                                              │ │
│ │ Risk alerts                                                  │ │
│ │ When a critical or high risk is detected        [Toggle ON] │ │
│ │                                                              │ │
│ │ Mentions                                                     │ │
│ │ When someone mentions you in a comment          [Toggle ON] │ │
│ │                                                              │ │
│ │ Weekly digest                                                │ │
│ │ Summary of your portfolio activity              [Toggle ON] │ │
│ │                                                              │ │
│ │ Scheduled reports                                            │ │
│ │ Delivery of your scheduled reports              [Toggle ON] │ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ IN-APP NOTIFICATIONS                                        │ │
│ │                                                              │ │
│ │ All activity                                                 │ │
│ │ Task updates, comments, status changes          [Toggle ON] │ │
│ │                                                              │ │
│ │ Sync events                                                  │ │
│ │ When integrations sync successfully or fail     [Toggle OFF]│ │
│ │                                                              │ │
│ │ Scout insights                                               │ │
│ │ AI-generated recommendations and alerts         [Toggle ON] │ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ QUIET HOURS                                                 │ │
│ │                                                              │ │
│ │ Pause notifications during these hours:                     │ │
│ │ [Enable quiet hours]                            [Toggle OFF]│ │
│ │                                                              │ │
│ │ From [10:00 PM ▼] to [7:00 AM ▼]                            │ │
│ │                                                              │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│                                              [Save Preferences] │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Notification Toggle Row

```tsx
<div className="flex items-center justify-between py-3">
  <div>
    <h4 className="text-sm font-medium text-neutral-900">{title}</h4>
    <p className="text-sm text-neutral-500">{description}</p>
  </div>
  <Toggle checked={enabled} onChange={setEnabled} />
</div>
```

---

## 7. Security Tab

### 7.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ SECURITY                                                        │
│                                                                 │
│ Manage your account security settings.                          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ PASSWORD                                                    │ │
│ │                                                              │ │
│ │ Last changed: 3 months ago                                  │ │
│ │                                                              │ │
│ │                                         [Change Password]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ TWO-FACTOR AUTHENTICATION                                   │ │
│ │                                                              │ │
│ │ Add an extra layer of security to your account.             │ │
│ │                                                              │ │
│ │ Status: ✓ Enabled                                          │ │
│ │ Method: Authenticator app                                   │ │
│ │                                                              │ │
│ │                                   [Manage 2FA]  [Disable]   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ACTIVE SESSIONS                                             │ │
│ │                                                              │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 💻 Chrome on macOS                          This device │ │ │
│ │ │    New York, USA · Active now                           │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 📱 Safari on iPhone                            [Revoke] │ │ │
│ │ │    New York, USA · Last active 2 hours ago              │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ 💻 Firefox on Windows                          [Revoke] │ │ │
│ │ │    Chicago, USA · Last active 3 days ago                │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ │                                                              │ │
│ │                               [Sign out all other devices]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ DANGER ZONE                                                 │ │
│ │                                                              │ │
│ │ Delete your account and all associated data.                │ │
│ │ This action cannot be undone.                               │ │
│ │                                                              │ │
│ │                                         [Delete Account]    │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Change Password Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ Change Password                                          [X]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Current password                                                │
│ [••••••••••••                                    ] [👁]        │
│                                                                 │
│ New password                                                    │
│ [                                                ] [👁]        │
│ ░░░░░░░░░░░░░░░░░░░░  Weak                                     │
│                                                                 │
│ Requirements:                                                   │
│ ✗ At least 8 characters                                        │
│ ✗ One uppercase letter                                         │
│ ✗ One number                                                   │
│ ✗ One special character                                        │
│                                                                 │
│ Confirm new password                                            │
│ [                                                ] [👁]        │
│                                                                 │
│                                   [Cancel] [Update Password]    │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 2FA Setup Flow

**Step 1:** Choose method (Authenticator app recommended)  
**Step 2:** Scan QR code with authenticator  
**Step 3:** Enter verification code  
**Step 4:** Save backup codes

---

## 8. Connected Accounts Tab

### 8.1 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ CONNECTED ACCOUNTS                                              │
│                                                                 │
│ These accounts are linked to your Vantage profile for syncing   │
│ and identification across tools.                                │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Jira]  Jira                                     Connected  │ │
│ │         jake.martinez@company.atlassian.net                 │ │
│ │         Linked Feb 1, 2026                                  │ │
│ │                                                    [Unlink] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Monday] Monday.com                              Connected  │ │
│ │          jake.martinez                                      │ │
│ │          Linked Jan 15, 2026                                │ │
│ │                                                    [Unlink] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Google] Google Calendar                      Not connected │ │
│ │          Connect to sync calendar events                    │ │
│ │                                                   [Connect] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Slack]  Slack                                Not connected │ │
│ │          Connect to receive notifications                   │ │
│ │                                                   [Connect] │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ─────────────────────────────────────────────────────────────  │
│                                                                 │
│ SIGN-IN METHODS                                                 │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 📧 Email & Password                              Primary    │ │
│ │    jake@company.com                                         │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ [Google] Google SSO                              Connected  │ │
│ │          jake.martinez@gmail.com                            │ │
│ │                                                    [Unlink] │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Connected Account Row

```tsx
<div className="flex items-center justify-between p-4 border border-neutral-100 rounded-lg">
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
      <IntegrationLogo className="w-6 h-6 text-white" />
    </div>
    <div>
      <h4 className="text-sm font-medium text-neutral-900">{name}</h4>
      <p className="text-sm text-neutral-500">{username || description}</p>
      {linkedDate && (
        <p className="text-xs text-neutral-400">Linked {formatDate(linkedDate)}</p>
      )}
    </div>
  </div>
  <div className="flex items-center gap-2">
    {isConnected ? (
      <>
        <Badge variant="success">Connected</Badge>
        <Button variant="ghost" size="sm" onClick={onUnlink}>Unlink</Button>
      </>
    ) : (
      <Button variant="secondary" size="sm" onClick={onConnect}>Connect</Button>
    )}
  </div>
</div>
```

---

## 9. Interactions & States

### 9.1 Form Validation

- Real-time validation on blur
- Error messages below fields
- Save button disabled until valid

### 9.2 Unsaved Changes

```tsx
// Show warning when navigating away with unsaved changes
<UnsavedChangesPrompt
  hasChanges={hasChanges}
  message="You have unsaved changes. Are you sure you want to leave?"
/>
```

### 9.3 Save Feedback

- Button shows spinner while saving
- Success: Toast "Profile updated successfully"
- Error: Toast "Failed to update profile. Please try again."

### 9.4 Avatar Upload States

- Idle: Drop zone
- Dragging: Highlighted border
- Uploading: Progress indicator
- Processing: "Processing image..."
- Complete: Show preview, enable save

---

## 10. Data Requirements

### 10.1 API Endpoints

**GET /api/users/me**
```typescript
// Response
{
  user: User;
  preferences: UserPreferences;
  notificationSettings: NotificationSettings;
  connectedAccounts: ConnectedAccount[];
  sessions: Session[];
}
```

**PATCH /api/users/me**
```typescript
// Body
{
  name?: string;
  title?: string;
  teamId?: string;
  avatar?: string;  // URL after upload
}
```

**PATCH /api/users/me/preferences**
```typescript
// Body
{
  timezone?: string;
  dateFormat?: string;
  weekStart?: 'sunday' | 'monday';
  language?: string;
}
```

**PATCH /api/users/me/notifications**
```typescript
// Body
{
  emailRiskAlerts?: boolean;
  emailMentions?: boolean;
  emailDigest?: boolean;
  emailReports?: boolean;
  inAppActivity?: boolean;
  inAppSyncs?: boolean;
  inAppScout?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
```

**POST /api/users/me/avatar**
```typescript
// Multipart form data with image file
// Response
{
  avatarUrl: string;
}
```

**POST /api/users/me/password**
```typescript
// Body
{
  currentPassword: string;
  newPassword: string;
}
```

**DELETE /api/users/me/sessions/:sessionId**
```typescript
// Revoke a specific session
```

**DELETE /api/users/me**
```typescript
// Delete account (requires password confirmation)
```

### 10.2 Data Model

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  title?: string;
  teamId?: string;
  teamName?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt: string;
}

interface UserPreferences {
  timezone: string;
  dateFormat: string;
  weekStart: 'sunday' | 'monday';
  language: string;
  theme: 'light' | 'dark' | 'system';
}

interface ConnectedAccount {
  id: string;
  provider: 'jira' | 'monday' | 'asana' | 'google' | 'slack';
  externalId: string;
  externalUsername: string;
  connectedAt: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastActiveAt: string;
  isCurrent: boolean;
}
```

---

## 11. Edge Cases

| Case | Handling |
|------|----------|
| Email already in use | Error: "This email is already registered" |
| Weak password | Show requirements not met, disable submit |
| Invalid image format | Error: "Please upload a PNG or JPG file" |
| Image too large | Error: "Image must be under 5MB" |
| Unlink last sign-in method | Prevent: "You must have at least one sign-in method" |
| Delete account with active subscription | Warning: "Your subscription will be cancelled" |
| Session from unknown location | Highlight with warning icon |
| 2FA backup codes exhausted | Prompt to regenerate |

---

## 12. Mobile Considerations

### 12.1 Responsive Layout

- Form fields: Full width, stacked
- Avatar upload: Tap to open camera/gallery
- Tabs: Horizontal scroll or dropdown

### 12.2 Mobile Wireframe

```
┌─────────────────────────────────┐
│ ← Profile                       │
├─────────────────────────────────┤
│        ┌───────────┐            │
│        │  [Avatar] │            │
│        └───────────┘            │
│     Jake Martinez               │
│     jake@company.com            │
│     [Change photo]              │
├─────────────────────────────────┤
│ [Profile][Notif][Security][...]│
├─────────────────────────────────┤
│ Full name                       │
│ [Jake Martinez          ]       │
│                                 │
│ Email                           │
│ [jake@company.com       ]       │
│                                 │
│ ...                             │
│                                 │
│        [Save Changes]           │
└─────────────────────────────────┘
```

---

## 13. Accessibility

- Form fields have associated labels
- Error messages linked via aria-describedby
- Toggle switches have proper aria-checked
- Password visibility toggle has aria-label
- Focus management in modals

---

## 14. Analytics Events

| Event | Properties |
|-------|------------|
| `profile_viewed` | `tab` |
| `profile_updated` | `fields_changed` |
| `avatar_uploaded` | `file_size` |
| `password_changed` | - |
| `2fa_enabled` | `method` |
| `2fa_disabled` | - |
| `session_revoked` | `session_id` |
| `account_connected` | `provider` |
| `account_unlinked` | `provider` |

---

## 15. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Avatar storage: file storage strategy for V1? | Engineering | Postgres blob or local FS for V1, S3-compatible in V2 (see P1). |
| 2 | Account deletion cascade: exact tables and fields affected? | Engineering | Formal cascade defined in TECHNICAL_DECISIONS.md P4. |
| 3 | 2FA: confirmed V2? | Product | Yes, V1 is email+password only (see P2). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. User Profile gives users control over their identity and preferences within Vantage.*
