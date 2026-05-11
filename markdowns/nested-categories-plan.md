# Nested Categories — Implementation Plan

## Overview

This plan covers the full nested categories feature: schema migration, repository layer,
category management UI, and the transaction form two-step category picker.
Visualisation changes (pie chart dropdown) are out of scope here.

Each step is designed to be independently completable and testable before moving on.

---

## Step 1 — Database Migration (v2)

**Goal:** Evolve the schema to support parent-child relationships and icon storage.

### Tasks
- Add migration version 2 to `migrations.ts`
- Recreate the `categories` table via rename → create → copy → drop:
  - Add `parent_id INTEGER REFERENCES categories(id)` (nullable — null = root)
  - Add `icon TEXT` (nullable — stores MaterialCommunityIcons icon name string)
  - Drop the old global `UNIQUE (name COLLATE NOCASE)` constraint
- Create two partial unique indexes to replace it:
  ```sql
  -- Root-level names unique among roots
  CREATE UNIQUE INDEX idx_cat_name_root
    ON categories (name COLLATE NOCASE)
    WHERE parent_id IS NULL;

  -- Child names unique per parent
  CREATE UNIQUE INDEX idx_cat_name_child
    ON categories (name COLLATE NOCASE, parent_id)
    WHERE parent_id IS NOT NULL;
  ```
- Seed the two existing categories (`Food`, `Transport`) with `parent_id = NULL`

### Constraints enforced at the repository layer (not DB)
- Max depth of 2 (parent must have `parent_id = NULL`)
- Child category name `"Others"` is reserved and rejected

### Deliverable
Updated `migrations.ts` with version 2 migration. Existing data is preserved.

---

## Step 2 — Update TypeScript Types and Repository Layer

**Goal:** Update all typed interfaces and CRUD functions to reflect the new schema.

### Tasks
- Update the `Category` type:
  ```ts
  interface Category {
    id: number;
    name: string;
    color: string;
    icon: string | null;
    parentId: number | null;
    isArchived: boolean;
  }
  ```
- Update `CategoryRepository`:
  - `getAll()` — return flat list (existing callers)
  - `getAllNested()` — return `ParentCategory[]` with a `children: Category[]` array,
    injecting a virtual "Others" entry per parent that has children
  - `getChildren(parentId)` — return children of a given parent
  - `create(data)` — validate: parent must be a root; name `"Others"` forbidden for children;
    check uniqueness against the correct scope before insert
  - `update(id, data)` — same validations; prevent reparenting a parent that has children
  - `archive(id)` — if category has children, cascade-archive all children (show warning in UI,
    not here)

### Deliverable
Updated repository file with typed interfaces and all new query methods.

---

## Step 3 — Icon Picker Component

**Goal:** A reusable, self-contained icon picker the category form will use.

### Tasks
- Install `react-native-vector-icons` (if not already present) and import `MaterialCommunityIcons`
- Curate a list of ~70 icons grouped by theme, stored as a constant:
  ```
  Groups: Food & Drink, Transport, Home, Health, Shopping,
          Entertainment, Finance, Work, Family, Other
  ```
- Build `IconPickerModal` component:
  - Triggered by tapping a preview icon button on the category form
  - Renders a scrollable grid of icons grouped by section header
  - Active icon highlighted in indigo (`#6366f1`)
  - Search/filter input at the top (filters across all groups)
  - Returns selected icon name string via `onSelect` callback
- Export from a shared `components/` path for reuse

### Deliverable
`components/IconPickerModal.tsx` + `constants/icons.ts` (curated grouped list).

---

## Step 4 — Update Category Form

**Goal:** Let users set a parent, pick an icon, and handle the "Others" reservation.

### Tasks
- Add **Parent Category** selector to the category creation/edit form:
  - Dropdown showing only root (non-archived) categories
  - Option "None (top-level category)" as default
  - Disabled when editing a category that already has children
- Add **Icon** field — tapping opens `IconPickerModal`; selected icon previewed inline
- Add **First Child Warning** dialog:
  - Triggered when a user adds the very first child to a previously standalone category
  - Message: *"Existing transactions assigned directly to [Parent] will appear under 'Others'
    in charts. You can reassign them later."*
  - Requires explicit confirmation before proceeding
- Reject the name `"Others"` for any child category at the form level with an inline error
- On archive: if category has children, show a confirmation dialog before cascading

### Deliverable
Updated `CategoryForm.tsx` with parent selector, icon picker integration,
and the first-child warning dialog.

---

## Step 5 — Update Categories Screen (Nested List View)

**Goal:** Replace the flat list with a two-level accordion view.

### Tasks
- Refactor the categories screen to consume `getAllNested()` from the repository
- Render parent rows with:
  - Icon (if set) + name + color dot
  - Chevron (collapsed/expanded state)
  - Edit button (separate from the tap-to-expand action)
  - Child count badge
- On tap of parent row: expand/collapse inline to reveal children
- Child rows (indented):
  - Icon + name + color dot
  - Edit button
  - Archive button
- Virtual "Others" row shown only when the parent has children; displayed as
  greyed-out and non-editable (label only, no edit/archive controls)
- Archive action on a parent shows a warning if it has active children before cascading

### Deliverable
Updated `CategoriesScreen.tsx` with accordion list and nested row components.

---

## Step 6 — Update Transaction Form (Two-Step Category Picker)

**Goal:** Replace the single category selector with a two-step parent → child flow.

### Tasks
- Build `CategoryPickerModal` component:
  - **Step 1 — Parent selection:**
    - Shows all non-archived root categories with their icon and color dot
    - Selecting a root with no children: immediately confirms and closes (no step 2)
    - Selecting a root with children: advances to step 2
  - **Step 2 — Child selection:**
    - Header shows `[ParentIcon] Food >` with a back button
    - Lists all non-archived children + an "Others" option at the bottom
    - Selecting a child confirms and closes
    - "Others" maps to the parent's `id` in the saved transaction (not a separate record)
  - Selected value displayed in the form as `Food > Coffee` (or just `Transport` for
    standalone)
- Update transaction create/edit form to use `CategoryPickerModal` in place of the old selector
- Update transaction list rows and detail view to render `Parent > Child` display name
  where applicable using `getAllNested()` lookup

### Deliverable
`components/CategoryPickerModal.tsx` + updated `TransactionForm.tsx` and transaction
list/detail display.

---

## Step 7 — Regression and Edge-Case Testing

**Goal:** Verify all edge cases introduced by the design decisions work correctly.

### Checklist
- [ ] Category name `"Others"` is blocked at both form and repository level for children
- [ ] Root-level "Food" and child-level "Food > Breakfast" can coexist (per-parent uniqueness)
- [ ] Two children under different parents can share the same name
- [ ] Assigning a transaction to a parent-with-children routes correctly via "Others" in the picker
- [ ] Creating the first child of a standalone category shows the warning dialog
- [ ] Archiving a parent cascades to children after confirmation
- [ ] Editing a category that has children cannot have its parent changed
- [ ] Transaction list displays `Parent > Child` correctly after nested category assignment
- [ ] Migration v2 runs cleanly on a device that already has v1 data

---

## Dependency Order

```
Step 1 (Migration)
  └── Step 2 (Repository)
        ├── Step 3 (Icon Picker)        ← no data deps, can be done in parallel
        ├── Step 4 (Category Form)      ← needs Step 3
        ├── Step 5 (Categories Screen)  ← needs Step 4
        └── Step 6 (Transaction Form)   ← needs Step 5
              └── Step 7 (Testing)
```

Steps 1 and 2 must be done first. Step 3 can be built in parallel with Steps 1–2
since it has no data dependencies. Everything else flows sequentially from there.

# Progress
## Changes in steps
The plan's dependency graph is correct, but I'd refine it slightly:
1 → 2 → 3 → 4 → 5 → 6, with one reorder: do Step 3 (Icon Picker) after Step 2, not in parallel. Here's why — the icon picker is trivial to build once the Category type is finalised, and doing it in parallel risks type drift. More importantly:
I'd split Step 2 into 2a and 2b:

2a — Types only (Category interface, ParentCategory with children, the virtual Others shape). Lock these first — everything downstream depends on them.
2b — Repository methods (getAllNested, getChildren, updated create/update/archive). Write and verify queries before any UI touches them.

This gives you a stable contract before any UI work begins, which matters because Steps 4, 5, and 6 all consume the repository independently.
Revised order:
```
Step 1 (Migration) ✅ done
  └── Step 2a (Types)
        └── Step 2b (Repository methods)
              └── Step 3 (Icon Picker — pure UI, no data deps)
                    └── Step 4 (Category Form)
                          └── Step 5 (Categories Screen)
                                └── Step 6 (Transaction Form + list display)
                                      └── Step 7 (Edge-case testing checklist)
```
### 1.
What changed on Category: added icon: string | null and parent_id: number | null. The is_archived: number is unchanged — keeping it as number so it maps directly to SQLite row values without any coercion layer.
category_parent_name on Transaction: added as an optional joined field. This is what the transaction list and detail view will use in Step 6 to render Food > Coffee — it gets populated by updating the SQL joins in transactionRepository, not by any new logic in the UI. When it's undefined (standalone category), the display falls back to just category_name.
### 2.
Here's a summary of every meaningful decision made:

#### `categoryRepository.ts`

- `CreateCategoryData` gains `icon` and `parentId` — both optional so existing callers (`CategoryFormScreen`) don't break until Step 4 updates them.
- `getByName` is now `private getByNameInScope(name, parentId)` — scopes the uniqueness check to roots-only or per-parent, matching the two partial indexes from migration v2.
- `create` validates in order: "Others" reserved → parent depth check → scope uniqueness → unarchive-or-insert. The unarchive shortcut now preserves `parentId` correctly.
- `update` adds the reparenting guard: reads `current.parent_id` and throws if the caller tries to change it while `hasChildren` is true.
- `archive` is now atomic: cascades to children first, then archives the parent, in a single `withTransaction`. The UI (Step 5) is responsible for showing the confirmation dialog — the repository just executes cleanly.
- `isFirstChild(parentId)` is a new helper for the form's "Others" warning (Step 4).
- `getByName` (public, unscoped) is removed — it was only used internally by the old `create`, and its unscoped behaviour would be wrong now.


#### `transactionRepository.ts`

- All five read queries now share a single `SELECT_WITH_CATEGORY` constant with a `LEFT JOIN categories p ON p.id = c.parent_id`. This adds `category_parent_name` to every result row — `NULL` for standalone categories, parent name for children.
- No write methods changed.