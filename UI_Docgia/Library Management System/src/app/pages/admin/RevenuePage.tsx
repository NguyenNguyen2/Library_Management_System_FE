import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Download, TrendingUp, Banknote, CreditCard, Smartphone, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from 'recharts';

const monthly = [
  { month: 'T1', revenue: 4200000 },
  { month: 'T2', revenue: 3850000 },
  { month: 'T3', revenue: 5120000 },
  { month: 'T4', revenue: 4680000 },
  { month: 'T5', revenue: 5840000 },
  { month: 'T6', revenue: 6320000 },
];

const byMethod = [
  { name: 'Tiền mặt', value: 2840000, color: '#10B981' },
  { name: 'Thẻ', value: 1620000, color: '#2563EB' },
  { name: 'MoMo', value: 1860000, color: '#F59E0B' },
];

const byType = [
  { type: 'Trễ hạn', amount: 3120000 },
  { type: 'Hư hỏng', amount: 1840000 },
  { type: 'Mất sách', amount: 1360000 },
];

const recent = [
  { id: 'PH-5020', date: '2026-06-02', reader: 'Trần Thị Bình', method: 'momo' as const, amount: 40000 },
  { id: 'PH-5019', date: '2026-06-02', reader: 'Phạm Minh Đức', method: 'cash' as const, amount: 24000 },
  { id: 'PH-5016', date: '2026-05-28', reader: 'Đỗ Văn Khải', method: 'card' as const, amount: 36000 },
  { id: 'PH-5014', date: '2026-05-26', reader: 'Lê Hoàng Cường', method: 'momo' as const, amount: 60000 },
  { id: 'PH-5012', date: '2026-05-24', reader: 'Vũ Thanh Mai', method: 'cash' as const, amount: 18000 },
];

const METHOD_ICONS = { cash: Banknote, card: CreditCard, momo: Smartphone };

export function RevenuePage() {
  const total = monthly.reduce((s, m) => s + m.revenue, 0);
  const current = monthly[monthly.length - 1].revenue;
  const prev = monthly[monthly.length - 2].revenue;
  const growth = ((current - prev) / prev * 100).toFixed(1);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Báo cáo doanh thu</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan doanh thu từ phí 6 tháng gần nhất</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Card style={{ borderLeft: '4px solid #2563EB' }}>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase">Tổng 6 tháng</p>
            <p className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>{total.toLocaleString('vi-VN')}đ</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +18% YoY</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #10B981' }}>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase">Tháng này</p>
            <p className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>{current.toLocaleString('vi-VN')}đ</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +{growth}% so với T trước</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #F59E0B' }}>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase">Bình quân / tháng</p>
            <p className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(total / monthly.length).toLocaleString('vi-VN')}đ</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #8B5CF6' }}>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 uppercase">Giao dịch tháng này</p>
            <p className="mt-2" style={{ fontSize: 22, fontWeight: 700 }}>284</p>
            <p className="text-xs text-gray-500 mt-1">~22.000đ / giao dịch</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Doanh thu theo tháng</h3>
                <p className="text-xs text-gray-500 mt-0.5">Tổng phí thu được mỗi tháng</p>
              </div>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">6 tháng</Badge>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v / 1000000}M`} />
                  <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('vi-VN')}đ`} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2.5} fill="url(#grad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Theo phương thức</h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byMethod} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {byMethod.map((e) => <Cell key={e.name} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('vi-VN')}đ`} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Doanh thu theo loại phí</h3>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={byType} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                  <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `${v / 1000000}M`} />
                  <YAxis type="category" dataKey="type" stroke="#94A3B8" fontSize={11} width={80} />
                  <Tooltip formatter={(v: any) => `${Number(v).toLocaleString('vi-VN')}đ`} />
                  <Bar dataKey="amount" fill="#10B981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Giao dịch gần đây</h3>
            <div className="space-y-2">
              {recent.map((r) => {
                const Icon = METHOD_ICONS[r.method];
                return (
                  <div key={r.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" style={{ fontWeight: 500 }}>{r.reader}</p>
                      <p className="text-xs text-gray-500">{r.id} · {r.date}</p>
                    </div>
                    <p className="text-emerald-600" style={{ fontWeight: 600 }}>+{r.amount.toLocaleString('vi-VN')}đ</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
