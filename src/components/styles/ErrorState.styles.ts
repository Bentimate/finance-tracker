import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  retryBtn: {
    marginTop: theme.spacing.md,
    minWidth: 120,
  },
  message: {
    marginBottom: theme.spacing.sm,
  }
});
