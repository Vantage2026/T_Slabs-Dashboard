# API Reference

All API routes in the Vantage application.

---

## Overview

API routes live in `src/app/api/`. Currently, only the auth check endpoint is functional — all other routes are stubs prepared for future backend implementation.

**Base URL:** `https://pm-sync.vercel.app/api` (production) or `http://localhost:3000/api` (local)

---

## Working Endpoints

### POST `/api/auth-check`

Verifies the prototype access code and sets an auth cookie.

**Request:**
```json
{
  "password": "vantage2026"
}
```

**Response (200 — Success):**
```json
{
  "ok": true
}
```
Sets `vantage-auth` HTTP-only cookie (7-day expiry, secure in production).

**Response (401 — Invalid):**
```json
{
  "error": "Invalid password"
}
```

**Response (400 — Bad Request):**
```json
{
  "error": "Bad request"
}
```

---

## Auth Endpoints

### ALL `/api/auth/[...nextauth]`

NextAuth.js catch-all route handler. Configured with Prisma adapter.

**Status:** Configured but not wired to a database. Will handle OAuth flows for Jira, Google, etc.

**Future endpoints served:**
- `GET /api/auth/signin` — Sign-in page
- `GET /api/auth/signout` — Sign-out
- `GET /api/auth/session` — Current session
- `POST /api/auth/callback/[provider]` — OAuth callback

---

## Sync Endpoints (Stubs)

### POST `/api/sync/trigger`

Manually trigger a sync with connected PM tools.

**Status:** Stub — returns placeholder response.

**Future behavior:**
- Accepts tool filter (jira, monday, asana, or all)
- Queues sync job via BullMQ
- Returns job ID for polling

**Planned request:**
```json
{
  "tools": ["jira", "monday"],
  "full": false
}
```

**Planned response:**
```json
{
  "jobId": "sync-abc123",
  "status": "queued",
  "tools": ["jira", "monday"]
}
```

---

### GET `/api/sync/status`

Check current sync status.

**Status:** Stub.

**Planned response:**
```json
{
  "lastSync": "2026-02-08T12:00:00Z",
  "status": "idle",
  "tools": {
    "jira": { "status": "synced", "lastSync": "2026-02-08T12:00:00Z", "itemCount": 342 },
    "monday": { "status": "synced", "lastSync": "2026-02-08T11:55:00Z", "itemCount": 128 },
    "asana": { "status": "error", "lastSync": "2026-02-08T10:00:00Z", "error": "Token expired" }
  }
}
```

---

## Conflict Endpoints (Stubs)

### GET `/api/conflicts/list`

List unresolved sync conflicts (when the same item was changed in multiple tools).

**Status:** Stub.

**Planned response:**
```json
{
  "conflicts": [
    {
      "id": "conflict-1",
      "itemId": "task-123",
      "itemTitle": "Auth Service Refactor",
      "field": "status",
      "sources": {
        "jira": { "value": "In Progress", "updatedAt": "2026-02-08T10:00:00Z" },
        "monday": { "value": "Done", "updatedAt": "2026-02-08T10:05:00Z" }
      },
      "detectedAt": "2026-02-08T10:10:00Z"
    }
  ],
  "count": 1
}
```

---

### GET `/api/conflicts/[id]`

Get detail for a specific conflict.

**Status:** Stub.

---

### POST `/api/conflicts/resolve`

Resolve a conflict by choosing a winner or custom value.

**Status:** Stub.

**Planned request:**
```json
{
  "conflictId": "conflict-1",
  "resolution": "jira",
  "propagate": true
}
```

---

## Webhook Endpoints (Stubs)

### POST `/api/webhooks/jira`

Receives Jira webhook events (issue created, updated, deleted, sprint changes).

**Status:** Stub.

**Expected headers:**
- Jira sends `x-atlassian-webhook-identifier` for verification

**Expected payload:** Jira webhook event JSON (varies by event type).

---

### POST `/api/webhooks/monday`

Receives Monday.com webhook events.

**Status:** Stub.

**Expected payload:** Monday.com webhook challenge or event JSON.

**Note:** Monday.com webhooks require a challenge-response handshake on first setup.

---

### POST `/api/webhooks/asana`

Receives Asana webhook events.

**Status:** Stub.

**Expected headers:**
- `x-hook-secret` for handshake verification

**Expected payload:** Asana event JSON.

**Note:** Asana webhooks require an initial handshake where you echo back the `x-hook-secret` header.

---

## Adapter Interfaces

The adapter layer (in `src/lib/adapters/`) defines the interface that each PM tool integration must implement:

```typescript
// src/lib/adapters/base.ts

interface BaseAdapter {
  // Fetch all projects from the source tool
  fetchProjects(): Promise<NormalizedProject[]>;

  // Fetch tasks/issues for a project
  fetchTasks(projectId: string): Promise<NormalizedTask[]>;

  // Handle an incoming webhook event
  handleWebhook(payload: unknown): Promise<SyncEvent>;

  // Push an update back to the source tool
  pushUpdate(itemId: string, changes: Partial<NormalizedTask>): Promise<void>;
}
```

Implementations exist as stubs in:
- `src/lib/adapters/jira.ts`
- `src/lib/adapters/monday.ts`
- `src/lib/adapters/asana.ts`
