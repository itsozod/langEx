import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (Platform.OS !== 'android' || !Device.isDevice) return null;

    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      lightColor: '#534AB7',
      vibrationPattern: [0, 250, 250, 250],
    });

    const existingPermission = await Notifications.getPermissionsAsync();
    const permission =
      existingPermission.status === 'granted'
        ? existingPermission
        : await Notifications.requestPermissionsAsync();

    if (permission.status !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (typeof projectId !== 'string' || !projectId) {
      console.warn('[notifications] EAS project ID is missing.');
      return null;
    }

    const response = await Notifications.getExpoPushTokenAsync({ projectId });
    return response.data || null;
  } catch (error) {
    console.warn('[notifications] Push registration failed.', error);
    return null;
  }
}
