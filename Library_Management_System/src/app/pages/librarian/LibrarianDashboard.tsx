import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  BookOpen,
  Users,
  AlertTriangle,
  TrendingUp,
  FileBarChart,
  ArrowUpRight,
  Bell,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const trendData = Array.from({ length: 14 }).map((_, i) => {
  const day = i + 1;
  const borrow = 8 + Math.round(Math.sin(i / 2) * 4 + Math.random() * 3);
  const ret = 6 + Math.round(Math.cos(i / 3) * 3 + Math.random() * 2);
  return { day: `${day}`, borrow, ret };
});

const weeklyData = [
  { day: 'T2', borrow: 12, return: 9 },
  { day: 'T3', borrow: 8, return: 11 },
  { day: 'T4', borrow: 15, return: 7 },
  { day: 'T5', borrow: 10, return: 13 },
  { day: 'T6', borrow: 18, return: 14 },
  { day: 'T7', borrow: 22, return: 18 },
  { day: 'CN', borrow: 6, return: 8 },
];

const notifications = [
  { id: 1, type: 'overdue', message: 'Nguyễn Văn An — "Đắc Nhân Tâm" quá hạn 5 ngày', time: '10 phút trước', urgent: true },
  { id: 2, type: 'return', message: 'Trần Thị Bình đã trả "Nhà Giả Kim"', time: '25 phút trước', urgent: false },
  { id: 3, type: 'borrow', message: 'Lê Hoàng Cường mượn "Sapiens"', time: '1 giờ trước', urgent: false },
  { id: 4, type: 'overdue', message: 'Phạm Minh Đức — "Tôi Tài Giỏi" quá hạn 3 ngày', time: '2 giờ trước', urgent: true },
  { id: 5, type: 'reserve', message: 'Vũ Thanh Mai đặt trước "Cây Cam Ngọt"', time: '3 giờ trước', urgent: false },
];

const NOTIF_ICON: Record<string, { icon: any; color: string; bg: string }> = {
  overdue: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  return: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  borrow: { icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  reserve: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
};

const recentTransactions = [
  { id: 'GD-3041', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', type: 'borrow', date: '03/06/2026', status: 'active' },
  { id: 'GD-3040', reader: 'Trần Thị Bình', book: 'Nhà Giả Kim', type: 'return', date: '03/06/2026', status: 'completed' },
  { id: 'GD-3039', reader: 'Lê Hoàng Cường', book: 'Sapiens', type: 'borrow', date: '02/06/2026', status: 'overdue' },
  { id: 'GD-3038', reader: 'Vũ Thanh Mai', book: 'Cây Cam Ngọt', type: 'borrow', date: '02/06/2026', status: 'active' },
  { id: 'GD-3037', reader: 'Phạm Minh Đức', book: 'Tôi Tài Giỏi', type: 'return', date: '01/06/2026', status: 'completed' },
];

export function LibrarianDashboard() {
  const { user } = useAuth();
  const { books, transactions, bookCopies } = useLibrary();

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalBooks = books.length;
  const totalReaders = 1247;
  const borrowedCopies = bookCopies.filter((bc) => bc.status === 'borrowed').length;
  const overdueCount = transactions.filter((t) => t.status === 'overdue').length;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>
            Xin chào, {user?.name ?? 'Thủ thư'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Hôm nay là {today}</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
          <FileBarChart className="w-4 h-4 mr-2" /> Tạo báo cáo hôm nay
        </Button>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <Card style={{ borderLeft: '4px solid #1A56DB' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tổng số sách</p>
                <p className="mt-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  {totalBooks.toLocaleString('vi-VN')}
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +12 đầu sách mới tháng này
                </p>
              </div>
              <div className="bg-blue-50 p-2.5 rounded-lg">
                <BookOpen className="w-5 h-5 text-[#1A56DB]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #10B981' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tổng độc giả</p>
                <p className="mt-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  {totalReaders.toLocaleString('vi-VN')}
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +8.2% so với tháng trước
                </p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #8B5CF6' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Sách đang mượn</p>
                <p className="mt-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  {borrowedCopies}
                </p>
                <p className="text-xs text-gray-500 mt-1">Bản sao đang lưu thông</p>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ borderLeft: '4px solid #EF4444' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Sách quá hạn</p>
                <p className="mt-2 flex items-center gap-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  {overdueCount}
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                </p>
                <p className="text-xs text-red-600 mt-1">Cần xử lý ngay</p>
              </div>
              <div className="bg-red-50 p-2.5 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Lượt mượn & trả theo tuần</h3>
                <p className="text-xs text-gray-500 mt-0.5">Hoạt động giao dịch 7 ngày gần nhất</p>
              </div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">Tuần này</Badge>
            </div>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="borrow" name="Mượn" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="return" name="Trả" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#2563EB]" />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Thông báo nhanh</h3>
              </div>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                {notifications.filter((n) => n.urgent).length} cấp bách
              </Badge>
            </div>
            <div className="space-y-2">
              {notifications.map((n) => {
                const cfg = NOTIF_ICON[n.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex gap-2.5 p-2.5 rounded-lg ${n.urgent ? 'bg-red-50/70 border border-red-100' : 'bg-gray-50/60'}`}
                  >
                    <div className={`${cfg.bg} p-1.5 rounded-md shrink-0 mt-0.5`}>
                      <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-snug text-gray-800">{n.message}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-3 text-xs text-blue-600 hover:underline text-center">
              Xem tất cả thông báo →
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: trend chart + recent transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Xu hướng 14 ngày qua</h3>
                <p className="text-xs text-gray-500 mt-0.5">Biểu đồ mượn theo ngày</p>
              </div>
              <button className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <RefreshCcw className="w-3 h-3" /> Cập nhật
              </button>
            </div>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={10} />
                  <YAxis stroke="#94A3B8" fontSize={10} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="borrow"
                    name="Mượn"
                    stroke="#2563EB"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="ret"
                    name="Trả"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Giao dịch gần đây</h3>
              <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-2">
              {recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100"
                >
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      t.type === 'borrow'
                        ? 'bg-blue-100'
                        : 'bg-emerald-100'
                    }`}
                  >
                    {t.type === 'borrow' ? (
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ fontWeight: 500 }}>
                      {t.reader}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{t.book}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      className={
                        t.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                          : t.status === 'overdue'
                          ? 'bg-red-100 text-red-700 hover:bg-red-100'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }
                    >
                      {t.status === 'completed' ? 'Đã trả' : t.status === 'overdue' ? 'Quá hạn' : 'Đang mượn'}
                    </Badge>
                    <p className="text-[11px] text-gray-400 mt-1">{t.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
