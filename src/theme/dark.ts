import { colors } from './colors';
import { AppTheme } from './light';

export const darkTheme: AppTheme = {
  dark: true,
  colors: {
    primary: colors.greenPrimary,
    background: '#121212',
    card: '#1E1E1E',
    text: colors.white,
    border: colors.darkGrey,
    notification: colors.blueAccent,
    
    // Custom colors
    surface: '#2C2C2C',
    error: colors.danger,
    onPrimary: colors.white,
    onBackground: colors.white,
    onSurface: '#E0E0E0',
    
    accent: colors.yellowAccent,
    brown: colors.brownLight,
    secondary: colors.brownLight,
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
