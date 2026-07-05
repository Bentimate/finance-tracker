import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ── Tab bar ──────────────────────────────────────────────────────────────

    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tabActive: {
      backgroundColor: theme.colors.primary + '15', // 15 = ~8% opacity hex
      borderColor: theme.colors.primary,
    },

    // ── Month / year selector ─────────────────────────────────────────────────

    monthSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    accountSelectorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
    },
    dropdownButton: {
      minWidth: 150,
    },
    manageAccountsBtn: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    manageAccountsBtnText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.semibold as any,
    },
    menuContent: {
      backgroundColor: theme.colors.surface,
    },

    // ── Section list ──────────────────────────────────────────────────────────

    list: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xl, // clear the FAB
    },
    dayHeader: {
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    totalCard: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.sm,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    totalBalance: {
      color: theme.colors.text,
    },
  });
