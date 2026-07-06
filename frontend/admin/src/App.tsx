// import 'animate.css';
import { ConfigProvider } from 'antd';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';
import { lazy, Suspense } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import './App.css';
import Loading from '@shared/components/general/Loading';
import PrivateRoute from './components/general/PrivateRoute';
import { COLORS } from '@shared/constants/color';
import { ROUTES } from './constants/routers';

const DefaultLayout = lazy(() => import('./components/layout/DefaultLayout'));
const LibrarianLayout = lazy(() => import('./components/layout/LibrarianLayout'));
const AuthLayout = lazy(() => import('./components/layout/AuthLayout'));
const Login = lazy(() => import('./pages/login/LoginPage'));
const NotFound = lazy(() => import('./components/general/PageNotFound'));
const Dashboard = lazy(() => import('./pages/dashboard/DashboardPage'));
const Users = lazy(() => import('./pages/users/UsersPage'));
const Books = lazy(() => import('./pages/books/BooksListPage').then(module => ({ default: module.BooksListPage })));
const Checkout = lazy(() => import('./pages/checkout/CheckoutPage'));
const Return = lazy(() => import('./pages/return/ReturnBookPage'));
const Renew = lazy(() => import('./pages/renew/RenewBookPage'));
const Reservation = lazy(() => import('./pages/reservation/ReservationPage'));
const ForgotPassword = lazy(() => import('./pages/login/components/ForgotPassword'));
const Achievements = lazy(() => import('./pages/achievements/AchievementsPage'));
const Settings = lazy(() => import('./pages/settings/SettingsPage'));
const Fees = lazy(() => import('./pages/fees/FeesPage'));
const Reports = lazy(() => import('./pages/reports/ReportsPage'));
const UserHistory = lazy(() => import('./pages/history/UserHistoryPage'));
const TransactionHistory = lazy(() => import('./pages/history/TransactionHistoryPage'));
const AIDemand = lazy(() => import('./pages/ai-demand/AIDemandPage'));
const AiAssistant = lazy(() => import('./pages/ai-assistant/AiBookSuggestionChat'));

import { useGlobalVariable } from './hooks/GlobalVariableProvider';

const DynamicRoleLayout = () => {
  const { user } = useGlobalVariable();
  if (user?.role === 'librarian') {
    return <LibrarianLayout />;
  }
  return <DefaultLayout />;
};

function App() {
  
  return (
    <ConfigProvider
      componentSize='small'
      theme={{
        token: {
          colorPrimary: COLORS.primary,
          fontSize: 12,
          
        },
        components: {
          Menu: {
            darkItemSelectedBg: COLORS.primary,
          },
          
          Tabs: {
            horizontalItemPadding: '12px 15px',
          },
          Card: {
            paddingLG: 20,
          },
         
        },
      }}
    >
      <ErrorBoundary>
        <Router>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Root route - redirect to login */}
              <Route path="/" element={<PrivateRoute isPublicOnly={true}><Navigate to={ROUTES.LOGIN} replace /></PrivateRoute>} />

              {/* Những route cần bọc private route để xử lí logic có hay không có token */}
              {/* Những route cần bọc Default Layout */}
              <Route
                element={
                  <PrivateRoute>
                    <DynamicRoleLayout />
                  </PrivateRoute>
                }
              >
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.USERS} element={<Users />} />
                <Route path={ROUTES.BOOKS} element={<Books />} />
                <Route path={ROUTES.FEES} element={<Fees />} />
                <Route path={ROUTES.REPORTS} element={<Reports />} />
                <Route path={ROUTES.TRANSACTIONS} element={<Checkout />} />
                <Route path={ROUTES.RETURN} element={<Return />} />
                <Route path={ROUTES.RENEW} element={<Renew />} />
                <Route path={ROUTES.RESERVATION} element={<Reservation />} />
                <Route path={ROUTES.USER_HISTORY} element={<UserHistory />} />
                <Route path={ROUTES.TRANSACTION_LOG} element={<TransactionHistory />} />
                <Route path={ROUTES.ACHIEVEMENTS} element={<Achievements />} />
                <Route path={ROUTES.SETTINGS} element={<Settings />} />
                <Route path={ROUTES.AI_DEMAND} element={<AIDemand />} />
                <Route path={ROUTES.AI_ASSISTANT} element={<AiAssistant />} />
              </Route>
              {/* Những route cần bọc Auth Layout */}
              <Route
                element={
                  <PrivateRoute isPublicOnly={true}>
                    <AuthLayout />
                  </PrivateRoute>
                }
              >
                <Route path={ROUTES.LOGIN} element={<Login />} />
                <Route path={ROUTES.FORGOTPW} element={<ForgotPassword />} />
              </Route>

              {/* Những route không cần bọc private route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Router>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
