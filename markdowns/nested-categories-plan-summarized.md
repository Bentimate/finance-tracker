# Nested Categories — Implementation Plan

## Overview
Implementation of a two-level category hierarchy including schema migrations, repository updates, management UI, and a two-step transaction picker. Visualizations (charts) are out of scope.

---

## Roadmap
1. **Migration (v2)** ✅
2. **2a: Types** → **2b: Repository**
3. **Icon Picker**
4. **Category Form**
5. **Categories Screen**
6. **Transaction Form & List**
7. **Testing**

---

## Step 1: Database Migration (v2)
- **Schema:** Update `categories` table.
  - Add `parent_id` (nullable FK to `categories.id`).
  - Add `icon` (nullable string for icon names).
- **Indexes:** Replace global unique name constraint with:
  - Root level: Unique name where `parent_id IS NULL`.
  - Child level: Unique name per `parent_id`.
- **Seed:** Set `Food` and `Transport` as root categories.

## Step 2: Types & Repository Layer
- **Interface:** Update `Category` and define `ParentCategory` (includes `children[]`).
- **Validations:**
  - Max depth: 2 (parents must be roots).
  - Reserved: Block name "Others" for child categories.
  - Reparenting: Prevent changing parent if category has children.
- **Methods:**
  - `getAllNested()`: Returns hierarchy with virtual "Others" entries.
  - `archive(id)`: Atomic cascade archive for parents and children.
  - `isFirstChild(parentId)`: Helper for UI warnings.

## Step 3: Icon Picker Component
- **Assets:** `icons.ts` containing ~70 curated `MaterialCommunityIcons` in thematic groups.
- **UI:** `IconPickerModal` with a searchable grid using `SectionList`.
- **Features:** Highlight active selection; support "no icon" state.

## Step 4: Category Form
- **Fields:**
  - **Parent Selector:** Roots only; disabled if editing a parent with children.
  - **Icon Picker:** Inline preview and modal trigger.
- **Logic:**
  - **First-Child Warning:** Alert user when adding the first child to a standalone category.
  - **Constraint:** Block "Others" name at form level.
- **Archive:** Integrated archiving with cascade confirmation.

## Step 5: Categories Screen (Nested List)
- **UI:** Two-level accordion using a flattened `FlatList` for performance.
- **Parent Rows:** Icon, name, child count, and chevron toggle.
- **Child Rows:** Indented; includes virtual "Others" row (greyed out/non-interactive).
- **Actions:** Expand/collapse via `Set<number>` state; parent/child specific delete flows.

## Step 6: Transaction Integration
- **CategoryPickerModal:**
  - **Step 1:** Select root category. (Instant confirm if standalone).
  - **Step 2:** Select child or "Others".
- **Display:** 
  - Show as `Parent > Child` in forms, lists, and details.
  - Repository: Join parent names in all transaction read queries.
  - Iconography: Prioritize `category_icon` over `ColorDot`.

## Step 7: Regression Testing
- [ ] Block "Others" naming for children.
- [ ] Validate scoped uniqueness (same name allowed under different parents).
- [ ] Verify "Others" routing for parent-assigned transactions.
- [ ] Confirm cascade archiving and first-child warnings.
- [ ] Ensure migration v2 preserves v1 data.

---

## Key Implementation Decisions
- **Repository:** Atomic transactions for cascading actions; scoped uniqueness checks match DB indexes.
- **Icon Picker:** Pre-chunked rows in `SectionList` to simulate a grid without `numColumns` limitations.
- **Modals:** Use absolute positioning and `zIndex` for pickers to avoid Android `Modal` stacking issues.
- **Performance:** Flattened list logic for the Categories Screen to avoid nested scroll views.
