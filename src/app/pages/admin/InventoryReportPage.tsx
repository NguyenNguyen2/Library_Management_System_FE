import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Download, Archive, AlertTriangle, Package, TrendingDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const byCategory = [
  { name: 'Tiểu thuyết', count: 287 },
  { name: 'Kỹ năng', count: 124 },
  { name: 'Thiếu nhi', count: 152 },
  { name: 'Lịch sử', count: 96 },
  { name: 'Khoa học', count: 78 },
  { name: 'Kinh tế', count: 64 },
];

const conditionData = [
  { name: 'Tốt', value: 8420, color: '#10B981' },
  { name: 'Hư nhẹ', value: 312, color: '#F59E0B' },
  { name: 'Hư nặng', value: 87, color: '#EF4444' },
  { name: 'Mất', value: 42, color: '#6B7280' },
];

const lowStock = [
  { title: 'Atomic Habits', remaining: 0, total: 4, location: 'Kệ A-08' },
  { title: 'Mắt Biếc', remaining: 1, total: 9, location: 'Kệ B-12' },
  { title: 'Tôi Tài Giỏi Bạn Cũng Thế', remaining: 0, total: 7, location: 'Kệ A-15' },
  { title: 'Sapiens', remaining: 1, total: 6, location: 'Kệ C-22' },
];

export function InventoryReportPage() {
  const total = conditionData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="max-w-[1400px] mx-auto">
      <Link to="/admin/inventory" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bản sao
      </Link>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Báo cáo kho</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng quan tình trạng kho và sách sắp hết</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất PDF</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Package className="w-8 h-8 text-blue-600 bg-blue-50 p-1.5 rounded-lg" />
          <div><p className="text-xs text-gray-500">Tổng bản sao</p><p style={{ fontSize: 22, fontWeight: 700 }}>{total.toLocaleString('vi-VN')}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <Archive className="w-8 h-8 text-emerald-600 bg-emerald-50 p-1.5 rounded-lg" />
          <div><p className="text-xs text-gray-500">Tình trạng tốt</p><p className="text-emerald-600" style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(conditionData[0].value / total * 100)}%</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-amber-600 bg-amber-50 p-1.5 rounded-lg" />
          <div><p className="text-xs text-gray-500">Cần xử lý</p><p className="text-amber-600" style={{ fontSize: 22, fontWeight: 700 }}>{conditionData[1].value + conditionData[2].value}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-red-600 bg-red-50 p-1.5 rounded-lg" />
          <div><p className="text-xs text-gray-500">Mất / Thất thoát</p><p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>{conditionData[3].value}</p></div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card><CardContent className="p-5">
          <h3 className="mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Phân bổ theo thể loại</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>

        <Card><CardContent className="p-5">
          <h3 className="mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Tình trạng bản sao</h3>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={conditionData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {conditionData.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent></Card>
      </div>

      <Card><CardContent className="p-5">
        <h3 className="mb-4" style={{ fontSize: 16, fontWeight: 600 }}>Sách sắp hết — Cần bổ sung</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase border-b">
              <th className="py-3 px-2">Tên sách</th>
              <th className="py-3 px-2">Vị trí</th>
              <th className="py-3 px-2 text-center">Còn / Tổng</th>
              <th className="py-3 px-2">Trạng thái</th>
              <th className="py-3 px-2 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {lowStock.map((s) => (
              <tr key={s.title} className="border-b hover:bg-gray-50">
                <td className="py-3 px-2" style={{ fontWeight: 500 }}>{s.title}</td>
                <td className="py-3 px-2 text-gray-700">{s.location}</td>
                <td className="py-3 px-2 text-center">{s.remaining} / {s.total}</td>
                <td className="py-3 px-2">
                  {s.remaining === 0
                    ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Hết sạch</Badge>
                    : <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Sắp hết</Badge>}
                </td>
                <td className="py-3 px-2 text-right">
                  <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8]">Đặt bổ sung</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </div>
  );
}
