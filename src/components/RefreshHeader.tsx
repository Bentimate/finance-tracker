import React from 'react';
import {ActivityIndicator} from 'react-native';
import {Appbar, IconButton} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {theme} from '../theme';
import {styles} from './styles/RefreshHeader.styles';

interface RefreshHeaderProps {
  title: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const RefreshHeader: React.FC<RefreshHeaderProps> = ({
  title,
  onRefresh,
  isLoading = false,
}) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Appbar.Header style={styles.header} elevated={false}>
        <Appbar.Content title={title} titleStyle={styles.title} />
        <IconButton
          icon={() =>
            isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.surface} />
            ) : (
              <MaterialIcon name="refresh" size={28} color={theme.colors.surface} />
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
