import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/**
 * ThemeToggle Component
 * A button to switch between light and dark modes
 * Uses lucide-react icons for Sun and Moon
 */
export const ThemeToggle = ({ 
  size = 24, 
  showLabel = false,
  className = '',
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s ease',
      }}
    >
      {isDark ? (
        <Sun size={size} strokeWidth={2} />
      ) : (
        <Moon size={size} strokeWidth={2} />
      )}
      {showLabel && (
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
