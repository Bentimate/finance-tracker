import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: theme.colors.surface,
    fontSize: 35,
    marginTop: -2,
    fontWeight: theme.typography.fontWeights.bold,
  },
});
