# Release Notes - v1.1.1

## Architecture & Infrastructure
- **OOP Repository Pattern**: Refactored the data layer into an Object-Oriented Repository pattern with class-based singletons (e.g., `transactionRepository`, `budgetRepository`) for better maintainability and cleaner separation of concerns.
- **Unified Screen Layout**: Introduced a centralized `Screen` component that standardizes background styling, Safe Area management, and keyboard avoidance across the entire application.

## UI & UX Improvements
_**KEY IMPROVEMENT:**_
- **Enhanced Bottom Sheets**: Implemented a custom, reusable `BottomSheet` component featuring:
    - Smooth, slide animations using `react-native-reanimated`.
    - Integrated native background fade transitions that synchronize perfectly with the sheet motion.
    - Non-delayed opening performance for immediate feedback.
    - LEARNING: look into `View and `pointerEvents`

Others:
- **Unified Form Modals**: Migrated `AmountKeypad`, `CategoryPickerModal`, `DatePickerModal`, and `DayTransactionsSheet` to the new `BottomSheet` architecture for a consistent look and feel.
- **Styling Standardization**:
    - Aligned the `PlusButton` (FAB) position across all list screens (Transactions, Budgets, Categories).
    - Standardized "NOTE" input labels to match the typography and spacing of other form section labels.
    - Improved modal accessibility by allowing dismissal via backdrop taps.
    - Added very subtle shadows to the standardized card-based `ListItem` for improved depth without excessive visual weight.
    - Standardized list item sizing and horizontal insets across all modals and screens (Transactions, Categories, and Budgets).
    - Unified the visual style of `BudgetItem` and `Card` components to match the core `ListItem` by centralizing shadow properties in the global theme.
- **Larger Plus Button**

## Logic & Bug Fixes
- **Calendar-Based Budgeting**: Refactored budget period calculations to follow natural calendar boundaries:
    - **Weekly**: Strictly Monday to Sunday.
    - **Monthly**: Strictly from the 1st to the last day of the month.
- **Timezone Resolution**: Fixed "one-day off" bugs in transaction grouping and budget progress by standardizing local date string conversions across SQL queries and helper functions.
- **Refined Safe Areas**: Standardized tab navigator safe area insets to prevent UI elements from overlapping with system navigation bars.


