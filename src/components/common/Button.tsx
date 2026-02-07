import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "../../theme";
import { Text } from "./Text";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; // Size mapping to typography? Or just fixed sizes
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case "outline":
        return "transparent";
      case "secondary":
        return theme.colors.secondary;
      case "danger":
        return theme.colors.error;
      case "primary":
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.onSurface;
    if (variant === "outline") return theme.colors.primary;
    return theme.colors.onPrimary;
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;
    if (variant === "outline") return theme.colors.primary;
    return getBackgroundColor();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: getBorderColor(),
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={getTextColor()}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            variant="body"
            style={[styles.text, { color: getTextColor() }, textStyle]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  text: {
    fontWeight: "bold",
  },
});

export default AppButton;
export { AppButton as Button };
