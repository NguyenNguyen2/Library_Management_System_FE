import { useState } from 'react';
import { Link } from 'react-router';
import { mockBooks, mockAuthors, mockCategories, mockPublishers } from '../../lib/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Plus,
  Search,
  BookOpen,
  Pencil,
  Trash2,
  X,
  Save,
  Filter,
  Barcode,
  Star,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Book } from '../../types';

type BookRow = {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  copies: number;
  available: number;
  coverImage?: string;
  status: 'active' | 'low' | 'out';
};

const toRow = (b: Book): BookRow => {
  const author = mockAuthors.find((a) => a.id === b.authorId)?.name ?? 'Không rõ';
  const publisher = mockPublishers.find((p) => p.id === b.publisherId)?.name ?? 'Không rõ';
  const category = mockCategories.find((c) => c.id === b.categoryId)?.name ?? 'Khác';
  const status: BookRow['status'] =
    b.availableCopies === 0 ? 'out' : b.availableCopies <= 2 ? 'low' : 'active';
  return {
    id: `B-${b.id.padStart(3, '0')}`,
    isbn: b.isbn,
    title: b.title,
    author,
    publisher,
    category,
    copies: b.totalCopies,
    available: b.availableCopies,
    coverImage: b.coverImage,
    status,
  };
};

const STATUS_MAP: Record<BookRow['status'], { label: string; cls: string }> = {
  active: { label: 'Còn sách', cls: 'bg-emerald-100 text-emerald-700' },
  low: { label: 'Sắp hết', cls: 'bg-amber-100 text-amber-700' },
  out: { label: 'Hết sách', cls: 'bg-red-100 text-red-700' },
};

export function LibrarianBooksListPage() {
  const [books, setBooks] = useState<BookRow[]>(mockBooks.map(toRow));
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | BookRow['status']>('all');
  const [editBook, setEditBook] = useState<BookRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BookRow>>({});

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  const filtered = books.filter((b) => {
    const matchQ =
      !q ||
      b.title.toLowerCase().includes(q.toLowerCase()) ||
      b.author.toLowerCase().includes(q.toLowerCase()) ||
      b.isbn.includes(q) ||
      b.category.toLowerCase().includes(q.toLowerCase());
    const matchCat = catFilter === 'all' || b.category === catFilter;
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchQ && matchCat && matchStatus;
  });

  const openEdit = (b: BookRow) => {
    setEditBook(b);
    setEditForm({ ...b });
  };

  const handleSaveEdit = () => {
    if (!editBook) return;
    setBooks((prev) =>
      prev.map((b) => (b.id === editBook.id ? { ...b, ...editForm } as BookRow : b))
    );
    toast.success('Đã cập nhật thông tin sách');
    setEditBook(null);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setBooks((prev) => prev.filter((b) => b.id !== deleteId));
    toast.success('Đã xóa sách khỏi danh sách');
    setDeleteId(null);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Danh sách sách</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý toàn bộ đầu sách trong thư viện</p>
        </div>
        <div className="flex gap-2">
          <Link to="/librarian/books/isbn">
            <Button variant="outline" className="border-[#2563EB] text-[#2563EB]">
              <Barcode className="w-4 h-4 mr-2" /> Thêm qua ISBN
            </Button>
          </Link>
          <Link to="/librarian/books/manual">
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              <Plus className="w-4 h-4 mr-2" /> Thêm thủ công
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card style={{ borderLeft: '4px solid #2563EB' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tổng đầu sách</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{books.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Còn sách</p>
            <p className="text-emerald-600" style={{ fontSize: 22, fontWeight: 700 }}>
              {books.filter((b) => b.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Sắp hết</p>
            <p className="text-amber-600" style={{ fontSize: 22, fontWeight: 700 }}>
              {books.filter((b) => b.status === 'low').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Hết sách</p>
            <p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>
              {books.filter((b) => b.status === 'out').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên, tác giả, ISBN, thể loại..."
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-gray-400" />
              {(['all', 'active', 'low', 'out'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    statusFilter === s ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {s === 'all' ? 'Tất cả' : STATUS_MAP[s].label}
                </button>
              ))}
            </div>
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="h-9 border border-gray-200 rounded-md px-3 text-sm bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'Tất cả thể loại' : c}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Sách</th>
                  <th className="py-3 px-2">Tác giả</th>
                  <th className="py-3 px-2">Thể loại</th>
                  <th className="py-3 px-2">ISBN</th>
                  <th className="py-3 px-2 text-center">Tổng bản</th>
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
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          {b.coverImage ? (
                            <img
                              src={b.coverImage}
                              alt={b.title}
                              className="w-9 h-12 object-cover rounded-md shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-12 bg-blue-50 rounded-md flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm max-w-[200px] truncate" style={{ fontWeight: 500 }}>
                              {b.title}
                            </p>
                            <p className="text-xs text-gray-400">{b.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-700">{b.author}</td>
                      <td className="py-3 px-2">
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                          {b.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-gray-500 font-mono text-xs">{b.isbn}</td>
                      <td className="py-3 px-2 text-center">{b.copies}</td>
                      <td className="py-3 px-2 text-center" style={{ fontWeight: 600 }}>{b.available}</td>
                      <td className="py-3 px-2">
                        <Badge className={`${s.cls} hover:${s.cls}`}>{s.label}</Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(b.id)}
                            className="p-1.5 hover:bg-red-50 rounded text-red-600"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      Không tìm thấy sách phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Hiển thị {filtered.length} / {books.length} đầu sách
            </p>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button
                  key={p}
                  className={`w-8 h-8 rounded-md text-sm ${
                    p === 1 ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editBook && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg" style={{ fontWeight: 600 }}>Chỉnh sửa thông tin sách</h2>
              <button onClick={() => setEditBook(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1.5">Tên sách</label>
                <Input
                  value={editForm.title ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">Tác giả</label>
                  <Input
                    value={editForm.author ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">Thể loại</label>
                  <select
                    value={editForm.category ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full h-10 border rounded-md px-3 text-sm"
                  >
                    {mockCategories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">Tổng bản sao</label>
                  <Input
                    type="number"
                    value={editForm.copies ?? 0}
                    onChange={(e) => setEditForm({ ...editForm, copies: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">NXB</label>
                  <Input
                    value={editForm.publisher ?? ''}
                    onChange={(e) => setEditForm({ ...editForm, publisher: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditBook(null)}>Huỷ</Button>
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={handleSaveEdit}>
                <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg mb-2" style={{ fontWeight: 600 }}>Xác nhận xóa sách</h2>
              <p className="text-sm text-gray-500 mb-5">
                Hành động này không thể hoàn tác. Sách sẽ bị xóa khỏi hệ thống.
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setDeleteId(null)}>Huỷ</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                >
                  Xóa sách
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
