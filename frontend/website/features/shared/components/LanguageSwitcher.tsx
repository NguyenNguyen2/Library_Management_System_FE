'use client';

import { useState, useTransition } from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { setCookie, getCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { languageOptions } from '@shared/constants/languages';

/**
 * Website language switcher.
 *
 * next-intl resolves the active locale from a cookie at request time in
 * `lib/i18/request.ts`. Changing language here:
 *   1. Writes the new locale to the cookie.
 *   2. Calls `router.refresh()` to re-run server components with the new cookie.
 *
 * This is the next-intl equivalent of the admin's `LanguageSelect`
 * (which uses `react-i18next` directly). Both read/write the same cookie.
 */
const LanguageSwitcher = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<string>(
    getCookie(STORAGES.LANGUAGE) ?? 'vi'
  );

  const handleChange = (next: string) => {
    setLanguage(next);
    setCookie(STORAGES.LANGUAGE, next);
    // Re-run server render to pick up the new locale.
    startTransition(() => router.refresh());
  };

  return (
    <Select
      size="middle"
      options={languageOptions}
      value={language}
      onChange={handleChange}
      disabled={isPending}
      suffixIcon={<GlobalOutlined />}
    />
  );
};

export default LanguageSwitcher;
