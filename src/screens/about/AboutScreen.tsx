import React from "react";
import {
  View,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../theme";
import { Text, Header } from "../../components/common";
import { _t } from "../../locales";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import pkg from "../../../package.json";

const AboutScreen = () => {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const handleEmail = () => {
    Linking.openURL("mailto:jaafar.ali.in@gmail.com");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("common.about")} showBack />

      <View style={styles.content}>
        <View
          style={[
            styles.logoContainer,
            { backgroundColor: theme.colors.primary + "15" },
          ]}
        >
          <MaterialCommunityIcons
            name="cow"
            size={60}
            color={theme.colors.primary}
          />
        </View>

        <Text
          variant="h1"
          style={[styles.appName, { color: theme.colors.text }]}
        >
          {_t("farm.title")}
        </Text>

        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.infoRow}>
            <Text
              style={[styles.label, { color: theme.colors.text, opacity: 0.6 }]}
            >
              {_t("common.app_version")}
            </Text>
            <Text style={[styles.value, { color: theme.colors.primary }]}>
              {pkg.version}
            </Text>
          </View>

          <View
            style={[
              styles.divider,
              { backgroundColor: theme.colors.text + "10" },
            ]}
          />

          <TouchableOpacity onPress={handleEmail} style={styles.devContainer}>
            <Text
              style={[styles.label, { color: theme.colors.text, opacity: 0.6 }]}
            >
              {_t("common.developed_by")}
            </Text>
            <Text
              variant="h3"
              style={[styles.devName, { color: theme.colors.text }]}
            >
              Jaafar Ali
            </Text>
            <View style={styles.emailRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={16}
                color={theme.colors.primary}
              />
              <Text style={[styles.email, { color: theme.colors.primary }]}>
                jaafar.ali.in@gmail.com
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.footer, { color: theme.colors.text, opacity: 0.4 }]}
        >
          © {currentYear} All Rights Reserved
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    marginBottom: 40,
  },
  infoCard: {
    width: "100%",
    borderRadius: 24,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  devContainer: {
    alignItems: "center",
  },
  devName: {
    marginTop: 8,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 6,
  },
  email: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    fontSize: 12,
  },
});

export default AboutScreen;
