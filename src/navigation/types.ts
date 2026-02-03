export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
};

export type DrawerParamList = {
  HomeTabs: undefined;
  MyFarm: undefined;
  Sales: undefined;
  Purchases: undefined;
  Expenses: undefined;
  AnimalTypes: undefined;
  Profile: undefined;
  About: undefined;
  Settings: undefined;
  AnimalDetails: { animal: import("../services/animals.service").Animal };
  SaleDetails: { sale: import("../services/finance.service").Sale };
  PurchaseDetails: { purchase: import("../services/finance.service").Purchase };
  ExpenseDetails: { expense: import("../services/finance.service").Expense };
};

export type BottomTabParamList = {
  Dashboard: undefined;
  MyFarm: undefined;
  Sales: undefined;
  Purchases: undefined;
  Expenses: undefined;
};
