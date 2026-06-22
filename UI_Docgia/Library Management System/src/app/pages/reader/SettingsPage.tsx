import { useState } from 'react';
import { useLibrary } from '../../contexts/LibraryContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Bell, Moon, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPage() {
  const { settings, updateSettings } = useLibrary();
  
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Đã lưu cài đặt');
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast.info('Đã khôi phục cài đặt');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Cài đặt</h1>
        <p className="text-gray-600">Tùy chỉnh trải nghiệm sử dụng của bạn</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Thông báo</CardTitle>
            </div>
            <CardDescription>Quản lý cách bạn nhận thông báo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thông báo qua Email</p>
                <p className="text-sm text-gray-600">
                  Nhận email về sách sắp đến hạn, quá hạn và đặt trước
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.emailNotifications}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thông báo trong App</p>
                <p className="text-sm text-gray-600">
                  Hiển thị thông báo khi sử dụng ứng dụng
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.appNotifications}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      appNotifications: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm mb-3">Nhắc nhở trước hạn trả</p>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 5, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => {
                      const newReminders = localSettings.reminderDaysBefore.includes(days)
                        ? localSettings.reminderDaysBefore.filter((d) => d !== days)
                        : [...localSettings.reminderDaysBefore, days];
                      setLocalSettings({
                        ...localSettings,
                        reminderDaysBefore: newReminders,
                      });
                    }}
                    className="px-3 py-1 rounded-md text-sm transition-colors"
                    style={{
                      backgroundColor: localSettings.reminderDaysBefore.includes(days)
                        ? '#2563eb'
                        : '#e5e7eb',
                      color: localSettings.reminderDaysBefore.includes(days)
                        ? '#ffffff'
                        : '#374151',
                    }}
                  >
                    {days} ngày
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              <CardTitle>Giao diện</CardTitle>
            </div>
            <CardDescription>Tùy chỉnh giao diện ứng dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Chế độ tối</p>
                <p className="text-sm text-gray-600">
                  Chuyển sang giao diện tối (đang phát triển)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.darkMode}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      darkMode: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <CardTitle>Ngôn ngữ</CardTitle>
            </div>
            <CardDescription>Chọn ngôn ngữ hiển thị</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                onClick={() => setLocalSettings({ ...localSettings, language: 'vi' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  localSettings.language === 'vi'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">Tiếng Việt</p>
                <p className="text-sm text-gray-600">Vietnamese</p>
              </button>
              <button
                onClick={() => setLocalSettings({ ...localSettings, language: 'en' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
                  localSettings.language === 'en'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium">English</p>
                <p className="text-sm text-gray-600">Anh</p>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Library Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Chính sách thư viện</CardTitle>
            <CardDescription>Thông tin về quy định sử dụng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Số sách được mượn tối đa:</span>
              <span className="font-medium">{settings.borrowLimit} cuốn</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Thời gian mượn:</span>
              <span className="font-medium">{settings.borrowDays} ngày</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Số lần gia hạn tối đa:</span>
              <span className="font-medium">{settings.maxRenewals} lần</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Phí trễ hạn:</span>
              <span className="font-medium">{settings.lateFeePerDay.toLocaleString()} VNĐ/ngày</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Thời gian giữ sách đặt trước:</span>
              <span className="font-medium">{settings.reservationHoldDays} ngày</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Lưu thay đổi
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Khôi phục
          </Button>
        </div>
      </div>
    </div>
  );
}
