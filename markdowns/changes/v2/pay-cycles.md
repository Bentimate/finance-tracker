# Walkthrough - Pay Cycles Feature
I have implemented the "Pay Cycles" feature, which allows users to synchronize their monthly dashboard and budget tracking with their payday instead of standard calendar months.
## Key Accomplishments
- **Database Persistence**: Added a flexible user_preferences table using a key-value (JSON) approach to store settings.
- **Global Configuration**: Created UserPrefContext to provide pay cycle settings throughout the app and handle period bound calculations.
- **Settings UI**: Added a "Pay Cycle Settings" section in the Settings screen where users can set their payday (1-31).
- **Dashboard Integration**: The Dashboard date filter now displays the specific date range (e.g., "4/25 - 5/24") directly in the month dropdown.
- **Improved defaulting logic**: The app now automatically selects the cycle that actually contains "today" (e.g., if today is May 17th and payday is the 25th, it defaults to the April cycle).
- **Budget Tracking**: Monthly budget progress is now calculated based on the active pay cycle.
- **Edge Case Handling**: Implemented clamping for months with fewer days (e.g., if payday is set to 31st, it correctly uses the last day of shorter months).


## Changes Overview
### Database
- `migrations.ts`: Added version 3 migration for user_preferences.
- `userPrefRepository.ts`: New repository for settings management.

### Global State & Logic
- `UserPrefContext.tsx`: Context provider for preferences and period calculations.
- `analyticsRepository.ts`: Updated monthRange to support custom start days and range labels.
- `budgetRepository.ts`: Updated getProgress to respect the custom pay cycle.

### UI Components
- `SettingsScreen.tsx`: Added pay cycle configuration UI.
- `DashboardScreen.tsx`: Integrated pay cycle into dashboard defaulting and data fetching.
- `MonthYearPickerGroup.tsx`: Updated dropdown to show cycle ranges.
- `BudgetListScreen.tsx`: Integrated pay cycle into budget listing.