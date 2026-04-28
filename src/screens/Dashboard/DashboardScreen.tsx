import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './DashboardScreen.styles';

const DashboardScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Cash flow summary · Top spending · Trend chart
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;
