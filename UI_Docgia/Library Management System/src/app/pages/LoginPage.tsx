import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { AlertCircle, Truck, ShieldCheck, Mail, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import logoImg from '../../imports/image-2.png';
import logo5Img from '../../imports/image-5.png';

type View = 'login' | 'register' | 'otp' | 'forgot' | 'forgot-sent';

export function LoginPage() {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { login, register, loginWithGoogle, verify2FA, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const path =
        user.role === 'admin' ? '/admin' : user.role === 'librarian' ? '/librarian' : '/reader';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const startResendCountdown = () => {
    setResendCountdown(60);
    countdownRef.current = setInterval(() => {
      setResendCountdown((v) => {
        if (v <= 1) { clearInterval(countdownRef.current!); return 0; }
        return v - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (view === 'login') {
        const res = await login(email, password);
        if (res.success && res.requires2FA) {
          setView('otp');
          toast.info('Vui lòng nhập mã OTP 6 chữ số để xác thực');
        } else if (res.success) {
          toast.success('Đăng nhập thành công!');
        } else {
          setError('Email hoặc mật khẩu không đúng');
        }
      } else {
        const ok = await register(email, password, name);
        if (ok) toast.success('Đăng ký thành công!');
        else setError('Email đã tồn tại');
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!forgotEmail.trim()) { setError('Vui lòng nhập địa chỉ email'); return; }
    setLoading(true);
    // Mock: simulate API delay
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setView('forgot-sent');
    startResendCountdown();
  };

  const handleResendForgot = async () => {
    if (resendCountdown > 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    toast.success('Đã gửi lại email khôi phục!');
    startResendCountdown();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await verify2FA(otp);
      if (ok) {
        toast.success('Xác thực 2FA thành công!');
      } else {
        setError('Mã OTP không đúng. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setView('login');
    setError('');
    setForgotEmail('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Đăng nhập với Google thành công!');
    } catch {
      setError('Không thể đăng nhập với Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-indigo-400/30 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-10 lg:py-16 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 items-center w-full">
          {/* Left promo */}
          <div className="text-white flex flex-col items-center text-center">
            {/* Logo */}
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.08)',
                  border: '2px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}
              >
                <img
                  src={logo5Img}
                  alt="The Library Dashboard"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl leading-[1.05] drop-shadow-md">
              KHO TÀNG<br />TRI THỨC
            </h1>

            <div className="flex flex-wrap gap-2 mt-6">
              <span className="bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded-full text-sm">
                HỌC TIẾN BỘ
              </span>
              <span className="bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded-full text-sm">
                ĐỌC THÔNG MINH
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 max-w-md">
              <div className="bg-blue-900/40 backdrop-blur border border-white/10 rounded-xl px-4 py-3">
                <div className="text-xs text-white/70">HƠN 10.000+</div>
                <div className="text-2xl">ĐẦU SÁCH</div>
              </div>
              <div className="bg-blue-900/40 backdrop-blur border border-white/10 rounded-xl px-4 py-3">
                <div className="text-xs text-white/70">MƯỢN SÁCH CHỈ TỪ</div>
                <div className="text-2xl">0Đ</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 mt-4 bg-yellow-400 text-yellow-950 px-4 py-2 rounded-full shadow-lg">
              <Truck className="w-4 h-4" />
              <span>FREE SHIP TẬN NHÀ</span>
            </div>
          </div>

          {/* Right form */}
          <div className="w-full max-w-sm mx-auto lg:ml-auto">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-6">
              <div className="flex flex-col items-center text-center mb-6">
                <img
                  src={logoImg}
                  alt="The Library Dashboard"
                  className="w-20 h-20 object-contain"
                />
                <h2
                  className="mt-3 text-blue-700"
                  style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.1 }}
                >
                  {view === 'otp' ? 'Xác thực 2FA'
                    : view === 'forgot' ? 'Quên mật khẩu'
                    : view === 'forgot-sent' ? 'Kiểm tra email'
                    : view === 'register' ? 'Đăng ký'
                    : 'Đăng nhập'}
                </h2>
                <p
                  className="text-gray-500 mt-1"
                  style={{ fontSize: '15px' }}
                >
                  The Library Dashboard
                </p>
              </div>

              {/* --- OTP 2FA --- */}
              {view === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-xs text-blue-700 flex gap-2">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Tài khoản admin yêu cầu xác thực 2 lớp. Mở Google Authenticator và nhập mã 6 chữ số (demo: bất kỳ 6 chữ số).
                    </span>
                  </div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Nhập mã OTP 6 chữ số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="h-11 text-center tracking-[0.5em] text-lg"
                    required
                  />
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? 'Đang xác thực...' : 'XÁC NHẬN OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setView('login'); setOtp(''); setError(''); }}
                    className="w-full h-10"
                  >
                    Quay lại đăng nhập
                  </Button>
                </form>
              )}

              {/* --- Quên mật khẩu: nhập email --- */}
              {view === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
                  </button>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700 flex gap-2">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu có hiệu lực <strong>15 phút</strong>.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Địa chỉ email</label>
                    <Input
                      type="email"
                      placeholder="vd: docgia@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="h-10 text-sm"
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-red-600">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Đang gửi...
                      </span>
                    ) : 'GỬI LINK ĐẶT LẠI MẬT KHẨU'}
                  </Button>
                </form>
              )}

              {/* --- Quên mật khẩu: đã gửi email --- */}
              {view === 'forgot-sent' && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-9 h-9 text-green-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>Email đã được gửi!</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Chúng tôi đã gửi link đặt lại mật khẩu đến
                    </p>
                    <p className="text-blue-700 text-sm mt-0.5 break-all" style={{ fontWeight: 600 }}>
                      {forgotEmail}
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-600 text-left space-y-1">
                    <p className="flex items-center gap-1.5"><span className="text-blue-500">①</span> Mở hộp thư email của bạn</p>
                    <p className="flex items-center gap-1.5"><span className="text-blue-500">②</span> Nhấn vào link trong email (hiệu lực 15 phút)</p>
                    <p className="flex items-center gap-1.5"><span className="text-blue-500">③</span> Đặt mật khẩu mới và đăng nhập lại</p>
                    <p className="text-gray-400 mt-1.5">Không thấy email? Kiểm tra thư mục Spam.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendForgot}
                    disabled={resendCountdown > 0 || loading}
                    className={`text-xs flex items-center gap-1 mx-auto transition-colors ${
                      resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline cursor-pointer'
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    {resendCountdown > 0
                      ? `Gửi lại sau ${resendCountdown}s`
                      : 'Gửi lại email'}
                  </button>

                  {/* Demo: simulate clicking reset link */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-[10px] text-gray-400 mb-2">— Demo: Mô phỏng nhấn link trong email —</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-xs border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                      onClick={() => navigate(`/reset-password?email=${encodeURIComponent(forgotEmail)}&token=demo-token-123`)}
                    >
                      Mở trang đặt lại mật khẩu (demo)
                    </Button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10"
                    onClick={goToLogin}
                  >
                    Quay lại đăng nhập
                  </Button>
                </div>
              )}

              {/* --- Login / Register --- */}
              {(view === 'login' || view === 'register') && (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {view === 'register' && (
                  <Input
                    type="text"
                    placeholder="Họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 text-sm"
                    required
                  />
                )}

                <Input
                  type="email"
                  placeholder="Email/SĐT/Tên đăng nhập"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-sm"
                  required
                />

                <Input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 text-sm"
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-2 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white tracking-wide"
                >
                  {loading ? 'Đang xử lý...' : view === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }}
                  className="w-full h-10 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {view === 'login' ? 'Đăng ký tài khoản mới' : 'Đã có tài khoản? Đăng nhập'}
                </Button>

                {view === 'login' && (
                  <div className="flex justify-between text-[11px] text-blue-600 pt-0.5">
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => { setView('forgot'); setForgotEmail(email); setError(''); }}
                    >
                      Quên mật khẩu?
                    </button>
                    <a href="#" className="hover:underline">Đăng nhập với SMS</a>
                  </div>
                )}
              </form>
              )}

              {(view === 'login' || view === 'register') && (<>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-[10px] text-gray-400 uppercase tracking-wider">Hoặc</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-9 text-xs" disabled={loading} type="button">
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="h-9 text-xs" disabled={loading} onClick={handleGoogleLogin} type="button">
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </Button>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-600 space-y-0.5">
                <p className="text-gray-900 mb-1"><strong>Tài khoản demo</strong> (mật khẩu bất kỳ)</p>
                <p>👤 Độc giả: docgia1@example.com</p>
                <p>📚 Thủ thư: thuthu1@library.com</p>
                <p>🛡️ Admin: admin@library.com</p>
              </div>
              </>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
