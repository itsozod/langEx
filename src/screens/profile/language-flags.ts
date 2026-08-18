import { getCountryFlag } from '@/screens/onboarding/data';

import { getLanguageCountryCode } from './language-country-codes';

export const getLanguageFlag = (language?: string | null) => {
  const countryCode = getLanguageCountryCode(language);
  return countryCode ? getCountryFlag(countryCode) : '🌐';
};

export const getInitials = (displayName: string | null | undefined, email: string) => {
  const source = displayName?.trim() || email.split('@')[0];
  const parts = source.split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};
