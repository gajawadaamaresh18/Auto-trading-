/**
 * Centralized theme configuration for React Native trading components
 * Provides consistent colors, typography, spacing, and other design tokens
 */

export interface Theme {
  colors: {
    // Primary colors
    primary: string;
    primaryLight: string;
    primaryDark: string;
    
    // Secondary colors
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    
    // Status colors
    success: string;
    successLight: string;
    successDark: string;
    warning: string;
    warningLight: string;
    warningDark: string;
    error: string;
    errorLight: string;
    errorDark: string;
    info: string;
    infoLight: string;
    infoDark: string;
    
    // Neutral colors
    white: string;
    black: string;
    gray50: string;
    gray100: string;
    gray200: string;
    gray300: string;
    gray400: string;
    gray500: string;
    gray600: string;
    gray700: string;
    gray800: string;
    gray900: string;
    
    // Background colors
    background: string;
    backgroundSecondary: string;
    backgroundTertiary: string;
    surface: string;
    surfaceSecondary: string;
    
    // Text colors
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
    textInverse: string;
    
    // Border colors
    border: string;
    borderLight: string;
    borderDark: string;
    
    // Chart colors
    chartGreen: string;
    chartRed: string;
    chartBlue: string;
    chartYellow: string;
    chartPurple: string;
    chartOrange: string;
  };
  
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    lineHeight: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export const theme: Theme = {
  colors: {
    // Primary colors - Professional blue theme
    primary: '#2563EB',
    primaryLight: '#3B82F6',
    primaryDark: '#1D4ED8',
    
    // Secondary colors - Complementary purple
    secondary: '#7C3AED',
    secondaryLight: '#8B5CF6',
    secondaryDark: '#6D28D9',
    
    // Status colors
    success: '#10B981',
    successLight: '#34D399',
    successDark: '#059669',
    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningDark: '#D97706',
    error: '#EF4444',
    errorLight: '#F87171',
    errorDark: '#DC2626',
    info: '#06B6D4',
    infoLight: '#22D3EE',
    infoDark: '#0891B2',
    
    // Neutral colors
    white: '#FFFFFF',
    black: '#000000',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    surface: '#FFFFFF',
    surfaceSecondary: '#F9FAFB',
    
    // Text colors
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',
    
    // Chart colors
    chartGreen: '#10B981',
    chartRed: '#EF4444',
    chartBlue: '#2563EB',
    chartYellow: '#F59E0B',
    chartPurple: '#7C3AED',
    chartOrange: '#F97316',
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 28,
      xxl: 32,
      xxxl: 40,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export default theme;