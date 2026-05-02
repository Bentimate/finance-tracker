import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.md,
  },
  yAxisLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  xAxisLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: theme.spacing.xs,
  },
  legendLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
  },
  empty: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});
