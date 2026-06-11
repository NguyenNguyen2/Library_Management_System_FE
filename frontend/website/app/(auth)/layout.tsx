import React from 'react';
import LanguageSwitcher from '@/features/shared/components/LanguageSwitcher';

/**
 * Auth layout — centers the login/signup card on a gradient background,
 * mirroring the admin `AuthLayout` so both apps share the same shell.
 */
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const isLanguageEnabled =
    process.env.NEXT_PUBLIC_IS_SUPPORT_LANGUAGE === 'TRUE' ||
    process.env.NEXT_PUBLIC_IS_SUPPORT_LANGUAGE === 'true';

  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center
                 bg-[linear-gradient(154deg,var(--color-blue-light)_0%,var(--color-indigo-light)_100%)]"
    >
      {isLanguageEnabled && (
        <div className="absolute right-6 top-6">
          <LanguageSwitcher />
        </div>
      )}

      <div
        className="w-full max-w-md rounded-[10px] border
                   border-(--color-gray-border) bg-white p-6
                   shadow-(--color-shadow-sm)"
      >
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
