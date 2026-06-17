'use client';

import { redirect } from 'next/navigation';
import { APP_ROUTE } from '@/constants/routes';

export default function RootPage() {
  redirect(APP_ROUTE.login);
}
