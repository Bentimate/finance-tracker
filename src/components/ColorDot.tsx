import React from 'react';
import {View} from 'react-native';
import {styles} from './styles/ColorDot.styles';

interface ColorDotProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ColorDot: React.FC<ColorDotProps> = ({color, size = 'md'}) => {
  const dimension = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;

  return (
    <View
      style={[
        styles.dot,
        {
          backgroundColor: color,
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
        },
      ]}
    />
  );
};
