import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Clock, RefreshCw, CheckCircle2, X, Bell } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'renewals' | 'reservations';

const RENEWALS = [
  { id: 'GH-2104', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', currentDue: '2026-06-10', requested: '2026-06-08', renewalsUsed: 0 },
  { id: 'GH-2105', reader: 'Trần Thị Bình', book: 'Sapiens', currentDue: '2026-06-12', requested: '2026-06-09', renewalsUsed: 1 },
  { id: 'GH-2106', reader: 'Phạm Quốc Hùng', book: 'Atomic Habits', currentDue: '2026-06-15', requested: '2026-06-11', renewalsUsed: 2 },
];

const RESERVATIONS = [
  { id: 'DT-3201', reader: 'Lê Hoàng Cường', book: 'Nhà Giả Kim', reservedAt: '2026-06-01', queue: 1, expectedReady: '2026-06-05' },
  { id: 'DT-3202', reader: 'Vũ Thanh Mai', book: 'Nhà Giả Kim', reservedAt: '2026-06-02', queue: 2, expectedReady: '2026-06-15' },
  { id: 'DT-3203', reader: 'Đỗ Văn Khải', book: 'Mắt Biếc', reservedAt: '2026-06-03', queue: 1, expectedReady: 'Sẵn sàng' },
];

export function ReservationsPage() {
  const [tab, setTab] = useState<Tab>('renewals');

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>Gia hạn & Đặt trước</h1>
        <p className="text-sm text-gray-500 mt-1">Xử lý yêu cầu gia hạn và quản lý hàng chờ đặt trước</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('renewals')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === 'renewals' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <RefreshCw className="w-4 h-4" /> Yêu cầu gia hạn ({RENEWALS.length})
        </button>
        <button
          onClick={() => setTab('reservations')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === 'reservations' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Clock className="w-4 h-4" /> Đặt trước ({RESERVATIONS.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-5">
          {tab === 'renewals' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Mã GH</th>
                  <th className="py-3 px-2">Độc giả</th>
                  <th className="py-3 px-2">Sách</th>
                  <th className="py-3 px-2">Hạn hiện tại</th>
                  <th className="py-3 px-2">Ngày gửi</th>
                  <th className="py-3 px-2 text-center">Đã gia hạn</th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {RENEWALS.map((r) => {
                  const maxed = r.renewalsUsed >= 2;
                  return (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-500">{r.id}</td>
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>{r.reader}</td>
                      <td className="py-3 px-2">{r.book}</td>
                      <td className="py-3 px-2 text-gray-700">{r.currentDue}</td>
                      <td className="py-3 px-2 text-gray-500">{r.requested}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge className={maxed ? 'bg-red-100 text-red-700 hover:bg-red-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                          {r.renewalsUsed} / 2
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        {maxed ? (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300" onClick={() => toast.error('Đã đạt giới hạn gia hạn')}>
                            <X className="w-3.5 h-3.5 mr-1" /> Từ chối
                          </Button>
                        ) : (
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.success('Đã gia hạn 7 ngày')}>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Duyệt +7 ngày
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Mã ĐT</th>
                  <th className="py-3 px-2">Độc giả</th>
                  <th className="py-3 px-2">Sách</th>
                  <th className="py-3 px-2">Ngày đặt</th>
                  <th className="py-3 px-2 text-center">Vị trí</th>
                  <th className="py-3 px-2">Dự kiến có sách</th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {RESERVATIONS.map((r) => {
                  const ready = r.expectedReady === 'Sẵn sàng';
                  return (
                    <tr key={r.id} className={`border-b hover:bg-gray-50 ${ready ? 'bg-emerald-50/40' : ''}`}>
                      <td className="py-3 px-2 text-gray-500">{r.id}</td>
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>{r.reader}</td>
                      <td className="py-3 px-2">{r.book}</td>
                      <td className="py-3 px-2 text-gray-500">{r.reservedAt}</td>
                      <td className="py-3 px-2 text-center">
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">#{r.queue}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        {ready
                          ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{r.expectedReady}</Badge>
                          : <span className="text-gray-700">{r.expectedReady}</span>}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {ready ? (
                          <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={() => toast.success('Đã thông báo cho độc giả')}>
                            <Bell className="w-3.5 h-3.5 mr-1" /> Thông báo
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                            <X className="w-3.5 h-3.5 mr-1" /> Huỷ
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
