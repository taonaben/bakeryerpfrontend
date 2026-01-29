/**
 * THEME SYSTEM USAGE GUIDE
 * 
 * This document explains how to use the theme system in your Bakery ERP frontend.
 * The theme system provides dark/light mode support across all components.
 */

/**
 * BASIC USAGE EXAMPLE
 * ==================
 * 
 * To use the theme in any component, import and use the useTheme hook:
 */

import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ExampleComponent = () => {
  // Get theme colors and toggle function
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <div style={{
      backgroundColor: colors.background,
      color: colors.text,
      padding: '20px',
      borderRadius: '8px',
      border: `1px solid ${colors.border}`,
    }}>
      <h1>Current mode: {isDark ? 'Dark' : 'Light'}</h1>
      
      <button
        onClick={toggleTheme}
        style={{
          backgroundColor: colors.primary,
          color: colors.background,
          padding: '10px 20px',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Toggle Theme
      </button>
    </div>
  );
};

/**
 * AVAILABLE THEME COLORS
 * =====================
 * 
 * The colors object includes:
 * 
 * PRIMARY COLORS:
 *   colors.primary - Main color
 *   colors.primaryLight - Lighter variant
 *   colors.primaryDark - Darker variant
 * 
 * SECONDARY COLORS:
 *   colors.secondary - Secondary color
 *   colors.secondaryLight - Lighter variant
 *   colors.secondaryDark - Darker variant
 * 
 * BACKGROUNDS:
 *   colors.background - Main background
 *   colors.backgroundSecondary - Secondary background
 *   colors.backgroundTertiary - Tertiary background
 * 
 * TEXT COLORS:
 *   colors.text - Primary text
 *   colors.textSecondary - Secondary text
 *   colors.textTertiary - Tertiary text
 * 
 * BORDERS:
 *   colors.border - Standard border
 *   colors.borderLight - Light border
 * 
 * STATUS COLORS:
 *   colors.success - Success state
 *   colors.warning - Warning state
 *   colors.error - Error state
 *   colors.info - Info state
 *   colors.danger - Danger state
 * 
 * OTHER:
 *   colors.shadow - Shadow effect
 *   colors.shadowMedium - Medium shadow
 *   colors.shadowLarge - Large shadow
 *   colors.disabled - Disabled state
 *   colors.overlay - Overlay color
 */

/**
 * COMPONENT WITH STYLED ELEMENTS
 * =============================
 */

export const StyledButtonExample = () => {
  const { colors } = useTheme();

  const buttonStyle = {
    backgroundColor: colors.primary,
    color: colors.background,
    border: `2px solid ${colors.primaryLight}`,
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontSize: '16px',
  };

  return (
    <button
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = colors.primaryDark;
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = colors.primary;
      }}
    >
      Click Me
    </button>
  );
};

/**
 * USING THEME IN CSS MODULES
 * ==========================
 * 
 * While inline styles are simpler, you can also use theme colors in CSS:
 */

// Example CSS Module with theme-aware styles:
/*
.card {
  background-color: var(--bg-secondary, #f3f4f6);
  color: var(--text, #000000);
  border: 1px solid var(--border, #d1d5db);
  padding: 16px;
  border-radius: 8px;
}

.card:hover {
  background-color: var(--bg-tertiary, #e5e7eb);
  box-shadow: 0 4px 6px var(--shadow, rgba(0, 0, 0, 0.1));
}
*/

/**
 * USING THEME TOGGLE COMPONENT
 * ============================
 * 
 * Place the ThemeToggle component in your header/navbar:
 */

import { ThemeToggle } from '../components/ThemeToggle';

export const HeaderExample = () => {
  const { colors } = useTheme();

  return (
    <header style={{
      backgroundColor: colors.backgroundSecondary,
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <h1 style={{ color: colors.primary }}>Bakery ERP</h1>
      <ThemeToggle size={24} showLabel={true} />
    </header>
  );
};

/**
 * INTEGRATING WITH EXISTING COMPONENTS
 * =====================================
 * 
 * To update your existing components:
 * 
 * 1. Add the import at the top:
 *    import { useTheme } from '../hooks/useTheme';
 * 
 * 2. Call the hook inside the component:
 *    const { colors } = useTheme();
 * 
 * 3. Replace hardcoded colors with theme colors:
 *    Before: backgroundColor: '#ffffff'
 *    After: backgroundColor: colors.background
 * 
 * 4. Wrap text colors similarly:
 *    Before: color: '#000000'
 *    After: color: colors.text
 */

/**
 * RESPONSIVE THEME SWITCHING
 * ==========================
 * 
 * The theme system respects system preferences on first load.
 * Users can toggle the theme manually using ThemeToggle component.
 * The preference is saved to localStorage and persists across sessions.
 */

export default ExampleComponent;
