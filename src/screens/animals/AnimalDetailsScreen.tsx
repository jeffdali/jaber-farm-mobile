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
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  Button,
  GenericModal,
  Input,
  Dropdown,
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
  PregnancyTracking,
  animalsService,
} from "../../services/animals.service";
import { PregnancyItem } from "../../components/animals/PregnancyItem";
import { financeService } from "../../services/finance.service";
import { formatCurrency, getErrorMessage } from "../../utils/helpers";

const { width } = Dimensions.get("window");

const InfoGridItem = ({
  label,
  value,
  icon,
  color,
  flex,
  style,
}: {
  label: string;
  value: string;
  icon: string;
  color?: string;
  flex?: number;
  style?: any;
}) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.infoItem,
        { backgroundColor: theme.colors.card, flex: flex || undefined },
        style,
      ]}
    >
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
          numberOfLines={1}
          style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700" }}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const DualInfoItem = ({
  icon,
  items,
}: {
  icon: string;
  items: { label: string; value: string; color?: string }[];
}) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.infoItem, { backgroundColor: theme.colors.card }]}>
      <View
        style={[
          styles.infoIconBox,
          { backgroundColor: theme.colors.primary + "15" },
        ]}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={22}
          color={theme.colors.primary}
        />
      </View>
      <View style={{ flex: 1, flexDirection: "row", gap: 10 }}>
        {items.map((item, idx) => (
          <View key={idx} style={[styles.infoTextContainer, { flex: 1 }]}>
            <Text
              variant="caption"
              style={{ color: theme.colors.text, opacity: 0.5, fontSize: 13 }}
            >
              {item.label}
            </Text>
            <Text
              variant="h3"
              numberOfLines={1}
              style={{
                color: item.color || theme.colors.text,
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              {item.value}
            </Text>
          </View>
        ))}
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

const OffspringItem = ({ animal }: { animal: Animal }) => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.offspringCard,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.avatarBoxSmall,
          {
            backgroundColor:
              animal.gender === "male" ? "#2196F320" : "#E91E6320",
          },
        ]}
      >
        <MaterialCommunityIcons
          name={animal.gender === "male" ? "gender-male" : "gender-female"}
          size={20}
          color={animal.gender === "male" ? "#2196F3" : "#E91E63"}
        />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text variant="h3" style={{ color: theme.colors.text }}>
          {animal.name || _t("farm.animal")}
        </Text>
        <Text
          variant="caption"
          style={{ color: theme.colors.text, opacity: 0.6 }}
        >
          #{animal.animal_number} • {animal.animal_type_name}
        </Text>
      </View>
      <View
        style={[
          styles.typeTagSmall,
          { backgroundColor: theme.colors.primary + "10" },
        ]}
      >
        <Text
          style={{
            color: theme.colors.primary,
            fontSize: 10,
            fontWeight: "bold",
          }}
        >
          {animal.age}
        </Text>
      </View>
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
  // Pregnancy State
  const [pregnancyModalVisible, setPregnancyModalVisible] = useState(false);
  const [pregnancyRecords, setPregnancyRecords] = useState<PregnancyTracking[]>(
    [],
  );
  const [loadingPregnancy, setLoadingPregnancy] = useState(false);

  // Offspring State
  const [offspringModalVisible, setOffspringModalVisible] = useState(false);
  const [offspring, setOffspring] = useState<Animal[]>([]);
  const [loadingOffspring, setLoadingOffspring] = useState(false);

  // Animation
  const fadeAnim = useState(new Animated.Value(0))[0];

  const fetchAnimal = useCallback(async () => {
    const animalId = route.params.animalId || route.params.animal?.id;
    if (!animalId) return;

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
  }, [route.params.animalId, route.params.animal?.id, navigation]);

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
    mother: route.params?.animal?.mother || null,
    birth_date:
      route.params?.animal?.birth_date ||
      new Date().toISOString().split("T")[0],
  });

  const [mothers, setMothers] = useState<Animal[]>([]);
  const [loadingMothers, setLoadingMothers] = useState(false);

  const fetchMothers = useCallback(async () => {
    setLoadingMothers(true);
    try {
      const data = await animalsService.getAllAnimals({
        gender: "female",
        status: "all",
      });
      // Sort: existing first
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

  useEffect(() => {
    if (editModalVisible) {
      fetchMothers();
    }
  }, [editModalVisible, fetchMothers]);

  const [noteForm, setNoteForm] = useState({
    id: null as number | null,
    note: "",
  });

  const [sellForm, setSellForm] = useState({
    sold_price: animal?.head_price?.toString() || "",
    sold_at: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [pregnancyForm, setPregnancyForm] = useState({
    id: null as number | null,
    status: "pending" as "pending" | "success" | "cancelled" | "delivered",
    date_started: new Date().toISOString().split("T")[0],
    date_confirmed: "",
    expected_delivery_date: "",
    notes: "",
  });

  // Date Pickers
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const [showPurchaseDatePicker, setShowPurchaseDatePicker] = useState(false);
  const [showSoldDatePicker, setShowSoldDatePicker] = useState(false);
  const [showPregnancyDateStartedPicker, setShowPregnancyDateStartedPicker] =
    useState(false);
  const [
    showPregnancyDateConfirmedPicker,
    setShowPregnancyDateConfirmedPicker,
  ] = useState(false);
  const [
    showPregnancyExpectedDeliveryDatePicker,
    setShowPregnancyExpectedDeliveryDatePicker,
  ] = useState(false);

  const onBirthDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowBirthDatePicker(false);
    if (selectedDate) {
      setAnimalForm({
        ...animalForm,
        birth_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onPurchaseDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") setShowPurchaseDatePicker(false);
    if (selectedDate) {
      setPurchaseForm({
        ...purchaseForm,
        purchase_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onSoldDateChange = (event: any, selectedDate?: Date) => {
    setShowSoldDatePicker(false);
    if (selectedDate) {
      setSellForm({
        ...sellForm,
        sold_at: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onPregnancyDateStartedChange = (event: any, selectedDate?: Date) => {
    setShowPregnancyDateStartedPicker(false);
    if (selectedDate) {
      setPregnancyForm({
        ...pregnancyForm,
        date_started: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onPregnancyDateConfirmedChange = (event: any, selectedDate?: Date) => {
    setShowPregnancyDateConfirmedPicker(false);
    if (selectedDate) {
      setPregnancyForm({
        ...pregnancyForm,
        date_confirmed: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  const onPregnancyExpectedDeliveryDateChange = (
    event: any,
    selectedDate?: Date,
  ) => {
    setShowPregnancyExpectedDeliveryDatePicker(false);
    if (selectedDate) {
      setPregnancyForm({
        ...pregnancyForm,
        expected_delivery_date: selectedDate.toISOString().split("T")[0],
      });
    }
  };

  useEffect(() => {
    if (animal) {
      setAnimalForm({
        name: animal.name,
        animal_number: animal.animal_number,
        weight: animal.weight?.toString() || "",
        head_price: animal.head_price?.toString() || "",
        color: animal.color,
        mother: animal.mother,
        birth_date: animal.birth_date,
      });
      setSellForm((prev) => ({
        ...prev,
        sold_price: animal.head_price?.toString() || prev.sold_price,
        sold_at: new Date().toISOString().split("T")[0],
      }));
    }
  }, [animal]);

  const fetchOffspring = useCallback(async () => {
    if (!animal?.id) return;
    setLoadingOffspring(true);
    try {
      const data = await animalsService.getOffspring(animal.id);
      setOffspring(data);
    } catch (error) {
      console.error("Failed to fetch offspring:", error);
    } finally {
      setLoadingOffspring(false);
    }
  }, [animal?.id]);

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

  const fetchPregnancyRecords = useCallback(async () => {
    if (!animal?.id || animal.gender !== "female") return;
    setLoadingPregnancy(true);
    try {
      const data = await animalsService.getPregnancyRecords(animal.id);
      setPregnancyRecords(data);
    } catch (error) {
      console.error("Failed to fetch pregnancy records:", error);
    } finally {
      setLoadingPregnancy(false);
    }
  }, [animal?.id, animal?.gender]);

  useEffect(() => {
    if (animal?.id) {
      fetchNotes();
      fetchPregnancyRecords();
    }
  }, [fetchNotes, fetchPregnancyRecords, animal?.id]);

  const handleSavePregnancy = async () => {
    if (!animal?.id) return;
    setSubmitting(true);
    try {
      const dataToSend = {
        ...pregnancyForm,
        animal: animal.id,
        date_confirmed: pregnancyForm.date_confirmed || null,
        expected_delivery_date: pregnancyForm.expected_delivery_date || null,
      };

      if (pregnancyForm.id) {
        await animalsService.updatePregnancyRecord(
          pregnancyForm.id,
          dataToSend as any,
        );
      } else {
        await animalsService.createPregnancyRecord(dataToSend as any);
      }
      await fetchPregnancyRecords();
      // Also refresh animal to get updated status/properties
      const updatedAnimal = await animalsService.getAnimal(animal.id);
      setAnimal(updatedAnimal);
      setPregnancyModalVisible(false);
      Alert.alert(_t("common.success"), _t("farm.saved_successfully"));
    } catch (error: any) {
      const errorMsg = getErrorMessage(
        error,
        _t("farm.failed_to_save_pregnancy"),
      );
      Alert.alert(_t("common.error"), errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (animal?.id && offspringModalVisible && offspring.length === 0) {
      fetchOffspring();
    }
  }, [offspringModalVisible, animal?.id, fetchOffspring, offspring.length]);

  const handleDeletePregnancy = (id: number) => {
    Alert.alert(_t("common.confirm"), _t("farm.confirm_delete_pregnancy"), [
      { text: _t("common.cancel"), style: "cancel" },
      {
        text: _t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await animalsService.deletePregnancyRecord(id);
            await fetchPregnancyRecords();
            const updatedAnimal = await animalsService.getAnimal(animal!.id);
            setAnimal(updatedAnimal);
          } catch (error) {
            Alert.alert(_t("common.error"), _t("farm.failed_to_delete"));
          }
        },
      },
    ]);
  };

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
      const errorMsg = getErrorMessage(error, _t("farm.failed_to_update"));
      Alert.alert(_t("common.error"), errorMsg);
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
      const errorMsg = getErrorMessage(error, _t("farm.failed_to_save"));
      Alert.alert(_t("common.error"), errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnimal = async () => {
    if (!animal?.id) return;

    try {
      setSubmitting(true);
      const checks = await animalsService.checkDeletion(animal.id);

      let warningMessage = _t("farm.confirm_delete_animal");
      let warnings = [];

      if (checks.has_offspring) {
        warnings.push(
          _t("farm.warning_offspring").replace(
            "{count}",
            checks.offspring_count.toString(),
          ),
        );
      }
      if (checks.has_purchase) {
        warnings.push(_t("farm.warning_purchase"));
      }
      if (checks.has_sale) {
        warnings.push(_t("farm.warning_sale"));
      }

      if (checks.has_active_pregnancy) {
        warnings.push(
          _t("farm.pregnancy_tracking") +
            ": " +
            _t("farm.pending") +
            " / " +
            _t("farm.is_pregnant_label"),
        );
      } else if (checks.has_pregnancy) {
        warnings.push(_t("farm.pregnancy_tracking"));
      }

      if (warnings.length > 0) {
        warningMessage = `${_t("common.warning")}:\n\n- ${warnings.join("\n- ")}\n\n${_t("farm.confirm_continue")}`;
      }

      Alert.alert(_t("common.confirm"), warningMessage, [
        { text: _t("common.cancel"), style: "cancel" },
        {
          text: _t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await animalsService.deleteAnimal(animal.id);
              Alert.alert(
                _t("common.success"),
                _t("farm.deleted_successfully"),
              );
              navigation.goBack();
            } catch (error) {
              Alert.alert(_t("common.error"), _t("farm.failed_to_delete"));
            }
          },
        },
      ]);
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_check_deletion"));
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
        sold_at: sellForm.sold_at,
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

  /* Purchase Edit Logic */
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    purchase_price: "",
    purchase_date: "",
    seller_name: "",
  });

  const handleUpdatePurchase = async () => {
    if (!animal || !animal.purchase_id) return;
    if (!purchaseForm.purchase_price) {
      Alert.alert(_t("common.error"), _t("farm.enter_price"));
      return;
    }
    setSubmitting(true);
    try {
      await financeService.updatePurchase(animal.purchase_id, {
        ...purchaseForm,
        purchase_price: parseFloat(purchaseForm.purchase_price),
      });

      // Refresh animal data
      const updatedAnimal = await animalsService.getAnimal(animal.id);
      navigation.setParams({ animal: updatedAnimal });

      setPurchaseModalVisible(false);
      Alert.alert(_t("common.success"), _t("farm.updated_successfully"));
    } catch (error) {
      Alert.alert(_t("common.error"), _t("farm.failed_to_update"));
    } finally {
      setSubmitting(false);
    }
  };

  const isExist = animal?.status === "existing";
  const genderColor = animal?.gender === "male" ? "#2196F3" : "#E91E63";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title={_t("common.details")}
        showBack
        rightIcon="delete"
        onRightPress={handleDeleteAnimal}
      />

      <GenericModal
        visible={purchaseModalVisible}
        onClose={() => setPurchaseModalVisible(false)}
        title={_t("farm.edit_purchase")}
      >
        <ScrollView>
          <Input
            label={_t("farm.purchase_price")}
            value={purchaseForm.purchase_price}
            onChangeText={(t) =>
              setPurchaseForm({ ...purchaseForm, purchase_price: t })
            }
            keyboardType="decimal-pad"
          />
          <TouchableOpacity onPress={() => setShowPurchaseDatePicker(true)}>
            <Input
              label={_t("farm.purchase_date")}
              value={purchaseForm.purchase_date}
              editable={false}
              pointerEvents="none"
              rightIcon="calendar"
            />
          </TouchableOpacity>
          {showPurchaseDatePicker && (
            <DateTimePicker
              value={new Date(purchaseForm.purchase_date || new Date())}
              mode="date"
              display="default"
              onChange={onPurchaseDateChange}
            />
          )}
          <Input
            label={_t("farm.seller_name")}
            value={purchaseForm.seller_name}
            onChangeText={(t) =>
              setPurchaseForm({ ...purchaseForm, seller_name: t })
            }
          />
          <Button
            title={_t("common.save")}
            onPress={handleUpdatePurchase}
            loading={submitting}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </GenericModal>

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
                    {animal.is_pregnant && (
                      <View
                        style={[
                          styles.isPregnantTag,
                          { backgroundColor: "#4CD96415" },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="check-decagram"
                          size={12}
                          color="#4CD964"
                        />
                        <Text
                          style={{
                            color: "#4CD964",
                            fontWeight: "bold",
                            fontSize: 12,
                            marginLeft: 4,
                          }}
                        >
                          {_t("farm.is_pregnant_label")}
                        </Text>
                      </View>
                    )}
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
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View
                    style={[
                      styles.statusBanner,
                      {
                        backgroundColor: isExist ? "#4CD96410" : "#FF3B3010",
                        borderColor: isExist ? "#4CD96430" : "#FF3B3030",
                        flex: 1,
                        minHeight: 48,
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
                        letterSpacing: 1,
                        marginLeft: 6,
                      }}
                    >
                      {_t(`farm.${animal.status}`).toUpperCase()}
                    </Text>
                  </View>

                  {animal.offspring_count > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.statusBanner,
                        {
                          backgroundColor: theme.colors.primary + "10",
                          borderColor: theme.colors.primary + "30",
                          flex: 1,
                          minHeight: 48,
                        },
                      ]}
                      onPress={() => setOffspringModalVisible(true)}
                    >
                      <MaterialCommunityIcons
                        name="family-tree"
                        size={18}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={{
                          color: theme.colors.primary,
                          fontWeight: "800",
                          marginLeft: 6,
                        }}
                      >
                        {animal.offspring_count} {_t("farm.offspring")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {isExist && (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: theme.colors.primary },
                      ]}
                      onPress={() => setSellModalVisible(true)}
                    >
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={18}
                        color="#FFF"
                      />
                      <Text style={styles.actionBtnText}>
                        {_t("farm.sell_animal")}
                      </Text>
                    </TouchableOpacity>

                    {animal.gender === "female" &&
                      !animal.has_active_pregnancy && (
                        <TouchableOpacity
                          style={[
                            styles.actionBtn,
                            { backgroundColor: "#FF9800" },
                          ]}
                          onPress={() => {
                            setPregnancyForm({
                              id: null,
                              status: "pending",
                              date_started: new Date()
                                .toISOString()
                                .split("T")[0],
                              date_confirmed: "",
                              expected_delivery_date: "",
                              notes: "",
                            });
                            setPregnancyModalVisible(true);
                          }}
                        >
                          <MaterialCommunityIcons
                            name="clipboard-pulse"
                            size={18}
                            color="#FFF"
                          />
                          <Text style={styles.actionBtnText}>
                            {_t("farm.add_pregnancy")}
                          </Text>
                        </TouchableOpacity>
                      )}
                  </View>
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
                  label={_t("farm.head_price")}
                  value={
                    animal.head_price
                      ? formatCurrency(Number(animal.head_price))
                      : "-"
                  }
                  icon="cash-multiple"
                />
                <InfoGridItem
                  label={_t("farm.birth_date")}
                  value={animal.birth_date || "-"}
                  icon="calendar-month"
                />
                <DualInfoItem
                  icon="information-outline"
                  items={[
                    {
                      label: _t("farm.weight"),
                      value: animal.weight
                        ? `${animal.weight} ${_t("farm.kg")}`
                        : "-",
                    },
                    {
                      label: _t("farm.color"),
                      value: animal.color || "-",
                    },
                  ]}
                />
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <InfoGridItem
                    flex={1}
                    label={_t("farm.gender")}
                    value={animal.gender ? _t(`common.${animal.gender}`) : "-"}
                    icon="gender-male-female"
                    color={genderColor}
                  />
                  <InfoGridItem
                    flex={1}
                    label={_t("farm.mother")}
                    value={
                      animal.mother_number ? `#${animal.mother_number}` : "-"
                    }
                    icon="gender-female"
                  />
                </View>
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
                  <TouchableOpacity
                    onPress={() => {
                      // We need purchase ID here. If not available in animal object, we might need to fetch it.
                      // Assuming we will add purchase_id to animal serializer.
                      if (animal.purchase_id) {
                        setPurchaseForm({
                          purchase_price:
                            animal.purchase_price?.toString() || "",
                          purchase_date: animal.purchase_date || "",
                          seller_name: animal.seller_name || "",
                        });
                        setPurchaseModalVisible(true);
                      } else {
                        Alert.alert(
                          _t("common.error"),
                          "Purchase ID not found",
                        );
                      }
                    }}
                  >
                    <MaterialCommunityIcons
                      name="pencil"
                      size={20}
                      color={theme.colors.text}
                      style={{ opacity: 0.5, marginLeft: 10 }}
                    />
                  </TouchableOpacity>
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

            {/* Moved Pregnancy records section to bottom */}
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

            {/* 3. Pregnancy History Section (Now at bottom) */}
            {animal.gender === "female" && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionIconCircle,
                      { backgroundColor: "#E91E6315" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="clipboard-pulse"
                      size={20}
                      color="#E91E63"
                    />
                  </View>
                  <Text
                    variant="h3"
                    style={[
                      styles.sectionTitle,
                      { color: theme.colors.text, flex: 1 },
                    ]}
                  >
                    {_t("farm.pregnancy_tracking")}
                  </Text>
                </View>

                {loadingPregnancy ? (
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginTop: 20 }}
                  />
                ) : pregnancyRecords.length > 0 ? (
                  <View style={styles.notesList}>
                    {pregnancyRecords.map((record) => (
                      <PregnancyItem
                        key={record.id}
                        record={record}
                        onEdit={() => {
                          setPregnancyForm({
                            id: record.id,
                            status: record.status,
                            date_started: record.date_started,
                            date_confirmed: record.date_confirmed || "",
                            expected_delivery_date:
                              record.expected_delivery_date || "",
                            notes: record.notes,
                          });
                          setPregnancyModalVisible(true);
                        }}
                        onDelete={() => handleDeletePregnancy(record.id)}
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
                      {_t("farm.no_pregnancy_records")}
                    </Text>
                  </View>
                )}
              </View>
            )}
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
          <TouchableOpacity onPress={() => setShowSoldDatePicker(true)}>
            <Input
              label={_t("farm.sold_date")}
              value={sellForm.sold_at}
              editable={false}
              pointerEvents="none"
              rightIcon="calendar"
            />
          </TouchableOpacity>
          {showSoldDatePicker && (
            <DateTimePicker
              value={new Date(sellForm.sold_at)}
              mode="date"
              display="default"
              onChange={onSoldDateChange}
            />
          )}
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

      {/* Pregnancy Modal */}
      <GenericModal
        visible={pregnancyModalVisible}
        onClose={() => setPregnancyModalVisible(false)}
        title={
          pregnancyForm.id
            ? _t("farm.update_pregnancy")
            : _t("farm.add_pregnancy")
        }
      >
        <ScrollView>
          <Dropdown
            label={_t("common.status")}
            data={[
              { id: "pending", name: _t("farm.pending") },
              { id: "success", name: _t("farm.success") },
              { id: "delivered", name: _t("farm.delivered") },
              { id: "cancelled", name: _t("farm.cancelled") },
            ]}
            value={pregnancyForm.status}
            valueField="id"
            labelField="name"
            onChange={(item: any) =>
              setPregnancyForm({ ...pregnancyForm, status: item.id })
            }
          />

          <View style={{ marginTop: 10 }}>
            <Text variant="caption" style={{ marginBottom: 5 }}>
              {_t("farm.date_started")}
            </Text>
            <TouchableOpacity
              onPress={() => setShowPregnancyDateStartedPicker(true)}
            >
              <Input
                value={pregnancyForm.date_started}
                editable={false}
                pointerEvents="none"
                placeholder="YYYY-MM-DD"
                rightIcon="calendar"
              />
            </TouchableOpacity>
            {showPregnancyDateStartedPicker && (
              <DateTimePicker
                value={new Date(pregnancyForm.date_started)}
                mode="date"
                display="default"
                onChange={onPregnancyDateStartedChange}
              />
            )}
          </View>

          {pregnancyForm.status === "success" && (
            <>
              <View style={{ marginTop: 10 }}>
                <Text variant="caption" style={{ marginBottom: 5 }}>
                  {_t("farm.date_confirmed")}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPregnancyDateConfirmedPicker(true)}
                >
                  <Input
                    value={
                      pregnancyForm.date_confirmed ||
                      new Date().toISOString().split("T")[0]
                    }
                    editable={false}
                    pointerEvents="none"
                    placeholder="YYYY-MM-DD"
                    rightIcon="calendar-check"
                  />
                </TouchableOpacity>
                {showPregnancyDateConfirmedPicker && (
                  <DateTimePicker
                    value={new Date(pregnancyForm.date_confirmed || Date.now())}
                    mode="date"
                    display="default"
                    onChange={onPregnancyDateConfirmedChange}
                  />
                )}
              </View>
              <View style={{ marginTop: 10 }}>
                <Text variant="caption" style={{ marginBottom: 5 }}>
                  {_t("farm.expected_delivery")}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setShowPregnancyExpectedDeliveryDatePicker(true)
                  }
                >
                  <Input
                    value={
                      pregnancyForm.expected_delivery_date ||
                      new Date().toISOString().split("T")[0]
                    }
                    editable={false}
                    pointerEvents="none"
                    placeholder="YYYY-MM-DD"
                    rightIcon="baby-carriage"
                  />
                </TouchableOpacity>
                {showPregnancyExpectedDeliveryDatePicker && (
                  <DateTimePicker
                    value={
                      new Date(
                        pregnancyForm.expected_delivery_date || Date.now(),
                      )
                    }
                    mode="date"
                    display="default"
                    onChange={onPregnancyExpectedDeliveryDateChange}
                  />
                )}
              </View>
            </>
          )}

          <Input
            label={_t("farm.notes")}
            value={pregnancyForm.notes}
            onChangeText={(t) =>
              setPregnancyForm({ ...pregnancyForm, notes: t })
            }
            multiline
            style={{ height: 80, marginTop: 10 }}
          />

          <Button
            title={_t("common.confirm")}
            onPress={handleSavePregnancy}
            loading={submitting}
            style={{ marginTop: 20 }}
          />
        </ScrollView>
      </GenericModal>

      <GenericModal
        visible={offspringModalVisible}
        onClose={() => setOffspringModalVisible(false)}
        title={_t("farm.offspring")}
      >
        {loadingOffspring ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ margin: 20 }}
          />
        ) : offspring.length > 0 ? (
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
          >
            {offspring.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setOffspringModalVisible(false);
                  navigation.push("AnimalDetails", {
                    animal: item,
                    animalId: item.id,
                  });
                }}
              >
                <OffspringItem animal={item} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: theme.colors.text, opacity: 0.6 }}>
              {_t("farm.no_offspring")}
            </Text>
          </View>
        )}
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
    gap: 12,
    marginTop: 20,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    minHeight: 48,
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 13,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
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
  isPregnantTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
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
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 8,
    opacity: 0.7,
  },
  modalScrollRow: {
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
    marginRight: 10,
  },
  offspringCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  avatarBoxSmall: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  typeTagSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});

export default AnimalDetailsScreen;
