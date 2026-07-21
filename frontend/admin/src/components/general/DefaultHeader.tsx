import { Flex } from 'antd';
import { useTranslation } from 'react-i18next';
import { matchPath, useLocation } from 'react-router-dom';
import { DYNAMIC_ROUTES, HEADER_TITLES } from '../../constants/routers';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { getKey } from '@shared/types/I18nKeyType';
import {
  RightOutlined,
} from '@ant-design/icons';

const DefaultHeader = () => {
  const { user } = useGlobalVariable();
  const pathname = useLocation();
  const { t } = useTranslation();

  const handleDynamicRouteTitle = () => {
    const matched = DYNAMIC_ROUTES.find((route) =>
      matchPath(route, pathname.pathname)
    );
    return matched ? HEADER_TITLES[matched] : t(getKey('unknown_page'));
  };

  const title = HEADER_TITLES[pathname.pathname] ?? handleDynamicRouteTitle();

  const initials = (user?.name ?? 'A').slice(0, 1).toUpperCase();

  return (
    <div className="flex justify-between items-center w-full h-full bg-white">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-[#6B7280]">{t(getKey('admin'))}</span>
        <RightOutlined style={{ fontSize: 10, color: '#9CA3AF' }} />
        <span className="text-[#111827] font-semibold">
          {t(getKey(title))}
        </span>
      </div>

      {/* User card */}
      <Flex align="center">
        {/* User Card */}
        <Flex align="center" gap={8} className="pl-1 pr-2 py-1 hover:bg-[#F3F4F6] rounded-md cursor-pointer transition-colors duration-150">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
          <Flex vertical align="start" className="text-left leading-none">
            <span className="text-sm font-semibold text-[#111827]">{user?.name ?? 'Admin'}</span>
            <span className="text-[11px] text-gray-500 mt-1">{t(getKey('admin'))}</span>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default DefaultHeader;
