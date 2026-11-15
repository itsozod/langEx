import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE } from './languages';
import { defaultNS, namespaces, resources } from './resources';

// `use` is the i18next instance method that registers the React binding.
// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({
  resources,
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  ns: namespaces,
  defaultNS,
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
});

export default i18n;
