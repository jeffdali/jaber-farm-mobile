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
import { financeService, Purchase } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

const PurchaseCard = ({ purchase }: { purchase: Purchase }) => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View
      style={[
        styles.purchaseCard,
        {
          backgroundColor: theme.colors.card,
          shadowColor: theme.colors.text,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          // If we had a PurchaseDetailsScreen, we'd navigate to it.
          // For now, let's navigate to AnimalDetails if we have it linked
          if (purchase.animal_details) {
            navigation.navigate("AnimalDetails", {
              animal: purchase.animal_details,
            });
          }
        }}
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
                name="basket-plus"
                size={20}
                color={theme.colors.primary}
              />
            </View>
            <View>
              <Text
                style={[styles.animalName, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {purchase.animal_type_name || "Unknown"}
              </Text>
              <Text
                style={[
                  styles.animalNumber,
                  { color: theme.colors.text, opacity: 0.5 },
                ]}
              >
                #{purchase.animal} ({purchase.animal_gender})
              </Text>
            </View>
          </View>
          <View style={styles.dateContainer}>
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {new Date(purchase.purchase_date).toLocaleDateString(undefined, {
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
              {_t("farm.purchase_price")}
            </Text>
            <Text style={[styles.priceValue, { color: "#2196F3" }]}>
              {formatCurrency(purchase.purchase_price)}
            </Text>
          </View>
          {purchase.seller_name && (
            <View style={styles.sellerContainer}>
              <Text
                style={{ fontSize: 12, color: theme.colors.text, opacity: 0.5 }}
              >
                {_t("farm.seller_name")}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.text,
                  fontWeight: "600",
                }}
              >
                {purchase.seller_name}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const PurchasesListScreen = () => {
  const { theme } = useTheme();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPurchases = useCallback(async () => {
    try {
      const data = await financeService.getPurchases();
      setPurchases(
        data.sort(
          (a, b) =>
            new Date(b.purchase_date).getTime() -
            new Date(a.purchase_date).getTime(),
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
    fetchPurchases();
  }, [fetchPurchases]);

  useFocusEffect(
    useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchPurchases();
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Header title={_t("farm.purchases")} showMenu />
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
      <Header title={_t("farm.purchases")} showMenu />
      <FlatList
        data={purchases}
        renderItem={({ item }) => <PurchaseCard purchase={item} />}
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
              name="basket-off"
              size={60}
              color={theme.colors.text}
              style={{ opacity: 0.2 }}
            />
            <Text
              style={{ color: theme.colors.text, opacity: 0.5, marginTop: 10 }}
            >
              {_t("farm.no_purchases")}
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
  purchaseCard: {
    borderRadius: 24,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 4,
  },
  cardInner: {
    padding: 20,
    borderRadius: 24,
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
  sellerContainer: {
    alignItems: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
});

export default PurchasesListScreen;
