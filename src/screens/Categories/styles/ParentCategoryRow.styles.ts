import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  leftElement: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightElement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
});
