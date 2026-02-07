import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ListRenderItem,
} from "react-native";
import { useTheme } from "../../theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Input } from "./Input";
import { _t } from "../../locales";

interface DropdownProps<T> {
  label?: string;
  data: T[];
  value: any;
  onChange: (item: T) => void;
  labelField: keyof T | ((item: T) => string);
  valueField: keyof T;
  placeholder?: string;
  renderItem?: (item: T) => React.ReactNode;
  searchPlaceholder?: string;
  enableSearch?: boolean;
}

export function Dropdown<T>({
  label,
  data,
  value,
  onChange,
  labelField,
  valueField,
  placeholder,
  renderItem,
  searchPlaceholder,
  enableSearch = true,
}: DropdownProps<T>) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper to get label string
  const getLabel = (item: T) => {
    if (typeof labelField === "function") {
      return labelField(item);
    }
    return String(item[labelField]);
  };

  // Find selected item to display
  const selectedItem = data.find((item) => item[valueField] === value);
  const displayValue = selectedItem ? getLabel(selectedItem) : "";

  const renderOption: ListRenderItem<T> = ({ item }) => {
    const isSelected = item[valueField] === value;
    return (
      <TouchableOpacity
        style={[
          styles.item,
          {
            borderBottomColor: theme.colors.border + "50",
            backgroundColor: isSelected
              ? theme.colors.primary + "10"
              : "transparent",
          },
        ]}
        onPress={() => {
          onChange(item);
          setVisible(false);
        }}
      >
        <Text
          style={[
            styles.itemText,
            {
              color: isSelected ? theme.colors.primary : theme.colors.text,
              fontWeight: isSelected ? "bold" : "normal",
            },
          ]}
        >
          {renderItem ? renderItem(item) : getLabel(item)}
        </Text>
        {isSelected && (
          <MaterialCommunityIcons
            name="check"
            size={20}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          setVisible(true);
          setSearchQuery("");
        }}
      >
        <Input
          label={label}
          value={displayValue}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
          rightIcon="chevron-down"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {label || placeholder || "Select"}
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            {enableSearch && (
              <View style={styles.searchContainer}>
                <Input
                  placeholder={searchPlaceholder || _t("common.search")}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  rightIcon="magnify"
                />
              </View>
            )}
            <FlatList
              data={data.filter((item) =>
                getLabel(item)
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()),
              )}
              renderItem={renderOption}
              keyExtractor={(item) => String(item[valueField])}
              contentContainerStyle={styles.listContent}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
});
