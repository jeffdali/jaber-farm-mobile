import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useTheme } from "../../theme";
import { Text, Header, Skeleton } from "../../components/common";
import { _t } from "../../locales";
import { financeService, Sale } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

const SaleCard = ({ sale }: { sale: Sale }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View
      style={[
        styles.saleCard,
        {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.text,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.navigate("SaleDetails", { sale })}
        activeOpacity={0.7}
        style={styles.cardInner}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.animalInfoContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name="cow"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View>
              <Text
                style={[styles.animalName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {sale.animal_name || "Unknown"}
              </Text>
              <Text
                style={[
                  styles.animalNumber,
                  { color: theme.colors.text, opacity: 0.5 },
                ]}
              >
                #{sale.animal_number || sale.animal}
              </Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {new Date(sale.sold_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBodyRow}>
          <View>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {_t("farm.sold_price")}
            </Text>
            <Text style={[styles.priceValue, { color: "#4CD964" }]}>
              {formatCurrency(sale.sold_price)}
            </Text>
          </View>
          {sale.notes && (
            <View style={styles.notesContainer}>
              <MaterialCommunityIcons
                name="text"
                size={16}
                color={theme.colors.text}
                style={{ opacity: 0.4 }}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const SalesListScreen = () => {
  const { theme } = useTheme();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      const data = await financeService.getSales();
      setSales(
        data.sort(
          (a, b) =>
            new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime(),
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
    fetchSales();
  }, [fetchSales]);

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, [fetchSales]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales();
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Header title={_t("farm.sales")} showMenu />
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
      <Header title={_t("farm.sales")} showMenu />
      <FlatList
        data={sales}
        renderItem={({ item }) => <SaleCard sale={item} />}
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
              name="cash-off"
              size={60}
              color={theme.colors.text}
              style={{ opacity: 0.2 }}
            />
            <Text
              style={{ color: theme.colors.text, opacity: 0.5, marginTop: 10 }}
            >
              {_t("farm.no_sales")}
            </Text>
          </View>
        }
      />
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
  saleCard: {
    borderRadius: 24,
    marginBottom: 16, // Increased spacing
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 4, // Add margin to avoid cutting off shadow
  },
  cardInner: {
    padding: 20,
    borderRadius: 24, // Match parent
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  animalInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  animalName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  animalNumber: {
    fontSize: 12,
  },
  dateContainer: {
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 15,
  },
  cardBodyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  notesContainer: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
});

export default SalesListScreen;
