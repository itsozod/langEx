import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { registerForPushNotifications } from '@/shared/lib/notifications';
import { API_URL } from '@/shared/lib/api-client';

import { savePushToken } from './api';

const REGISTRATION_KEY_PREFIX = 'langex:push-token-registration:v2';

function getRegistrationKey(userId: string) {
  return `${REGISTRATION_KEY_PREFIX}:${encodeURIComponent(API_URL)}:${userId}`;
}

export type NotificationConversationTarget = {
  conversationId: string;
  notificationId: string;
};

function getNotificationConversationTarget(
  notification: Notifications.Notification,
): NotificationConversationTarget | null {
  try {
    const conversationId = notification.request.content.data?.conversationId;
    if (typeof conversationId !== 'string' || !conversationId) return null;

    return {
      conversationId,
      notificationId: notification.request.identifier,
    };
  } catch (error) {
    console.warn('[notifications] Could not open the notification conversation.', error);
    return null;
  }
}

type PushNotificationManagerProps = {
  onOpenConversation: (target: NotificationConversationTarget) => void;
  userId?: string;
};

if (Platform.OS === 'android') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function PushNotificationManager({
  onOpenConversation,
  userId,
}: PushNotificationManagerProps) {
  const handledResponseIdsRef = useRef(new Set<string>());

  useEffect(() => {
    if (Platform.OS !== 'android' || !userId) return;

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

    let cancelled = false;

    const openNotificationConversation = (notification: Notifications.Notification) => {
      const notificationId = notification.request.identifier;
      if (handledResponseIdsRef.current.has(notificationId)) return;

      const target = getNotificationConversationTarget(notification);
      if (target) {
        handledResponseIdsRef.current.add(notificationId);
        onOpenConversation(target);
      }
    };

    try {
      const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
        try {
          console.info('[notifications] Foreground notification received.', notification);
        } catch (error) {
          console.warn('[notifications] Could not process a foreground notification.', error);
        }
      });

      const responseSubscription = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          openNotificationConversation(response.notification);
          void Notifications.clearLastNotificationResponseAsync().catch((error) => {
            console.warn('[notifications] Could not clear the notification response.', error);
          });
        },
      );

      void Notifications.getLastNotificationResponseAsync().then((lastResponse) => {
        if (cancelled || !lastResponse?.notification) return;

        openNotificationConversation(lastResponse.notification);
        return Notifications.clearLastNotificationResponseAsync().catch((error) => {
          console.warn('[notifications] Could not clear the last notification response.', error);
        });
      });

      return () => {
        cancelled = true;
        receivedSubscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.warn('[notifications] Could not attach notification listeners.', error);
    }
  }, [onOpenConversation]);

  return null;
}
