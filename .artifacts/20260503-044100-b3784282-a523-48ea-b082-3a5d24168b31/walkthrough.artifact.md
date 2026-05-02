# Walkthrough: Spotlight Effect for Amount Input

I have implemented a "Spotlight" effect using the **Layered Replica** method. This ensures that when the keypad modal opens, the amount value remains perfectly visible and positioned exactly where it was on the form, appearing to sit "above" the grey background.

## Changes Made

### TransactionFormScreen
- Added measurement logic using `onLayout` and `measureInWindow` to capture the exact Y-coordinate of the amount input.
- Passed this `topOffset` to the `AmountKeypad`.

### BottomSheet Component
- Enhanced the [BottomSheet.tsx](file:///C:/Users/benny/Desktop/Projects/finance-tracker/src/components/BottomSheet.tsx) to support a `topContent` prop. This allows rendering elements inside the `Modal` but outside the animated bottom sheet container, which is essential for placing the replica amount at the top of the screen.

### AmountKeypad Component
- Modified [AmountKeypad.tsx](file:///C:/Users/benny/Desktop/Projects/finance-tracker/src/screens/Transactions/components/AmountKeypad.tsx) to render a "replica" of the amount display.
- Positioned the replica absolutely using the `topOffset` passed from the parent screen.
- Removed the previous implementation where the amount was part of the keypad's bottom container.

## Visual Effect
- When you tap the amount, the keypad slides up from the bottom and the background dims.
- Simultaneously, a clone of the amount appears at the exact same position as the original input, creating a seamless "spotlight" effect where the amount seems untouched by the darkening background.
