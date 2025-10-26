export const colors = {
  // Primary glass theme colors
  primary: '#007AFF',
  primaryLight: '#4DA6FF',
  primaryDark: '#0056CC',
  
  // Background colors
  background: 'rgba(242, 242, 247, 0.95)',
  backgroundSecondary: 'rgba(255, 255, 255, 0.8)',
  backgroundTertiary: 'rgba(0, 0, 0, 0.05)',
  
  // Glass effect colors
  glass: 'rgba(255, 255, 255, 0.25)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassShadow: 'rgba(0, 0, 0, 0.1)',
  
  // Text colors
  text: '#1D1D1F',
  textSecondary: '#6E6E73',
  textTertiary: '#8E8E93',
  textInverse: '#FFFFFF',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Block type colors
  indicator: '#007AFF',
  condition: '#FF9500',
  action: '#34C759',
  parameter: '#8E8E93',
  
  // Drag and drop states
  dragOver: 'rgba(0, 122, 255, 0.1)',
  dragActive: 'rgba(0, 122, 255, 0.2)',
  dropZone: 'rgba(52, 199, 89, 0.1)',
  
  // Borders and separators
  border: 'rgba(0, 0, 0, 0.1)',
  separator: 'rgba(0, 0, 0, 0.05)',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowHeavy: 'rgba(0, 0, 0, 0.2)',
} as const;

export type ColorKey = keyof typeof colors;