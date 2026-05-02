import React from 'react';
import {TouchableOpacity, View, StyleSheet, ViewStyle} from 'react-native';
import {theme} from '../theme';
import {Typography} from './Typography';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  selected?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  onPress,
  selected,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        style
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.6}>
      <View style={styles.leftContent}>
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        <View style={styles.textContent}>
          <Typography
            variant="body"
            weight={selected ? 'bold' : 'medium'}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </View>
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    ...theme.shadow,
  },
  selected: {
    backgroundColor: theme.colors.border,
    borderColor: theme.colors.primary + '30',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftElement: {
    marginRight: theme.spacing.md,
  },
  textContent: {
    flex: 1,
  },
  rightElement: {
    marginLeft: theme.spacing.sm,
  },
});
