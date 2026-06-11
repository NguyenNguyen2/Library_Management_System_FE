import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { mockLibrarians } from '../../lib/mockData';
import type { Librarian, LibrarianRole } from '../../types';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Plus, Search, Pencil, Lock, Unlock, KeyRound, X, Mail,
  UserCheck, Crown, AlertTriangle, Users, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'readers' | 'librarians';

type Reader = {
  id: string;
  name: string;
  email: string;
  card: 'regular' | 'premium';
  borrowing: number;
  overdue: number;
  joined: string;
  status: 'active' | 'suspended';
};

const READERS_INIT: Reader[] = [
  { id: 'RD-1024', name: 'Nguyễn Văn An', email: 'an.nv@gmail.com', card: 'regular', borrowing: 2, overdue: 1, joined: '2024-01-15', status: 'active' },
  { id: 'RD-1025', name: 'Trần Thị Bình', email: 'binh.tt@gmail.com', card: 'premium', borrowing: 5, overdue: 0, joined: '2023-08-22', status: 'active' },
  { id: 'RD-1026', name: 'Phạm Minh Đức', email: 'duc.pm@gmail.com', card: 'regular', borrowing: 1, overdue: 2, joined: '2024-03-10', status: 'suspended' },
  { id: 'RD-1027', name: 'Lê Hoàng Cường', email: 'cuong.lh@gmail.com', card: 'premium', borrowing: 3, overdue: 0, joined: '2022-11-04', status: 'active' },
  { id: 'RD-1028', name: 'Vũ Thanh Mai', email: 'mai.vt@gmail.com', card: 'regular', borrowing: 0, overdue: 0, joined: '2025-02-18', status: 'active' },
  { id: 'RD-1029', name: 'Đỗ Văn Khải', email: 'khai.dv@gmail.com', card: 'regular', borrowing: 2, overdue: 1, joined: '2024-09-30', status: 'active' },
];

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

export function AccountPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab: Tab = location.pathname.endsWith('/librarians') ? 'librarians' : 'readers';
  const [tab, setTab] = useState<Tab>(initialTab);

  // Readers state
  const [readers, setReaders] = useState(READERS_INIT);
  const [readerQ, setReaderQ] = useState('');
  const [readerFilter, setReaderFilter] = useState<'all' | Reader['card']>('all');

  // Librarians state
  const [libs, setLibs] = useState<Librarian[]>(mockLibrarians);
  const [libQ, setLibQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Librarian | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    librarianRole: 'assistant_librarian' as LibrarianRole,
    sendTempPassword: true,
  });

  const filteredReaders = readers.filter((r) =>
    (readerFilter === 'all' || r.card === readerFilter) &&
    [r.name, r.email, r.id].some((s) => s.toLowerCase().includes(readerQ.toLowerCase()))
  );
  const filteredLibs = libs.filter(
    (l) => l.name.toLowerCase().includes(libQ.toLowerCase()) || l.email.toLowerCase().includes(libQ.toLowerCase())
  );

  const switchTab = (t: Tab) => {
    setTab(t);
    navigate(`/admin/accounts/${t}`);
  };

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
    if (!form.name || !form.email) return toast.error('Vui lòng điền đầy đủ thông tin');
    if (editing) {
      setLibs((p) => p.map((l) => (l.id === editing.id ? { ...l, name: form.name, email: form.email, librarianRole: form.librarianRole } : l)));
      toast.success('Đã cập nhật thủ thư');
    } else {
      setLibs((p) => [
        { id: 'l' + Date.now(), email: form.email, name: form.name, role: 'librarian', librarianRole: form.librarianRole, isActive: true, createdAt: new Date() },
        ...p,
      ]);
      toast.success(form.sendTempPassword ? 'Đã tạo & gửi mật khẩu tạm thời' : 'Đã tạo tài khoản');
    }
    setModalOpen(false);
  };
  const toggleReaderStatus = (id: string) => {
    setReaders((p) => p.map((r) => (r.id === id ? { ...r, status: r.status === 'active' ? 'suspended' : 'active' } : r)));
    toast.success('Đã cập nhật trạng thái');
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Quản lý tài khoản</h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý độc giả và thủ thư trong hệ thống</p>
        </div>
        {tab === 'librarians' && (
          <Button onClick={openCreate} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
            <Plus className="w-4 h-4 mr-2" /> Thêm thủ thư
          </Button>
        )}
        {tab === 'readers' && (
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
            <Plus className="w-4 h-4 mr-2" /> Thêm độc giả
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Card style={{ borderLeft: '4px solid #2563EB' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Tổng độc giả</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{readers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #F59E0B' }}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Thẻ Premium</p>
            <p className="text-amber-600" style={{ fontSize: 22, fontWeight: 700 }}>{readers.filter((r) => r.card === 'premium').length}</p>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #8B5CF6' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-purple-600" /></div>
            <div>
              <p className="text-xs text-gray-500">Tổng thủ thư</p>
              <p style={{ fontSize: 22, fontWeight: 700 }}>{libs.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderLeft: '4px solid #EF4444' }}>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">Tài khoản khoá</p>
            <p className="text-red-600" style={{ fontSize: 22, fontWeight: 700 }}>
              {readers.filter((r) => r.status === 'suspended').length + libs.filter((l) => !l.isActive).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => switchTab('readers')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === 'readers' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Users className="w-4 h-4" /> Độc giả ({readers.length})
        </button>
        <button
          onClick={() => switchTab('librarians')}
          className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === 'librarians' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <ShieldCheck className="w-4 h-4" /> Thủ thư ({libs.length})
        </button>
      </div>

      <Card>
        <CardContent className="p-5">
          {tab === 'readers' ? (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[260px] max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={readerQ} onChange={(e) => setReaderQ(e.target.value)} placeholder="Tìm độc giả, email, mã..." className="pl-9" />
                </div>
                <div className="flex gap-1.5">
                  {(['all', 'regular', 'premium'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setReaderFilter(k)}
                      className={`px-3 py-1.5 rounded-md text-sm ${readerFilter === k ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {k === 'all' ? 'Tất cả' : k === 'regular' ? 'Thường' : 'Premium'}
                    </button>
                  ))}
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="py-3 px-2">Mã thẻ</th>
                    <th className="py-3 px-2">Độc giả</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Loại thẻ</th>
                    <th className="py-3 px-2 text-center">Đang mượn</th>
                    <th className="py-3 px-2 text-center">Quá hạn</th>
                    <th className="py-3 px-2">Trạng thái</th>
                    <th className="py-3 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReaders.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-gray-500 font-mono text-xs">{r.id}</td>
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>{r.name}</td>
                      <td className="py-3 px-2 text-gray-700">{r.email}</td>
                      <td className="py-3 px-2">
                        {r.card === 'premium'
                          ? <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100"><Crown className="w-3 h-3 mr-1" /> Premium</Badge>
                          : <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Thường</Badge>}
                      </td>
                      <td className="py-3 px-2 text-center">{r.borrowing}</td>
                      <td className="py-3 px-2 text-center">
                        {r.overdue > 0
                          ? <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> {r.overdue}</Badge>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3 px-2">
                        {r.status === 'active'
                          ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><UserCheck className="w-3 h-3 mr-1" /> Hoạt động</Badge>
                          : <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><Lock className="w-3 h-3 mr-1" /> Đình chỉ</Badge>}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600" title="Gửi email"><Mail className="w-4 h-4" /></button>
                        <button onClick={() => toggleReaderStatus(r.id)} className="p-1.5 hover:bg-amber-50 rounded text-amber-600 ml-1" title="Khoá/Mở">
                          {r.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <div className="relative flex-1 min-w-[260px] max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input value={libQ} onChange={(e) => setLibQ(e.target.value)} placeholder="Tìm thủ thư theo tên hoặc email..." className="pl-9" />
                </div>
                <span className="text-xs text-gray-500">Phân quyền RBAC: Trưởng / Phụ / Chỉ xem</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase border-b">
                    <th className="py-3 px-2">Họ tên</th>
                    <th className="py-3 px-2">Email</th>
                    <th className="py-3 px-2">Vai trò</th>
                    <th className="py-3 px-2">Phòng ban</th>
                    <th className="py-3 px-2">Trạng thái</th>
                    <th className="py-3 px-2 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLibs.map((l) => (
                    <tr key={l.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2" style={{ fontWeight: 500 }}>{l.name}</td>
                      <td className="py-3 px-2 text-gray-700">{l.email}</td>
                      <td className="py-3 px-2">
                        <Badge className={`${ROLE_COLOR[l.librarianRole]} hover:${ROLE_COLOR[l.librarianRole]}`}>
                          {ROLE_LABEL[l.librarianRole]}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{l.department ?? '—'}</td>
                      <td className="py-3 px-2">
                        {l.isActive
                          ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Hoạt động</Badge>
                          : <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Đã khoá</Badge>}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button onClick={() => openEdit(l)} className="p-1.5 hover:bg-blue-50 rounded text-blue-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => { setLibs((p) => p.map((x) => x.id === l.id ? { ...x, isActive: !x.isActive } : x)); toast.success('Đã cập nhật'); }} className="p-1.5 hover:bg-amber-50 rounded ml-1">
                          {l.isActive ? <Lock className="w-4 h-4 text-red-600" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button onClick={() => toast.success(`Đã gửi mật khẩu mới đến ${l.email}`)} className="p-1.5 hover:bg-amber-50 rounded text-amber-600 ml-1">
                          <KeyRound className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Librarian modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg">{editing ? 'Chỉnh sửa thủ thư' : 'Tạo tài khoản thủ thư'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-sm block mb-1">Họ và tên</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="text-sm block mb-1">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@library.com" />
              </div>
              <div>
                <label className="text-sm block mb-1">Vai trò</label>
                <select
                  value={form.librarianRole}
                  onChange={(e) => setForm({ ...form, librarianRole: e.target.value as LibrarianRole })}
                  className="w-full h-10 border rounded-md px-3 text-sm"
                >
                  <option value="head_librarian">Thủ thư trưởng (toàn quyền)</option>
                  <option value="assistant_librarian">Thủ thư phụ (giao dịch)</option>
                  <option value="viewer">Chỉ xem</option>
                </select>
              </div>
              {!editing && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.sendTempPassword} onChange={(e) => setForm({ ...form, sendTempPassword: e.target.checked })} />
                  Gửi mật khẩu tạm thời qua email
                </label>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Huỷ</Button>
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={handleSubmit}>
                {editing ? 'Lưu thay đổi' : 'Tạo tài khoản'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
