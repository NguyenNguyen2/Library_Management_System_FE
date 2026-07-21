import { useState, Suspense } from 'react';
import { App, Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { cn } from '@shared/constants/commonConst';
import LibrarianNavigate from '../general/LibrarianNavigate';
import LibrarianHeader from '../general/LibrarianHeader';
import Loading from '@shared/components/general/Loading';
import AiChatWidget from '../ai-assistant/AiChatWidget';

const { Header, Sider, Content } = Layout;

const LibrarianLayout = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  const toggle = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <StyleProvider transformers={[legacyLogicalPropertiesTransformer]}>
      <Layout className={cn('h-full')}>
        <Sider
          trigger={null}
          width={256}
          collapsedWidth={80}
          collapsed={collapsed}
          theme="light"
          collapsible
          className={cn('!bg-white border-r border-blackLight')}
        >
          <LibrarianNavigate collapsed={collapsed} onToggle={toggle} />
        </Sider>
        <Layout>
          <Header
            className={cn(
              'h-[88px] sticky top-0 z-50 content-center bg-white px-6 shadow-md'
            )}
          >
            <LibrarianHeader />
          </Header>
          <Content
            className={cn(
              'h-[calc(100vh-90px)] min-h-[calc(100vh-90px)] overflow-auto bg-bgAdvanceSection p-8'
            )}
          >
            <Suspense fallback={<Loading />}>
              <App>
                <Outlet />
              </App>
            </Suspense>
          </Content>
        </Layout>
        <AiChatWidget />
      </Layout>
    </StyleProvider>
  );
};

export default LibrarianLayout;
