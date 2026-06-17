import { Link } from 'react-router';
import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, QrCode, Archive, Upload, FileBarChart } from 'lucide-react';

type Copy = {
  id: string;
  bookTitle: string;
  barcode: string;
  location: string;
  condition: 'good' | 'light' | 'heavy';
  status: 'available' | 'borrowed' | 'reserved' | 'lost';
  acquired: string;
};

const COPIES: Copy[] = [
  { id: 'CP-1001', bookTitle: 'Đắc Nhân Tâm', barcode: 'LIB-001-01', location: 'Kệ A-12', condition: 'good', status: 'available', acquired: '2024-03-15' },
  { id: 'CP-1002', bookTitle: 'Đắc Nhân Tâm', barcode: 'LIB-001-02', location: 'Kệ A-12', condition: 'good', status: 'borrowed', acquired: '2024-03-15' },
  { id: 'CP-1003', bookTitle: 'Nhà Giả Kim', barcode: 'LIB-002-01', location: 'Kệ B-04', condition: 'light', status: 'available', acquired: '2023-11-08' },
  { id: 'CP-1004', bookTitle: 'Sapiens', barcode: 'LIB-003-01', location: 'Kệ C-22', condition: 'good', status: 'reserved', acquired: '2024-01-20' },
  { id: 'CP-1005', bookTitle: 'Tuổi Trẻ Đáng Giá', barcode: 'LIB-004-01', location: 'Kệ A-15', condition: 'heavy', status: 'available', acquired: '2022-06-30' },
  { id: 'CP-1006', bookTitle: 'Cây Cam Ngọt Của Tôi', barcode: 'LIB-005-01', location: 'Kệ B-18', condition: 'good', status: 'lost', acquired: '2023-09-12' },
];

const COND: Record<Copy['condition'], { label: string; cls: string }> = {
  good: { label: 'Tốt', cls: 'bg-emerald-100 text-emerald-700' },
  light: { label: 'Hư nhẹ', cls: 'bg-amber-100 text-amber-700' },
  heavy: { label: 'Hư nặng', cls: 'bg-orange-100 text-orange-700' },
};
const STATUS: Record<Copy['status'], { label: string; cls: string }> = {
  available: { label: 'Có sẵn', cls: 'bg-emerald-100 text-emerald-700' },
  borrowed: { label: 'Đang mượn', cls: 'bg-blue-100 text-blue-700' },
  reserved: { label: 'Đặt trước', cls: 'bg-amber-100 text-amber-700' },
  lost: { label: 'Mất', cls: 'bg-red-100 text-red-700' },
};

export function InventoryListPage() {
  const [q, setQ] = useState('');
  const filtered = COPIES.filter((c) =>
    [c.bookTitle, c.barcode, c.location].some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Danh sách bản sao</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý từng bản sao vật lý trong kho</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/inventory/import"><Button variant="outline"><Upload className="w-4 h-4 mr-2" /> Import / Thanh lý</Button></Link>
          <Link to="/admin/inventory/report"><Button variant="outline"><FileBarChart className="w-4 h-4 mr-2" /> Báo cáo kho</Button></Link>
          <Link to="/admin/inventory/add"><Button className="bg-[#2563EB] hover:bg-[#1D4ED8]"><Plus className="w-4 h-4 mr-2" /> Thêm bản sao</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {(['available', 'borrowed', 'reserved', 'lost'] as Copy['status'][]).map((k) => (
          <Card key={k}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">{STATUS[k].label}</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>
                {COPIES.filter((c) => c.status === k).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="relative max-w-md mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên sách, barcode, kệ..." className="pl-9" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="py-3 px-2">Mã bản sao</th>
                <th className="py-3 px-2">Tên sách</th>
                <th className="py-3 px-2">Barcode</th>
                <th className="py-3 px-2">Vị trí</th>
                <th className="py-3 px-2">Tình trạng</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2">Ngày nhập</th>
                <th className="py-3 px-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-500">{c.id}</td>
                  <td className="py-3 px-2" style={{ fontWeight: 500 }}>{c.bookTitle}</td>
                  <td className="py-3 px-2 font-mono text-xs">{c.barcode}</td>
                  <td className="py-3 px-2 text-gray-700">{c.location}</td>
                  <td className="py-3 px-2"><Badge className={`${COND[c.condition].cls} hover:${COND[c.condition].cls}`}>{COND[c.condition].label}</Badge></td>
                  <td className="py-3 px-2"><Badge className={`${STATUS[c.status].cls} hover:${STATUS[c.status].cls}`}>{STATUS[c.status].label}</Badge></td>
                  <td className="py-3 px-2 text-gray-500">{c.acquired}</td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><QrCode className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600 ml-1"><Archive className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
