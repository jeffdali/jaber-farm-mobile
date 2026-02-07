import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import {
  AnimalDetailsScreen,
  SaleDetailsScreen,
  ExpenseDetailsScreen,
  PurchasesListScreen,
} from "../screens";
import { RootStackParamList } from "./types";
import { useTheme } from "../theme";
import { useAppSelector } from "../redux/hooks";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { theme, mode } = useTheme();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="AnimalDetails"
              component={AnimalDetailsScreen}
            />
            <Stack.Screen name="SaleDetails" component={SaleDetailsScreen} />
            <Stack.Screen
              name="PurchaseDetails"
              component={PurchasesListScreen}
            />
            <Stack.Screen
              name="ExpenseDetails"
              component={ExpenseDetailsScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
