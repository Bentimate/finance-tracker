## Resolved Bugs

### 1. Database Race Condition & Data Persistence (High Priority #1)
**Issue:** 
- The Widget could open the database before the App finished migrations, creating a malformed file.
- New data (e.g. Category B) was invisible to the Widget and disappeared on App restart.
- Launching the Widget would pull the background App to the foreground.

**Root Cause:**
1. **Lack of Checkpointing**: `op-sqlite` was holding data in a temporary Write-Ahead Log (WAL) file. The Widget (a separate process) cannot reliably see this data until it is "checkpointed" (merged) into the main `.db` file. If the app process was killed before an OS checkpoint, data was lost.
2. **Task Affinity**: The Widget Activity joined the App's back-stack task by default, causing Android to bring the entire App forward.
3. **Async Drift**: JS transactions using `async` callbacks would commit before the internal queries actually finished, leading to "ghost" writes.

**Fix:**
1. **Manual WAL Checkpointing**: Added `PRAGMA wal_checkpoint(TRUNCATE)` after every write.
   ```typescript
   export async function checkpoint() {
     await _db.execute('PRAGMA wal_checkpoint(TRUNCATE)');
   }
   // Used in repository:
   await db.execute('COMMIT');
   await checkpoint();
   ```
2. **Immediate Transactions**: Switched to `BEGIN IMMEDIATE` to prevent multi-process deadlocks.
3. **Sentinel File**: Created `.db_initialized` after JS migrations to block Widget access during setup.
4. **Task Isolation**: Set `taskAffinity=""` and `FLAG_ACTIVITY_MULTIPLE_TASK` for the Widget.

### 2. Category Recovery (High Priority #3)
**Issue:** Adding a new category with the same name as a deleted (archived) one would throw a "already exists" error, preventing recovery.
**Fix:** Updated `createCategory` to detect archived categories with the same name and unarchive them (updating color and name casing) instead of throwing an error.

### 3. UI Fixes (Medium Priority #1-5)
**Issues:**
- Double "Budgets" title on Budget screen.
- Misleading "Active Categories" title on Category screen.
- Date picker label was too verbose.
- Transaction amount was plain number instead of currency format.
- Transaction form instructions were misleading.

**Fixes:**
- Removed redundant "Budgets" title from `BudgetListScreen`.
- Removed misleading "Active Categories" header from `CategoryListScreen`.
- Replaced "Tap to change" date picker text with a calendar emoji 📅.
- Implemented `formatDisplayAmount` in `TransactionFormScreen` to show currency-formatted input (e.g., S$1,234.56).
- Updated transaction form instructions to "press +/- to toggle between expense and income".

### 4. Samsung/Android 14 Widget Launch (High Priority #1)
**Issue:** Tapping the widget while the app is in the background would bring the entire app task to the foreground on Samsung OneUI (Android 14+).
**Fix:** Explicitly opted into `MODE_BACKGROUND_ACTIVITY_START_ALLOWED` for the widget's `PendingIntent` to satisfy Android 14+ Background Activity Launch (BAL) restrictions.

---

## High Priority
1. Trying to open widget immediately after installing the app causes 
a db storage malfunction error when adding additional entries again [DONE]
```
Flow:
prereq: app is installed
1. open app, create category called A
2. without terminating app, exit and use widget
-> widget sees A
3. go back to app, create category called B
4. without terminating app, exit and use widget
-> widget does NOT see B
5. terminate app and restart app
-> category B is gone from the app

Intended behaviour:
at any point in time, the flow should behave like steps 1 to step 2.
```

2. The note input box does not bring up keyboard properly. [DONE]
```
Flow:
1. Tap on add transaction + button
2. tap on notes box
-> Nothing comes up
3. Repeatedly tap it in quick succession
4. The kayboard appears for a split second before disappearing
```

## Low Priority
1. Exporting files when folder already has a file of the same name
from an external source causes a enoent error instead of file duplicate error
2. transaction form amount input does not allow copy paste
3. App icon ugly, name is boring