import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, CreditCard, X, CheckCircle2, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import type { Reader } from '../../types';

const RENEWAL_OPTIONS = [
  { label: '6 tháng', months: 6, price: '50.000đ', badge: '' },
  { label: '1 năm', months: 12, price: '90.000đ', badge: 'Phổ biến' },
  { label: '2 năm', months: 24, price: '160.000đ', badge: 'Tiết kiệm' },
];

type RenewalStep = 'select' | 'confirm' | 'pending' | 'approved';

function RenewalModal({
  reader,
  onClose,
  onApproved,
}: {
  reader: Reader;
  onClose: () => void;
  onApproved: (newExpiry: Date) => void;
}) {
  const [step, setStep] = useState<RenewalStep>('select');
  const [selected, setSelected] = useState(1); // index trong RENEWAL_OPTIONS
  const [loading, setLoading] = useState(false);

  const option = RENEWAL_OPTIONS[selected];

  const currentExpiry = new Date(reader.cardExpiryDate);
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(baseDate);
  newExpiry.setMonth(newExpiry.getMonth() + option.months);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('pending');

    // Mock: thủ thư duyệt sau 2 giây
    setTimeout(() => {
      setStep('approved');
      onApproved(newExpiry);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step === 'approved' ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-gray-900" style={{ fontWeight: 600, fontSize: '18px' }}>Gia hạn thẻ thư viện</h2>
          {step !== 'pending' && (
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          {/* STEP: select */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Số thẻ</span>
                  <span className="font-mono text-gray-900">{reader.cardNumber}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Hết hạn hiện tại</span>
                  <span className={`${currentExpiry < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(reader.cardExpiryDate)}
                    {currentExpiry < new Date() && ' (đã hết hạn)'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2" style={{ fontWeight: 500 }}>Chọn thời hạn gia hạn</p>
                <div className="space-y-2">
                  {RENEWAL_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelected(i)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                        selected === i
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selected === i ? 'border-blue-500' : 'border-gray-300'
                        }`}>
                          {selected === i && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                        <span className="text-gray-900" style={{ fontWeight: selected === i ? 600 : 400 }}>
                          {opt.label}
                        </span>
                        {opt.badge && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full" style={{ fontWeight: 500 }}>
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-blue-600" style={{ fontWeight: 600 }}>{opt.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-xs text-blue-700">
                Sau gia hạn, thẻ có hiệu lực đến: <span style={{ fontWeight: 600 }}>{formatDate(newExpiry)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setStep('confirm')}>
                  Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP: confirm */}
          {step === 'confirm' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Xác nhận thông tin yêu cầu gia hạn:</p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Số thẻ</span>
                  <span className="font-mono">{reader.cardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Gói gia hạn</span>
                  <span style={{ fontWeight: 600 }}>{option.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hết hạn hiện tại</span>
                  <span>{formatDate(reader.cardExpiryDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hết hạn mới</span>
                  <span className="text-blue-700" style={{ fontWeight: 600 }}>{formatDate(newExpiry)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="text-gray-700" style={{ fontWeight: 500 }}>Phí gia hạn</span>
                  <span className="text-blue-600" style={{ fontWeight: 700, fontSize: '16px' }}>{option.price}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Yêu cầu sẽ được gửi đến thủ thư để xét duyệt. Sau khi duyệt, thẻ của bạn sẽ được gia hạn tự động.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setStep('select')}>Quay lại</Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading
                    ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Đang gửi...</span>
                    : 'Gửi yêu cầu'}
                </Button>
              </div>
            </div>
          )}

          {/* STEP: pending */}
          {step === 'pending' && (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Clock className="w-9 h-9 text-amber-500 animate-pulse" />
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '16px' }} className="text-gray-800">Đang chờ duyệt...</p>
                <p className="text-gray-500 text-sm mt-1">Thủ thư đang xem xét yêu cầu của bạn</p>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* STEP: approved */}
          {step === 'approved' && (
            <div className="text-center space-y-4 py-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-green-500" />
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '16px' }} className="text-gray-800">Gia hạn thành công!</p>
                <p className="text-gray-500 text-sm mt-1">Thẻ của bạn đã được gia hạn</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm space-y-1.5 text-left">
                <div className="flex justify-between">
                  <span className="text-gray-500">Gói đã gia hạn</span>
                  <span style={{ fontWeight: 600 }}>{option.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Có hiệu lực đến</span>
                  <span className="text-green-700" style={{ fontWeight: 600 }}>{formatDate(newExpiry)}</span>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onClose}>
                Đóng
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const reader = user as Reader;

  const [isEditing, setIsEditing] = useState(false);
  const [showRenewal, setShowRenewal] = useState(false);
  const [formData, setFormData] = useState({
    name: reader.name,
    phone: reader.phone || '',
    address: reader.address || '',
  });

  const handleRenewalApproved = (newExpiry: Date) => {
    updateProfile({ cardExpiryDate: newExpiry, cardStatus: 'active' } as Partial<Reader>);
    toast.success('Thẻ thư viện đã được gia hạn thành công!');
  };

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
      {showRenewal && (
        <RenewalModal
          reader={reader}
          onClose={() => setShowRenewal(false)}
          onApproved={handleRenewalApproved}
        />
      )}
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

            <div className="mt-6">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowRenewal(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {reader.cardStatus === 'active' ? 'Gia hạn thẻ thư viện' : 'Yêu cầu gia hạn thẻ'}
              </Button>
              {reader.cardStatus !== 'active' && (
                <p className="text-xs text-red-500 text-center mt-1.5">Thẻ đã hết hạn — vui lòng gia hạn để tiếp tục mượn sách</p>
              )}
            </div>
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
