import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionListScreen from '../screens/Transactions/TransactionListScreen';
import TransactionFormScreen from '../screens/Transactions/TransactionFormScreen';
import BudgetListScreen from '../screens/Budgets/BudgetListScreen';
import BudgetFormScreen from '../screens/Budgets/BudgetFormScreen';
import CategoryListScreen from '../screens/Categories/CategoryListScreen';
import CategoryFormScreen from '../screens/Categories/CategoryFormScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

import {theme} from '../theme';
import {styles} from './styles/AppNavigator.styles';
import {
  RootTabParamList,
  TransactionStackParamList,
  BudgetStackParamList,
  CategoryStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const TransactionStack = createNativeStackNavigator<TransactionStackParamList>();
const BudgetStack = createNativeStackNavigator<BudgetStackParamList>();
const CategoryStack = createNativeStackNavigator<CategoryStackParamList>();

const TransactionNavigator = () => (
  <TransactionStack.Navigator screenOptions={{headerShown: true}}>
    <TransactionStack.Screen
      name="TransactionList"
      component={TransactionListScreen}
      options={{title: 'Transactions'}}
    />
    <TransactionStack.Screen
      name="TransactionForm"
      component={TransactionFormScreen}
      options={({route}) => ({
        title: route.params?.transactionId ? 'Edit Transaction' : 'New Transaction',
      })}
    />
  </TransactionStack.Navigator>
);

const BudgetNavigator = () => (
  <BudgetStack.Navigator screenOptions={{headerShown: true}}>
    <BudgetStack.Screen
      name="BudgetList"
      component={BudgetListScreen}
      options={{title: 'Budgets'}}
    />
    <BudgetStack.Screen
      name="BudgetForm"
      component={BudgetFormScreen}
      options={{title: 'Setup Budget'}}
    />
  </BudgetStack.Navigator>
);

const CategoryNavigator = () => (
  <CategoryStack.Navigator screenOptions={{headerShown: true}}>
    <CategoryStack.Screen
      name="CategoryList"
      component={CategoryListScreen}
      options={{title: 'Categories'}}
    />
    <CategoryStack.Screen
      name="CategoryForm"
      component={CategoryFormScreen}
      options={({route}) => ({
        title: route.params?.categoryId ? 'Edit Category' : 'New Category',
      })}
    />
  </CategoryStack.Navigator>
);

interface TabIconProps {
  label: keyof RootTabParamList;
}

function TabIcon({label}: TabIconProps) {
  const icons: Record<keyof RootTabParamList, string> = {
    Dashboard: '⬡',
    Transactions: '↕',
    Budgets: '◫',
    Categories: '📁',
    Settings: '⚙',
  };
  return <Text style={styles.icon}>{icons[label] ?? '•'}</Text>;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: () => <TabIcon label={route.name} />,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: styles.tabBar,
          headerShown: false,
        })}>
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{title: 'Dashboard', headerShown: true}}
        />
        <Tab.Screen name="Transactions" component={TransactionNavigator} />
        <Tab.Screen name="Budgets" component={BudgetNavigator} />
        <Tab.Screen name="Categories" component={CategoryNavigator} />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Settings', headerShown: true}}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
