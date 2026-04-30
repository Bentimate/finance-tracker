import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, Platform} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionListScreen from '../screens/Transactions/TransactionListScreen';
import TransactionFormScreen from '../screens/Transactions/TransactionFormScreen';
import BudgetListScreen from '../screens/Budgets/BudgetListScreen';
import BudgetFormScreen from '../screens/Budgets/BudgetFormScreen';
import CategoryListScreen from '../screens/Categories/CategoryListScreen';
import CategoryFormScreen from '../screens/Categories/CategoryFormScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import {RefreshHeader} from '../components/RefreshHeader';

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

const DashboardStack = createNativeStackNavigator();

const DashboardNavigator = () => (
  <DashboardStack.Navigator screenOptions={{headerShown: true}}>
    <DashboardStack.Screen
      name="DashboardScreen"
      component={DashboardScreen}
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isRefreshing = params?.isRefreshing || false;
          return (
            <RefreshHeader
              title="Dashboard"
              onRefresh={handleRefresh}
              isLoading={isRefreshing}
            />
          );
        },
      })}
    />
  </DashboardStack.Navigator>
);

const TransactionNavigator = () => (
  <TransactionStack.Navigator screenOptions={{headerShown: true}}>
    <TransactionStack.Screen
      name="TransactionList"
      component={TransactionListScreen}
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isLoading = params?.isLoading || false;
          return (
            <RefreshHeader
              title="Transactions"
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          );
        },
      })}
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
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isLoading = params?.isLoading || false;
          return (
            <RefreshHeader
              title="Budgets"
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          );
        },
      })}
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
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isLoading = params?.isLoading || false;
          return (
            <RefreshHeader
              title="Categories"
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          );
        },
      })}
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
    Budgets: 'currency-usd',
    Categories: 'folder-outline',
    Settings: 'cog-outline',
  };
  return <MaterialIcon name={icons[label] ?? 'circle'} size={size} color={color} />;
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();
  // We want the bar to be taller, so we add some extra vertical padding
  // while ensuring we respect the system's safe area (insets.bottom).
  const verticalPadding = theme.spacing.md;
  const totalHeight = (Platform.OS === 'ios' ? 50 : 60) + insets.bottom + verticalPadding;

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Transactions"
        screenOptions={({route}) => ({
          tabBarIcon: ({color, size}) => <TabIcon label={route.name} color={color} size={size} />,
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarStyle: [
            styles.tabBar,
            {
              height: totalHeight,
              paddingBottom: insets.bottom + (verticalPadding / 2),
              paddingTop: verticalPadding / 2,
            },
          ],
          headerShown: false,
        })}>
        <Tab.Screen
          name="Dashboard"
          component={DashboardNavigator}
          options={{headerShown: false}}
        />
        <Tab.Screen name="Budgets" component={BudgetNavigator} />
        <Tab.Screen name="Transactions" component={TransactionNavigator} />
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
