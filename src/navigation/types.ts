export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  AnimalDetails: { 
    animal?: import("../services/animals.service").Animal;
    animalId?: number;
  };
  SaleDetails: { sale: import("../services/finance.service").Sale };
  PurchaseDetails: { purchase: any };
  ExpenseDetails: { expense: import("../services/finance.service").Expense };
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
};

export type BottomTabParamList = {
  Dashboard: undefined;
  MyFarm: undefined;
  Sales: undefined;
  Purchases: undefined;
  Expenses: undefined;
};
