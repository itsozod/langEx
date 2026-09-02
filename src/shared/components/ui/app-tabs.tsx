import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useConversationsUnreadCount } from '@/screens/chat/hooks';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const { data } = useConversationsUnreadCount();
  const unreadCount = data?.unreadCount ?? 0;
  const unreadBadge = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      iconColor={{ default: colors.textSecondary, selected: colors.text }}
      indicatorColor={colors.backgroundElement}
      rippleColor={colors.backgroundElement}
      disableTransparentOnScrollEdge
      blurEffect={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
      labelStyle={{ default: { color: colors.textSecondary }, selected: { color: colors.text } }}>
      <NativeTabs.Trigger
        name="chats"
        accessibilityLabel={unreadCount > 0 ? `Chats, ${unreadCount} unread messages` : 'Chats'}>
        <NativeTabs.Trigger.Label>Chats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: 'bubble.left.and.bubble.right',
            selected: 'bubble.left.and.bubble.right.fill',
          }}
          md={{ default: 'chat_bubble_outline', selected: 'chat_bubble' }}
        />
        {unreadCount > 0 ? (
          <NativeTabs.Trigger.Badge>{unreadBadge}</NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="discover">
        <NativeTabs.Trigger.Label>Discover</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'safari', selected: 'safari.fill' }}
          md={{ default: 'explore', selected: 'explore' }}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'person.crop.circle', selected: 'person.crop.circle.fill' }}
          md={{ default: 'person_outline', selected: 'person' }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
