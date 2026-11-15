import { StyleSheet, View } from 'react-native';

import { ChatSearchOverlay } from '@/screens/chat/chat-search-overlay';
import { UserSearchOverlay } from '@/screens/discover/user-search-overlay';
import AppTabs from '@/shared/components/ui/app-tabs';

export const unstable_settings = {
  initialRouteName: 'chats',
};

export default function TabsLayout() {
  return (
    <View style={styles.root}>
      <AppTabs />
      {/* Rendered after the tabs so the full-screen searches cover the tab bar. */}
      <ChatSearchOverlay />
      <UserSearchOverlay />
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
