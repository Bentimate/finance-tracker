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

# Progress
## Steps
1 → 2 → 3 → 4 → 5 → 6, with one reorder: do Step 3 (Icon Picker) after Step 2. 
More importantly:
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

### 3. 
Here's what was built and why each decision was made:
`icons.ts` — 70 icons across 10 groups. `ALL_ICONS` is a pre-computed flat array derived from the groups, so the search filter iterates a single array rather than re-flattening on every keystroke. Adding or reordering icons only requires editing `ICON_GROUPS` — `ALL_ICONS` updates automatically.

#### `IconPickerModal.tsx`

- Uses `presentationStyle="pageSheet"` — the standard bottom-sheet modal pattern on Android, consistent with how `DatePickerModal` likely works in your project. Doesn't fight with the keyboard.
- `SectionList` over `FlatList` — gives sticky-capable section headers for free. Headers are non-sticky (`stickySectionHeadersEnabled={false}`) to keep the layout dense.
- Icons are pre-chunked into rows of 6 before being passed to `SectionList`. This means `renderItem` always receives a `string[]` row and lays it out with a simple `flexDirection: 'row'` — avoids the `numColumns` prop on `SectionList` which doesn't exist.
- Search flattens to a single `Results` section — the section header mechanism stays identical, no conditional rendering paths.
- Tap-to-deselect: tapping the already-selected icon calls `onSelect(null)` — so the form can offer a "no icon" state cleanly.
- "Remove icon" shortcut row only renders when an icon is currently selected, keeping the UI clean when creating a new category.
- Selected state uses `#6366f1` at 10% opacity (`18` hex) as the cell background — consistent with how the rest of the app uses the indigo accent.

One thing to verify on your device: `presentationStyle="pageSheet"` behaves slightly differently across Android versions. If it renders full-screen rather than as a sheet, swap it for `animationType="slide"` without `presentationStyle` — the content is identical.

### 4. 
Here's a summary of every decision worth explaining:

Parent picker as an inline bottom sheet, not a `Modal` — `ParentPickerModal` is rendered inside the `Screen` tree using `StyleSheet.absoluteFillObject` + `zIndex`. This avoids the Android `Modal` z-index fighting that can occur when one modal (the screen) tries to open another (the parent picker). The backdrop tap dismisses it cleanly.

**First-child warning fires only on create, not edit** — if you're editing an existing child category there's no migration of transactions happening, so the warning would be misleading. The guard is `!isEdit && parentId !== null`.

`isFirstChild` is checked asynchronously before `persistSave` — `handleSave` is async so it awaits the check, shows the `Alert` if needed, and only calls `persistSave` from the `Alert` callback. `persistSave` is extracted as its own `useCallback` so the alert's `onPress` captures a stable reference.

**Reparenting disabled via UI, not just repo** — when `isEdit && hasChildren`, the parent selector renders as a non-interactive display row with a "Has subcategories" hint. The repo also guards against it, but surfacing it in the UI avoids a confusing error alert.

**Archive moved into this screen** — previously archive was only triggered from `CategoryListScreen`. Moving it here means the user can archive from the edit form too, which is the natural place. The repo's cascade is called with one `archive(id)` call — the confirmation message conditionally mentions subcategories when `hasChildren` is true.

`selectableParents` excludes self — filters out `categoryId` from the parent list on edit, preventing a category from being set as its own parent.'

### 4.1.
Here's what changed and why:

**Removed from the stylesheet:** `colorSection`, `colorGrid`, `colorOption`, `colorOptionSelected`, `colorInner` — these style the color swatches inside `ColorPicker`, not the form screen itself. They were misplaced in the original and should live in `ColorPicker`'s own stylesheet.

**Renamed for clarity:** `iconSelector` → `selectorRow` (used by both the icon and parent fields, so the name was too specific), `iconPreview`/`iconName` → `selectorRowInner` (same reason), `disabledSelector` → `selectorRowDisabled`, `footerButton` split into `footerButtonBase` (flex 1) and `footerButtonPrimary` (flex 2) to eliminate the one remaining inline `{flex: 2}`.

**Merged into one `StyleSheet`**: `pickerStyles` was a second `StyleSheet.create` block at the bottom of the screen file. All its keys are now prefixed `picker` and live in the exported `styles` object — one import, one block, no duplication of `StyleSheet.hairlineWidth` calls.
`content` padding restored: the original had `padding: theme.spacing.lg` which my version had dropped. Now both `padding` and `gap` are present.

### 5.
Key decisions to flag before writing:

Expand/collapse state is a Set<number> of expanded parent IDs — starts fully collapsed
The "Others" virtual row only renders when the parent has children AND has parent_id-direct transactions — but we can't know that cheaply without a query per parent. Instead I'll render it as the plan specifies: always show it when a parent has children, greyed out and non-interactive. This matches the spec exactly.
Delete/archive logic on parent rows gains the cascade warning (using hasChildren), consistent with what the form already does
Child rows get their own archive/delete action, same logic as current item rows
The handleDelete currently lives in the screen and is passed down — I'll keep that pattern, splitting it into handleDeleteParent and handleDeleteChild since the confirmation messages differ

Summary of decisions worth calling out:

Flattened FlatList over nested ScrollView — the screen builds a typed ListRow[] array by iterating categories and inserting child/Others rows only when a parent is expanded. This gives FlatList a single flat list to virtualise, avoiding nested scroll containers entirely. The keyExtractor uses index since the same category id could technically appear at different positions (parent row vs child row).
expandedIds as a Set<number> — starts empty (all collapsed). Toggle is a pure function that copies the set rather than mutating it, satisfying React's state immutability requirement. Starts collapsed rather than expanded because a dense finance list with many categories would be overwhelming if all expanded on load.
handleDeleteParent checks category.children.length — since we already have the hydrated ParentCategory in hand, this is a free synchronous check. No extra repo call needed to decide whether to show the cascade warning. hasTransactions is still awaited async for the fallback archive-vs-delete decision on childless parents.
OthersRow always renders when a parent has children — spec-compliant. It's greyed out (opacity: 0.6 on the row, opacity: 0.4 on the dot), no edit/archive controls, purely informational.
ParentCategoryRow tap target — tapping the row body toggles expand/collapse only when hasChildren is true. For standalone parents onPress is undefined, so ListItem renders with disabled={true} (already handled by ListItem's existing logic). Edit and delete are separate touch targets in rightElement, so they don't conflict with the expand toggle.

### 6.
Files Delivered

CategoryPickerModal.tsx — Full replacement of the old stub.

Step 1 shows all root categories; tapping a standalone confirms immediately, tapping one with children advances to step 2
Step 2 shows children + "Others" row at the bottom, with a breadcrumb header ([icon] Food ›) and a back button
"Others" saves the parent's id (per spec)
Uses BottomSheet exactly as it exists in your codebase
Selected row gets a subtle primary tint + checkmark; chevron only shown on rows that have children

TransactionFormScreen.tsx — Minimal diff from original:

categoryRepository.getAll() → categoryRepository.getAllNested(), state is now ParentCategory[]
selectedCategory replaced with resolveSelectedDisplay() — returns { label, color, icon } covering all cases: standalone ("Transport"), child ("Food > Coffee"), Others ("Food")
Category selector row renders icon via MaterialIcon when present, falls back to ColorDot — matches CategoryPickerModal row style

TransactionItem.tsx — Two changes:

Label: category_parent_name ? "Food > Coffee" : "Transport"
Left element: MaterialIcon when category_icon is set, ColorDot otherwise


Two Line-Level Changes Required
types.ts — add to Transaction interface:
tscategory_icon?: string | null;
transactionRepository.ts — add one line to SELECT_WITH_CATEGORY:
sqlc.icon  AS category_icon,
Between c.color AS category_color, and p.name AS category_parent_name.

FIX:
- Added db migrations for transaction and budget tables, as FK was still referring to category v1.


