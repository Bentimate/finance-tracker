import React from 'react';
import {View, ViewProps} from 'react-native';
import {styles} from './styles/Card.styles';

/**
 * A reusable card container component with consistent styling.
 */
export const Card: React.FC<ViewProps> = ({children, style, ...props}) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};
