import {StyleSheet} from 'react-native';
import {theme} from '../../theme';

export const ICON_PICKER_CELL_SIZE = 52;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  clearRowText: {
    marginLeft: 4,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  listContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xs,
  },
  iconCell: {
    width: ICON_PICKER_CELL_SIZE,
    height: ICON_PICKER_CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    margin: 2,
  },
  iconCellSelected: {
    backgroundColor: `${theme.colors.primary}18`,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
});
