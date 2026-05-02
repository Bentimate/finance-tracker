### Improvements
- Allow user to add expenses with a negative sign, but still saved in the database as income/expense
- Transaction amount input now uses a custom numeric keypad popup instead of the native keyboard
    - Keypad supports `0-9`, `+/-`, `.`, `Backspace`, `Clear`, and `Done`
    - Signed amount parsing is preserved: `-` as expense, `+`/no sign as income, decimals allowed
    - Keypad opens only when the amount field is tapped (no auto-popup on create or edit screen load)
    - Popup uses a card/paper-style sheet and no dim grey backdrop transition
- Add more views in transactions
    - default shows this week
    - allow user to choose time period to show all transactions
- Add recurring expenses and income rules
- Allow users to change the date of a transaction in adding and updating of transactions (still defaults to today's date while adding)
- Change bottom nav bar to use only Material UI icons instead of unicode + words

### Future features
- Add nested categories
- add savings
    - add feature to show how much they saved per month
    - add visualisation to show savings trend
    - add saving goal
    - add visualisation to saving goal progress


nice to haves:
- Calendar view