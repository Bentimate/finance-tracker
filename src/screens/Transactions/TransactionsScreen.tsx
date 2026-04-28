import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './TransactionsScreen.styles';

const TransactionsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>
          Day · Week · Month views · Add / Edit / Delete
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default TransactionsScreen;
