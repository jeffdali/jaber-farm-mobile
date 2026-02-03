import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useTheme } from "../../theme";
import { Text, Header } from "../../components/common";
import { _t } from "../../locales";
import { useRoute } from "@react-navigation/native";
import { Expense } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ExpenseDetailsScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const expense: Expense = route.params.expense;

  const getIcon = () => {
    switch (expense.expense_type) {
      case "medicine":
        return "medical-bag";
      case "food":
        return "food-apple";
      default:
        return "dots-horizontal-circle";
    }
  };

  const getColor = () => {
    switch (expense.expense_type) {
      case "medicine":
        return "#2196F3";
      case "food":
        return "#FF9800";
      default:
        return "#9C27B0";
    }
  };

  const DetailRow = ({
    label,
    value,
    icon,
    color,
  }: {
    label: string;
    value: string;
    icon: string;
    color?: string;
  }) => (
    <View
      style={[
        styles.detailRow,
        { borderBottomColor: theme.colors.border + "40" },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: (color || theme.colors.primary) + "15" },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={color || theme.colors.primary}
        />
      </View>
      <View style={styles.textContainer}>
        <Text
          variant="caption"
          style={{ color: theme.colors.text, opacity: 0.5 }}
        >
          {label}
        </Text>
        <Text variant="h3" style={{ color: theme.colors.text }}>
          {value}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("common.details")} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <DetailRow
            label={_t("farm.expense_type")}
            value={_t(`farm.${expense.expense_type}`)}
            icon={getIcon()}
            color={getColor()}
          />
          <DetailRow
            label={_t("farm.amount")}
            value={formatCurrency(expense.amount)}
            icon="cash-minus"
            color={theme.colors.error}
          />
          <DetailRow
            label={_t("common.details")}
            value={expense.expense_date}
            icon="calendar"
          />
        </View>

        {expense.notes ? (
          <View style={[styles.section, { marginTop: 24 }]}>
            <Text
              variant="h3"
              style={[styles.sectionTitle, { color: theme.colors.text }]}
            >
              {_t("farm.notes")}
            </Text>
            <View
              style={[styles.notesCard, { backgroundColor: theme.colors.card }]}
            >
              <Text style={{ color: theme.colors.text, lineHeight: 22 }}>
                {expense.notes}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  notesCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
  },
});

export default ExpenseDetailsScreen;
