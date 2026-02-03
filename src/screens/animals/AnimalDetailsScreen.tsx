import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  I18nManager,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  Button,
  GenericModal,
  Input,
} from "../../components/common";
import { _t } from "../../locales";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from "@react-navigation/native";
import {
  Animal,
  BreederNote,
  animalsService,
} from "../../services/animals.service";
import { financeService } from "../../services/finance.service";
import { formatCurrency } from "../../utils/helpers";

const { width } = Dimensions.get("window");

const InfoGridItem = ({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color?: string;
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.infoItem, { backgroundColor: theme.colors.card }]}>
      <View
        style={[
          styles.infoIconBox,
          { backgroundColor: (color || theme.colors.primary) + "15" },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={22}
          color={color || theme.colors.primary}
        />
      </View>
      <View style={styles.infoTextContainer}>
        <Text
          variant="caption"
          style={{ color: theme.colors.text, opacity: 0.5, fontSize: 13 }}
        >
          {label}
        </Text>
        <Text
          variant="h3"
          style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const NoteItem = ({
  note,
  onEdit,
  onDelete,
}: {
  note: BreederNote;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.noteCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.noteHeader}>
        <View
          style={[
            styles.noteDateBadge,
            { backgroundColor: theme.colors.primary + "10" },
          ]}
        >
          <MaterialCommunityIcons
            name="clock-outline"
            size={14}
            color={theme.colors.primary}
          />
          <Text
            variant="caption"
            style={{
              color: theme.colors.primary,
              fontWeight: "700",
              marginLeft: 4,
            }}
          >
            {note.record_date}
          </Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity
            onPress={onEdit}
            style={[
              styles.noteIconBtn,
              { backgroundColor: theme.colors.primary + "10" },
            ]}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={16}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            style={[
              styles.noteIconBtn,
              { backgroundColor: theme.colors.error + "10" },
            ]}
          >
            <MaterialCommunityIcons
              name="delete"
              size={16}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        </View>
      </View>
      <Text
        style={{
          color: theme.colors.text,
          fontSize: 15,
          lineHeight: 22,
          marginTop: 12,
        }}
      >
        {note.note}
      </Text>
    </View>
  );
};

const AnimalDetailsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [animal, setAnimal] = useState<Animal | null>(
    route.params.animal || null,
  );
  const [loading, setLoading] = useState(!route.params.animal);

  // Notes State
  const [notes, setNotes] = useState<BreederNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  // Modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchAnimal = useCallback(async () => {
    const animalId = route.params.animalId || route.params.animal?.id;
    if (!animalId) return;

    if (!animal) setLoading(true); // Only show spinner if no data exists yet
    try {
      const data = await animalsService.getAnimal(animalId);
      setAnimal(data);
    } catch (error) {
      console.error("Failed to fetch animal details:", error);
      if (!animal) {
        // Only go back if we have nothing to show
        Alert.alert(_t("common.error"), _t("farm.failed_to_fetch"));
        navigation.goBack();
      }
    } finally {
      setLoading(false);
    }
  }, [route.params.animalId, route.params.animal?.id, navigation, animal]);

  useEffect(() => {
    if (!animal) {
      fetchAnimal();
    }
  }, [animal, fetchAnimal]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useFocusEffect(
    useCallback(() => {
      if (route.params.animalId || route.params.animal?.id) {
        // Only fetch if we have an ID to fetch with
        fetchAnimal();
      }
    }, [fetchAnimal, route.params.animalId, route.params.animal?.id]),
  );

  // Forms
  const [animalForm, setAnimalForm] = useState({
    name: route.params?.animal?.name || "",
    animal_number: route.params?.animal?.animal_number || "",
    weight: route.params?.animal?.weight?.toString() || "",
    head_price: route.params?.animal?.head_price?.toString() || "",
    color: route.params?.animal?.color || "",
  });

  const [noteForm, setNoteForm] = useState({
    id: null as number | null,
    note: "",
  });

  const [sellForm, setSellForm] = useState({
    sold_price: animal?.head_price?.toString() || "",
    notes: "",
  });

  useEffect(() => {
    if (animal) {
      setAnimalForm({
        name: animal.name,
        animal_number: animal.animal_number,
        weight: animal.weight?.toString() || "",
        head_price: animal.head_price?.toString() || "",
        color: animal.color,
      });
      setSellForm((prev) => ({
        ...prev,
        sold_price: animal.head_price?.toString() || prev.sold_price,
      }));
    }
  }, [animal]);

  const fetchNotes = useCallback(async () => {
    if (!animal?.id) return;
    setLoadingNotes(true);
    try {
      const data = await animalsService.getNotes(animal.id);
      setNotes(data);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoadingNotes(false);
    }
  }, [animal?.id]);

  useEffect(() => {
    if (animal?.id) {
      fetchNotes();
    }
  }, [fetchNotes, animal?.id]);

  const handleUpdateAnimal = async () => {
    setSubmitting(true);
    try {
      if (!animal?.id) return;
      const updated = await animalsService.updateAnimal(animal.id, {
        ...animalForm,
        weight: animalForm.weight ? parseFloat(animalForm.weight) : null,
        head_price: animalForm.head_price
          ? parseFloat(animalForm.head_price)
          : null,
      } as any);
      setAnimal({ ...animal, ...updated });
      setEditModalVisible(false);
      Alert.alert(_t("common.success"), _t("farm.updated_successfully"));
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_update"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteForm.note.trim()) return;
    setSubmitting(true);
    try {
      if (!animal?.id) return;
      if (noteForm.id) {
        await animalsService.updateNote(noteForm.id, { note: noteForm.note });
      } else {
        await animalsService.createNote({
          animal: animal.id,
          note: noteForm.note,
        });
      }
      await fetchNotes();
      setNoteModalVisible(false);
      setNoteForm({ id: null, note: "" });
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_save"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSellAnimal = async () => {
    if (!sellForm.sold_price) {
      Alert.alert(_t("common.error"), _t("farm.enter_price"));
      return;
    }
    setSubmitting(true);
    try {
      if (!animal?.id) return;
      await financeService.createSale({
        animal: animal.id,
        sold_price: parseFloat(sellForm.sold_price),
        sold_at: new Date().toISOString().split("T")[0],
        notes: sellForm.notes,
      });
      setSellModalVisible(false);
      // Refresh animal status
      const updatedAnimal = await animalsService.getAnimal(animal.id);
      setAnimal(updatedAnimal);
      Alert.alert(_t("common.success"), _t("farm.sold_successfully"));
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_sell"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNote = (id: number) => {
    Alert.alert(_t("common.confirm"), _t("farm.confirm_delete_note"), [
      { text: _t("common.cancel"), style: "cancel" },
      {
        text: _t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await animalsService.deleteNote(id);
            await fetchNotes();
          } catch (error) {
            Alert.alert(_t("common.error"), _t("farm.failed_to_delete"));
          }
        },
      },
    ]);
  };

  const isExist = animal?.status === "existing";
  const genderColor = animal?.gender === "male" ? "#2196F3" : "#E91E63";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("common.details")} showBack />

      {loading && !animal ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : !animal ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: theme.colors.text, opacity: 0.5 }}>
            {_t("farm.failed_to_fetch")}
          </Text>
          <Button
            title={_t("common.back")}
            onPress={() => navigation.goBack()}
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ opacity: 1 }}>
            {/* 1. Identity Hero Section */}
            <View
              style={[styles.heroCard, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.heroLayout}>
                <View
                  style={[
                    styles.avatarBox,
                    { backgroundColor: theme.colors.primary + "10" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      (animal.animal_type_name?.includes("ماعز")
                        ? "sheep"
                        : "cow") as any
                    }
                    size={50}
                    color={theme.colors.primary}
                  />
                  <View
                    style={[
                      styles.genderBadge,
                      { backgroundColor: genderColor },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        animal.gender === "male"
                          ? "gender-male"
                          : "gender-female"
                      }
                      size={12}
                      color="#FFF"
                    />
                  </View>
                </View>
                <View style={styles.heroInfo}>
                  <Text
                    variant="h2"
                    style={{ color: theme.colors.text, fontSize: 24 }}
                  >
                    {animal.name}
                  </Text>
                  <View style={styles.tagRow}>
                    <View
                      style={[
                        styles.typeTag,
                        { backgroundColor: theme.colors.primary + "15" },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.primary,
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        {animal.animal_type_name}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.numberTag,
                        { backgroundColor: theme.colors.text + "10" },
                      ]}
                    >
                      <Text
                        style={{
                          color: theme.colors.text,
                          opacity: 0.6,
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        #ID:{animal.id}
                      </Text>
                    </View>
                    {animal.animal_number ? (
                      <View
                        style={[
                          styles.numberTag,
                          { backgroundColor: theme.colors.primary + "15" },
                        ]}
                      >
                        <Text
                          style={{
                            color: theme.colors.primary,
                            fontWeight: "bold",
                            fontSize: 12,
                          }}
                        >
                          #{animal.animal_number}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              <View style={styles.heroActions}>
                <View
                  style={[
                    styles.statusBanner,
                    {
                      backgroundColor: isExist ? "#4CD96410" : "#FF3B3010",
                      borderColor: isExist ? "#4CD96430" : "#FF3B3030",
                      flex: 1,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isExist ? "check-decagram" : "alert-decagram"}
                    size={18}
                    color={isExist ? "#4CD964" : "#FF3B30"}
                  />
                  <Text
                    style={{
                      color: isExist ? "#4CD964" : "#FF3B30",
                      fontWeight: "800",
                      marginLeft: 8,
                      letterSpacing: 1,
                    }}
                  >
                    {_t(`farm.${animal.status}`).toUpperCase()}
                  </Text>
                </View>

                {isExist && (
                  <TouchableOpacity
                    style={[
                      styles.sellBtn,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => setSellModalVisible(true)}
                  >
                    <MaterialCommunityIcons
                      name="currency-usd"
                      size={20}
                      color="#FFF"
                    />
                    <Text style={styles.sellBtnText}>
                      {_t("farm.sell_animal")}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 2. Detailed Info Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconCircle,
                    { backgroundColor: theme.colors.primary + "15" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="information-variant"
                    size={20}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  variant="h3"
                  style={[styles.sectionTitle, { color: theme.colors.text }]}
                >
                  {_t("common.details")}
                </Text>
              </View>

              <View style={styles.infoGrid}>
                <InfoGridItem
                  label={_t("farm.age")}
                  value={animal.age || "-"}
                  icon="calendar-clock"
                />
                <InfoGridItem
                  label={_t("farm.weight")}
                  value={
                    animal.weight ? `${animal.weight} ${_t("farm.kg")}` : "-"
                  }
                  icon="weight-kilogram"
                />
                <InfoGridItem
                  label={_t("farm.head_price")}
                  value={
                    animal.head_price
                      ? formatCurrency(Number(animal.head_price))
                      : "-"
                  }
                  icon="cash-multiple"
                />
                <InfoGridItem
                  label={_t("farm.color")}
                  value={animal.color || "-"}
                  icon="palette"
                />
                <InfoGridItem
                  label={_t("farm.birth_date")}
                  value={animal.birth_date || "-"}
                  icon="calendar-month"
                />
                <InfoGridItem
                  label={_t("farm.gender")}
                  value={animal.gender ? _t(`common.${animal.gender}`) : "-"}
                  icon="gender-male-female"
                  color={genderColor}
                />
              </View>
            </View>

            {/* 2.5 Purchase Information Section */}
            {animal.purchase_price && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIconCircle,
                      { backgroundColor: "#2196F315" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="basket-plus"
                      size={20}
                      color="#2196F3"
                    />
                  </View>
                  <Text
                    variant="h3"
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    {_t("stats.purchases")}
                  </Text>
                </View>

                <View style={styles.infoGrid}>
                  <InfoGridItem
                    label={_t("farm.purchase_price")}
                    value={formatCurrency(Number(animal.purchase_price))}
                    icon="cash"
                    color="#2196F3"
                  />
                  <InfoGridItem
                    label={_t("farm.purchase_date")}
                    value={animal.purchase_date || "-"}
                    icon="calendar-check"
                    color="#2196F3"
                  />
                  {animal.seller_name && (
                    <InfoGridItem
                      label={_t("farm.seller_name")}
                      value={animal.seller_name}
                      icon="account-tie"
                      color="#2196F3"
                    />
                  )}
                </View>
              </View>
            )}

            {/* 3. Notes Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionIconCircle,
                    { backgroundColor: "#FF980015" },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="notebook"
                    size={20}
                    color="#FF9800"
                  />
                </View>
                <Text
                  variant="h3"
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.text, flex: 1 },
                  ]}
                >
                  {_t("farm.notes")}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.addNotePill,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => {
                    setNoteForm({ id: null, note: "" });
                    setNoteModalVisible(true);
                  }}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#FFF" />
                  <Text
                    style={{
                      color: "#FFF",
                      fontWeight: "bold",
                      marginLeft: 4,
                      fontSize: 13,
                    }}
                  >
                    {_t("farm.add_note")}
                  </Text>
                </TouchableOpacity>
              </View>

              {loadingNotes ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.primary}
                  style={{ marginTop: 20 }}
                />
              ) : notes.length > 0 ? (
                <View style={styles.notesList}>
                  {notes.map((item) => (
                    <NoteItem
                      key={item.id}
                      note={item}
                      onEdit={() => {
                        setNoteForm({ id: item.id, note: item.note });
                        setNoteModalVisible(true);
                      }}
                      onDelete={() => handleDeleteNote(item.id)}
                    />
                  ))}
                </View>
              ) : (
                <View
                  style={[
                    styles.emptyState,
                    { backgroundColor: theme.colors.card },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.colors.text,
                      opacity: 0.4,
                      fontStyle: "italic",
                    }}
                  >
                    {_t("farm.no_notes_yet")}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ height: 120 }} />
          </View>
        </ScrollView>
      )}

      {/* FAB for Edit Animal */}
      {isExist && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
          onPress={() => setEditModalVisible(true)}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      {/* Modals */}
      <GenericModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title={_t("common.edit")}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            label={_t("farm.animal_name")}
            value={animalForm.name}
            onChangeText={(t) => setAnimalForm({ ...animalForm, name: t })}
          />
          <Input
            label={_t("farm.animal_number")}
            value={animalForm.animal_number}
            onChangeText={(t) =>
              setAnimalForm({ ...animalForm, animal_number: t })
            }
          />
          <View style={styles.modalRow}>
            <View style={{ flex: 1 }}>
              <Input
                label={_t("farm.weight")}
                value={animalForm.weight}
                onChangeText={(t) =>
                  setAnimalForm({ ...animalForm, weight: t })
                }
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
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
          <Button
            title={_t("common.confirm")}
            onPress={handleUpdateAnimal}
            loading={submitting}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </GenericModal>

      <GenericModal
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        title={noteForm.id ? _t("farm.edit_note") : _t("farm.add_note")}
      >
        <Input
          label={_t("farm.note")}
          placeholder={_t("farm.write_something")}
          value={noteForm.note}
          onChangeText={(t) => setNoteForm({ ...noteForm, note: t })}
          multiline
          style={{ height: 120 }}
        />
        <Button
          title={_t("common.confirm")}
          onPress={handleSaveNote}
          loading={submitting}
          style={{ marginTop: 15 }}
        />
      </GenericModal>

      {/* Selling Modal */}
      <GenericModal
        visible={sellModalVisible}
        onClose={() => setSellModalVisible(false)}
        title={_t("farm.sell_animal")}
      >
        <ScrollView>
          <Input
            label={_t("farm.sold_price")}
            placeholder="0.00"
            value={sellForm.sold_price}
            onChangeText={(t) => setSellForm({ ...sellForm, sold_price: t })}
            keyboardType="decimal-pad"
          />
          <Input
            label={_t("farm.notes")}
            placeholder="..."
            value={sellForm.notes}
            onChangeText={(t) => setSellForm({ ...sellForm, notes: t })}
            multiline
            style={{ height: 80 }}
          />
          <Button
            title={_t("common.confirm")}
            onPress={handleSellAnimal}
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
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    padding: 20,
    borderRadius: 28,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 20,
  },
  heroLayout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  genderBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  heroInfo: {
    flex: 1,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  numberTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroActions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  sellBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  sellBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: I18nManager.isRTL ? 0 : 12,
    marginLeft: I18nManager.isRTL ? 12 : 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    width: "100%",
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  addNotePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  notesList: {
    gap: 15,
  },
  noteCard: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteDateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  noteActions: {
    flexDirection: "row",
    gap: 8,
  },
  noteIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    padding: 30,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.3)",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 33,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
});

export default AnimalDetailsScreen;
