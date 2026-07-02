  'use client';

  import React, { useMemo, useState } from 'react';
  import { Badge, Button, Drawer, Dropdown } from 'antd';
  import type { MenuProps } from 'antd';
  import { BellOutlined } from '@ant-design/icons';
  import {
    UserOutlined,
    LogoutOutlined,
    MenuOutlined,
    DownOutlined,
    HeartOutlined,
    ClockCircleOutlined,
    FileTextOutlined, 
  } from '@ant-design/icons';
  import { useRouter, usePathname } from 'next/navigation';
  import { getCookie } from '@shared/utils/cookie';
  import { STORAGES } from '@shared/constants/storage';
  import { APP_ROUTE } from '@/constants/routes';
  import { useLogout } from '@/features/auth/hooks/useAuth';
  import { useUser } from '@shared/provider/UserProvider';
  import { useNotifications } from '@/features/private/hooks/useNotifications';
  import { LanguageSwitcher } from './LanguageSwitcher';
  import { useTranslations } from 'next-intl';
  import styles from './HeaderWithSideBar.module.css';
  import { LOGO_HEARTBEAT } from '@shared/constants/animation';

  const NAV_ITEMS = [
    { href: APP_ROUTE.home,        label: 'Trang chủ' },
    { href: APP_ROUTE.courses,     label: 'Danh mục' },
    { href: APP_ROUTE.borrowed,    label: 'Đang mượn' },
    { href: APP_ROUTE.readingList, label: 'Danh sách đọc' },
    { href: APP_ROUTE.reservations,label: 'Đặt trước' },
  ];

  const HeaderWithSideBar = () => {
    const router   = useRouter();
    const pathname = usePathname();
    const [token, setToken]             = useState<string | null>(null);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const t = useTranslations();
    const isSupportLanguage = process.env.NEXT_PUBLIC_IS_SUPPORT_LANGUAGE === 'TRUE';
    const { mutate: logout } = useLogout();
    const { user } = useUser();
    const { data: notifications = [] } = useNotifications();

    const isProfilePage = pathname === APP_ROUTE.profile;

    const unreadCount = useMemo(
      () => notifications.filter((notification) => !notification.is_read).length,
      [notifications]
    );

    React.useEffect(() => {
      setToken(getCookie(STORAGES.ACCESS_TOKEN) || null);
    }, []);

    const userMenuItems: MenuProps['items'] = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Thông tin cá nhân',
        onClick: () => router.push(APP_ROUTE.profile),
      },
      {
        key: 'history',
        icon: <ClockCircleOutlined />,
        label: 'Lịch sử mượn',
        onClick: () => router.push(APP_ROUTE.history),
      },
      {
        key: 'fines',
        icon: <FileTextOutlined />,
        label: 'Lịch sử phí phạt',
        onClick: () => router.push(APP_ROUTE.fines),
      },
      {
        key: 'favorites',
        icon: <HeartOutlined />,
        label: 'Yêu thích',
        onClick: () => router.push(APP_ROUTE.favorites),
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Đăng xuất',
        danger: true,
        onClick: () => logout(),
      },
    ];

    return (
      <>
        <header
          className={`${styles.header} flex items-center justify-between px-6 bg-white border-b border-black/10 shrink-0`}
        >
          {/* Logo */}
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
            <span className="font-bold text-xl text-(--navyDark)">{t('header_title')}</span>
          </button>

          {/* Center nav — hidden on /profile */}
          {token && !isProfilePage && (
            <nav className="hidden md:flex items-center gap-6">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={`text-sm font-medium transition-colors ${
                      isActive ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right side */}
          {token ? (
            <div className="flex items-center gap-3">
              {/* Mobile hamburger — hidden on /profile */}
              {!isProfilePage && (
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className="md:hidden p-2 -m-2 text-gray-700 hover:text-blue-600"
                  aria-label="Menu"
                >
                  <MenuOutlined style={{ fontSize: 20 }} />
                </button>
              )}

              {/* Notification */}
              <Badge count={unreadCount} size="small" offset={[0, 4]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 22 }} />}
                  onClick={() => router.push(APP_ROUTE.notifications)}
                />
              </Badge>

              {/* User dropdown */}
              <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
                <Button className={styles.actionButton}>
                  <UserOutlined />
                  <span>{user?.name}</span>
                  <DownOutlined style={{ fontSize: 10 }} />
                </Button>
              </Dropdown>

              {isSupportLanguage && <LanguageSwitcher />}
            </div>
          ) : (
            <Button type="text" onClick={() => router.push(APP_ROUTE.login)}>
              {t('login')}
            </Button>
          )}
        </header>

        {/* Mobile drawer — not shown on /profile */}
        {!isProfilePage && (
          <Drawer
            title={t('header_title')}
            placement="right"
            width={260}
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          >
            <nav className="flex flex-col gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      router.push(item.href);
                    }}
                    className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </Drawer>
        )}
      </>
    );
  };

  export default HeaderWithSideBar;
