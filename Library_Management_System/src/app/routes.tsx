import { createBrowserRouter, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { LibraryProvider } from './contexts/LibraryContext';
import { LoginPage } from './pages/LoginPage';
import { ReaderDashboard } from './pages/reader/ReaderDashboard';
import { CatalogPage } from './pages/reader/CatalogPage';
import { BookDetailPage } from './pages/reader/BookDetailPage';
import { BorrowedBooksPage } from './pages/reader/BorrowedBooksPage';
import { HistoryPage } from './pages/reader/HistoryPage';
import { ProfilePage } from './pages/reader/ProfilePage';
import { SettingsPage } from './pages/reader/SettingsPage';
import { LibrarianDashboard } from './pages/librarian/LibrarianDashboard';
import { LibrarianAccountPage } from './pages/librarian/LibrarianAccountPage';
import { AuditLogPage } from './pages/librarian/AuditLogPage';
import { LibrarianBooksListPage } from './pages/librarian/LibrarianBooksListPage';
import { AddBookISBNPage } from './pages/librarian/AddBookISBNPage';
import { AddBookManualPage } from './pages/librarian/AddBookManualPage';
import { OTPVerificationPage } from './pages/librarian/OTPVerificationPage';
import { CounterPage } from './pages/librarian/CounterPage';
import { CheckoutPage } from './pages/librarian/CheckoutPage';
import { CheckinPage } from './pages/librarian/CheckinPage';
import { LibrarianAIPage } from './pages/librarian/LibrarianAIPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { LibrariansPage } from './pages/admin/LibrariansPage';
import { AddBookPage } from './pages/admin/AddBookPage';
import { BooksListPage } from './pages/admin/BooksListPage';
import { AuthorsPage } from './pages/admin/AuthorsPage';
import { FeaturedBooksPage } from './pages/admin/FeaturedBooksPage';
import { InventoryListPage } from './pages/admin/InventoryListPage';
import { InventoryAddPage } from './pages/admin/InventoryAddPage';
import { InventoryImportPage } from './pages/admin/InventoryImportPage';
import { InventoryReportPage } from './pages/admin/InventoryReportPage';
import { ReservationsPage } from './pages/admin/ReservationsPage';
import { TransactionHistoryPage } from './pages/admin/TransactionHistoryPage';
import { ReadersPage } from './pages/admin/ReadersPage';
import { FeesPage } from './pages/admin/FeesPage';
import { RevenuePage } from './pages/admin/RevenuePage';
import { OverduePage } from './pages/admin/OverduePage';
import { AccountPage } from './pages/admin/AccountPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SystemConfigPage } from './pages/admin/SystemConfigPage';
import { RootLayout } from './components/layout/RootLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { LibrarianLayout } from './components/layout/LibrarianLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardRedirect } from './components/DashboardRedirect';

function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LibraryProvider>{children}</LibraryProvider>
    </AuthProvider>
  );
}

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl">{title}</h1>
    <p className="text-gray-600 mt-2">Trang đang phát triển</p>
  </div>
);

export const router = createBrowserRouter([
  {
    element: <AppWrapper><LoginPage /></AppWrapper>,
    path: '/login',
  },
  {
    path: '/',
    element: <AppWrapper><ProtectedRoute><RootLayout /></ProtectedRoute></AppWrapper>,
    children: [
      { index: true, element: <DashboardRedirect /> },
      { path: 'dashboard', element: <DashboardRedirect /> },
      // Reader
      {
        path: 'reader',
        children: [
          { index: true, element: <ReaderDashboard /> },
          { path: 'catalog', element: <CatalogPage /> },
          { path: 'catalog/:id', element: <BookDetailPage /> },
          { path: 'borrowed', element: <BorrowedBooksPage /> },
          { path: 'history', element: <HistoryPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  // Librarian (own layout like admin)
  {
    path: '/librarian',
    element: (
      <AppWrapper>
        <ProtectedRoute>
          <LibrarianLayout />
        </ProtectedRoute>
      </AppWrapper>
    ),
    children: [
      { index: true, element: <LibrarianDashboard /> },
      { path: 'account', element: <LibrarianAccountPage /> },
      { path: 'settings', element: <Placeholder title="Cài đặt" /> },
      // Sách
      { path: 'books', element: <LibrarianBooksListPage /> },
      { path: 'books/isbn', element: <AddBookISBNPage /> },
      { path: 'books/manual', element: <AddBookManualPage /> },
      { path: 'books/categories', element: <AuthorsPage /> },
      { path: 'books/authors', element: <AuthorsPage /> },
      // Kho
      { path: 'inventory', element: <InventoryListPage /> },
      { path: 'inventory/add', element: <InventoryAddPage /> },
      { path: 'inventory/import', element: <InventoryImportPage /> },
      { path: 'inventory/report', element: <InventoryReportPage /> },
      // Giao dịch
      { path: 'counter', element: <CheckoutPage /> },
      { path: 'counter/checkin', element: <CheckinPage /> },
      { path: 'reservations', element: <ReservationsPage /> },
      { path: 'reservations/pending', element: <ReservationsPage /> },
      { path: 'transactions', element: <TransactionHistoryPage /> },
      // Phí
      { path: 'fees', element: <FeesPage /> },
      { path: 'fees/payment', element: <FeesPage /> },
      { path: 'fees/history', element: <TransactionHistoryPage /> },
      { path: 'fees/revenue', element: <RevenuePage /> },
      // Báo cáo
      { path: 'reports', element: <AnalyticsPage /> },
      { path: 'reports/top', element: <AnalyticsPage /> },
      { path: 'reports/readers', element: <ReadersPage /> },
      { path: 'reports/overdue', element: <OverduePage /> },
      // AI Analytics (4 tabs trong 1 trang)
      { path: 'ai', element: <LibrarianAIPage /> },
      { path: 'ai/low-demand', element: <LibrarianAIPage /> },
      { path: 'ai/forecast', element: <LibrarianAIPage /> },
      { path: 'ai/summary', element: <LibrarianAIPage /> },
    ],
  },
  // Admin (own layout)
  {
    path: '/admin',
    element: (
      <AppWrapper>
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      </AppWrapper>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'books', element: <BooksListPage /> },
      { path: 'authors', element: <AuthorsPage /> },
      { path: 'featured', element: <FeaturedBooksPage /> },
      { path: 'inventory', element: <InventoryListPage /> },
      { path: 'inventory/add', element: <InventoryAddPage /> },
      { path: 'inventory/import', element: <InventoryImportPage /> },
      { path: 'inventory/report', element: <InventoryReportPage /> },
      { path: 'transactions', element: <CounterPage /> },
      { path: 'transactions/counter', element: <CounterPage /> },
      { path: 'transactions/reservations', element: <ReservationsPage /> },
      { path: 'transactions/history', element: <TransactionHistoryPage /> },
      { path: 'transactions/readers', element: <ReadersPage /> },
      { path: 'finance', element: <FeesPage /> },
      { path: 'finance/fees', element: <FeesPage /> },
      { path: 'finance/revenue', element: <RevenuePage /> },
      { path: 'reports', element: <AnalyticsPage /> },
      { path: 'reports/overdue', element: <OverduePage /> },
      { path: 'accounts', element: <AccountPage /> },
      { path: 'accounts/readers', element: <AccountPage /> },
      { path: 'accounts/librarians', element: <AccountPage /> },
      { path: 'profile', element: <AccountPage /> },
      { path: 'librarians', element: <LibrariansPage /> },
      { path: 'users', element: <LibrariansPage /> },
      { path: 'catalog', element: <AddBookPage /> },
      { path: 'catalog/add', element: <AddBookPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'audit', element: <AuditLogPage /> },
      { path: 'settings', element: <SystemConfigPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
