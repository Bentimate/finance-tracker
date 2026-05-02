import React from 'react';
import {View} from 'react-native';
import {Typography} from './Typography';
import {styles} from './styles/EmptyState.styles';

interface EmptyStateProps {
  message: string;
}

/**
 * A reusable component to display a message when a list is empty.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({message}) => {
  return (
    <View style={styles.container}>
      <Typography variant="body" color="textMuted" align="center">
        {message}
      </Typography>
    </View>
  );
};
