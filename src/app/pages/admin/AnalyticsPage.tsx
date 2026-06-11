import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockBooks, mockReaders } from '../../lib/mockData';
import {
  FileSpreadsheet,
  FileDown,
  TrendingUp,
  AlertTriangle,
  Users,
  BookOpen,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

const forecastData = [
  { month: 'T1', actual: 320, forecast: 310 },
  { month: 'T2', actual: 380, forecast: 360 },
  { month: 'T3', actual: 410, forecast: 420 },
  { month: 'T4', actual: 450, forecast: 460 },
  { month: 'T5', actual: 510, forecast: 520 },
  { month: 'T6', actual: 0, forecast: 580 },
  { month: 'T7', actual: 0, forecast: 640 },
  { month: 'T8', actual: 0, forecast: 720 },
];

const topBooksData = mockBooks.slice(0, 10).map((b) => ({
  name: b.title.length > 18 ? b.title.slice(0, 18) + '…' : b.title,
  borrows: b.borrowCount || Math.floor(Math.random() * 80) + 20,
}));

const overdueList = [
  { reader: 'Nguyễn Văn A', book: 'Đắc Nhân Tâm', days: 12, fine: 60000 },
  { reader: 'Trần Thị B', book: 'Nhà Giả Kim', days: 8, fine: 40000 },
  { reader: 'Lê Minh C', book: 'Sapiens', days: 5, fine: 25000 },
  { reader: 'Phạm Hoa D', book: 'Atomic Habits', days: 3, fine: 15000 },
];

export function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl">Báo cáo & AI Insights</h1>
          <p className="text-gray-600 text-sm">Thống kê hoạt động & dự đoán xu hướng</p>
        </div>
        <div className="flex gap-2">
          <select className="h-10 border rounded-md px-3 text-sm">
            <option>Tháng này</option>
            <option>Quý này</option>
            <option>Năm nay</option>
          </select>
          <Button variant="outline">
            <FileSpreadsheet className="w-4 h-4 mr-1" /> Xuất Excel
          </Button>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-1" /> Xuất PDF
          </Button>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Tổng giao dịch</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-3xl">1.248</p>
            <p className="text-xs text-emerald-600 mt-1">▲ 12% so với tháng trước</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Độc giả hoạt động</span>
              <Users className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl">{mockReaders.length * 28}</p>
            <p className="text-xs text-emerald-600 mt-1">▲ 8 độc giả mới</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Sách trễ hạn</span>
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-3xl">{overdueList.length}</p>
            <p className="text-xs text-red-600 mt-1">Phí tích lũy 140.000đ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Top sách mượn</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl">10</p>
            <p className="text-xs text-gray-500 mt-1">Đầu sách trong bảng</p>
          </CardContent>
        </Card>
      </div>

      {/* Two charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 sách được mượn</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topBooksData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis type="category" dataKey="name" width={120} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="borrows" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách sách trễ hạn</span>
              <Badge variant="outline" className="text-red-600 border-red-200">
                {overdueList.length} bản
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueList.map((o, i) => (
                <div key={i} className="flex items-center justify-between border-b last:border-0 py-2">
                  <div>
                    <p className="text-sm">{o.reader}</p>
                    <p className="text-xs text-gray-500">{o.book}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-red-600">{o.fine.toLocaleString()}đ</p>
                    <p className="text-xs text-gray-500">Trễ {o.days} ngày</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights center */}
      <Card className="relative overflow-hidden border-purple-200">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pointer-events-none" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Trung tâm AI Insights
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">GPT-4o</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-5">
          {/* AI Summary */}
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm">Tóm tắt AI</span>
            </div>
            <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
              <li>Lượt mượn tăng <strong>12%</strong> tháng này, chủ yếu vào cuối tuần (T6-T7).</li>
              <li>Thể loại <strong>Kỹ năng sống</strong> và <strong>Tâm lý</strong> đang dẫn đầu nhu cầu.</li>
              <li>Cảnh báo: tỷ lệ trễ hạn nhóm <strong>thẻ thường</strong> tăng 4% — cân nhắc gửi nhắc nhở sớm hơn.</li>
              <li>Đề xuất bổ sung 3 đầu sách mới trong wishlist với &gt;15 lượt yêu cầu.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* AI suggestions */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
              <p className="text-sm mb-3">Gợi ý sách nên bổ sung</p>
              <table className="w-full text-sm">
                <thead className="text-xs text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-2">Sách</th>
                    <th className="text-right py-2">Lượt tìm</th>
                    <th className="text-right py-2">Wishlist</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { t: 'Lược Sử Tương Lai', s: 84, w: 21 },
                    { t: 'Tâm Lý Học Đám Đông', s: 72, w: 18 },
                    { t: 'Cây Cam Ngọt Của Tôi', s: 65, w: 17 },
                    { t: 'Tư Duy Nhanh và Chậm', s: 58, w: 14 },
                  ].map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2">{r.t}</td>
                      <td className="text-right text-gray-600">{r.s}</td>
                      <td className="text-right text-purple-600">{r.w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Seasonal forecast */}
            <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-purple-100">
              <p className="text-sm mb-2">Dự báo nhu cầu mượn 3 tháng tới</p>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" name="Thực tế" stroke="#2563eb" strokeWidth={2} />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Dự báo"
                      stroke="#a855f7"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
