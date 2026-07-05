import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, Platform} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionListScreen from '../screens/Transactions/TransactionListScreen';
import CalendarScreen from '../screens/Transactions/CalendarScreen';
import TransactionFormScreen from '../screens/Transactions/TransactionFormScreen';
import RecurringTransactionFormScreen from '../screens/Transactions/RecurringTransactionFormScreen';
import AccountsScreen from '../screens/Accounts/AccountsScreen';
import AccountFormScreen from '../screens/Accounts/AccountFormScreen';
import TransferFormScreen from '../screens/Accounts/TransferFormScreen';
import CategoryListScreen from '../screens/Categories/CategoryListScreen';
import CategoryFormScreen from '../screens/Categories/CategoryFormScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import {RefreshHeader} from '../components/RefreshHeader';

import {theme} from '../theme';
import {styles} from './styles/AppNavigator.styles';
import {
  RootTabParamList,
  TransactionStackParamList,
  AccountStackParamList,
  CategoryStackParamList,
} from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const TransactionStack = createNativeStackNavigator<TransactionStackParamList>();
const AccountStack = createNativeStackNavigator<AccountStackParamList>();
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
      name="CalendarView"
      component={CalendarScreen}
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isLoading = params?.isLoading || false;
          return (
            <RefreshHeader
              title="Calendar"
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
    <TransactionStack.Screen
      name="RecurringTransactionForm"
      component={RecurringTransactionFormScreen}
      options={({route}) => ({
        title: route.params?.recurringTransactionId ? 'Edit Recurrence' : 'New Recurrence',
      })}
    />
  </TransactionStack.Navigator>
);

const AccountNavigator = () => (
  <AccountStack.Navigator screenOptions={{headerShown: true}}>
    <AccountStack.Screen
      name="AccountList"
      component={TransactionListScreen}
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isLoading = params?.isLoading || false;
          return (
            <RefreshHeader
              title="Accounts"
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          );
        },
      })}
    />
    <AccountStack.Screen
      name="ManageAccounts"
      component={AccountsScreen}
      options={({route}) => ({
        header: () => {
          const params = route.params as any;
          const handleRefresh = params?.handleRefresh || (() => {});
          const isLoading = params?.isLoading || false;
          return (
            <RefreshHeader
              title="Manage Accounts"
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          );
        },
      })}
    />
    <AccountStack.Screen
      name="AccountForm"
      component={AccountFormScreen}
      options={({route}) => ({
        title: route.params?.accountId ? 'Rename Account' : 'New Account',
      })}
    />
    <AccountStack.Screen
      name="TransferForm"
      component={TransferFormScreen}
      options={{title: 'Transfer'}}
    />
    <AccountStack.Screen
      name="TransactionForm"
      component={TransactionFormScreen}
      options={({route}) => ({
        title: route.params?.transactionId ? 'Edit Transaction' : 'New Transaction',
      })}
    />
    <AccountStack.Screen
      name="RecurringTransactionForm"
      component={RecurringTransactionFormScreen}
      options={({route}) => ({
        title: route.params?.recurringTransactionId ? 'Edit Recurrence' : 'New Recurrence',
      })}
    />
  </AccountStack.Navigator>
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
    Calendar: 'calendar-month-outline',
    Accounts: 'wallet-outline',
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
        initialRouteName="Accounts"
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
        <Tab.Screen name="Calendar" component={TransactionNavigator} />
        <Tab.Screen name="Accounts" component={AccountNavigator} />
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
