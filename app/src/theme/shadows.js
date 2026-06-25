/**
 * Wedring Matrimony — Shadow / Elevation System
 * Ultra-refined shadows for white-on-white layering
 */
import { Platform } from 'react-native';

const createShadow = (elevation, color = '#000') => {
  if (Platform.OS === 'android') {
    return { elevation };
  }

  const shadowMap = {
    0: { shadowOffset: { width: 0, height: 0 }, shadowRadius: 0, shadowOpacity: 0 },
    1: { shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, shadowOpacity: 0.03 },
    2: { shadowOffset: { width: 0, height: 2 }, shadowRadius: 8, shadowOpacity: 0.04 },
    3: { shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, shadowOpacity: 0.06 },
    4: { shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, shadowOpacity: 0.08 },
    5: { shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, shadowOpacity: 0.10 },
    6: { shadowOffset: { width: 0, height: 12 }, shadowRadius: 32, shadowOpacity: 0.12 },
  };

  const level = Math.min(elevation, 6);
  return {
    shadowColor: color,
    ...shadowMap[level],
  };
};

const shadows = {
  none: createShadow(0),
  xs: createShadow(1),
  sm: createShadow(2),
  md: createShadow(3),
  lg: createShadow(4),
  xl: createShadow(5),
  '2xl': createShadow(6),

  // Premium use cases — refined for white aesthetic
  card: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 8,
        shadowOpacity: 0.04,
      },
      android: { elevation: 2 },
    }),
  },
  cardSoft: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 6,
        shadowOpacity: 0.03,
      },
      android: { elevation: 1 },
    }),
  },
  cardFloat: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 20,
        shadowOpacity: 0.07,
      },
      android: { elevation: 4 },
    }),
  },
  cardHover: createShadow(4),
  bottomTab: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.04,
      },
      android: { elevation: 8 },
    }),
  },
  bottomNav: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowRadius: 12,
        shadowOpacity: 0.04,
      },
      android: { elevation: 8 },
    }),
  },
  modal: createShadow(6),
  button: createShadow(2),
  buttonFloat: createShadow(4),
  header: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        shadowOpacity: 0.03,
      },
      android: { elevation: 2 },
    }),
  },
  fab: createShadow(5),
};

export default shadows;
