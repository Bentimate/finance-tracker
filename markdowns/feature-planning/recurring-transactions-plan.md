Future: Budget Integration

Later, recurring transactions become very useful.

You can forecast future months.

Example:

Expected Income:
$4000

Expected Expenses:
$2500

Projected Savings:
$1500

This is one of the biggest benefits of having recurring data.


Future: Add a set recurring feature to current transactions

Recurring Transactions Feature Plan
Summary
Build recurring transactions as editable templates that generate ordinary transaction rows on app launch. Generated transactions remain normal historical records, so editing a recurrence only affects future generated transactions.
Backend Plan
Add migration v4 in migrations.ts.
Create recurring_transactions table:
sql



id INTEGER PRIMARY KEY AUTOINCREMENT
amount REAL NOT NULL CHECK (amount > 0)
type TEXT NOT NULL CHECK (type IN ('income', 'expense'))
category_id INTEGER NOT NULL REFERENCES categories(id)
note TEXT
frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly'))
interval_value INTEGER
next_occurrence TEXT NOT NULL
is_active INTEGER NOT NULL DEFAULT 1
created_at TEXT NOT NULL
updated_at TEXT NOT NULL
deleted_at TEXT

Use interval_value as:NULL for daily
0-6 for weekly, matching JS Date.getDay()
1-31 for monthly day of month
MMDD integer for yearly date, e.g. 101 for Jan 1 or 1231 for Dec 31

Add nullable generated-source fields to transactions:
sql



recurring_transaction_id INTEGER
recurring_occurrence_date TEXT

Add unique index on (recurring_transaction_id, recurring_occurrence_date) where recurring_transaction_id IS NOT NULL to prevent duplicate generation.
Add RecurringTransaction types in types.ts.
Add recurringTransactionRepository with CRUD, getDue(now), and atomic generateDueTransactions(now).
Add RecurrenceDateService class for calculating next occurrence, reusing pay-cycle-style month day clamping for monthly/yearly invalid dates.
Generation loop:For each active template where next_occurrence <= now, insert one transaction for each due occurrence up to app-open time.
After each insert, advance next_occurrence.
Wrap each template’s generation in a transaction.
Never leave next_occurrence in the past after generation completes.

Call generation after database.init() resolves in index.js, before setting app ready.
UI Plan
Add a mirrored FAB on TransactionListScreen.tsx, opposite the existing add-transaction plus button.
The new button opens a recurring transactions bottom sheet using existing BottomSheet, capped at 50% screen height.
Bottom sheet contains:Header: Recurring Transactions
Header plus button to add recurrence
Dense list of recurrence templates with amount, category, frequency, and next occurrence
Tap row to edit recurrence

Add RecurringTransactionFormScreen, reusing the current transaction form sections:Amount
Category picker
Note
Start/next occurrence date
New FrequencySection

Frequency selection uses four tabs:Daily: no extra input
Weekly: dropdown/select day of week
Monthly: numeric input for day 1-31
Yearly: existing date picker/calendar UI

Keep styles separated into dedicated .styles.ts files and use theme.ts tokens only.
Behavior Rules
Past generated transactions are never updated when a recurrence template changes.
Editing a recurrence updates only the template and recalculates future next_occurrence.
Deleting a recurrence soft-deletes/deactivates the template only; generated transactions remain.
If next_occurrence is today, generate immediately on app launch.
If next_occurrence is future, generate nothing.
Generated rows behave like normal transactions in lists, dashboard, budgets, exports, and charts.
Test Plan
Migration creates table, columns, and unique index without data loss.
Daily, weekly, monthly, and yearly rules generate correct due transactions.
Monthly/yearly dates clamp safely for short months and leap-year edge cases.
App launch generation catches up multiple missed occurrences.
Duplicate app launches do not duplicate generated transactions.
Editing a rule leaves previous generated transactions unchanged.
Soft-deleting recurrence stops future generation.
UI can list, add, edit, and delete recurrence templates using existing transaction form behavior.