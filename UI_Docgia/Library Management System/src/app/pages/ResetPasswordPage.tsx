import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '../../imports/image-2.png';
import logo5Img from '../../imports/image-5.png';

type Step = 'form' | 'success' | 'invalid';

const PASSWORD_RULES = [
  { label: 'Ít nhất 8 ký tự', test: (v: string) => v.length >= 8 },
  { label: 'Có chữ hoa (A-Z)', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Có chữ số (0-9)', test: (v: string) => /\d/.test(v) },
  { label: 'Có ký tự đặc biệt (!@#$...)', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get('email') || '';
  const token = params.get('token') || '';

  const [step, setStep] = useState<Step>(() => {
    // Mock: token hợp lệ nếu có giá trị và email hợp lệ
    if (!token || !email) return 'invalid';
    return 'form';
  });

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Countdown giả lập token hết hạn sau 15 phút
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  useEffect(() => {
    if (step !== 'form') return;
    const t = setInterval(() => {
      setSecondsLeft((v) => {
        if (v <= 1) { clearInterval(t); setStep('invalid'); return 0; }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [step]);

  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const strength = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const strengthLabel = ['Rất yếu', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength];
  const strengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (strength < 2) { setError('Mật khẩu quá yếu, vui lòng chọn mật khẩu mạnh hơn'); return; }
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp'); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
    toast.success('Đặt lại mật khẩu thành công!');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-indigo-400/30 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-10 lg:py-16 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 items-center w-full">

          {/* Left banner */}
          <div className="text-white flex flex-col items-center text-center">
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
                background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              }}>
                <img src={logo5Img} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-[1.05] drop-shadow-md">
              KHO TÀNG<br />TRI THỨC
            </h1>
            <div className="mt-6 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-4 max-w-xs text-sm text-white/90 leading-relaxed">
              Bảo mật tài khoản của bạn bằng mật khẩu mạnh. Không chia sẻ mật khẩu với bất kỳ ai.
            </div>
          </div>

          {/* Right form */}
          <div className="w-full max-w-sm mx-auto lg:ml-auto">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-6">
              <div className="flex flex-col items-center text-center mb-5">
                <img src={logoImg} alt="Logo" className="w-16 h-16 object-contain" />
                <h2 className="mt-3 text-blue-700" style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.1 }}>
                  {step === 'success' ? 'Thành công!' : step === 'invalid' ? 'Link không hợp lệ' : 'Đặt lại mật khẩu'}
                </h2>
                <p className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>The Library Dashboard</p>
              </div>

              {/* ---- FORM ---- */}
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Token timer */}
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 text-xs text-amber-700">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Link hết hạn sau <strong>{minutes}:{seconds}</strong></span>
                  </div>

                  {email && (
                    <p className="text-xs text-gray-500 text-center">
                      Đặt lại mật khẩu cho <span className="text-blue-700 font-medium">{email}</span>
                    </p>
                  )}

                  {/* New password */}
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Mật khẩu mới</label>
                    <div className="relative">
                      <Input
                        type={showPw ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu mới"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-10 text-sm pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPw(!showPw)}
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Strength bar */}
                    {password && (
                      <div className="space-y-1.5 mt-1.5">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor : 'bg-gray-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-500">Độ mạnh: <span className="font-medium">{strengthLabel}</span></p>
                        <ul className="space-y-0.5">
                          {PASSWORD_RULES.map((rule) => (
                            <li key={rule.label} className={`flex items-center gap-1.5 text-[11px] ${rule.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                              {rule.test(password)
                                ? <CheckCircle2 className="w-3 h-3" />
                                : <div className="w-3 h-3 rounded-full border border-gray-300" />}
                              {rule.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-1">
                    <label className="block text-xs text-gray-600">Xác nhận mật khẩu</label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`h-10 text-sm pr-10 ${confirm && confirm !== password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {confirm && confirm !== password && (
                      <p className="text-[11px] text-red-500 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Mật khẩu không khớp
                      </p>
                    )}
                    {confirm && confirm === password && (
                      <p className="text-[11px] text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Mật khẩu khớp
                      </p>
                    )}
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !password || !confirm}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading
                      ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...</span>
                      : 'ĐẶT LẠI MẬT KHẨU'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full text-xs text-gray-500 hover:text-blue-600 hover:underline text-center block pt-1"
                  >
                    Quay lại đăng nhập
                  </button>
                </form>
              )}

              {/* ---- SUCCESS ---- */}
              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-11 h-11 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Mật khẩu đã được cập nhật!</p>
                    <p className="text-gray-500 text-xs mt-1">Bạn có thể đăng nhập với mật khẩu mới ngay bây giờ.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-700 text-left space-y-1">
                    <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu đã được mã hóa an toàn</p>
                    <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Tất cả thiết bị khác đã bị đăng xuất</p>
                    <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Email xác nhận đã được gửi</p>
                  </div>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ĐĂNG NHẬP NGAY
                  </Button>
                </div>
              )}

              {/* ---- INVALID ---- */}
              {step === 'invalid' && (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-11 h-11 text-red-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm" style={{ fontWeight: 600 }}>Link không hợp lệ hoặc đã hết hạn</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Link đặt lại mật khẩu chỉ có hiệu lực 15 phút và chỉ dùng được 1 lần.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700 text-left space-y-1">
                    <p>Có thể xảy ra vì:</p>
                    <p className="flex items-center gap-1.5">• Link đã hết hạn (quá 15 phút)</p>
                    <p className="flex items-center gap-1.5">• Link đã được sử dụng trước đó</p>
                    <p className="flex items-center gap-1.5">• Link bị thay đổi hoặc không đầy đủ</p>
                  </div>
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    YÊU CẦU LINK MỚI
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
