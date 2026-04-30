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

---

## High Priority
1. Trying to open widget immediately after installing the app causes 
a db storage malfunction error when adding additional entries again
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

2. The note input box does not bring up keyboard properly.
```
Flow:
1. Tap on add transaction + button
2. tap on notes box
-> Nothing comes up
3. Repeatedly tap it in quick succession
4. The kayboard appears for a split second before disappearing
```

3. No way to recover deleted categories. eg. if i delete a used category,
it will be archived, and adding a new one with the same name will not bring it back,
instead it will throw error saying that category already exists.

Fix: When users add back the same category, simply unarchive it.
## Medium Priority
1. Budgets title in budget screen appears twice
2. Active Category title in category is misleading
3. Date picker tap to change is too verbose, change to calendar icon
4. transaction form amount should be in $xx.xx format, to 2 dp instead of plain number
5. transaction form instructions misleading, change to "+/- to toggle between expense and income"
6. Tapping on widget while app is open in background also opens the app.
Intended is to open the widget no matter what
7. 
## Low Priority
1. Exporting files when folder already has a file of the same name
from an external source causes a enoent error instead of file duplicate error
2. transaction form amount input does not allow copy paste
3. App icon ugly, name is boring