import React from 'react';
import {View, Text} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {styles} from './BudgetsScreen.styles';

const BudgetsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={styles.content}>
        <Text style={styles.title}>Budgets</Text>
        <Text style={styles.subtitle}>
          Per-category budgets · Weekly / Monthly · Progress bars
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default BudgetsScreen;
