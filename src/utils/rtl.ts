import { I18nManager } from "react-native";

/**
 * RTL Utilities
 * 
 * IMPORTANT: I18nManager.isRTL is the single source of truth for RTL state.
 * Do NOT infer RTL from language codes.
 * 
 * These utilities are provided for convenience but the underlying
 * source is always I18nManager.isRTL.
 */

/**
 * Check if current layout direction is RTL.
 * This is a function to ensure we always get the current value.
 */
export const getIsRTL = (): boolean => I18nManager.isRTL;

/**
 * Helper to get the correct flex direction for horizontal layouts.
 * Returns "row" in LTR, "row-reverse" in RTL.
 * 
 * NOTE: In most cases, you should just use flexDirection: "row" and
 * let the system handle RTL automatically. Only use this if you
 * specifically need to override native RTL behavior.
 */
export const getFlexDirection = (): "row" | "row-reverse" => 
  I18nManager.isRTL ? "row-reverse" : "row";
