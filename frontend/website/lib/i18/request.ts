import { STORAGES } from '@shared/constants/storage';
import { decrypted } from '@shared/utils/cookie';
import ViTranslation from '@shared/translation/languages/vi';
import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['vi'] as const;
const DEFAULT_LOCALE = 'vi';

/**
 * Locale → messages map.
 * Both admin (react-i18next) and website (next-intl) consume the same
 * flat `vi.ts` so there's a single source of truth for translations.
 * Keys are flat (e.g. `t('login')`) — no namespacing.
 */
const MESSAGES_BY_LOCALE = {
  vi: ViTranslation,
} as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeRaw = cookieStore.get(STORAGES.LANGUAGE)?.value;
  const localeFromCookie =
    (localeRaw ? decrypted(localeRaw) : DEFAULT_LOCALE) || DEFAULT_LOCALE;
  const locale = SUPPORTED_LOCALES.includes(localeFromCookie as 'vi')
    ? localeFromCookie
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: MESSAGES_BY_LOCALE[locale as keyof typeof MESSAGES_BY_LOCALE],
  };
});
