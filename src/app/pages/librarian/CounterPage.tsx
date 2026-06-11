import { useState } from 'react';
import { mockReaders, mockBooks } from '../../lib/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Search,
  Scan,
  Printer,
  AlertTriangle,
  User,
  CheckCircle2,
  X,
  ArrowRightLeft,
} from 'lucide-react';
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

export function CounterPage() {
  // Check-out state
  const [readerQuery, setReaderQuery] = useState('');
  const [selectedReader, setSelectedReader] = useState<typeof mockReaders[number] | null>(null);
  const [borrowBarcode, setBorrowBarcode] = useState('');
  const [borrowList, setBorrowList] = useState<typeof mockBooks>([]);

  // Check-in state
  const [returnBarcode, setReturnBarcode] = useState('');
  const [returnedBook, setReturnedBook] = useState<typeof mockBooks[number] | null>(null);
  const [overdueDays, setOverdueDays] = useState(0);
  const [condition, setCondition] = useState<ReturnCondition>('good');

  const findReader = () => {
    const r = mockReaders.find(
      (x) =>
        x.cardNumber?.toLowerCase().includes(readerQuery.toLowerCase()) ||
        x.name.toLowerCase().includes(readerQuery.toLowerCase())
    );
    if (r) {
      setSelectedReader(r);
      toast.success(`Đã tìm thấy độc giả: ${r.name}`);
    } else {
      toast.error('Không tìm thấy độc giả');
    }
  };

  const addBorrow = () => {
    if (!borrowBarcode) return;
    const book = mockBooks.find((b) => b.id === borrowBarcode || b.isbn === borrowBarcode);
    const picked = book ?? mockBooks[borrowList.length % mockBooks.length];
    setBorrowList((prev) => [...prev, picked]);
    setBorrowBarcode('');
    toast.success(`Đã thêm: ${picked.title}`);
  };

  const scanReturn = () => {
    if (!returnBarcode) return;
    const book = mockBooks.find((b) => b.id === returnBarcode || b.isbn === returnBarcode) ?? mockBooks[0];
    setReturnedBook(book);
    setOverdueDays(Math.floor(Math.random() * 5));
    setCondition('good');
    toast.success(`Đã quét: ${book.title}`);
  };

  const lateFee = overdueDays * 5000;
  const bookPrice = 120000;
  const compensationFee = (bookPrice * CONDITION_FEE_PCT[condition]) / 100;
  const totalReturnFee = lateFee + compensationFee;

  const totalBorrow = borrowList.length;
  const readerOverdue = selectedReader ? (Math.random() > 0.5 ? 0 : 25000) : 0;
  const cardExpired = false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <ArrowRightLeft className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl">Quầy giao dịch</h1>
          <p className="text-gray-600 text-sm">Mượn / Trả sách tại quầy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHECK-OUT */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Scan className="w-5 h-5" /> Cho mượn (Check-out)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Reader search */}
            <div>
              <label className="text-sm block mb-1">Tìm độc giả (mã thẻ / tên)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={readerQuery}
                    onChange={(e) => setReaderQuery(e.target.value)}
                    placeholder="VD: TV001 hoặc Nguyễn Văn A"
                    className="pl-9 h-10"
                  />
                </div>
                <Button onClick={findReader} className="bg-blue-600 hover:bg-blue-700 h-10">
                  Tìm
                </Button>
              </div>
            </div>

            {/* Reader profile card */}
            {selectedReader && (
              <div className="border rounded-xl p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 p-2.5 rounded-full">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{selectedReader.name}</span>
                      <Badge variant="outline">{selectedReader.cardNumber}</Badge>
                      <Badge
                        className={
                          selectedReader.cardType === 'premium'
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-100'
                        }
                      >
                        {selectedReader.cardType === 'premium' ? 'Premium' : 'Thường'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{selectedReader.email}</p>
                    {(readerOverdue > 0 || cardExpired) && (
                      <div className="mt-2 space-y-1">
                        {readerOverdue > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Còn nợ phí trễ hạn: {readerOverdue.toLocaleString()}đ
                          </div>
                        )}
                        {cardExpired && (
                          <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Thẻ đã hết hạn
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Scan barcode */}
            <div>
              <label className="text-sm block mb-1">Quét barcode sách</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={borrowBarcode}
                    onChange={(e) => setBorrowBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addBorrow()}
                    placeholder="Quét hoặc nhập mã sách..."
                    className="pl-9 h-10"
                  />
                </div>
                <Button onClick={addBorrow} variant="outline" className="h-10">
                  Thêm
                </Button>
              </div>
            </div>

            {/* Borrow list */}
            <div className="border rounded-xl">
              <div className="px-4 py-2 border-b bg-gray-50 text-sm flex justify-between">
                <span>Danh sách mượn</span>
                <span className="text-gray-500">{totalBorrow} cuốn</span>
              </div>
              <div className="divide-y max-h-52 overflow-auto">
                {borrowList.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">
                    Chưa có sách nào — quét barcode để bắt đầu
                  </div>
                ) : (
                  borrowList.map((b, idx) => (
                    <div key={idx} className="flex items-center justify-between px-4 py-2 text-sm">
                      <div>
                        <div>{b.title}</div>
                        <div className="text-xs text-gray-500">ISBN: {b.isbn}</div>
                      </div>
                      <button
                        onClick={() =>
                          setBorrowList((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              disabled={!selectedReader || borrowList.length === 0}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                toast.success(`Đã ghi nhận mượn ${borrowList.length} cuốn & in biên lai PDF`);
                setBorrowList([]);
              }}
            >
              <Printer className="w-4 h-4 mr-2" />
              Xác nhận & In biên lai PDF
            </Button>
          </CardContent>
        </Card>

        {/* CHECK-IN */}
        <Card className="border-emerald-200">
          <CardHeader className="bg-emerald-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" /> Nhận trả (Check-in)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <label className="text-sm block mb-1">Quét barcode sách trả</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={returnBarcode}
                    onChange={(e) => setReturnBarcode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && scanReturn()}
                    placeholder="Quét mã barcode..."
                    className="pl-9 h-10"
                  />
                </div>
                <Button onClick={scanReturn} className="bg-emerald-600 hover:bg-emerald-700 h-10">
                  Quét
                </Button>
              </div>
            </div>

            {returnedBook && (
              <>
                <div className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Sách trả</p>
                      <p>{returnedBook.title}</p>
                      <p className="text-xs text-gray-500">ISBN: {returnedBook.isbn}</p>
                    </div>
                    <Badge
                      className={
                        overdueDays > 0
                          ? 'bg-red-100 text-red-700 hover:bg-red-100'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      }
                    >
                      {overdueDays > 0 ? `Trễ ${overdueDays} ngày` : 'Đúng hạn'}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm block mb-1">Tình trạng khi trả</label>
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

                <div className="border rounded-xl p-4 space-y-2 bg-amber-50/50 border-amber-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phí trễ hạn ({overdueDays} ngày × 5.000đ)</span>
                    <span>{lateFee.toLocaleString()}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Phí đền bù ({CONDITION_FEE_PCT[condition]}% × {bookPrice.toLocaleString()}đ)
                    </span>
                    <span>{compensationFee.toLocaleString()}đ</span>
                  </div>
                  <div className="border-t border-amber-200 pt-2 flex justify-between">
                    <span>Tổng cộng</span>
                    <span className="text-red-600">{totalReturnFee.toLocaleString()}đ</span>
                  </div>
                </div>

                <Button
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    toast.success('Đã ghi nhận trả sách & cập nhật phí');
                    setReturnedBook(null);
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Hoàn tất trả sách
                </Button>
              </>
            )}

            {!returnedBook && (
              <div className="border-2 border-dashed rounded-xl p-10 text-center text-sm text-gray-400">
                Quét barcode sách để bắt đầu xử lý trả
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
