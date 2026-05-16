import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.5,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.textSecondary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  iconSpacing: {
    marginLeft: theme.spacing.sm,
  },
});
