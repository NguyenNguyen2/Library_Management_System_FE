import { useState } from 'react';
import { mockBooks } from '../../lib/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Scan, CheckCircle2, ArrowDownToLine } from 'lucide-react';
import { toast } from 'sonner';

type ReturnCondition = 'good' | 'light_damage' | 'heavy_damage' | 'lost';

const CONDITION_LABEL: Record<ReturnCondition, string> = {
  good: 'Tốt',
  light_damage: 'Hư hỏng nhẹ',
  heavy_damage: 'Hư hỏng nặng',
  lost: 'Mất sách',
};

const CONDITION_FEE_PCT: Record<ReturnCondition, number> = {
  good: 0,
  light_damage: 20,
  heavy_damage: 50,
  lost: 100,
};

export function CheckinPage() {
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnedBook, setReturnedBook] = useState<typeof mockBooks[number] | null>(null);
  const [overdueDays, setOverdueDays] = useState(0);
  const [condition, setCondition] = useState<ReturnCondition>('good');

  const scanReturn = () => {
    if (!returnBarcode) return;
    const book = mockBooks.find((b) => b.id === returnBarcode || b.isbn === returnBarcode) ?? mockBooks[0];
    setReturnedBook(book);
    setOverdueDays(Math.floor(Math.random() * 8));
    setCondition('good');
    toast.success(`Đã quét: ${book.title}`);
    setReturnBarcode('');
  };

  const bookPrice = 120000;
  const lateFee = overdueDays * 5000;
  const compensationFee = (bookPrice * CONDITION_FEE_PCT[condition]) / 100;
  const totalReturnFee = lateFee + compensationFee;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-2 rounded-lg">
          <ArrowDownToLine className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Trả sách (Check-in)</h1>
          <p className="text-sm text-gray-500">Nhận trả và tính phí tại quầy</p>
        </div>
      </div>

      <Card className="border-emerald-200">
        <CardContent className="p-6 space-y-5">
          <div>
            <label className="text-sm block mb-1">Quét barcode sách trả</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={returnBarcode}
                  onChange={(e) => setReturnBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && scanReturn()}
                  placeholder="Quét mã barcode sách trả..."
                  className="pl-9"
                />
              </div>
              <Button onClick={scanReturn} className="bg-emerald-600 hover:bg-emerald-700">Quét</Button>
            </div>
          </div>

          {!returnedBook && (
            <div className="border-2 border-dashed rounded-xl p-14 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Quét barcode sách để bắt đầu xử lý trả</p>
            </div>
          )}

          {returnedBook && (
            <>
              <div className="border rounded-xl p-4 bg-emerald-50/40">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Sách trả</p>
                    <p style={{ fontWeight: 600 }}>{returnedBook.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">ISBN: {returnedBook.isbn}</p>
                  </div>
                  <Badge className={overdueDays > 0 ? 'bg-red-100 text-red-700 hover:bg-red-100 shrink-0' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 shrink-0'}>
                    {overdueDays > 0 ? `Trễ ${overdueDays} ngày` : 'Đúng hạn'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm block mb-1">Tình trạng sách khi trả</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ReturnCondition)}
                  className="w-full h-10 border rounded-md px-3 text-sm"
                >
                  {(Object.keys(CONDITION_LABEL) as ReturnCondition[]).map((c) => (
                    <option key={c} value={c}>
                      {CONDITION_LABEL[c]} ({CONDITION_FEE_PCT[c]}% giá sách)
                    </option>
                  ))}
                </select>
              </div>

              <div className="border rounded-xl p-4 space-y-2.5 bg-amber-50/60 border-amber-200">
                <p className="text-sm" style={{ fontWeight: 600 }}>Chi phí phát sinh</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí trễ hạn ({overdueDays} ngày × 5.000đ)</span>
                  <span>{lateFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí đền bù ({CONDITION_FEE_PCT[condition]}% × {bookPrice.toLocaleString('vi-VN')}đ)</span>
                  <span>{compensationFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="border-t border-amber-300 pt-2.5 flex justify-between" style={{ fontWeight: 600 }}>
                  <span>Tổng cộng</span>
                  <span className={totalReturnFee > 0 ? 'text-red-600' : 'text-emerald-600'}>
                    {totalReturnFee.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  toast.success('Đã ghi nhận trả sách & cập nhật phí');
                  setReturnedBook(null);
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Hoàn tất trả sách
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
