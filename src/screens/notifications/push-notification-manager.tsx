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
  recipientUserId?: string;
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
      recipientUserId:
        typeof notification.request.content.data?.recipientUserId === 'string'
          ? notification.request.content.data.recipientUserId
          : undefined,
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
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
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

    const openNotificationConversation = (response: Notifications.NotificationResponse) => {
      if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;

      const notification = response.notification;
      const notificationId = notification.request.identifier;
      if (handledResponseIdsRef.current.has(notificationId)) return;

      const target = getNotificationConversationTarget(notification);
      if (target) {
        handledResponseIdsRef.current.add(notificationId);
        onOpenConversation(target);
      }
    };

    // Attach the live listener before reading the persisted response so a tap cannot fall into the
    // gap between those two operations. The hook below is authoritative for cold starts.
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) =>
      openNotificationConversation(response),
    );

    return () => {
      responseSubscription.remove();
    };
  }, [onOpenConversation]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !lastNotificationResponse) return;
    if (lastNotificationResponse.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }

    const notification = lastNotificationResponse.notification;
    const notificationId = notification.request.identifier;
    if (handledResponseIdsRef.current.has(notificationId)) return;

    const target = getNotificationConversationTarget(notification);
    if (!target) return;

    handledResponseIdsRef.current.add(notificationId);
    onOpenConversation(target);
  }, [lastNotificationResponse, onOpenConversation]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.info('[notifications] Foreground notification received.', notification);
    });

    return () => receivedSubscription.remove();
  }, []);

  return null;
}

export function clearLastNotificationResponse() {
  if (Platform.OS !== 'android') return;

  void Notifications.clearLastNotificationResponseAsync().catch((error: unknown) => {
    console.warn('[notifications] Could not clear the notification response.', error);
  });
}
