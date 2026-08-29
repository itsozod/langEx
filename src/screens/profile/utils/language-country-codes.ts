import { LANGUAGE_COUNTRY_CODES } from '../constants/language-country-codes';

export const getLanguageCountryCode = (language?: string | null) =>
  language ? LANGUAGE_COUNTRY_CODES[language] : undefined;
