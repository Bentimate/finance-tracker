import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 40,
  },
  textContainer: {
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    marginBottom: -2,
    textTransform: 'uppercase',
  },
  icon: {
    marginLeft: theme.spacing.xs,
  },
  menuContent: {
    backgroundColor: theme.colors.surface,
  },
});
