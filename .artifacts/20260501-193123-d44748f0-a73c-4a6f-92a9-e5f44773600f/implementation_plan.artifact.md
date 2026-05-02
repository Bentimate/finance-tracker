# Smooth Modal Fade and Slide Animation

The goal is to have the background fade to grey while the sheet content slides up, matching the standard "fade and slide" behavior seen in native pickers, without complex custom animation logic.

## Proposed Changes

### Components

#### [BottomSheet.tsx](file:///C:/Users/benny/Desktop/Projects/finance-tracker/src/components/BottomSheet.tsx)

- Update the `Modal` to use `animationType="fade"`. This natively handles the backdrop fading.
- Keep the `Animated.spring` logic for the `translateY` of the sheet content.
- Coordinate the slide animation with the fade timing for a synchronized "pop up" effect.

```typescript
// Proposed approach
<Modal
  transparent
  visible={shouldRender}
  onRequestClose={onClose}
  animationType="fade" // Native fade for the background
>
  <View style={styles.container}>
    <Animated.View style={{ transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  </View>
</Modal>
```

## Verification Plan

### Manual Verification
- **Visual Check**: Open any modal (Category, Date, etc.). Observe if the background fades in smoothly while the sheet slides up.
- **Consistency Check**: Verify that the behavior matches the user's reference (the native-like date picker feel).
