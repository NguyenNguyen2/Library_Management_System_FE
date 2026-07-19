import { Button, Flex } from 'antd';
import {
  BarChartOutlined,
  CreditCardOutlined,
  LockOutlined,
  LogoutOutlined,
  RobotOutlined,
  SettingOutlined,
  UserOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DownOutlined,
  UpOutlined,
  DeploymentUnitOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routers';
import { cn } from '@shared/constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import { useLogout } from '../../hooks/useAuth';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';

type NavChild = { label: string; to: string };
type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  to: string;
  badge?: number;
  children?: NavChild[];
};

interface IDefaultNavigate {
  collapsed: boolean;
  onToggle: () => void;
}

const DefaultNavigate = ({ collapsed, onToggle }: IDefaultNavigate) => {
  const [selectItem, setSelectItem] = useState<string>('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navigate = useNavigate();
  const pathname = useLocation();
  const { t } = useTranslation();
  const logoutMutation = useLogout();
  const { user } = useGlobalVariable();

  const menuConfig: NavItem[] = [
    {
      key: 'dashboard',
      label: t(getKey('menu_dashboard')),
      icon: <BarChartOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.DASHBOARD,
    },
    {
      key: 'users',
      label: t(getKey('user_management')),
      icon: <UserOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.USERS,
    },
    {
      key: 'books',
      label: t(getKey('menu_books')),
      icon: <BookOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.BOOKS,
      children: [
        { label: t(getKey('menu_book_list')), to: ROUTES.BOOKS },
        { label: t(getKey('menu_author_category')), to: ROUTES.BOOKS + '?tab=authors' },
        { label: t(getKey('menu_featured_books')), to: ROUTES.BOOKS + '?tab=featured' },
      ],
    },
    {
      key: 'inventory',
      label: t(getKey('menu_inventory')),
      icon: <DeploymentUnitOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.BOOKS + '?tab=copies',
      children: [
        { label: t(getKey('menu_copy_list')), to: ROUTES.BOOKS + '?tab=copies' },
        { label: t(getKey('menu_inventory_report')), to: ROUTES.BOOKS + '?tab=report' },
      ],
    },
    {
      key: 'transactions',
      label: t(getKey('menu_transactions')),
      icon: <LockOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.TRANSACTIONS,
      children: [
        { label: t(getKey('checkout_title')), to: ROUTES.TRANSACTIONS },
        { label: t(getKey('return_title')), to: ROUTES.RETURN },
        { label: t(getKey('renew_title')), to: ROUTES.RENEW },
        { label: t(getKey('reservation_title')), to: ROUTES.RESERVATION },
        { label: t(getKey('menu_user_list')), to: ROUTES.TRANSACTION_LOG },
      ],
    },

    {
      key: 'fees',
      label: 'Quản lý phí & Thanh toán',
      icon: <CreditCardOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.FEES,
      children: [
        { label: 'Phí chưa thu', to: ROUTES.FEES },
        { label: 'Tạo phí hỏng/mất', to: ROUTES.FEES + '?tab=damage' },
        { label: 'Lịch sử thu phí', to: ROUTES.FEES + '?tab=history' },
        { label: 'Báo cáo doanh thu', to: ROUTES.FEES + '?tab=revenue' },
      ],
    },
    {
      key: 'reports',
      label: 'Báo cáo & Thống kê',
      icon: <LineChartOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.REPORTS,
    },
    {
      key: 'ai-demand',
      label: 'AI Phân tích nhu cầu',
      icon: <RobotOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.AI_DEMAND,
    },
    {
      key: 'settings',
      label: t(getKey('menu_settings')),
      icon: <SettingOutlined style={{ fontSize: 18 }} />,
      to: ROUTES.SETTINGS,
    },
  ];

  const isActive = (item: NavItem) => {
    const path = pathname.pathname + pathname.search;
    if (item.children) {
      return false; // Parent directories never get highlighted in solid blue
    }
    return path === item.to;
  };

  useEffect(() => {
    if (!pathname) return;
    const path = pathname.pathname + pathname.search;
    setSelectItem(path);

    // Auto-expand parent menu if a child is active
    const activeParent = menuConfig.find((item) =>
      item.children?.some((child) => child.to === path)
    );
    if (activeParent) {
      setOpenMenu(activeParent.key);
    }
  }, [pathname]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleMenuClick = (item: NavItem) => {
    if (item.children) {
      if (collapsed) {
        onToggle(); // expand Sider if collapsed
        setOpenMenu(item.key);
      } else {
        setOpenMenu(openMenu === item.key ? null : item.key);
      }
    } else {
      navigate(item.to);
    }
  };

  const initials = (user?.name ?? 'A').slice(0, 1).toUpperCase();

  return (
    <div className={cn('flex h-full flex-col bg-[#1E2A3B] text-[#8FA3BF]')}>
      {/* Header / Logo */}
      <Flex
        align="center"
        justify={collapsed ? 'center' : 'space-between'}
        className={cn('relative px-4 border-b border-[#2D3F52] h-16 shrink-0')}
      >
        {!collapsed ? (
          <>
            <Flex align="center" gap={12} className="min-w-0">
              <BookOutlined style={{ fontSize: 24, color: '#60A5FA' }} className="shrink-0" />
              <span style={{ fontSize: '16px', fontWeight: 600 }} className="text-white truncate">
                Thư Viện Sách Việt
              </span>
            </Flex>
            <Button
              type="text"
              onClick={onToggle}
              icon={<MenuFoldOutlined className="text-[#8FA3BF]" />}
              className={cn(
                'h-8 w-8 px-2 flex items-center justify-center rounded-lg hover:!bg-[#263A50] border-0 cursor-pointer bg-transparent'
              )}
            />
          </>
        ) : (
          <Button
            type="text"
            onClick={onToggle}
            icon={<MenuUnfoldOutlined className="text-white" />}
            className={cn(
              'h-8 w-8 px-2 flex items-center justify-center rounded-lg hover:!bg-[#263A50] border-0 cursor-pointer bg-transparent'
            )}
          />
        )}
      </Flex>

      {/* Navigation */}
      <div className={cn('flex-1 overflow-y-auto p-2 space-y-0.5')}>
        {menuConfig.map((item) => {
          const isParentActive = isActive(item);
          const isOpen = openMenu === item.key;

          return (
            <div key={item.key}>
              <button
                onClick={() => handleMenuClick(item)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center rounded-md text-sm transition-all duration-200 relative h-11 border-0 cursor-pointer',
                  collapsed ? 'justify-center px-0' : 'justify-start gap-2.5 px-3',
                  isParentActive
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#8FA3BF] bg-transparent hover:bg-[#263A50] hover:text-white'
                )}
              >
                {isParentActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#60A5FA] rounded-r" />
                )}
                <span className="shrink-0 flex items-center justify-center">
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="text-sm truncate flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full mr-1">
                        {item.badge}
                      </span>
                    )}
                    {item.children && (
                      <span className="text-xs shrink-0 ml-1">
                        {isOpen ? <UpOutlined /> : <DownOutlined />}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Sub-menu rendering */}
              {item.children && isOpen && !collapsed && (
                <div className="mt-0.5 pl-3 space-y-0.5">
                  {item.children.map((c) => {
                    const isChildActive = selectItem === c.to;
                    return (
                      <button
                        key={c.label}
                        onClick={() => navigate(c.to)}
                        className={cn(
                          'w-full text-left pl-7 pr-3 h-9 flex items-center rounded-md text-[13px] border-0 cursor-pointer transition-all duration-200',
                          isChildActive
                            ? 'text-white bg-[#263A50]'
                            : 'text-[#8FA3BF] hover:text-white hover:bg-[#263A50]'
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom user card */}
      <div className="border-t border-[#2D3F52] p-4 flex items-center gap-2 shrink-0">
        {collapsed ? (
          <button
            onClick={handleLogout}
            className="text-[#8FA3BF] hover:text-red-400 p-1 mx-auto flex items-center justify-center bg-transparent border-0 cursor-pointer"
            title={t(getKey('logout'))}
          >
            <LogoutOutlined style={{ fontSize: 18 }} />
          </button>
        ) : (
          <>
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold shrink-0 text-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] text-white truncate font-medium m-0 leading-none">{user?.name ?? 'Admin'}</p>
              <p className="text-[11px] text-[#8FA3BF] m-0 mt-1.5 leading-none">Quản trị viên</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[#8FA3BF] hover:text-red-400 p-1 shrink-0 bg-transparent border-0 cursor-pointer flex items-center justify-center"
              title={t(getKey('logout'))}
            >
              <LogoutOutlined style={{ fontSize: 16 }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(DefaultNavigate);
