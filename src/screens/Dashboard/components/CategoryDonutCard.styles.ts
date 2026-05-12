import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.semibold as any,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Filter pill (Menu anchor trigger)
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    maxWidth: 140,
  },
  pillText: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.medium as any,
    flexShrink: 1,
  },

  // Color dot fallback for categories without an icon
  menuDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  // Loading spinner shown during drill-down fetch
  loader: {
    paddingVertical: theme.spacing.xl,
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

// ---------------------------------------------------------------------------
// react-native-paper Menu styles
// These are passed directly as style/contentStyle props, not via StyleSheet,
// because paper's Menu accepts plain ViewStyle/TextStyle objects.
// ---------------------------------------------------------------------------

export const menuContentStyle = {
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.md,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: theme.colors.border,
  paddingVertical: 0,
  minWidth: 180,
};

export const menuItemStyle = {
  item: {
    minHeight: 44,
  },
  itemActive: {
    backgroundColor: `${theme.colors.primary}14`,
  },
  title: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text,
  },
  titleActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeights.semibold as any,
  },
};