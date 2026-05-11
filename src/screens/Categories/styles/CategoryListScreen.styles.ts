import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },

  // ---------------------------------------------------------------------------
  // Others virtual row
  // ---------------------------------------------------------------------------
  othersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    opacity: 0.6,
  },
  childIndent: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.border,
    borderRadius: 1,
    marginRight: theme.spacing.sm,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.sm,
  },
  othersLabel: {
    flex: 1,
  },
});