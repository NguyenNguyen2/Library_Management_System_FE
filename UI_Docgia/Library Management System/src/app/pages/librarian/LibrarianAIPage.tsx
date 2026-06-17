import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Sparkles, TrendingUp, TrendingDown, BarChart2, FileText,
  RefreshCw, Download, CheckCircle2, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';

type Tab = 'suggest' | 'low-demand' | 'forecast' | 'summary';

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: 'suggest', label: 'Gợi ý nhập sách', icon: Sparkles },
  { key: 'low-demand', label: 'Sách ít được mượn', icon: TrendingDown },
  { key: 'forecast', label: 'Dự báo nhu cầu', icon: TrendingUp },
  { key: 'summary', label: 'AI Summary Report', icon: FileText },
];

const SUGGESTIONS = [
  { title: 'Atomic Habits', author: 'James Clear', reason: 'Xu hướng tăng 340% trên mạng xã hội', priority: 'Cao', stock: 0 },
  { title: 'Mindset', author: 'Carol S. Dweck', reason: 'Nhiều độc giả tìm kiếm nhưng không có sách', priority: 'Cao', stock: 1 },
  { title: 'Deep Work', author: 'Cal Newport', reason: 'Sách cùng thể loại "Kỹ năng" đang hot', priority: 'Trung bình', stock: 2 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', reason: 'Xu hướng từ khóa tăng mạnh', priority: 'Trung bình', stock: 0 },
  { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', reason: 'Danh sách đặt trước tăng 5 tuần liên tiếp', priority: 'Cao', stock: 1 },
];

const LOW_DEMAND = [
  { title: 'Lịch Sử Việt Nam Tập 1', category: 'Lịch sử', borrows: 2, lastBorrow: '2025-08-12', copies: 8, suggestion: 'Thanh lý 4 bản' },
  { title: 'Văn Học Dân Gian', category: 'Văn học', borrows: 1, lastBorrow: '2025-10-03', copies: 5, suggestion: 'Thanh lý 3 bản' },
  { title: 'Hóa Học Hữu Cơ Nâng Cao', category: 'Khoa học', borrows: 0, lastBorrow: '2025-06-20', copies: 3, suggestion: 'Thanh lý toàn bộ' },
  { title: 'Giáo Trình Kinh Tế Vĩ Mô', category: 'Kinh tế', borrows: 3, lastBorrow: '2025-11-15', copies: 6, suggestion: 'Thanh lý 2 bản' },
];

const forecastData = [
  { month: 'T7', actual: 3120, forecast: null },
  { month: 'T8', actual: 2980, forecast: null },
  { month: 'T9', actual: 3450, forecast: null },
  { month: 'T10', actual: 3280, forecast: null },
  { month: 'T11', actual: 3810, forecast: null },
  { month: 'T12', actual: 4200, forecast: null },
  { month: 'T1', actual: null, forecast: 4580 },
  { month: 'T2', actual: null, forecast: 3920 },
  { month: 'T3', actual: null, forecast: 4850 },
];

const categoryForecast = [
  { category: 'Kỹ năng sống', current: 124, predicted: 158 },
  { category: 'Tiểu thuyết', current: 287, predicted: 310 },
  { category: 'Thiếu nhi', current: 152, predicted: 189 },
  { category: 'Khoa học', current: 78, predicted: 65 },
  { category: 'Kinh tế', current: 64, predicted: 92 },
];

export function LibrarianAIPage() {
  const [tab, setTab] = useState<Tab>('suggest');
  const [loading, setLoading] = useState(false);

  const runAI = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1200);
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-2.5 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl" style={{ fontWeight: 600 }}>AI Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">Phân tích thông minh hỗ trợ quyết định quản lý thư viện</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runAI} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Đang phân tích...' : 'Cập nhật AI'}
          </Button>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất báo cáo</Button>
        </div>
      </div>

      {/* AI model badge */}
      <div className="flex items-center gap-2 mb-5">
        <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 px-3 py-1">
          <Sparkles className="w-3 h-3 mr-1.5" /> GPT-4o · Cập nhật lúc 09:15 hôm nay
        </Badge>
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Độ chính xác 87%
        </Badge>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                tab === t.key ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Gợi ý nhập sách */}
      {tab === 'suggest' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-4 flex gap-3">
            <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <p className="text-sm text-purple-900">AI phân tích xu hướng tìm kiếm, lịch sử mượn và lượt đặt trước để đề xuất sách cần nhập thêm.</p>
          </div>
          <Card>
            <CardContent className="p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="py-3 px-2">Tên sách</th>
                    <th className="py-3 px-2">Tác giả</th>
                    <th className="py-3 px-2">Lý do AI đề xuất</th>
                    <th className="py-3 px-2">Độ ưu tiên</th>
                    <th className="py-3 px-2 text-center">Tồn kho</th>
                    <th className="py-3 px-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {SUGGESTIONS.map((s, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>{s.title}</td>
                      <td className="py-3 px-2 text-gray-700">{s.author}</td>
                      <td className="py-3 px-2 text-gray-600 text-xs">{s.reason}</td>
                      <td className="py-3 px-2">
                        <Badge className={s.priority === 'Cao' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                          {s.priority}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {s.stock === 0 ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Hết</Badge> : s.stock}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8]">Đặt nhập</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sách ít được mượn */}
      {tab === 'low-demand' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900">AI xác định sách có ít hơn 5 lượt mượn trong 6 tháng qua. Xem xét thanh lý để giải phóng kệ.</p>
          </div>
          <Card>
            <CardContent className="p-5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="py-3 px-2">Tên sách</th>
                    <th className="py-3 px-2">Thể loại</th>
                    <th className="py-3 px-2 text-center">Lượt mượn</th>
                    <th className="py-3 px-2">Lần mượn cuối</th>
                    <th className="py-3 px-2 text-center">Bản sao</th>
                    <th className="py-3 px-2">AI Gợi ý</th>
                    <th className="py-3 px-2 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {LOW_DEMAND.map((s, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>{s.title}</td>
                      <td className="py-3 px-2 text-gray-700">{s.category}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={s.borrows === 0 ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                          {s.borrows}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-500">{s.lastBorrow}</td>
                      <td className="py-3 px-2 text-center">{s.copies}</td>
                      <td className="py-3 px-2 text-xs text-amber-700">{s.suggestion}</td>
                      <td className="py-3 px-2 text-right">
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200">Thanh lý</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dự báo nhu cầu */}
      {tab === 'forecast' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-1" style={{ fontSize: 16, fontWeight: 600 }}>Dự báo lượt mượn</h3>
                <p className="text-xs text-gray-500 mb-4">Thực tế vs Dự báo AI (6 tháng tới)</p>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="actual" name="Thực tế" stroke="#2563EB" strokeWidth={2.5} dot={false} connectNulls={false} />
                      <Line type="monotone" dataKey="forecast" name="Dự báo" stroke="#8B5CF6" strokeWidth={2.5} strokeDasharray="6 3" dot={false} connectNulls={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-1" style={{ fontSize: 16, fontWeight: 600 }}>Nhu cầu theo thể loại</h3>
                <p className="text-xs text-gray-500 mb-4">So sánh hiện tại vs dự báo quý tới</p>
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={categoryForecast} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                      <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                      <YAxis type="category" dataKey="category" stroke="#94A3B8" fontSize={10} width={90} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="current" name="Hiện tại" fill="#2563EB" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="predicted" name="Dự báo" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="p-5">
              <h3 className="mb-3" style={{ fontSize: 16, fontWeight: 600 }}>Nhận định AI</h3>
              <div className="space-y-2">
                {[
                  { icon: ArrowUpRight, color: 'text-emerald-600 bg-emerald-50', text: 'Lượt mượn quý 1/2027 dự báo tăng 12% — cần nhập thêm sách kỹ năng sống và thiếu nhi trước tháng 12.' },
                  { icon: TrendingDown, color: 'text-amber-600 bg-amber-50', text: 'Nhu cầu sách khoa học giảm 17% — xem xét giảm số bản sao thể loại này trong lần nhập tiếp theo.' },
                  { icon: Sparkles, color: 'text-purple-600 bg-purple-50', text: 'Sách kinh tế có xu hướng tăng đột biến vào tháng 2-3 hàng năm — đặt hàng trước để đảm bảo đủ kho.' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className={`p-1.5 rounded-md shrink-0 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Summary Report */}
      {tab === 'summary' && (
        <div className="space-y-5">
          <Card className="border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 style={{ fontSize: 16, fontWeight: 600 }}>AI Summary — Tháng 6/2026</h3>
                </div>
                <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" /> Tải PDF</Button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-5 mb-5">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Tóm tắt AI:</strong> Thư viện ghi nhận <strong>3.284 lượt mượn</strong> trong tháng, tăng 12,4% so với tháng trước. Thể loại Kỹ năng sống và Tiểu thuyết tiếp tục dẫn đầu. Có <strong>47 sách quá hạn</strong> cần xử lý khẩn. Doanh thu phí đạt <strong>6.320.000đ</strong>, cao nhất trong 6 tháng. AI đề xuất nhập thêm 5 đầu sách mới và thanh lý 12 bản sao ít mượn.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: 'Điểm nổi bật', icon: CheckCircle2, color: 'text-emerald-600',
                    items: ['Lượt mượn tăng 12,4% so với tháng trước', 'Tỷ lệ trả đúng hạn đạt 82%', 'Doanh thu phí tăng 8,2%', '15 độc giả mới đăng ký thẻ Premium'],
                  },
                  {
                    title: 'Cần chú ý', icon: AlertTriangle, color: 'text-amber-600',
                    items: ['47 sách quá hạn chưa xử lý', '3 sách bị mất, cần thanh lý', 'Kho thể loại Thiếu nhi gần hết', '12 bản sao có tình trạng hư hỏng'],
                  },
                  {
                    title: 'Đề xuất AI', icon: Sparkles, color: 'text-purple-600',
                    items: ['Nhập thêm Atomic Habits, Mindset, Deep Work', 'Thanh lý 4 sách Lịch sử có 0-2 lượt mượn', 'Gửi nhắc nhở email cho 47 độc giả quá hạn', 'Mở rộng kệ sách thể loại Kỹ năng sống'],
                  },
                  {
                    title: 'Dự báo tháng tới', icon: TrendingUp, color: 'text-blue-600',
                    items: ['Lượt mượn dự báo tăng ~8%', 'Cao điểm mượn: tuần 2 tháng 7', 'Nhu cầu sách Kinh tế tăng mạnh', 'Doanh thu phí ước đạt 6.8-7.2 triệu'],
                  },
                ].map((block, i) => {
                  const Icon = block.icon;
                  return (
                    <div key={i} className="border rounded-xl p-4">
                      <div className={`flex items-center gap-2 mb-3 ${block.color}`}>
                        <Icon className="w-4 h-4" />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>{block.title}</p>
                      </div>
                      <ul className="space-y-1.5">
                        {block.items.map((item, j) => (
                          <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-gray-400 mt-1">•</span> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
