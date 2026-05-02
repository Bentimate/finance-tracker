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

  // Chart + legend side by side
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  // Donut center overlay
  donutCenter: {
    alignItems: 'center',
  },
  donutAmount: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold as any,
    color: theme.colors.text,
  },
  donutCaption: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  // Legend
  legend: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  legendRowFocused: {
    backgroundColor: theme.colors.background,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendName: {
    flex: 1,
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  legendPct: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeights.medium as any,
  },

  empty: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});
