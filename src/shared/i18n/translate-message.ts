type AnyTFunction = (...args: never[]) => unknown;

/**
 * Translates a message that may be an i18n key (for example a Zod validation key such as
 * `auth:validation.emailRequired`) or already-readable text such as a server error. Unknown keys
 * fall back to the original text so server messages still display unchanged.
 */
export function translateMessage(t: AnyTFunction, message: string): string {
  return (t as unknown as (key: string, options: { defaultValue: string }) => string)(message, {
    defaultValue: message,
  });
}
