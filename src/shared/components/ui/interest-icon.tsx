import type { ColorValue } from 'react-native';

import { SymbolView, type SymbolViewProps } from './symbol-view';

type InterestDefinition = {
  label: string;
  symbol: SymbolViewProps['name'];
};

const INTERESTS: Record<string, InterestDefinition> = {
  travel: {
    label: 'Travel',
    symbol: { ios: 'airplane', android: 'flight', web: 'flight' },
  },
  music: {
    label: 'Music',
    symbol: { ios: 'music.note', android: 'music_note', web: 'music_note' },
  },
  food: {
    label: 'Food',
    symbol: { ios: 'fork.knife', android: 'restaurant', web: 'restaurant' },
  },
  sports: {
    label: 'Sports',
    symbol: { ios: 'soccerball', android: 'sports_soccer', web: 'sports_soccer' },
  },
  tech: {
    label: 'Tech',
    symbol: { ios: 'laptopcomputer', android: 'laptop', web: 'laptop' },
  },
  movies: {
    label: 'Movies',
    symbol: { ios: 'film', android: 'movie', web: 'movie' },
  },
  books: {
    label: 'Books',
    symbol: { ios: 'book.closed', android: 'menu_book', web: 'menu_book' },
  },
  gaming: {
    label: 'Gaming',
    symbol: { ios: 'gamecontroller', android: 'sports_esports', web: 'sports_esports' },
  },
  art: {
    label: 'Art',
    symbol: { ios: 'paintpalette', android: 'palette', web: 'palette' },
  },
  fashion: {
    label: 'Fashion',
    symbol: { ios: 'tshirt', android: 'apparel', web: 'apparel' },
  },
  science: {
    label: 'Science',
    symbol: { ios: 'flask', android: 'science', web: 'science' },
  },
  business: {
    label: 'Business',
    symbol: { ios: 'briefcase', android: 'business_center', web: 'business_center' },
  },
};

const getDefinition = (interest: string) =>
  INTERESTS[interest.trim().split(/\s+/)[0].toLowerCase()];

export function getInterestLabel(interest: string) {
  return getDefinition(interest)?.label ?? interest;
}

export function InterestIcon({
  color,
  interest,
  size = 14,
}: {
  color: ColorValue;
  interest: string;
  size?: number;
}) {
  const symbol =
    getDefinition(interest)?.symbol ??
    ({ ios: 'sparkles', android: 'sparkles', web: 'sparkles' } as const);

  return <SymbolView name={symbol} size={size} weight="semibold" tintColor={color} />;
}
