import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../../theme";
import { Text } from "../../components/common/Text";

const SplashScreen = ({ navigation }: any) => {
  const { theme } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login");
    }, 2000);
  }, [navigation]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Text style={[styles.text, { color: theme.colors.onPrimary }]}>
        Jabers Farm
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

export default SplashScreen;
