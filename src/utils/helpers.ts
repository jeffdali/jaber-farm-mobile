import { I18nManager } from "react-native";

export const formatCurrency = (amount: number): string => {
  const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return I18nManager.isRTL ? `${formatted} ل.س` : `${formatted} SYP`;
};

export const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.data) {
    const data = error.response.data;
    
    // Check for non_field_errors (standard DRF)
    if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
      return data.non_field_errors[0];
    }
    
    // Check for detail (standard DRF)
    if (data.detail) {
      return data.detail;
    }
    
    // Check for field-specific errors
    if (typeof data === 'object' && !Array.isArray(data)) {
      const keys = Object.keys(data);
      if (keys.length > 0) {
        const firstKey = keys[0];
        const firstError = data[firstKey];
        if (Array.isArray(firstError)) {
          return firstError[0];
        }
        if (typeof firstError === 'string') {
          return firstError;
        }
      }
    }
    
    // If it's just a string (rare but possible)
    if (typeof data === 'string') {
      return data;
    }
  }
  
  return defaultMessage;
};
