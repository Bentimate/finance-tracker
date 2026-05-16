import React from 'react';
import {Text, TextProps} from 'react-native';
import {theme} from '../theme';
import {styles} from './styles/Typography.styles';

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
