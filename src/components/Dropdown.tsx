import React from 'react';
import {TouchableOpacity, View, StyleProp, ViewStyle} from 'react-native';
import {Menu} from 'react-native-paper';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Typography} from './Typography';
import {theme} from '../theme';
import {styles} from './styles/Dropdown.styles';

interface DropdownProps {
  label?: string;
  value: string;
  visible: boolean;
  onDismiss: () => void;
  onPress: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  visible,
  onDismiss,
  onPress,
  children,
  style,
}) => {
  return (
    <Menu
      visible={visible}
      onDismiss={onDismiss}
      contentStyle={styles.menuContent}
      anchor={
        <TouchableOpacity
          style={[styles.dropdownButton, style]}
          onPress={onPress}
          activeOpacity={0.75}>
          <View style={styles.textContainer}>
            {label && (
              <Typography variant="caption" color="textMuted" style={styles.label}>
                {label}
              </Typography>
            )}
            <Typography variant="body" weight="medium">
              {value}
            </Typography>
          </View>
          <MaterialIcon
            name="chevron-down"
            size={22}
            color={theme.colors.textMuted}
            style={styles.icon}
          />
        </TouchableOpacity>
      }>
      {children}
    </Menu>
  );
};
