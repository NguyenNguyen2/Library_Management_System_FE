import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, Bell, User, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function Header() {
  const { user, logout } = useAuth();
  const { getUserNotifications } = useLibrary();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const notifications = user ? getUserNotifications(user.id) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBasePath = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'librarian') return '/librarian';
    return '/reader';
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getRoleBasePath()} className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg">Thư viện</h1>
              <p className="text-xs text-gray-500">Library System</p>
            </div>
          </Link>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center gap-6">
              {user.role === 'reader' && (
                <>
                  <Link to="/reader/catalog" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Danh mục sách
                  </Link>
                  <Link to="/reader/borrowed" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Sách đang mượn
                  </Link>
                  <Link to="/reader/reading-list" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Danh sách đọc
                  </Link>
                  <Link to="/reader/reservations" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Đặt trước
                  </Link>
                  <Link to="/reader/history" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Lịch sử
                  </Link>
                </>
              )}

              {user.role === 'librarian' && (
                <>
                  <Link to="/librarian" className="text-gray-700 hover:text-blue-600">Tổng quan</Link>
                  <Link to="/librarian/counter" className="text-gray-700 hover:text-blue-600">Quầy mượn/trả</Link>
                  <Link to="/librarian/catalog" className="text-gray-700 hover:text-blue-600">Thêm sách</Link>
                  <Link to="/librarian/reports" className="text-gray-700 hover:text-blue-600">Báo cáo</Link>
                </>
              )}

              {user.role === 'admin' && (
                <>
                  <Link to="/admin" className="text-gray-700 hover:text-blue-600">Bảng điều khiển</Link>
                  <Link to="/admin/librarians" className="text-gray-700 hover:text-blue-600">Thủ thư</Link>
                  <Link to="/admin/catalog" className="text-gray-700 hover:text-blue-600">Thêm sách</Link>
                  <Link to="/admin/analytics" className="text-gray-700 hover:text-blue-600">Báo cáo & AI</Link>
                  <Link to="/admin/settings" className="text-gray-700 hover:text-blue-600">Cấu hình</Link>
                </>
              )}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* Notifications */}
                <button
                  onClick={() => navigate(user?.role === 'reader' ? '/reader/notifications' : '#')}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5" style={{ fontWeight: 700 }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">
                        {user.role === 'reader' && 'Độc giả'}
                        {user.role === 'librarian' && 'Thủ thư'}
                        {user.role === 'admin' && 'Quản trị viên'}
                      </p>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                      <Link
                        to={`${getRoleBasePath()}/profile`}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ
                      </Link>
                      <Link
                        to={`${getRoleBasePath()}/settings`}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Cài đặt
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}