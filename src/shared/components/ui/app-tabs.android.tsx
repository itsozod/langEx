import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

import { SymbolView, type SymbolViewProps } from './symbol-view';

const TAB_BAR_HEIGHT = 68;

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  name: SymbolViewProps['name'];
};

function TabIcon({ color, focused, name }: TabIconProps) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillFocused]}>
      <SymbolView
        name={name}
        size={21}
        weight={focused ? 'semibold' : 'regular'}
        tintColor={color}
      />
    </View>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10);
  const isDark = scheme === 'dark';

  const screenOptions = useMemo(
    () => ({
      animation: 'shift' as const,
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: isDark ? '#FFFFFF' : '#4D3DA7',
      tabBarAllowFontScaling: false,
      tabBarHideOnKeyboard: true,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarItemStyle: styles.tabItem,
      tabBarLabelStyle: styles.label,
      tabBarStyle: [
        styles.tabBar,
        {
          bottom,
          backgroundColor: isDark ? '#251F32' : '#FFFFFF',
          borderColor: isDark ? 'rgba(190,176,255,0.14)' : 'rgba(77,61,167,0.10)',
          shadowOpacity: isDark ? 0.38 : 0.14,
        },
      ],
    }),
    [bottom, colors.background, colors.textSecondary, isDark],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={{ ios: 'bubble.left.and.bubble.right', android: 'chat_bubble_outline' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name={{ ios: 'safari', android: 'explore' }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              focused={focused}
              name={{ ios: 'person.crop.circle', android: 'account_circle' }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    height: TAB_BAR_HEIGHT,
    borderTopWidth: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 6,
    elevation: 16,
    shadowColor: '#0E0918',
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 15,
  },
  tabItem: {
    borderRadius: 18,
  },
  label: {
    fontFamily: 'PlusJakartaSansSemiBold',
    fontSize: 10,
    lineHeight: 13,
    marginTop: 1,
  },
  iconPill: {
    width: 48,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillFocused: {
    backgroundColor: 'rgba(108,85,217,0.22)',
  },
});
