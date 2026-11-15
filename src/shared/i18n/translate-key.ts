import i18n from './index';

/**
 * Looks up a dynamically built key (for example `data:countries.${code}`) that the typed `t`
 * cannot check at compile time. Falls back to `defaultValue` when the key is missing.
 */
export function translateKey(
  key: string,
  defaultValue: string,
  options?: Record<string, unknown>,
): string {
  return (i18n.t as unknown as (key: string, options: Record<string, unknown>) => string)(key, {
    ...options,
    defaultValue,
  });
}
