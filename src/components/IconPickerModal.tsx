import React, {useState, useMemo, useCallback} from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TextInput,
  SectionList,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {theme} from '../theme';
import {Typography} from './Typography';
import {ICON_GROUPS, ALL_ICONS, IconGroup} from '../icons';
import {styles} from './styles/IconPickerModal.styles';

interface Props {
  visible: boolean;
  selectedIcon: string | null;
  onSelect: (icon: string | null) => void;
  onClose: () => void;
}

const ICON_SIZE = 26;
const NUM_COLUMNS = 6;

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

const IconPickerModal: React.FC<Props> = ({
  visible,
  selectedIcon,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const handleSelect = useCallback(
    (name: string) => {
      onSelect(selectedIcon === name ? null : name);
      onClose();
    },
    [selectedIcon, onSelect, onClose],
  );

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

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
        <View style={styles.header}>
          <Typography variant="h3">Choose Icon</Typography>
          <TouchableOpacity onPress={handleClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
            <MaterialIcon name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

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
            placeholder="Search icons..."
            placeholderTextColor={theme.colors.textMuted}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>

        {selectedIcon && (
          <TouchableOpacity
            style={styles.clearRow}
            onPress={() => {
              onSelect(null);
              onClose();
            }}
            activeOpacity={0.7}>
            <MaterialIcon name="close-circle-outline" size={16} color={theme.colors.textMuted} />
            <Typography variant="caption" color="textMuted" style={styles.clearRowText}>
              Remove icon
            </Typography>
          </TouchableOpacity>
        )}

        {trimmedQuery !== '' && chunkedSections[0]?.data.length === 0 && (
          <View style={styles.emptyState}>
            <Typography variant="body" color="textMuted">
              No icons match "{query}"
            </Typography>
          </View>
        )}

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

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export default IconPickerModal;
