import React, {useState, useMemo, useCallback} from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SectionList,
  Pressable,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {theme} from '../theme';
import {Typography} from './Typography';
import {ICON_GROUPS, ALL_ICONS, IconGroup} from '../icons';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  visible: boolean;
  selectedIcon: string | null;
  /** Called with the chosen icon name, or null if the user clears the selection. */
  onSelect: (icon: string | null) => void;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICON_SIZE = 26;
const CELL_SIZE = 52; // touchable area per icon cell
const NUM_COLUMNS = 6;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface IconCellProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

const IconCell: React.FC<IconCellProps> = ({name, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.iconCell, isSelected && styles.iconCellSelected]}
    onPress={onPress}
    activeOpacity={0.65}
    accessibilityRole="button"
    accessibilityLabel={name}
    accessibilityState={{selected: isSelected}}>
    <MaterialIcon
      name={name}
      size={ICON_SIZE}
      color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
    />
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const IconPickerModal: React.FC<Props> = ({
  visible,
  selectedIcon,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const handleSelect = useCallback(
    (name: string) => {
      // Tapping the already-selected icon deselects (clears) it
      onSelect(selectedIcon === name ? null : name);
      onClose();
    },
    [selectedIcon, onSelect, onClose],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  // When the user is searching, flatten to a single section of filtered results.
  // Otherwise, show the full grouped list.
  const trimmedQuery = query.trim().toLowerCase();

  const sections = useMemo(() => {
    if (trimmedQuery) {
      const filtered = ALL_ICONS.filter(icon => icon.includes(trimmedQuery));
      return [{label: 'Results', icons: filtered}];
    }
    return ICON_GROUPS;
  }, [trimmedQuery]);

  const renderSectionHeader = useCallback(
    ({section}: {section: IconGroup}) => (
      <View style={styles.sectionHeader}>
        <Typography variant="label" color="textMuted">
          {section.label.toUpperCase()}
        </Typography>
      </View>
    ),
    [],
  );

  const renderItem = useCallback(
    ({item: icons}: {item: string[]}) => (
      <View style={styles.row}>
        {icons.map(name => (
          <IconCell
            key={name}
            name={name}
            isSelected={selectedIcon === name}
            onPress={() => handleSelect(name)}
          />
        ))}
      </View>
    ),
    [selectedIcon, handleSelect],
  );

  // SectionList expects items per section; we chunk each section's icons into
  // rows of NUM_COLUMNS so renderItem receives a pre-grouped array.
  const chunkedSections = useMemo(
    () =>
      sections.map(section => ({
        ...section,
        data: chunkArray(section.icons, NUM_COLUMNS),
      })),
    [sections],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h3">Choose Icon</Typography>
          <TouchableOpacity onPress={handleClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <MaterialIcon name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcon
            name="magnify"
            size={18}
            color={theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search icons…"
            placeholderTextColor={theme.colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>

        {/* Clear selection shortcut — only shown when an icon is selected */}
        {selectedIcon && (
          <TouchableOpacity
            style={styles.clearRow}
            onPress={() => {
              onSelect(null);
              onClose();
            }}
            activeOpacity={0.7}>
            <MaterialIcon name="close-circle-outline" size={16} color={theme.colors.textMuted} />
            <Typography variant="caption" color="textMuted" style={{marginLeft: 4}}>
              Remove icon
            </Typography>
          </TouchableOpacity>
        )}

        {/* Empty search state */}
        {trimmedQuery !== '' && chunkedSections[0]?.data.length === 0 && (
          <View style={styles.emptyState}>
            <Typography variant="body" color="textMuted">
              No icons match "{query}"
            </Typography>
          </View>
        )}

        {/* Icon grid */}
        <SectionList
          sections={chunkedSections}
          keyExtractor={(_item, index) => String(index)}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
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
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    margin: 2,
  },
  iconCellSelected: {
    backgroundColor: `${theme.colors.primary}18`, // indigo at ~10% opacity
  },
  emptyState: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
});

export default IconPickerModal;
