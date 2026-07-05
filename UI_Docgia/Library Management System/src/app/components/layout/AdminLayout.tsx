import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Archive,
  ArrowLeftRight,
  CreditCard,
  BarChart2,
  Settings,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  User,
  UserCog,
} from 'lucide-react';

type NavChild = { label: string; to: string };
type NavItem = {
  label: string;
  to: string;
  icon: any;
  badge?: number;
  children?: NavChild[];
};

const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Quản lý tài khoản', to: '/admin/accounts', icon: UserCog },
  {
    label: 'Quản lý Sách',
    to: '/admin/books',
    icon: BookOpen,
    children: [
      { label: 'Danh sách sách', to: '/admin/books' },
      { label: 'Tác giả & Thể loại', to: '/admin/authors' },
      { label: 'Sách nổi bật', to: '/admin/featured' },
    ],
  },
  {
    label: 'Quản lý Kho',
    to: '/admin/inventory',
    icon: Archive,
    children: [
      { label: 'Danh sách bản sao', to: '/admin/inventory' },
      { label: 'Thêm bản sao & In QR', to: '/admin/inventory/add' },
      { label: 'Import & Thanh lý', to: '/admin/inventory/import' },
      { label: 'Báo cáo kho', to: '/admin/inventory/report' },
    ],
  },
  {
    label: 'Giao dịch',
    to: '/admin/transactions',
    icon: ArrowLeftRight,
    badge: 47,
    children: [
      { label: 'Mượn / Trả sách', to: '/admin/transactions/counter' },
      { label: 'Gia hạn & Đặt trước', to: '/admin/transactions/reservations' },
      { label: 'Lịch sử giao dịch', to: '/admin/transactions/history' },
      { label: 'Quản lý độc giả', to: '/admin/transactions/readers' },
    ],
  },
  {
    label: 'Tài chính',
    to: '/admin/finance',
    icon: CreditCard,
    children: [
      { label: 'Danh sách phí', to: '/admin/finance/fees' },
      { label: 'Báo cáo doanh thu', to: '/admin/finance/revenue' },
    ],
  },
  {
    label: 'Báo cáo',
    to: '/admin/reports',
    icon: BarChart2,
    children: [
      { label: 'Báo cáo hoạt động', to: '/admin/reports' },
      { label: 'Sách quá hạn', to: '/admin/reports/overdue' },
      { label: 'AI Analytics', to: '/admin/analytics' },
    ],
  },
  {
    label: 'Cài đặt',
    to: '/admin/settings',
    icon: Settings,
    children: [
      { label: 'Tất cả cấu hình', to: '/admin/settings' },
      { label: 'Thủ thư & phân quyền', to: '/admin/librarians' },
    ],
  },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/librarians': 'Quản lý Thủ thư',
  '/admin/users': 'Quản lý Thủ thư',
  '/admin/catalog': 'Thêm sách',
  '/admin/books': 'Danh sách sách',
  '/admin/reports': 'Báo cáo hoạt động',
  '/admin/analytics': 'AI Analytics',
  '/admin/settings': 'Cấu hình hệ thống',
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>('Dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentLabel =
    BREADCRUMB_MAP[location.pathname] ??
    NAV.flatMap((n) => [n, ...(n.children ?? [])]).find((n: any) => n.to === location.pathname)?.label ??
    'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name ?? 'A').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1E2A3B] text-white fixed top-0 left-0 h-screen flex flex-col">
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#2D3F52]">
          <BookOpen className="w-7 h-7 text-[#60A5FA]" />
          <span style={{ fontSize: 16, fontWeight: 600 }}>Thư Viện ABC</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.to);
            const isOpen = openMenu === item.label;

            return (
              <div key={item.label}>
                <button
                  onClick={() => {
                    if (item.children) {
                      setOpenMenu(isOpen ? null : item.label);
                    } else {
                      navigate(item.to);
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 h-11 rounded-md text-sm transition relative ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#8FA3BF] hover:bg-[#263A50] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#60A5FA] rounded-r" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {item.children && isOpen && (
                  <div className="mt-0.5 pl-3 space-y-0.5">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.to}
                        to={c.to}
                        end
                        className={({ isActive }) =>
                          `block pl-6 pr-3 h-9 flex items-center rounded-md text-[13px] ${
                            isActive
                              ? 'text-white bg-[#263A50]'
                              : 'text-[#8FA3BF] hover:text-white hover:bg-[#263A50]'
                          }`
                        }
                      >
                        {c.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom user */}
        <div className="border-t border-[#2D3F52] p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-[11px] text-[#8FA3BF]">Quản trị viên</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#8FA3BF] hover:text-red-400 p-1"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#6B7280]">Admin</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-[#111827]" style={{ fontWeight: 600 }}>
              {currentLabel}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-md hover:bg-[#F3F4F6] flex items-center justify-center">
              <Search className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="relative w-9 h-9 rounded-md hover:bg-[#F3F4F6] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-[#F3F4F6] rounded-md"
              >
                <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                  {initials}
                </div>
                <span className="text-sm">{user?.name ?? 'Admin'}</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-[#E2E8F0] py-1 z-40">
                  <Link
                    to="/admin/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F9FAFB]"
                  >
                    <User className="w-4 h-4" /> Thông tin tài khoản
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F9FAFB]"
                  >
                    <Settings className="w-4 h-4" /> Đổi mật khẩu
                  </Link>
                  <div className="my-1 border-t border-[#E2E8F0]" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
