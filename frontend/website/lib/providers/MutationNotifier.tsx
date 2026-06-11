'use client';

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { AxiosError } from 'axios';
import { useTranslations } from 'next-intl';
import {
  configErr,
  configSuccess,
  type TranslatorFn,
} from '@shared/constants/commonConst';
import { ErrorCode } from '@shared/constants/customError';

/**
 * Subscribes to mutation cache events and shows antd notifications.
 * Passes next-intl's translator to shared helpers (admin passes i18next's `t`),
 * so notification copy stays in sync across apps without duplicating i18n keys.
 */
export function MutationNotifier() {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const translator = useTranslations();
  // next-intl's `t` has a narrower key type than our shared `TranslatorFn`.
  // Memoize a loose adapter so shared helpers (admin also uses them) stay
  // framework-agnostic without leaking next-intl types into `@shared`.
  const t = useMemo<TranslatorFn>(
    () => (key) => translator(key),
    [translator],
  );

  useEffect(() => {
    const errorMessages = ErrorCode(t);

    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== 'updated') return;
      const state = event.mutation.state;

      if (state.status === 'success') {
        notification.success(configSuccess(t));
      }

      if (state.status === 'error') {
        const errData = (state.error as AxiosError<Record<string, unknown>>)
          .response?.data;
        const errorId = errData?.error_id as string | undefined;
        const customMsg = errorId
          ? errorMessages[errorId as keyof typeof errorMessages]
          : undefined;

        notification.error(
          customMsg ? { message: customMsg } : configErr(t),
        );
      }
    });

    return () => unsubscribe();
  }, [queryClient, notification, t]);

  return null;
}
