import { useState } from 'react';
import { mockReaders, mockBooks } from '../../lib/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Search, Scan, Printer, AlertTriangle, User, X, ArrowUpFromLine,
} from 'lucide-react';
import { toast } from 'sonner';

export function CheckoutPage() {
  const [readerQuery, setReaderQuery] = useState('');
  const [selectedReader, setSelectedReader] = useState<typeof mockReaders[number] | null>(null);
  const [borrowBarcode, setBorrowBarcode] = useState('');
  const [borrowList, setBorrowList] = useState<typeof mockBooks>([]);

  const findReader = () => {
    const r = mockReaders.find(
      (x) =>
        x.cardNumber?.toLowerCase().includes(readerQuery.toLowerCase()) ||
        x.name.toLowerCase().includes(readerQuery.toLowerCase())
    );
    if (r) {
      setSelectedReader(r);
      toast.success(`Đã tìm thấy: ${r.name}`);
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

  const readerOverdue = selectedReader ? 25000 : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <ArrowUpFromLine className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Mượn sách (Check-out)</h1>
          <p className="text-sm text-gray-500">Ghi nhận cho mượn tại quầy</p>
        </div>
      </div>

      <Card className="border-blue-200">
        <CardContent className="p-6 space-y-5">
          {/* Reader search */}
          <div>
            <label className="text-sm block mb-1">Tìm độc giả (mã thẻ / tên)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={readerQuery}
                  onChange={(e) => setReaderQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && findReader()}
                  placeholder="VD: TV001 hoặc Nguyễn Văn A"
                  className="pl-9"
                />
              </div>
              <Button onClick={findReader} className="bg-[#2563EB] hover:bg-[#1D4ED8]">Tìm</Button>
            </div>
          </div>

          {selectedReader && (
            <div className="border rounded-xl p-4 bg-blue-50/40">
              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2.5 rounded-full shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontWeight: 500 }}>{selectedReader.name}</span>
                    <Badge variant="outline">{selectedReader.cardNumber}</Badge>
                    <Badge className={selectedReader.cardType === 'premium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                      {selectedReader.cardType === 'premium' ? 'Premium' : 'Thường'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{selectedReader.email}</p>
                  {readerOverdue > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 px-2 py-1 rounded mt-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Còn nợ phí trễ hạn: {readerOverdue.toLocaleString()}đ
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                  className="pl-9"
                />
              </div>
              <Button onClick={addBorrow} variant="outline">Thêm</Button>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-gray-50 text-sm flex justify-between">
              <span style={{ fontWeight: 500 }}>Danh sách sách mượn</span>
              <span className="text-gray-500">{borrowList.length} cuốn</span>
            </div>
            <div className="divide-y max-h-56 overflow-auto">
              {borrowList.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  Chưa có sách nào — quét barcode để bắt đầu
                </div>
              ) : (
                borrowList.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-2.5 text-sm">
                    <div>
                      <p style={{ fontWeight: 500 }}>{b.title}</p>
                      <p className="text-xs text-gray-500">ISBN: {b.isbn}</p>
                    </div>
                    <button onClick={() => setBorrowList((p) => p.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            disabled={!selectedReader || borrowList.length === 0}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]"
            onClick={() => {
              toast.success(`Đã cho mượn ${borrowList.length} cuốn & in biên lai`);
              setBorrowList([]);
            }}
          >
            <Printer className="w-4 h-4 mr-2" /> Xác nhận & In biên lai PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
