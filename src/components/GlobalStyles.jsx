import { useTheme } from '../hooks/useTheme';

/**
 * GlobalStyles Component
 * Applies theme colors to the entire application via inline styles
 * This ensures all components respect the current theme
 */
function GlobalStyles() {
  const { colors, isDark } = useTheme();


  const styles = `
    * {
      color-scheme: ${isDark ? 'dark' : 'light'};
    }

    html, body {
      background-color: ${colors.background};
      color: ${colors.text};
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      margin: 0;
      padding: 0;
    }

    #root {
      background-color: ${colors.background};
      color: ${colors.text};
      min-height: 100vh;
    }

    /* Buttons */
    button {
      transition: all 0.2s ease;
    }

    button:hover {
      background-color: ${colors.backgroundTertiary};
    }

    /* Links */
    a {
      color: ${colors.primary};
      text-decoration: none;
    }

    a:hover {
      color: ${colors.primaryLight};
    }

    /* Inputs */
    input, textarea, select {
      background-color: ${colors.backgroundSecondary};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s ease;
    }

    input:focus, textarea:focus, select:focus {
      outline: none;
      border-color: ${colors.primary};
      box-shadow: 0 0 0 3px ${colors.primary}33;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: ${colors.backgroundSecondary};
    }

    ::-webkit-scrollbar-thumb {
      background: ${colors.border};
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: ${colors.textTertiary};
    }

    /* Selection */
    ::selection {
      background-color: ${colors.primary};
      color: ${colors.background};
    }

    /* Tables */
    table {
      border-collapse: collapse;
    }

    th {
      background-color: ${colors.backgroundSecondary};
      color: ${colors.text};
      border: 1px solid ${colors.border};
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    td {
      border: 1px solid ${colors.border};
      padding: 12px;
    }

    tbody tr:hover {
      background-color: ${colors.backgroundSecondary};
    }

    /* Cards/Containers */
    .card, [class*="card"], section, div[class*="container"] {
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    /* Code blocks */
    code, pre {
      background-color: ${colors.backgroundSecondary};
      color: ${colors.textSecondary};
      border-radius: 4px;
      padding: 2px 6px;
    }

    pre {
      padding: 12px;
      overflow-x: auto;
    }
  `;

  return (
    <style>
      {styles}
    </style>
  );
};


export default GlobalStyles;