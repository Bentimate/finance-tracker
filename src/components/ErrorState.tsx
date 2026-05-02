import React from 'react';
import {View} from 'react-native';
import {Typography} from './Typography';
import {Button} from './Button';
import {styles} from './styles/ErrorState.styles';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

/**
 * A reusable error state component with a message and a retry button.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({message, onRetry}) => (
  <View style={styles.container}>
    <Typography variant="body" color="error" align="center" style={styles.message}>
      {message}
    </Typography>
    <Button title="Retry" onPress={onRetry} style={styles.retryBtn} />
  </View>
);
