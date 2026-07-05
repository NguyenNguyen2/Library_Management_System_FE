import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Download, ArrowLeftRight, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

type Tx = {
  id: string;
  date: string;
  type: 'borrow' | 'return' | 'renewal';
  reader: string;
  book: string;
  librarian: string;
  status: 'on_time' | 'late' | 'in_progress';
  fee?: number;
};

const TX: Tx[] = [
  { id: 'GD-2841', date: '2026-06-03 14:32', type: 'borrow', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', librarian: 'Lê Thị Hoa', status: 'in_progress' },
  { id: 'GD-2840', date: '2026-06-03 13:18', type: 'return', reader: 'Trần Thị Bình', book: 'Sapiens', librarian: 'Lê Thị Hoa', status: 'late', fee: 40000 },
  { id: 'GD-2839', date: '2026-06-03 11:42', type: 'renewal', reader: 'Phạm Minh Đức', book: 'Atomic Habits', librarian: 'Nguyễn Văn Long', status: 'on_time' },
  { id: 'GD-2838', date: '2026-06-03 10:05', type: 'return', reader: 'Vũ Thanh Mai', book: 'Nhà Giả Kim', librarian: 'Lê Thị Hoa', status: 'on_time' },
  { id: 'GD-2837', date: '2026-06-02 16:50', type: 'borrow', reader: 'Lê Hoàng Cường', book: 'Tuổi Trẻ Đáng Giá', librarian: 'Nguyễn Văn Long', status: 'in_progress' },
  { id: 'GD-2836', date: '2026-06-02 15:22', type: 'return', reader: 'Đỗ Văn Khải', book: 'Mắt Biếc', librarian: 'Lê Thị Hoa', status: 'late', fee: 25000 },
];

const TYPE_MAP = {
  borrow: { label: 'Mượn', cls: 'bg-blue-100 text-blue-700', icon: ArrowUpFromLine },
  return: { label: 'Trả', cls: 'bg-emerald-100 text-emerald-700', icon: ArrowDownToLine },
  renewal: { label: 'Gia hạn', cls: 'bg-amber-100 text-amber-700', icon: ArrowLeftRight },
} as const;

export function TransactionHistoryPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | Tx['type']>('all');
  const filtered = TX.filter((t) =>
    (filter === 'all' || t.type === filter) &&
    [t.id, t.reader, t.book].some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Lịch sử giao dịch</h1>
          <p className="text-sm text-gray-500 mt-1">Toàn bộ giao dịch mượn / trả / gia hạn</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất CSV</Button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã, độc giả, sách..." className="pl-9" />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'borrow', 'return', 'renewal'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 rounded-md text-sm ${filter === k ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {k === 'all' ? 'Tất cả' : TYPE_MAP[k].label}
                </button>
              ))}
            </div>
            <Input type="date" className="w-44 ml-auto" />
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="py-3 px-2">Mã GD</th>
                <th className="py-3 px-2">Thời gian</th>
                <th className="py-3 px-2">Loại</th>
                <th className="py-3 px-2">Độc giả</th>
                <th className="py-3 px-2">Sách</th>
                <th className="py-3 px-2">Thủ thư</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2 text-right">Phí</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const T = TYPE_MAP[t.type];
                const Icon = T.icon;
                return (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-500">{t.id}</td>
                    <td className="py-3 px-2 text-gray-700">{t.date}</td>
                    <td className="py-3 px-2">
                      <Badge className={`${T.cls} hover:${T.cls}`}><Icon className="w-3 h-3 mr-1" /> {T.label}</Badge>
                    </td>
                    <td className="py-3 px-2" style={{ fontWeight: 500 }}>{t.reader}</td>
                    <td className="py-3 px-2">{t.book}</td>
                    <td className="py-3 px-2 text-gray-700">{t.librarian}</td>
                    <td className="py-3 px-2">
                      {t.status === 'on_time' && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đúng hạn</Badge>}
                      {t.status === 'late' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Trễ hạn</Badge>}
                      {t.status === 'in_progress' && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đang mượn</Badge>}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {t.fee ? <span className="text-red-600" style={{ fontWeight: 600 }}>{t.fee.toLocaleString('vi-VN')}đ</span> : <span className="text-gray-400">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
