import { translateKey } from '@/shared/i18n/translate-key';

export const LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
] as const;

export type LanguageLevel = (typeof LEVELS)[number]['value'];

export const getLevelLabel = (level?: string | null) => {
  if (!level) return '';
  const fallback = LEVELS.find((item) => item.value === level)?.label ?? level;
  return translateKey(`data:levels.${level}`, fallback);
};
