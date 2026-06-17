import { Link } from 'react-router';
import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, QrCode, Printer, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Row = { barcode: string; location: string };

export function InventoryAddPage() {
  const [book, setBook] = useState('');
  const [count, setCount] = useState(3);
  const [location, setLocation] = useState('Kệ A-12');
  const [rows, setRows] = useState<Row[]>([]);

  const generate = () => {
    if (!book) return toast.error('Vui lòng chọn sách');
    const prefix = 'LIB-' + Math.floor(Math.random() * 999).toString().padStart(3, '0');
    const newRows = Array.from({ length: count }).map((_, i) => ({
      barcode: `${prefix}-${(i + 1).toString().padStart(2, '0')}`,
      location,
    }));
    setRows(newRows);
    toast.success(`Đã tạo ${count} bản sao mới`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/admin/inventory" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bản sao
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>Thêm bản sao & In QR/Barcode</h1>
        <p className="text-sm text-gray-500 mt-1">Tạo hàng loạt bản sao và in mã vạch cho dán vào sách</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-5">
        <Card>
          <CardContent className="p-5 space-y-4">
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Thông tin nhập</h3>
            <div>
              <label className="text-sm block mb-1">Chọn sách</label>
              <select value={book} onChange={(e) => setBook(e.target.value)} className="w-full h-10 border rounded-md px-3 text-sm">
                <option value="">-- Chọn đầu sách --</option>
                <option>Đắc Nhân Tâm</option>
                <option>Nhà Giả Kim</option>
                <option>Sapiens</option>
                <option>Tuổi Trẻ Đáng Giá Bao Nhiêu</option>
              </select>
            </div>
            <div>
              <label className="text-sm block mb-1">Số lượng bản sao</label>
              <Input type="number" min={1} max={50} value={count} onChange={(e) => setCount(+e.target.value)} />
            </div>
            <div>
              <label className="text-sm block mb-1">Vị trí (kệ)</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="VD: Kệ A-12" />
            </div>
            <div>
              <label className="text-sm block mb-1">Ngày nhập</label>
              <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <Button onClick={generate} className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" /> Tạo barcode
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Bản sao mới ({rows.length})</h3>
              <Button variant="outline" disabled={rows.length === 0} onClick={() => toast.success('Đang in nhãn QR/Barcode...')}>
                <Printer className="w-4 h-4 mr-2" /> In nhãn QR
              </Button>
            </div>
            {rows.length === 0 ? (
              <div className="py-16 text-center border-2 border-dashed rounded-lg">
                <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Chưa có bản sao nào — Bấm "Tạo barcode" để bắt đầu</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {rows.map((r, i) => (
                  <div key={r.barcode} className="border rounded-lg p-3 text-center bg-gray-50">
                    <div className="bg-white border rounded mx-auto mb-2 w-20 h-20 flex items-center justify-center">
                      <QrCode className="w-14 h-14 text-gray-800" />
                    </div>
                    <p className="text-xs font-mono">{r.barcode}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.location}</p>
                    <button onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-red-500 mt-1">
                      <Trash2 className="w-3 h-3 inline" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
