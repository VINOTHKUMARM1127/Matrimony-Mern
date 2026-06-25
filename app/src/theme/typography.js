/**
 * Wedring Matrimony — Typography System
 * Premium sans-serif with elegant hierarchy for matrimonial context
 */
import { Platform } from 'react-native';

export const fontFamilies = {
  heading: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
  }),
  body: Platform.select({
    ios: 'System',
    android: 'sans-serif',
  }),
  bodyLight: Platform.select({
    ios: 'System',
    android: 'sans-serif-light',
  }),
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
  }),
};

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 40,
};

export const lineHeights = {
  tight: 1.2,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.75,
};

export const fontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const letterSpacing = {
  tight: -0.3,
  normal: 0,
  wide: 0.3,
  wider: 0.5,
  widest: 1,
};

const typography = {
  // Display — Hero sections, splash
  displayLarge: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },
  displayMedium: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacing.tight,
  },

  // Headings
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.tight,
  },
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
  },
  h3: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.xl * lineHeights.snug,
  },
  h4: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },

  // Premium UI-specific presets
  screenTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
    letterSpacing: letterSpacing.tight,
  },
  sectionTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    lineHeight: 15 * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
  cardName: {
    fontFamily: fontFamilies.heading,
    fontSize: 17,
    fontWeight: fontWeights.bold,
    lineHeight: 17 * lineHeights.snug,
  },
  cardDetail: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: fontWeights.medium,
    lineHeight: 13 * lineHeights.normal,
  },
  cardSubtext: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: fontWeights.normal,
    lineHeight: 12 * lineHeights.normal,
  },

  // Body
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.lg * lineHeights.normal,
  },
  bodyMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.md * lineHeights.normal,
  },

  // Labels
  labelLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
  },
  labelMedium: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.normal,
  },
  labelSmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },

  // Caption
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.sm * lineHeights.normal,
  },
  captionSmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: fontSizes.xs * lineHeights.normal,
  },

  // Button text
  button: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacing.wider,
  },
  buttonSmall: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacing.wider,
  },

  // Tab bar
  tabLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: fontWeights.semibold,
    lineHeight: 11 * lineHeights.normal,
    letterSpacing: letterSpacing.wide,
  },
};

export default typography;
