import { Info } from 'lucide-react';

export function DemoInfo() {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 mb-2">Demo Accounts</p>
          <div className="space-y-1 text-blue-800">
            <p><strong>Độc giả:</strong> docgia1@example.com</p>
            <p><strong>Thủ thư:</strong> thuthu1@library.com</p>
            <p><strong>Admin:</strong> admin@library.com</p>
            <p className="text-blue-600 mt-2 text-xs">Mật khẩu: bất kỳ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
