import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../theme";
import { Text, Header } from "../../components/common";
import { _t } from "../../locales";
import { useAppSelector } from "../../redux/hooks";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ProfileScreen = () => {
  const { theme } = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  const ProfileItem = ({
    icon,
    label,
    value,
  }: {
    icon: string;
    label: string;
    value: string;
  }) => (
    <View
      style={[styles.profileItem, { borderBottomColor: theme.colors.border }]}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={24}
        color={theme.colors.primary}
      />
      <View style={styles.itemTextContainer}>
        <Text style={{ color: theme.colors.text, opacity: 0.6, fontSize: 12 }}>
          {label}
        </Text>
        <Text
          style={{ color: theme.colors.text, fontSize: 16, fontWeight: "600" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("common.profile")} showBack />
      <ScrollView style={styles.content}>
        <View
          style={[styles.profileHeader, { backgroundColor: theme.colors.card }]}
        >
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text
              style={{
                color: theme.colors.onPrimary,
                fontWeight: "bold",
                fontSize: 32,
              }}
            >
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </Text>
          </View>
          <Text
            variant="h2"
            style={{ color: theme.colors.text, marginTop: 15 }}
          >
            {user ? `${user.first_name} ${user.last_name}` : "User Name"}
          </Text>
          <Text
            variant="body"
            style={{ color: theme.colors.text, opacity: 0.7 }}
          >
            {user?.username ? `@${user.username}` : ""}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <ProfileItem
            icon="account"
            label={_t("common.username") || "Username"}
            value={user?.username || ""}
          />
          <ProfileItem
            icon="email"
            label={_t("common.email") || "Email"}
            value={user?.email || ""}
          />
          <ProfileItem
            icon="account-box"
            label={_t("common.first_name") || "First Name"}
            value={user?.first_name || ""}
          />
          <ProfileItem
            icon="account-box"
            label={_t("common.last_name") || "Last Name"}
            value={user?.last_name || ""}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  detailsContainer: {
    padding: 20,
    marginTop: 10,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  itemTextContainer: {
    marginLeft: 20,
  },
});

export default ProfileScreen;
