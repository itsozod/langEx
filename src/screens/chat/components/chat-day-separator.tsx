import 'dayjs/locale/ru';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Day, GiftedChatContext, useChatContext } from 'react-native-gifted-chat';

import { FONT, useUiTokens } from '@/shared/hooks/use-ui-tokens';

type ChatDaySeparatorProps = {
  createdAt: Date | number;
};

/** Gifted Chat's day label rendered in the active app language. */
export function ChatDaySeparator({ createdAt }: ChatDaySeparatorProps) {
  const { t, i18n } = useTranslation('chat');
  const parentContext = useChatContext();
  const language = i18n.language;
  const context = useMemo(
    () => ({ ...parentContext, getLocale: () => language }),
    [language, parentContext],
  );
  const calendarFormat = useMemo(() => ({ sameDay: `[${t('day.today')}]` }), [t]);
  const tokens = useUiTokens();
  const wrapperStyle = useMemo(() => [styles.wrapper, { backgroundColor: tokens.fill }], [tokens]);
  const textProps = useMemo(() => ({ style: [styles.text, { color: tokens.muted }] }), [tokens]);

  return (
    <GiftedChatContext.Provider value={context}>
      <Day
        createdAt={createdAt}
        dateFormatCalendar={calendarFormat}
        textProps={textProps}
        wrapperStyle={wrapperStyle}
      />
    </GiftedChatContext.Provider>
  );
}

// A quiet date chip: filled like other controls instead of Gifted Chat's solid black pill.
const styles = StyleSheet.create({
  wrapper: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontFamily: FONT.medium, fontSize: 12, lineHeight: 16 },
});
