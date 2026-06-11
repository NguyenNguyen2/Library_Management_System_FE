'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import LoginForm, { TranslateFn } from '@shared/components/auth/LoginForm';
import { useLogin } from '@/features/auth/hooks/useAuth';
import { APP_ROUTE } from '@/constants/routes';

const LoginPage = () => {
  const router = useRouter();
  const nextIntlT = useTranslations();
  const loginMutation = useLogin();

  // Adapter: `next-intl`'s `t` has a richer overload signature than the
  // framework-agnostic `TranslateFn` expected by the shared `LoginForm`.
  // Cast narrows it to the simple `(key, values?) => string` shape.
  const t: TranslateFn = (key, values) =>
    nextIntlT(key, values as Record<string, string | number | Date>);

  return (
    <LoginForm
      t={t}
      loginMutation={loginMutation}
      onForgotPassword={() => router.push(APP_ROUTE.forgotPassword)}
    />
  );
};

export default LoginPage;
