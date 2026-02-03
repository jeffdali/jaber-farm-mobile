import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme";
import { Text, Header } from "../../components/common";
import { _t } from "../../locales";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useLanguage } from "../../locales";

const SettingsScreen = () => {
  const { theme, mode, setMode } = useTheme();
  const { language, setLanguage } = useLanguage();

  const SettingsOption = ({
    label,
    isSelected,
    onPress,
    icon,
  }: {
    label: string;
    isSelected: boolean;
    onPress: () => void;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.option,
          {
            backgroundColor: theme.colors.card,
            borderColor: isSelected ? theme.colors.primary : "transparent",
            borderWidth: 1,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.optionLeft}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={isSelected ? theme.colors.primary : theme.colors.onSurface}
          />
          <Text
            style={[
              styles.optionLabel,
              {
                color: isSelected ? theme.colors.primary : theme.colors.text,
                fontWeight: isSelected ? "bold" : "500",
              },
            ]}
          >
            {label}
          </Text>
        </View>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={22}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("settings.title")} showBack />
      <View style={styles.content}>
        <View style={styles.section}>
          <Text
            variant="h3"
            style={[styles.sectionTitle, { color: theme.colors.text }]}
          >
            {_t("settings.theme")}
          </Text>
          <SettingsOption
            label={_t("settings.light")}
            isSelected={mode === "light"}
            onPress={() => setMode("light")}
            icon="weather-sunny"
          />
          <SettingsOption
            label={_t("settings.dark")}
            isSelected={mode === "dark"}
            onPress={() => setMode("dark")}
            icon="weather-night"
          />
        </View>

        <View style={styles.section}>
          <Text
            variant="h3"
            style={[styles.sectionTitle, { color: theme.colors.text }]}
          >
            {_t("settings.language")}
          </Text>
          <SettingsOption
            label={_t("settings.english")}
            isSelected={language === "en"}
            onPress={() => setLanguage("en")}
            icon="web"
          />
          <SettingsOption
            label={_t("settings.arabic")}
            isSelected={language === "ar"}
            onPress={() => setLanguage("ar")}
            icon="abjad-arabic"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    opacity: 0.8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Android elevation
    elevation: 3,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionLabel: {
    marginHorizontal: 16,
    fontSize: 16,
    flex: 1,
  },
});

export default SettingsScreen;
