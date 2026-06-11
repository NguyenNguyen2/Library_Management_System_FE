import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import type { Reader } from '../../types';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const reader = user as Reader;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: reader.name,
    phone: reader.phone || '',
    address: reader.address || '',
  });

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
  };

  const handleCancel = () => {
    setFormData({
      name: reader.name,
      phone: reader.phone || '',
      address: reader.address || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Hồ sơ cá nhân</h1>
        <p className="text-gray-600">Quản lý thông tin cá nhân và thẻ thư viện</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>Thông tin tài khoản và liên hệ của bạn</CardDescription>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave}>Lưu</Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl">{reader.name}</h3>
                <p className="text-gray-600">{reader.email}</p>
                <Badge variant={reader.cardStatus === 'active' ? 'success' : 'destructive'} className="mt-2">
                  {reader.cardStatus === 'active' ? 'Thẻ hoạt động' : 'Thẻ hết hạn'}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Họ và tên
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email
                </label>
                <Input value={reader.email} disabled />
                <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Số điện thoại
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  Địa chỉ
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Library Card Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin thẻ thư viện</CardTitle>
            <CardDescription>Chi tiết về thẻ thành viên của bạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số thẻ</p>
                  <p className="font-mono text-lg">{reader.cardNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày cấp</p>
                  <p>{formatDate(reader.cardIssuedDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày hết hạn</p>
                  <p>{formatDate(reader.cardExpiryDate)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Hạn mức mượn</p>
                  <p>
                    {reader.currentBorrowed} / {reader.borrowLimit} sách
                  </p>
                </div>
              </div>
            </div>

            {reader.cardStatus === 'active' && (
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  Gia hạn thẻ thư viện
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Bảo mật</CardTitle>
            <CardDescription>Quản lý mật khẩu và xác thực</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Đổi mật khẩu
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Bật xác thực hai yếu tố (2FA)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
