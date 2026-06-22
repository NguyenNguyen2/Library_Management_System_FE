import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Mail, Lock, UserCheck, Crown, AlertTriangle } from 'lucide-react';

type Reader = {
  id: string;
  name: string;
  email: string;
  card: 'regular' | 'premium';
  borrowing: number;
  overdue: number;
  joined: string;
  status: 'active' | 'suspended';
};

const READERS: Reader[] = [
  { id: 'RD-1024', name: 'Nguyễn Văn An', email: 'an.nv@gmail.com', card: 'regular', borrowing: 2, overdue: 1, joined: '2024-01-15', status: 'active' },
  { id: 'RD-1025', name: 'Trần Thị Bình', email: 'binh.tt@gmail.com', card: 'premium', borrowing: 5, overdue: 0, joined: '2023-08-22', status: 'active' },
  { id: 'RD-1026', name: 'Phạm Minh Đức', email: 'duc.pm@gmail.com', card: 'regular', borrowing: 1, overdue: 2, joined: '2024-03-10', status: 'suspended' },
  { id: 'RD-1027', name: 'Lê Hoàng Cường', email: 'cuong.lh@gmail.com', card: 'premium', borrowing: 3, overdue: 0, joined: '2022-11-04', status: 'active' },
  { id: 'RD-1028', name: 'Vũ Thanh Mai', email: 'mai.vt@gmail.com', card: 'regular', borrowing: 0, overdue: 0, joined: '2025-02-18', status: 'active' },
  { id: 'RD-1029', name: 'Đỗ Văn Khải', email: 'khai.dv@gmail.com', card: 'regular', borrowing: 2, overdue: 1, joined: '2024-09-30', status: 'active' },
];

export function ReadersPage() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | Reader['card']>('all');

  const filtered = READERS.filter((r) =>
    (filter === 'all' || r.card === filter) &&
    [r.name, r.email, r.id].some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Quản lý độc giả</h1>
          <p className="text-sm text-gray-500 mt-1">Cấp thẻ, theo dõi và đình chỉ tài khoản độc giả</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]"><Plus className="w-4 h-4 mr-2" /> Thêm độc giả</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Tổng độc giả</p><p style={{ fontSize: 22, fontWeight: 700 }}>{READERS.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Thẻ Premium</p><p className="text-amber-600" style={{ fontSize: 22, fontWeight: 700 }}>{READERS.filter((r) => r.card === 'premium').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Đang đình chỉ</p><p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>{READERS.filter((r) => r.status === 'suspended').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500">Có quá hạn</p><p className="text-amber-600" style={{ fontSize: 22, fontWeight: 700 }}>{READERS.filter((r) => r.overdue > 0).length}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm độc giả, email, mã..." className="pl-9" />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'regular', 'premium'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-3 py-1.5 rounded-md text-sm ${filter === k ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {k === 'all' ? 'Tất cả' : k === 'regular' ? 'Thường' : 'Premium'}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="py-3 px-2">Mã thẻ</th>
                <th className="py-3 px-2">Độc giả</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2">Loại thẻ</th>
                <th className="py-3 px-2 text-center">Đang mượn</th>
                <th className="py-3 px-2 text-center">Quá hạn</th>
                <th className="py-3 px-2">Trạng thái</th>
                <th className="py-3 px-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2 text-gray-500 font-mono text-xs">{r.id}</td>
                  <td className="py-3 px-2" style={{ fontWeight: 500 }}>{r.name}</td>
                  <td className="py-3 px-2 text-gray-700">{r.email}</td>
                  <td className="py-3 px-2">
                    {r.card === 'premium' ? (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Crown className="w-3 h-3 mr-1" /> Premium</Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Thường</Badge>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">{r.borrowing}</td>
                  <td className="py-3 px-2 text-center">
                    {r.overdue > 0 ? (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> {r.overdue}</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {r.status === 'active'
                      ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><UserCheck className="w-3 h-3 mr-1" /> Hoạt động</Badge>
                      : <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><Lock className="w-3 h-3 mr-1" /> Đình chỉ</Badge>}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Mail className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-amber-50 rounded text-amber-600 ml-1"><Lock className="w-4 h-4" /></button>
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
