import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  Skeleton,
  Button,
  GenericModal,
  Input,
} from "../../components/common";
import { _t } from "../../locales";
import { financeService, Sale } from "../../services/finance.service";
import { animalsService, AnimalType } from "../../services/animals.service";
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
  const [loadingSales, setLoadingSales] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    start_date: "",
    end_date: "",
    min_price: "",
    max_price: "",
    animal_type: undefined as number | undefined,
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);

  useEffect(() => {
    loadAnimalTypes();
  }, []);

  const loadAnimalTypes = async () => {
    try {
      const types = await animalsService.getAnimalTypes();
      setAnimalTypes(types);
    } catch (error) {
      console.error("Failed to load animal types", error);
    }
  };

  const fetchSales = useCallback(
    async (isSilent = false, loadMore = false, currentFilters = filters) => {
      if (isFetchingRef.current) return;

      const filtersHash = JSON.stringify(currentFilters);

      // Skip if not loading more, not silent, filters haven't changed, and we have data
      if (
        !loadMore &&
        !isSilent &&
        filtersHash === lastFiltersHashRef.current &&
        sales.length > 0
      ) {
        return;
      }

      isFetchingRef.current = true;
      if (loadMore) {
        setLoadingMore(true);
      } else if (!isSilent) {
        setLoadingSales(true);
      }

      try {
        const pageToFetch = loadMore ? pageRef.current + 1 : 1;
        const data = await financeService.getSales(
          currentFilters,
          pageToFetch,
          true,
        );

        if (loadMore) {
          setSales((prev) => {
            const newResults = data.results || [];
            const existingIds = new Set(prev.map((s) => s.id));
            const filteredNew = newResults.filter(
              (s: Sale) => !existingIds.has(s.id),
            );
            return [...prev, ...filteredNew];
          });
          setPage(pageToFetch);
          pageRef.current = pageToFetch;
        } else {
          setSales(data.results || []);
          setPage(1);
          pageRef.current = 1;
          lastFiltersHashRef.current = filtersHash;
        }
        setNextUrl(data.next);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
        if (!isSilent) {
          Alert.alert(_t("common.error"), _t("farm.failed_to_fetch"));
        }
      } finally {
        setLoadingSales(false);
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [filters, sales.length],
  );

  const applyFilters = () => {
    setFilters(tempFilters);
    setFilterModalVisible(false);
    // fetchSales will be triggered by useEffect
  };

  const clearFilters = () => {
    const defaultFilters = {
      start_date: "",
      end_date: "",
      min_price: "",
      max_price: "",
      animal_type: undefined,
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
    // fetchSales will be triggered by useEffect
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowStartDatePicker(false);
    if (selectedDate) {
      setTempFilters({
        ...tempFilters,
        start_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowEndDatePicker(false);
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
      fetchSales();
    }
  }, [filters, fetchSales]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && !loadingSales && sales.length === 0) {
        fetchSales(true);
      }
    }, [fetchSales, loading, loadingSales, sales.length]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales(true);
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Header
          title={_t("farm.sales")}
          showMenu
          rightIcon="filter-variant"
          onRightPress={() => {
            setTempFilters(filters);
            setFilterModalVisible(true);
          }}
        />
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
        title={_t("farm.sales")}
        showMenu
        rightIcon="filter-variant"
        onRightPress={() => {
          setTempFilters(filters);
          setFilterModalVisible(true);
        }}
      />
      <View style={{ flex: 1 }}>
        {loadingSales && !refreshing && (
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
          ListFooterComponent={
            nextUrl ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Button
                  title={_t("common.show_more")}
                  onPress={() => fetchSales(true, true)}
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
            !loading && !loadingSales ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="cash-off"
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
                  {_t("farm.no_sales")}
                </Text>
              </View>
            ) : null
          }
        />
      </View>
      <GenericModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title={_t("common.search")}
      >
        <View>
          <Text style={styles.filterLabel}>{_t("farm.animal")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeRow}
          >
            {animalTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typePill,
                  { backgroundColor: theme.colors.background },
                  tempFilters.animal_type === type.id && {
                    backgroundColor: theme.colors.primary,
                  },
                ]}
                onPress={() =>
                  setTempFilters({
                    ...tempFilters,
                    animal_type:
                      tempFilters.animal_type === type.id ? undefined : type.id,
                  })
                }
              >
                <Text
                  style={{
                    color:
                      tempFilters.animal_type === type.id
                        ? "#FFF"
                        : theme.colors.text,
                    fontWeight: "bold",
                    fontSize: 12,
                  }}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.filterLabel}>{_t("farm.sold_date")}</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
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
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
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

          {showStartDatePicker && (
            <DateTimePicker
              value={
                tempFilters.start_date
                  ? new Date(tempFilters.start_date)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
          {showEndDatePicker && (
            <DateTimePicker
              value={
                tempFilters.end_date
                  ? new Date(tempFilters.end_date)
                  : new Date()
              }
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}

          <Text style={styles.filterLabel}>{_t("farm.sold_price")}</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Input
                placeholder={_t("common.min")}
                value={tempFilters.min_price}
                onChangeText={(t) =>
                  setTempFilters({ ...tempFilters, min_price: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Input
                placeholder={_t("common.max")}
                value={tempFilters.max_price}
                onChangeText={(t) =>
                  setTempFilters({ ...tempFilters, max_price: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
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
  filterLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    paddingRight: 20,
  },
  typePill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 5,
    marginRight: 8, // Added margin right for horizontal scroll spacing
  },
});

export default SalesListScreen;
