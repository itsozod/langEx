import enAuth from './locales/en/auth.json';
import enChat from './locales/en/chat.json';
import enCommon from './locales/en/common.json';
import enData from './locales/en/data.json';
import enDiscover from './locales/en/discover.json';
import enGroups from './locales/en/groups.json';
import enOnboarding from './locales/en/onboarding.json';
import enProfile from './locales/en/profile.json';
import ruAuth from './locales/ru/auth.json';
import ruChat from './locales/ru/chat.json';
import ruCommon from './locales/ru/common.json';
import ruData from './locales/ru/data.json';
import ruDiscover from './locales/ru/discover.json';
import ruGroups from './locales/ru/groups.json';
import ruOnboarding from './locales/ru/onboarding.json';
import ruProfile from './locales/ru/profile.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    onboarding: enOnboarding,
    profile: enProfile,
    discover: enDiscover,
    groups: enGroups,
    chat: enChat,
    data: enData,
  },
  ru: {
    common: ruCommon,
    auth: ruAuth,
    onboarding: ruOnboarding,
    profile: ruProfile,
    discover: ruDiscover,
    groups: ruGroups,
    chat: ruChat,
    data: ruData,
  },
} as const;

export const namespaces = Object.keys(resources.en) as (keyof (typeof resources)['en'])[];
