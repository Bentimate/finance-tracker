import { NavigatorScreenParams } from '@react-navigation/native';

export type CategoryStackParamList = {
  CategoryList: undefined;
  CategoryForm: { categoryId?: number };
};

export type AccountStackParamList = {
  AccountList: undefined;
  ManageAccounts: undefined;
  AccountForm: { accountId?: number };
  TransferForm: undefined;
  TransactionForm: { transactionId?: number; accountId?: number } | undefined;
  RecurringTransactionForm:
    | { recurringTransactionId?: number; accountId?: number }
    | undefined;
};

export type TransactionStackParamList = {
  CalendarView: { accountId?: number } | undefined;
  TransactionForm: { transactionId?: number; accountId?: number } | undefined;
  RecurringTransactionForm:
    | { recurringTransactionId?: number; accountId?: number }
    | undefined;
};

export type BudgetStackParamList = {
  BudgetList: undefined;
  BudgetForm: { categoryId: number };
};

export type RootTabParamList = {
  Dashboard: {accountId?: number} | undefined;
  Calendar: NavigatorScreenParams<TransactionStackParamList>;
  Accounts: NavigatorScreenParams<AccountStackParamList>;
  Categories: NavigatorScreenParams<CategoryStackParamList>;
  Settings: undefined;
};
