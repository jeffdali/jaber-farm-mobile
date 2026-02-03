import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme";
import { Text, Header } from "../../components/common";
import { _t } from "../../locales";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Sale } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SaleDetailsScreen = () => {
  const { theme } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const sale: Sale = route.params.sale;

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

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("common.details")} showBack />
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

export default SaleDetailsScreen;
