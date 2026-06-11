'use client';

import { useRef } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from 'antd';
import { AxiosError } from 'axios';
import { configErr, configSuccess, TranslatorFn } from '../../constants/commonConst';
import { ErrorCode } from '../../constants/customError';

/**
 * Shared QueryClientProvider with global mutation notifications.
 * Must be rendered inside AntD <App> (for App.useApp()).
 *
 * Framework-agnostic i18n: caller passes a translator `t` (i18next.t, or a
 * next-intl translator). We keep the latest `t` in a ref so notifications
 * always pick up language changes without recreating the QueryClient.
 */
export default function AppQueryProvider({
  children,
  t,
}: {
  children: any;
  t: TranslatorFn;
}) {
  const { notification } = App.useApp();

  const notificationRef = useRef(notification);
  notificationRef.current = notification;

  const tRef = useRef(t);
  tRef.current = t;

  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    const mutationCache = new MutationCache({
      onSuccess: () => {
        notificationRef.current.success(configSuccess(tRef.current));
      },
      onError: (error) => {
        const errData = (error as AxiosError<Record<string, unknown>>).response?.data;
        const customErr = ErrorCode(tRef.current)[errData?.error_id as keyof ReturnType<typeof ErrorCode>];
        if (customErr) {
          notificationRef.current.error({ message: customErr });
        } else {
          notificationRef.current.error(configErr(tRef.current));
        }
      },
    });

    queryClientRef.current = new QueryClient({
      mutationCache,
      defaultOptions: {
        queries: {
          gcTime: 1000 * 60 * 60,
          retry: 2,
          refetchOnWindowFocus: true,
        },
      },
    });
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
}
