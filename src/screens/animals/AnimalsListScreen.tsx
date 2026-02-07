import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  Input,
  Button,
  GenericModal,
  Dropdown,
} from "../../components/common";
import { _t } from "../../locales";
import {
  animalsService,
  Animal,
  AnimalType,
} from "../../services/animals.service";
import { financeService } from "../../services/finance.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { getErrorMessage } from "../../utils/helpers";

const { width } = Dimensions.get("window");

// Memoized Animal Card for performance
const AnimalCard = memo(
  ({ animal, onPress }: { animal: Animal; onPress: () => void }) => {
    const { theme } = useTheme();

    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.avatarBox,
                { backgroundColor: theme.colors.primary + "10" },
              ]}
            >
              <MaterialCommunityIcons
                name={
                  animal.gender === "male" ? "gender-male" : "gender-female"
                }
                size={24}
                color={animal.gender === "male" ? "#2196F3" : "#E91E63"}
              />
            </View>
            <View style={styles.headerText}>
              <Text variant="h3" style={{ color: theme.colors.text }}>
                {animal.name}
              </Text>
              <Text
                variant="caption"
                style={{ color: theme.colors.text, opacity: 0.6 }}
              >
                {animal.animal_type_name}
              </Text>
            </View>
            <View style={styles.statusBadgeRow}>
              <View
                style={[
                  styles.idBadge,
                  { backgroundColor: theme.colors.text + "10" },
                ]}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontSize: 10,
                    fontWeight: "bold",
                    opacity: 0.6,
                  }}
                >
                  #ID:{animal.id}
                </Text>
              </View>
              {animal.animal_number ? (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    #{animal.animal_number}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons
                  name="calendar-clock"
                  size={20}
                  color={theme.colors.text}
                  style={{ opacity: 0.7 }}
                />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {animal.age}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons
                  name="weight-kilogram"
                  size={20}
                  color={theme.colors.text}
                  style={{ opacity: 0.7 }}
                />
                <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                  {animal.weight ? `${animal.weight} kg` : "-"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const AnimalsListScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  // Data State
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [loadingAnimals, setLoadingAnimals] = useState(false); // Filter changes
  const [refreshing, setRefreshing] = useState(false);

  // Filters State
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    is_pregnant: null as boolean | null,
    has_active_pregnancy: null as boolean | null,
    pregnancy_status: "" as string,
    birth_date_min: "",
    birth_date_max: "",
    weight_min: "",
    weight_max: "",
    head_price_min: "",
    head_price_max: "",
    color: "",
    search: "",
    status: "existing", // Default to existing as requested
  });

  // Add Type Modal State
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [submittingType, setSubmittingType] = useState(false);

  // Add Animal Modal State
  const [animalModalVisible, setAnimalModalVisible] = useState(false);
  const [submittingAnimal, setSubmittingAnimal] = useState(false);
  const [animalForm, setAnimalForm] = useState({
    name: "",
    animal_number: "",
    gender: "female" as "male" | "female",
    animal_type: null as number | null,
    birth_date: new Date().toISOString().split("T")[0],
    color: "",
    weight: "",
    head_price: "",
    breeder_notes: "",
    is_purchase: false,
    purchase_price: "",
    purchase_date: new Date().toISOString().split("T")[0],
    seller_name: "",
    mother: null as number | null,
  });

  // Date Picker State
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showBirthDateMinPicker, setShowBirthDateMinPicker] = useState(false);
  const [showBirthDateMaxPicker, setShowBirthDateMaxPicker] = useState(false);

  const onBirthDateChange = (event: any, selectedDate?: Date) => {
    setShowBirthDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setAnimalForm({
        ...animalForm,
        birth_date: selectedDate.toISOString().split("T")[0],
      });
    }
    if (Platform.OS !== "ios") {
      setShowBirthDatePicker(false);
    }
  };

  const onPurchaseDateChange = (event: any, selectedDate?: Date) => {
    setShowPurchaseDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setAnimalForm({
        ...animalForm,
        purchase_date: selectedDate.toISOString().split("T")[0],
      });
    }
    if (Platform.OS !== "ios") {
      setShowPurchaseDatePicker(false);
    }
  };

  const [mothers, setMothers] = useState<Animal[]>([]);
  const [loadingMothers, setLoadingMothers] = useState(false);

  const fetchMothers = useCallback(async () => {
    setLoadingMothers(true);
    try {
      const data = await animalsService.getAllAnimals({
        gender: "female",
        status: "all", // Fetch both existing and sold/dead
      });

      // Sort: existing first, then others
      const sorted = [...data].sort((a, b) => {
        if (a.status === "existing" && b.status !== "existing") return -1;
        if (a.status !== "existing" && b.status === "existing") return 1;
        return 0;
      });

      setMothers(sorted);
    } catch (error) {
      console.error("Failed to fetch mothers:", error);
    } finally {
      setLoadingMothers(false);
    }
  }, []);

  // Optimized Fetch Functions
  const fetchTypes = useCallback(
    async (force = false) => {
      // Only fetch if types are empty or we're forcing a refresh
      if (types.length > 0 && !force) return;

      try {
        const data = await animalsService.getAnimalTypes();
        setTypes(data);
      } catch (error) {
        console.error("Failed to fetch types:", error);
      }
    },
    [types.length],
  );

  // Pagination State
  const [page, setPage] = useState(1);
  const pageRef = useRef(1); // Use ref for fetch logic to avoid stale closures
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const isFetchingRef = useRef(false);
  const lastFiltersHashRef = useRef("");

  const fetchAnimals = useCallback(
    async (isSilent = false, loadMore = false) => {
      if (isFetchingRef.current) return;

      const filtersHash = JSON.stringify({
        selectedType,
        selectedGender,
        advFilters,
      });

      // If we are not loading more, and filters haven't changed, skip (unless it's a silent refresh/force)
      if (
        !loadMore &&
        !isSilent &&
        filtersHash === lastFiltersHashRef.current &&
        animals.length > 0
      ) {
        return;
      }

      isFetchingRef.current = true;
      if (loadMore) {
        setLoadingMore(true);
      } else if (!isSilent) {
        setLoadingAnimals(true);
      }

      try {
        const pageToFetch = loadMore ? pageRef.current + 1 : 1;
        const data = await animalsService.getAnimals(
          {
            animal_type: selectedType || undefined,
            gender: selectedGender === "all" ? undefined : selectedGender,
            ...advFilters,
            is_pregnant:
              advFilters.is_pregnant === null
                ? undefined
                : advFilters.is_pregnant,
            has_active_pregnancy:
              advFilters.has_active_pregnancy === null
                ? undefined
                : advFilters.has_active_pregnancy,
            pregnancy_status: advFilters.pregnancy_status || undefined,
            status: advFilters.status === "all" ? undefined : advFilters.status,
          },
          pageToFetch,
          true,
        );

        if (loadMore) {
          setAnimals((prev) => {
            const newResults = data.results || [];
            const existingIds = new Set(prev.map((a) => a.id));
            const filteredNew = newResults.filter(
              (a: Animal) => !existingIds.has(a.id),
            );
            return [...prev, ...filteredNew];
          });
          setPage(pageToFetch);
          pageRef.current = pageToFetch;
        } else {
          setAnimals(data.results || []);
          setPage(1);
          pageRef.current = 1;
          lastFiltersHashRef.current = filtersHash;
        }
        setNextUrl(data.next);
      } catch (error) {
        console.error("Failed to fetch animals:", error);
        // Alert only if not silent to avoid annoying user on focus errors
        if (!isSilent) {
          Alert.alert(_t("common.error"), "Failed to load animals");
        }
      } finally {
        setLoadingAnimals(false);
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [selectedType, selectedGender, advFilters, animals.length],
  );

  // Initial Load: Types only once on mount
  useEffect(() => {
    fetchTypes();
  }, []); // Strictly once

  // Load Animals: Only when filters change (Reset to page 1)
  useEffect(() => {
    // Only fetch if filters actually changed from last fetch
    const filtersHash = JSON.stringify({
      selectedType,
      selectedGender,
      advFilters,
    });
    if (filtersHash !== lastFiltersHashRef.current) {
      fetchAnimals();
    }
  }, [selectedType, selectedGender, advFilters, fetchAnimals]);

  // Handle auto-refresh when focusing back
  useFocusEffect(
    useCallback(() => {
      // Check if we already have data to avoid unnecessary resets on first focus
      if (!loading && !loadingAnimals && animals.length === 0) {
        fetchAnimals(true);
      }
    }, [fetchAnimals, loading, loadingAnimals, animals.length]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // On manual refresh, we force re-fetch everything
    await Promise.all([fetchTypes(true), fetchAnimals(true)]);
  }, [fetchTypes, fetchAnimals]);

  const handleAddType = async () => {
    if (!newTypeName.trim()) return;
    setSubmittingType(true);
    try {
      await animalsService.createAnimalType({ name: newTypeName });
      setNewTypeName("");
      setTypeModalVisible(false);
      fetchTypes();
    } catch (error) {
      const errorMsg = getErrorMessage(error, "Failed to create type");
      Alert.alert(_t("common.error"), errorMsg);
    } finally {
      setSubmittingType(false);
    }
  };

  const handleCreateAnimal = async () => {
    if (!animalForm.animal_type || !animalForm.name) {
      Alert.alert(
        _t("common.error"),
        "Please fill required fields (Name, Type)",
      );
      return;
    }

    if (animalForm.is_purchase && !animalForm.purchase_price) {
      Alert.alert(_t("common.error"), _t("farm.enter_price"));
      return;
    }

    setSubmittingAnimal(true);
    try {
      const animal = await animalsService.createAnimal({
        ...animalForm,
        animal_type: animalForm.animal_type || undefined,
        weight: animalForm.weight ? parseFloat(animalForm.weight) : null,
        head_price: animalForm.head_price
          ? parseFloat(animalForm.head_price)
          : null,
      } as any);

      setAnimalModalVisible(false);
      setAnimalForm({
        name: "",
        animal_number: "",
        gender: "female",
        animal_type: selectedType || null,
        birth_date: new Date().toISOString().split("T")[0],
        color: "",
        weight: "",
        head_price: "",
        breeder_notes: "",
        is_purchase: false,
        purchase_price: "",
        purchase_date: new Date().toISOString().split("T")[0],
        seller_name: "",
        mother: null,
      });
      fetchAnimals(true);
    } catch (error) {
      const errorMsg = getErrorMessage(error, "Failed to create animal");
      Alert.alert(_t("common.error"), errorMsg);
    } finally {
      setSubmittingAnimal(false);
    }
  };

  const renderAnimal = useCallback(
    ({ item }: { item: Animal }) => (
      <AnimalCard
        animal={item}
        onPress={() => navigation.navigate("AnimalDetails", { animal: item })}
      />
    ),
    [navigation],
  );

  const activeTabBg = theme.dark ? "#2E7D32" : theme.colors.primary;
  const inactiveTabBg = theme.dark ? "#252525" : "rgba(0,0,0,0.05)";
  const typesContainerBg = theme.dark ? "#1A1A1A" : "transparent";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("farm.title")} showMenu />

      {/* 1. Animal Types Tabs */}
      <View
        style={[
          styles.typesContainer,
          {
            backgroundColor: typesContainerBg,
            borderBottomColor: theme.colors.border + "20",
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.typesScroll}
        >
          <TouchableOpacity
            style={[
              styles.typeTab,
              { backgroundColor: inactiveTabBg },
              selectedType === null && { backgroundColor: activeTabBg },
            ]}
            onPress={() => setSelectedType(null)}
          >
            <Text
              style={[
                styles.typeTabText,
                { color: selectedType === null ? "#FFF" : theme.colors.text },
              ]}
            >
              {_t("common.all")}
            </Text>
          </TouchableOpacity>

          {types.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeTab,
                { backgroundColor: inactiveTabBg },
                selectedType === type.id && {
                  backgroundColor: activeTabBg,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <Text
                style={[
                  styles.typeTabText,
                  {
                    color:
                      selectedType === type.id ? "#FFF" : theme.colors.text,
                  },
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.typeTab,
              styles.addTab,
              {
                borderColor: theme.colors.primary,
                backgroundColor: theme.dark
                  ? "rgba(255,255,255,0.03)"
                  : "transparent",
              },
            ]}
            onPress={() => setTypeModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 2. Gender Quick Filters */}
      <View style={styles.genderContainer}>
        {["all", "male", "female"].map((g) => (
          <TouchableOpacity
            key={g}
            style={[
              styles.genderTab,
              selectedGender === g && {
                borderBottomColor: theme.colors.primary,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setSelectedGender(g)}
          >
            <Text
              style={[
                styles.genderTabText,
                {
                  color:
                    selectedGender === g
                      ? theme.colors.primary
                      : theme.colors.text,
                  opacity: selectedGender === g ? 1 : 0.5,
                },
              ]}
            >
              {_t(`common.${g}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2.5 Search & Advanced Filters Bar */}
      <View style={[styles.searchFilterBar, { marginTop: 15 }]}>
        <View style={styles.searchIconWrapper}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={theme.colors.text}
            style={{ opacity: 0.5 }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            placeholder={_t("common.search")}
            value={advFilters.search}
            onChangeText={(t) => setAdvFilters({ ...advFilters, search: t })}
            containerStyle={{ marginBottom: 0 }}
            style={{ height: 44, borderRadius: 12 }}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterBtn,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={20}
            color={theme.colors.primary}
          />
          {Object.values(advFilters).some(
            (v) => v !== "" && v !== null && v !== "existing",
          ) && (
            <View
              style={[
                styles.filterBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Animals List */}
      <View style={{ flex: 1 }}>
        {loadingAnimals && !refreshing && (
          <View style={styles.listOverlay}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
          </View>
        )}

        <FlatList
          data={animals}
          renderItem={renderAnimal}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            !loading && !loadingAnimals ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="cow-off"
                  size={64}
                  color={theme.colors.text}
                  style={{ opacity: 0.1 }}
                />
                <Text
                  style={{
                    color: theme.colors.text,
                    opacity: 0.3,
                    marginTop: 15,
                  }}
                >
                  {_t("farm.no_animals")}
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            nextUrl ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <Button
                  title={_t("common.show_more")}
                  onPress={() => fetchAnimals(true, true)}
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
        />
      </View>

      {/* Advanced Filter Modal */}
      <GenericModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title={_t("farm.filters")}
      >
        <View>
          <Dropdown
            label={_t("common.status")}
            data={[
              { label: _t("common.all"), value: "all" },
              { label: _t("farm.existing"), value: "existing" },
              { label: _t("farm.sold"), value: "sold" },
              { label: _t("farm.dead"), value: "dead" },
            ]}
            value={advFilters.status}
            labelField="label"
            valueField="value"
            onChange={(item: any) =>
              setAdvFilters({ ...advFilters, status: item.value })
            }
          />

          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.weight_min")}
                value={advFilters.weight_min}
                onChangeText={(t) =>
                  setAdvFilters({ ...advFilters, weight_min: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.weight_max")}
                value={advFilters.weight_max}
                onChangeText={(t) =>
                  setAdvFilters({ ...advFilters, weight_max: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <TouchableOpacity onPress={() => setShowBirthDateMinPicker(true)}>
                <Input
                  label={_t("farm.birth_date_from")}
                  value={advFilters.birth_date_min}
                  editable={false}
                  pointerEvents="none"
                  rightIcon="calendar"
                />
              </TouchableOpacity>
              {showBirthDateMinPicker && (
                <DateTimePicker
                  value={
                    advFilters.birth_date_min
                      ? new Date(advFilters.birth_date_min)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowBirthDateMinPicker(Platform.OS === "ios");
                    if (d)
                      setAdvFilters({
                        ...advFilters,
                        birth_date_min: d.toISOString().split("T")[0],
                      });
                  }}
                />
              )}
            </View>
            <View style={styles.formGroup}>
              <TouchableOpacity onPress={() => setShowBirthDateMaxPicker(true)}>
                <Input
                  label={_t("farm.birth_date_to")}
                  value={advFilters.birth_date_max}
                  editable={false}
                  pointerEvents="none"
                  rightIcon="calendar"
                />
              </TouchableOpacity>
              {showBirthDateMaxPicker && (
                <DateTimePicker
                  value={
                    advFilters.birth_date_max
                      ? new Date(advFilters.birth_date_max)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onChange={(e, d) => {
                    setShowBirthDateMaxPicker(Platform.OS === "ios");
                    if (d)
                      setAdvFilters({
                        ...advFilters,
                        birth_date_max: d.toISOString().split("T")[0],
                      });
                  }}
                />
              )}
            </View>
          </View>

          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.price_min")}
                value={advFilters.head_price_min}
                onChangeText={(t) =>
                  setAdvFilters({ ...advFilters, head_price_min: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.price_max")}
                value={advFilters.head_price_max}
                onChangeText={(t) =>
                  setAdvFilters({ ...advFilters, head_price_max: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Input
            label={_t("farm.color")}
            value={advFilters.color}
            onChangeText={(t) => setAdvFilters({ ...advFilters, color: t })}
          />

          <Dropdown
            label={_t("farm.pregnancy_status")}
            data={[
              { label: _t("common.all"), value: "" },
              { label: _t("farm.pending"), value: "pending" },
              { label: _t("farm.success"), value: "success" },
              { label: _t("farm.delivered"), value: "delivered" },
              { label: _t("farm.cancelled"), value: "cancelled" },
            ]}
            value={advFilters.pregnancy_status}
            labelField="label"
            valueField="value"
            onChange={(item: any) =>
              setAdvFilters({ ...advFilters, pregnancy_status: item.value })
            }
          />

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
              {_t("farm.is_pregnant")}
            </Text>
            <View style={styles.selectionRow}>
              {[
                { label: _t("common.all"), value: null },
                { label: _t("common.yes"), value: true },
                { label: _t("common.no"), value: false },
              ].map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.selectionChip,
                    { borderColor: theme.colors.border },
                    advFilters.is_pregnant === opt.value && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() =>
                    setAdvFilters({
                      ...advFilters,
                      is_pregnant: opt.value as any,
                    })
                  }
                >
                  <Text
                    style={{
                      color:
                        advFilters.is_pregnant === opt.value
                          ? "#FFF"
                          : theme.colors.text,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
              {_t("farm.has_active_pregnancy")}
            </Text>
            <View style={styles.selectionRow}>
              {[
                { label: _t("common.all"), value: null },
                { label: _t("common.yes"), value: true },
                { label: _t("common.no"), value: false },
              ].map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.selectionChip,
                    { borderColor: theme.colors.border },
                    advFilters.has_active_pregnancy === opt.value && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() =>
                    setAdvFilters({
                      ...advFilters,
                      has_active_pregnancy: opt.value as any,
                    })
                  }
                >
                  <Text
                    style={{
                      color:
                        advFilters.has_active_pregnancy === opt.value
                          ? "#FFF"
                          : theme.colors.text,
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ gap: 10, marginTop: 20 }}>
            <Button
              title={_t("farm.apply_filters")}
              onPress={() => {
                setFilterModalVisible(false);
                fetchAnimals();
              }}
            />
            <Button
              title={_t("farm.reset_filters")}
              variant="outline"
              onPress={() => {
                setAdvFilters({
                  is_pregnant: null,
                  has_active_pregnancy: null,
                  pregnancy_status: "",
                  birth_date_min: "",
                  birth_date_max: "",
                  weight_min: "",
                  weight_max: "",
                  head_price_min: "",
                  head_price_max: "",
                  color: "",
                  search: "",
                  status: "existing",
                });
                setSelectedType(null);
                setSelectedGender("all");
                setFilterModalVisible(false);
              }}
            />
          </View>
        </View>
      </GenericModal>

      {/* 4. FAB - Add Animal */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        activeOpacity={0.8}
        onPress={() => {
          setAnimalForm((prev) => ({ ...prev, animal_type: selectedType }));
          fetchMothers();
          setAnimalModalVisible(true);
        }}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* 5. Modals */}

      {/* Create Type Modal */}
      <GenericModal
        visible={typeModalVisible}
        onClose={() => setTypeModalVisible(false)}
        title={_t("farm.add_type")}
      >
        <Input
          label={_t("farm.type_name")}
          placeholder={_t("farm.type_name")}
          value={newTypeName}
          onChangeText={setNewTypeName}
        />
        <Button
          title={_t("common.confirm")}
          onPress={handleAddType}
          loading={submittingType}
          style={{ marginTop: 20 }}
        />
      </GenericModal>

      {/* Create Animal Modal */}
      <GenericModal
        visible={animalModalVisible}
        onClose={() => setAnimalModalVisible(false)}
        title={_t("farm.add_animal")}
      >
        <View>
          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.animal_name")}
                value={animalForm.name}
                onChangeText={(t) => setAnimalForm({ ...animalForm, name: t })}
              />
            </View>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.animal_number")}
                value={animalForm.animal_number}
                onChangeText={(t) =>
                  setAnimalForm({ ...animalForm, animal_number: t })
                }
                keyboardType="number-pad"
              />
            </View>
          </View>

          <Text style={styles.formLabel}>{_t("farm.gender")}</Text>
          <View style={styles.formRow}>
            {["male", "female"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.formSelection,
                  { borderColor: theme.colors.border },
                  animalForm.gender === g && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() =>
                  setAnimalForm({ ...animalForm, gender: g as any })
                }
              >
                <Text
                  style={{
                    color: animalForm.gender === g ? "#FFF" : theme.colors.text,
                  }}
                >
                  {_t(`common.${g}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Dropdown
            label={_t("farm.animals")}
            data={types}
            value={animalForm.animal_type}
            valueField="id"
            labelField="name"
            placeholder={_t("farm.select_type")}
            onChange={(item: AnimalType) =>
              setAnimalForm({ ...animalForm, animal_type: item.id })
            }
          />

          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <TouchableOpacity onPress={() => setShowBirthDatePicker(true)}>
                <Input
                  label={_t("farm.birth_date")}
                  value={animalForm.birth_date}
                  editable={false}
                  pointerEvents="none"
                  rightIcon="calendar"
                />
              </TouchableOpacity>
              {showBirthDatePicker && (
                <DateTimePicker
                  value={new Date(animalForm.birth_date)}
                  mode="date"
                  display="default"
                  onChange={onBirthDateChange}
                />
              )}
            </View>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.weight")}
                value={animalForm.weight}
                onChangeText={(t) =>
                  setAnimalForm({ ...animalForm, weight: t })
                }
                keyboardType="decimal-pad"
                rightIcon="weight-kilogram"
              />
            </View>
          </View>

          <Input
            label={_t("farm.color")}
            value={animalForm.color}
            onChangeText={(t) => setAnimalForm({ ...animalForm, color: t })}
          />

          {loadingMothers ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Dropdown
              label={_t("farm.mother")}
              data={[
                { id: null, name: _t("common.none"), animal_number: "" },
                ...mothers,
              ]}
              value={animalForm.mother}
              valueField="id"
              labelField={(item: any) => {
                if (item.id === null) return item.name;
                return `#${item.animal_number} ${item.name} ${
                  item.status !== "existing" && item.status
                    ? `(${_t(`farm.${item.status}`)})`
                    : ""
                }`;
              }}
              placeholder={_t("farm.select_mother")}
              onChange={(item: any) =>
                setAnimalForm({ ...animalForm, mother: item.id })
              }
            />
          )}

          <Input
            label={_t("farm.head_price")}
            value={animalForm.head_price}
            onChangeText={(t) =>
              setAnimalForm({ ...animalForm, head_price: t })
            }
            keyboardType="decimal-pad"
          />

          <Input
            label={_t("farm.notes")}
            placeholder="..."
            value={animalForm.breeder_notes}
            onChangeText={(t) =>
              setAnimalForm({ ...animalForm, breeder_notes: t })
            }
            multiline
          />

          <View
            style={[
              styles.cardDivider,
              {
                marginVertical: 20,
                backgroundColor: theme.colors.primary + "30",
              },
            ]}
          />

          <TouchableOpacity
            style={styles.purchaseToggle}
            onPress={() =>
              setAnimalForm({
                ...animalForm,
                is_purchase: !animalForm.is_purchase,
              })
            }
          >
            <MaterialCommunityIcons
              name={
                animalForm.is_purchase
                  ? "checkbox-marked"
                  : "checkbox-blank-outline"
              }
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={{
                marginLeft: 10,
                fontWeight: "bold",
                color: theme.colors.text,
              }}
            >
              {_t("farm.add_purchase")}?
            </Text>
          </TouchableOpacity>

          {animalForm.is_purchase && (
            <View style={{ gap: 10, marginTop: 10 }}>
              <View style={styles.formGrid}>
                <View style={styles.formGroup}>
                  <Input
                    label={_t("farm.purchase_price")}
                    value={animalForm.purchase_price}
                    onChangeText={(t) =>
                      setAnimalForm({ ...animalForm, purchase_price: t })
                    }
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.formGroup}>
                  <TouchableOpacity
                    onPress={() => setShowPurchaseDatePicker(true)}
                  >
                    <Input
                      label={_t("farm.purchase_date")}
                      value={animalForm.purchase_date}
                      editable={false}
                      pointerEvents="none"
                      rightIcon="calendar"
                    />
                  </TouchableOpacity>
                  {showPurchaseDatePicker && (
                    <DateTimePicker
                      value={new Date(animalForm.purchase_date)}
                      mode="date"
                      display="default"
                      onChange={onPurchaseDateChange}
                    />
                  )}
                </View>
              </View>
              <Input
                label={_t("farm.seller_name")}
                value={animalForm.seller_name}
                onChangeText={(t) =>
                  setAnimalForm({ ...animalForm, seller_name: t })
                }
              />
            </View>
          )}

          <Button
            title={_t("common.confirm")}
            onPress={handleCreateAnimal}
            loading={submittingAnimal}
            style={{ marginVertical: 20 }}
          />
        </View>
      </GenericModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  typesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  typesScroll: {
    paddingHorizontal: 15,
    gap: 8,
  },
  typeTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 60,
  },
  typeTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addTab: {
    borderWidth: 1,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  genderContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 5,
  },
  genderTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  genderTabText: {
    fontSize: 15,
    fontWeight: "700",
  },
  listContent: {
    padding: 15,
    paddingBottom: 100, // Extra space for FAB
    gap: 15,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    borderRadius: 20,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
    marginHorizontal: 12,
  },
  statusBadgeRow: {
    alignItems: "flex-end",
    gap: 4,
  },
  idBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardDivider: {
    height: 1,
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 15,
  },
  cardContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 25,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalScroll: {
    maxHeight: 500,
  },
  formGrid: {
    flexDirection: "row",
    gap: 12,
  },
  formGroup: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    opacity: 0.7,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  formSelection: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
  },
  listOverlay: {
    position: "absolute",
    top: 10,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 20,
  },
  purchaseToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  searchFilterBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
    gap: 12,
    alignItems: "center",
  },
  searchIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  filterBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FFF",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: "center",
  },
  filterSection: {
    marginVertical: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    opacity: 0.7,
  },
  selectionRow: {
    flexDirection: "row",
    gap: 8,
  },
  selectionChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AnimalsListScreen;
