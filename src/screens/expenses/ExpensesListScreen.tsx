import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from "react-native";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  Skeleton,
  GenericModal,
  Input,
  Button,
} from "../../components/common";
import { _t } from "../../locales";
import { financeService, Expense } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

const ExpenseCard = ({ expense }: { expense: Expense }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

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

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("ExpenseDetails", { expense })}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: theme.colors.card }]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: getColor() + "15" }]}>
          <MaterialCommunityIcons
            name={getIcon()}
            size={24}
            color={getColor()}
          />
        </View>
        <View style={styles.info}>
          <Text variant="h3" style={{ color: theme.colors.text }}>
            {_t(`farm.${expense.expense_type}`)}
          </Text>
          <Text
            variant="caption"
            style={{ color: theme.colors.text, opacity: 0.6 }}
          >
            {expense.expense_date}
          </Text>
        </View>
        <Text
          variant="h3"
          style={{ color: theme.colors.error, fontWeight: "800" }}
        >
          -{formatCurrency(expense.amount)}
        </Text>
      </View>
      {expense.notes ? (
        <View
          style={[
            styles.notesBox,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <Text
            variant="caption"
            style={{ color: theme.colors.text, opacity: 0.7 }}
          >
            {expense.notes}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const ExpensesListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    expense_type: "other" as "medicine" | "food" | "other",
    amount: "",
    notes: "",
  });

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await financeService.getExpenses();
      setExpenses(
        data.sort(
          (a, b) =>
            new Date(b.expense_date).getTime() -
            new Date(a.expense_date).getTime(),
        ),
      );
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_fetch"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const handleAddExpense = async () => {
    if (!form.amount) {
      Alert.alert(_t("common.error"), _t("farm.amount"));
      return;
    }
    setSubmitting(true);
    try {
      await financeService.createExpense({
        ...form,
        amount: parseFloat(form.amount),
        expense_date: new Date().toISOString().split("T")[0],
      });
      setModalVisible(false);
      setForm({ expense_type: "other", amount: "", notes: "" });
      fetchExpenses();
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.add_expense"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Header title={_t("farm.expenses")} showMenu />
        <View style={{ padding: 20 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              height={100}
              style={{ marginBottom: 15, borderRadius: 20 }}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("farm.expenses")} showMenu />

      <FlatList
        data={expenses}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name={"cash-remove" as any}
              size={60}
              color={theme.colors.text}
              style={{ opacity: 0.2 }}
            />
            <Text
              style={{ color: theme.colors.text, opacity: 0.5, marginTop: 10 }}
            >
              {_t("farm.no_expenses")}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
      </TouchableOpacity>

      <GenericModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={_t("farm.add_expense")}
      >
        <ScrollView>
          <Text style={styles.label}>{_t("farm.expense_type")}</Text>
          <View style={styles.typeRow}>
            {["medicine", "food", "other"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  { backgroundColor: theme.colors.background },
                  form.expense_type === type && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() => setForm({ ...form, expense_type: type as any })}
              >
                <Text
                  style={{
                    color:
                      form.expense_type === type ? "#FFF" : theme.colors.text,
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  {_t(`farm.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input
            label={_t("farm.amount")}
            placeholder="0.00"
            value={form.amount}
            onChangeText={(t) => setForm({ ...form, amount: t })}
            keyboardType="decimal-pad"
          />

          <Input
            label={_t("farm.notes")}
            placeholder="..."
            value={form.notes}
            onChangeText={(t) => setForm({ ...form, notes: t })}
            multiline
            style={{ height: 80 }}
          />

          <Button
            title={_t("common.confirm")}
            onPress={handleAddExpense}
            loading={submitting}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </GenericModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 15,
  },
  card: {
    padding: 16,
    borderRadius: 22,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  notesBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "bold",
    opacity: 0.7,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typePill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
  },
});

export default ExpensesListScreen;
