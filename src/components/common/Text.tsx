import React from "react";
import { Text as RNText, TextProps, TextStyle, StyleSheet } from "react-native";
import { useTheme } from "../../theme";
import { useLanguage } from "../../locales";

interface AppTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "body" | "caption";
  color?: string;
}

const AppText: React.FC<AppTextProps> = ({
  children,
  variant = "body",
  style,
  color,
  ...props
}) => {
  const { theme } = useTheme();

  const variantStyle = (theme.typography[variant] ||
    theme.typography.body) as TextStyle;
  const textColor = color || theme.colors.text;

  const nativeRtlStyle: TextStyle = {
    textAlign: "auto", // System handles direction based on script
  };

  return (
    <RNText
      style={[{ color: textColor }, variantStyle, nativeRtlStyle, style]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default AppText;
export { AppText as Text };
