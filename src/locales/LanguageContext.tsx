import React, { createContext, useContext, useState, useEffect } from "react";
import { I18nManager, Alert, NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "./index";
import * as Updates from "expo-updates";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en");
  const [isLoading, setIsLoading] = useState(true);

  // isRTL comes directly from I18nManager - single source of truth
  const isRTL = I18nManager.isRTL;

  useEffect(() => {
    initializeLanguage();
  }, []);

  /**
   * Initialize language on app start.
   * 1. Load stored language preference
   * 2. Sync i18n locale
   * 3. Check if RTL state matches - if not, force RTL and reload
   */
  const initializeLanguage = async () => {
    try {
      const storedLang = await AsyncStorage.getItem("user-language");
      const lang: Language = (storedLang as Language) || "en";

      setLanguageState(lang);
      i18n.locale = lang;

      const shouldBeRTL = lang === "ar";

      // If RTL state doesn't match the language, force it and reload
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);

        // Must reload for RTL changes to take effect
        setTimeout(async () => {
          try {
            await Updates.reloadAsync();
          } catch {
            if (NativeModules.DevSettings) {
              NativeModules.DevSettings.reload();
            }
          }
        }, 100);
        return; // Don't set loading to false, we're reloading
      }

      setIsLoading(false);
    } catch (e) {
      console.error("Failed to initialize language", e);
      setIsLoading(false);
    }
  };

  /**
   * Change language.
   * Stores preference, updates i18n, forces RTL if needed, and reloads app.
   */
  const setLanguage = async (lang: Language) => {
    if (lang === language) return;

    setLanguageState(lang);
    i18n.locale = lang;

    try {
      await AsyncStorage.setItem("user-language", lang);
    } catch (error) {
      console.error("Failed to persist language", error);
    }

    const shouldBeRTL = lang === "ar";

    // Force RTL change and reload
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);

      setTimeout(async () => {
        try {
          await Updates.reloadAsync();
        } catch {
          if (NativeModules.DevSettings) {
            NativeModules.DevSettings.reload();
          } else {
            Alert.alert(
              i18n.t("settings.language"),
              i18n.t("settings.restart_app"),
            );
          }
        }
      }, 100);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isRTL, isLoading }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
