# Refresh Coordination Fixes — Query Burst + Maximum Update Depth

Date: 2026-05-16

## Issue #2: Too Many Simultaneous Refresh/Query Calls

### The Problem
Multiple screens were triggering overlapping refreshes from different sources at the same time:

- manual header refresh
- `AppRefresh` global event
- `useFocusEffect`
- app resume / widget events

This created query bursts and duplicated loads, especially in Transactions where `AppRefresh` was subscribed twice.

### Root Cause
Refresh entrypoints were spread across effects and callbacks without in-flight coordination. The same logical refresh could run in parallel, and one event could trigger multiple immediate loads.

---

### What Is the Fix
Files changed:

- `src/hooks/useRefreshCoordinator.ts`
- `src/screens/Transactions/TransactionListScreen.tsx`
- `src/screens/Dashboard/DashboardScreen.tsx`
- `src/screens/Budgets/BudgetListScreen.tsx`

### Implementation
1. Introduced `useRefreshCoordinator` to centralize refresh behavior per screen.

2. Added a single guarded refresh entrypoint:
   - `requestRefresh(source)`
   - supports sources: `manual`, `global_event`, `focus`, `resume`, `widget_event`

3. Added refresh control behavior:
   - one in-flight refresh at a time
   - if triggers arrive while in-flight, queue one follow-up run
   - debounce bursty non-manual triggers

4. Refactored affected screens to route all refresh triggers through `requestRefresh(...)`.

5. Removed duplicate listener behavior in Transactions (kept one `AppRefresh` subscription path).

---

### Why This Is Better Than Before
### Before
- Refresh logic was fragmented and duplicated.
- Parallel refreshes could fire for one user action/event.
- Higher DB/query pressure and unstable UI update timing.

### After
- Each screen has one coordinated refresh path.
- Overlapping triggers are coalesced instead of running concurrently.
- Duplicate listener effects are reduced, preventing burst loads.
- Better performance stability during tab switching, edits, and resume.

---

## Follow-up: Maximum Update Depth Exceeded

### The Problem
After launch and tab navigation, the app threw:

- `Maximum update depth exceeded`

This happened because refresh effects depended on `requestRefresh`, and `requestRefresh` was being recreated every render.

### Root Cause
In `useRefreshCoordinator`, internal `execute` depended on inline callbacks from screens:

- `onBeforeStart`
- `onComplete`
- `onError`

Those callback identities changed each render. That changed `execute`, then `requestRefresh`, then effects/listeners depending on it re-ran repeatedly and triggered a render loop.

---

### What Is the Fix
File changed:

- `src/hooks/useRefreshCoordinator.ts`

### Implementation
1. Store option callbacks in refs:
   - `onBeforeStartRef`
   - `onCompleteRef`
   - `onErrorRef`

2. Sync refs with `useEffect` when options change.

3. Make `execute` depend only on stable dependencies (`runLoad`) and call handlers via refs:
   - `onBeforeStartRef.current?.()`
   - `onCompleteRef.current?.()`
   - `onErrorRef.current?.(error, source)`

Result: `requestRefresh` stays stable across normal rerenders.

---

### Why This Is Better Than Before
### Before
- Callback identity churn propagated into `requestRefresh`.
- Effects depending on it retriggered continuously.
- Risk of render loops and frequent listener re-registration.

### After
- Stable `requestRefresh` identity in normal rerenders.
- Effects/listeners stop re-firing due to callback identity noise.
- Retains coordination benefits (single in-flight, queue, debounce) without loop risk.

---

## Expected Behavior
- No query burst from overlapping refresh triggers.
- No `Maximum update depth exceeded` during launch/tab navigation.
- Refresh remains responsive and coordinated across affected screens.
