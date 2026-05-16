import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  modeToggle: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  modeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  modeButtonActive: {
    backgroundColor: `${theme.colors.primary}14`,
  },
  pickerGroup: {
    gap: 2,
  },
  pickerLabel: {
    letterSpacing: 0.6,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rangeSeparator: {
    marginTop: theme.spacing.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  menuItemText: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  menuItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  menuItemTextDisabled: {
    color: theme.colors.textMuted,
  },
});
