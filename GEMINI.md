# Fianance tracker app
## 1. Introduction

### 1.1 Purpose
The application is intended for general consumers and prioritizes:
- Minimal friction in recording transactions
- Offline usability
- User-owned data portability
- Simple, trustworthy financial insights

### 1.2 Scope

The application shall allow users to:

- Record income and expense transactions
- Categorize transactions
- Set category budgets
- View transaction history
- Visualize spending patterns
- Add transactions through an Android home-screen widget
- Export data as CSV files stored locally

Cloud synchronization and collaboration are outside the scope.

### 1.3 Technology Stack

Languages: Typescript

Frontend: React Native, Material UI

Persistence: React Native SQLite

Export: CSV files stored in device local storage

Deployment: Users will be expected to install the app from the apk. No publishing to online platforms yet, at most the apk will be uploaded to github.

Instructions:
- Build using react native bare workflow
- Follow React best practices, such as separating components and their css styling files
- Use universal values for styling, not hardcoded

## 2. System Architecture
### 2.1 Architectural Style

The system shall use a local-first layered architecture.

Presentation Layer

↓

State / View Model Layer

↓

Repository Layer

↓

Database

### 2.2 Data Source of Truth

The database shall be the system source of truth.

CSV files shall be export artifacts only and shall not function as primary storage.

### 2.3 Offline Operation

Core application features shall function without internet connectivity.

No network dependency shall exist for:
- Transaction creation
- Editing
- Budget calculation
- Visualization
- Widget entry
- CSV export

## 3. Functional Requirements
### 3.1 Transaction Management

The system shall support:
- Create transaction
- Update transaction
- Delete transaction
- View transactions by:
    - Day
    - Week
    - Month

Each transaction shall contain:
- Amount
- Type (income or expense)
- Category
- Date
- Optional note

### 3.2 Category Management

Users shall be able to:
- Create custom categories
- Modify category names
- Archive categories

Category names shall be case-insensitive and unique.

Example:

Food,food
,FOOD

shall be treated as duplicates.

Categories in use shall not be hard-deleted, in case it breaks visualisation. They should be archived instead.

### 3.3 Budget Management

Users shall be able to define:
- Budget amount per category
- Budget period:
    - Weekly
    - Monthly

Budget progress shall be derived from transaction data and shall not be persisted.

### 3.4 Widget Support

The Android widget shall support transaction creation only.

Required fields:
- Amount
- Category

Target interaction:
Completion in ≤ 3 user interactions,
Entry completion in under 3 seconds

### 3.5 Data Visualization

The system shall provide:

Summary Views:
- Cash flow waterfall
- Top spending drivers by category

Charts:
- Budget progress bars
- Category expenditure donut chart
- Income vs expense trend bar chart

All visualizations shall be computed from transaction records.

### 3.6 Data Export

The system shall support exporting monthly transaction data as:
`transactions.csv`
`categories.csv`

Exported files shall be stored locally on the device.

## 4. Data Design
### 4.1 Transaction Entity

```
Transaction

id (PK)
amount
type (income/expense)
date (default current timestamp)
category_id (FK)
note
created_at
updated_at
deleted_at
```

### 4.2 Category Entity
```
Category

id (PK)
name
color
is_archived
```
### 4.3 Budget Entity
```
Budget

category_id (FK)
budget_amount
period
```
### 4.4 Relationships
Category
1 ---- many Transactions

Category
1 ---- 1 Budget
## 5. Non-Functional Requirements
### 5.1 Performance

The system should satisfy:

Save transaction response < 300ms
Transaction list load < 1 second
Visualization load < 2 seconds

for normal local data volumes.

### 5.2 Reliability

1. Database writes shall be atomic.
2. Partial writes shall not corrupt stored data.
3. System shall recover safely from interruption during save operations.

### 5.3 Usability

The design shall prioritize:
- Minimal data entry friction
- Low cognitive load
- Fast repeated-entry workflows

### 5.4 Portability

1. Users shall retain ownership of data through CSV export.
2. Exported files should support future re-import compatibility.

## 6. Implementation Constraints

The system shall:
- Avoid direct SQLite access where possible
- Derive visualization aggregates dynamically
- Avoid storing duplicated computed values

## 7. Design and Styling
Based on the placeholder screens I've already seeded (background #f9fafb, accent #6366f1 indigo), I'm going for:
Clean, minimal, data-forward. Think a stripped-down finance app — no gradients, no decorative chrome. The data is the UI.
Specifically:

Neutral white/gray surfaces with clear card separation, no heavy shadows
Indigo as the single accent (#6366f1) for CTAs, active states, and progress indicators
Strong typographic hierarchy — large numbers for amounts, muted labels underneath
High-contrast transaction rows with a colored category dot as the only decoration
Compact, dense lists since finance apps get scrolled constantly — no wasted vertical space

The overall feel would be closer to a bank statement than a lifestyle app. Functional and trustworthy, which matches the design doc's stated goal: "Simple, trustworthy financial insights."

# Progress
### Phase 1 — Foundation
Database schema + migrations (SQLite via op-sqlite or react-native-quick-sqlite)
Repository layer (typed CRUD for transactions, categories, budgets)
Navigation shell (bottom tabs: Dashboard, Transactions, Budgets, Settings)

### Phase 2 — Core Features [DONE]
Transaction list + create/edit/delete form
Category management screen
Budget setup per category

#### Progress [DONE]
- Implemented Transaction List (grouped by date) and CRUD Form.
- Implemented Category Management (List/Archive/Form) with uniqueness validation.
- Implemented Budget Management (List with progress bars and Setup Form).
- Normalized all currency displays to SGD.
- Standardized minimalist UI across all core modules.

### Phase 3 — Visualizations [DONE]
Cash flow waterfall
Donut chart (category spend)
Income vs expense bar chart
Budget progress bars

### Phase 4 — Export + Widget [DONE]
CSV export to local storage (done)
Android home-screen widget (AppWidgetProvider) (done)

## Progress:
Everything works from phase 1 to phase 4.

### Improvements
Overall: Improve english and understandability
- Improve widget
  - User to choose from a drop down instead of being shown everything at once?
  - Add a done or add button to add entry (ignore 3 interactions rule)
  - widget to be changed to have the same theme as app
- Allow user to add expenses with a negative sign, but still saved as income/expense
- Add more views in transactions
  - default shows this week
  - allow user to choose time period to show all transactions
- Make visualisations more useful
  - replace the savings / expenditure graph to be an expenditure or savings trend
  
### Future features
- Add nested categories
- add savings
  - add feature to show how much they saved per month
  - add visualisation to show savings trend
  - add saving goal
  - add visualisation to saving goal progress
- Add recurring in/out rules

nice to haves:
- Calendar view
