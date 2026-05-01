import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {Typography} from '../../../components/Typography';
import {styles} from '../styles/CategoryFormScreen.styles';
import {theme} from '../../../theme';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const PRESET_COLORS = [
  theme.colors.indigo,
  theme.colors.error,
  theme.colors.amber,
  theme.colors.emerald,
  theme.colors.blue,
  theme.colors.pink,
  theme.colors.violet,
  theme.colors.cyan,
  theme.colors.orange,
  theme.colors.slate,
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorSelect,
}) => {
  return (
    <View style={styles.colorSection}>
      <Typography variant="label" color="textSecondary">
        Select Color
      </Typography>
      <View style={styles.colorGrid}>
        {PRESET_COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorOption,
              selectedColor === c && styles.colorOptionSelected,
            ]}
            onPress={() => onColorSelect(c)}>
            <View style={[styles.colorInner, {backgroundColor: c}]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
