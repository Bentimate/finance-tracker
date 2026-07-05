import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  list: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  item: {
    marginHorizontal: theme.spacing.md,
  },
  balance: {
    color: theme.colors.textSecondary,
  },
});
