import {StyleSheet, TextStyle, ViewStyle} from 'react-native';
import {theme} from '../../../theme';

interface TransactionFormStyles {
  container: ViewStyle;
  content: ViewStyle;
  typeContainer: ViewStyle;
  typeButton: ViewStyle;
  typeButtonActive: ViewStyle;
  amountContainer: ViewStyle;
  amountInput: TextStyle;
  amountLabel: TextStyle;
  keypadContainer: ViewStyle;
  keypadGrid: ViewStyle;
  keypadKey: ViewStyle;
  keypadKeyText: TextStyle;
  keypadActionsRow: ViewStyle;
  keypadActionKey: ViewStyle;
  keypadActionText: TextStyle;
  keypadDoneKey: ViewStyle;
  keypadDoneText: TextStyle;
  amountKeypadModalBackdrop: ViewStyle;
  amountKeypadBackdropPressable: ViewStyle;
  amountKeypadSheet: ViewStyle;
  section: ViewStyle;
  categorySelector: ViewStyle;
  dateSelector: ViewStyle;
  dateValue: TextStyle;
  dateHintContainer: ViewStyle;
  dateChevron: TextStyle;
  categoryDot: ViewStyle;
  footer: ViewStyle;
  modalContainer: ViewStyle;
  modalContent: ViewStyle;
  modalHeader: ViewStyle;
  categoryList: ViewStyle;
  categoryOption: ViewStyle;
  categoryOptionSelected: ViewStyle;
}

export const styles = StyleSheet.create<TransactionFormStyles>({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  typeContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 2,
  },
  typeButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  typeButtonActive: {
    backgroundColor: theme.colors.surface,
  },
  amountContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    width: '100%',
  },
  amountLabel: {
    marginTop: theme.spacing.xs,
  },
  keypadContainer: {
    width: '100%',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  keypadKey: {
    width: '31%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadKeyText: {
    color: theme.colors.text,
  },
  keypadActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  keypadActionKey: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadActionText: {
    color: theme.colors.textSecondary,
  },
  keypadDoneKey: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  keypadDoneText: {
    color: theme.colors.surface,
  },
  amountKeypadModalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  amountKeypadBackdropPressable: {
    flex: 1,
  },
  amountKeypadSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateValue: {
    flex: 1,
  },
  dateHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  dateChevron: {
    fontSize: theme.typography.fontSizes.lg,
    lineHeight: theme.typography.fontSizes.lg,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '50%',
  },
  modalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryList: {
    padding: theme.spacing.md,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  categoryOptionSelected: {
    backgroundColor: theme.colors.background,
  },
});
