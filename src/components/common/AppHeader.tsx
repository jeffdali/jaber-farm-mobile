import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  I18nManager,
} from "react-native";
import { useTheme } from "../../theme";
import { Text } from "./Text";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

/**
 * AppHeader Properties
 *
 * @property title - The title to display in the center
 * @property showBack - Whether to show the back arrow
 * @property showMenu - Whether to show the drawer menu icon (ignored if showBack is true)
 * @property onBackPress - Optional custom back handler
 * @property onMenuPress - Optional custom menu handler
 * @property rightIcon - Optional icon name for the right side
 * @property onRightPress - Optional handler for the right icon
 * @property rightComponent - Optional custom component for the right side
 * @property transparent - Whether the header should be transparent
 */
interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightPress?: () => void;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  colored?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  showMenu = false,
  onBackPress,
  onMenuPress,
  rightIcon,
  onRightPress,
  rightComponent,
  transparent = false,
  colored = true,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleMenu = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      // @ts-ignore - openDrawer is only on Drawer navigation
      navigation.openDrawer();
    }
  };

  const getBgColor = () => {
    if (transparent) return "transparent";
    if (colored) return theme.colors.primary;
    return theme.colors.card;
  };

  const getContentColor = () => {
    if (colored) return theme.colors.onPrimary || "#FFFFFF";
    return theme.colors.text;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getBgColor() }]}>
      <StatusBar
        barStyle={colored || theme.dark ? "light-content" : "dark-content"}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: getBgColor(),
            borderBottomWidth: colored ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: theme.colors.border + "40",
          },
        ]}
      >
        {/* Left Side: Back or Menu */}
        <View style={styles.leftContainer}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.actionButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={I18nManager.isRTL ? "arrow-right" : "arrow-left"}
                size={28}
                color={getContentColor()}
              />
            </TouchableOpacity>
          ) : showMenu ? (
            <TouchableOpacity
              onPress={handleMenu}
              style={styles.actionButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name="menu"
                size={28}
                color={getContentColor()}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center: Title */}
        <View style={styles.titleContainer}>
          <Text
            variant="h3"
            style={[styles.headerTitle, { color: getContentColor() }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right Side: Custom or Icon */}
        <View style={styles.rightContainer}>
          {rightComponent ? (
            rightComponent
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.actionButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons
                name={rightIcon}
                size={26}
                color={getContentColor()}
              />
            </TouchableOpacity>
          ) : (
            // Placeholder for layout symmetry
            <View style={styles.actionButton} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    zIndex: 100,
  },
  container: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  titleContainer: {
    flex: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  rightContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
});

export default AppHeader;
export { AppHeader as Header };
