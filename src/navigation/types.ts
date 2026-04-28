import { NavigatorScreenParams } from '@react-navigation/native';

export type CategoryStackParamList = {
  CategoryList: undefined;
  CategoryForm: { categoryId?: number };
};

export type TransactionStackParamList = {
  TransactionList: undefined;
  TransactionForm: { transactionId?: number };
};

export type BudgetStackParamList = {
  BudgetList: undefined;
  BudgetForm: { categoryId: number };
};

export type RootTabParamList = {
  Dashboard: undefined;
  Transactions: NavigatorScreenParams<TransactionStackParamList>;
  Budgets: NavigatorScreenParams<BudgetStackParamList>;
  Categories: NavigatorScreenParams<CategoryStackParamList>;
  Settings: undefined;
};
