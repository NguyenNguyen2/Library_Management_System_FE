'use client';

import React, { useState } from 'react';
import { Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { getCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { APP_ROUTE } from '@/constants/routes';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { useUser } from '@shared/provider/UserProvider';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslations } from 'next-intl';
import styles from './HeaderWithSideBar.module.css';
import { LOGO_HEARTBEAT } from '@shared/constants/animation';

const HeaderWithSideBar = () => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const t = useTranslations();
  const isSupportLanguage =
    process.env.NEXT_PUBLIC_IS_SUPPORT_LANGUAGE === 'TRUE';
  const { mutate: logout } = useLogout();
  const { user } = useUser();

  React.useEffect(() => {
    setToken(getCookie(STORAGES.ACCESS_TOKEN) || null);
  }, []);

  return (
    <header
      className={`${styles.header} flex items-center justify-between px-6 bg-white border-b border-black/10 shrink-0`}
    >
      {/* Left: book logo + academy name — heartbeat + click goes to /home */}
      <button
        type="button"
        onClick={() => router.push(APP_ROUTE.home)}
        className={`flex items-center gap-3 ${LOGO_HEARTBEAT}`}
        aria-label={t('header_title')}
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M4 6h11v20H4z"
            stroke="var(--primaryBlue)"
            strokeWidth="2.667"
            strokeLinejoin="round"
          />
          <path
            d="M15 6h13v20H15z"
            stroke="var(--primaryBlue)"
            strokeWidth="2.667"
            strokeLinejoin="round"
          />
          <path
            d="M15 6V26"
            stroke="var(--primaryBlue)"
            strokeWidth="2.667"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-bold text-xl text-(--navyDark)">
          {t('header_title')}
        </span>
      </button>

      {/* Right: user + logout */}
      {token ? (
        <div className="flex items-center gap-3">
          <Button
            icon={<UserOutlined />}
            onClick={() => router.push(APP_ROUTE.profile)}
            className={styles.actionButton}
          >
            {user?.name}
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={() => logout()}
            className="font-medium"
          >
            {t('logout')}
          </Button>
          {isSupportLanguage && <LanguageSwitcher />}
        </div>
      ) : (
        <Button type="text" onClick={() => router.push(APP_ROUTE.login)}>
          {t('login')}
        </Button>
      )}
    </header>
  );
};

export default HeaderWithSideBar;
