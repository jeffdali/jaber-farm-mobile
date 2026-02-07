import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  GenericModal,
  Input,
  Button,
} from "../../components/common";
import { _t } from "../../locales";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Expense, financeService } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ExpenseDetailsScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [expense, setExpense] = useState<Expense>(route.params.expense);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    expense_type: expense.expense_type,
    amount: expense.amount.toString(),
    expense_date: expense.expense_date,
    notes: expense.notes,
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

  const handleUpdate = async () => {
    if (!form.amount) {
      Alert.alert(_t("common.error"), _t("farm.amount"));
      return;
    }
    setSubmitting(true);
    try {
      const updated = await financeService.updateExpense(expense.id, {
        ...form,
        amount: parseFloat(form.amount),
      });
      setExpense(updated);
      setEditModalVisible(false);
      Alert.alert(_t("common.success"), _t("farm.updated_successfully"));
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_update"));
    } finally {
      setSubmitting(false);
    }
  };

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
            navigation.goBack();
          } catch (error) {
            Alert.alert(_t("common.error"), _t("farm.failed_to_delete"));
          }
        },
      },
    ]);
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title={_t("common.details")}
        showBack
        rightIcon="delete"
        onRightPress={handleDelete}
      />
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
            label={_t("farm.expense_date")}
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setForm({
            expense_type: expense.expense_type,
            amount: expense.amount.toString(),
            expense_date: expense.expense_date,
            notes: expense.notes,
          });
          setEditModalVisible(true);
        }}
      >
        <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
      </TouchableOpacity>

      <GenericModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title={_t("common.edit")}
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
            value={form.notes}
            onChangeText={(t) => setForm({ ...form, notes: t })}
            multiline
            style={{ height: 80 }}
          />

          <Button
            title={_t("common.save")}
            onPress={handleUpdate}
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
  content: {
    padding: 20,
    paddingBottom: 100,
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
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
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

export default ExpenseDetailsScreen;
