import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  Settings,
  BookOpen,
  Coins,
  RefreshCw,
  CalendarDays,
  Mail,
  Save,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type TabKey = 'borrow' | 'fines' | 'renewal' | 'holiday' | 'email';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'borrow', label: 'Giới hạn mượn', icon: BookOpen },
  { key: 'fines', label: 'Phí trễ hạn', icon: Coins },
  { key: 'renewal', label: 'Quy tắc gia hạn', icon: RefreshCw },
  { key: 'holiday', label: 'Lịch nghỉ', icon: CalendarDays },
  { key: 'email', label: 'Mẫu Email', icon: Mail },
];

export function SystemConfigPage() {
  const [active, setActive] = useState<TabKey>('borrow');
  const [cfg, setCfg] = useState({
    regularLimit: 3,
    premiumLimit: 7,
    regularDays: 14,
    premiumDays: 30,
    lateFee: 5000,
    premiumLateFee: 3000,
    lightDmgPct: 20,
    heavyDmgPct: 50,
    lostPct: 100,
    maxRenewals: 2,
    renewalDays: 7,
    reservationHold: 2,
    holidays: ['01/01', '30/04', '01/05', '02/09'],
    emailReminder:
      'Kính gửi {tên độc giả}, sách "{tên sách}" sẽ đến hạn vào {ngày trả}. Vui lòng trả đúng hạn để tránh phí.',
    emailOverdue:
      'Kính gửi {tên độc giả}, sách "{tên sách}" đã quá hạn {số ngày} ngày. Phí phát sinh: {số tiền}đ.',
  });
  const [holidayInput, setHolidayInput] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Settings className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl">Cấu hình hệ thống</h1>
          <p className="text-gray-600 text-sm">Tùy chỉnh quy định mượn/trả & phí của thư viện</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Vertical tabs */}
        <Card className="self-start">
          <CardContent className="p-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Content */}
        <div className="space-y-5">
          {active === 'borrow' && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg">Giới hạn số sách được mượn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span>Thẻ thường (Regular)</span>
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Mặc định</Badge>
                    </div>
                    <label className="text-sm block mb-1">Số sách tối đa</label>
                    <Input
                      type="number"
                      value={cfg.regularLimit}
                      onChange={(e) => setCfg({ ...cfg, regularLimit: +e.target.value })}
                    />
                    <label className="text-sm block mt-3 mb-1">Số ngày mượn</label>
                    <Input
                      type="number"
                      value={cfg.regularDays}
                      onChange={(e) => setCfg({ ...cfg, regularDays: +e.target.value })}
                    />
                  </div>
                  <div className="border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span>Thẻ Premium</span>
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">VIP</Badge>
                    </div>
                    <label className="text-sm block mb-1">Số sách tối đa</label>
                    <Input
                      type="number"
                      value={cfg.premiumLimit}
                      onChange={(e) => setCfg({ ...cfg, premiumLimit: +e.target.value })}
                    />
                    <label className="text-sm block mt-3 mb-1">Số ngày mượn</label>
                    <Input
                      type="number"
                      value={cfg.premiumDays}
                      onChange={(e) => setCfg({ ...cfg, premiumDays: +e.target.value })}
                    />
                  </div>
                </div>
                <div className="border rounded-xl p-4">
                  <label className="text-sm block mb-1">
                    Thời gian giữ chỗ đặt trước (mặc định 2 ngày)
                  </label>
                  <select
                    value={cfg.reservationHold}
                    onChange={(e) => setCfg({ ...cfg, reservationHold: +e.target.value })}
                    className="w-full md:w-60 h-10 border rounded-md px-3 text-sm"
                  >
                    {[1, 2, 3, 5, 7].map((d) => (
                      <option key={d} value={d}>{d} ngày</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'fines' && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg">Phí trễ hạn & đền bù</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm block mb-1">Phí trễ hạn / ngày (Thẻ thường)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={cfg.lateFee}
                        onChange={(e) => setCfg({ ...cfg, lateFee: +e.target.value })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">đ</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Phí trễ hạn / ngày (Premium)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={cfg.premiumLateFee}
                        onChange={(e) => setCfg({ ...cfg, premiumLateFee: +e.target.value })}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">đ</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="text-sm block mb-1">Hư hỏng nhẹ (% giá sách)</label>
                    <Input
                      type="number"
                      value={cfg.lightDmgPct}
                      onChange={(e) => setCfg({ ...cfg, lightDmgPct: +e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Hư hỏng nặng (% giá sách)</label>
                    <Input
                      type="number"
                      value={cfg.heavyDmgPct}
                      onChange={(e) => setCfg({ ...cfg, heavyDmgPct: +e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Mất sách (% giá sách)</label>
                    <Input
                      type="number"
                      value={cfg.lostPct}
                      onChange={(e) => setCfg({ ...cfg, lostPct: +e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'renewal' && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg">Quy tắc gia hạn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm block mb-1">Số lần gia hạn tối đa</label>
                    <Input
                      type="number"
                      value={cfg.maxRenewals}
                      onChange={(e) => setCfg({ ...cfg, maxRenewals: +e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Số ngày gia hạn mỗi lần</label>
                    <Input
                      type="number"
                      value={cfg.renewalDays}
                      onChange={(e) => setCfg({ ...cfg, renewalDays: +e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Lưu ý: Không cho phép gia hạn nếu sách đã có người đặt trước.
                </p>
              </CardContent>
            </Card>
          )}

          {active === 'holiday' && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg">Lịch nghỉ (bỏ qua khi tính phí)</h2>
                <div className="flex gap-2">
                  <Input
                    value={holidayInput}
                    onChange={(e) => setHolidayInput(e.target.value)}
                    placeholder="VD: 20/11"
                    className="max-w-xs"
                  />
                  <Button
                    onClick={() => {
                      if (holidayInput) {
                        setCfg({ ...cfg, holidays: [...cfg.holidays, holidayInput] });
                        setHolidayInput('');
                      }
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" /> Thêm ngày
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cfg.holidays.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                    >
                      {h}
                      <button
                        onClick={() =>
                          setCfg({ ...cfg, holidays: cfg.holidays.filter((_, j) => j !== i) })
                        }
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {active === 'email' && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <h2 className="text-lg">Mẫu email thông báo</h2>
                <div>
                  <label className="text-sm block mb-1">Email nhắc trả sách</label>
                  <Textarea
                    rows={4}
                    value={cfg.emailReminder}
                    onChange={(e) => setCfg({ ...cfg, emailReminder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm block mb-1">Email báo quá hạn</label>
                  <Textarea
                    rows={4}
                    value={cfg.emailOverdue}
                    onChange={(e) => setCfg({ ...cfg, emailOverdue: e.target.value })}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Sử dụng biến: {'{tên độc giả}'}, {'{tên sách}'}, {'{ngày trả}'}, {'{số ngày}'}, {'{số tiền}'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-[0_-2px_12px_rgba(0,0,0,0.06)] z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-500">Các thay đổi sẽ áp dụng cho toàn hệ thống.</p>
          <div className="flex gap-2">
            <Button variant="outline">Khôi phục mặc định</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => toast.success('Đã lưu cấu hình hệ thống')}
            >
              <Save className="w-4 h-4 mr-1" /> Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
