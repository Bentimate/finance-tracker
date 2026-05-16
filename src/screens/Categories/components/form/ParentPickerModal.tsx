import React from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {BottomSheet} from '../../../../components/BottomSheet';
import {Typography} from '../../../../components/Typography';
import {Category} from '../../../../types';
import {theme} from '../../../../theme';
import {styles} from '../../styles/CategoryFormScreen.styles';

interface Props {
  visible: boolean;
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onClose: () => void;
}

export const ParentPickerModal: React.FC<Props> = ({
  visible,
  categories,
  selectedId,
  onSelect,
  onClose,
}) => {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.pickerHeader}>
        <Typography variant="h3">Parent Category</Typography>
        <TouchableOpacity onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
          <MaterialIcon name="close" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.pickerRow} onPress={() => onSelect(null)} activeOpacity={0.7}>
          <Typography variant="body" color={selectedId === null ? 'primary' : 'text'}>
            None (top-level category)
          </Typography>
          {selectedId === null && <MaterialIcon name="check" size={18} color={theme.colors.primary} />}
        </TouchableOpacity>

        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={styles.pickerRow}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.7}>
            <View style={styles.pickerRowLeft}>
              <View style={[styles.pickerDot, {backgroundColor: cat.color}]} />
              {cat.icon && <MaterialIcon name={cat.icon} size={18} color={cat.color} style={styles.pickerIconGap} />}
              <Typography variant="body" color={selectedId === cat.id ? 'primary' : 'text'}>
                {cat.name}
              </Typography>
            </View>
            {selectedId === cat.id && <MaterialIcon name="check" size={18} color={theme.colors.primary} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </BottomSheet>
  );
};
