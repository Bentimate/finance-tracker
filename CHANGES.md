# Changes

## OOP Refactoring of Repositories and Utilities

Refactored the project's data and utility layers to follow an Object-Oriented Programming (OOP) paradigm for better encapsulation and structure.

### Key Refactorings:

1.  **Base Repository Pattern**: Created an abstract `BaseRepository` class in `src/repositories/BaseRepository.ts`. This class centralizes common database operations like transaction handling, row parsing, and timestamp generation, reducing boilerplate in specific repositories.
2.  **Repository Classes**: Refactored the following repositories into classes that extend `BaseRepository`:
    *   `CategoryRepository`
    *   `TransactionRepository`
    *   `BudgetRepository`
    *   `AnalyticsRepository`
    *   `ExportRepository`
    Each repository now exports a singleton instance (e.g., `categoryRepository`), making it easy to use while maintaining internal state and private helper methods.
3.  **Database Management**: Refactored `src/database/db.ts` into a `Database` class. This provides a cleaner way to manage the SQLite connection life cycle and ensures the instance is correctly initialized before use.
4.  **Utility Classes**: Refactored `src/utils/exportCsv.ts` into a `CsvExporter` class. This encapsulates the logic for building CSV rows and escaping fields, keeping the utility clean and modular.
5.  **Updated Consumers**: Updated all screens (`BudgetFormScreen`, `CategoryListScreen`, `TransactionFormScreen`, etc.) and hooks (`useDashboardData`, `useExport`) to consume the new repository and utility classes.

## Transaction Calendar View

Implemented a custom, high-performance calendar view for the Transactions screen to replace the month-based list view.

### Key Features:

1.  **Custom Calendar Grid**: Built a grid-based calendar from scratch to allow full control over cell content and styling, ensuring alignment with the global theme.
2.  **Daily Net Flow**: Each cell displays the daily net cash flow (Income - Expense), color-coded (Green for profit, Red for loss).
3.  **Dynamic Date Range**: The calendar automatically determines its start date by querying the database for the earliest transaction, making the UI adaptive to user data.
4.  **Integrated Bottom Sheet**: Tapping a day opens a bottom-sheet modal containing a list of transactions for that day, with direct navigation to the edit form.
5.  **Performance Optimizations**: 
    - **Granular Memoization**: Extracted `MonthGrid` and `CalendarDayCell` into `React.memo` components to prevent redundant renders.
    - **Month-Keyed Cache**: Implemented a caching layer for daily flow data to make month transitions instantaneous.
    - **Predictive Pre-fetching**: Added background pre-fetching for adjacent months to eliminate flicker and latency during swipes.
6.  **Navigation Synchronization**: Fully synchronized horizontal swiping with the Year/Month dropdown filters, including safety checks for index-based scrolling.
7.  **Local Timezone Synchronization**: Resolved "one-day off" date bugs by updating all database queries and helper functions to use the `'localtime'` modifier and native local date strings.

## UI Refactoring of Screens and Components

Refactored the `src/screens` directory to improve modularity, separation of concerns, and adherence to the global theme.

### Key Refactorings:

1.  **Component Breakdown**: Large screen components were broken down into smaller, focused sub-components.
    *   **Transactions**: Extracted `TransactionItem`, `ViewModeTabs`, `DateFilter`, `AmountKeypad`, and `DatePickerModal`.
    *   **Budgets**: Extracted `BudgetItem`.
    *   **Categories**: Extracted `CategoryListItem` and `ColorPicker`.
    *   **Settings**: Extracted `MonthRow`.
2.  **Shared Components**: Created a reusable `CategoryPickerModal` in `src/components` to be shared between the Transaction and Budget form screens.
3.  **Styles Separation**: Ensured all screens have their styles in separate `.styles.ts` files, maintaining a clean component structure.
4.  **Helper Modularization**: Moved screen-specific logic and helper functions into dedicated `helpers.ts` files (e.g., `src/screens/Transactions/helpers.ts`).
5.  **Global Theme Integration**: Updated the global `theme.ts` with common colors (e.g., `warning`, `indigo`, `amber`) and refactored components to use these theme values instead of hardcoded hex strings.
