import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  inputFocused: {
    shadowColor: theme.colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
    padding: 0,
  },
  helperText: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
