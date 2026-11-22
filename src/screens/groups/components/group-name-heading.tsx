import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SymbolView } from '@/shared/components/ui/symbol-view';
import { ThemedText } from '@/shared/components/ui/themed-text';
import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

type GroupNameHeadingProps = {
  canEdit: boolean;
  name: string;
  onEdit: () => void;
};

export function GroupNameHeading({ canEdit, name, onEdit }: GroupNameHeadingProps) {
  const { t } = useTranslation('groups');
  const tokens = useUiTokens();

  return (
    <View style={styles.row}>
      <ThemedText numberOfLines={2} type="bold" style={styles.name}>
        {name}
      </ThemedText>
      {canEdit ? (
        <Pressable
          accessibilityLabel={t('edit.accessibilityLabel')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onEdit}
          style={({ pressed }) => [
            styles.editButton,
            { backgroundColor: tokens.fill },
            pressed && styles.pressed,
          ]}>
          <SymbolView
            name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
            size={15}
            weight="semibold"
            tintColor={tokens.text}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    maxWidth: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  name: {
    flexShrink: 1,
    fontFamily: FONT.bold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  editButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
  },
  pressed: { opacity: 0.62 },
});
