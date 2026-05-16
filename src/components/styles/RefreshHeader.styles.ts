import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.primary,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    height: 45,
  },
  title: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 24,
  },
});
