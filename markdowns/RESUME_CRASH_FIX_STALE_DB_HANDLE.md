# Resume Crash Fix — Stale SQLite Handle Recovery

Date: 2026-05-16

## Context
A crash was observed when reopening the app after it stayed in the background for a while. The likely failure path was a stale/invalid native SQLite handle after Android lifecycle pressure, followed by immediate repository queries on resume.

## Summary of Changes
Implemented a defensive DB lifecycle and query retry strategy to make app resume resilient:

1. Added database lifecycle state management and recovery.
2. Added centralized repository query wrapper with a one-time retry on stale-handle errors.
3. Added app-resume gating on Dashboard so refresh happens only after DB readiness is confirmed.
4. Added structured logs for diagnostics.

---

## 1) Database Lifecycle Manager
File: `src/database/db.ts`

### Added state model
- `DatabaseState = 'idle' | 'initializing' | 'ready' | 'recovering' | 'failed'`

### Added constants
- `DB_NAME = 'finance_tracker.db'`
- `DB_HEALTHCHECK_SQL = 'SELECT 1 AS ok'`
- PRAGMA constants:
  - `PRAGMA foreign_keys = ON`
  - `PRAGMA journal_mode = DELETE`
  - `PRAGMA busy_timeout = 5000`
  - `PRAGMA synchronous = FULL`

### Added API
- `isReady(): boolean`
- `ensureReady(): Promise<void>`

### Initialization and recovery behavior
- `init()` now:
  - sets state to `initializing`
  - clears sentinel file if present
  - opens DB
  - reapplies PRAGMAs
  - runs migrations
  - writes sentinel file
  - sets state to `ready`
  - logs `DB_INIT_START/OK/FAIL`

- `ensureReady()` now:
  - waits on active `recoveryPromise` if recovery is already in progress
  - initializes if DB is missing/not ready
  - validates handle with `SELECT 1`
  - if validation fails:
    - sets state `recovering`
    - clears stale handle
    - reopens and prepares DB
    - rewrites sentinel
    - validates again
    - sets state `ready`
    - logs `DB_RECOVER_START/OK/FAIL`

### Concurrency control
- `initPromise` ensures single-flight init.
- `recoveryPromise` ensures single-flight recovery.

---

## 2) Repository Query Wrapper with Single Retry
File: `src/repositories/BaseRepository.ts`

### Centralized execute path
- Replaced direct DB execution access with:
  - `protected get db(): Pick<DB, 'execute'>`
  - This getter routes every `execute(...)` call through `runQuery(...)`.

### `runQuery(...)` behavior
- Calls `database.ensureReady()` before query.
- Executes query via `database.instance.execute(...)`.
- On known stale-handle style errors, performs exactly one recovery retry:
  - logs `QUERY_RETRY_ON_STALE_HANDLE`
  - re-runs `database.ensureReady()`
  - retries the original statement once.

### Stale-handle detection
Pattern list checks lowercase error message for signatures such as:
- `database not initialised`
- `database is closed`
- `closed database`
- `cannot operate on a closed database`
- `bad file descriptor`
- `null database`
- `has been closed`
- `no such table: sqlite_master`

### Transaction semantics preserved
- `withTransaction(...)` now uses `runQuery(...)` for `BEGIN IMMEDIATE`, `COMMIT`, and `ROLLBACK`.
- Rollback remains best-effort inside catch; original error is preserved and rethrown.

---

## 3) Resume-Safe Refresh Gate (Dashboard)
File: `src/screens/Dashboard/DashboardScreen.tsx`

### AppState handling change
- On `AppState` transition to `active`:
  - await `database.ensureReady()` first
  - then call `refresh()`
  - log and swallow resume refresh failure to avoid hard failure path

This prevents immediate post-resume data loads from firing against a stale DB handle.

---

## 4) Structured Diagnostic Logs
Added lightweight, non-PII log markers:

- `DB_INIT_START`
- `DB_INIT_OK`
- `DB_INIT_FAIL`
- `DB_RECOVER_START`
- `DB_RECOVER_OK`
- `DB_RECOVER_FAIL`
- `QUERY_RETRY_ON_STALE_HANDLE`

These are intended to make `adb logcat` diagnosis straightforward for lifecycle crashes.

---

## Verification Notes
Automated checks were not run in this environment because npm is broken locally:

- Error: `Cannot find module 'C:\Users\benny\AppData\Roaming\npm\node_modules\npm\bin\npm-cli.js'`

Recommended validation once npm is fixed:
1. `npm run lint`
2. `npm test -- --watch=false`
3. Manual Android lifecycle test:
   - open app, use it, background for 10+ minutes, reopen repeatedly
   - apply memory pressure (switch many apps), reopen
   - verify no immediate close and normal data loading

---

## Notes
- No schema changes were introduced.
- No network dependency was added.
- Existing repository method signatures remain unchanged.
