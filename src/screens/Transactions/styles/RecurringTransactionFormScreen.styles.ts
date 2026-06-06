import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

const COMPACT_ICON_BUTTON_SIZE = 36;

export const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    marginBottom: theme.spacing.sm,
  },
  frequencyTabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: 2,
    marginBottom: theme.spacing.md,
  },
  frequencyTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  frequencyTabActive: {
    backgroundColor: theme.colors.surface,
  },
  weekdayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  weekdayButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  weekdayButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  yearlyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerIconButton: {
    width: COMPACT_ICON_BUTTON_SIZE,
    height: COMPACT_ICON_BUTTON_SIZE,
    borderRadius: COMPACT_ICON_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  headerIconText: {
    color: theme.colors.surface,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
