/**
 * Wedring Matrimony — Spacing & Layout System
 * 4px base unit grid with premium screen-level constants
 */

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
};

export const borderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

export const layout = {
  // Screen-level
  screenPaddingHorizontal: 20,
  screenPaddingVertical: spacing.base,

  // Cards
  cardPadding: spacing.base,
  cardGap: 16,
  cardBorderRadius: borderRadius.xl,

  // Sections
  sectionSpacing: spacing.xl,
  sectionHeaderMargin: 24,

  // Input / Buttons
  inputHeight: 52,
  buttonHeight: 52,
  buttonHeightSmall: 40,

  // Navigation
  tabBarHeight: 72,
  headerHeight: 56,

  // Avatars
  avatarSmall: 36,
  avatarMedium: 48,
  avatarLarge: 72,
  avatarXLarge: 120,

  // Images
  cardImageHeight: 220,
  profilePhotoSize: 300,
  thumbnailSize: 80,

  // Icons
  iconSize: 24,
  iconSizeSmall: 20,
  iconSizeLarge: 32,

  // Feed-specific
  feedCardWidth: 140,
  feedCardImageHeight: 180,
  horizontalListGap: 14,
};

export default spacing;
