import { useState } from 'react';
import { mockLibrarians } from '../../lib/mockData';
import type { Librarian, LibrarianRole } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Pencil, Lock, Unlock, KeyRound, Search, X } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_LABEL: Record<LibrarianRole, string> = {
  head_librarian: 'Thủ thư trưởng',
  assistant_librarian: 'Thủ thư phụ',
  viewer: 'Chỉ xem',
};

const ROLE_COLOR: Record<LibrarianRole, string> = {
  head_librarian: 'bg-blue-100 text-blue-700',
  assistant_librarian: 'bg-purple-100 text-purple-700',
  viewer: 'bg-gray-100 text-gray-700',
};

export function LibrariansPage() {
  const [list, setList] = useState<Librarian[]>(mockLibrarians);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Librarian | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    librarianRole: 'assistant_librarian' as LibrarianRole,
    sendTempPassword: true,
  });

  const filtered = list.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', librarianRole: 'assistant_librarian', sendTempPassword: true });
    setModalOpen(true);
  };

  const openEdit = (l: Librarian) => {
    setEditing(l);
    setForm({ name: l.name, email: l.email, librarianRole: l.librarianRole, sendTempPassword: false });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (editing) {
      setList((prev) =>
        prev.map((l) =>
          l.id === editing.id
            ? { ...l, name: form.name, email: form.email, librarianRole: form.librarianRole }
            : l
        )
      );
      toast.success('Đã cập nhật tài khoản thủ thư');
    } else {
      const newLib: Librarian = {
        id: 'l' + Date.now(),
        email: form.email,
        name: form.name,
        role: 'librarian',
        librarianRole: form.librarianRole,
        isActive: true,
        createdAt: new Date(),
      };
      setList((prev) => [newLib, ...prev]);
      toast.success(
        form.sendTempPassword
          ? 'Đã tạo tài khoản & gửi mật khẩu tạm thời qua email'
          : 'Đã tạo tài khoản thủ thư'
      );
    }
    setModalOpen(false);
  };

  const toggleLock = (id: string) => {
    setList((prev) => prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l)));
    toast.success('Đã cập nhật trạng thái khóa');
  };

  const resetPassword = (l: Librarian) => {
    toast.success(`Đã gửi mật khẩu mới đến ${l.email}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl mb-1">Quản lý tài khoản Thủ thư</h1>
          <p className="text-gray-600">Phân quyền RBAC: Thủ thư trưởng / Thủ thư phụ / Chỉ xem</p>
        </div>
        <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-1" /> Tạo tài khoản thủ thư mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle>Danh sách thủ thư ({filtered.length})</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 uppercase border-b">
                <tr>
                  <th className="text-left py-3 px-2">Họ tên</th>
                  <th className="text-left py-3 px-2">Email</th>
                  <th className="text-left py-3 px-2">Vai trò</th>
                  <th className="text-left py-3 px-2">Phòng ban</th>
                  <th className="text-left py-3 px-2">Trạng thái</th>
                  <th className="text-right py-3 px-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-2">{l.name}</td>
                    <td className="py-3 px-2 text-gray-600">{l.email}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${ROLE_COLOR[l.librarianRole]}`}>
                        {ROLE_LABEL[l.librarianRole]}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600">{l.department ?? '—'}</td>
                    <td className="py-3 px-2">
                      {l.isActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Hoạt động
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Đã khóa</Badge>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(l)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => toggleLock(l.id)}>
                          {l.isActive ? (
                            <Lock className="w-4 h-4 text-red-600" />
                          ) : (
                            <Unlock className="w-4 h-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => resetPassword(l)}>
                          <KeyRound className="w-4 h-4 text-amber-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg">
                {editing ? 'Chỉnh sửa thủ thư' : 'Tạo tài khoản thủ thư'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm block mb-1">Họ và tên</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@library.com"
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Vai trò</label>
                <select
                  value={form.librarianRole}
                  onChange={(e) =>
                    setForm({ ...form, librarianRole: e.target.value as LibrarianRole })
                  }
                  className="w-full h-10 border rounded-md px-3 text-sm"
                >
                  <option value="head_librarian">Thủ thư trưởng (toàn quyền)</option>
                  <option value="assistant_librarian">Thủ thư phụ (giao dịch)</option>
                  <option value="viewer">Chỉ xem</option>
                </select>
              </div>
              {!editing && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.sendTempPassword}
                    onChange={(e) => setForm({ ...form, sendTempPassword: e.target.checked })}
                  />
                  Gửi mật khẩu tạm thời qua email
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Hủy
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmit}>
                {editing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
