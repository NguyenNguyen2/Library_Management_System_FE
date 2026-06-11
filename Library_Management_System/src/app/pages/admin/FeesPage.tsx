import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, CreditCard, Banknote, Smartphone, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Fee = {
  id: string;
  reader: string;
  book: string;
  type: 'late' | 'damage' | 'lost';
  amount: number;
  createdAt: string;
  status: 'unpaid' | 'paid' | 'partial';
  method?: 'cash' | 'card' | 'momo';
};

const FEES: Fee[] = [
  { id: 'PH-5021', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', type: 'late', amount: 60000, createdAt: '2026-06-01', status: 'unpaid' },
  { id: 'PH-5020', reader: 'Trần Thị Bình', book: 'Sapiens', type: 'late', amount: 40000, createdAt: '2026-06-02', status: 'paid', method: 'momo' },
  { id: 'PH-5019', reader: 'Phạm Minh Đức', book: 'Tuổi Trẻ Đáng Giá', type: 'damage', amount: 24000, createdAt: '2026-06-02', status: 'paid', method: 'cash' },
  { id: 'PH-5018', reader: 'Lê Hoàng Cường', book: 'Nhà Giả Kim', type: 'lost', amount: 120000, createdAt: '2026-05-30', status: 'partial' },
  { id: 'PH-5017', reader: 'Vũ Thanh Mai', book: 'Cây Cam Ngọt Của Tôi', type: 'late', amount: 15000, createdAt: '2026-05-29', status: 'unpaid' },
  { id: 'PH-5016', reader: 'Đỗ Văn Khải', book: 'Mắt Biếc', type: 'damage', amount: 36000, createdAt: '2026-05-28', status: 'paid', method: 'card' },
];

const TYPE = {
  late: { label: 'Trễ hạn', cls: 'bg-amber-100 text-amber-700' },
  damage: { label: 'Hư hỏng', cls: 'bg-orange-100 text-orange-700' },
  lost: { label: 'Mất sách', cls: 'bg-red-100 text-red-700' },
} as const;

const METHOD = {
  cash: { label: 'Tiền mặt', icon: Banknote },
  card: { label: 'Thẻ', icon: CreditCard },
  momo: { label: 'MoMo', icon: Smartphone },
} as const;

export function FeesPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | Fee['status']>('all');

  const filtered = FEES.filter((f) =>
    (filter === 'all' || f.status === filter) &&
    [f.id, f.reader, f.book].some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  const unpaid = FEES.filter((f) => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);
  const collected = FEES.filter((f) => f.status === 'paid').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>Danh sách phí</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi và thu phí trễ hạn, hư hỏng, mất sách</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Tổng phí phát sinh</p>
          <p style={{ fontSize: 22, fontWeight: 700 }}>{FEES.reduce((s, f) => s + f.amount, 0).toLocaleString('vi-VN')}đ</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Đã thu</p>
          <p className="text-emerald-600" style={{ fontSize: 22, fontWeight: 700 }}>{collected.toLocaleString('vi-VN')}đ</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Chưa thu</p>
          <p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>{unpaid.toLocaleString('vi-VN')}đ</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-gray-500">Tỷ lệ thu</p>
          <p className="text-blue-600" style={{ fontSize: 22, fontWeight: 700 }}>{Math.round(collected / (collected + unpaid) * 100)}%</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã, độc giả, sách..." className="pl-9" />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'unpaid', 'partial', 'paid'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 rounded-md text-sm ${filter === k ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {k === 'all' ? 'Tất cả' : k === 'unpaid' ? 'Chưa thu' : k === 'partial' ? 'Trả 1 phần' : 'Đã thu'}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="py-3 px-2">Mã phí</th>
                <th className="py-3 px-2">Độc giả</th>
                <th className="py-3 px-2">Sách</th>
                <th className="py-3 px-2">Loại phí</th>
                <th className="py-3 px-2 text-right">Số tiền</th>
                <th className="py-3 px-2">Ngày phát sinh</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const T = TYPE[f.type];
                return (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-500 font-mono text-xs">{f.id}</td>
                    <td className="py-3 px-2" style={{ fontWeight: 500 }}>{f.reader}</td>
                    <td className="py-3 px-2 text-gray-700">{f.book}</td>
                    <td className="py-3 px-2"><Badge className={`${T.cls} hover:${T.cls}`}>{T.label}</Badge></td>
                    <td className="py-3 px-2 text-right" style={{ fontWeight: 600 }}>{f.amount.toLocaleString('vi-VN')}đ</td>
                    <td className="py-3 px-2 text-gray-500">{f.createdAt}</td>
                    <td className="py-3 px-2">
                      {f.status === 'paid' && f.method && (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> {METHOD[f.method].label}
                        </Badge>
                      )}
                      {f.status === 'partial' && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Clock className="w-3 h-3 mr-1" /> Trả 1 phần</Badge>
                      )}
                      {f.status === 'unpaid' && (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> Chưa thu</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {f.status !== 'paid' ? (
                        <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={() => toast.success(`Đã thu ${f.amount.toLocaleString('vi-VN')}đ`)}>
                          Thu phí
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">Biên lai</Button>
                      )}
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
