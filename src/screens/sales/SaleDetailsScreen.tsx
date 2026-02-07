import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
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
import { Sale, financeService } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SaleDetailsScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const [sale, setSale] = useState<Sale>(route.params.sale);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    sold_price: sale.sold_price.toString(),
    sold_at: sale.sold_at,
    notes: sale.notes,
  });

  const handleUpdate = async () => {
    if (!form.sold_price) {
      Alert.alert(_t("common.error"), _t("farm.enter_price"));
      return;
    }
    setSubmitting(true);
    try {
      const updated = await financeService.updateSale(sale.id, {
        ...form,
        sold_price: parseFloat(form.sold_price),
      });
      setSale(updated);
      setEditModalVisible(false);
      Alert.alert(_t("common.success"), _t("farm.updated_successfully"));
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_update"));
    } finally {
      setSubmitting(false);
    }
  };

  const DetailRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string;
    icon: string;
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
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={theme.colors.primary}
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
    Alert.alert(_t("common.confirm"), _t("farm.confirm_delete_sale"), [
      { text: _t("common.cancel"), style: "cancel" },
      {
        text: _t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await financeService.deleteSale(sale.id);
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AnimalDetails", { animalId: sale.animal })
            }
          >
            <DetailRow
              label={_t("farm.animal")}
              value={
                sale.animal_name || `#${sale.animal_number || sale.animal}`
              }
              icon="cow"
            />
          </TouchableOpacity>
          <DetailRow
            label={_t("farm.sold_price")}
            value={formatCurrency(sale.sold_price)}
            icon="cash"
          />
          <DetailRow
            label={_t("farm.sold_date")}
            value={sale.sold_at}
            icon="calendar"
          />
        </View>

        {sale.notes ? (
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
                {sale.notes}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => {
          setForm({
            sold_price: sale.sold_price.toString(),
            sold_at: sale.sold_at,
            notes: sale.notes,
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
          <Input
            label={_t("farm.sold_price")}
            value={form.sold_price}
            onChangeText={(t) => setForm({ ...form, sold_price: t })}
            keyboardType="decimal-pad"
          />

          <Input
            label={_t("farm.sold_date")}
            value={form.sold_at}
            onChangeText={(t) => setForm({ ...form, sold_at: t })}
          />

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
});

export default SaleDetailsScreen;
