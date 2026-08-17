const LANGUAGE_FLAGS: Record<string, string> = {
  Arabic: '🇸🇦',
  Armenian: '🇦🇲',
  Azerbaijani: '🇦🇿',
  Bengali: '🇧🇩',
  'Chinese (Mandarin)': '🇨🇳',
  Czech: '🇨🇿',
  Danish: '🇩🇰',
  Dutch: '🇳🇱',
  English: '🇬🇧',
  Filipino: '🇵🇭',
  Finnish: '🇫🇮',
  French: '🇫🇷',
  Georgian: '🇬🇪',
  German: '🇩🇪',
  Greek: '🇬🇷',
  Hebrew: '🇮🇱',
  Hindi: '🇮🇳',
  Hungarian: '🇭🇺',
  Indonesian: '🇮🇩',
  Italian: '🇮🇹',
  Japanese: '🇯🇵',
  Kazakh: '🇰🇿',
  Korean: '🇰🇷',
  Malay: '🇲🇾',
  Norwegian: '🇳🇴',
  Persian: '🇮🇷',
  Polish: '🇵🇱',
  Portuguese: '🇵🇹',
  Romanian: '🇷🇴',
  Russian: '🇷🇺',
  Spanish: '🇪🇸',
  Swahili: '🇰🇪',
  Swedish: '🇸🇪',
  Tajik: '🇹🇯',
  Thai: '🇹🇭',
  Turkish: '🇹🇷',
  Ukrainian: '🇺🇦',
  Urdu: '🇵🇰',
  Uzbek: '🇺🇿',
  Vietnamese: '🇻🇳',
};

export const getLanguageFlag = (language?: string | null) =>
  language ? (LANGUAGE_FLAGS[language] ?? '🌐') : '🌐';

export const getInitials = (displayName: string | null | undefined, email: string) => {
  const source = displayName?.trim() || email.split('@')[0];
  const parts = source.split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};
