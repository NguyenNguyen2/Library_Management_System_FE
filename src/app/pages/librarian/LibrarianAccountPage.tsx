import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  Key,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Librarian } from '../../types';

const PERM_LABELS: Record<string, string> = {
  borrow: 'Mượn / Trả sách',
  manage_books: 'Quản lý sách',
  view_reports: 'Xem báo cáo',
  manage_readers: 'Quản lý độc giả',
  view_audit: 'Xem nhật ký',
};

export function LibrarianAccountPage() {
  const { user, updateProfile } = useAuth();

  const librarian = user as Librarian | null;

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '0912 345 678',
    address: user?.address ?? '123 Đường Lê Lợi, TP.HCM',
  });

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  const handleSaveProfile = () => {
    updateProfile({ name: form.name, phone: form.phone, address: form.address });
    setEditMode(false);
    toast.success('Đã cập nhật thông tin tài khoản');
  };

  const handleChangePassword = () => {
    if (!pwForm.current) return toast.error('Vui lòng nhập mật khẩu hiện tại');
    if (pwForm.newPw.length < 8) return toast.error('Mật khẩu mới tối thiểu 8 ký tự');
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Mật khẩu xác nhận không khớp');
    toast.success('Đã đổi mật khẩu thành công');
    setPwForm({ current: '', newPw: '', confirm: '' });
  };

  const role = librarian?.librarianRole ?? 'assistant_librarian';
  const roleLabel =
    role === 'head_librarian'
      ? 'Thủ thư trưởng'
      : role === 'assistant_librarian'
      ? 'Thủ thư phụ'
      : 'Chỉ xem';
  const roleColor =
    role === 'head_librarian'
      ? 'bg-blue-100 text-blue-700'
      : role === 'assistant_librarian'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-gray-100 text-gray-700';

  const permissions =
    role === 'head_librarian'
      ? ['borrow', 'manage_books', 'view_reports', 'manage_readers', 'view_audit']
      : role === 'assistant_librarian'
      ? ['borrow', 'manage_books', 'view_reports']
      : ['view_reports'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>
          Quản lý tài khoản
        </h1>
        <p className="text-sm text-gray-500 mt-1">Thông tin cá nhân và bảo mật tài khoản</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Avatar + role */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 text-center">
              <div className="w-20 h-20 rounded-full bg-[#2563EB] flex items-center justify-center text-white mx-auto mb-3"
                style={{ fontSize: 32, fontWeight: 700 }}>
                {(user?.name ?? 'T').slice(0, 1).toUpperCase()}
              </div>
              <p style={{ fontWeight: 600, fontSize: 16 }}>{user?.name ?? 'Thủ thư'}</p>
              <p className="text-sm text-gray-500 mb-3">{user?.email}</p>
              <Badge className={`${roleColor} hover:${roleColor}`}>
                <Shield className="w-3 h-3 mr-1" /> {roleLabel}
              </Badge>
              <p className="text-xs text-gray-400 mt-3">
                Phòng ban: {librarian?.department ?? 'Phòng Lưu thông'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Tham gia từ:{' '}
                {librarian?.createdAt
                  ? new Date(librarian.createdAt).toLocaleDateString('vi-VN')
                  : '01/01/2024'}
              </p>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Lock className="w-4 h-4 text-blue-600" /> Phân quyền RBAC
              </h3>
              <div className="space-y-2">
                {Object.keys(PERM_LABELS).map((perm) => {
                  const has = permissions.includes(perm);
                  return (
                    <div key={perm} className="flex items-center justify-between">
                      <span className="text-xs text-gray-700">{PERM_LABELS[perm]}</span>
                      {has ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Edit profile + change password */}
        <div className="lg:col-span-2 space-y-5">
          {/* Profile info */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Thông tin cá nhân</h3>
                {!editMode ? (
                  <Button variant="outline" onClick={() => setEditMode(true)}>
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditMode(false)}>Huỷ</Button>
                    <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" /> Lưu
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1 mb-1.5">
                    <User className="w-3.5 h-3.5" /> Họ và tên
                  </label>
                  {editMode ? (
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-gray-50 rounded-md">{form.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1 mb-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </label>
                  <p className="text-sm py-2 px-3 bg-gray-100 rounded-md text-gray-500">{form.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1 mb-1.5">
                    <Phone className="w-3.5 h-3.5" /> Điện thoại
                  </label>
                  {editMode ? (
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-gray-50 rounded-md">{form.phone}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1 mb-1.5">
                    <Building2 className="w-3.5 h-3.5" /> Phòng ban
                  </label>
                  <p className="text-sm py-2 px-3 bg-gray-100 rounded-md text-gray-500">
                    {librarian?.department ?? 'Phòng Lưu thông'}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-500 mb-1.5 block">Địa chỉ</label>
                  {editMode ? (
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                  ) : (
                    <p className="text-sm py-2 px-3 bg-gray-50 rounded-md">{form.address}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change password */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600 }}>
                <Key className="w-4 h-4 text-blue-600" /> Đổi mật khẩu
              </h3>
              <div className="space-y-3 max-w-sm">
                {[
                  { label: 'Mật khẩu hiện tại', field: 'current' as const },
                  { label: 'Mật khẩu mới', field: 'newPw' as const },
                  { label: 'Xác nhận mật khẩu mới', field: 'confirm' as const },
                ].map(({ label, field }) => (
                  <div key={field}>
                    <label className="text-sm text-gray-500 block mb-1.5">{label}</label>
                    <div className="relative">
                      <Input
                        type={showPw[field] ? 'text' : 'password'}
                        value={pwForm[field]}
                        onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw({ ...showPw, [field]: !showPw[field] })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        {showPw[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] mt-2"
                  onClick={handleChangePassword}
                >
                  <Key className="w-4 h-4 mr-2" /> Đổi mật khẩu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
