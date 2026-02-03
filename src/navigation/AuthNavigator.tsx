import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SplashScreen, LoginScreen } from "../screens";
import { RootStackParamList } from "./types";
import { Header } from "../components/common";
import { _t } from "../locales";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: _t("common.login") }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
