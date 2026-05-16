import React, {useState, useCallback} from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import {theme} from '../theme';
import {Typography} from './Typography';
import {ColorDot} from './ColorDot';
import {BottomSheet} from './BottomSheet';
import {ParentCategory, Category} from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Nested categories from categoryRepository.getAllNested() */
  categories: ParentCategory[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number) => void;
}

type Step = 'parent' | 'child';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const CategoryPickerModal: React.FC<Props> = ({
  visible,
  onClose,
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const [step, setStep] = useState<Step>('parent');
  const [pendingParent, setPendingParent] = useState<ParentCategory | null>(null);

  // Reset to step 1 whenever the modal opens
  const handleOpen = useCallback(() => {
    setStep('parent');
    setPendingParent(null);
  }, []);

  const handleClose = useCallback(() => {
    setStep('parent');
    setPendingParent(null);
    onClose();
  }, [onClose]);

  const handleParentPress = useCallback(
    (parent: ParentCategory) => {
      if ((parent.children ?? []).length === 0) {
        // Standalone — confirm immediately, no step 2
        onSelectCategory(parent.id);
        handleClose();
      } else {
        // Has children — advance to step 2
        setPendingParent(parent);
        setStep('child');
      }
    },
    [onSelectCategory, handleClose],
  );

  const handleChildPress = useCallback(
    (child: Category | 'others') => {
      if (!pendingParent) return;
      // "Others" maps to the parent's id (per spec)
      const id = child === 'others' ? pendingParent.id : child.id;
      onSelectCategory(id);
      handleClose();
    },
    [pendingParent, onSelectCategory, handleClose],
  );

  const handleBack = useCallback(() => {
    setStep('parent');
    setPendingParent(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} maxHeight={480}>
      {/* Header */}
      <View style={styles.header}>
        {step === 'child' ? (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <MaterialIcon
              name="arrow-left"
              size={22}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          // Spacer so title stays centred
          <View style={styles.headerSpacer} />
        )}

        <View style={styles.headerTitle}>
          {step === 'child' && pendingParent ? (
            <View style={styles.headerBreadcrumb}>
              {pendingParent.icon && (
                <MaterialIcon
                  name={pendingParent.icon}
                  size={16}
                  color={pendingParent.color}
                  style={styles.breadcrumbIcon}
                />
              )}
              <Typography variant="h3">{pendingParent.name}</Typography>
              <MaterialIcon
                name="chevron-right"
                size={16}
                color={theme.colors.textMuted}
              />
            </View>
          ) : (
            <Typography variant="h3">Category</Typography>
          )}
        </View>

        <TouchableOpacity
          onPress={handleClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close">
          <MaterialIcon
            name="close"
            size={22}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {step === 'parent'
          ? categories.map(parent => (
              <ParentRow
                key={parent.id}
                parent={parent}
                isSelected={selectedCategoryId === parent.id}
                onPress={() => handleParentPress(parent)}
              />
            ))
          : pendingParent && (
              <>
                {(pendingParent.children ?? []).map(child => (
                  <ChildRow
                    key={child.id}
                    child={child}
                    isSelected={selectedCategoryId === child.id}
                    onPress={() => handleChildPress(child)}
                  />
                ))}
                {/* "Others" virtual option — always last */}
                <OthersRow
                  parent={pendingParent}
                  isSelected={selectedCategoryId === pendingParent.id}
                  onPress={() => handleChildPress('others')}
                />
              </>
            )}
      </ScrollView>
    </BottomSheet>
  );
};

// ---------------------------------------------------------------------------
// Row sub-components
// ---------------------------------------------------------------------------

interface ParentRowProps {
  parent: ParentCategory;
  isSelected: boolean;
  onPress: () => void;
}

const ParentRow: React.FC<ParentRowProps> = ({parent, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.row, isSelected && styles.rowSelected]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={parent.name}
    accessibilityState={{selected: isSelected}}>
    <View style={styles.rowLeft}>
      {parent.icon ? (
        <MaterialIcon
          name={parent.icon}
          size={20}
          color={parent.color}
          style={styles.rowIcon}
        />
      ) : (
        <ColorDot color={parent.color} />
      )}
      <Typography
        variant="body"
        color={isSelected ? 'primary' : 'text'}>
        {parent.name}
      </Typography>
    </View>
    <View style={styles.rowRight}>
      {isSelected && (
        <MaterialIcon name="check" size={18} color={theme.colors.primary} />
      )}
      {(parent.children ?? []).length > 0 && (
        <MaterialIcon
          name="chevron-right"
          size={18}
          color={theme.colors.textMuted}
          style={isSelected ? styles.chevronWithCheck : undefined}
        />
      )}
    </View>
  </TouchableOpacity>
);

interface ChildRowProps {
  child: Category;
  isSelected: boolean;
  onPress: () => void;
}

const ChildRow: React.FC<ChildRowProps> = ({child, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.row, isSelected && styles.rowSelected]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={child.name}
    accessibilityState={{selected: isSelected}}>
    <View style={styles.rowLeft}>
      {child.icon ? (
        <MaterialIcon
          name={child.icon}
          size={20}
          color={child.color}
          style={styles.rowIcon}
        />
      ) : (
        <ColorDot color={child.color} />
      )}
      <Typography
        variant="body"
        color={isSelected ? 'primary' : 'text'}>
        {child.name}
      </Typography>
    </View>
    {isSelected && (
      <MaterialIcon name="check" size={18} color={theme.colors.primary} />
    )}
  </TouchableOpacity>
);

interface OthersRowProps {
  parent: ParentCategory;
  isSelected: boolean;
  onPress: () => void;
}

const OthersRow: React.FC<OthersRowProps> = ({parent, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.row, styles.othersRow, isSelected && styles.rowSelected]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel="Others"
    accessibilityState={{selected: isSelected}}>
    <View style={styles.rowLeft}>
      <MaterialIcon
        name="dots-horizontal"
        size={20}
        color={theme.colors.textMuted}
        style={styles.rowIcon}
      />
      <Typography
        variant="body"
        color={isSelected ? 'primary' : 'textMuted'}>
        Others
      </Typography>
    </View>
    {isSelected && (
      <MaterialIcon name="check" size={18} color={theme.colors.primary} />
    )}
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  headerSpacer: {
    width: 22,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  breadcrumbIcon: {
    marginRight: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    minHeight: 48,
  },
  rowSelected: {
    backgroundColor: `${theme.colors.primary}0D`, // ~5% opacity tint
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    width: 24,
    textAlign: 'center',
  },
  chevronWithCheck: {
    marginLeft: theme.spacing.xs,
  },
  othersRow: {
    opacity: 0.75,
  },
});
