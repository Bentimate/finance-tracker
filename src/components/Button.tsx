import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import {theme} from '../theme';
import {Typography} from './Typography';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'secondary': return styles.secondary;
      case 'outline': return styles.outline;
      case 'ghost': return styles.ghost;
      case 'danger': return styles.danger;
      default: return styles.primary;
    }
  };

  const getTextColor = (): keyof typeof theme.colors => {
    if (disabled) return 'textMuted';
    if (variant === 'outline' || variant === 'ghost') return 'primary';
    if (variant === 'danger') return 'error';
    return 'surface';
  };

  const paddingStyle = {
    paddingVertical: size === 'sm' ? theme.spacing.xs : size === 'lg' ? theme.spacing.lg : theme.spacing.md,
    paddingHorizontal: size === 'sm' ? theme.spacing.md : size === 'lg' ? theme.spacing.xl : theme.spacing.lg,
  };

  return (
    <TouchableOpacity
      style={[styles.button, getVariantStyle(), paddingStyle, style, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.surface : theme.colors.primary} size="small" />
      ) : (
        <View style={styles.content}>
          {icon}
          <Typography
            variant="label"
            color={getTextColor()}
            weight="semibold"
            style={[styles.text, textStyle, !!icon && {marginLeft: theme.spacing.sm}]}>
            {title}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.5,
  },
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.textSecondary,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
});
