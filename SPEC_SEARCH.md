# Screen Spec: Search Results
## /search

**Author:** Jeff, Product Director  
**Date:** February 8, 2026  
**Status:** Ready for Development  

---

## 1. Purpose

The Search Results screen provides global search across all Vantage data—projects, tasks, people, comments, and documents. It's the "find anything" interface that helps PMs quickly locate information without navigating through multiple screens.

**Core Value:** PMs manage hundreds of tasks across multiple projects. Search eliminates the friction of "where did I see that?" by making everything instantly findable.

---

## 2. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| S-1 | PM | Search for tasks by keyword | I can find specific work items quickly |
| S-2 | PM | Search for people | I can find team members and their assignments |
| S-3 | PM | Filter search by type | I can narrow results to what I need |
| S-4 | PM | Filter by project | I can scope search to specific projects |
| S-5 | PM | See recent searches | I can quickly re-run common searches |
| S-6 | PM | Use keyboard shortcuts | I can search without leaving keyboard |
| S-7 | PM | Search across all connected tools | I don't need to search Jira/Monday separately |
| S-8 | PM | See search results in context | I understand where each result comes from |

---

## 3. Entry Points

### 3.1 Header Search Bar
- Click or focus search bar in header
- Keyboard shortcut: `Cmd/Ctrl + K`

### 3.2 Command Palette Mode
When triggered via keyboard, opens as centered modal overlay.

### 3.3 Dedicated Search Page
`/search?q={query}` for shareable search results.

---

## 4. Layout Wireframe

### 4.1 Command Palette (Overlay)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│                                                                                 │
│     ┌───────────────────────────────────────────────────────────────────────┐  │
│     │ 🔍 Search Vantage...                                           [ESC]  │  │
│     ├───────────────────────────────────────────────────────────────────────┤  │
│     │                                                                       │  │
│     │ RECENT SEARCHES                                                       │  │
│     │ ┌───────────────────────────────────────────────────────────────────┐ │  │
│     │ │ 🕒 auth service blocked                                           │ │  │
│     │ │ 🕒 payments api                                                   │ │  │
│     │ │ 🕒 jake martinez                                                  │ │  │
│     │ └───────────────────────────────────────────────────────────────────┘ │  │
│     │                                                                       │  │
│     │ QUICK ACTIONS                                                         │  │
│     │ ┌───────────────────────────────────────────────────────────────────┐ │  │
│     │ │ → Go to Command Center                                  ⌘ + D     │ │  │
│     │ │ → Go to Projects                                        ⌘ + P     │ │  │
│     │ │ → Open Scout                                            ⌘ + S     │ │  │
│     │ │ → Create new task                                       ⌘ + N     │ │  │
│     │ └───────────────────────────────────────────────────────────────────┘ │  │
│     │                                                                       │  │
│     │ ────────────────────────────────────────────────────────────────────  │  │
│     │ ↑↓ Navigate   ↵ Select   ⌘K Toggle   ESC Close                       │  │
│     └───────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Command Palette with Results

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│     ┌───────────────────────────────────────────────────────────────────────┐  │
│     │ 🔍 auth service                                        [X] [ESC]      │  │
│     ├───────────────────────────────────────────────────────────────────────┤  │
│     │                                                                       │  │
│     │ TASKS (4)                                         [View all tasks →]  │  │
│     │ ┌───────────────────────────────────────────────────────────────────┐ │  │
│     │ │ ▸ AUTH-123 Auth Service Refactor                                  │ │  │
│     │ │   Payments Portfolio · Blocked · Jake Martinez                    │ │  │
│     │ ├───────────────────────────────────────────────────────────────────┤ │  │
│     │ │   AUTH-124 Auth Service Testing                                   │ │  │
│     │ │   Payments Portfolio · In Progress · Sarah Chen                   │ │  │
│     │ ├───────────────────────────────────────────────────────────────────┤ │  │
│     │ │   AUTH-125 Auth Service Documentation                             │ │  │
│     │ │   Payments Portfolio · To Do · Unassigned                         │ │  │
│     │ └───────────────────────────────────────────────────────────────────┘ │  │
│     │                                                                       │  │
│     │ PROJECTS (1)                                                          │  │
│     │ ┌───────────────────────────────────────────────────────────────────┐ │  │
│     │ │   Auth Service Migration                                          │ │  │
│     │ │   API Platform · Health: 72                                       │ │  │
│     │ └───────────────────────────────────────────────────────────────────┘ │  │
│     │                                                                       │  │
│     │ PEOPLE (1)                                                            │  │
│     │ ┌───────────────────────────────────────────────────────────────────┐ │  │
│     │ │   [Av] Jake Martinez (working on Auth Service)                    │ │  │
│     │ │   API Team · 12 active tasks                                      │ │  │
│     │ └───────────────────────────────────────────────────────────────────┘ │  │
│     │                                                                       │  │
│     │ ────────────────────────────────────────────────────────────────────  │  │
│     │ ↵ Open   ⌘↵ Open in new tab   Tab Filter type   ESC Close            │  │
│     └───────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Full Search Page (/search)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [Header]                                                                        │
├─────────┬───────────────────────────────────────────────────────────────────────┤
│         │                                                                       │
│ Sidebar │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ 🔍 [auth service                                           X]  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ 47 results for "auth service"                                   │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ FILTER BY TYPE                                                  │ │
│         │  │ [All (47)] [Tasks (38)] [Projects (3)] [People (4)] [Comments (2)]│
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
│         │  ┌───────────────────────┐                                          │
│         │  │ REFINE                │                                          │
│         │  │                       │                                          │
│         │  │ Project               │                                          │
│         │  │ [All Projects ▼]      │                                          │
│         │  │                       │                                          │
│         │  │ Status                │                                          │
│         │  │ ☐ To Do              │                                          │
│         │  │ ☐ In Progress        │                                          │
│         │  │ ☐ Blocked            │                                          │
│         │  │ ☐ Done               │                                          │
│         │  │                       │                                          │
│         │  │ Source                │                                          │
│         │  │ ☐ Jira               │                                          │
│         │  │ ☐ Monday             │                                          │
│         │  │ ☐ Asana              │                                          │
│         │  │                       │                                          │
│         │  │ Date Range            │                                          │
│         │  │ [Any time ▼]          │                                          │
│         │  │                       │                                          │
│         │  │ [Clear filters]       │                                          │
│         │  └───────────────────────┘                                          │
│         │                                                                       │
│         │  ┌─────────────────────────────────────────────────────────────────┐ │
│         │  │ TASKS (38)                                     Sort: Relevance ▼│ │
│         │  │                                                                  │ │
│         │  │ ┌────────────────────────────────────────────────────────────┐  │ │
│         │  │ │ AUTH-123 <Auth Service> Refactor                          │  │ │
│         │  │ │ Payments Portfolio · Blocked · Jake Martinez              │  │ │
│         │  │ │ ...refactoring the <auth service> to support...           │  │ │
│         │  │ │ [Jira] Updated 2 hours ago                                │  │ │
│         │  │ └────────────────────────────────────────────────────────────┘  │ │
│         │  │                                                                  │ │
│         │  │ ┌────────────────────────────────────────────────────────────┐  │ │
│         │  │ │ AUTH-124 <Auth Service> Testing                           │  │ │
│         │  │ │ Payments Portfolio · In Progress · Sarah Chen             │  │ │
│         │  │ │ ...write integration tests for <auth service>...          │  │ │
│         │  │ │ [Jira] Updated 5 hours ago                                │  │ │
│         │  │ └────────────────────────────────────────────────────────────┘  │ │
│         │  │                                                                  │ │
│         │  │ [Show 36 more tasks...]                                          │ │
│         │  │                                                                  │ │
│         │  └─────────────────────────────────────────────────────────────────┘ │
│         │                                                                       │
└─────────┴───────────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Breakdown

### 5.1 Command Palette Container

```tsx
<div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50">
  <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
    <CommandPaletteContent />
  </div>
</div>
```

**Styling:**
- Backdrop: `bg-black/50` (semi-transparent)
- Modal: `max-w-2xl bg-white rounded-xl shadow-2xl`
- Position: `pt-[20vh]` (20% from top, like Spotlight)

### 5.2 Search Input

```tsx
<div className="flex items-center px-4 py-3 border-b border-neutral-100">
  <Search className="w-5 h-5 text-neutral-400 mr-3" />
  <input
    type="text"
    placeholder="Search Vantage..."
    className="flex-1 text-lg outline-none placeholder:text-neutral-400"
    autoFocus
  />
  {query && (
    <button onClick={clearSearch} className="p-1 hover:bg-neutral-100 rounded">
      <X className="w-4 h-4 text-neutral-400" />
    </button>
  )}
  <kbd className="ml-3 px-2 py-1 text-xs text-neutral-400 bg-neutral-100 rounded">ESC</kbd>
</div>
```

### 5.3 Search Result Item

**Task Result:**
```tsx
<div className="flex items-start gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer">
  <div className="mt-1">
    <StatusDot status={task.status} />
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2">
      <span className="text-xs text-neutral-400 font-mono">{task.key}</span>
      <h4 className="text-sm font-medium text-neutral-900 truncate">
        <HighlightMatch text={task.title} query={query} />
      </h4>
    </div>
    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
      <span>{task.projectName}</span>
      <span>·</span>
      <span>{task.status}</span>
      <span>·</span>
      <span>{task.assignee || 'Unassigned'}</span>
    </div>
    {task.snippet && (
      <p className="mt-1 text-xs text-neutral-400 line-clamp-1">
        <HighlightMatch text={task.snippet} query={query} />
      </p>
    )}
  </div>
  <SourceBadge source={task.source} />
</div>
```

**Project Result:**
```tsx
<div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer">
  <FolderKanban className="w-5 h-5 text-neutral-400" />
  <div className="flex-1 min-w-0">
    <h4 className="text-sm font-medium text-neutral-900 truncate">
      <HighlightMatch text={project.name} query={query} />
    </h4>
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <span>Health: {project.healthScore}</span>
      <span>·</span>
      <span>{project.taskCount} tasks</span>
    </div>
  </div>
  <HealthBadge score={project.healthScore} />
</div>
```

**Person Result:**
```tsx
<div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer">
  <Avatar src={person.avatar} name={person.name} size="sm" />
  <div className="flex-1 min-w-0">
    <h4 className="text-sm font-medium text-neutral-900 truncate">
      <HighlightMatch text={person.name} query={query} />
    </h4>
    <div className="text-xs text-neutral-500">
      {person.team} · {person.activeTasks} active tasks
    </div>
  </div>
  <WorkloadIndicator percentage={person.workload} />
</div>
```

### 5.4 Result Category Header

```tsx
<div className="flex items-center justify-between px-4 py-2 bg-neutral-50">
  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
    {category} ({count})
  </span>
  {hasMore && (
    <button className="text-xs text-primary-600 hover:text-primary-700">
      View all {category.toLowerCase()} →
    </button>
  )}
</div>
```

### 5.5 Highlight Match Component

```tsx
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const parts = text.split(new RegExp(`(${escapeRegex(query)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-warning-100 text-warning-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}
```

### 5.6 Filter Sidebar (Full Page)

```tsx
<aside className="w-64 flex-shrink-0 space-y-6">
  <div>
    <h3 className="text-sm font-medium text-neutral-900 mb-2">Project</h3>
    <Select
      options={projects}
      value={selectedProject}
      onChange={setSelectedProject}
      placeholder="All Projects"
    />
  </div>
  
  <div>
    <h3 className="text-sm font-medium text-neutral-900 mb-2">Status</h3>
    <div className="space-y-2">
      {statuses.map(status => (
        <Checkbox
          key={status}
          label={status}
          checked={selectedStatuses.includes(status)}
          onChange={() => toggleStatus(status)}
        />
      ))}
    </div>
  </div>
  
  <div>
    <h3 className="text-sm font-medium text-neutral-900 mb-2">Source</h3>
    <div className="space-y-2">
      {sources.map(source => (
        <Checkbox
          key={source}
          label={source}
          checked={selectedSources.includes(source)}
          onChange={() => toggleSource(source)}
        />
      ))}
    </div>
  </div>
  
  <button
    className="text-sm text-primary-600 hover:text-primary-700"
    onClick={clearFilters}
  >
    Clear filters
  </button>
</aside>
```

---

## 6. Search Behavior

### 6.1 Search Algorithm

**Ranking Factors:**
1. Exact match in title (highest)
2. Partial match in title
3. Match in description/content
4. Match in comments
5. Recency (more recent = higher)
6. Relevance to user's projects (higher weight)

### 6.2 Search Syntax (Advanced) — **V2**
> Note: V1 supports plain text search only. Structured query syntax (field filters, exclusions) is a V2 feature.

| Syntax | Example | Behavior |
|--------|---------|----------|
| Plain text | `auth service` | Match any word |
| Quoted phrase | `"auth service"` | Match exact phrase |
| Field filter | `status:blocked` | Filter by field |
| Exclusion | `-completed` | Exclude term |
| Project scope | `project:payments` | Limit to project |
| Assignee | `assignee:jake` | Filter by assignee |

### 6.3 Instant Results

- Start showing results after 2+ characters
- Debounce: 150ms after typing stops
- Show loading spinner during fetch
- Cache recent searches for instant repeat

### 6.4 Empty States

**No query entered:**
- Show recent searches
- Show quick actions

**No results found:**
```
┌────────────────────────────────────────────────────────────────┐
│                    [Search icon - 48px]                        │
│                                                                │
│            No results for "xyz query"                          │
│                                                                │
│    Try different keywords or check your filters.               │
│                                                                │
│    Suggestions:                                                │
│    • Remove filters to broaden search                          │
│    • Try searching for task IDs (e.g., "AUTH-123")            │
│    • Ask Scout: "Find tasks related to authentication"         │
│                                                                │
│                       [Ask Scout →]                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Keyboard Navigation

### 7.1 Command Palette Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open/close command palette |
| `↓` or `Tab` | Next result |
| `↑` or `Shift+Tab` | Previous result |
| `Enter` | Open selected result |
| `Cmd/Ctrl + Enter` | Open in new tab |
| `Escape` | Close palette |
| `Cmd/Ctrl + 1-5` | Jump to result type filter |

### 7.2 Full Page Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search input |
| `j` / `k` | Navigate results |
| `Enter` | Open selected |
| `f` | Open filter panel (mobile) |

---

## 8. Interactions & States

### 8.1 Loading State

```tsx
<div className="px-4 py-8 text-center">
  <Spinner className="w-6 h-6 text-primary-500 mx-auto mb-2" />
  <span className="text-sm text-neutral-500">Searching...</span>
</div>
```

### 8.2 Result Hover State

- Background: `hover:bg-neutral-50`
- Keyboard selected: `bg-primary-50 border-l-2 border-l-primary-500`

### 8.3 Recent Searches

Stored locally, max 10 items:
```typescript
interface RecentSearch {
  query: string;
  timestamp: number;
  resultCount: number;
}
```

---

## 9. Data Requirements

### 9.1 API Endpoint

**GET /api/search**
```typescript
// Query params
{
  q: string;              // Search query
  type?: 'task' | 'project' | 'person' | 'comment';
  projectId?: string;
  status?: string[];
  source?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;         // default 20 per type
  offset?: number;
}

// Response
{
  query: string;
  totalCount: number;
  results: {
    tasks: SearchResult<Task>[];
    projects: SearchResult<Project>[];
    people: SearchResult<Person>[];
    comments: SearchResult<Comment>[];
  };
  facets: {
    projects: Array<{ id: string; name: string; count: number }>;
    statuses: Array<{ status: string; count: number }>;
    sources: Array<{ source: string; count: number }>;
  };
  suggestions?: string[];  // "Did you mean..."
}
```

### 9.2 Search Result Type

```typescript
interface SearchResult<T> {
  item: T;
  score: number;
  highlights: {
    field: string;
    snippet: string;
  }[];
}
```

### 9.3 Search Index

Backend should maintain a search index covering:
- Task: id, key, title, description, comments, assignee, status, project
- Project: id, name, description
- Person: id, name, email, team
- Comment: id, content, task reference

---

## 10. Edge Cases

| Case | Handling |
|------|----------|
| Very long query | Truncate display, search full query |
| Special characters | Escape in regex, handle gracefully |
| No search permission | Show only results user can access |
| Result item deleted after search | Gray out with "Item no longer exists" |
| Thousands of results | Paginate, show "Load more" |
| Slow search (>2s) | Show skeleton results, then populate |
| Typos | Suggest corrections ("Did you mean...") |
| Cross-source duplicate items | De-duplicate, show primary source |

---

## 11. Mobile Considerations

### 11.1 Responsive Layout

**Command Palette:**
- Full screen on mobile
- Search input at top, sticky
- Results scroll below

**Full Search Page:**
- Filter sidebar → collapsible drawer
- Filter button in header
- Results full width

### 11.2 Mobile Wireframe

```
┌─────────────────────────────────┐
│ ← Search            [Filter]    │
├─────────────────────────────────┤
│ 🔍 [auth service           X]  │
├─────────────────────────────────┤
│ 47 results · Tasks (38) ▼       │
├─────────────────────────────────┤
│ AUTH-123 Auth Service Refactor  │
│ Payments · Blocked              │
├─────────────────────────────────┤
│ AUTH-124 Auth Service Testing   │
│ Payments · In Progress          │
├─────────────────────────────────┤
│ ...                             │
└─────────────────────────────────┘
```

---

## 12. Accessibility

- Search input has `role="combobox"` with proper aria attributes
- Results list has `role="listbox"` with `role="option"` items
- Keyboard navigation announced by screen readers
- Filter changes announced via aria-live region
- Focus management: focus returns to input after selecting result

---

## 13. Analytics Events

| Event | Properties |
|-------|------------|
| `search_opened` | `source` (header, keyboard, nav) |
| `search_performed` | `query`, `result_count`, `filters` |
| `search_result_clicked` | `query`, `result_type`, `result_position` |
| `search_filter_applied` | `filter_type`, `filter_value` |
| `search_no_results` | `query`, `filters` |
| `search_suggestion_clicked` | `original_query`, `suggestion` |

---

## 14. Performance Considerations

### 14.1 Optimizations

- Debounce search input (150ms)
- Cache recent queries (5 min TTL)
- Limit initial results per category (5)
- Lazy load full results on scroll
- Prefetch on focus for common queries

### 14.2 Backend Recommendations

- **V1:** Postgres full-text search (tsvector + pg_trgm) — zero new infrastructure
- **V2:** Elasticsearch or similar only if Postgres can't handle scale (>100K items)
- Index updates should be near-real-time (< 30s)
- Support stemming and fuzzy matching (pg_trgm handles fuzzy natively)

---

## 15. Open Questions

| # | Question | Decision Needed By | Notes |
|---|----------|-------------------|-------|
| 1 | Search infrastructure: Postgres tsvector confirmed for V1? | Engineering | Decided: Postgres FTS for V1 (see TECHNICAL_DECISIONS.md S1). Elasticsearch only if needed at scale. |
| 2 | Advanced search syntax: deferred to V2? | Product | Decided: V1 plain text only (see S3). |
| 3 | Cross-source deduplication in search results? | Engineering | Deferred to V2 (see S7). |

*Resolved questions documented in TECHNICAL_DECISIONS.md*

---

*Spec complete. Search is the fastest path to any piece of information in Vantage.*
