'use client';

import AntdProvider from './AntdProvider';
import QueryProvider from './QueryProvider';
import { UserProvider } from '@shared/provider/UserProvider';

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AntdProvider>
      <QueryProvider>
        <UserProvider>{children}</UserProvider>
      </QueryProvider>
    </AntdProvider>
  );
}
