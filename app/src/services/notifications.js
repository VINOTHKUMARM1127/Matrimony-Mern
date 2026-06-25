/**
 * Wedring Matrimony — Push Notification Service
 * Using Expo Notifications (FCM backend for Android)
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { updateProfile } from '../api/profiles';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get token
 */
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  // Get push token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Configure Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Failed to get push token:', error);
    return null;
  }
};

/**
 * Save push token to user profile
 */
export const savePushToken = async (userId, token) => {
  if (!token) return;

  try {
    await updateProfile(userId, { push_token: token });
  } catch (error) {
    console.warn('Failed to save push token:', error);
  }
};

/**
 * Add notification response listener (for deep linking)
 */
export const addNotificationResponseListener = (handler) => {
  return Notifications.addNotificationResponseReceivedListener(handler);
};

/**
 * Add foreground notification listener
 */
export const addNotificationReceivedListener = (handler) => {
  return Notifications.addNotificationReceivedListener(handler);
};

/**
 * Schedule a local notification
 */
export const scheduleLocalNotification = async (title, body, data = {}, seconds = 0) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: seconds > 0 ? { seconds } : null,
  });
};

/**
 * Get badge count
 */
export const getBadgeCount = async () => {
  return await Notifications.getBadgeCountAsync();
};

/**
 * Set badge count
 */
export const setBadgeCount = async (count) => {
  await Notifications.setBadgeCountAsync(count);
};

export default {
  registerForPushNotifications,
  savePushToken,
  addNotificationResponseListener,
  addNotificationReceivedListener,
  scheduleLocalNotification,
  getBadgeCount,
  setBadgeCount,
};
