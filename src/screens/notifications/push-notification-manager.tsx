import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerForPushNotifications } from '@/shared/lib/notifications';

import { savePushToken } from './api';

const REGISTRATION_KEY_PREFIX = 'langex:push-token-registered';

function openNotificationConversation(notification: Notifications.Notification) {
  try {
    const conversationId = notification.request.content.data?.conversationId;
    if (typeof conversationId !== 'string' || !conversationId) return;

    router.push({ pathname: '/chat/[id]', params: { id: conversationId } });
  } catch (error) {
    console.warn('[notifications] Could not open the notification conversation.', error);
  }
}

export function PushNotificationManager({ userId }: { userId: string }) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;

    const register = async () => {
      const registrationKey = `${REGISTRATION_KEY_PREFIX}:${userId}`;

      try {
        const hasRegistered = await AsyncStorage.getItem(registrationKey);
        if (cancelled || hasRegistered === 'true') return;

        const token = await registerForPushNotifications();
        if (cancelled || !token) return;

        try {
          await savePushToken(token);
          if (!cancelled) await AsyncStorage.setItem(registrationKey, 'true');
        } catch (error) {
          console.warn('[notifications] Could not save the push token.', error);
        }
      } catch (error) {
        console.warn('[notifications] Could not check push registration state.', error);
      }
    };

    void register();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    try {
      const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        try {
          console.info('[notifications] Foreground notification received.', notification);
        } catch (error) {
          console.warn('[notifications] Could not process a foreground notification.', error);
        }
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => openNotificationConversation(response.notification),
      );

      const lastResponse = Notifications.getLastNotificationResponse();
      if (lastResponse?.notification) {
        openNotificationConversation(lastResponse.notification);
        void Notifications.clearLastNotificationResponseAsync().catch((error) => {
          console.warn('[notifications] Could not clear the last notification response.', error);
        });
      }

      return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.warn('[notifications] Could not attach notification listeners.', error);
    }
  }, []);

  return null;
}
