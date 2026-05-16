import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  childItem: {
    marginLeft: theme.spacing.lg,
  },
  leftElement: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 32,
  },
  indent: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    borderRadius: 1,
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
