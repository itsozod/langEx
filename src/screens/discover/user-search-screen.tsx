import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, TextInput, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import type { SymbolViewProps } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import { UserSearchResultRow } from './components/user-search-result-row';
import { useUserSearch } from './hooks';
import { useUserSearchSheet } from './hooks/use-user-search-sheet';
import { useUserSearchStyles } from './styles/user-search-styles';
import type { UserSearchResult } from './types';

type UserSearchScreenProps = {
  onClose: () => void;
};

export default function UserSearchScreen({ onClose }: UserSearchScreenProps) {
  const styles = useUserSearchStyles();
  const [searchText, setSearchText] = useState('');
  const normalizedSearch = searchText.trim();
  const { debouncedQuery, query } = useUserSearch(searchText);
  const users = query.data?.users ?? [];
  const hasSearchQuery = normalizedSearch.length >= 2;
  const isWaitingForDebounce = Boolean(hasSearchQuery && normalizedSearch !== debouncedQuery);
  const isLoading = isWaitingForDebounce || query.isPending || query.isFetching;

  const close = useCallback(() => onClose(), [onClose]);
  const { backdropAnimatedStyle, dismiss, panGesture, sheetAnimatedStyle, sheetHeight } =
    useUserSearchSheet(close);

  const state = !hasSearchQuery ? (
    <SearchState
      icon={{ ios: 'person.2.fill', android: 'person', web: 'person' }}
      title="Find someone you know"
      message="Type at least two letters from their display name."
    />
  ) : isLoading ? (
    <View style={styles.state} accessibilityLabel="Searching users">
      <ActivityIndicator size="large" color="#6654C7" />
      <ThemedText themeColor="textSecondary" style={styles.stateMessage}>
        Searching…
      </ThemedText>
    </View>
  ) : query.isError ? (
    <SearchState
      icon={{ ios: 'wifi.exclamationmark', android: 'wifi_off', web: 'wifi_off' }}
      title="Search is unavailable"
      message={query.error instanceof Error ? query.error.message : 'Check your connection.'}
      actionLabel="Try again"
      onAction={() => void query.refetch()}
    />
  ) : users.length === 0 ? (
    <SearchState
      icon={{
        ios: 'person.crop.circle.badge.questionmark',
        android: 'person_off',
        web: 'person_off',
      }}
      title={`No match for “${debouncedQuery}”`}
      message="Check the spelling or try a shorter name."
    />
  ) : null;

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close search"
          onPress={dismiss}
          style={styles.backdropPressable}
        />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[styles.sheetSurface, { height: sheetHeight }, sheetAnimatedStyle]}>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <KeyboardAvoidingView
            behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}>
            <GestureDetector gesture={panGesture}>
              <Animated.View style={styles.grabberArea}>
                <View style={styles.grabber} />
              </Animated.View>
            </GestureDetector>
            <View style={styles.header}>
              <View style={styles.headingCopy}>
                <ThemedText type="bold" style={styles.title}>
                  Find people
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  Search the LangEx community
                </ThemedText>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close search"
                hitSlop={4}
                onPress={dismiss}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <SymbolView
                  name={{ ios: 'xmark', android: 'close', web: 'close' }}
                  size={21}
                  weight="semibold"
                  tintColor={styles.clearIcon.color}
                />
              </Pressable>
            </View>

            <View style={styles.searchGroup}>
              <ThemedText style={styles.label}>Search by username</ThemedText>
              <View style={styles.searchField}>
                <SymbolView
                  name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                  size={20}
                  weight="medium"
                  tintColor={styles.searchIcon.color}
                />
                <TextInput
                  accessibilityLabel="Search by username"
                  autoCapitalize="words"
                  autoCorrect={false}
                  autoFocus
                  maxLength={50}
                  onChangeText={setSearchText}
                  placeholder="Enter a display name"
                  placeholderTextColor={styles.clearIcon.color}
                  returnKeyType="search"
                  selectionColor="#7460D3"
                  style={styles.input}
                  value={searchText}
                />
                {searchText ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                    onPress={() => setSearchText('')}
                    style={styles.clearButton}>
                    <SymbolView
                      name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                      size={19}
                      tintColor={styles.clearIcon.color}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>

            <FlatList<UserSearchResult>
              data={state ? [] : users}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <UserSearchResultRow user={item} />}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={state}
              contentContainerStyle={styles.listContent}
              contentInsetAdjustmentBehavior="automatic"
              keyboardDismissMode={process.env.EXPO_OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
            />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

type SearchStateProps = {
  icon: SymbolViewProps['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

function SearchState({ icon, title, message, actionLabel, onAction }: SearchStateProps) {
  const styles = useUserSearchStyles();

  return (
    <View style={styles.state}>
      <View style={styles.stateIcon}>
        <SymbolView name={icon} size={29} tintColor={styles.stateIconColor.color} />
      </View>
      <ThemedText type="bold" style={styles.stateTitle}>
        {title}
      </ThemedText>
      <ThemedText selectable themeColor="textSecondary" style={styles.stateMessage}>
        {message}
      </ThemedText>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={styles.retryButton}>
          <ThemedText style={styles.retryText}>{actionLabel}</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}
