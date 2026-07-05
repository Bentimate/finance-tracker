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
    accountSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    accountSelectorLabel: {
      marginBottom: 2,
    },
    accountSelectorValue: {
      color: theme.colors.text,
    },
    manageAccountsBtn: {
      alignSelf: 'flex-end',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    manageAccountsBtnText: {
      color: theme.colors.primary,
      fontSize: theme.typography.fontSizes.sm,
      fontWeight: theme.typography.fontWeights.semibold as any,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
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
  });
