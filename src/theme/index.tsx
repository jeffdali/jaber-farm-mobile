import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, AppTheme } from "./light";
import { darkTheme } from "./dark";

const THEME_STORAGE_KEY = "@theme_mode";

type ThemeContextType = {
  theme: AppTheme;
  isDark: boolean;
  setMode: (mode: "light" | "dark") => void;
  mode: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode === "light" || savedMode === "dark") {
          setMode(savedMode);
        } else if (systemColorScheme) {
          setMode(systemColorScheme);
        }
      } catch (e) {
        console.error("Failed to load theme", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((e) =>
        console.error("Failed to save theme", e),
      );
    }
  }, [mode, isLoaded]);

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = {
    theme,
    isDark: theme.dark,
    setMode,
    mode,
  };

  // Prevent flicker by not rendering children until theme is loaded
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export * from "./colors";
export * from "./light";
export * from "./dark";
