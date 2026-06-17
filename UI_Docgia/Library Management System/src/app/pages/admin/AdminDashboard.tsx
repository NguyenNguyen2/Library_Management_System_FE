import { useAuth } from '../../contexts/AuthContext';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const trendData = Array.from({ length: 30 }).map((_, i) => {
  const day = i + 1;
  const borrow = 20 + Math.round(Math.sin(i / 3) * 8 + Math.random() * 6);
  const ret = 15 + Math.round(Math.cos(i / 4) * 6 + Math.random() * 5);
  return { day: `${day}`, borrow, return: ret };
});

const inventoryData = [
  { name: 'Có sẵn', value: 8420, color: '#10B981' },
  { name: 'Đang mượn', value: 2156, color: '#3B82F6' },
  { name: 'Đã đặt trước', value: 312, color: '#F59E0B' },
  { name: 'Hỏng / Mất', value: 87, color: '#EF4444' },
];

const topBooks = [
  { rank: 1, title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', borrows: 142 },
  { rank: 2, title: 'Nhà Giả Kim', author: 'Paulo Coelho', borrows: 128 },
  { rank: 3, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn', borrows: 117 },
  { rank: 4, title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari', borrows: 98 },
  { rank: 5, title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro de Vasconcelos', borrows: 89 },
];

const overdueList = [
  { id: 'GD-2841', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', days: 12, fee: 60000 },
  { id: 'GD-2837', reader: 'Trần Thị Bình', book: 'Sapiens', days: 8, fee: 40000 },
  { id: 'GD-2829', reader: 'Lê Hoàng Cường', book: 'Nhà Giả Kim', days: 5, fee: 25000 },
  { id: 'GD-2814', reader: 'Phạm Minh Đức', book: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', days: 3, fee: 15000 },
];

export function AdminDashboard() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalInventory = inventoryData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>
            Xin chào, {user?.name ?? 'Admin'} 👋
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tổng đầu sách</p>
                <p className="mt-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  12,847
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +124 tháng này
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
                <p className="text-xs text-gray-500 uppercase tracking-wide">Độc giả đang mượn</p>
                <p className="mt-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  1,532
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +8.2% so với tuần trước
                </p>
              </div>
              <div className="bg-emerald-50 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-[#10B981]" />
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
                  47
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

        <Card style={{ borderLeft: '4px solid #8B5CF6' }}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Lượt mượn tháng</p>
                <p className="mt-2" style={{ fontSize: 28, fontWeight: 700 }}>
                  3,284
                </p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> +12.4% so với tháng trước
                </p>
              </div>
              <div className="bg-purple-50 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
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
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Lượt mượn & trả 30 ngày qua</h3>
                <p className="text-xs text-gray-500 mt-0.5">Theo dõi hoạt động giao dịch hàng ngày</p>
              </div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">30 ngày</Badge>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="borrow"
                    name="Mượn"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="return"
                    name="Trả"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Trạng thái kho bản sao</h3>
            <p className="text-xs text-gray-500 mt-0.5 mb-3">Tổng {totalInventory.toLocaleString('vi-VN')} bản</p>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                  >
                    {inventoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {inventoryData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                    <span className="text-gray-700">{d.name}</span>
                  </div>
                  <span className="text-gray-900" style={{ fontWeight: 600 }}>
                    {d.value.toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Top 5 sách được mượn</h3>
              <button className="text-xs text-blue-600 hover:underline">Xem tất cả</button>
            </div>
            <div className="space-y-2">
              {topBooks.map((b) => (
                <div
                  key={b.rank}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50"
                >
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center text-xs ${
                      b.rank === 1
                        ? 'bg-amber-100 text-amber-700'
                        : b.rank === 2
                        ? 'bg-gray-200 text-gray-700'
                        : b.rank === 3
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}
                    style={{ fontWeight: 700 }}
                  >
                    {b.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ fontWeight: 500 }}>
                      {b.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{b.author}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm" style={{ fontWeight: 600 }}>
                      {b.borrows}
                    </p>
                    <p className="text-xs text-gray-500">lượt</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Giao dịch quá hạn cần xử lý</h3>
              </div>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{overdueList.length}</Badge>
            </div>
            <div className="space-y-2">
              {overdueList.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/60 border border-amber-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{o.id}</span>
                      <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded">
                        Quá {o.days} ngày
                      </span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ fontWeight: 500 }}>
                      {o.reader}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{o.book}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600" style={{ fontWeight: 600 }}>
                      {o.fee.toLocaleString('vi-VN')}đ
                    </p>
                    <button className="text-xs text-blue-600 hover:underline mt-0.5">Liên hệ</button>
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
