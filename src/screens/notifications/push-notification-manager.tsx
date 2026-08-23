import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { registerForPushNotifications } from '@/shared/lib/notifications';
import { API_URL } from '@/shared/lib/api-client';

import { savePushToken } from './api';

const REGISTRATION_KEY_PREFIX = 'langex:push-token-registration:v2';

function getRegistrationKey(userId: string) {
  return `${REGISTRATION_KEY_PREFIX}:${encodeURIComponent(API_URL)}:${userId}`;
}

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

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    return () => Notifications.setNotificationHandler(null);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    let cancelled = false;
    let syncInFlight = false;

    const syncPushToken = async () => {
      if (syncInFlight) return;
      syncInFlight = true;
      const registrationKey = getRegistrationKey(userId);

      try {
        const token = await registerForPushNotifications();
        if (cancelled || !token) return;

        const registeredToken = await AsyncStorage.getItem(registrationKey);
        if (cancelled || registeredToken === token) return;

        try {
          await savePushToken(token);
          if (!cancelled) await AsyncStorage.setItem(registrationKey, token);
        } catch (error) {
          console.warn('[notifications] Could not save the push token.', error);
        }
      } catch (error) {
        console.warn('[notifications] Could not check push registration state.', error);
      } finally {
        syncInFlight = false;
      }
    };

    void syncPushToken();
    const tokenSubscription = Notifications.addPushTokenListener(() => {
      void syncPushToken();
    });

    return () => {
      cancelled = true;
      tokenSubscription.remove();
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
