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
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
} from 'lucide-react';

type NavChild = { label: string; to: string };
type NavItem = {
  label: string;
  to: string;
  icon: any;
  badge?: number;
  children?: NavChild[];
};

const ROLE_LABEL: Record<string, string> = {
  head_librarian: 'Thủ thư trưởng',
  assistant_librarian: 'Thủ thư phụ',
  viewer: 'Chỉ xem',
};

const NAV: NavItem[] = [
  { label: 'Dashboard', to: '/librarian', icon: LayoutDashboard },
  {
    label: 'Quản lý Sách',
    to: '/librarian/books',
    icon: BookOpen,
    children: [
      { label: 'Danh sách sách', to: '/librarian/books' },
      { label: 'Thêm sách qua ISBN', to: '/librarian/books/isbn' },
      { label: 'Thêm sách thủ công', to: '/librarian/books/manual' },
      { label: 'Tác giả & Thể loại', to: '/librarian/books/authors' },
    ],
  },
  {
    label: 'Quản lý Kho',
    to: '/librarian/inventory',
    icon: Archive,
    children: [
      { label: 'Danh sách bản sao', to: '/librarian/inventory' },
      { label: 'Thêm bản sao & In QR', to: '/librarian/inventory/add' },
      { label: 'Import Excel', to: '/librarian/inventory/import' },
      { label: 'Báo cáo kho', to: '/librarian/inventory/report' },
    ],
  },
  {
    label: 'Giao dịch Mượn Trả',
    to: '/librarian/counter',
    icon: ArrowLeftRight,
    badge: 12,
    children: [
      { label: 'Mượn sách (Check-out)', to: '/librarian/counter' },
      { label: 'Trả sách (Check-in)', to: '/librarian/counter/checkin' },
      { label: 'Gia hạn & Đặt trước', to: '/librarian/reservations' },
      { label: 'Lịch sử giao dịch', to: '/librarian/transactions' },
    ],
  },
  {
    label: 'Quản lý Phí',
    to: '/librarian/fees',
    icon: CreditCard,
    children: [
      { label: 'Danh sách & Thanh toán', to: '/librarian/fees' },
      { label: 'Lịch sử thu phí', to: '/librarian/fees/history' },
      { label: 'Báo cáo doanh thu', to: '/librarian/fees/revenue' },
    ],
  },
  {
    label: 'Báo cáo',
    to: '/librarian/reports',
    icon: BarChart2,
    children: [
      { label: 'Báo cáo Mượn / Trả', to: '/librarian/reports' },
      { label: 'Top sách mượn nhiều', to: '/librarian/reports/top' },
      { label: 'Độc giả hoạt động', to: '/librarian/reports/readers' },
      { label: 'Sách quá hạn', to: '/librarian/reports/overdue' },
    ],
  },
  {
    label: 'AI Analytics',
    to: '/librarian/ai',
    icon: Sparkles,
    children: [
      { label: 'Gợi ý nhập sách', to: '/librarian/ai' },
      { label: 'Sách ít được mượn', to: '/librarian/ai/low-demand' },
      { label: 'Dự báo nhu cầu', to: '/librarian/ai/forecast' },
      { label: 'AI Summary Report', to: '/librarian/ai/summary' },
    ],
  },
];

const BREADCRUMB_MAP: Record<string, string> = {
  '/librarian': 'Dashboard',
  '/librarian/books': 'Danh sách sách',
  '/librarian/books/isbn': 'Thêm sách qua ISBN',
  '/librarian/books/manual': 'Thêm / Sửa sách',
  '/librarian/books/categories': 'Quản lý thể loại',
  '/librarian/books/authors': 'Quản lý tác giả',
  '/librarian/inventory': 'Danh sách bản sao',
  '/librarian/inventory/add': 'Thêm bản sao & In QR',
  '/librarian/inventory/import': 'Import Excel',
  '/librarian/inventory/report': 'Báo cáo kho',
  '/librarian/counter': 'Mượn sách (Check-out)',
  '/librarian/counter/checkin': 'Trả sách (Check-in)',
  '/librarian/reservations': 'Gia hạn mượn',
  '/librarian/reservations/pending': 'Xử lý đặt trước',
  '/librarian/transactions': 'Lịch sử giao dịch',
  '/librarian/fees': 'Danh sách phí',
  '/librarian/fees/payment': 'Thanh toán phí',
  '/librarian/fees/history': 'Lịch sử thu phí',
  '/librarian/fees/revenue': 'Báo cáo doanh thu',
  '/librarian/reports': 'Báo cáo Mượn / Trả',
  '/librarian/reports/top': 'Top sách mượn nhiều',
  '/librarian/reports/readers': 'Độc giả hoạt động',
  '/librarian/reports/overdue': 'Sách quá hạn',
  '/librarian/ai': 'Gợi ý nhập sách',
  '/librarian/ai/low-demand': 'Sách ít được mượn',
  '/librarian/ai/forecast': 'Dự báo nhu cầu',
  '/librarian/ai/summary': 'AI Summary Report',
};

export function LibrarianLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentLabel =
    BREADCRUMB_MAP[location.pathname] ??
    NAV.flatMap((n) => [n, ...(n.children ?? [])]).find((n: any) => n.to === location.pathname)?.label ??
    'Dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name ?? 'T').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#1E2A3B] text-white fixed top-0 left-0 h-screen flex flex-col">
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#2D3F52] shrink-0">
          <BookOpen className="w-7 h-7 text-[#60A5FA]" />
          <div>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Thư Viện ABC</span>
            <p className="text-[10px] text-[#60A5FA]">Thủ Thư</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === '/librarian'
                ? location.pathname === '/librarian'
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
                  className={`w-full flex items-center gap-2.5 px-3 h-10 rounded-md text-sm transition relative ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#8FA3BF] hover:bg-[#263A50] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#60A5FA] rounded-r" />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left" style={{ fontSize: 13 }}>{item.label}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.children && (
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                          `block pl-5 pr-3 h-8 flex items-center rounded-md text-[12px] ${
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
        <div className="border-t border-[#2D3F52] p-3 flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-white truncate">{user?.name ?? 'Thủ thư'}</p>
            <p className="text-[11px] text-[#8FA3BF]">Thủ thư</p>
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
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#6B7280]">Thủ Thư</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-[#111827]" style={{ fontWeight: 600 }}>{currentLabel}</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-md hover:bg-[#F3F4F6] flex items-center justify-center">
              <Search className="w-5 h-5 text-[#6B7280]" />
            </button>
            <button className="relative w-9 h-9 rounded-md hover:bg-[#F3F4F6] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#6B7280]" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">5</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 hover:bg-[#F3F4F6] rounded-md"
              >
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                  {initials}
                </div>
                <span className="text-sm">{user?.name ?? 'Thủ thư'}</span>
                <ChevronDown className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-md shadow-lg border border-[#E2E8F0] py-1 z-40">
                  <Link to="/librarian/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F9FAFB]">
                    <User className="w-4 h-4" /> Thông tin tài khoản
                  </Link>
                  <Link to="/librarian/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-[#F9FAFB]">
                    <Settings className="w-4 h-4" /> Cài đặt
                  </Link>
                  <div className="my-1 border-t border-[#E2E8F0]" />
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
