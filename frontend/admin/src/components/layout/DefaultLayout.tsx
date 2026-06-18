import { useState, Suspense } from 'react';
import { App, Layout } from 'antd';

import { Outlet } from 'react-router-dom';
import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { cn } from '@shared/constants/commonConst';
import DefaultNavigate from '../general/DefaultNavigate';
import DefaultHeader from '../general/DefaultHeader';
import Loading from '@shared/components/general/Loading';

const { Header, Sider, Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const toggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <StyleProvider transformers={[legacyLogicalPropertiesTransformer]}>
      <Layout className={cn('h-full')}>
        <Sider
          trigger={null}
          width={240}
          collapsedWidth={60}
          collapsed={collapsed}
          collapsible
          className={cn('!bg-[#1E2A3B] border-r border-[#2D3F52]')}
        >
          <DefaultNavigate collapsed={collapsed} onToggle={toggle} />
        </Sider>
        <Layout>
          <Header
            className={cn(
              'h-16 sticky top-0 z-50 bg-white border-b border-[#E2E8F0] shadow-none flex items-center'
            )}
            style={{ padding: '0 24px', lineHeight: '64px' }}
          >
            <DefaultHeader />
          </Header>
          <Content
            className={cn(
              'h-[calc(100vh-64px)] min-h-[calc(100vh-64px)] overflow-auto bg-bgAdvanceSection p-6'
            )}
          >
            <Suspense fallback={<Loading />}>
              <App>
                <Outlet />
              </App>
            </Suspense>
          </Content>
        </Layout>
      </Layout>
    </StyleProvider>
  );
};

export default AppLayout;
