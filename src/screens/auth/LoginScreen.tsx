import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, Button, Input, Header } from "../../components/common";
import { _t } from "../../locales";
import { useTheme } from "../../theme";
import { useAppDispatch } from "../../redux/hooks";
import {
  setCredentials,
  setLoading as setAuthLoading,
} from "../../redux/auth/authSlice";
import { authService } from "../../services/auth.service";
import { Alert } from "react-native";

const LoginScreen = ({ navigation }: any) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(_t("common.error"), _t("auth.enter_credentials"));
      return;
    }

    setLoading(true);
    dispatch(setAuthLoading(true));
    try {
      const tokens = await authService.login({ username, password });

      // After login, we need to set the tokens in state briefly so getMe can use them
      // In our current api.ts, it reads from store.getState().
      // But we haven't dispatched setCredentials yet.
      // Easiest is to dispatch setCredentials with user:null first or just call getMe with headers manually.
      // Alternatively, let's update api.interceptors for a moment or just pass token to getMe.

      // Let's call getMe. We'll need to pass the access token manually if it's not in store yet.
      // Wait, let's just dispatch setCredentials with a dummy user first.
      dispatch(
        setCredentials({
          user: {
            id: 0,
            username: "",
            email: "",
            first_name: "",
            last_name: "",
          },
          access: tokens.access,
          refresh: tokens.refresh,
        }),
      );

      const user = await authService.getMe();

      // Now set the real user
      dispatch(
        setCredentials({
          user,
          access: tokens.access,
          refresh: tokens.refresh,
        }),
      );

      navigation.navigate("Main");
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        _t("common.error"),
        error.response?.data?.detail ||
          error.message ||
          _t("auth.login_failed"),
      );
    } finally {
      setLoading(false);
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("common.login")} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text variant="h1" style={styles.title}>
              {_t("auth.login_title")}
            </Text>
            <Text variant="body" style={styles.subtitle}>
              {_t("auth.login_subtitle")}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={_t("common.username")}
              placeholder={_t("common.username")}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <Input
              label={_t("common.password")}
              placeholder={_t("common.password")}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title={_t("common.login")}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    opacity: 0.7,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: 24,
  },
});

export default LoginScreen;
