# Setup Instructions

## 1. Install dependencies

From your project root:

```bash
npm install @op-engineering/op-sqlite \
            @react-navigation/native \
            @react-navigation/bottom-tabs \
            react-native-screens
```

`react-native-safe-area-context` is already in your package.json.

## 2. Android native setup

op-sqlite links automatically via autolinking. After installing, rebuild:

```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

## 3. react-native-screens one-liner (required by React Navigation)

In `android/app/src/main/java/<your.package>/MainActivity.kt` (or `.java`),
ensure `onCreate` calls `super.onCreate(null)` — the RN template already does
this; no change needed for bare workflow.

## 4. Copy files into your project

Replace / add the following paths (relative to your project root):

```
App.tsx                                      ← replace existing
src/
  types.ts                                   ← core interfaces
  database/
    db.ts
    migrations.ts
  repositories/
    transactionRepository.ts
    categoryRepository.ts
    budgetRepository.ts
  navigation/
    AppNavigator.tsx
  screens/
    DashboardScreen.tsx
    TransactionsScreen.tsx
    BudgetsScreen.tsx
    SettingsScreen.tsx
```

## 5. Verify it runs

```bash
npx react-native start
# in a second terminal:
npx react-native run-android
```

You should see the four-tab shell with placeholder screens.
The SQLite database is created and migrated on first launch.

---

## What was built

### Database layer (`src/database/`)
| File | Purpose |
|---|---|
| `db.js` | Opens the connection, enables `PRAGMA foreign_keys` and WAL mode, calls migrations |
| `migrations.js` | Versioned schema — add a new entry to `MIGRATIONS[]` to evolve the schema later without wiping data |

### Repository layer (`src/repositories/`)
| File | Public API |
|---|---|
| `transactionRepository.js` | `createTransaction` · `updateTransaction` · `deleteTransaction` (soft) · `getTransactionsByDay/Week/Month` · `getTransactionById` · `getTransactionsForExport` |
| `categoryRepository.js` | `createCategory` · `updateCategory` · `archiveCategory` · `unarchiveCategory` · `hardDeleteCategory` · `getAllCategories` · `getCategoryById` · `categoryHasTransactions` |
| `budgetRepository.js` | `upsertBudget` · `deleteBudget` · `getBudgetByCategory` · `getAllBudgets` · `getBudgetProgress` · `getAllBudgetProgress` |

### Navigation (`src/navigation/`)
Bottom-tab shell with four placeholder screens: Dashboard, Transactions, Budgets, Settings.

### Next steps
- Phase 2: Transaction list + form, Category management, Budget CRUD screens
- Phase 3: Visualizations (donut, waterfall, trend bar, progress bars)
- Phase 4: CSV export + Android home-screen widget
