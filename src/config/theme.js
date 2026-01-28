/**
 * Theme Configuration
 * Defines color palettes for light and dark modes
 */

export const lightTheme = {
  // Primary Colors
  primary: '#2563eb',           // Blue
  primaryLight: '#3b82f6',
  primaryDark: '#1e40af',

  // Secondary Colors
  secondary: '#7c3aed',         // Purple
  secondaryLight: '#a78bfa',
  secondaryDark: '#5b21b6',

  // Backgrounds
  background: '#ffffff',
  backgroundSecondary: '#f3f4f6',
  backgroundTertiary: '#e5e7eb',

  // Text
  text: '#000000',
  textSecondary: '#4b5563',
  textTertiary: '#9ca3af',

  // Borders
  border: '#d1d5db',
  borderLight: '#e5e7eb',

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

  // Semantic Colors
  danger: '#dc2626',
  disabled: '#d1d5db',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowLarge: 'rgba(0, 0, 0, 0.2)',

  // Special
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme = {
  // Primary Colors
  primary: '#3b82f6',           // Lighter blue for dark mode
  primaryLight: '#60a5fa',
  primaryDark: '#1e40af',

  // Secondary Colors
  secondary: '#a78bfa',         // Lighter purple for dark mode
  secondaryLight: '#c4b5fd',
  secondaryDark: '#6d28d9',

  // Backgrounds
  background: '#0f172a',        // Very dark blue
  backgroundSecondary: '#1e293b', // Dark slate
  backgroundTertiary: '#334155',  // Medium slate

  // Text
  text: '#f1f5f9',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',

  // Borders
  border: '#475569',
  borderLight: '#334155',

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

  // Semantic Colors
  danger: '#dc2626',
  disabled: '#64748b',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowLarge: 'rgba(0, 0, 0, 0.5)',

  // Special
  overlay: 'rgba(0, 0, 0, 0.7)',
};

/**
 * Get theme based on isDark flag
 * @param {boolean} isDark - Whether dark mode is enabled
 * @returns {Object} Theme object
 */
export const getTheme = (isDark) => {
  return isDark ? darkTheme : lightTheme;
};
