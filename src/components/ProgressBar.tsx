import React from 'react';
import {View, ViewProps} from 'react-native';
import {theme} from '../theme';
import {styles} from './styles/ProgressBar.styles';

interface ProgressBarProps extends ViewProps {
  progress: number; // 0 to 1
  color?: string;
}

/**
 * A reusable progress bar component.
 * @param progress - The progress value from 0 to 1.
 * @param color - The color of the progress fill.
 */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = theme.colors.primary,
  style,
  ...props
}) => {
  const percentage = Math.min(Math.max(progress, 0), 1) * 100;
  return (
    <View style={[styles.container, style]} {...props}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};
