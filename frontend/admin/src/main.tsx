import { App as AntdApp } from 'antd';
import { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import { useTranslation } from 'react-i18next';
import App from './App';
import LocaleProvider from '@shared/components/provider/LocaleProvider';
import { GlobalVariableProvider } from './hooks/GlobalVariableProvider';
import AppQueryProvider from '@shared/lib/react-query/queryClientProvider';
import '@shared/translation/i18-config';

// Small wrapper so we can pass i18next's `t` to the framework-agnostic
// AppQueryProvider via a hook (hooks can't be called at module scope).
function I18nQueryProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <AppQueryProvider t={t}>{children}</AppQueryProvider>;
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);
root.render(
    <GlobalVariableProvider>
      <LocaleProvider>
        <AntdApp
          notification={{
            maxCount: 1,
            duration: 3,
            showProgress: true,
          }}
        >
          <I18nQueryProvider>
            <App />
          </I18nQueryProvider>
        </AntdApp>
      </LocaleProvider>
    </GlobalVariableProvider>
);
