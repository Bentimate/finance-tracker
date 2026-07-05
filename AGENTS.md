# Finance Tracker — Project Instructions

A local-first Android finance tracker built with React Native (bare workflow).
No cloud sync. No third-party accounts. User owns their data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Frontend | React Native (bare workflow), Material UI |
| Database | `@op-engineering/op-sqlite` |
| Navigation | Bottom tabs: Dashboard, Transactions, Budgets, Settings |
| Export | CSV written to device local storage |
| Distribution | Sideloaded APK (no Play Store) |

---

## Architecture

Strict four-layer separation. Never skip layers.

```
Presentation Layer      (screens/, components/)
        ↓
State / ViewModel Layer (hooks/, store/)
        ↓
Repository Layer        (repositories/)
        ↓
Database                (SQLite via op-sqlite)
```

- The **database is the single source of truth**. CSV exports are artifacts only — never read back.
- All **visualisation aggregates must be derived dynamically** from transaction records. Never persist computed values.
- All **core features must work fully offline**. No network calls for transaction CRUD, budgets, charts, widget, or export.
- **Avoid direct SQLite access** outside the repository layer.

---

## Coding Conventions

- **React best practices**: separate component files from their stylesheet files.
- **No hardcoded style values** — use shared theme constants (spacing, colours, font sizes).
- **Currency**: display as SGD throughout.
- **Atomic writes**: all DB writes must be atomic. Partial writes must not corrupt data.

---

## Design System

The app aesthetic is "bank statement, not lifestyle app" — functional and trustworthy.

| Token | Value |
|---|---|
| Background | `#f9fafb` |
| Accent / CTA | `#6366f1` (indigo) |
| Surface | White / neutral gray cards, no heavy shadows |
| Typography | Large numbers for amounts; muted labels underneath |
| Decoration | Coloured category dot only — no gradients, no chrome |

- Indigo `#6366f1` is used for CTAs, active states, and progress indicators exclusively.
- Lists are compact and dense — finance apps are scrolled constantly.
- No wasted vertical space.

---

## Data Model

### `categories`
```
id           INTEGER PK AUTOINCREMENT
name         TEXT NOT NULL
color        TEXT NOT NULL DEFAULT '#6366f1'
icon         TEXT (nullable) — MaterialCommunityIcons icon name string
parent_id    INTEGER (nullable) FK → categories(id) — null = root category
is_archived  INTEGER NOT NULL DEFAULT 0
```

**Uniqueness rules (enforced via partial indexes):**
- Root category names: unique among roots (case-insensitive)
- Child category names: unique per parent (case-insensitive)
- Max nesting depth: **2 levels only** (enforced at repository layer)
- The name `"Others"` is **reserved** and must be rejected for child categories

### `transactions`
```
id           INTEGER PK AUTOINCREMENT
amount       REAL NOT NULL CHECK > 0
type         TEXT NOT NULL — 'income' | 'expense'
date         TEXT NOT NULL DEFAULT current timestamp
category_id  INTEGER NOT NULL FK → categories(id)
note         TEXT (nullable)
created_at   TEXT NOT NULL
updated_at   TEXT NOT NULL
deleted_at   TEXT (nullable) — soft delete
```

### `budgets`
```
category_id   INTEGER PK FK → categories(id)
budget_amount REAL NOT NULL CHECK > 0
period        TEXT NOT NULL — 'weekly' | 'monthly'
```
Budget progress is always derived from transaction data — never stored.

---

## Nested Categories — Key Behaviours

These rules govern the nested category system and must be respected everywhere
(repository, forms, visualisations).

**"Others" bucket:** When a parent category has child categories, transactions assigned
directly to the parent (via `category_id = parent.id`) are treated as an implicit
"Others" sub-group in visualisations. This bucket is virtual — it has no DB record.

**First child warning:** When the user adds the very first child to a previously
standalone parent category, show a warning dialog before saving:
> *"Existing transactions assigned directly to [Parent] will appear under 'Others'
> in charts. You can reassign them later."*

**Archiving cascade:** Archiving a parent must cascade to all its children.
Show a confirmation dialog first.

**Reparenting guard:** A category that has children cannot have its own `parent_id`
changed.

---

## Transaction Form — Category Picker

Two-step selection (parent → child):

1. **Step 1:** User picks a parent category.
   - If the parent has **no children**: selection is confirmed immediately.
   - If the parent has **children**: proceed to Step 2.
2. **Step 2:** User picks a child category, or selects "Others" (which saves `category_id = parent.id`).

Display the resolved selection as `Food > Coffee`, or just `Transport` for standalone categories.

---

## Performance Targets

| Operation | Target |
|---|---|
| Save transaction | < 300 ms |
| Transaction list load | < 1 second |
| Visualisation load | < 2 seconds |

---

## Current Progress

### ✅ Phase 1 — Foundation
- Database schema and versioned migrations (`migrations.ts`)
- Repository layer with typed CRUD
- Navigation shell (bottom tabs)

### ✅ Phase 2 — Core Features
- Transaction list (grouped by date) with create / edit / delete
- Category management (list, archive, form) with uniqueness validation
- Budget management (list with progress bars, setup form)
- SGD currency normalisation
- Minimalist UI standardised across all modules

### 🔄 Phase 3 — Visualisations (in progress)
- Cash flow waterfall
- Category expenditure donut chart (with parent category dropdown filter)
- Income vs expense trend bar chart
- Budget progress bars

### ⬜ Phase 3b — Nested Categories (in progress)
See `nested-categories-plan.md` for the full step-by-step breakdown.
- Step 1: DB migration v2 (parent_id, icon column, updated unique indexes)
- Step 2: Updated TypeScript types and repository layer
- Step 3: Icon picker component (MaterialCommunityIcons, curated ~70 icons)
- Step 4: Updated category form (parent selector, icon picker, first-child warning)
- Step 5: Categories screen (accordion nested list view)
- Step 6: Transaction form (two-step category picker, `Parent > Child` display)
- Step 7: Regression and edge-case testing

### ⬜ Phase 4 — Export + Widget
- CSV export to local storage (`transactions.csv`, `categories.csv`)
- Android home-screen widget (`AppWidgetProvider`) — amount + category entry in ≤ 3 interactions


# Instructions
- Act as a senior Typescript developer who writes production-ready and clean code, following OOP paradigms.
- Prefer OOP programming paradigms where appropriate.
- Keep in mind the global theme.ts
- Do not use magic values
- ALWAYS separate styles from components ie. create all relevant styles in a separate stylesheet and inject them into the component when needed.
- break down big components into smaller individual components

---

## Common Pitfalls & Navigation Patterns

### Preventing Navigation "Flashes"
When a screen's state is driven by both **Route Parameters** (e.g., from a 'Manage' screen) and **Local/Global State** (e.g., a picker or User Preferences), always "consume" the route parameter once and then clear it.

**Problem:** Changing an account via a local picker would update the state, but a `useEffect` watching `route.params` would see the old parameter and immediately revert the state, causing a visual flash.

**Solution:**
```typescript
useEffect(() => {
  if (route.params?.accountId !== undefined) {
    // 1. Apply the parameter to state/preferences
    setSelectedAccountId(route.params.accountId);
    
    // 2. IMMEDIATELY clear the parameter to prevent revert-loops
    navigation.setParams({ accountId: undefined } as any);
    return;
  }
}, [route.params?.accountId]);
```
