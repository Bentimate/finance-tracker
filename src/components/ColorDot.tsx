import React from 'react';
import {View, StyleSheet} from 'react-native';
import {theme} from '../theme';

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

const styles = StyleSheet.create({
  dot: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
});
