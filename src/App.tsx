import React from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import AppNavigator from "./navigation/AppNavigator";
import { ThemeProvider } from "./theme";
import { store, persistor } from "./redux/store";
import { LanguageProvider, useLanguage } from "./locales";

const AppContent = () => {
  const { language, isLoading } = useLanguage();

  // Wait for language initialization before rendering
  // This prevents rendering with wrong RTL state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      {/* Key forces re-render when language changes */}
      <AppNavigator key={language} />
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default App;
