import React from "react";
import { View, StyleSheet, TouchableOpacity, I18nManager } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../common";
import { useTheme } from "../../theme";
import { _t } from "../../locales";
import { PregnancyTracking } from "../../services/animals.service";

interface PregnancyItemProps {
  record: PregnancyTracking;
  onEdit: () => void;
  onDelete: () => void;
}

export const PregnancyItem = ({
  record,
  onEdit,
  onDelete,
}: PregnancyItemProps) => {
  const { theme } = useTheme();

  const getStatusColor = () => {
    switch (record.status) {
      case "success":
        return "#4CD964";
      case "delivered":
        return "#2196F3";
      case "cancelled":
        return theme.colors.error;
      default:
        return "#FF9800";
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor() + "10" },
          ]}
        >
          <MaterialCommunityIcons
            name={
              record.status === "success"
                ? "check-decagram"
                : record.status === "delivered"
                  ? "baby-face-outline"
                  : record.status === "cancelled"
                    ? "close-circle"
                    : "clock-outline"
            }
            size={16}
            color={getStatusColor()}
          />
          <Text
            variant="caption"
            style={{
              color: getStatusColor(),
              fontWeight: "700",
              marginLeft: 4,
            }}
          >
            {record.status_display}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onEdit}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.error + "10" },
            ]}
          >
            <MaterialCommunityIcons
              name="delete"
              size={16}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={16}
            color={theme.colors.text}
            style={{ opacity: 0.6 }}
          />
          <Text style={styles.infoLabel}>{_t("farm.date_started")}:</Text>
          <Text style={styles.infoValue}>{record.date_started}</Text>
        </View>

        {record.expected_delivery_date && record.status === "success" && (
          <View style={styles.row}>
            <MaterialCommunityIcons
              name="baby-carriage"
              size={18}
              color="#4CD964"
            />
            <Text style={[styles.infoLabel, { color: "#4CD964" }]}>
              {_t("farm.expected_delivery")}:
            </Text>
            <Text
              style={[
                styles.infoValue,
                { color: "#4CD964", fontWeight: "bold" },
              ]}
            >
              {record.expected_delivery_date}
            </Text>
          </View>
        )}

        {record.notes ? <Text style={styles.notes}>{record.notes}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  notes: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
