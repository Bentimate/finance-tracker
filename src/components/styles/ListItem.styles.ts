import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadow,
  },
  selected: {
    backgroundColor: theme.colors.border,
    borderColor: `${theme.colors.primary}30`,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftElement: {
    marginRight: theme.spacing.md,
  },
  textContent: {
    flex: 1,
  },
  rightElement: {
    marginLeft: theme.spacing.sm,
  },
});
