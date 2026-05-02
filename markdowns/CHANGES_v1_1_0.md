# Changes
> 1 May 2026

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

# Walkthrough - Transaction Calendar View

I have replaced the monthly list view with a fully interactive custom calendar.

## Key Features

1.  **Daily Net Cash Flow**: Each calendar cell now displays the total net flow (Income - Expense) for that day.
    -   Positive amounts (Income > Expense) are shown in **Green**.
    -   Negative amounts (Expense > Income) are shown in **Red**.
    -   Amounts automatically shrink to fit the cell width.
2.  **Flexible Navigation**:
    -   **Swipe**: You can swipe left or right on the calendar to move between months.
    -   **Dropdowns**: The existing Year and Month dropdowns are synchronized with the calendar. Changing one updates the other.
3.  **Day Detail Bottom Sheet**:
    -   Tapping any day opens a bottom sheet listing all transactions for that specific day.
    -   Tapping a transaction in the sheet navigates you to the edit form.
4.  **Automatic Updates**:
    -   Editing or deleting a transaction automatically refreshes the calendar totals.

## Seamless Caching & Flicker-Free Swiping

I've significantly improved the calendar's responsiveness and visual stability:

1.  **Month-Keyed Cache**: The app now caches daily flow data for every month you visit. Returning to a previously viewed month is now instantaneous, with zero database latency.
2.  **Predictive Pre-fetching**: When you view a month, the app automatically pre-fetches the previous and next months in the background. This ensures that data is already available before you even finish your swipe.
3.  **Flicker Elimination**: I removed the logic that was hiding data on non-active pages. Because of the cache and pre-fetching, all months now render their data immediately and persistently, resulting in a perfectly smooth swiping experience.
4.  **Automatic Invalidation**: The cache is intelligently cleared whenever you add, edit, or delete a transaction, ensuring that the cached totals are always accurate.

## Dynamic Calendar Range

The calendar range is no longer hard-coded. It now automatically adapts to your data:

1.  **Smart Range Discovery**: The app queries your database for the year of your very first transaction and sets that as the calendar's starting point.
2.  **Synchronized Dropdowns**: The Year dropdown automatically updates to match this dynamic range, ensuring you can never select a year that isn't available in the calendar.

## Timezone & Date Accuracy

Fixed the "one-day off" bug by synchronizing all date logic to the user's local timezone:

1.  **Local SQL Grouping**: Updated all database queries (Transactions, Budgets, and Analytics) to use the `'localtime'` modifier in SQLite. This ensures that a transaction saved late at night stays on the correct day in your local time, even if it's technically the next day in UTC.
2.  **Native Date Helpers**: Refactored `toDateStr` to generate `YYYY-MM-DD` strings based on the local calendar instead of the global UTC standard.
3.  **Unified Comparisons**: Ensured that the calendar cells and the database flows use the exact same local string format for mapping, eliminating any mismatch during swiping or rendering.

## Lightweight Performance Optimizations

I have applied several "under-the-hood" optimizations to ensure the calendar remains buttery smooth even with complex data:

1.  **Reduced Component Overhead**:
    -   Switched from `Typography` and `TouchableOpacity` to standard `Text` and `Pressable`. This significantly reduces the number of React nodes and avoids the creation of hundreds of temporary style objects during swipes.
2.  **O(1) Data Lookup**:
    -   Optimized the way money totals are matched to days. Instead of searching through a list for every cell, I now use a `Map` to look up the data instantly.
3.  **Static Style Definitions**:
    -   Moved all color and layout logic into static `StyleSheet` definitions, eliminating memory churn from object spreading.
4.  **Layout Preservation**:
    -   Maintained the `adjustsFontSizeToFit` property to ensure long amounts remain readable and fit within their cells without impacting performance.

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
