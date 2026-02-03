import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  Input,
  Button,
  GenericModal,
} from "../../components/common";
import { _t } from "../../locales";
import {
  animalsService,
  Animal,
  AnimalType,
} from "../../services/animals.service";
import { financeService } from "../../services/finance.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  });

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

  const fetchAnimals = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setLoadingAnimals(true);
      try {
        const data = await animalsService.getAnimals({
          animal_type: selectedType || undefined,
          gender: selectedGender === "all" ? undefined : selectedGender,
        });
        setAnimals(data);
      } catch (error) {
        console.error("Failed to fetch animals:", error);
        Alert.alert(_t("common.error"), "Failed to load animals");
      } finally {
        setLoadingAnimals(false);
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedType, selectedGender],
  );

  // Initial Load: Types only once on mount
  useEffect(() => {
    fetchTypes();
  }, []); // Strictly once

  // Load Animals: Only when filters change
  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  // Handle auto-refresh when focusing back
  useFocusEffect(
    useCallback(() => {
      if (!loading && !loadingAnimals) {
        fetchAnimals(true);
      }
    }, [fetchAnimals, loading, loadingAnimals]),
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
      Alert.alert(_t("common.error"), "Failed to create type");
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

      if (animalForm.is_purchase) {
        await financeService.createPurchase({
          animal: animal.id,
          purchase_price: parseFloat(animalForm.purchase_price),
          purchase_date: animalForm.purchase_date,
          seller_name: animalForm.seller_name,
          notes: "Automatic purchase record for " + animal.name,
        });
      }

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
      });
      fetchAnimals(true);
    } catch (error: any) {
      const msg = error.response?.data?.animal_number
        ? "Animal number already exists"
        : "Failed to create animal";
      Alert.alert(_t("common.error"), msg);
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
        />
      </View>

      {/* 4. FAB - Add Animal */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        activeOpacity={0.8}
        onPress={() => {
          setAnimalForm((prev) => ({ ...prev, animal_type: selectedType }));
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
        <ScrollView
          style={styles.modalScroll}
          showsVerticalScrollIndicator={false}
        >
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

          <Text style={styles.formLabel}>{_t("farm.animals")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.formRow}
          >
            {types.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.formSelection,
                  { borderColor: theme.colors.border },
                  animalForm.animal_type === type.id && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
                onPress={() =>
                  setAnimalForm({ ...animalForm, animal_type: type.id })
                }
              >
                <Text
                  style={{
                    color:
                      animalForm.animal_type === type.id
                        ? "#FFF"
                        : theme.colors.text,
                  }}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.weight")}
                value={animalForm.weight}
                onChangeText={(t) =>
                  setAnimalForm({ ...animalForm, weight: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Input
                label={_t("farm.head_price")}
                value={animalForm.head_price}
                onChangeText={(t) =>
                  setAnimalForm({ ...animalForm, head_price: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Input
            label={_t("farm.color")}
            value={animalForm.color}
            onChangeText={(t) => setAnimalForm({ ...animalForm, color: t })}
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
                  <Input
                    label={_t("farm.purchase_date")}
                    value={animalForm.purchase_date}
                    onChangeText={(t) =>
                      setAnimalForm({ ...animalForm, purchase_date: t })
                    }
                  />
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
        </ScrollView>
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
});

export default AnimalsListScreen;
