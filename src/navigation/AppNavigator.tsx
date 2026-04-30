import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

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

function TabIcon({label, color, size}: {label: keyof RootTabParamList; color: string; size: number}) {
  const icons: Record<keyof RootTabParamList, string> = {
    Dashboard: 'view-dashboard-outline',
    Transactions: 'swap-vertical',
    Budgets: 'chart-arc',
    Categories: 'folder-outline',
    Settings: 'cog-outline',
  };
  return <MaterialIcon name={icons[label] ?? 'circle'} size={size} color={color} />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({color, size}) => <TabIcon label={route.name} color={color} size={size} />,
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
