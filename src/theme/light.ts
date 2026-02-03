import { colors } from './colors';

export const lightTheme = {
  dark: false,
  colors: {
    primary: colors.greenPrimary,
    background: colors.white,
    card: colors.white,
    text: colors.black,
    border: colors.lightGrey,
    notification: colors.blueAccent,
    
    // Custom colors
    surface: colors.lightGrey,
    error: colors.danger,
    onPrimary: colors.white,
    onBackground: colors.black,
    onSurface: colors.darkGrey,
    
    accent: colors.yellowAccent,
    brown: colors.brownPrimary,
    secondary: colors.brownPrimary,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold' },
    h2: { fontSize: 24, fontWeight: 'bold' },
    h3: { fontSize: 20, fontWeight: 'bold' },
    body: { fontSize: 16, fontWeight: 'normal' },
    caption: { fontSize: 12, fontWeight: 'normal' },
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  }
};

export type AppTheme = typeof lightTheme;
