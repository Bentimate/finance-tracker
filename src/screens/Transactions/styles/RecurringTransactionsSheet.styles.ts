import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: theme.colors.surface,
    fontSize: theme.typography.fontSizes.xl,
    lineHeight: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
  },
  list: {
    padding: theme.spacing.md,
  },
  item: {
    marginBottom: theme.spacing.sm,
  },
  amount: {
    fontWeight: theme.typography.fontWeights.bold,
  },
  meta: {
    alignItems: 'flex-end',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
