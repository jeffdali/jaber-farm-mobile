import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../theme";
import { Text, Header, Skeleton } from "../../components/common";
import { _t } from "../../locales";
import { useAppSelector } from "../../redux/hooks";
import { financeService, StatsResponse } from "../../services/finance.service";
import { animalsService, Animal } from "../../services/animals.service";
import { formatCurrency, formatNumber } from "../../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type Period = "month" | "year";

interface StatSectionProps {
  title: string;
  currentValue: number;
  previousValue: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  isCurrency?: boolean;
  period: Period;
}

const StatGroup = ({
  title,
  data,
  icon,
  color,
  isCurrency = true,
  period,
}: {
  title: string;
  data: { curr: number; prev: number };
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  isCurrency?: boolean;
  period: Period;
  onPress?: () => void;
}) => {
  const { theme } = useTheme();
  const diff = data.curr - data.prev;
  const isIncrease = diff >= 0;

  return (
    <View style={[styles.groupCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.groupHeader}>
        <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <Text
          variant="h3"
          style={{ color: theme.colors.text, marginLeft: 10, flex: 1 }}
        >
          {title}
        </Text>
        <View
          style={[
            styles.trendBadge,
            {
              backgroundColor: isIncrease
                ? "rgba(76, 217, 100, 0.1)"
                : "rgba(255, 59, 48, 0.1)",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={isIncrease ? "arrow-up" : "arrow-down"}
            size={14}
            color={isIncrease ? "#4CD964" : "#FF3B30"}
          />
        </View>
      </View>

      <View style={styles.groupBody}>
        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              { color: theme.colors.text, opacity: 0.5 },
            ]}
          >
            {period === "month"
              ? _t("stats.current_month")
              : _t("stats.current_year")}
          </Text>
          <Text variant="h2" style={{ color: theme.colors.text }}>
            {isCurrency ? formatCurrency(data.curr) : formatNumber(data.curr)}
          </Text>
        </View>

        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.border, opacity: 0.1 },
          ]}
        />

        <View style={styles.statItem}>
          <Text
            style={[
              styles.statLabel,
              { color: theme.colors.text, opacity: 0.5 },
            ]}
          >
            {period === "month"
              ? _t("stats.previous_month")
              : _t("stats.previous_year")}
          </Text>
          <Text variant="h3" style={{ color: theme.colors.text, opacity: 0.8 }}>
            {isCurrency ? formatCurrency(data.prev) : formatNumber(data.prev)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const DashboardScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const user = useAppSelector((state) => state.auth.user);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([]);
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, animalsData] = await Promise.all([
        financeService.getStats(),
        animalsService.getAnimals({ ordering: "-created_at", limit: 5 } as any),
      ]);
      setStats(statsData);
      setRecentAnimals(animalsData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data on focusing
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const getPeriodData = (
    key: "sales" | "expenses" | "purchases" | "profits" | "sold" | "purchased",
  ) => {
    if (!stats) return { curr: 0, prev: 0 };

    let source: any;
    if (key === "sold") {
      source = stats.animals.sold;
    } else if (key === "purchased") {
      source = stats.animals.purchased;
    } else {
      source = stats[key];
    }

    if (period === "month") {
      return { curr: source.current_month, prev: source.previous_month };
    } else {
      return { curr: source.current_year, prev: source.previous_year };
    }
  };

  const activeTabBg = theme.dark ? "#2E7D32" : theme.colors.primary;
  const tabContainerBg = theme.dark ? "#252525" : theme.colors.card;
  const profitCardBg = theme.dark ? "#2E7D32" : theme.colors.primary;
  const profitOnBg = "#FFFFFF";

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header title={_t("farm.dashboard")} showMenu />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeSection}>
            <Text variant="h2" style={{ color: theme.colors.text }}>
              {_t("auth.login_title").split(" ")[0]},{" "}
              {user?.first_name || user?.username}!
            </Text>
          </View>

          <View
            style={[
              styles.miniTabContainer,
              { backgroundColor: tabContainerBg },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.miniTab,
                period === "month" && { backgroundColor: activeTabBg },
              ]}
              onPress={() => setPeriod("month")}
            >
              <Text
                style={[
                  styles.miniTabText,
                  { color: period === "month" ? "#FFF" : theme.colors.text },
                ]}
              >
                {_t("stats.current_month")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.miniTab,
                period === "year" && { backgroundColor: activeTabBg },
              ]}
              onPress={() => setPeriod("year")}
            >
              <Text
                style={[
                  styles.miniTabText,
                  { color: period === "year" ? "#FFF" : theme.colors.text },
                ]}
              >
                {_t("stats.current_year")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.sectionsContainer}>
            <Skeleton
              height={180}
              borderRadius={24}
              style={{ marginBottom: 20 }}
            />
            <Skeleton
              height={160}
              borderRadius={24}
              style={{ marginBottom: 20 }}
            />
            <Skeleton
              height={160}
              borderRadius={24}
              style={{ marginBottom: 20 }}
            />
            <Skeleton
              height={160}
              borderRadius={24}
              style={{ marginBottom: 20 }}
            />
          </View>
        ) : stats ? (
          <View style={styles.sectionsContainer}>
            {/* 1. PROFITS SECTION */}
            <View style={[styles.mainCard, { backgroundColor: profitCardBg }]}>
              <View style={styles.mainCardHeader}>
                <View style={styles.mainCardTitleRow}>
                  <MaterialCommunityIcons
                    name="finance"
                    size={24}
                    color={profitOnBg}
                  />
                  <Text style={[styles.mainCardLabel, { color: profitOnBg }]}>
                    {_t("stats.profits")}
                  </Text>
                </View>
                <View style={styles.mainCardBadge}>
                  <Text style={styles.badgeText}>
                    {period === "month"
                      ? _t("stats.current_month")
                      : _t("stats.current_year")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.mainCardValue, { color: profitOnBg }]}>
                {formatCurrency(getPeriodData("profits").curr)}
              </Text>
              <View style={styles.mainCardFooter}>
                <Text
                  style={[
                    styles.mainCardPrev,
                    { color: profitOnBg, opacity: 0.7 },
                  ]}
                >
                  {period === "month"
                    ? _t("stats.previous_month")
                    : _t("stats.previous_year")}
                  : {formatCurrency(getPeriodData("profits").prev)}
                </Text>
              </View>
            </View>

            {/* 2. SALES SECTION */}
            <StatGroup
              title={_t("stats.sales")}
              data={getPeriodData("sales")}
              icon="cart-arrow-up"
              color="#4CD964"
              period={period}
              onPress={() => navigation.navigate("Sales")}
            />

            {/* 2.5 PURCHASES SECTION */}
            <StatGroup
              title={_t("stats.purchases")}
              data={getPeriodData("purchases")}
              icon="basket-plus"
              color="#2196F3"
              period={period}
              onPress={() => navigation.navigate("Purchases")}
            />

            {/* 3. EXPENSES SECTION */}
            <StatGroup
              title={_t("stats.expenses")}
              data={getPeriodData("expenses")}
              icon="cart-arrow-down"
              color="#FF3B30"
              period={period}
              onPress={() => navigation.navigate("Expenses")}
            />

            {/* 4. ANIMALS SECTION (Summary) */}
            <View
              style={[
                styles.animalsSection,
                { backgroundColor: theme.colors.card },
              ]}
            >
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons
                  name="cow"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text
                  variant="h3"
                  style={{ color: theme.colors.text, marginLeft: 10 }}
                >
                  {_t("farm.animals")}
                </Text>
              </View>

              <View style={styles.animalsGrid}>
                <View style={styles.animalSummaryItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.text, opacity: 0.5 },
                    ]}
                  >
                    {_t("stats.animals_alive")}
                  </Text>
                  <Text variant="h2" style={{ color: theme.colors.text }}>
                    {formatNumber(stats.animals.total_alive)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.vDivider,
                    { backgroundColor: theme.colors.border, opacity: 0.1 },
                  ]}
                />
                <View style={styles.animalSummaryItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.text, opacity: 0.5 },
                    ]}
                  >
                    {_t("stats.animals_dead")}
                  </Text>
                  <Text variant="h2" style={{ color: "#FF3B30" }}>
                    {formatNumber(stats.animals.total_dead)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: theme.colors.border,
                    opacity: 0.1,
                    marginVertical: 15,
                  },
                ]}
              />

              <View style={styles.soldStats}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.text, opacity: 0.5, marginBottom: 5 },
                  ]}
                >
                  {_t("stats.sold_animals")} (
                  {period === "month"
                    ? _t("stats.current_month")
                    : _t("stats.current_year")}
                  )
                </Text>
                <View style={styles.soldRow}>
                  <Text variant="h2" style={{ color: theme.colors.primary }}>
                    {formatNumber(getPeriodData("sold").curr)}
                  </Text>
                  <View style={styles.soldComparison}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        opacity: 0.4,
                        fontSize: 12,
                      }}
                    >
                      {period === "month"
                        ? _t("stats.previous_month")
                        : _t("stats.previous_year")}
                      : {formatNumber(getPeriodData("sold").prev)}
                    </Text>
                  </View>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor: theme.colors.border,
                    opacity: 0.1,
                    marginVertical: 15,
                  },
                ]}
              />

              <View style={styles.soldStats}>
                <Text
                  style={[
                    styles.statLabel,
                    { color: theme.colors.text, opacity: 0.5, marginBottom: 5 },
                  ]}
                >
                  {_t("stats.purchased_animals")} (
                  {period === "month"
                    ? _t("stats.current_month")
                    : _t("stats.current_year")}
                  )
                </Text>
                <View style={styles.soldRow}>
                  <Text variant="h2" style={{ color: "#2196F3" }}>
                    {formatNumber(getPeriodData("purchased").curr)}
                  </Text>
                  <View style={styles.soldComparison}>
                    <Text
                      style={{
                        color: theme.colors.text,
                        opacity: 0.4,
                        fontSize: 12,
                      }}
                    >
                      {period === "month"
                        ? _t("stats.previous_month")
                        : _t("stats.previous_year")}
                      : {formatNumber(getPeriodData("purchased").prev)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 5. RECENT ANIMALS SECTION */}
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text variant="h3" style={{ color: theme.colors.text }}>
                  {_t("farm.last_added")}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("MyFarm")}>
                  <Text
                    style={{
                      color: theme.colors.primary,
                      fontWeight: "bold",
                    }}
                  >
                    {_t("farm.view_all")}
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recentScroll}
              >
                {recentAnimals.map((animal) => (
                  <TouchableOpacity
                    key={animal.id}
                    onPress={() =>
                      navigation.navigate("AnimalDetails", { animal })
                    }
                    style={[
                      styles.recentCard,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    <View
                      style={[
                        styles.recentIconBox,
                        {
                          backgroundColor:
                            animal.gender === "male"
                              ? "#2196F315"
                              : "#E91E6315",
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={
                          animal.gender === "male"
                            ? "gender-male"
                            : "gender-female"
                        }
                        size={20}
                        color={animal.gender === "male" ? "#2196F3" : "#E91E63"}
                      />
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[styles.recentName, { color: theme.colors.text }]}
                    >
                      {animal.name || `Animal ${animal.animal_number}`}
                    </Text>
                    <Text
                      style={[
                        styles.recentType,
                        { color: theme.colors.text, opacity: 0.5 },
                      ]}
                    >
                      #{animal.animal_number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 5,
    borderRadius: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  miniTabContainer: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 12,
  },
  miniTab: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  miniTabText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  sectionsContainer: {
    gap: 20,
  },
  mainCard: {
    padding: 25,
    borderRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mainCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  mainCardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mainCardLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  mainCardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  mainCardValue: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 10,
  },
  mainCardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    paddingTop: 10,
  },
  mainCardPrev: {
    fontSize: 14,
  },
  groupCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  trendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  groupBody: {
    gap: 15,
  },
  statItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    width: "100%",
  },
  animalsSection: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  animalsGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  animalSummaryItem: {
    flex: 1,
    gap: 5,
  },
  vDivider: {
    width: 1,
    height: 40,
    marginHorizontal: 15,
  },
  soldStats: {
    marginTop: 5,
  },
  soldRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 10,
  },
  soldComparison: {
    flex: 1,
    alignItems: "flex-end",
  },
  recentSection: {
    marginTop: 10,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  recentScroll: {
    gap: 12,
    paddingRight: 20,
  },
  recentCard: {
    width: 130,
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  recentName: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  recentType: {
    fontSize: 11,
    fontWeight: "600",
  },
});

export default DashboardScreen;
