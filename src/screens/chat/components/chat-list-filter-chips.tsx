import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { FilterChip } from '@/shared/components/ui/filter-chip';

import type { ConversationListFilter } from '../api';

const OPTIONS: (ConversationListFilter | null)[] = [null, 'online', 'unread'];

type ChatListFilterChipsProps = {
  selected: ConversationListFilter | null;
  onSelect: (filter: ConversationListFilter | null) => void;
};

/** All / Online / Unread. Exactly one is active; "All" shows every conversation. */
export function ChatListFilterChips({ selected, onSelect }: ChatListFilterChipsProps) {
  const { t } = useTranslation('chat');

  return (
    <View accessibilityRole="radiogroup" style={styles.chips}>
      {OPTIONS.map((option) => (
        <FilterChip
          key={option ?? 'all'}
          label={option ? t(`filters.${option}`) : t('filters.all')}
          onPress={() => onSelect(option)}
          selected={selected === option}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ chips: { flexDirection: 'row', gap: 8 } });
