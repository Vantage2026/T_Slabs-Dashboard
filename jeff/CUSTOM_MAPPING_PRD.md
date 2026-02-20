# Custom Field Mapping PRD — The Integration That Actually Works
**Author:** Jeff, SVP Product  
**Date:** February 11, 2026  
**Version:** 1.0  
**Status:** Ready for Engineering Review  

---

## Executive Summary

**The Problem:** Vantage only works for teams with vanilla Jira. That's ~20% of the market. Every other org has custom status names ("Waiting for Client" instead of "Blocked"), custom date fields (`customfield_10024` instead of `duedate`), and custom workflows. Without flexible mapping, they churn.

**The Solution:** A guided, visual mapping system that makes complex configuration feel effortless. Smart defaults that work out of the box. Override only when needed. Preview before committing. Bidirectional sync that respects the mappings.

**The Standard:** Linear's integration settings simplicity × Notion's visual clarity × Zapier's power. If a non-technical PM can't configure this in under 5 minutes, we've failed.

---

## 1. Design Principles

### 1.1 Smart Defaults First
Every org should work out of the box. We ship with intelligent defaults:
- Auto-detect common Jira status names ("Blocked", "On Hold", "Waiting" → `blocked`)
- Auto-detect common field patterns ("Due Date", "Target Date" → `dueDate`)
- Only show the mapping UI when auto-detection fails or user wants to customize

### 1.2 Human Labels, Not Field IDs
Never show `customfield_10024`. Always show "Target Tech Completion Date". Jira's field metadata API provides display names — use them exclusively.

### 1.3 Progressive Disclosure
- **Level 0:** Auto-detected, works immediately, user sees nothing
- **Level 1:** Quick review of auto-detected mappings (recommended during onboarding)
- **Level 2:** Full mapping editor for power users

### 1.4 Bidirectional by Design
Every mapping is two-way:
- **Read:** "When Jira says 'Waiting for Client', show as 'Blocked' in Vantage"
- **Write:** "When user changes to 'Blocked' in Vantage, transition Jira to 'Waiting for Client'"

### 1.5 Preview Everything
Before saving, show exactly what will happen:
- "3 tasks will change from 'To Do' to 'Blocked'"
- "Due dates for 47 tasks will be updated from 'Due Date' field"

---

## 2. User Journeys

### 2.1 First-Time Connection (Guided Setup)

**Trigger:** User completes Jira OAuth for the first time.

**Flow:**
```
OAuth Success
    ↓
"Configuring your Jira connection..."
    ↓ (2-3 seconds while we fetch field metadata)
Mapping Review Screen
    ↓
"Looking good! Start sync"
    ↓
Dashboard with synced data
```

**Key Insight:** We DON'T show a wizard with 10 steps. We show ONE screen with smart defaults pre-filled, and let them edit only what's wrong.

### 2.2 Ongoing Management

**Trigger:** User navigates to Settings → Connections → [Jira Connection] → Field Mapping

**Flow:**
```
Connection Settings Tab
    ↓
Mapping Editor (full control)
    ↓
Make changes
    ↓
Preview Impact
    ↓
Save & Re-sync
```

### 2.3 Sync Fails Due to Unmapped Value

**Trigger:** Sync encounters a Jira status or field value that has no mapping.

**Flow:**
```
Sync completes with warning
    ↓
Banner: "5 tasks have unmapped statuses"
    ↓
Click → Mapping Editor with problems highlighted
    ↓
Fix mapping
    ↓
Re-sync
```

---

## 3. The Mapping Review Screen (First-Time Setup)

This is the critical screen. It appears after first Jira connection and determines whether the user succeeds or churns.

### 3.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ✓ Connected to Jira                                                 │   │
│  │  Acme Corp · 12 projects · 847 tasks                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  We've configured your sync based on your Jira setup.                      │
│  Review the mappings below, or just hit "Start Sync" to get going.         │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  STATUS MAPPING                                                    [Edit]   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Your Jira statuses           →    Vantage status                   │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  ● To Do, Open, New           →    📋 To Do                         │   │
│  │  ● In Progress, In Dev        →    🔄 In Progress                   │   │
│  │  ● In Review, Code Review     →    👀 In Review                     │   │
│  │  ● Done, Closed, Resolved     →    ✅ Done                          │   │
│  │  ● Blocked, On Hold           →    🚫 Blocked                       │   │
│  │  ─────────────────────────────────────────────────────────────────  │   │
│  │  ⚠️ 2 statuses not mapped: "Waiting for Client", "Parked"           │   │
│  │     [Map these now]                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  FIELD MAPPING                                                     [Edit]   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Due Date        ←→   "Due date" field                    ✓ Found   │   │
│  │  Start Date      ←→   "Start date" field                  ✓ Found   │   │
│  │  Priority        ←→   "Priority" field                    ✓ Found   │   │
│  │  Estimate        ←→   Not mapped                          [Select]  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         [ Start Sync ]                              │   │
│  │                                                                     │   │
│  │  You can always change these later in Settings → Connections        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Component: MappingReviewScreen

```tsx
interface MappingReviewScreenProps {
  connection: {
    id: string;
    source: 'jira' | 'monday' | 'asana';
    orgName: string;
    projectCount: number;
    taskCount: number;
  };
  detectedMappings: {
    statuses: StatusMappingGroup[];
    fields: FieldMapping[];
  };
  unmappedStatuses: string[];
  onConfirm: () => void;
  onEdit: (section: 'status' | 'fields') => void;
}

function MappingReviewScreen({ 
  connection, 
  detectedMappings, 
  unmappedStatuses,
  onConfirm,
  onEdit 
}: MappingReviewScreenProps) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Connection Success Banner */}
      <div className="flex items-center gap-3 p-4 bg-success-50 border border-success-200 rounded-xl mb-6">
        <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
        <div>
          <p className="font-semibold text-neutral-900">Connected to Jira</p>
          <p className="text-sm text-neutral-600">
            {connection.orgName} · {connection.projectCount} projects · {connection.taskCount.toLocaleString()} tasks
          </p>
        </div>
      </div>

      {/* Intro Text */}
      <p className="text-neutral-700 mb-6">
        We've configured your sync based on your Jira setup. 
        Review the mappings below, or just hit "Start Sync" to get going.
      </p>

      {/* Status Mapping Card */}
      <MappingCard
        title="Status Mapping"
        icon={<GitBranch className="w-5 h-5" />}
        onEdit={() => onEdit('status')}
        hasWarning={unmappedStatuses.length > 0}
        warningText={`${unmappedStatuses.length} statuses not mapped: ${unmappedStatuses.slice(0, 2).map(s => `"${s}"`).join(', ')}${unmappedStatuses.length > 2 ? '...' : ''}`}
      >
        <StatusMappingPreview groups={detectedMappings.statuses} />
      </MappingCard>

      {/* Field Mapping Card */}
      <MappingCard
        title="Field Mapping"
        icon={<Columns className="w-5 h-5" />}
        onEdit={() => onEdit('fields')}
      >
        <FieldMappingPreview mappings={detectedMappings.fields} />
      </MappingCard>

      {/* CTA */}
      <div className="mt-8 text-center">
        <button
          onClick={onConfirm}
          className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          Start Sync
        </button>
        <p className="text-sm text-neutral-500 mt-3">
          You can always change these later in Settings → Connections
        </p>
      </div>
    </div>
  );
}
```

### 3.3 Component: MappingCard

```tsx
interface MappingCardProps {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  hasWarning?: boolean;
  warningText?: string;
  children: React.ReactNode;
}

function MappingCard({ title, icon, onEdit, hasWarning, warningText, children }: MappingCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl mb-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-neutral-600">{icon}</span>
          <h3 className="font-semibold text-neutral-900">{title}</h3>
        </div>
        <button
          onClick={onEdit}
          className="text-sm font-medium text-primary hover:text-primary-600 transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>

      {/* Warning (if any) */}
      {hasWarning && warningText && (
        <div className="px-4 py-3 bg-warning-50 border-t border-warning-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm text-neutral-700">{warningText}</span>
          </div>
          <button
            onClick={onEdit}
            className="text-sm font-medium text-warning-600 hover:text-warning-700"
          >
            Map these now
          </button>
        </div>
      )}
    </div>
  );
}
```

### 3.4 Component: StatusMappingPreview

```tsx
interface StatusMappingGroup {
  vantageStatus: VantageStatus;
  jiraStatuses: string[];
}

const VANTAGE_STATUS_DISPLAY: Record<VantageStatus, { icon: string; label: string; color: string }> = {
  backlog: { icon: '📥', label: 'Backlog', color: 'text-neutral-500' },
  todo: { icon: '📋', label: 'To Do', color: 'text-neutral-600' },
  in_progress: { icon: '🔄', label: 'In Progress', color: 'text-blue-600' },
  in_review: { icon: '👀', label: 'In Review', color: 'text-purple-600' },
  done: { icon: '✅', label: 'Done', color: 'text-green-600' },
  blocked: { icon: '🚫', label: 'Blocked', color: 'text-red-600' },
};

function StatusMappingPreview({ groups }: { groups: StatusMappingGroup[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
        <span className="flex-1">Your Jira statuses</span>
        <span className="w-8 text-center">→</span>
        <span className="w-32">Vantage status</span>
      </div>
      
      {groups.filter(g => g.jiraStatuses.length > 0).map((group) => {
        const display = VANTAGE_STATUS_DISPLAY[group.vantageStatus];
        return (
          <div key={group.vantageStatus} className="flex items-center py-2">
            {/* Jira statuses */}
            <div className="flex-1 flex flex-wrap gap-1.5">
              {group.jiraStatuses.map((status) => (
                <span
                  key={status}
                  className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-sm rounded"
                >
                  {status}
                </span>
              ))}
            </div>
            
            {/* Arrow */}
            <span className="w-8 text-center text-neutral-400">→</span>
            
            {/* Vantage status */}
            <div className={`w-32 flex items-center gap-1.5 ${display.color}`}>
              <span>{display.icon}</span>
              <span className="text-sm font-medium">{display.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### 3.5 Component: FieldMappingPreview

```tsx
interface FieldMapping {
  vantageField: string;
  vantageLabel: string;
  jiraField: string | null;
  jiraLabel: string | null;
  status: 'mapped' | 'unmapped' | 'not_found';
}

function FieldMappingPreview({ mappings }: { mappings: FieldMapping[] }) {
  return (
    <div className="space-y-2">
      {mappings.map((mapping) => (
        <div key={mapping.vantageField} className="flex items-center py-2">
          {/* Vantage field */}
          <span className="w-32 text-sm font-medium text-neutral-900">
            {mapping.vantageLabel}
          </span>
          
          {/* Arrow */}
          <span className="w-8 text-center text-neutral-400">←→</span>
          
          {/* Jira field */}
          <div className="flex-1 flex items-center justify-between">
            {mapping.status === 'mapped' ? (
              <>
                <span className="text-sm text-neutral-700">
                  "{mapping.jiraLabel}" field
                </span>
                <span className="flex items-center gap-1 text-success text-xs">
                  <Check className="w-3 h-3" />
                  Found
                </span>
              </>
            ) : (
              <>
                <span className="text-sm text-neutral-400 italic">
                  Not mapped
                </span>
                <button className="text-xs font-medium text-primary hover:text-primary-600">
                  Select
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Status Mapping Editor (Full Control)

### 4.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Connection Settings                                              │
│                                                                             │
│  Status Mapping                                                             │
│  Map your Jira workflow statuses to Vantage statuses                       │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  JIRA STATUSES                          VANTAGE STATUS                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  📥 BACKLOG                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐                             [+ Add]     │   │
│  │  │ Backlog  │  │ Icebox   │                                         │   │
│  │  └──────────┘  └──────────┘                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  📋 TO DO                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               [+ Add]     │   │
│  │  │ To Do    │  │ Open     │  │ New      │                           │   │
│  │  └──────────┘  └──────────┘  └──────────┘                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🔄 IN PROGRESS                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────┐  ┌──────────┐                          [+ Add]     │   │
│  │  │ In Progress │  │ In Dev   │                                      │   │
│  │  └─────────────┘  └──────────┘                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  👀 IN REVIEW                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────┐  ┌─────────────┐                       [+ Add]     │   │
│  │  │ In Review   │  │ Code Review │                                   │   │
│  │  └─────────────┘  └─────────────┘                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ✅ DONE                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               [+ Add]     │   │
│  │  │ Done     │  │ Closed   │  │ Resolved │                           │   │
│  │  └──────────┘  └──────────┘  └──────────┘                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🚫 BLOCKED                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌──────────┐  ┌──────────┐                             [+ Add]     │   │
│  │  │ Blocked  │  │ On Hold  │                                         │   │
│  │  └──────────┘  └──────────┘                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ⚠️ UNMAPPED STATUSES (2)                                                   │
│  These Jira statuses won't sync. Drag them to a Vantage status above.      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ┌────────────────────┐  ┌──────────┐                               │   │
│  │  │ Waiting for Client │  │ Parked   │                               │   │
│  │  └────────────────────┘  └──────────┘                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌────────────────────┐  ┌───────────────────────────────────────────┐     │
│  │  Preview Changes   │  │              Save Mapping                  │     │
│  └────────────────────┘  └───────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Component: StatusMappingEditor

```tsx
interface StatusMappingEditorProps {
  connectionId: string;
  jiraStatuses: JiraStatus[];
  currentMappings: StatusMapping[];
  onSave: (mappings: StatusMapping[]) => Promise<void>;
  onBack: () => void;
}

type VantageStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';

interface JiraStatus {
  id: string;
  name: string;
  category: 'TODO' | 'IN_PROGRESS' | 'DONE';  // Jira's status categories
}

const VANTAGE_STATUSES: { key: VantageStatus; icon: string; label: string; color: string; dropBg: string }[] = [
  { key: 'backlog', icon: '📥', label: 'Backlog', color: 'text-neutral-500', dropBg: 'bg-neutral-100' },
  { key: 'todo', icon: '📋', label: 'To Do', color: 'text-neutral-600', dropBg: 'bg-neutral-100' },
  { key: 'in_progress', icon: '🔄', label: 'In Progress', color: 'text-blue-600', dropBg: 'bg-blue-50' },
  { key: 'in_review', icon: '👀', label: 'In Review', color: 'text-purple-600', dropBg: 'bg-purple-50' },
  { key: 'done', icon: '✅', label: 'Done', color: 'text-green-600', dropBg: 'bg-green-50' },
  { key: 'blocked', icon: '🚫', label: 'Blocked', color: 'text-red-600', dropBg: 'bg-red-50' },
];

function StatusMappingEditor({ 
  connectionId, 
  jiraStatuses, 
  currentMappings, 
  onSave, 
  onBack 
}: StatusMappingEditorProps) {
  const [mappings, setMappings] = useState<Map<string, VantageStatus>>(
    new Map(currentMappings.map(m => [m.jiraStatusName, m.vantageStatus]))
  );
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const getMappedStatuses = (vantageStatus: VantageStatus) => {
    return jiraStatuses.filter(js => mappings.get(js.name) === vantageStatus);
  };

  const unmappedStatuses = jiraStatuses.filter(js => !mappings.has(js.name));

  const handleDrop = (jiraStatusName: string, vantageStatus: VantageStatus) => {
    setMappings(prev => {
      const next = new Map(prev);
      next.set(jiraStatusName, vantageStatus);
      return next;
    });
  };

  const handleRemove = (jiraStatusName: string) => {
    setMappings(prev => {
      const next = new Map(prev);
      next.delete(jiraStatusName);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const mappingsArray = Array.from(mappings.entries()).map(([jira, vantage]) => ({
        jiraStatusName: jira,
        vantageStatus: vantage,
      }));
      await onSave(mappingsArray);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Connection Settings
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Status Mapping</h1>
        <p className="text-neutral-600 mt-1">
          Map your Jira workflow statuses to Vantage statuses. 
          Drag statuses between buckets or click "+ Add" to select.
        </p>
      </div>

      {/* Mapping Buckets */}
      <div className="space-y-4">
        {VANTAGE_STATUSES.map((vs) => (
          <StatusBucket
            key={vs.key}
            vantageStatus={vs}
            mappedStatuses={getMappedStatuses(vs.key)}
            allJiraStatuses={jiraStatuses}
            onAdd={(jiraName) => handleDrop(jiraName, vs.key)}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {/* Unmapped Warning */}
      {unmappedStatuses.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="font-semibold text-neutral-900">
              Unmapped Statuses ({unmappedStatuses.length})
            </span>
          </div>
          <p className="text-sm text-neutral-600 mb-3">
            Tasks with these statuses will sync but appear with an "Unknown" status in Vantage.
            Drag them to a bucket above to map them.
          </p>
          <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
            <div className="flex flex-wrap gap-2">
              {unmappedStatuses.map((js) => (
                <DraggableStatusChip
                  key={js.id}
                  status={js}
                  onDragEnd={(vantageStatus) => handleDrop(js.name, vantageStatus)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-neutral-200">
        <button
          onClick={() => setShowPreview(true)}
          className="px-4 py-2 border border-neutral-300 text-neutral-700 font-medium rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Preview Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Mapping'}
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <MappingPreviewModal
          connectionId={connectionId}
          mappings={mappings}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
```

### 4.3 Component: StatusBucket (Drop Zone)

```tsx
interface StatusBucketProps {
  vantageStatus: {
    key: VantageStatus;
    icon: string;
    label: string;
    color: string;
    dropBg: string;
  };
  mappedStatuses: JiraStatus[];
  allJiraStatuses: JiraStatus[];
  onAdd: (jiraStatusName: string) => void;
  onRemove: (jiraStatusName: string) => void;
}

function StatusBucket({ 
  vantageStatus, 
  mappedStatuses, 
  allJiraStatuses,
  onAdd, 
  onRemove 
}: StatusBucketProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const availableToAdd = allJiraStatuses.filter(
    js => !mappedStatuses.some(ms => ms.id === js.id)
  );

  return (
    <div className="relative">
      {/* Bucket Header */}
      <div className={`flex items-center gap-2 mb-2 ${vantageStatus.color}`}>
        <span className="text-lg">{vantageStatus.icon}</span>
        <span className="font-semibold uppercase text-sm tracking-wide">
          {vantageStatus.label}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        className={`min-h-[56px] p-3 rounded-xl border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary-50' 
            : `border-neutral-200 ${vantageStatus.dropBg}`
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const statusName = e.dataTransfer.getData('text/plain');
          if (statusName) onAdd(statusName);
        }}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {/* Mapped status chips */}
          {mappedStatuses.map((status) => (
            <StatusChip
              key={status.id}
              name={status.name}
              onRemove={() => onRemove(status.name)}
              draggable
            />
          ))}

          {/* Empty state */}
          {mappedStatuses.length === 0 && !isDragOver && (
            <span className="text-sm text-neutral-400 italic">
              Drag statuses here or click + Add
            </span>
          )}

          {/* Add button */}
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-1 px-2 py-1 text-sm text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
      </div>

      {/* Status Picker Dropdown */}
      {showPicker && availableToAdd.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-white border border-neutral-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
          {availableToAdd.map((status) => (
            <button
              key={status.id}
              onClick={() => {
                onAdd(status.name);
                setShowPicker(false);
              }}
              className="w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded-lg"
            >
              {status.name}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showPicker && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowPicker(false)} 
        />
      )}
    </div>
  );
}
```

### 4.4 Component: StatusChip (Draggable)

```tsx
interface StatusChipProps {
  name: string;
  onRemove?: () => void;
  draggable?: boolean;
}

function StatusChip({ name, onRemove, draggable }: StatusChipProps) {
  return (
    <span
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', name);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 ${
        draggable ? 'cursor-grab active:cursor-grabbing' : ''
      } group`}
    >
      {draggable && (
        <GripVertical className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      {name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-neutral-400 hover:text-neutral-600"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
```

---

## 5. Field Mapping Editor

### 5.1 Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Back to Connection Settings                                              │
│                                                                             │
│  Field Mapping                                                              │
│  Connect Jira fields to Vantage fields for accurate data sync              │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  VANTAGE FIELD              JIRA FIELD                      VALUE MAPPING   │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📅 Due Date             [Due date                    ▼]   —        │   │
│  │     Required             ✓ Auto-detected                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📅 Start Date           [Sprint Start Date           ▼]   —        │   │
│  │     Optional             ✓ Auto-detected                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎯 Priority             [Priority                    ▼]   [Edit]   │   │
│  │     Required             ✓ Auto-detected               Values mapped│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⏱️ Estimate             [Story Points               ▼]   —        │   │
│  │     Optional             ✓ Auto-detected                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🏷️ Labels               [Labels                      ▼]   —        │   │
│  │     Optional             ✓ Standard field                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👤 Assignee             [Assignee                    ▼]   —        │   │
│  │     Required             ✓ Standard field                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  ┌────────────────────┐  ┌───────────────────────────────────────────┐     │
│  │  Preview Changes   │  │              Save Mapping                  │     │
│  └────────────────────┘  └───────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Component: FieldMappingEditor

```tsx
interface VantageFieldDef {
  key: string;
  label: string;
  icon: string;
  required: boolean;
  dataType: 'date' | 'number' | 'string' | 'array' | 'user' | 'select';
  needsValueMapping: boolean;  // true for priority, type, etc.
}

const VANTAGE_FIELDS: VantageFieldDef[] = [
  { key: 'dueDate', label: 'Due Date', icon: '📅', required: true, dataType: 'date', needsValueMapping: false },
  { key: 'startDate', label: 'Start Date', icon: '📅', required: false, dataType: 'date', needsValueMapping: false },
  { key: 'priority', label: 'Priority', icon: '🎯', required: true, dataType: 'select', needsValueMapping: true },
  { key: 'estimate', label: 'Estimate', icon: '⏱️', required: false, dataType: 'number', needsValueMapping: false },
  { key: 'labels', label: 'Labels', icon: '🏷️', required: false, dataType: 'array', needsValueMapping: false },
  { key: 'assignee', label: 'Assignee', icon: '👤', required: true, dataType: 'user', needsValueMapping: false },
];

interface JiraField {
  id: string;           // e.g., "customfield_10024" or "duedate"
  name: string;         // Human-readable: "Target Tech Completion Date"
  schema: {
    type: string;       // "date", "number", "string", etc.
    custom?: string;    // Custom field type
  };
}

function FieldMappingEditor({ 
  connectionId, 
  jiraFields, 
  currentMappings, 
  onSave, 
  onBack 
}: FieldMappingEditorProps) {
  const [mappings, setMappings] = useState<Map<string, FieldMappingConfig>>(
    new Map(currentMappings.map(m => [m.vantageField, m]))
  );
  const [showValueEditor, setShowValueEditor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Filter Jira fields by compatible data type
  const getCompatibleFields = (vantageField: VantageFieldDef): JiraField[] => {
    return jiraFields.filter(jf => {
      if (vantageField.dataType === 'date') {
        return jf.schema.type === 'date' || jf.schema.type === 'datetime';
      }
      if (vantageField.dataType === 'number') {
        return jf.schema.type === 'number' || jf.schema.custom?.includes('point');
      }
      if (vantageField.dataType === 'user') {
        return jf.schema.type === 'user';
      }
      if (vantageField.dataType === 'array') {
        return jf.schema.type === 'array';
      }
      if (vantageField.dataType === 'select') {
        return jf.schema.type === 'option' || jf.schema.type === 'priority';
      }
      return true;
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Connection Settings
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Field Mapping</h1>
        <p className="text-neutral-600 mt-1">
          Connect Jira fields to Vantage fields for accurate data sync.
          We've auto-detected common fields — adjust as needed.
        </p>
      </div>

      {/* Field Rows */}
      <div className="space-y-3">
        {VANTAGE_FIELDS.map((vf) => {
          const currentMapping = mappings.get(vf.key);
          const compatibleFields = getCompatibleFields(vf);
          
          return (
            <FieldMappingRow
              key={vf.key}
              vantageField={vf}
              jiraFields={compatibleFields}
              currentMapping={currentMapping}
              onSelect={(jiraFieldId) => {
                const jiraField = jiraFields.find(f => f.id === jiraFieldId);
                setMappings(prev => {
                  const next = new Map(prev);
                  if (jiraFieldId) {
                    next.set(vf.key, {
                      vantageField: vf.key,
                      jiraFieldId,
                      jiraFieldName: jiraField?.name || '',
                      valueMapping: currentMapping?.valueMapping || null,
                    });
                  } else {
                    next.delete(vf.key);
                  }
                  return next;
                });
              }}
              onEditValues={() => setShowValueEditor(vf.key)}
            />
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-neutral-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Mapping'}
        </button>
      </div>

      {/* Value Mapping Editor Modal */}
      {showValueEditor && (
        <ValueMappingModal
          vantageField={showValueEditor}
          jiraFieldId={mappings.get(showValueEditor)?.jiraFieldId || ''}
          currentMapping={mappings.get(showValueEditor)?.valueMapping}
          onSave={(valueMapping) => {
            setMappings(prev => {
              const next = new Map(prev);
              const existing = next.get(showValueEditor);
              if (existing) {
                next.set(showValueEditor, { ...existing, valueMapping });
              }
              return next;
            });
            setShowValueEditor(null);
          }}
          onClose={() => setShowValueEditor(null)}
        />
      )}
    </div>
  );
}
```

### 5.3 Component: FieldMappingRow

```tsx
interface FieldMappingRowProps {
  vantageField: VantageFieldDef;
  jiraFields: JiraField[];
  currentMapping: FieldMappingConfig | undefined;
  onSelect: (jiraFieldId: string | null) => void;
  onEditValues?: () => void;
}

function FieldMappingRow({ 
  vantageField, 
  jiraFields, 
  currentMapping, 
  onSelect,
  onEditValues 
}: FieldMappingRowProps) {
  const isAutoDetected = currentMapping?.autoDetected;
  const hasValueMapping = currentMapping?.valueMapping && Object.keys(currentMapping.valueMapping).length > 0;

  return (
    <div className="p-4 bg-white border border-neutral-200 rounded-xl">
      <div className="flex items-center gap-4">
        {/* Vantage Field */}
        <div className="w-40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{vantageField.icon}</span>
            <span className="font-medium text-neutral-900">{vantageField.label}</span>
          </div>
          <span className={`text-xs ${vantageField.required ? 'text-warning-600' : 'text-neutral-400'}`}>
            {vantageField.required ? 'Required' : 'Optional'}
          </span>
        </div>

        {/* Jira Field Select */}
        <div className="flex-1">
          <select
            value={currentMapping?.jiraFieldId || ''}
            onChange={(e) => onSelect(e.target.value || null)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">— Not mapped —</option>
            {jiraFields.map((jf) => (
              <option key={jf.id} value={jf.id}>
                {jf.name}
              </option>
            ))}
          </select>
          
          {/* Auto-detected indicator */}
          {currentMapping && (
            <div className="flex items-center gap-1 mt-1">
              <Check className="w-3 h-3 text-success" />
              <span className="text-xs text-success">
                {isAutoDetected ? 'Auto-detected' : 'Standard field'}
              </span>
            </div>
          )}
        </div>

        {/* Value Mapping Button (for select fields like priority) */}
        <div className="w-24 text-right">
          {vantageField.needsValueMapping && currentMapping?.jiraFieldId ? (
            <button
              onClick={onEditValues}
              className="text-sm font-medium text-primary hover:text-primary-600"
            >
              {hasValueMapping ? 'Edit values' : 'Map values'}
            </button>
          ) : (
            <span className="text-sm text-neutral-400">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 5.4 Component: ValueMappingModal (for Priority, etc.)

```tsx
interface ValueMappingModalProps {
  vantageField: string;  // e.g., 'priority'
  jiraFieldId: string;
  currentMapping: Record<string, string> | null;
  onSave: (mapping: Record<string, string>) => void;
  onClose: () => void;
}

const VANTAGE_PRIORITIES = ['critical', 'high', 'medium', 'low', 'none'];

function ValueMappingModal({ 
  vantageField, 
  jiraFieldId, 
  currentMapping, 
  onSave, 
  onClose 
}: ValueMappingModalProps) {
  const [jiraOptions, setJiraOptions] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>(currentMapping || {});
  const [loading, setLoading] = useState(true);

  // Fetch Jira field options
  useEffect(() => {
    fetch(`/api/jira/field-options?fieldId=${jiraFieldId}`)
      .then(res => res.json())
      .then(data => {
        setJiraOptions(data.options || []);
        // Auto-suggest based on names
        if (!currentMapping) {
          const suggested = autoSuggestPriorityMapping(data.options);
          setMapping(suggested);
        }
      })
      .finally(() => setLoading(false));
  }, [jiraFieldId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Map Priority Values
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Connect each Jira priority to a Vantage priority level
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center text-xs font-medium text-neutral-400 uppercase tracking-wider mb-3">
                <span className="flex-1">Jira Priority</span>
                <span className="w-40">Vantage Priority</span>
              </div>
              
              {jiraOptions.map((jiraOpt) => (
                <div key={jiraOpt} className="flex items-center gap-4">
                  <span className="flex-1 text-sm text-neutral-700">{jiraOpt}</span>
                  <select
                    value={mapping[jiraOpt] || ''}
                    onChange={(e) => setMapping(prev => ({ ...prev, [jiraOpt]: e.target.value }))}
                    className="w-40 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-sm"
                  >
                    <option value="">— Select —</option>
                    {VANTAGE_PRIORITIES.map((vp) => (
                      <option key={vp} value={vp}>
                        {vp.charAt(0).toUpperCase() + vp.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 font-medium hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(mapping)}
            className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Save Values
          </button>
        </div>
      </div>
    </div>
  );
}

// Auto-suggest priority mapping based on common patterns
function autoSuggestPriorityMapping(jiraOptions: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  
  const patterns: [RegExp, string][] = [
    [/^(p0|critical|blocker|highest)/i, 'critical'],
    [/^(p1|high|major)/i, 'high'],
    [/^(p2|medium|normal|default)/i, 'medium'],
    [/^(p3|low|minor)/i, 'low'],
    [/^(p4|lowest|trivial|none)/i, 'none'],
  ];
  
  for (const opt of jiraOptions) {
    for (const [regex, vantage] of patterns) {
      if (regex.test(opt)) {
        result[opt] = vantage;
        break;
      }
    }
  }
  
  return result;
}
```

---

## 6. Auto-Detection System

### 6.1 Philosophy

Auto-detection should feel like magic. The user connects Jira, and Vantage "just works" because we're smart about guessing their configuration.

### 6.2 Status Auto-Detection

```typescript
// Auto-detect status mappings based on common Jira status names
const STATUS_PATTERNS: Record<VantageStatus, RegExp[]> = {
  backlog: [
    /^backlog$/i,
    /^icebox$/i,
    /^funnel$/i,
    /^ideas?$/i,
  ],
  todo: [
    /^to\s*do$/i,
    /^open$/i,
    /^new$/i,
    /^not\s*started$/i,
    /^selected\s*for\s*development$/i,
    /^ready$/i,
    /^ready\s*for\s*dev$/i,
  ],
  in_progress: [
    /^in\s*progress$/i,
    /^in\s*dev(elopment)?$/i,
    /^doing$/i,
    /^active$/i,
    /^started$/i,
    /^working$/i,
    /^in\s*flight$/i,
  ],
  in_review: [
    /^(in\s*)?review$/i,
    /^(code\s*)?review$/i,
    /^(in\s*)?qa$/i,
    /^(in\s*)?testing$/i,
    /^ready\s*for\s*(qa|review|test)/i,
    /^peer\s*review$/i,
    /^awaiting\s*review$/i,
  ],
  done: [
    /^done$/i,
    /^closed$/i,
    /^resolved$/i,
    /^complete(d)?$/i,
    /^finished$/i,
    /^released$/i,
    /^shipped$/i,
    /^deployed$/i,
  ],
  blocked: [
    /^blocked$/i,
    /^on\s*hold$/i,
    /^waiting$/i,
    /^impediment$/i,
    /^pending$/i,
    /^paused$/i,
    /^parked$/i,
  ],
};

function autoDetectStatusMappings(jiraStatuses: JiraStatus[]): Map<string, VantageStatus> {
  const result = new Map<string, VantageStatus>();
  
  for (const jiraStatus of jiraStatuses) {
    // First, try pattern matching
    for (const [vantageStatus, patterns] of Object.entries(STATUS_PATTERNS)) {
      if (patterns.some(p => p.test(jiraStatus.name))) {
        result.set(jiraStatus.name, vantageStatus as VantageStatus);
        break;
      }
    }
    
    // If no pattern match, fall back to Jira's status category
    if (!result.has(jiraStatus.name)) {
      switch (jiraStatus.category) {
        case 'TODO':
          result.set(jiraStatus.name, 'todo');
          break;
        case 'IN_PROGRESS':
          result.set(jiraStatus.name, 'in_progress');
          break;
        case 'DONE':
          result.set(jiraStatus.name, 'done');
          break;
      }
    }
  }
  
  return result;
}
```

### 6.3 Field Auto-Detection

```typescript
// Auto-detect field mappings based on common Jira field names
const FIELD_PATTERNS: Record<string, RegExp[]> = {
  dueDate: [
    /^due\s*(date)?$/i,
    /^target\s*date$/i,
    /^deadline$/i,
    /^end\s*date$/i,
    /^target\s*(tech\s*)?(completion|delivery)/i,
    /^expected\s*completion$/i,
  ],
  startDate: [
    /^start\s*date$/i,
    /^sprint\s*start/i,
    /^begin\s*date$/i,
    /^planned\s*start$/i,
  ],
  estimate: [
    /^story\s*points?$/i,
    /^estimate$/i,
    /^effort$/i,
    /^points?$/i,
    /^size$/i,
    /^t-shirt\s*size$/i,
  ],
  priority: [
    /^priority$/i,
  ],
  labels: [
    /^labels?$/i,
    /^tags?$/i,
  ],
  assignee: [
    /^assignee$/i,
    /^assigned\s*to$/i,
    /^owner$/i,
  ],
};

function autoDetectFieldMappings(jiraFields: JiraField[]): Map<string, string> {
  const result = new Map<string, string>();
  
  for (const jiraField of jiraFields) {
    for (const [vantageField, patterns] of Object.entries(FIELD_PATTERNS)) {
      if (patterns.some(p => p.test(jiraField.name))) {
        // Only map if not already mapped (prefer first match)
        if (!result.has(vantageField)) {
          result.set(vantageField, jiraField.id);
        }
        break;
      }
    }
  }
  
  // Also check standard Jira field IDs
  const standardFields: Record<string, string> = {
    duedate: 'dueDate',
    priority: 'priority',
    labels: 'labels',
    assignee: 'assignee',
  };
  
  for (const jiraField of jiraFields) {
    const vantageField = standardFields[jiraField.id];
    if (vantageField && !result.has(vantageField)) {
      result.set(vantageField, jiraField.id);
    }
  }
  
  return result;
}
```

### 6.4 Confidence Scoring

```typescript
interface DetectionResult {
  vantageField: string;
  jiraFieldId: string;
  jiraFieldName: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

function scoreDetection(vantageField: string, jiraField: JiraField): DetectionResult {
  // High confidence: exact match or standard field
  if (jiraField.id === vantageField || jiraField.id === 'duedate' && vantageField === 'dueDate') {
    return {
      vantageField,
      jiraFieldId: jiraField.id,
      jiraFieldName: jiraField.name,
      confidence: 'high',
      reason: 'Standard Jira field',
    };
  }
  
  // High confidence: name matches exactly
  if (jiraField.name.toLowerCase() === vantageField.toLowerCase().replace(/([A-Z])/g, ' $1').trim()) {
    return {
      vantageField,
      jiraFieldId: jiraField.id,
      jiraFieldName: jiraField.name,
      confidence: 'high',
      reason: 'Exact name match',
    };
  }
  
  // Medium confidence: pattern match
  const patterns = FIELD_PATTERNS[vantageField];
  if (patterns?.some(p => p.test(jiraField.name))) {
    return {
      vantageField,
      jiraFieldId: jiraField.id,
      jiraFieldName: jiraField.name,
      confidence: 'medium',
      reason: 'Pattern match',
    };
  }
  
  // Low confidence: data type match only
  return {
    vantageField,
    jiraFieldId: jiraField.id,
    jiraFieldName: jiraField.name,
    confidence: 'low',
    reason: 'Data type compatible',
  };
}
```

---

## 7. Preview & Test System

### 7.1 Preview Modal

Before saving mappings, users can preview the impact:

```tsx
interface MappingPreviewModalProps {
  connectionId: string;
  mappings: Map<string, VantageStatus>;
  onClose: () => void;
}

function MappingPreviewModal({ connectionId, mappings, onClose }: MappingPreviewModalProps) {
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch preview of changes
    fetch('/api/field-mappings/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connectionId, mappings: Object.fromEntries(mappings) }),
    })
      .then(res => res.json())
      .then(setPreview)
      .finally(() => setLoading(false));
  }, [connectionId, mappings]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-neutral-900">
            Preview Changes
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Here's how your data will be affected after applying these mappings
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : preview ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-100 rounded-xl text-center">
                  <div className="text-2xl font-bold text-neutral-900">
                    {preview.totalTasks.toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-500">Total Tasks</div>
                </div>
                <div className="p-4 bg-primary-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-primary">
                    {preview.tasksAffected.toLocaleString()}
                  </div>
                  <div className="text-sm text-primary-600">Will Update</div>
                </div>
                <div className="p-4 bg-warning-50 rounded-xl text-center">
                  <div className="text-2xl font-bold text-warning">
                    {preview.unmappedCount}
                  </div>
                  <div className="text-sm text-warning-600">Still Unmapped</div>
                </div>
              </div>

              {/* Status Change Preview */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Status Changes</h3>
                <div className="space-y-2">
                  {preview.statusChanges.map((change, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neutral-600">{change.count} tasks:</span>
                        <span className="px-2 py-0.5 bg-neutral-200 rounded text-sm">
                          {change.from}
                        </span>
                        <ArrowRight className="w-4 h-4 text-neutral-400" />
                        <span className={`px-2 py-0.5 rounded text-sm ${getStatusBg(change.to)}`}>
                          {change.to}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Tasks */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Sample Tasks</h3>
                <div className="space-y-2">
                  {preview.sampleTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{task.title}</div>
                        <div className="text-xs text-neutral-500">{task.key}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-neutral-100 rounded text-xs">
                          {task.oldStatus}
                        </span>
                        <ArrowRight className="w-3 h-3 text-neutral-400" />
                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusBg(task.newStatus)}`}>
                          {task.newStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              Unable to generate preview
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 8. Bidirectional Write-Back

### 8.1 The Challenge

When a user changes a task's status in Vantage, we need to:
1. Look up which Jira status corresponds to the target Vantage status
2. Find a valid Jira transition from the current status to that target status
3. Execute the transition via Jira's API
4. Handle the case where no direct transition exists

### 8.2 Transition Resolution Algorithm

```typescript
interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
  };
}

async function resolveTransition(
  connectionId: string,
  taskId: string,
  currentJiraStatus: string,
  targetVantageStatus: VantageStatus
): Promise<{ transitionId: string; targetStatus: string } | { error: string }> {
  // 1. Get the status mapping
  const mappings = await getStatusMappings(connectionId);
  
  // 2. Find all Jira statuses that map to the target Vantage status
  const targetJiraStatuses = Array.from(mappings.entries())
    .filter(([_, vs]) => vs === targetVantageStatus)
    .map(([js, _]) => js);
  
  if (targetJiraStatuses.length === 0) {
    return { error: `No Jira status is mapped to "${targetVantageStatus}"` };
  }
  
  // 3. Get available transitions for this task
  const transitions = await jiraApi.getTransitions(taskId);
  
  // 4. Find a transition that leads to one of our target statuses
  for (const targetStatus of targetJiraStatuses) {
    const transition = transitions.find(t => t.to.name === targetStatus);
    if (transition) {
      return { transitionId: transition.id, targetStatus };
    }
  }
  
  // 5. No direct transition found
  return { 
    error: `Cannot transition from "${currentJiraStatus}" to any status mapped to "${targetVantageStatus}". Available transitions: ${transitions.map(t => t.to.name).join(', ')}` 
  };
}
```

### 8.3 Write-Back UI Feedback

When write-back fails, the user needs to understand why:

```tsx
function StatusChangeError({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm p-4 bg-danger-50 border border-danger-200 rounded-xl shadow-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-neutral-900">Couldn't update Jira</p>
          <p className="text-sm text-neutral-600 mt-1">{error}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onDismiss}
              className="text-sm font-medium text-danger hover:text-danger-600"
            >
              Dismiss
            </button>
            <button
              onClick={() => window.open('/settings/connections', '_blank')}
              className="text-sm font-medium text-primary hover:text-primary-600"
            >
              Edit Mappings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 9. Error States & Edge Cases

### 9.1 Unmapped Status Warning

When sync encounters an unmapped Jira status:

```tsx
function UnmappedStatusBanner({ count, onFix }: { count: number; onFix: () => void }) {
  return (
    <div className="px-4 py-3 bg-warning-50 border-b border-warning-200 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <span className="text-sm text-neutral-700">
          <strong>{count} tasks</strong> have unmapped Jira statuses and appear as "Unknown"
        </span>
      </div>
      <button
        onClick={onFix}
        className="text-sm font-medium text-warning-600 hover:text-warning-700"
      >
        Fix mappings →
      </button>
    </div>
  );
}
```

### 9.2 Deleted Mapping Handling

When a mapping is deleted:
- Existing tasks keep their last known Vantage status
- New syncs for tasks with that Jira status will show as "Unknown"
- A warning appears on the settings page

### 9.3 Jira Workflow Changes

When Jira adds/removes statuses:
- On next sync, we detect new unmapped statuses
- Show a notification: "Your Jira workflow changed. 2 new statuses need mapping."
- Link to the mapping editor with new statuses highlighted

### 9.4 Conflict Resolution

When the same task is modified in both Vantage and Jira:
- Last-write-wins by default
- Show a conflict indicator in the UI
- Future: optional conflict resolution modal

---

## 10. Data Model Updates

### 10.1 Extended FieldMapping Schema

```prisma
model FieldMapping {
  id           String   @id @default(cuid())
  connectionId String
  connection   Connection @relation(fields: [connectionId], references: [id], onDelete: Cascade)
  
  // What kind of mapping
  mappingType  MappingType // STATUS | FIELD | PRIORITY_VALUE | etc.
  
  // Source (Jira) side
  sourceField  String   // e.g., "status", "customfield_10024", "priority"
  sourceValue  String?  // e.g., "Waiting for Client" (for status/value mappings)
  sourceLabel  String   // Human-readable, e.g., "Target Tech Completion Date"
  
  // Target (Vantage) side
  targetField  String   // e.g., "status", "dueDate", "priority"
  targetValue  String?  // e.g., "blocked" (for status/value mappings)
  
  // Metadata
  autoDetected Boolean  @default(false)
  confidence   String?  // 'high' | 'medium' | 'low'
  enabled      Boolean  @default(true)
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  @@unique([connectionId, mappingType, sourceField, sourceValue])
  @@index([connectionId, mappingType])
}

enum MappingType {
  STATUS          // Jira status name → Vantage status
  FIELD           // Jira field ID → Vantage field
  PRIORITY_VALUE  // Jira priority name → Vantage priority
  TYPE_VALUE      // Jira issue type → Vantage task type
}
```

### 10.2 API Endpoints

```typescript
// Get all mappings for a connection
GET /api/connections/:id/mappings
Response: { statusMappings: StatusMapping[], fieldMappings: FieldMapping[] }

// Update status mappings
PUT /api/connections/:id/mappings/status
Body: { mappings: { jiraStatus: string, vantageStatus: string }[] }

// Update field mappings
PUT /api/connections/:id/mappings/fields
Body: { mappings: { vantageField: string, jiraFieldId: string, valueMapping?: Record<string, string> }[] }

// Preview mapping changes
POST /api/connections/:id/mappings/preview
Body: { mappings: Record<string, string> }
Response: { totalTasks: number, tasksAffected: number, statusChanges: [...], sampleTasks: [...] }

// Get Jira field metadata
GET /api/connections/:id/jira/fields
Response: { fields: JiraField[] }

// Get Jira status metadata
GET /api/connections/:id/jira/statuses
Response: { statuses: JiraStatus[] }

// Get Jira field options (for select fields)
GET /api/connections/:id/jira/field-options?fieldId=:fieldId
Response: { options: string[] }
```

---

## 11. Navigation & Information Architecture

### 11.1 Settings Navigation Update

```
Settings
├── Profile
├── Workspace
├── Connections        ← Entry point
│   └── [Connection]
│       ├── Overview
│       ├── Status Mapping    ← NEW
│       ├── Field Mapping     ← NEW
│       └── Sync Settings
├── Notifications
└── Appearance
```

### 11.2 Connection Settings Page

```tsx
function ConnectionSettingsPage({ connectionId }: { connectionId: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'status' | 'fields' | 'sync'>('overview');

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Connection Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-[#0052CC] rounded-xl flex items-center justify-center">
          <JiraIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Jira - Acme Corp</h1>
          <p className="text-sm text-neutral-500">Connected 14 days ago · Last sync: 5 minutes ago</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-6">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'status', label: 'Status Mapping' },
          { key: 'fields', label: 'Field Mapping' },
          { key: 'sync', label: 'Sync Settings' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <ConnectionOverview connectionId={connectionId} />}
      {activeTab === 'status' && <StatusMappingEditor connectionId={connectionId} />}
      {activeTab === 'fields' && <FieldMappingEditor connectionId={connectionId} />}
      {activeTab === 'sync' && <SyncSettings connectionId={connectionId} />}
    </div>
  );
}
```

---

## 12. Mobile Responsiveness

### 12.1 Mobile Status Mapping

On mobile, the drag-and-drop bucket layout becomes a stacked list:

```tsx
// Mobile: Stack buckets vertically, full width
// Each bucket expands to show its statuses
// "Add" opens a full-screen picker

function MobileStatusBucket({ vantageStatus, mappedStatuses, onAdd, onRemove }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-neutral-200">
      {/* Header - tap to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <span>{vantageStatus.icon}</span>
          <span className="font-medium text-neutral-900">{vantageStatus.label}</span>
          <span className="text-sm text-neutral-400">({mappedStatuses.length})</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            {mappedStatuses.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-100 rounded-lg text-sm">
                {s.name}
                <button onClick={() => onRemove(s.name)}>
                  <X className="w-3 h-3 text-neutral-400" />
                </button>
              </span>
            ))}
          </div>
          <button
            onClick={onAdd}
            className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-sm text-neutral-500"
          >
            + Add Jira status
          </button>
        </div>
      )}
    </div>
  );
}
```

### 12.2 Mobile Field Mapping

On mobile, field mapping rows stack vertically:

```tsx
function MobileFieldMappingRow({ vantageField, jiraField, onSelect }) {
  return (
    <div className="p-4 border-b border-neutral-200">
      <div className="flex items-center gap-2 mb-2">
        <span>{vantageField.icon}</span>
        <span className="font-medium text-neutral-900">{vantageField.label}</span>
        {vantageField.required && (
          <span className="text-xs text-warning-600">Required</span>
        )}
      </div>
      
      <select
        value={jiraField?.id || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
      >
        <option value="">— Select Jira field —</option>
        {/* ... options */}
      </select>
    </div>
  );
}
```

---

## 13. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first successful sync | < 3 minutes | Instrumentation |
| Mapping setup completion rate | > 90% | Funnel analysis |
| Status mapping accuracy | > 95% correct on first attempt | User feedback |
| Write-back success rate | > 98% | API monitoring |
| Support tickets re: mapping | < 5% of users | Support tracking |
| User satisfaction (mapping UX) | > 4.0 / 5.0 | In-app survey |

---

## 14. Build Priority

### Phase 1: Core Mapping (Week 1-2)
| Priority | Feature | Effort |
|----------|---------|--------|
| P0 | Status mapping editor | 3 days |
| P0 | Auto-detection for status | 1 day |
| P0 | Read-path integration (sync respects mappings) | 2 days |
| P1 | Field mapping editor | 2 days |

### Phase 2: Write-Back (Week 3)
| Priority | Feature | Effort |
|----------|---------|--------|
| P0 | Write-back for status changes | 3 days |
| P1 | Transition resolution algorithm | 1 day |
| P1 | Error handling & UI feedback | 1 day |

### Phase 3: Polish (Week 4)
| Priority | Feature | Effort |
|----------|---------|--------|
| P1 | First-time setup wizard | 2 days |
| P1 | Preview/test system | 2 days |
| P2 | Value mapping (priority, type) | 2 days |
| P2 | Mobile optimization | 1 day |

---

## 15. Open Questions

1. **Multi-project workflows:** Jira allows different workflows per project. Should mappings be per-project or per-connection? (Recommend: per-connection with the ability to override per-project later)

2. **Transition side effects:** Some Jira transitions require additional fields (e.g., resolution). How do we handle these? (Recommend: Detect and prompt user, or skip non-essential fields)

3. **Mapping versioning:** Should we keep history of mapping changes for audit? (Recommend: Yes for enterprise tier, no for starter)

4. **Sync frequency after mapping change:** Should we trigger an immediate re-sync when mappings change? (Recommend: Yes, with option to defer)

---

*This PRD is ready for engineering review. The bar is Linear/Zapier quality. Configuration UX determines adoption — make it effortless.*
