export const theme = {
  colors: {
    background: '#f9fafb',
    surface: '#ffffff',
    primary: '#6366f1',
    text: '#111827',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    indigo: '#6366f1',
    amber: '#f59e0b',
    emerald: '#10b981',
    blue: '#3b82f6',
    pink: '#ec4899',
    violet: '#8b5cf6',
    cyan: '#06b6d4',
    orange: '#f97316',
    slate: '#64748b',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
    },
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
};

export type Theme = typeof theme;
