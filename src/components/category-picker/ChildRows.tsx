import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Category, ParentCategory} from '../../types';
import {Typography} from '../Typography';
import {theme} from '../../theme';
import {ColorDot} from '../ColorDot';
import {styles} from '../styles/CategoryPickerModalRows.styles';

interface ChildRowProps {
  child: Category;
  isSelected: boolean;
  onPress: () => void;
}

export const ChildRow: React.FC<ChildRowProps> = ({child, isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.row, isSelected && styles.rowSelected]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={child.name}
    accessibilityState={{selected: isSelected}}>
    <View style={styles.rowLeft}>
      {child.icon ? (
        <MaterialIcon name={child.icon} size={20} color={child.color} style={styles.rowIcon} />
      ) : (
        <ColorDot color={child.color} />
      )}
      <Typography variant="body" color={isSelected ? 'primary' : 'text'}>
        {child.name}
      </Typography>
    </View>
    {isSelected && <MaterialIcon name="check" size={18} color={theme.colors.primary} />}
  </TouchableOpacity>
);

interface OthersRowProps {
  parent: ParentCategory;
  isSelected: boolean;
  onPress: () => void;
}

export const OthersRow: React.FC<OthersRowProps> = ({isSelected, onPress}) => (
  <TouchableOpacity
    style={[styles.row, styles.othersRow, isSelected && styles.rowSelected]}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel="Others"
    accessibilityState={{selected: isSelected}}>
    <View style={styles.rowLeft}>
      <MaterialIcon name="dots-horizontal" size={20} color={theme.colors.textMuted} style={styles.rowIcon} />
      <Typography variant="body" color={isSelected ? 'primary' : 'textMuted'}>
        Others
      </Typography>
    </View>
    {isSelected && <MaterialIcon name="check" size={18} color={theme.colors.primary} />}
  </TouchableOpacity>
);
