import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import en from './en.json';
import ar from './ar.json';

const translations = { en, ar };
const i18n = new I18n(translations);

// Set initial locale from device, will be overridden by stored preference in LanguageProvider
i18n.locale = getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Translation helper
export const _t = (key: string, options?: object) => i18n.t(key, options);

export * from './LanguageContext';
export default i18n;
