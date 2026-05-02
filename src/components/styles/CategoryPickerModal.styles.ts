import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryList: {
    padding: theme.spacing.md,
  },
});
