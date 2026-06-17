import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Shield, Loader2, CheckCircle, RefreshCcw, Info, SmartphoneNfc } from 'lucide-react';
import { toast } from 'sonner';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export function OTPVerificationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [purpose, setPurpose] = useState<'login' | 'sensitive' | 'confirm'>('sensitive');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < OTP_LENGTH - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (paste.length) {
      const next = Array(OTP_LENGTH).fill('');
      paste.split('').forEach((c, i) => { next[i] = c; });
      setDigits(next);
      inputsRef.current[Math.min(paste.length, OTP_LENGTH - 1)]?.focus();
    }
    e.preventDefault();
  };

  const otp = digits.join('');
  const isFull = otp.length === OTP_LENGTH;

  const handleVerify = async () => {
    if (!isFull) return toast.error('Vui lòng nhập đủ 6 chữ số');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    if (/^\d{6}$/.test(otp)) {
      setVerified(true);
      toast.success('Xác thực thành công!');
    } else {
      toast.error('Mã OTP không hợp lệ');
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(RESEND_SECONDS);
    setDigits(Array(OTP_LENGTH).fill(''));
    inputsRef.current[0]?.focus();
    toast.success('Đã gửi lại mã OTP qua ứng dụng xác thực');
  };

  if (verified) {
    return (
      <div className="max-w-md mx-auto pt-8">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl mb-2" style={{ fontWeight: 700 }}>Xác thực thành công!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Danh tính của bạn đã được xác minh. Bạn có thể tiếp tục thao tác.
            </p>
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8] w-full"
              onClick={() => navigate('/librarian')}
            >
              Trở về Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pt-4">
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>Xác thực 2 bước (2FA)</h1>
        <p className="text-sm text-gray-500 mt-1">Xác minh danh tính để tiếp tục thao tác nhạy cảm</p>
      </div>

      {/* Purpose selector */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-sm text-gray-500 mb-2">Mục đích xác thực:</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'login', label: 'Đăng nhập' },
              { key: 'sensitive', label: 'Thao tác nhạy cảm' },
              { key: 'confirm', label: 'Xác nhận giao dịch' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPurpose(key as typeof purpose)}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  purpose === key ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-[#2563EB]" />
            </div>
            <h2 className="text-lg mb-1" style={{ fontWeight: 700 }}>Nhập mã xác thực OTP</h2>
            <p className="text-sm text-gray-500">
              Mở ứng dụng Google Authenticator và nhập mã 6 chữ số
            </p>
            {user && (
              <p className="text-xs text-gray-400 mt-1">
                Tài khoản: <span className="text-gray-700">{user.email}</span>
              </p>
            )}
          </div>

          {/* OTP inputs */}
          <div className="flex justify-center gap-2.5 mb-6">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center rounded-lg border-2 text-xl transition-all
                  ${d ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 bg-white'}
                  focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100`}
                style={{ fontWeight: 700 }}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-200 mb-2"
              style={{ fontWeight: 700, fontSize: 16, color: countdown < 10 ? '#EF4444' : '#374151' }}>
              {countdown}
            </div>
            <p className="text-xs text-gray-400">giây còn lại</p>
          </div>

          {/* Verify button */}
          <Button
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] h-11"
            onClick={handleVerify}
            disabled={!isFull || loading}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang xác thực...</>
            ) : (
              <><Shield className="w-4 h-4 mr-2" /> Xác thực ngay</>
            )}
          </Button>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={handleResend}
              disabled={countdown > 0}
              className={`flex items-center gap-1.5 text-sm ${
                countdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'
              }`}
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
            </button>
          </div>

          {/* Info */}
          <div className="mt-5 p-3 bg-amber-50 rounded-lg flex gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-amber-800" style={{ fontWeight: 500 }}>Hướng dẫn</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Mở <strong>Google Authenticator</strong> hoặc <strong>Authy</strong> trên điện thoại.
                Mã OTP có hiệu lực trong 30 giây và tự động thay đổi.
              </p>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded-lg flex gap-2.5">
            <SmartphoneNfc className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              <strong>Demo:</strong> Nhập bất kỳ 6 chữ số nào (ví dụ: <strong>123456</strong>) để xác thực thành công.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
