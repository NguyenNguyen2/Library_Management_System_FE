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
const Courses = lazy(() => import('./pages/courses/CoursesPage'));
const Books = lazy(() => import('./pages/books/BooksListPage').then(module => ({ default: module.BooksListPage })));
const Codes = lazy(() => import('./pages/codes/CodesPage'));
const ForgotPassword = lazy(() => import('./pages/login/components/ForgotPassword'));
const Achievements = lazy(() => import('./pages/achievements/AchievementsPage'));
const Settings = lazy(() => import('./pages/settings/SettingsPage'));
const Fees = lazy(() => import('./pages/fees/FeesPage'));
const Reports = lazy(() => import('./pages/reports/ReportsPage'));

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
                <Route path={ROUTES.COURSES} element={<Courses />} />
                <Route path={ROUTES.CODES} element={<Codes />} />
                <Route path={ROUTES.FEES} element={<Fees />} />
                <Route path={ROUTES.REPORTS} element={<Reports />} />
                <Route path={ROUTES.ACHIEVEMENTS} element={<Achievements />} />
                <Route path={ROUTES.SETTINGS} element={<Settings />} />
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
