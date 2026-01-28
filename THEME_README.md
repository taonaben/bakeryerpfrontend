# Dark & Light Mode Theme System - Quick Reference

## 🎨 What's Been Set Up

Your Bakery ERP now has a complete dark/light mode theme system with:
- **ThemeProvider** - Manages theme state globally
- **useTheme hook** - Access theme in any component
- **ThemeToggle component** - UI button to switch themes
- **GlobalStyles** - Auto-applies theme to HTML/CSS
- **Persistent storage** - Theme preference saved to localStorage
- **System detection** - Respects user's OS theme preference on first load

## 📁 New Files Created

```
src/
├── contexts/
│   └── ThemeContext.jsx          # Theme state management
├── config/
│   └── theme.js                  # Light & dark color definitions
├── hooks/
│   └── useTheme.js               # Hook to access theme in components
└── components/
    ├── ThemeToggle.jsx           # Button to toggle theme
    ├── GlobalStyles.jsx          # Global style application
    └── DashboardHeader.example.jsx # Example integration
```

## 🚀 How to Use

### 1. In Any Component - Get Theme Colors
```jsx
import { useTheme } from '../hooks/useTheme';

export const MyComponent = () => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <div style={{ backgroundColor: colors.background, color: colors.text }}>
      {/* Your content */}
    </div>
  );
};
```

### 2. Available Colors
```javascript
colors.primary              // Main brand color
colors.background           // Page background
colors.text                 // Main text color
colors.border              // Border color
colors.success, .warning, .error, .info  // Status colors
colors.shadow              // Shadow effects
// ... and many more!
```

### 3. Add Theme Toggle to Your App
```jsx
import { ThemeToggle } from '../components/ThemeToggle';

<ThemeToggle size={24} showLabel={true} />
```

## 🎯 Quick Implementation Steps

### Step 1: Update LoginPage (Optional)
```jsx
import { useTheme } from '../hooks/useTheme';

const LoginPage = ({ onLogin }) => {
  const { colors } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      {/* Replace hardcoded colors with colors.* */}
    </div>
  );
};
```

### Step 2: Update Dashboard
```jsx
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';

const Dashboard = ({ ... }) => {
  const { colors } = useTheme();
  
  return (
    <div style={{ backgroundColor: colors.background }}>
      <header>
        <ThemeToggle />
        {/* Rest of header */}
      </header>
    </div>
  );
};
```

### Step 3: Update Other Components
Repeat the same pattern for any component that needs theming:
- InventoryPage
- Any card/button components
- Forms and inputs
- Tables

## 🎨 Color Palette Overview

### Light Mode
- **Background**: White (#ffffff)
- **Text**: Black (#000000)
- **Primary**: Blue (#2563eb)
- **Secondary**: Purple (#7c3aed)

### Dark Mode
- **Background**: Very dark blue (#0f172a)
- **Text**: Light gray (#f1f5f9)
- **Primary**: Brighter blue (#3b82f6)
- **Secondary**: Brighter purple (#a78bfa)

## ✨ Features

✅ **Automatic System Preference Detection** - Uses OS theme on first load
✅ **Persistent Storage** - Saves user preference to localStorage
✅ **Smooth Transitions** - CSS transitions for color changes
✅ **Complete Coverage** - Works with buttons, inputs, scrollbars, etc.
✅ **Easy Integration** - Simple hook-based API
✅ **No External Dependencies** - Uses only React context

## 📝 CSS Variable Support (Optional)

If you prefer using CSS variables in your stylesheets:
```css
:root[data-theme="light"] {
  --bg: #ffffff;
  --text: #000000;
  --primary: #2563eb;
}

:root[data-theme="dark"] {
  --bg: #0f172a;
  --text: #f1f5f9;
  --primary: #3b82f6;
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

The `data-theme` attribute is automatically set on `document.documentElement` by ThemeContext.

## 🔗 Documentation Files

- `THEME_USAGE_GUIDE.md` - Detailed usage examples
- `src/components/DashboardHeader.example.jsx` - Full example component

## ⚡ Performance Tips

1. **Memoize theme usage** when passing to multiple children
2. **Use theme colors directly** instead of remapping them
3. **Avoid recreating theme objects** - useTheme returns the same reference

## 🐛 Troubleshooting

**Q: Theme toggle doesn't work?**
- Ensure ThemeProvider wraps your entire app in App.jsx ✓ (Already done)

**Q: Colors not updating in a component?**
- Check that the component uses the `useTheme` hook
- Ensure component is inside ThemeProvider wrapper

**Q: Colors not persisting?**
- localStorage should auto-save (browser storage enabled?)
- Check browser console for errors

---

**That's it!** Your theme system is ready. Start integrating it into your components by replacing hardcoded colors with `colors.*` from the `useTheme()` hook.
