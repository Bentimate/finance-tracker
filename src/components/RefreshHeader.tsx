import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import {Appbar, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';

interface RefreshHeaderProps {
  title: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

/**
 * RefreshHeader Component
 *
 * A Material UI AppBar header with a refresh button on the right.
 * Shows a loading spinner when data is being refreshed.
 */
export const RefreshHeader: React.FC<RefreshHeaderProps> = ({
  title,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <SafeAreaView style={{backgroundColor: theme.colors.primary}} edges={['top']}>
      <Appbar.Header
        style={{backgroundColor: theme.colors.primary}}
        elevated={false}
      >
        <Appbar.Content
          title={title}
          titleStyle={{color: '#ffffff', fontWeight: '600', fontSize: 24}}
        />
        <IconButton
          icon={() =>
            isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <MaterialIcon name="refresh" size={28} color="#ffffff" />
            )
          }
          onPress={onRefresh}
          disabled={isLoading}
          size={28}
        />
      </Appbar.Header>
    </SafeAreaView>
  );
};
