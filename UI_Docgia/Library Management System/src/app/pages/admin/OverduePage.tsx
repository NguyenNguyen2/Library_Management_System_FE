import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Mail, Phone, AlertTriangle, Download, Send } from 'lucide-react';
import { toast } from 'sonner';

type Overdue = {
  id: string;
  reader: string;
  phone: string;
  email: string;
  book: string;
  borrowedAt: string;
  dueAt: string;
  days: number;
  fee: number;
  contacted: boolean;
};

const LIST: Overdue[] = [
  { id: 'GD-2841', reader: 'Nguyễn Văn An', phone: '0901 234 567', email: 'an.nv@gmail.com', book: 'Đắc Nhân Tâm', borrowedAt: '2026-05-08', dueAt: '2026-05-22', days: 12, fee: 60000, contacted: false },
  { id: 'GD-2837', reader: 'Trần Thị Bình', phone: '0912 345 678', email: 'binh.tt@gmail.com', book: 'Sapiens', borrowedAt: '2026-05-13', dueAt: '2026-05-27', days: 8, fee: 40000, contacted: true },
  { id: 'GD-2829', reader: 'Lê Hoàng Cường', phone: '0923 456 789', email: 'cuong.lh@gmail.com', book: 'Nhà Giả Kim', borrowedAt: '2026-05-15', dueAt: '2026-05-29', days: 5, fee: 25000, contacted: false },
  { id: 'GD-2814', reader: 'Phạm Minh Đức', phone: '0934 567 890', email: 'duc.pm@gmail.com', book: 'Tuổi Trẻ Đáng Giá', borrowedAt: '2026-05-17', dueAt: '2026-05-31', days: 3, fee: 15000, contacted: true },
  { id: 'GD-2805', reader: 'Vũ Thanh Mai', phone: '0945 678 901', email: 'mai.vt@gmail.com', book: 'Atomic Habits', borrowedAt: '2026-04-20', dueAt: '2026-05-04', days: 30, fee: 150000, contacted: false },
];

const severity = (d: number) => {
  if (d >= 21) return { label: 'Nghiêm trọng', cls: 'bg-red-100 text-red-700', row: 'bg-red-50/60 border-red-200' };
  if (d >= 7) return { label: 'Cảnh báo', cls: 'bg-orange-100 text-orange-700', row: 'bg-orange-50/40 border-orange-200' };
  return { label: 'Nhẹ', cls: 'bg-amber-100 text-amber-700', row: 'bg-amber-50/40 border-amber-100' };
};

export function OverduePage() {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = LIST.filter((o) =>
    [o.id, o.reader, o.book].some((s) => s.toLowerCase().includes(q.toLowerCase()))
  );

  const toggle = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((i) => i !== id) : [...selected, id]);

  const totalFee = LIST.reduce((s, o) => s + o.fee, 0);
  const critical = LIST.filter((o) => o.days >= 21).length;

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Sách quá hạn</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và liên hệ độc giả có sách quá hạn trả</p>
        </div>
        <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Xuất danh sách</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card style={{ borderLeft: '4px solid #EF4444' }}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Tổng quá hạn</p>
            <p style={{ fontSize: 22, fontWeight: 700 }}>{LIST.length}</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #F97316' }}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Nghiêm trọng (≥21 ngày)</p>
            <p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>{critical}</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #F59E0B' }}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Đã liên hệ</p>
            <p style={{ fontSize: 22, fontWeight: 700 }}>{LIST.filter((o) => o.contacted).length} / {LIST.length}</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #10B981' }}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 uppercase">Phí phát sinh</p>
            <p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>{totalFee.toLocaleString('vi-VN')}đ</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo mã, độc giả, sách..." className="pl-9" />
            </div>
            {selected.length > 0 && (
              <>
                <span className="text-sm text-gray-600">Đã chọn {selected.length}</span>
                <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={() => { toast.success(`Đã gửi nhắc nhở tới ${selected.length} độc giả`); setSelected([]); }}>
                  <Send className="w-4 h-4 mr-2" /> Gửi nhắc nhở hàng loạt
                </Button>
              </>
            )}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="py-3 px-2 w-8">
                  <input
                    type="checkbox"
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelected(e.target.checked ? filtered.map((o) => o.id) : [])}
                  />
                </th>
                <th className="py-3 px-2">Mã GD</th>
                <th className="py-3 px-2">Độc giả</th>
                <th className="py-3 px-2">Liên hệ</th>
                <th className="py-3 px-2">Sách</th>
                <th className="py-3 px-2">Hạn trả</th>
                <th className="py-3 px-2 text-center">Quá hạn</th>
                <th className="py-3 px-2">Mức độ</th>
                <th className="py-3 px-2 text-right">Phí</th>
                <th className="py-3 px-2 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const sev = severity(o.days);
                return (
                  <tr key={o.id} className={`border-b hover:bg-gray-50 ${selected.includes(o.id) ? 'bg-blue-50/40' : ''}`}>
                    <td className="py-3 px-2">
                      <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
                    </td>
                    <td className="py-3 px-2 text-gray-500 font-mono text-xs">{o.id}</td>
                    <td className="py-3 px-2">
                      <p style={{ fontWeight: 500 }}>{o.reader}</p>
                      {o.contacted && <span className="text-xs text-emerald-600">✓ Đã liên hệ</span>}
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-600">
                      <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {o.phone}</div>
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {o.email}</div>
                    </td>
                    <td className="py-3 px-2">{o.book}</td>
                    <td className="py-3 px-2 text-gray-500">{o.dueAt}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{o.days} ngày</Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={`${sev.cls} hover:${sev.cls}`}>
                        <AlertTriangle className="w-3 h-3 mr-1" /> {sev.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-right text-red-600" style={{ fontWeight: 600 }}>
                      {o.fee.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Gửi email"><Mail className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 ml-1" title="Gọi điện"><Phone className="w-4 h-4" /></button>
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
