import { Link } from 'react-router';
import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'import' | 'liquidate';

const LIQUIDATE_CANDIDATES = [
  { id: 'CP-0892', title: 'Cây Cam Ngọt Của Tôi', barcode: 'LIB-005-01', condition: 'Hư nặng', reason: 'Bìa rách, mất trang', age: '3 năm 2 tháng' },
  { id: 'CP-0764', title: 'Tuổi Trẻ Đáng Giá', barcode: 'LIB-004-12', condition: 'Mất', reason: 'Báo mất bởi độc giả', age: '1 năm 8 tháng' },
  { id: 'CP-0612', title: 'Sapiens', barcode: 'LIB-003-08', condition: 'Hư nặng', reason: 'Ướt nước, hư nội dung', age: '2 năm 5 tháng' },
];

export function InventoryImportPage() {
  const [tab, setTab] = useState<Tab>('import');
  const [importedRows, setImportedRows] = useState<any[]>([]);

  const handleFile = () => {
    setImportedRows([
      { title: 'Atomic Habits', author: 'James Clear', copies: 5, status: 'ok' },
      { title: 'Deep Work', author: 'Cal Newport', copies: 3, status: 'ok' },
      { title: '???', author: '', copies: 2, status: 'error' },
    ]);
    toast.success('Đã đọc file Excel');
    
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/admin/inventory" className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách bản sao
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>Nhập & Thanh lý</h1>
        <p className="text-sm text-gray-500 mt-1">Nhập hàng loạt từ Excel hoặc thanh lý sách hư hỏng</p>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('import')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === 'import' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Upload className="w-4 h-4" /> Import Excel
        </button>
        <button
          onClick={() => setTab('liquidate')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === 'liquidate' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Trash2 className="w-4 h-4" /> Thanh lý ({LIQUIDATE_CANDIDATES.length})
        </button>
      </div>

      {tab === 'import' && (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="border-2 border-dashed border-blue-300 bg-blue-50/40 rounded-xl p-10 text-center">
              <FileSpreadsheet className="w-14 h-14 text-blue-500 mx-auto mb-3" />
              <p className="mb-2" style={{ fontWeight: 500 }}>Kéo thả file Excel hoặc bấm chọn</p>
              <p className="text-xs text-gray-500 mb-4">Định dạng .xlsx, .csv — tối đa 5MB</p>
              <Button onClick={handleFile} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
                <Upload className="w-4 h-4 mr-2" /> Chọn file mẫu
              </Button>
              <a href="#" className="block text-xs text-blue-600 mt-3 hover:underline">↓ Tải template mẫu (.xlsx)</a>
            </div>

            {importedRows.length > 0 && (
              <div>
                <h3 className="mb-2" style={{ fontSize: 14, fontWeight: 600 }}>Kết quả đọc file</h3>
                <table className="w-full text-sm border">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="py-2 px-3">Tên sách</th>
                      <th className="py-2 px-3">Tác giả</th>
                      <th className="py-2 px-3">Bản sao</th>
                      <th className="py-2 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedRows.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-2 px-3">{r.title}</td>
                        <td className="py-2 px-3 text-gray-600">{r.author || '—'}</td>
                        <td className="py-2 px-3">{r.copies}</td>
                        <td className="py-2 px-3">
                          {r.status === 'ok' ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><CheckCircle2 className="w-3 h-3 mr-1" /> Hợp lệ</Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertCircle className="w-3 h-3 mr-1" /> Thiếu tác giả</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Xác nhận import 2 dòng hợp lệ</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'liquidate' && (
        <Card>
          <CardContent className="p-5">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800">Các bản sao dưới đây được đề xuất thanh lý do hư hỏng nặng hoặc bị mất.</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Mã</th>
                  <th className="py-3 px-2">Tên sách</th>
                  <th className="py-3 px-2">Barcode</th>
                  <th className="py-3 px-2">Tình trạng</th>
                  <th className="py-3 px-2">Lý do</th>
                  <th className="py-3 px-2">Tuổi</th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {LIQUIDATE_CANDIDATES.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-500">{c.id}</td>
                    <td className="py-3 px-2" style={{ fontWeight: 500 }}>{c.title}</td>
                    <td className="py-3 px-2 font-mono text-xs">{c.barcode}</td>
                    <td className="py-3 px-2"><Badge className="bg-red-100 text-red-700 hover:bg-red-100">{c.condition}</Badge></td>
                    <td className="py-3 px-2 text-gray-700">{c.reason}</td>
                    <td className="py-3 px-2 text-gray-500">{c.age}</td>
                    <td className="py-3 px-2 text-right">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Thanh lý
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
