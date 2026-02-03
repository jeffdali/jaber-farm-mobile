import React from "react";
import { View, StyleSheet, I18nManager, Image } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import {
  DashboardScreen,
  AnimalsListScreen,
  SalesListScreen,
  SaleDetailsScreen,
  PurchasesListScreen,
  ExpensesListScreen,
  ExpenseDetailsScreen,
  AnimalTypesScreen,
  AnimalDetailsScreen,
  ProfileScreen,
  AboutScreen,
  SettingsScreen,
} from "../screens";
import { DrawerParamList, BottomTabParamList } from "./types";
import { useTheme } from "../theme";
import { _t, useLanguage } from "../locales";
import { Text } from "../components/common";
import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { logout } from "../redux/auth/authSlice";

const Drawer = createDrawerNavigator<DrawerParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * Custom Drawer Content
 * Uses standard DrawerItemList and DrawerItem components for native RTL support.
 * No manual row-reversing or margin hacks.
 */
const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
    >
      {/* User Header */}
      <View
        style={[styles.drawerHeader, { backgroundColor: theme.colors.card }]}
      >
        <View
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.avatarText}>
            {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
          </Text>
        </View>
        <Text variant="h3" style={{ color: theme.colors.text, marginTop: 10 }}>
          {user ? `${user.first_name} ${user.last_name}` : _t("common.profile")}
        </Text>
        <Text variant="body" style={{ color: theme.colors.text, opacity: 0.7 }}>
          {user?.email || ""}
        </Text>
      </View>

      {/* Navigation Items - uses native RTL layout */}
      <View style={styles.drawerItemsContainer}>
        <DrawerItemList {...props} />
      </View>

      {/* Logout Button - uses standard DrawerItem for native RTL support */}
      <DrawerItem
        label={_t("common.logout") || "Logout"}
        labelStyle={{ color: theme.colors.error }}
        icon={({ size }) => (
          <MaterialCommunityIcons
            name="logout"
            size={size}
            color={theme.colors.error}
          />
        )}
        onPress={handleLogout}
        style={[styles.logoutItem, { borderTopColor: theme.colors.border }]}
      />
    </DrawerContentScrollView>
  );
};

/**
 * Bottom Tab Navigator
 */
const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.colors.card },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: _t("farm.dashboard"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyFarm"
        component={AnimalsListScreen}
        options={{
          title: _t("farm.title"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cow" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Sales"
        component={SalesListScreen}
        options={{
          title: _t("farm.sales"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Purchases"
        component={PurchasesListScreen}
        options={{
          title: _t("farm.purchases"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="basket-plus"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpensesListScreen}
        options={{
          title: _t("farm.expenses"),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cash-multiple"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Main Navigator (Drawer)
 *
 * RTL Strategy:
 * 1. drawerPosition uses I18nManager.isRTL directly (single source of truth)
 * 2. Key includes I18nManager.isRTL to force remount on RTL change
 * 3. All styles use logical properties (no left/right)
 * 4. Uses standard DrawerItem components which handle RTL natively
 */
const MainNavigator = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();

  // Single source of truth for RTL
  const rtl = I18nManager.isRTL;

  return (
    <Drawer.Navigator
      key={`drawer-${language}-${rtl}`}
      initialRouteName="HomeTabs"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: rtl ? "right" : "left",
        drawerType: "front",
        overlayColor: "rgba(0,0,0,0.5)",
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurface,
        drawerStyle: {
          backgroundColor: theme.colors.card,
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
        },
        drawerItemStyle: {
          marginVertical: 2,
          borderRadius: 8,
        },
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={TabNavigator}
        options={{
          title: _t("farm.dashboard"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="MyFarm"
        component={AnimalsListScreen}
        options={{
          title: _t("farm.title"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cow" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Sales"
        component={SalesListScreen}
        options={{
          title: _t("farm.sales"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Purchases"
        component={PurchasesListScreen}
        options={{
          title: _t("farm.purchases"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="basket-plus"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Expenses"
        component={ExpensesListScreen}
        options={{
          title: _t("farm.expenses"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cash-multiple"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="AnimalTypes"
        component={AnimalTypesScreen}
        options={{
          title: _t("farm.animals"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="shape-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: _t("common.profile"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: _t("common.about"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="information"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: _t("settings.title"),
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="AnimalDetails"
        component={AnimalDetailsScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="SaleDetails"
        component={SaleDetailsScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="PurchaseDetails"
        component={PurchasesListScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="ExpenseDetails"
        component={ExpenseDetailsScreen}
        options={{
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  drawerHeader: {
    padding: 20,
    paddingTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
  },
  drawerItemsContainer: {
    flex: 1,
    marginTop: 10,
  },
  logoutItem: {
    borderTopWidth: 1,
    marginTop: "auto",
  },
});

export default MainNavigator;
