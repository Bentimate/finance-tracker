import React from 'react';
import {Text, TextProps, StyleSheet} from 'react-native';
import {theme} from '../theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'label' | 'caption' | 'amount';
  color?: keyof typeof theme.colors;
  weight?: keyof typeof theme.typography.fontWeights;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'text',
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyle = styles[variant];
  const colorStyle = {color: theme.colors[color]};
  const weightStyle = weight ? {fontWeight: theme.typography.fontWeights[weight]} : {};
  const alignStyle = {textAlign: align};

  return (
    <Text
      style={[variantStyle, colorStyle, weightStyle, alignStyle, style]}
      {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    lineHeight: 34,
  },
  h2: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    lineHeight: 28,
  },
  h3: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    lineHeight: 24,
  },
  body: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.normal,
    lineHeight: 22,
  },
  label: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.medium,
    lineHeight: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  caption: {
    fontSize: theme.typography.fontSizes.xs,
    fontWeight: theme.typography.fontWeights.normal,
    lineHeight: 16,
  },
  amount: {
    fontSize: theme.typography.fontSizes.xxl,
    fontWeight: theme.typography.fontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
});
