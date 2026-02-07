import React, { useEffect, useState, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator, // Added ActivityIndicator
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker"; // Added DateTimePicker
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

const ExpenseCard = ({
  expense,
  onRefresh,
}: {
  expense: Expense;
  onRefresh: () => void;
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  const handleDelete = () => {
    Alert.alert(_t("common.confirm"), _t("farm.confirm_delete_expense"), [
      { text: _t("common.cancel"), style: "cancel" },
      {
        text: _t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await financeService.deleteExpense(expense.id);
            Alert.alert(_t("common.success"), _t("farm.deleted_successfully"));
            onRefresh();
          } catch (error) {
            Alert.alert(_t("common.error"), _t("farm.failed_to_delete"));
          }
        },
      },
    ]);
  };

  const getIcon = () => {
    // ... existing ...
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
    // ... existing ...
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
        <View style={{ alignItems: "flex-end" }}>
          <Text
            variant="h3"
            style={{ color: theme.colors.error, fontWeight: "800" }}
          >
            -{formatCurrency(expense.amount)}
          </Text>
          <TouchableOpacity onPress={handleDelete} style={{ marginTop: 4 }}>
            <MaterialCommunityIcons
              name="delete-outline"
              size={18}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
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
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    expense_type: "other" as "medicine" | "food" | "other",
    amount: "",
    notes: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setForm({
        ...form,
        expense_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  // Pagination State
  const [page, setPage] = useState(1);
  const pageRef = useRef(1);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFiltersHashRef = useRef("");

  // Filter State
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    expense_type: "", // empty for all
    start_date: "",
    end_date: "",
    min_amount: "",
    max_amount: "",
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [showFilterStartDatePicker, setShowFilterStartDatePicker] =
    useState(false);
  const [showFilterEndDatePicker, setShowFilterEndDatePicker] = useState(false);

  const fetchExpenses = useCallback(
    async (isSilent = false, loadMore = false, currentFilters = filters) => {
      if (isFetchingRef.current) return;

      const filtersHash = JSON.stringify(currentFilters);

      // Skip if not loading more, not silent, filters haven't changed, and we have data
      if (
        !loadMore &&
        !isSilent &&
        filtersHash === lastFiltersHashRef.current &&
        expenses.length > 0
      ) {
        return;
      }

      isFetchingRef.current = true;
      if (loadMore) {
        setLoadingMore(true);
      } else if (!isSilent) {
        setLoadingExpenses(true);
      }

      try {
        const pageToFetch = loadMore ? pageRef.current + 1 : 1;
        const data = await financeService.getExpenses(
          currentFilters,
          pageToFetch,
          true,
        );

        if (loadMore) {
          setExpenses((prev) => {
            const newResults = data.results || [];
            const existingIds = new Set(prev.map((e) => e.id));
            const filteredNew = newResults.filter(
              (e: Expense) => !existingIds.has(e.id),
            );
            return [...prev, ...filteredNew];
          });
          setPage(pageToFetch);
          pageRef.current = pageToFetch;
        } else {
          setExpenses(data.results || []);
          setPage(1);
          pageRef.current = 1;
          lastFiltersHashRef.current = filtersHash;
        }
        setNextUrl(data.next);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        if (!isSilent) {
          Alert.alert(_t("common.error"), _t("farm.failed_to_fetch"));
        }
      } finally {
        setLoadingExpenses(false);
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [filters, expenses.length],
  );

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterModalVisible(false);
    // fetchExpenses will be triggered by useEffect
  };

  const clearFilters = () => {
    const defaultFilters = {
      expense_type: "",
      start_date: "",
      end_date: "",
      min_amount: "",
      max_amount: "",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    // fetchExpenses will be triggered by useEffect
  };

  const onFilterStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowFilterStartDatePicker(false);
    if (selectedDate) {
      setTempFilters({
        ...tempFilters,
        start_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onFilterEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowFilterEndDatePicker(false);
    if (selectedDate) {
      setTempFilters({
        ...tempFilters,
        end_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  useEffect(() => {
    const filtersHash = JSON.stringify(filters);
    if (filtersHash !== lastFiltersHashRef.current) {
      fetchExpenses();
    }
  }, [filters, fetchExpenses]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && !loadingExpenses && expenses.length === 0) {
        fetchExpenses(true);
      }
    }, [fetchExpenses, loading, loadingExpenses, expenses.length]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses(true);
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
      });
      setModalVisible(false);
      setForm({
        expense_type: "other",
        amount: "",
        notes: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      fetchExpenses(true);
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
      <Header
        title={_t("farm.expenses")}
        showMenu
        rightIcon="filter-variant"
        onRightPress={() => {
          setTempFilters(filters);
          setFilterModalVisible(true);
        }}
      />

      <View style={{ flex: 1 }}>
        {loadingExpenses && !refreshing && (
          <View
            style={{
              position: "absolute",
              top: 10,
              left: 0,
              right: 0,
              zIndex: 1,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}
        <FlatList
          data={expenses}
          renderItem={({ item }) => (
            <ExpenseCard expense={item} onRefresh={() => onRefresh()} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListFooterComponent={
            nextUrl ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Button
                  title={_t("common.show_more")}
                  onPress={() => fetchExpenses(true, true)}
                  loading={loadingMore}
                  style={{
                    width: 200,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    backgroundColor: "transparent",
                  }}
                  textStyle={{ color: theme.colors.text }}
                />
              </View>
            ) : (
              <View style={{ height: 80 }} />
            )
          }
          ListEmptyComponent={
            !loading && !loadingExpenses ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name={"cash-remove" as any}
                  size={60}
                  color={theme.colors.text}
                  style={{ opacity: 0.2 }}
                />
                <Text
                  style={{
                    color: theme.colors.text,
                    opacity: 0.5,
                    marginTop: 10,
                  }}
                >
                  {_t("farm.no_expenses")}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

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
        <View>
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

          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Input
              label={_t("farm.expense_date")}
              value={form.expense_date}
              editable={false}
              pointerEvents="none"
              rightIcon="calendar"
            />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(form.expense_date)}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

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
        </View>
      </GenericModal>
      <GenericModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title={_t("common.search")}
      >
        <View>
          <Text style={styles.label}>{_t("farm.expense_type")}</Text>
          <View style={styles.typeRow}>
            {["medicine", "food", "other"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typePill,
                  { backgroundColor: theme.colors.background },
                  tempFilters.expense_type === type && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() =>
                  setTempFilters({
                    ...tempFilters,
                    expense_type:
                      tempFilters.expense_type === type ? "" : (type as any),
                  })
                }
              >
                <Text
                  style={{
                    color:
                      tempFilters.expense_type === type
                        ? "#FFF"
                        : theme.colors.text,
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  {_t(`farm.${type}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{_t("farm.expense_date")}</Text>
          <View style={styles.typeRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <TouchableOpacity
                onPress={() => setShowFilterStartDatePicker(true)}
              >
                <Input
                  placeholder={_t("common.from")}
                  value={tempFilters.start_date}
                  editable={false}
                  pointerEvents="none"
                  rightIcon="calendar"
                />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <TouchableOpacity
                onPress={() => setShowFilterEndDatePicker(true)}
              >
                <Input
                  placeholder={_t("common.to")}
                  value={tempFilters.end_date}
                  editable={false}
                  pointerEvents="none"
                  rightIcon="calendar"
                />
              </TouchableOpacity>
            </View>
          </View>

          {showFilterStartDatePicker && (
            <DateTimePicker
              value={new Date(tempFilters.start_date || new Date())}
              mode="date"
              display="default"
              onChange={onFilterStartDateChange}
            />
          )}
          {showFilterEndDatePicker && (
            <DateTimePicker
              value={new Date(tempFilters.end_date || new Date())}
              mode="date"
              display="default"
              onChange={onFilterEndDateChange}
            />
          )}

          <Text style={styles.label}>{_t("farm.amount")}</Text>
          <View style={styles.typeRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                placeholder={_t("common.min")}
                value={tempFilters.min_amount}
                onChangeText={(t) =>
                  setTempFilters({ ...tempFilters, min_amount: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                placeholder={_t("common.max")}
                value={tempFilters.max_amount}
                onChangeText={(t) =>
                  setTempFilters({ ...tempFilters, max_amount: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.typeRow}>
            <Button
              title={_t("common.clear")}
              onPress={clearFilters}
              style={{
                flex: 1,
                marginRight: 8,
                backgroundColor: theme.colors.surface,
              }}
              textStyle={{ color: theme.colors.onSurface }}
            />
            <Button
              title={_t("common.apply")}
              onPress={applyFilters}
              style={{ flex: 2, marginLeft: 8 }}
            />
          </View>
        </View>
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
