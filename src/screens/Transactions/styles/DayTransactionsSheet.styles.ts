import {StyleSheet, Dimensions} from 'react-native';
import {theme} from '../../../theme';

const {height} = Dimensions.get('window');

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: height * 0.7,
    minHeight: height * 0.4,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  list: {
    paddingBottom: theme.spacing.xl,
  },
  emptyState: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
});
