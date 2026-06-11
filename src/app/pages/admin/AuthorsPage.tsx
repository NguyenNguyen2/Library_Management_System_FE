import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Pencil, Trash2, User, Tag } from 'lucide-react';

type Tab = 'authors' | 'categories';

const AUTHORS = [
  { id: 'A-01', name: 'Nguyễn Nhật Ánh', country: 'Việt Nam', books: 24 },
  { id: 'A-02', name: 'Dale Carnegie', country: 'Hoa Kỳ', books: 8 },
  { id: 'A-03', name: 'Paulo Coelho', country: 'Brazil', books: 12 },
  { id: 'A-04', name: 'Yuval Noah Harari', country: 'Israel', books: 5 },
  { id: 'A-05', name: 'Rosie Nguyễn', country: 'Việt Nam', books: 3 },
  { id: 'A-06', name: 'Haruki Murakami', country: 'Nhật Bản', books: 18 },
];

const CATEGORIES = [
  { id: 'C-01', name: 'Kỹ năng sống', slug: 'ky-nang-song', count: 124, color: 'bg-blue-100 text-blue-700' },
  { id: 'C-02', name: 'Tiểu thuyết', slug: 'tieu-thuyet', count: 287, color: 'bg-purple-100 text-purple-700' },
  { id: 'C-03', name: 'Lịch sử', slug: 'lich-su', count: 96, color: 'bg-amber-100 text-amber-700' },
  { id: 'C-04', name: 'Khoa học', slug: 'khoa-hoc', count: 78, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'C-05', name: 'Thiếu nhi', slug: 'thieu-nhi', count: 152, color: 'bg-pink-100 text-pink-700' },
  { id: 'C-06', name: 'Kinh tế', slug: 'kinh-te', count: 64, color: 'bg-indigo-100 text-indigo-700' },
];

export function AuthorsPage() {
  const [tab, setTab] = useState<Tab>('authors');
  const [q, setQ] = useState('');

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Tác giả & Thể loại</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý danh mục tác giả và thể loại sách</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
          <Plus className="w-4 h-4 mr-2" /> {tab === 'authors' ? 'Thêm tác giả' : 'Thêm thể loại'}
        </Button>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setTab('authors')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            tab === 'authors' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <User className="w-4 h-4" /> Tác giả ({AUTHORS.length})
        </button>
        <button
          onClick={() => setTab('categories')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
            tab === 'categories' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Tag className="w-4 h-4" /> Thể loại ({CATEGORIES.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="relative max-w-md mb-4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tab === 'authors' ? 'Tìm tác giả...' : 'Tìm thể loại...'}
              className="pl-9"
            />
          </div>

          {tab === 'authors' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase border-b">
                  <th className="py-3 px-2">Mã</th>
                  <th className="py-3 px-2">Tên tác giả</th>
                  <th className="py-3 px-2">Quốc gia</th>
                  <th className="py-3 px-2 text-center">Số đầu sách</th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {AUTHORS.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())).map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 text-gray-500">{a.id}</td>
                    <td className="py-3 px-2" style={{ fontWeight: 500 }}>{a.name}</td>
                    <td className="py-3 px-2 text-gray-700">{a.country}</td>
                    <td className="py-3 px-2 text-center">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{a.books}</Badge>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-red-50 rounded text-red-600 ml-1"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).map((c) => (
                <div key={c.id} className="border rounded-xl p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <Badge className={`${c.color} hover:${c.color}`}>{c.name}</Badge>
                    <div className="flex">
                      <button className="p-1 hover:bg-blue-50 rounded text-blue-600"><Pencil className="w-3.5 h-3.5" /></button>
                      <button className="p-1 hover:bg-red-50 rounded text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">/{c.slug}</p>
                  <p className="mt-2"><span style={{ fontSize: 20, fontWeight: 700 }}>{c.count}</span> <span className="text-xs text-gray-500">đầu sách</span></p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
