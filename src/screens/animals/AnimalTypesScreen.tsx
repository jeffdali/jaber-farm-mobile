import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  I18nManager,
} from "react-native";
import { useTheme } from "../../theme";
import {
  Text,
  Header,
  GenericModal,
  Input,
  Button,
  Skeleton,
} from "../../components/common";
import { _t } from "../../locales";
import { animalsService, AnimalType } from "../../services/animals.service";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const LoadingSkeleton = () => {
  const { theme } = useTheme();
  return (
    <View style={{ padding: 16 }}>
      {[1, 2, 3, 4, 5].map((key) => (
        <View
          key={key}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            marginBottom: 12,
            backgroundColor: theme.colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
        >
          <Skeleton
            width={40}
            height={40}
            borderRadius={20}
            style={{ marginRight: 15 }}
          />
          <View style={{ flex: 1 }}>
            <Skeleton width="60%" height={20} style={{ marginBottom: 6 }} />
            <Skeleton width="40%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
};

const AnimalTypesScreen = () => {
  const { theme } = useTheme();
  const [types, setTypes] = useState<AnimalType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    if (!refreshing) setLoading(true);
    try {
      const data = await animalsService.getAnimalTypes();
      // Sort: Active first, then by name
      const sortedData = data.sort((a: AnimalType, b: AnimalType) => {
        if (a.is_active === b.is_active) {
          return a.name.localeCompare(b.name);
        }
        return a.is_active ? -1 : 1;
      });
      setTypes(sortedData);
    } catch (error) {
      console.error(error);
      Alert.alert(_t("common.error"), _t("farm.failed_to_fetch_types"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTypes();
  };

  const handleAddType = async () => {
    if (!newTypeName.trim()) {
      Alert.alert(_t("common.error"), _t("farm.enter_type_name"));
      return;
    }

    setSubmitting(true);
    try {
      await animalsService.createAnimalType({ name: newTypeName });
      setNewTypeName("");
      setModalVisible(false);
      fetchTypes();
      Alert.alert(_t("common.success"), _t("farm.type_added_successfully"));
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        _t("common.error"),
        error.message || _t("farm.failed_to_add_type"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = (id: number) => {
    Alert.alert(_t("farm.archive"), _t("farm.confirm_archive"), [
      {
        text: _t("common.cancel"),
        style: "cancel",
      },
      {
        text: _t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await animalsService.deleteAnimalType(id);
            fetchTypes();
          } catch (error) {
            console.error(error);
            Alert.alert(_t("common.error"), _t("farm.failed_to_archive_type"));
          }
        },
      },
    ]);
  };

  const handleRestore = async (id: number) => {
    try {
      await animalsService.updateAnimalType(id, { is_active: true });
      fetchTypes();
    } catch (error: any) {
      console.error(error);
      Alert.alert(_t("common.error"), _t("farm.failed_to_restore_type"));
    }
  };

  const renderItem = ({ item }: { item: AnimalType }) => (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          opacity: item.is_active ? 1 : 0.7,
        },
      ]}
    >
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="shape-outline"
            size={24}
            color={item.is_active ? theme.colors.primary : theme.colors.text}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            variant="h3"
            style={{
              color: theme.colors.text,
              textDecorationLine: item.is_active ? "none" : "line-through",
            }}
          >
            {item.name}
          </Text>
          {!item.is_active && (
            <Text
              variant="body"
              style={{ color: theme.colors.text, fontSize: 12, opacity: 0.7 }}
            >
              {_t("farm.archived")}
            </Text>
          )}
        </View>

        {item.is_active ? (
          <TouchableOpacity
            onPress={() => handleArchive(item.id)}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="archive-outline"
              size={22}
              color={theme.colors.error || "#FF3B30"}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => handleRestore(item.id)}
            style={styles.actionButton}
          >
            <MaterialCommunityIcons
              name="restore"
              size={22}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("farm.animals")} showBack />

      <View style={styles.content}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <FlatList
            data={types}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            onRefresh={onRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 20,
                  color: theme.colors.text,
                }}
              >
                {_t("farm.no_types_found")}
              </Text>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <GenericModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
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
          loading={submitting}
          style={{ marginTop: 20 }}
        />
      </GenericModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20, // Adjusted padding
    paddingTop: 10,
  },
  listContent: {
    paddingBottom: 100, // Space for FAB
  },
  itemContainer: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15, // Will flip in RTL automatically
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  actionButton: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    // Handle RTL explicitly if needed, but 'right' with I18nManager.isRTL might behave differently on some versions.
    // Standard RN Flexbox: 'right' applies to Right side regardless of RTL.
    // To make it appear on the 'End' side (Right for LTR, Left for RTL), use 'end' if supported, or logic.
    // However, floating actions are typically strictly bottom-right in Material Design, even in RTL.
    // But if user wants RTL support, maybe they expect it on left?
    // Let's stick to Right side as per Material guidelines predominantly, or flip if strongly desired.
    // Most RTL apps usually mirror layout.
    [I18nManager.isRTL ? "left" : "right"]: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 999,
  },
});

export default AnimalTypesScreen;
