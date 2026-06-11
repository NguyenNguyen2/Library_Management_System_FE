import { Menu, MenuProps, Button, Flex } from 'antd';
import {
  BarChartOutlined,
  CrownOutlined,
  LockOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';
import { cn } from '@shared/constants/commonConst';
import { LOGO_HEARTBEAT } from '@shared/constants/animation';
import { getKey } from '@shared/types/I18nKeyType';
import { useLogout } from '../../hooks/useAuth';

type TMenuItem = Required<MenuProps>['items'][number];

type TMenuNode = {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  children?: TMenuNode[];
  visible?: boolean;
};

interface IDefaultNavigate {
  collapsed: boolean;
  onToggle: () => void;
}

const DefaultNavigate = ({ collapsed, onToggle }: IDefaultNavigate) => {
  const [selectItem, setSelectItem] = useState<string>('');
  const navigate = useNavigate();
  const pathname = useLocation();
  const { t } = useTranslation();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (!pathname) return;
    setSelectItem(pathname?.pathname);
  }, [pathname]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const menuConfig: TMenuNode[] = [
    {
      key: ROUTES.DASHBOARD,
      label: t(getKey('dashboard')),
      icon: <BarChartOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.USERS,
      label: t(getKey('user_management')),
      icon: <UserOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.COURSES,
      label: t(getKey('course_management')),
      icon: <BookOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.CODES,
      label: t(getKey('code_management')),
      icon: <LockOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.ACHIEVEMENTS,
      label: 'Quản lý Danh hiệu',
      icon: <CrownOutlined style={{ fontSize: 20 }} />,
    },
    {
      key: ROUTES.SETTINGS,
      label: t(getKey('settings_title')),
      icon: <SettingOutlined style={{ fontSize: 20 }} />,
    },
  ];

  const items: TMenuItem[] = menuConfig.map((item) => {
    if (item.visible === false) return null;
    const filterChildren = item.children?.filter(
      (child) => child.visible !== false
    );
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      children: filterChildren,
      onClick: (info) => {
        const route = info?.keyPath?.[0];
        navigate(route);
      },
    };
  });

  return (
    <div className={cn('flex h-full flex-col bg-white')}>
      {/* Header */}
      <Flex
        gap={16}
        align="center"
        justify="space-between"
        className={cn('relative p-6')}
      >
        {!collapsed && (
          <Flex
            vertical
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className={cn(LOGO_HEARTBEAT)}
          >
            <div className={cn('text-xl font-bold leading-7 text-navyDark')}>
              ADMIN PANEL
            </div>
            <div className={cn('text-base leading-5 text-grayDark')}>
              {t(getKey('admin'))}
            </div>
          </Flex>
        )}

        <Button
          type="text"
          size="large"
          onClick={onToggle}
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          className={cn(
            'h-8 w-8 px-2 items-center justify-center rounded-lg text-blackSoft hover:bg-bgAdvanceSection'
          )}
        />
      </Flex>

      {/* Navigation */}
      <div
        className={cn(
          'flex-1 overflow-y-auto pt-4',
          collapsed ? 'px-2' : 'px-4'
        )}
      >
        <Menu
          mode="inline"
          items={items}
          selectedKeys={[selectItem]}
          className={cn('sidebar-light-menu border-none')}
          inlineCollapsed={collapsed}
        />
      </div>

      {/* Logout button — centre the icon when collapsed, keep it left-aligned
          with the label when expanded. */}
      <div
        className={cn(
          'border-t border-blackLight p-4 flex items-center justify-center'
        )}
      >
        <Button
          type="text"
          danger
          icon={<LogoutOutlined className={cn('text-xl')} />}
          onClick={handleLogout}
          size="large"
          className={cn('w-full')}
        >
          {!collapsed && t(getKey('logout'))}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(DefaultNavigate);
