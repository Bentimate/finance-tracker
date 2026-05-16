import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  Animated,
} from 'react-native';
import {theme} from '../theme';
import {Typography} from './Typography';
import {styles} from './styles/Input.styles';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const borderOpacity = React.useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(borderOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onBlur?.(e);
  };

  const borderColor = borderOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.border, theme.colors.primary],
  });

  return (
    <View style={styles.container}>
      {label && (
        <Typography
          variant="label"
          color={isFocused ? 'primary' : 'textSecondary'}
          style={styles.label}>
          {label}
        </Typography>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          {borderColor: error ? theme.colors.error : borderColor},
          isFocused && styles.inputFocused,
        ]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {(error || helperText) && (
        <Typography
          variant="caption"
          color={error ? 'error' : 'textMuted'}
          style={styles.helperText}>
          {error || helperText}
        </Typography>
      )}
    </View>
  );
};
