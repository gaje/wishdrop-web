/**
 * Design System Constants
 * Mirrors mobile app design for consistency across platforms
 */

// Color Palette
export const COLORS = {
  // Primary (Cyan/Teal)
  primary: '#18d4d2', // cyan-500 - main brand color
  primaryLight: '#14b8a6', // teal-500
  primaryDark: '#0891b2', // cyan-600
  primaryVeryLight: '#ecfeff', // cyan-50

  // Backgrounds
  bgLight: '#ecfeff', // cyan-50 - for clean screens
  bgWhite: '#ffffff',

  // Text
  textPrimary: '#111827', // gray-900
  textSecondary: '#4b5563', // gray-600
  textTertiary: '#9ca3af', // gray-400
  textLight: '#ffffff',

  // Status
  success: '#10b981', // green-500
  error: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
  info: '#3b82f6', // blue-500

  // Borders
  border: '#e5e7eb', // gray-200
  borderDark: '#d1d5db', // gray-300

  // Gradients (CSS format for web)
  gradientHero: 'linear-gradient(135deg, #5CC6FF 0%, #7B88FF 50%, #C9B6FF 100%)',
  gradientSecondary: 'linear-gradient(135deg, #18d4d2 0%, #14b8a6 50%, #0891b2 100%)',
  gradientButton: 'linear-gradient(135deg, #18d4d2 0%, #0891b2 100%)',
  gradientBgSubtle: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 50%, #eff6ff 100%)',
}

// Typography (rem-based for web)
export const TYPOGRAPHY = {
  sizes: {
    hero: '2rem', // 32px
    h1: '1.75rem', // 28px
    h2: '1.5rem', // 24px
    h3: '1.25rem', // 20px
    body: '1rem', // 16px
    small: '0.875rem', // 14px
    tiny: '0.75rem', // 12px
  },
  weights: {
    bold: 700,
    semibold: 600,
    medium: 500,
    regular: 400,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// Spacing (8px base, rem for web)
export const SPACING = {
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
}

// Border Radius
export const RADIUS = {
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
}

// Box Shadows (CSS format)
export const SHADOWS = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
  md: '0 4px 12px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.12)',
  colored: '0 8px 20px rgba(24, 212, 210, 0.3)', // primary color shadow
}

// Transitions
export const TRANSITIONS = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
  spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

// Z-Index layers
export const Z_INDEX = {
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  tooltip: 500,
}

// Tailwind class helpers (commonly used combinations)
export const TW = {
  // Cards
  card: 'bg-white rounded-2xl shadow-md p-4',
  cardHover: 'bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow',

  // Buttons
  btnPrimary: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold py-3 px-6 rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all',
  btnSecondary: 'bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition-colors',
  btnGhost: 'text-cyan-500 font-semibold py-3 px-6 rounded-full hover:bg-cyan-50 transition-colors',

  // Inputs
  input: 'w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all',
  inputError: 'w-full px-4 py-3 rounded-xl border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none',

  // Text
  textHeading: 'text-gray-900 font-bold',
  textBody: 'text-gray-600',
  textMuted: 'text-gray-400',

  // Layout
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  section: 'py-12 md:py-16 lg:py-20',
}

// Animation keyframes (for CSS-in-JS or style tags)
export const KEYFRAMES = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  slideUp: `
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `,
}

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  TRANSITIONS,
  Z_INDEX,
  TW,
  KEYFRAMES,
}
