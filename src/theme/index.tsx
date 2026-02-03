import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { lightTheme, AppTheme } from "./light";
import { darkTheme } from "./dark";

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
  const [mode, setMode] = useState<"light" | "dark">(
    systemColorScheme === "dark" ? "dark" : "light",
  );

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = {
    theme,
    isDark: theme.dark,
    setMode,
    mode,
  };

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
