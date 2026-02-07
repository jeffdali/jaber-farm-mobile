import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../theme";
import { Text } from "./Text";

import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  rightIcon?: string;
  leftIcon?: string;
}

const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  containerStyle,
  style,
  rightIcon,
  leftIcon,
  ...props
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="caption" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={{ justifyContent: "center" }}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon as any}
            size={20}
            color={theme.colors.text}
            style={{ position: "absolute", left: 14, zIndex: 1, opacity: 0.5 }}
          />
        )}
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: error ? theme.colors.error : theme.colors.border,
              paddingRight: rightIcon ? 40 : 16,
              paddingLeft: leftIcon ? 48 : 16,
              textAlignVertical: props.multiline ? "top" : "center",
            },
            style,
          ]}
          placeholderTextColor={theme.colors.onSurface}
          multiline={props.multiline}
          scrollEnabled={props.multiline ? true : false}
          {...props}
        />
        {rightIcon && (
          <MaterialCommunityIcons
            name={rightIcon as any}
            size={24}
            color={theme.colors.text}
            style={{ position: "absolute", right: 10, opacity: 0.5 }}
          />
        )}
      </View>
      {error && (
        <Text
          variant="caption"
          style={{ color: theme.colors.error, marginTop: 4 }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});

export default AppInput;
export { AppInput as Input };
