import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { getTheme } from '../config/theme';

/**
 * Custom hook to use theme throughout the application
 * Returns both the theme context and the computed theme colors
 * 
 * @returns {Object} Object containing:
 *   - isDark: boolean indicating dark mode status
 *   - toggleTheme: function to toggle between light and dark modes
 *   - colors: theme color object (light or dark)
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const { isDark, toggleTheme } = context;
  const colors = getTheme(isDark);

  return {
    isDark,
    toggleTheme,
    colors,
  };
};
