import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';

import type { ConversationListFilter } from '../api';
import { useChatListFilterStyles } from '../styles/chat-list-filter-styles';

const FILTERS: ConversationListFilter[] = ['online', 'unread'];

type ChatListFilterChipsProps = {
  selected: ConversationListFilter | null;
  onToggle: (filter: ConversationListFilter) => void;
};

export function ChatListFilterChips({ selected, onToggle }: ChatListFilterChipsProps) {
  const styles = useChatListFilterStyles();
  const { t } = useTranslation('chat');

  return (
    <View accessibilityRole="radiogroup" style={styles.chips}>
      {FILTERS.map((filter) => {
        const isSelected = selected === filter;
        const textColor = isSelected ? styles.chipTextSelected.color : styles.chipIcon.color;
        return (
          <Pressable
            key={filter}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityHint={t('filters.chipHint')}
            onPress={() => onToggle(filter)}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              pressed && styles.pressed,
            ]}>
            {filter === 'online' ? (
              <View style={styles.onlineDot} />
            ) : (
              <SymbolView
                name={{
                  ios: 'message.badge',
                  android: 'mark_chat_unread',
                  web: 'mark_chat_unread',
                }}
                size={15}
                weight="semibold"
                tintColor={textColor}
              />
            )}
            <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {t(`filters.${filter}`)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
