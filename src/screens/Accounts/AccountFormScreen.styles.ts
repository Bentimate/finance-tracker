import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  footerDeleteButton: {
    marginBottom: theme.spacing.sm,
  },
  note: {
    color: theme.colors.textSecondary,
  },
});
