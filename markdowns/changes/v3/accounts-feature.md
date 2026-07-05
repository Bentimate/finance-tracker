- Added a cached `current_balance` field to `accounts` and backfilled it during migration so the Accounts page can read balances quickly while transactions remain the source of truth.
- Updated account write paths so transaction create/edit/delete, recurring generation, and transfers keep the cached balance in sync inside the same database transaction.
- Added reconciliation support in `src\repositories\accountRepository.ts` to recompute account balances from transaction and transfer history if cache drift ever needs repair.
- Updated the Accounts UI to surface a total balance summary and render balance values as positive for display, even when the underlying balance is negative.
- Validation: `.\node_modules\.bin\tsc --noEmit` passes cleanly.

### Navigation & UX Enhancements
- Relocated the "Add Transaction" and "Recurrence" entry points from the Calendar tab to the Accounts tab, centralizing financial management.
- Standardized the header across Dashboard, Calendar, and Accounts using the `RefreshHeader` component.
- Resolved a visual "flash" when switching accounts by clearing route parameters after they are consumed by the local state.
- Replaced the bottom-sheet account picker with a streamlined dropdown menu (`Menu`) for faster navigation in both Accounts and Settings.

### Account Overview Refactor
- Moved the "Total Balance" summary card from the management sub-screen to the main Accounts tab.
- Enhanced the balance card to be context-aware, showing "Account Balance" for specific accounts and "Total Balance" when viewing all accounts.
- Simplified the "Manage Accounts" UI by removing inner list-item components and disabling redundant navigation links on the cards.
- Hidden the "Transfer" button from the management screen to declutter the interface.

### Reliability & Maintenance
- Fixed a bug in the transfer logic where both accounts incorrectly increased; the system now correctly deducts from the source and adds to the destination using absolute value normalization.
- Fixed a duplicate declaration `SyntaxError` in the `AccountsScreen.tsx` component.
- Updated `AGENTS.md` with a new "Common Pitfalls" section documenting the fix for navigation-based state flashes.
- Added support for side-by-side Debug and Release installations by configuring unique app names and application ID suffixes in Gradle.
