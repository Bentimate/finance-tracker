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
      paddingTop: theme.spacing.md,
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

    // ── Transaction row ───────────────────────────────────────────────────────

    transactionItem: {
        backgroundColor: theme.colors.surface,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: theme.colors.border,
      },
    categoryDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: theme.spacing.sm,
      flexShrink: 0,
    },
    txInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    txAmount: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },

    // ── Empty state ───────────────────────────────────────────────────────────

    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: theme.spacing.xl * 2,
    },

    // ── FAB ───────────────────────────────────────────────────────────────────

    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    fabText: {
      color: '#ffffff',
      fontSize: 28,
      lineHeight: 32,
      fontWeight: '400',
    },
  });
