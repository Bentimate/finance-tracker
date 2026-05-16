import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ParentCategory} from '../../types';
import {ColorDot} from '../ColorDot';
import {Typography} from '../Typography';
import {theme} from '../../theme';
import {styles} from '../styles/CategoryPickerModalRows.styles';

interface ParentRowProps {
  parent: ParentCategory;
  isSelected: boolean;
  onPress: () => void;
}

export const ParentRow: React.FC<ParentRowProps> = ({parent, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.row, isSelected && styles.rowSelected]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={parent.name}
    accessibilityState={{selected: isSelected}}>
    <View style={styles.rowLeft}>
      {parent.icon ? (
        <MaterialIcon name={parent.icon} size={20} color={parent.color} style={styles.rowIcon} />
      ) : (
        <ColorDot color={parent.color} />
      )}
      <Typography variant="body" color={isSelected ? 'primary' : 'text'}>
        {parent.name}
      </Typography>
    </View>
    <View style={styles.rowRight}>
      {isSelected && <MaterialIcon name="check" size={18} color={theme.colors.primary} />}
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
