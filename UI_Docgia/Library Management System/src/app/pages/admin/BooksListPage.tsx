import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, BookOpen, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  copies: number;
  available: number;
  status: 'active' | 'low' | 'out';
};

const BOOKS: Book[] = [
  { id: 'B-001', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', category: 'Kỹ năng sống', isbn: '978-6041007543', copies: 12, available: 4, status: 'active' },
  { id: 'B-002', title: 'Nhà Giả Kim', author: 'Paulo Coelho', category: 'Tiểu thuyết', isbn: '978-6041092358', copies: 8, available: 1, status: 'low' },
  { id: 'B-003', title: 'Sapiens: Lược Sử Loài Người', author: 'Yuval Noah Harari', category: 'Lịch sử', isbn: '978-6049564222', copies: 6, available: 0, status: 'out' },
  { id: 'B-004', title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn', category: 'Kỹ năng sống', isbn: '978-6049473821', copies: 10, available: 7, status: 'active' },
  { id: 'B-005', title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro de Vasconcelos', category: 'Tiểu thuyết', isbn: '978-6049729012', copies: 5, available: 2, status: 'active' },
  { id: 'B-006', title: 'Mắt Biếc', author: 'Nguyễn Nhật Ánh', category: 'Tiểu thuyết', isbn: '978-6042128893', copies: 9, available: 3, status: 'active' },
  { id: 'B-007', title: 'Tôi Tài Giỏi Bạn Cũng Thế', author: 'Adam Khoo', category: 'Giáo dục', isbn: '978-6041183452', copies: 7, available: 0, status: 'out' },
];

const STATUS_MAP: Record<Book['status'], { label: string; cls: string }> = {
  active: { label: 'Còn sách', cls: 'bg-emerald-100 text-emerald-700' },
  low: { label: 'Sắp hết', cls: 'bg-amber-100 text-amber-700' },
  out: { label: 'Hết sách', cls: 'bg-red-100 text-red-700' },
};

export function BooksListPage() {
  const [q, setQ] = useState('');
  const filtered = BOOKS.filter(
    (b) =>
      b.title.toLowerCase().includes(q.toLowerCase()) ||
      b.author.toLowerCase().includes(q.toLowerCase()) ||
      b.isbn.includes(q),
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>
            Danh sách sách
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý toàn bộ đầu sách trong thư viện
          </p>
        </div>
        <Link to="/admin/catalog">
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
            <Plus className="w-4 h-4 mr-2" /> Thêm sách mới
          </Button>
        </Link>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng đầu sách</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{BOOKS.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Còn sách</p>
            <p className="text-emerald-600" style={{ fontSize: 20, fontWeight: 700 }}>
              {BOOKS.filter((b) => b.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Sắp hết</p>
            <p className="text-amber-600" style={{ fontSize: 20, fontWeight: 700 }}>
              {BOOKS.filter((b) => b.status === 'low').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Hết sách</p>
            <p className="text-red-600" style={{ fontSize: 20, fontWeight: 700 }}>
              {BOOKS.filter((b) => b.status === 'out').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên sách, tác giả hoặc ISBN..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Mã</th>
                  <th className="py-3 px-2">Tên sách</th>
                  <th className="py-3 px-2">Tác giả</th>
                  <th className="py-3 px-2">Thể loại</th>
                  <th className="py-3 px-2">ISBN</th>
                  <th className="py-3 px-2 text-center">Bản sao</th>
                  <th className="py-3 px-2 text-center">Còn lại</th>
                  <th className="py-3 px-2">Trạng thái</th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const s = STATUS_MAP[b.status];
                  return (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-500">{b.id}</td>
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>
                        {b.title}
                      </td>
                      <td className="py-3 px-2 text-gray-700">{b.author}</td>
                      <td className="py-3 px-2 text-gray-700">{b.category}</td>
                      <td className="py-3 px-2 text-gray-500">{b.isbn}</td>
                      <td className="py-3 px-2 text-center">{b.copies}</td>
                      <td className="py-3 px-2 text-center">{b.available}</td>
                      <td className="py-3 px-2">
                        <Badge className={`${s.cls} hover:${s.cls}`}>{s.label}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex gap-1">
                          <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
                      Không tìm thấy sách phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
