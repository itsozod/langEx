import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';

import { getCountry } from '@/screens/onboarding/data';

type CountryFlagProps = {
  country: string;
  size?: number;
  boxSize?: number;
  style?: StyleProp<ImageStyle>;
};

export function CountryFlag({ country, size = 17, boxSize = 22, style }: CountryFlagProps) {
  const code = getCountry(country)?.code.toLowerCase();
  if (!code) return null;

  const diameter = Math.max(size, boxSize);

  return (
    <Image
      accessible={false}
      source={{ uri: `https://hatscripts.github.io/circle-flags/flags/${code}.svg` }}
      contentFit="contain"
      contentPosition="center"
      cachePolicy="memory-disk"
      recyclingKey={code}
      style={[
        {
          width: diameter,
          height: diameter,
        },
        style,
      ]}
    />
  );
}
