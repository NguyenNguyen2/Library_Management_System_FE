import { useState } from 'react';
import { mockAuditLogs } from '../../lib/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Search,
  FileText,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut,
  BookOpen,
  Edit,
  Trash2,
  User,
  Filter,
} from 'lucide-react';

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  login_success: { label: 'Đăng nhập', icon: LogIn, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  login_failed: { label: 'Đăng nhập thất bại', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50' },
  logout: { label: 'Đăng xuất', icon: LogOut, color: 'text-gray-700', bg: 'bg-gray-100' },
  create_book: { label: 'Thêm sách', icon: BookOpen, color: 'text-blue-700', bg: 'bg-blue-50' },
  update_book: { label: 'Sửa sách', icon: Edit, color: 'text-amber-700', bg: 'bg-amber-50' },
  delete_book: { label: 'Xóa sách', icon: Trash2, color: 'text-red-700', bg: 'bg-red-50' },
  checkout: { label: 'Cho mượn', icon: BookOpen, color: 'text-blue-700', bg: 'bg-blue-50' },
  return_book: { label: 'Nhận trả', icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  create_user: { label: 'Tạo tài khoản', icon: User, color: 'text-purple-700', bg: 'bg-purple-50' },
  reset_password: { label: 'Đặt lại mật khẩu', icon: User, color: 'text-amber-700', bg: 'bg-amber-50' },
};

const EXTRA_LOGS = [
  { id: 'al-x1', userId: 'l1', userName: 'Nguyễn Thị Lan', userRole: 'librarian', action: 'checkout', ipAddress: '192.168.1.45', userAgent: 'Chrome', timestamp: new Date('2026-06-03T08:15:00'), success: true, details: 'Cho mượn sách: Đắc Nhân Tâm — GD-3041' },
  { id: 'al-x2', userId: 'l1', userName: 'Nguyễn Thị Lan', userRole: 'librarian', action: 'return_book', ipAddress: '192.168.1.45', userAgent: 'Chrome', timestamp: new Date('2026-06-03T09:30:00'), success: true, details: 'Nhận trả: Nhà Giả Kim — GD-3038' },
  { id: 'al-x3', userId: 'l2', userName: 'Trần Văn Minh', userRole: 'librarian', action: 'create_book', ipAddress: '192.168.1.82', userAgent: 'Firefox', timestamp: new Date('2026-06-02T14:22:00'), success: true, details: 'Thêm sách mới: Sapiens ISBN 978-6049564222' },
  { id: 'al-x4', userId: 'l2', userName: 'Trần Văn Minh', userRole: 'librarian', action: 'update_book', ipAddress: '192.168.1.82', userAgent: 'Firefox', timestamp: new Date('2026-06-02T14:45:00'), success: true, details: 'Cập nhật thông tin: Nhà Giả Kim' },
  { id: 'al-x5', userId: 'l1', userName: 'Nguyễn Thị Lan', userRole: 'librarian', action: 'login_success', ipAddress: '192.168.1.45', userAgent: 'Chrome', timestamp: new Date('2026-06-03T07:58:00'), success: true, details: 'Đăng nhập thành công' },
  { id: 'al-x6', userId: 'unknown', userName: 'Không xác định', userRole: 'reader', action: 'login_failed', ipAddress: '10.0.0.12', userAgent: 'Chrome', timestamp: new Date('2026-06-03T10:12:00'), success: false, details: 'Sai mật khẩu — 3 lần' },
  { id: 'al-x7', userId: 'l1', userName: 'Nguyễn Thị Lan', userRole: 'librarian', action: 'create_user', ipAddress: '192.168.1.45', userAgent: 'Chrome', timestamp: new Date('2026-06-01T15:00:00'), success: true, details: 'Tạo độc giả mới: Vũ Thanh Mai' },
];

const allLogs = [...EXTRA_LOGS, ...mockAuditLogs]
  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

const ACTION_TYPES = ['all', 'login_success', 'login_failed', 'logout', 'checkout', 'return_book', 'create_book', 'update_book', 'delete_book', 'create_user'];

export function AuditLogPage() {
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = allLogs.filter((log) => {
    const matchQ =
      !q ||
      log.userName.toLowerCase().includes(q.toLowerCase()) ||
      (log.details ?? '').toLowerCase().includes(q.toLowerCase()) ||
      log.ipAddress.includes(q);
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    const today = new Date();
    const logDate = new Date(log.timestamp);
    const matchDate =
      dateFilter === 'all' ||
      (dateFilter === 'today' && logDate.toDateString() === today.toDateString()) ||
      (dateFilter === '7days' && today.getTime() - logDate.getTime() <= 7 * 86400000);
    return matchQ && matchAction && matchDate;
  });

  const successCount = filtered.filter((l) => l.success).length;
  const failCount = filtered.filter((l) => !l.success).length;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>
          Nhật ký hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi toàn bộ hoạt động trong thư viện</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng nhật ký</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{allLogs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Thành công</p>
            <p className="text-emerald-600" style={{ fontSize: 22, fontWeight: 700 }}>{successCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Thất bại</p>
            <p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>{failCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Hôm nay</p>
            <p className="text-blue-600" style={{ fontSize: 22, fontWeight: 700 }}>
              {allLogs.filter((l) => new Date(l.timestamp).toDateString() === new Date().toDateString()).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-sm">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên, IP, chi tiết..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              {(['all', 'today', '7days'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    dateFilter === d ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {d === 'all' ? 'Tất cả' : d === 'today' ? 'Hôm nay' : '7 ngày'}
                </button>
              ))}
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-9 border border-gray-200 rounded-md px-3 text-sm bg-white"
            >
              <option value="all">Tất cả hành động</option>
              <option value="login_success">Đăng nhập</option>
              <option value="login_failed">Đăng nhập thất bại</option>
              <option value="checkout">Cho mượn</option>
              <option value="return_book">Nhận trả</option>
              <option value="create_book">Thêm sách</option>
              <option value="update_book">Sửa sách</option>
              <option value="create_user">Tạo tài khoản</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Thời gian</th>
                  <th className="py-3 px-2">Người dùng</th>
                  <th className="py-3 px-2">Hành động</th>
                  <th className="py-3 px-2">Chi tiết</th>
                  <th className="py-3 px-2">IP</th>
                  <th className="py-3 px-2 text-center">Kết quả</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => {
                  const cfg = ACTION_CONFIG[log.action] ?? {
                    label: log.action,
                    icon: FileText,
                    color: 'text-gray-700',
                    bg: 'bg-gray-100',
                  };
                  const Icon = cfg.icon;
                  return (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-2">
                        <p className="text-sm" style={{ fontWeight: 500 }}>{log.userName}</p>
                        <p className="text-xs text-gray-400">
                          {log.userRole === 'admin'
                            ? 'Quản trị viên'
                            : log.userRole === 'librarian'
                            ? 'Thủ thư'
                            : 'Độc giả'}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${cfg.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <span className={`text-xs ${cfg.color}`} style={{ fontWeight: 500 }}>
                            {cfg.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-600 max-w-[280px] truncate">
                        {log.details ?? '—'}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-500 font-mono">{log.ipAddress}</td>
                      <td className="py-3 px-2 text-center">
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      Không tìm thấy nhật ký phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">Hiển thị {filtered.length} / {allLogs.length} nhật ký</p>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 rounded-md text-sm ${
                    p === 1 ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
