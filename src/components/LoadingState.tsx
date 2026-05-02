import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {theme} from '../theme';
import {styles} from './styles/LoadingState.styles';

/**
 * A reusable loading state component with a centered spinner.
 */
export const LoadingState: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator color={theme.colors.primary} size="large" />
  </View>
);
