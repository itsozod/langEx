import 'dayjs/locale/ru';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Day, GiftedChatContext, useChatContext } from 'react-native-gifted-chat';

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

  return (
    <GiftedChatContext.Provider value={context}>
      <Day createdAt={createdAt} dateFormatCalendar={calendarFormat} />
    </GiftedChatContext.Provider>
  );
}
