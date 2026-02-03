import { I18nManager } from "react-native";

export const formatCurrency = (amount: number): string => {
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return I18nManager.isRTL ? `${formatted} ل.س` : `${formatted} SYP`;
};

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
