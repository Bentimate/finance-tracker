import {StyleSheet} from 'react-native';
import {theme} from '../../../theme';

export const styles = StyleSheet.create({
  // ---------------------------------------------------------------------------
  // Screen layout
  // ---------------------------------------------------------------------------
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    flex: 1,
  },
  footerButtonBase: {
    flex: 1,
  },
  footerButtonPrimary: {
    flex: 2,
  },
  archiveButton: {
    borderColor: theme.colors.error,
  },

  // ---------------------------------------------------------------------------
  // Form fields (icon selector + parent selector share the same row shape)
  // ---------------------------------------------------------------------------
  field: {
    gap: theme.spacing.xs,
  },
  fieldLabel: {
    marginBottom: theme.spacing.xs,
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    minHeight: 48,
  },
  selectorRowDisabled: {
    opacity: 0.5,
  },
  selectorRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  // ---------------------------------------------------------------------------
  // Color dot (used inside the parent selector row)
  // ---------------------------------------------------------------------------
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // ---------------------------------------------------------------------------
  // ParentPickerModal (inline bottom sheet — lives in the same file)
  // ---------------------------------------------------------------------------
  pickerOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  pickerSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: '60%',
    paddingBottom: theme.spacing.xl,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    minHeight: 48,
  },
  pickerRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  pickerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.xs,
  },
  pickerIconGap: {
    marginRight: theme.spacing.xs,
  },
});