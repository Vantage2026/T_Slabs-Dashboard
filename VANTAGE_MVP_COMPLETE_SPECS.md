# Vantage MVP - Complete Screen Specifications
*Created: 2026-02-07 21:20 UTC*
*Product Director: Jeff*
*For: Emmy (Principal Engineer)*
*Status: Production-Ready Build Specs*

---

## TABLE OF CONTENTS
1. [Design System](#design-system)
2. [Screen 1: Landing Page](#screen-1-landing-page)
3. [Screen 2: Sign Up](#screen-2-sign-up)
4. [Screen 3: Connect Tools](#screen-3-connect-tools)
5. [Screen 4: OAuth Flow](#screen-4-oauth-flow)
6. [Screen 5: Syncing Data](#screen-5-syncing-data)
7. [Screen 6: Onboarding Complete](#screen-6-onboarding-complete)
8. [Screen 7: Main Dashboard](#screen-7-main-dashboard)
9. [Screen 8: Project Detail](#screen-8-project-detail)
10. [Screen 9: Alert Detail Modal](#screen-9-alert-detail-modal)
11. [Screen 10: Generate Message Modal](#screen-10-generate-message-modal)
12. [Screen 11: Message Preview Modal](#screen-11-message-preview-modal)
13. [Screen 12: Settings](#screen-12-settings)
14. [Component Library](#component-library)
15. [Copy & Content](#copy-content)
16. [Timeline](#timeline)

---

## DESIGN SYSTEM

### Colors (Tailwind Config)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066CC',
          50: '#E6F2FF',
          100: '#CCE5FF',
          500: '#0066CC',
          600: '#0052A3',
          700: '#003D7A',
        },
        success: {
          DEFAULT: '#00A86B',
          50: '#E6F9F2',
          500: '#00A86B',
          600: '#008659',
        },
        warning: {
          DEFAULT: '#FFA500',
          50: '#FFF4E6',
          500: '#FFA500',
          600: '#CC8400',
        },
        danger: {
          DEFAULT: '#E63946',
          50: '#FDEEF0',
          500: '#E63946',
          600: '#B82E38',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
    }
  }
}
```

### Typography Scale
```
Headings:
- H1: text-4xl font-bold (36px, bold)
- H2: text-3xl font-semibold (30px, semibold)
- H3: text-2xl font-semibold (24px, semibold)
- H4: text-xl font-semibold (20px, semibold)
- H5: text-lg font-medium (18px, medium)

Body:
- Large: text-lg (18px)
- Default: text-base (16px)
- Small: text-sm (14px)
- Caption: text-xs (12px)

Weights:
- Regular: font-normal (400)
- Medium: font-medium (500)
- Semibold: font-semibold (600)
- Bold: font-bold (700)
```

### Spacing Units
```
Base unit: 4px (Tailwind default)

Common spacing:
space-1: 4px
space-2: 8px
space-3: 12px
space-4: 16px
space-6: 24px
space-8: 32px
space-10: 40px
space-12: 48px
space-16: 64px
space-20: 80px
space-24: 96px
```

---

## SCREEN 1: LANDING PAGE

### Route
`/` (public, unauthenticated)

### Layout
```jsx
<div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
  {/* Header */}
  <header className="container mx-auto px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <img src="/logo.svg" alt="Vantage" className="h-10 w-10" />
      <span className="text-2xl font-bold text-neutral-900">Vantage</span>
    </div>
    <a href="/login" className="text-sm font-medium text-neutral-700 hover:text-primary">
      Log In
    </a>
  </header>

  {/* Hero Section */}
  <main className="container mx-auto px-6 py-20 text-center">
    <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
      The AI PM Assistant That<br />Scales Your Team
    </h1>
    
    <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
      Strategic intelligence for project leaders who manage across Jira, Monday, and Asana
    </p>
    
    <button className="px-8 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors shadow-lg">
      Get Started Free →
    </button>
    
    <p className="text-sm text-neutral-500 mt-3">
      50 developers included • No credit card required
    </p>

    {/* Feature Grid */}
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 text-left">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-primary" /* icon */ />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Unified Dashboard
        </h3>
        <p className="text-sm text-neutral-600">
          View all projects across Jira, Monday, and Asana in one place
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="w-12 h-12 bg-danger-50 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-danger" /* icon */ />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          AI Risk Detection
        </h3>
        <p className="text-sm text-neutral-600">
          Proactive alerts when projects are trending off track
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-warning" /* icon */ />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Stakeholder Updates
        </h3>
        <p className="text-sm text-neutral-600">
          Generate tailored messages for executives, engineers, and clients
        </p>
      </div>

      <div className="bg-white rounded-lg p-6 shadow">
        <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-success" /* icon */ />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          Team Health Metrics
        </h3>
        <p className="text-sm text-neutral-600">
          Track velocity, completion rates, and team capacity
        </p>
      </div>
    </div>

    {/* Social Proof */}
    <div className="mt-20 bg-white rounded-lg p-8 shadow-md max-w-3xl mx-auto">
      <p className="text-lg text-neutral-700 italic mb-4">
        "Vantage makes 1 PM as effective as 3. We finally have visibility across all our tools without manual reporting."
      </p>
      <div className="flex items-center justify-center gap-4">
        <img src="/avatars/sarah.jpg" className="w-12 h-12 rounded-full" />
        <div className="text-left">
          <p className="font-semibold text-neutral-900">Sarah Chen</p>
          <p className="text-sm text-neutral-600">Director of PMO, TechCorp</p>
        </div>
      </div>
    </div>
  </main>

  {/* Footer */}
  <footer className="container mx-auto px-6 py-8 border-t border-neutral-200 text-center text-sm text-neutral-600">
    <p>© 2026 Vantage. All rights reserved.</p>
  </footer>
</div>
```

### Interactions
- "Get Started Free" button → `/signup`
- "Log In" link → `/login`
- Smooth scroll to features on page load

### Responsive
- Hero: Single column on mobile, maintain spacing
- Feature grid: 1 col mobile, 2 cols tablet, 4 cols desktop
- Header: Stack logo and login on mobile

---

## SCREEN 2: SIGN UP

### Route
`/signup` (public)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
  <div className="w-full max-w-md">
    {/* Logo */}
    <div className="text-center mb-8">
      <img src="/logo.svg" alt="Vantage" className="h-12 w-12 mx-auto mb-3" />
      <h1 className="text-3xl font-bold text-neutral-900">Create Your Account</h1>
      <p className="text-sm text-neutral-600 mt-2">Step 1 of 4</p>
    </div>

    {/* Form */}
    <div className="bg-white rounded-lg shadow-md p-8">
      <form className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Work Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            placeholder="you@company.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            placeholder="8+ characters"
            required
          />
          <p className="text-xs text-neutral-500 mt-1">
            Must be at least 8 characters
          </p>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
            required
          />
          <span className="text-sm text-neutral-700">
            I agree to the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
        >
          Continue →
        </button>
      </form>

      {/* OAuth Options */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-neutral-500">or sign up with</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center">
            <img src="/icons/google.svg" className="w-5 h-5" alt="Google" />
          </button>
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center">
            <img src="/icons/microsoft.svg" className="w-5 h-5" alt="Microsoft" />
          </button>
          <button className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center">
            <img src="/icons/slack.svg" className="w-5 h-5" alt="Slack" />
          </button>
        </div>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm text-neutral-600 mt-6">
        Already have an account? <a href="/login" className="text-primary font-medium hover:underline">Log In</a>
      </p>
    </div>
  </div>
</div>
```

### Validation
- Email: Valid email format, check if already registered
- Password: Min 8 characters, show strength indicator (optional for MVP)
- Terms checkbox: Must be checked to submit

### Error States
```jsx
// Error message below field
<p className="text-xs text-danger mt-1 flex items-center gap-1">
  <ExclamationCircleIcon className="w-4 h-4" />
  This email is already registered
</p>

// Error border on input
className="... border-danger focus:ring-danger focus:border-danger"
```

### Success Flow
Form submit → POST /api/auth/signup → redirect to `/connect-tools`

---

## SCREEN 3: CONNECT TOOLS

### Route
`/connect-tools` (authenticated, onboarding)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
  <div className="w-full max-w-2xl">
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-neutral-900 mb-2">
        Connect Your Project Management Tools
      </h1>
      <p className="text-neutral-600">
        Step 2 of 4
      </p>
      <p className="text-sm text-neutral-600 mt-3">
        We'll pull data from your existing tools to give you a unified view. You can connect more tools later.
      </p>
    </div>

    {/* Tool Cards */}
    <div className="space-y-4">
      {/* Jira Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <img src="/icons/jira.svg" className="w-12 h-12" alt="Jira" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Jira</h3>
              <p className="text-sm text-neutral-600">
                Sync projects, issues, sprints, and teams
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors">
            Connect
          </button>
        </div>
      </div>

      {/* Monday Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <img src="/icons/monday.svg" className="w-12 h-12" alt="Monday.com" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Monday.com</h3>
              <p className="text-sm text-neutral-600">
                Sync boards, items, and workflows
              </p>
            </div>
          </div>
          <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors">
            Connect
          </button>
        </div>
      </div>

      {/* Asana Card */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <img src="/icons/asana.svg" className="w-12 h-12" alt="Asana" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Asana</h3>
              <p className="text-sm text-neutral-600">
                Sync projects, tasks, and portfolios
              </p>
            </div>
          </div>
          <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-50 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>

    {/* Connected State (after connection) */}
    {/* Replace button with: */}
    <div className="flex items-center gap-2 text-success">
      <CheckCircleIcon className="w-5 h-5" />
      <span className="font-medium">Connected</span>
      <span className="text-sm text-neutral-600">yourcompany.atlassian.net</span>
    </div>
    <button className="text-sm text-neutral-600 hover:text-neutral-900 ml-auto">
      Disconnect
    </button>

    {/* Footer Actions */}
    <div className="flex items-center justify-between mt-8">
      <button className="text-neutral-600 hover:text-neutral-900">
        Skip for now
      </button>
      <button
        className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
        disabled={!hasConnectedTool}
      >
        Continue →
      </button>
    </div>
  </div>
</div>
```

### Interactions
- "Connect" button → Opens OAuth modal (Screen 4)
- "Disconnect" button → Revokes connection, changes to "Connect" button
- "Skip for now" → `/dashboard` (warning: limited functionality)
- "Continue" → Enabled only if at least 1 tool connected → `/syncing`

### Connected State Logic
```javascript
// When tool is connected:
- Border changes from border-neutral-200 to border-success
- Button changes from "Connect" to connected state
- Show workspace name (e.g., "yourcompany.atlassian.net")
- Show "Disconnect" option
```

---

## SCREEN 4: OAUTH FLOW

### Route
OAuth modal (overlays Screen 3)

### Layout
```jsx
{/* Modal Overlay */}
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  {/* Atlassian OAuth Screen (example - actual UI is Atlassian's) */}
  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
    <div className="flex items-center justify-between mb-6">
      <img src="/icons/atlassian.svg" className="h-8" alt="Atlassian" />
      <button className="text-neutral-500 hover:text-neutral-700">
        <XIcon className="w-6 h-6" />
      </button>
    </div>

    <h2 className="text-2xl font-bold text-neutral-900 mb-4">
      Vantage wants to access your Jira data
    </h2>

    <div className="space-y-3 mb-6">
      <p className="text-sm font-medium text-neutral-700">This app will be able to:</p>
      <ul className="space-y-2 text-sm text-neutral-700">
        <li className="flex items-start gap-2">
          <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <span>Read projects, issues, and sprints</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <span>Read team members and permissions</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <span>Read comments and attachments</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckIcon className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <span>Update issue status and fields</span>
        </li>
      </ul>
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        Select Jira workspace:
      </label>
      <select className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none">
        <option>yourcompany.atlassian.net</option>
        <option>anotherworkspace.atlassian.net</option>
      </select>
    </div>

    <div className="flex gap-3">
      <button className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors">
        Cancel
      </button>
      <button className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors">
        Authorize
      </button>
    </div>

    <p className="text-xs text-neutral-500 text-center mt-4">
      By authorizing, you agree to Atlassian's <a href="#" className="text-primary hover:underline">Terms of Service</a>
    </p>
  </div>
</div>
```

### Flow
1. User clicks "Connect" on tool card
2. OAuth modal opens (Atlassian/Monday/Asana UI, not ours)
3. User selects workspace (if multiple)
4. User clicks "Authorize"
5. Redirect to OAuth provider → callback to `/api/auth/callback/{provider}`
6. Success → Close modal, update tool card to "Connected" state
7. Failure → Show error toast, keep modal open

### Error Handling
```jsx
{/* Error Toast */}
<div className="fixed top-4 right-4 bg-danger text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
  <XCircleIcon className="w-5 h-5" />
  <span>Failed to connect to Jira. Please try again.</span>
  <button className="text-white/80 hover:text-white">
    <XIcon className="w-5 h-5" />
  </button>
</div>
```

---

## SCREEN 5: SYNCING DATA

### Route
`/syncing` (authenticated, onboarding)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
  <div className="w-full max-w-md text-center">
    <h1 className="text-3xl font-bold text-neutral-900 mb-2">
      Setting Up Your Dashboard
    </h1>
    <p className="text-neutral-600 mb-2">Step 3 of 4</p>
    <p className="text-sm text-neutral-600 mb-8">
      We're pulling data from your tools...
    </p>

    {/* Progress Bar */}
    <div className="mb-8">
      <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-500"
          style={{ width: '75%' }}
        ></div>
      </div>
      <p className="text-sm font-medium text-neutral-700 mt-2">75%</p>
    </div>

    {/* Status Updates */}
    <div className="bg-white rounded-lg shadow p-6 text-left space-y-3">
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
        <span className="text-sm text-neutral-700">Connected to Jira</span>
      </div>
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
        <span className="text-sm text-neutral-700">Fetched 23 projects</span>
      </div>
      <div className="flex items-center gap-3">
        <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0" />
        <span className="text-sm text-neutral-700">Analyzed 1,247 issues</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 flex-shrink-0">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
        </div>
        <span className="text-sm text-neutral-700">Calculating team health scores...</span>
      </div>
    </div>

    <p className="text-sm text-neutral-500 mt-6">
      This usually takes 30-60 seconds.
    </p>
  </div>
</div>
```

### Logic
- Auto-advance when sync completes (WebSocket or polling)
- Show real-time status updates
- Progress bar animates based on completion percentage
- Redirect to Screen 6 when 100% complete

### Error Handling
```jsx
{/* If sync fails */}
<div className="bg-danger-50 border border-danger rounded-lg p-4 mt-6">
  <p className="text-sm text-danger font-medium mb-2">
    Sync failed: Unable to connect to Jira
  </p>
  <button className="text-sm text-danger hover:underline">
    Try again
  </button>
</div>
```

---

## SCREEN 6: ONBOARDING COMPLETE

### Route
`/welcome` (authenticated, onboarding)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
  <div className="w-full max-w-lg text-center">
    <div className="mb-6">
      <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon className="w-12 h-12 text-success" />
      </div>
      <h1 className="text-4xl font-bold text-neutral-900 mb-2">
        🎉 You're All Set!
      </h1>
      <p className="text-neutral-600">Step 4 of 4</p>
    </div>

    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <p className="text-lg text-neutral-700 mb-4">
        Your dashboard is ready with insights from:
      </p>
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">23</p>
          <p className="text-sm text-neutral-600">Projects</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">1,247</p>
          <p className="text-sm text-neutral-600">Issues</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">47</p>
          <p className="text-sm text-neutral-600">Team Members</p>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6 space-y-3 text-left">
        <p className="font-medium text-neutral-900">Here's what you can do now:</p>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-lg">📊</span>
            <span className="text-sm text-neutral-700">View unified project health across all tools</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🚨</span>
            <span className="text-sm text-neutral-700">Get AI-powered risk alerts</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">💬</span>
            <span className="text-sm text-neutral-700">Generate stakeholder updates</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📈</span>
            <span className="text-sm text-neutral-700">Track team performance metrics</span>
          </div>
        </div>
      </div>
    </div>

    <button 
      className="w-full px-6 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors mb-4"
      onClick={() => router.push('/dashboard')}
    >
      Go to Dashboard →
    </button>

    <div className="flex items-center justify-center gap-4 text-sm">
      <button className="text-primary font-medium hover:underline">
        Yes, show me around
      </button>
      <span className="text-neutral-400">|</span>
      <button className="text-neutral-600 hover:text-neutral-900">
        No, I'll explore
      </button>
    </div>
  </div>
</div>
```

### Interactions
- "Go to Dashboard" → `/dashboard`
- "Yes, show me around" → Start product tour (optional, Phase 2)
- "No, I'll explore" → `/dashboard`

---

## SCREEN 7: MAIN DASHBOARD

### Route
`/dashboard` (authenticated, main app)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50">
  {/* Top Navigation */}
  <header className="h-16 bg-white border-b border-neutral-200 sticky top-0 z-40">
    <div className="h-full px-6 flex items-center justify-between">
      {/* Left: Menu + Logo */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 hover:bg-neutral-100 rounded">
          <MenuIcon className="w-6 h-6 text-neutral-700" />
        </button>
        <div className="flex items-center gap-2">
          <img src="/logo.svg" className="h-8 w-8" alt="Vantage" />
          <span className="text-xl font-bold text-neutral-900 hidden sm:block">Vantage</span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-lg mx-8 hidden md:block">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="search"
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            placeholder="Search projects, issues..."
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Sync Status */}
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 rounded">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="hidden sm:inline">Synced 2m ago</span>
        </button>

        {/* Alerts */}
        <button className="relative p-2 hover:bg-neutral-100 rounded">
          <BellIcon className="w-6 h-6 text-neutral-700" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-medium">
            3
          </span>
        </button>

        {/* User Menu */}
        <button className="flex items-center gap-2 hover:bg-neutral-100 rounded p-1.5">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
            JD
          </div>
        </button>
      </div>
    </div>
  </header>

  {/* Main Layout */}
  <div className="flex">
    {/* Sidebar */}
    <aside className="w-64 bg-white border-r border-neutral-200 min-h-screen hidden lg:block">
      <nav className="p-4 space-y-1">
        {/* Active */}
        <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-primary-50 text-primary rounded font-medium">
          <HomeIcon className="w-5 h-5" />
          Home
        </a>
        
        {/* Inactive */}
        <a href="/projects" className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded">
          <FolderIcon className="w-5 h-5" />
          Projects
        </a>
        
        <a href="/teams" className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded">
          <UsersIcon className="w-5 h-5" />
          Teams
        </a>
        
        <a href="/metrics" className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded">
          <ChartBarIcon className="w-5 h-5" />
          Metrics
        </a>

        <div className="pt-4 border-t border-neutral-200 mt-4">
          <a href="/messages" className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded">
            <ChatIcon className="w-5 h-5" />
            Messages
          </a>
          
          <a href="/settings" className="flex items-center gap-3 px-3 py-2 text-neutral-700 hover:bg-neutral-100 rounded">
            <CogIcon className="w-5 h-5" />
            Settings
          </a>
        </div>
      </nav>
    </aside>

    {/* Main Content */}
    <main className="flex-1 p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Portfolio Overview</h1>
          <p className="text-neutral-600 mt-1">Unified view across all your projects</p>
        </div>
        <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded">
          <RefreshIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
          <p className="text-2xl font-bold text-neutral-900">23</p>
          <p className="text-sm text-neutral-600">Total Projects</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-success">
          <p className="text-2xl font-bold text-neutral-900">18</p>
          <p className="text-sm text-neutral-600">On Track</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-warning">
          <p className="text-2xl font-bold text-neutral-900">3</p>
          <p className="text-sm text-neutral-600">At Risk</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-danger">
          <p className="text-2xl font-bold text-neutral-900">2</p>
          <p className="text-sm text-neutral-600">Blocked</p>
        </div>
      </div>

      {/* Project Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Active Projects</h2>

        {/* Green Project */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-success hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-neutral-900">Web App Redesign</h3>
                <img src="/icons/jira.svg" className="w-5 h-5" alt="Jira" />
                <span className="px-2 py-1 bg-success-50 text-success rounded-full text-xs font-medium">On Track</span>
              </div>
              <p className="text-sm text-neutral-600">Sprint 12 • 15 issues • 8 developers</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-success">87</p>
              <p className="text-xs text-neutral-500">Health</p>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-4">
            <p className="text-sm text-neutral-700">
              <span className="font-medium">Next:</span> Deploy to staging (2 days)
            </p>
          </div>
        </div>

        {/* Yellow Project */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-warning hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-neutral-900">Mobile App Launch</h3>
                <img src="/icons/monday.svg" className="w-5 h-5" alt="Monday" />
                <span className="px-2 py-1 bg-warning-50 text-warning rounded-full text-xs font-medium">At Risk</span>
              </div>
              <p className="text-sm text-neutral-600">23 tasks • 5 team members</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-warning">64</p>
              <p className="text-xs text-neutral-500">Health</p>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-700 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-warning" />
              Behind schedule by 1 week
            </p>
            <button className="text-sm text-primary font-medium hover:underline">
              View Alert
            </button>
          </div>
        </div>

        {/* Red Project */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-danger hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-neutral-900">API Migration</h3>
                <img src="/icons/jira.svg" className="w-5 h-5" alt="Jira" />
                <span className="px-2 py-1 bg-danger-50 text-danger rounded-full text-xs font-medium">Blocked</span>
              </div>
              <p className="text-sm text-neutral-600">Sprint 8 • 31 issues • 12 developers</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-danger">42</p>
              <p className="text-xs text-neutral-500">Health</p>
            </div>
          </div>
          <div className="border-t border-neutral-200 pt-4 flex items-center justify-between">
            <p className="text-sm text-neutral-700 flex items-center gap-2">
              <XCircleIcon className="w-4 h-4 text-danger" />
              3 critical blockers detected
            </p>
            <button className="text-sm text-primary font-medium hover:underline">
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* View All */}
      <div className="mt-6 text-center">
        <button className="text-primary font-medium hover:underline">
          View All Projects →
        </button>
      </div>
    </main>

    {/* Alerts Sidebar (Optional - collapsible) */}
    <aside className="w-80 bg-white border-l border-neutral-200 p-4 hidden xl:block overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Alerts (3)</h2>
        <button className="text-neutral-600 hover:text-neutral-900">
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        <div className="bg-warning-50 border border-warning rounded-lg p-3 cursor-pointer hover:bg-warning-100 transition-colors">
          <div className="flex items-start gap-2 mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Timeline Risk</p>
              <p className="text-xs text-neutral-600">Mobile App Launch</p>
            </div>
          </div>
          <p className="text-xs text-neutral-600">Detected 2h ago</p>
        </div>

        <div className="bg-danger-50 border border-danger rounded-lg p-3 cursor-pointer hover:bg-danger-100 transition-colors">
          <div className="flex items-start gap-2 mb-2">
            <XCircleIcon className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Critical Blocker</p>
              <p className="text-xs text-neutral-600">API Migration</p>
            </div>
          </div>
          <p className="text-xs text-neutral-600">Detected 1d ago</p>
        </div>

        <div className="bg-primary-50 border border-primary rounded-lg p-3 cursor-pointer hover:bg-primary-100 transition-colors">
          <div className="flex items-start gap-2 mb-2">
            <LightBulbIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-neutral-900">Optimization</p>
              <p className="text-xs text-neutral-600">Web Redesign</p>
            </div>
          </div>
          <p className="text-xs text-neutral-600">Detected 3h ago</p>
        </div>
      </div>

      <button className="w-full mt-4 text-sm text-primary font-medium hover:underline">
        View All Alerts →
      </button>
    </aside>
  </div>
</div>
```

### Responsive Behavior
- **Mobile (< 768px):** Hide sidebar, show hamburger menu
- **Tablet (768-1024px):** Show sidebar, hide alerts sidebar
- **Desktop (> 1024px):** Show all sidebars

### Interactions
- Project card click → `/project/:id` (Screen 8)
- "View Alert" button → Open Alert Detail Modal (Screen 9)
- Alert sidebar card click → Open Alert Detail Modal
- Search → Filter projects in real-time
- Sync status click → Show last sync time tooltip

---

## SCREEN 8: PROJECT DETAIL

### Route
`/project/:id` (authenticated)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50">
  {/* Use same header/sidebar as Screen 7 */}
  
  <main className="flex-1 p-6 lg:p-8">
    {/* Breadcrumb */}
    <div className="mb-6">
      <a href="/dashboard" className="text-sm text-neutral-600 hover:text-primary flex items-center gap-1">
        <ChevronLeftIcon className="w-4 h-4" />
        Back to Dashboard
      </a>
    </div>

    {/* Project Header */}
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-neutral-900">Mobile App Launch</h1>
            <img src="/icons/monday.svg" className="w-6 h-6" alt="Monday" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-warning">64</span>
            <span className="px-3 py-1 bg-warning-50 text-warning rounded-full text-sm font-medium">At Risk</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 flex items-center gap-2">
            <ExternalLinkIcon className="w-4 h-4" />
            Open in Monday
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
            Generate Update
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-200">
        <div>
          <p className="text-sm text-neutral-600">Progress</p>
          <p className="text-xl font-semibold text-neutral-900">67% (23/34)</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Team</p>
          <p className="text-xl font-semibold text-neutral-900">5 members</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Timeline</p>
          <p className="text-xl font-semibold text-warning">2 weeks late</p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Blockers</p>
          <p className="text-xl font-semibold text-danger">1 critical</p>
        </div>
      </div>
    </div>

    {/* Alerts Section */}
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
        Active Alerts (2)
      </h2>

      <div className="space-y-4">
        {/* Alert Card 1 */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-warning">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
                Timeline Risk Detected
              </h3>
              <p className="text-sm text-neutral-700 mb-3">
                Project is trending 2 weeks behind schedule based on current velocity
              </p>
              <p className="text-sm text-neutral-600 mb-3">
                <span className="font-medium">AI Recommendation:</span> Rescope or add 1-2 team members
              </p>
            </div>
            <button 
              className="px-4 py-2 text-primary font-medium hover:underline"
              onClick={() => openAlertModal()}
            >
              Details →
            </button>
          </div>
        </div>

        {/* Alert Card 2 */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-danger">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                <XCircleIcon className="w-5 h-5 text-danger" />
                Critical Blocker
              </h3>
              <p className="text-sm text-neutral-700 mb-3">
                Task "API Integration" blocked for 5 days with no activity
              </p>
              <p className="text-sm text-neutral-600 mb-3">
                <span className="font-medium">AI Recommendation:</span> Escalate to backend team lead
              </p>
            </div>
            <button className="px-4 py-2 text-primary font-medium hover:underline">
              Details →
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Team Health Metrics */}
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Team Health</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <p className="text-sm text-neutral-600">Velocity</p>
            <p className="text-lg font-semibold text-neutral-900">18 pts/sprint</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingDownIcon className="w-5 h-5 text-danger" />
            <span className="text-danger font-medium">15% vs last sprint</span>
          </div>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <p className="text-sm text-neutral-600">Task Completion Rate</p>
            <p className="text-lg font-semibold text-neutral-900">67%</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MinusIcon className="w-5 h-5 text-neutral-400" />
            <span className="text-neutral-600">Stable</span>
          </div>
        </div>

        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <p className="text-sm text-neutral-600">Blocked Tasks</p>
            <p className="text-lg font-semibold text-neutral-900">3 tasks</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUpIcon className="w-5 h-5 text-warning" />
            <span className="text-warning font-medium">+2 from last week</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Team Capacity</p>
            <p className="text-lg font-semibold text-neutral-900">110%</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ExclamationCircleIcon className="w-5 h-5 text-warning" />
            <span className="text-warning font-medium">Overallocated</span>
          </div>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-900">Recent Activity</h2>
        <a href="#" className="text-sm text-primary font-medium hover:underline">
          View in Monday.com →
        </a>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3 pb-3 border-b border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
            SC
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-900">
              <span className="font-medium">Sarah Chen</span> updated "User Auth Flow"
            </p>
            <p className="text-xs text-neutral-500">2 hours ago</p>
          </div>
        </div>

        <div className="flex items-start gap-3 pb-3 border-b border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-success text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
            MJ
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-900">
              <span className="font-medium">Mike Johnson</span> completed "Payment Integration"
            </p>
            <p className="text-xs text-neutral-500">5 hours ago</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-warning text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
            PT
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-900">
              Product team added 3 new tasks
            </p>
            <p className="text-xs text-neutral-500">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
```

### Interactions
- "Details" button on alert → Open Alert Detail Modal (Screen 9)
- "Generate Update" button → Open Generate Message Modal (Screen 10)
- "Open in Monday" → Opens Monday.com in new tab
- Breadcrumb "Back to Dashboard" → `/dashboard`

---

## SCREEN 9: ALERT DETAIL MODAL

### Route
Modal overlay (triggered from dashboard or project detail)

### Layout
```jsx
{/* Modal Backdrop */}
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  {/* Modal Container */}
  <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-neutral-200">
      <h2 className="text-2xl font-semibold text-neutral-900">Timeline Risk Detected</h2>
      <button 
        className="text-neutral-500 hover:text-neutral-700"
        onClick={closeModal}
      >
        <XIcon className="w-6 h-6" />
      </button>
    </div>

    {/* Content (scrollable) */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-neutral-600">Project:</span>
          <span className="font-medium text-neutral-900">Mobile App Launch</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neutral-600">Severity:</span>
          <span className="px-2 py-1 bg-warning-50 text-warning rounded text-xs font-medium">
            Medium
          </span>
        </div>
        <div className="text-neutral-600">
          Detected 2 hours ago
        </div>
      </div>

      {/* Problem Description */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-neutral-600" />
          What We Found:
        </h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-3 text-neutral-700">
            <span className="text-neutral-400 flex-shrink-0">•</span>
            <span>Project is trending 2 weeks behind original deadline</span>
          </li>
          <li className="flex items-start gap-3 text-neutral-700">
            <span className="text-neutral-400 flex-shrink-0">•</span>
            <span>Velocity has dropped 15% in last sprint</span>
          </li>
          <li className="flex items-start gap-3 text-neutral-700">
            <span className="text-neutral-400 flex-shrink-0">•</span>
            <span>8 tasks still in "In Progress" longer than 5 days</span>
          </li>
          <li className="flex items-start gap-3 text-neutral-700">
            <span className="text-neutral-400 flex-shrink-0">•</span>
            <span>Team capacity at 110% (overallocated)</span>
          </li>
        </ul>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-primary" />
          Recommendations:
        </h3>
        
        <div className="space-y-3">
          {/* Option 1 */}
          <div className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h4 className="font-semibold text-neutral-900 mb-2">
              Option 1: Rescope (Remove 5-7 non-critical features)
            </h4>
            <div className="space-y-1 text-sm text-neutral-700 pl-3 border-l-2 border-neutral-200">
              <p>├─ <span className="text-neutral-600">Impact:</span> Back on track by next sprint</p>
              <p>├─ <span className="text-neutral-600">Risk:</span> Product team may resist</p>
              <p>└─ <span className="text-neutral-600">Confidence:</span> High (85%)</p>
            </div>
          </div>

          {/* Option 2 */}
          <div className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h4 className="font-semibold text-neutral-900 mb-2">
              Option 2: Add Team Capacity (1-2 developers for 3 weeks)
            </h4>
            <div className="space-y-1 text-sm text-neutral-700 pl-3 border-l-2 border-neutral-200">
              <p>├─ <span className="text-neutral-600">Impact:</span> Can maintain scope and timeline</p>
              <p>├─ <span className="text-neutral-600">Risk:</span> Ramp-up time, increased cost</p>
              <p>└─ <span className="text-neutral-600">Confidence:</span> Medium (70%)</p>
            </div>
          </div>

          {/* Option 3 */}
          <div className="border border-neutral-200 rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
            <h4 className="font-semibold text-neutral-900 mb-2">
              Option 3: Extend Deadline (Push launch date by 2 weeks)
            </h4>
            <div className="space-y-1 text-sm text-neutral-700 pl-3 border-l-2 border-neutral-200">
              <p>├─ <span className="text-neutral-600">Impact:</span> Team can complete at current pace</p>
              <p>├─ <span className="text-neutral-600">Risk:</span> Market window, stakeholder expectations</p>
              <p>└─ <span className="text-neutral-600">Confidence:</span> High (90%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Message CTA */}
      <div className="bg-primary-50 border border-primary rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ChatIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-neutral-900 mb-1">
              Generate Stakeholder Update
            </h4>
            <p className="text-sm text-neutral-700 mb-3">
              Create a tailored message to inform leadership about this issue
            </p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
              onClick={() => openGenerateMessageModal()}
            >
              Generate Message →
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Footer Actions */}
    <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
      <button className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
        Dismiss Alert
      </button>
      <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-white transition-colors">
        Mark as Resolved
      </button>
      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors">
        Take Action
      </button>
    </div>
  </div>
</div>
```

### Interactions
- Close icon → Close modal
- "Generate Message" → Open Generate Message Modal (Screen 10)
- "Dismiss Alert" → Dismiss alert, close modal
- "Mark as Resolved" → Mark resolved, close modal
- "Take Action" → TBD (future feature)
- Click outside modal → Close modal
- ESC key → Close modal

---

## SCREEN 10: GENERATE MESSAGE MODAL

### Route
Modal overlay (triggered from alert or project page)

### Layout
```jsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-neutral-200">
      <h2 className="text-2xl font-semibold text-neutral-900">Generate Stakeholder Update</h2>
      <button className="text-neutral-500 hover:text-neutral-700" onClick={closeModal}>
        <XIcon className="w-6 h-6" />
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Selected Issue */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          What do you want to communicate?
        </label>
        <div className="bg-warning-50 border border-warning rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 text-warning flex-shrink-0" />
            <span className="text-sm text-neutral-900 font-medium">
              Timeline Risk - Mobile App Launch (2 weeks behind)
            </span>
          </div>
          <button className="text-sm text-primary hover:underline">
            Change
          </button>
        </div>
      </div>

      {/* Audience Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Who is your audience? <span className="text-neutral-500 font-normal">(select one or more)</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" />
            <div>
              <p className="font-medium text-neutral-900">Engineering Team</p>
              <p className="text-sm text-neutral-600">Technical details, code-focused</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border border-primary bg-primary-50 rounded-lg cursor-pointer">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" checked />
            <div>
              <p className="font-medium text-neutral-900">Senior Leadership</p>
              <p className="text-sm text-neutral-600">High-level, business impact</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" />
            <div>
              <p className="font-medium text-neutral-900">Commercial/Sales</p>
              <p className="text-sm text-neutral-600">Customer impact, timeline</p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 border border-neutral-200 rounded-lg hover:border-primary cursor-pointer transition-colors">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" />
            <div>
              <p className="font-medium text-neutral-900">Product Team</p>
              <p className="text-sm text-neutral-600">Feature prioritization</p>
            </div>
          </label>
        </div>
      </div>

      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Tone
        </label>
        <div className="flex gap-3">
          <label className="flex-1 p-3 border-2 border-primary bg-primary-50 rounded-lg cursor-pointer text-center">
            <input type="radio" name="tone" value="professional" className="sr-only" checked />
            <span className="font-medium text-neutral-900">Professional</span>
          </label>
          <label className="flex-1 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:border-primary text-center transition-colors">
            <input type="radio" name="tone" value="casual" className="sr-only" />
            <span className="font-medium text-neutral-900">Casual</span>
          </label>
          <label className="flex-1 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:border-primary text-center transition-colors">
            <input type="radio" name="tone" value="urgent" className="sr-only" />
            <span className="font-medium text-neutral-900">Urgent</span>
          </label>
        </div>
      </div>

      {/* Include Options */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-3">
          Include
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" checked />
            <span className="text-sm text-neutral-700">Current status</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" checked />
            <span className="text-sm text-neutral-700">Options to resolve</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" checked />
            <span className="text-sm text-neutral-700">Impact analysis</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary" />
            <span className="text-sm text-neutral-700">Detailed metrics</span>
          </label>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 bg-neutral-50">
      <button 
        className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        onClick={closeModal}
      >
        Cancel
      </button>
      <button 
        className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2"
        onClick={() => generateMessage()}
      >
        <SparklesIcon className="w-5 h-5" />
        Generate Message
      </button>
    </div>
  </div>
</div>
```

### Interactions
- Checkbox persona selection → Multiple allowed
- Radio tone selection → Only one
- "Generate Message" → API call to GPT-4 → Show loading → Open Message Preview Modal (Screen 11)
- "Cancel" → Close modal
- "Change" issue button → Show issue selector (TBD)

### Loading State
```jsx
{/* When generating */}
<button className="... opacity-50 cursor-not-allowed" disabled>
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  Generating...
</button>
```

---

## SCREEN 11: MESSAGE PREVIEW MODAL

### Route
Modal overlay (after message generation)

### Layout
```jsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-neutral-200">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-900">Generated Message</h2>
        <p className="text-sm text-neutral-600 mt-1">For: Senior Leadership</p>
      </div>
      <button className="text-neutral-500 hover:text-neutral-700" onClick={closeModal}>
        <XIcon className="w-6 h-6" />
      </button>
    </div>

    {/* Content */}
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Message Preview */}
      <div className="bg-neutral-50 rounded-lg p-6 border border-neutral-200">
        <div className="space-y-4 text-neutral-900">
          <p className="font-semibold">Subject: Mobile App Launch - Timeline Update</p>
          
          <p>Hi [Name],</p>
          
          <p>
            I wanted to give you a quick update on the Mobile App Launch project.
          </p>
          
          <div>
            <p className="font-semibold mb-2">Current Status:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>The project is currently tracking 2 weeks behind our original timeline</li>
              <li>Team velocity has decreased 15% in the recent sprint</li>
              <li>Several tasks are taking longer than anticipated</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold mb-2">Business Impact:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>If unaddressed, we'll miss our Q1 launch target</li>
              <li>This could affect our go-to-market strategy</li>
            </ul>
          </div>
          
          <div>
            <p className="font-semibold mb-2">Options to Get Back on Track:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Rescope: Remove 5-7 non-critical features</li>
              <li>Add capacity: Bring in 1-2 developers temporarily</li>
              <li>Extend timeline: Push launch by 2 weeks</li>
            </ol>
          </div>
          
          <p>
            I recommend Option 1 (rescoping) to maintain our timeline while managing team capacity. 
            Happy to discuss in more detail.
          </p>
          
          <p>Best,<br />[Your Name]</p>
        </div>
      </div>

      {/* Edit Button */}
      <button 
        className="w-full px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
        onClick={() => openEditor()}
      >
        <PencilIcon className="w-4 h-4" />
        Edit Message
      </button>

      {/* Generate Alternatives */}
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-3">
          Generate for different audience:
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded text-sm hover:border-primary transition-colors">
            Engineering Team
          </button>
          <button className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded text-sm hover:border-primary transition-colors">
            Commercial Team
          </button>
          <button className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded text-sm hover:border-primary transition-colors">
            Product Team
          </button>
        </div>
      </div>
    </div>

    {/* Footer Actions */}
    <div className="p-6 border-t border-neutral-200 bg-neutral-50 space-y-3">
      <div className="flex gap-3">
        <button 
          className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => copyToClipboard()}
        >
          <ClipboardCopyIcon className="w-5 h-5" />
          Copy to Clipboard
        </button>
        <button className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2">
          <DownloadIcon className="w-5 h-5" />
          Export to Markdown
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button 
          className="text-neutral-600 hover:text-neutral-900 text-sm"
          onClick={() => goBack()}
        >
          ← Back to Options
        </button>
        <button 
          className="px-4 py-2 text-primary font-medium text-sm hover:underline"
          onClick={() => markAsSent()}
        >
          Mark as Sent
        </button>
      </div>
    </div>
  </div>
</div>
```

### Interactions
- "Copy to Clipboard" → Copy message text, show toast confirmation
- "Export to Markdown" → Download as .md file
- "Edit Message" → Open inline editor (contenteditable)
- "Mark as Sent" → Track that message was sent, close modal
- Audience buttons → Regenerate message for new audience
- "← Back" → Return to Generate Message modal

### Success Toast
```jsx
<div className="fixed top-4 right-4 bg-success text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in">
  <CheckCircleIcon className="w-5 h-5" />
  <span>Copied to clipboard!</span>
</div>
```

---

## SCREEN 12: SETTINGS

### Route
`/settings` (authenticated)

### Layout
```jsx
<div className="min-h-screen bg-neutral-50">
  {/* Use same header/sidebar as dashboard */}
  
  <main className="flex-1 p-6 lg:p-8 max-w-4xl">
    <h1 className="text-3xl font-bold text-neutral-900 mb-8">Settings</h1>

    {/* Tabs */}
    <div className="border-b border-neutral-200 mb-8">
      <div className="flex gap-8">
        <button className="pb-4 border-b-2 border-primary text-primary font-medium">
          Connected Tools
        </button>
        <button className="pb-4 border-b-2 border-transparent text-neutral-600 hover:text-neutral-900">
          Account
        </button>
        <button className="pb-4 border-b-2 border-transparent text-neutral-600 hover:text-neutral-900">
          Team
        </button>
      </div>
    </div>

    {/* Connected Tools Section */}
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Connected Tools</h2>

      {/* Jira - Connected */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/icons/jira.svg" className="w-12 h-12" alt="Jira" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-neutral-900">Jira</h3>
                <span className="px-2 py-0.5 bg-success-50 text-success rounded text-xs font-medium flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Connected
                </span>
              </div>
              <p className="text-sm text-neutral-600">yourcompany.atlassian.net</p>
              <p className="text-xs text-neutral-500 mt-1">Last synced: 2 minutes ago</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 text-sm">
              Sync Now
            </button>
            <button className="px-4 py-2 text-danger hover:bg-danger-50 rounded text-sm">
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Monday - Connected */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/icons/monday.svg" className="w-12 h-12" alt="Monday" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-neutral-900">Monday.com</h3>
                <span className="px-2 py-0.5 bg-success-50 text-success rounded text-xs font-medium flex items-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  Connected
                </span>
              </div>
              <p className="text-sm text-neutral-600">yourcompany.monday.com</p>
              <p className="text-xs text-neutral-500 mt-1">Last synced: 5 minutes ago</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded hover:bg-neutral-50 text-sm">
              Sync Now
            </button>
            <button className="px-4 py-2 text-danger hover:bg-danger-50 rounded text-sm">
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Asana - Not Connected */}
      <div className="bg-white rounded-lg shadow p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/icons/asana.svg" className="w-12 h-12" alt="Asana" />
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">Asana</h3>
              <p className="text-sm text-neutral-600">Not connected</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600">
            Connect
          </button>
        </div>
      </div>
    </div>
  </main>
</div>
```

---

## COMPONENT LIBRARY

### Buttons
Already documented in Design System section. Use these classes:

**Primary:**
```jsx
className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-600 transition-colors"
```

**Secondary:**
```jsx
className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
```

**Danger:**
```jsx
className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger-600 transition-colors"
```

**Ghost:**
```jsx
className="px-4 py-2 text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
```

---

## COPY & CONTENT

### Onboarding Messages
```
Welcome: "The AI PM Assistant That Scales Your Team"
Tagline: "Strategic intelligence for project leaders who manage across Jira, Monday, and Asana"

Connect Tools: "We'll pull data from your existing tools to give you a unified view. You can connect more tools later."

Syncing: "This usually takes 30-60 seconds."

Complete: "🎉 You're All Set!"
```

### Empty States
```
No Projects: "No active projects found. Create a project in Jira, Monday, or Asana to get started."

No Alerts: "🎉 All Clear! No alerts right now. All projects are healthy."

No Messages: "No messages generated yet. Create your first stakeholder update from any alert or project."
```

### Error Messages
```
Auth Failed: "Failed to connect to [Tool]. Please try again or contact support if the issue persists."

Sync Failed: "Sync failed: Unable to connect to [Tool]. Check your connection and try again."

Generation Failed: "Failed to generate message. Please try again."

Generic: "Something went wrong. Please try again or contact support."
```

### Button Labels
```
Primary Actions:
- "Get Started Free"
- "Continue"
- "Go to Dashboard"
- "Generate Message"
- "Connect"
- "Authorize"

Secondary Actions:
- "Skip for now"
- "Cancel"
- "Dismiss"
- "Edit"
- "View Details"

Tertiary:
- "Back"
- "Change"
- "Learn more"
```

---

## TIMELINE

### Jeff (Product Director)

**Day 1-2 (Feb 7-8): Content & Copy** ✅
- Onboarding copy (all screens)
- Error messages
- Empty state messages
- Button labels
- Help tooltips
- Tool icons (SVG: Jira, Monday, Asana)
- Logo design (if company name confirmed)

**Day 3-4 (Feb 9-10): Design Support**
- Review your builds-in-progress
- Answer component questions
- Adjust specs as needed
- Provide additional mockups if required

**Day 5-8 (Feb 11-14): Testing & Polish**
- User flow testing
- Accessibility review (WCAG 2.1 AA)
- Copy refinement based on builds
- Beta user onboarding documentation
- Internal demo preparation

**Day 9-10 (Feb 15-16): Launch Support**
- Final QA review
- Documentation (user guide, FAQ)
- Support CEO in product review
- Prepare for beta launch

---

## DAILY SYNC

**Schedule:** 16:00 UTC daily (30 min)
- **Your update:** Progress, blockers, questions
- **My update:** Content ready, design decisions
- **Alignment:** Next 24 hours priorities

**Communication:**
- **Discord #emmy-engineering** for quick questions (<2 min response)
- **Agent-send** for detailed design decisions
- **Tag me with screenshots** if you need UX feedback

---

## HANDOFF COMPLETE

**What You Have:**
✅ Complete screen specifications (12 screens)
✅ Component library (buttons, cards, modals, forms)
✅ Color system (Tailwind config)
✅ Typography scale
✅ Spacing system
✅ Interaction patterns
✅ Copy & content for all screens
✅ Error handling
✅ Responsive behavior
✅ Accessibility guidelines

**What You Don't Need:**
❌ Figma mockups (specs are sufficient)
❌ Pixel-perfect designs
❌ Custom illustrations
❌ Complex animations

**Start Building:**
- These specs are production-ready
- Make judgment calls on edge cases
- Tag me for blocking UX decisions
- Trust your instincts

**Let's ship Vantage in 8-10 days.** 🚀

-- Jeff (Product Director)
*2026-02-07 21:20 UTC*
