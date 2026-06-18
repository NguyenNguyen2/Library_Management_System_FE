'use client';

import { useEffect, useRef, useState } from 'react';
import { App, Button, Input } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  MailOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useLogin, useRegister, useForgotPassword } from '@/features/auth/hooks/useAuth';

type View = 'login' | 'register' | 'forgot' | 'forgot-sent';

// Custom simple inline SVG icons matching Lucide-react icons used in the design
const TruckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const extractErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as {
    response?: {
      data?: {
        results?: { message?: string };
        message?: string;
      };
    };
  };
  return (
    axiosErr?.response?.data?.results?.message ||
    axiosErr?.response?.data?.message ||
    fallback
  );
};

const LoginPage = () => {
  const { message } = App.useApp();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const forgotPasswordMutation = useForgotPassword();

  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPending = loginMutation.isPending || registerMutation.isPending;
  const isForgotPending = forgotPasswordMutation.isPending;

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startResendCountdown = () => {
    setResendCountdown(60);
    countdownRef.current = setInterval(() => {
      setResendCountdown((v) => {
        if (v <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (view === 'register' && (!fullName || !passwordConfirmation))) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (view === 'register' && password !== passwordConfirmation) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (view === 'login') {
      loginMutation.mutate(
        { email, password },
        {
          onError: (err) =>
            setError(
              extractErrorMessage(err, 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.')
            ),
        }
      );
    } else {
      registerMutation.mutate(
        { full_name: fullName, email, password, password_confirmation: passwordConfirmation },
        {
          onError: (err) =>
            setError(extractErrorMessage(err, 'Đăng ký thất bại. Vui lòng thử lại.')),
        }
      );
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!forgotEmail.trim()) {
      setError('Vui lòng nhập địa chỉ email');
      return;
    }

    forgotPasswordMutation.mutate(
      { email: forgotEmail.trim() },
      {
        onSuccess: () => {
          setView('forgot-sent');
          startResendCountdown();
        },
        onError: (err) =>
          setError(extractErrorMessage(err, 'Gửi yêu cầu thất bại. Vui lòng thử lại.')),
      }
    );
  };

  const handleResendForgot = () => {
    if (resendCountdown > 0) return;
    forgotPasswordMutation.mutate(
      { email: forgotEmail.trim() },
      {
        onSuccess: () => {
          message.success('Đã gửi lại email khôi phục!');
          startResendCountdown();
        },
        onError: () => message.error('Gửi lại thất bại. Vui lòng thử lại.'),
      }
    );
  };

  const goToLogin = () => {
    setView('login');
    setError('');
    setForgotEmail('');
  };

  const handleGoogleLogin = () => {
    setError('');
    loginMutation.mutate(
      { email: 'docgia1@example.com', password: 'google-oauth' },
      {
        onError: (err) => setError(extractErrorMessage(err, 'Không thể đăng nhập với Google')),
      }
    );
  };

  const heading =
    view === 'forgot'
      ? 'Quên mật khẩu'
      : view === 'forgot-sent'
        ? 'Kiểm tra email'
        : view === 'register'
          ? 'Đăng ký'
          : 'Đăng nhập';

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 font-sans flex items-center justify-center">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-indigo-400/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto px-6 py-10 lg:py-16 min-h-screen flex items-center">
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
                  src="/image-5.png"
                  alt="The Library Dashboard"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] drop-shadow-md">
              KHO TÀNG<br />TRI THỨC
            </h1>

            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              <span className="bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded-full text-sm font-semibold">
                HỌC TIẾN BỘ
              </span>
              <span className="bg-emerald-400 text-emerald-950 px-3 py-1.5 rounded-full text-sm font-semibold">
                ĐỌC THÔNG MINH
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 max-w-md w-full">
              <div className="bg-blue-900/40 backdrop-blur border border-white/10 rounded-xl px-4 py-3">
                <div className="text-xs text-white/70">HƠN 10.000+</div>
                <div className="text-2xl font-bold">ĐẦU SÁCH</div>
              </div>
              <div className="bg-blue-900/40 backdrop-blur border border-white/10 rounded-xl px-4 py-3">
                <div className="text-xs text-white/70">MƯỢN SÁCH CHỈ TỪ</div>
                <div className="text-2xl font-bold">0Đ</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 mt-4 bg-yellow-400 text-yellow-950 px-4 py-2 rounded-full shadow-lg font-semibold">
              <TruckIcon />
              <span>FREE SHIP TẬN NHÀ</span>
            </div>
          </div>

          {/* Right form */}
          <div className="w-full max-w-sm mx-auto lg:ml-auto">
            <div className="bg-white rounded-2xl shadow-2xl px-6 py-6 text-gray-800">
              <div className="flex flex-col items-center text-center mb-6">
                <img
                  src="/image-2.png"
                  alt="The Library Dashboard"
                  className="w-20 h-20 object-contain"
                />
                <h2
                  className="mt-3 text-blue-700"
                  style={{ fontSize: '30px', fontWeight: 700, lineHeight: 1.1 }}
                >
                  {heading}
                </h2>
                <p
                  className="text-gray-500 mt-1"
                  style={{ fontSize: '15px' }}
                >
                  The Library Dashboard
                </p>
              </div>

              {/* --- Quên mật khẩu: nhập email --- */}
              {view === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <button
                    type="button"
                    onClick={goToLogin}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-1"
                  >
                    <ArrowLeftOutlined className="text-[11px]" /> Quay lại đăng nhập
                  </button>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700 flex gap-2">
                    <MailOutlined className="mt-0.5 flex-shrink-0" />
                    <span>
                      Nhập email đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu có hiệu lực{' '}
                      <strong>15 phút</strong>.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Địa chỉ email</label>
                    <Input
                      type="email"
                      placeholder="vd: docgia1@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                      disabled={isForgotPending}
                      required
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircleIcon />
                      <p className="text-xs text-red-600 m-0">{error}</p>
                    </div>
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isForgotPending}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold tracking-wide border-none"
                  >
                    GỬI LINK ĐẶT LẠI MẬT KHẨU
                  </Button>
                </form>
              )}

              {/* --- Quên mật khẩu: đã gửi email --- */}
              {view === 'forgot-sent' && (
                <div className="space-y-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircleOutlined className="text-3xl text-green-500" />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-semibold">Email đã được gửi!</p>
                    <p className="text-gray-500 text-xs mt-1">
                      Chúng tôi đã gửi link đặt lại mật khẩu đến
                    </p>
                    <p className="text-blue-700 text-sm mt-0.5 break-all font-semibold">{forgotEmail}</p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-600 text-left space-y-1">
                    <p className="flex items-center gap-1.5">
                      <span className="text-blue-500">①</span> Mở hộp thư email của bạn
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-blue-500">②</span> Nhấn vào link trong email (hiệu lực 15 phút)
                    </p>
                    <p className="flex items-center gap-1.5">
                      <span className="text-blue-500">③</span> Đặt mật khẩu mới và đăng nhập lại
                    </p>
                    <p className="text-gray-400 mt-1.5">Không thấy email? Kiểm tra thư mục Spam.</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendForgot}
                    disabled={resendCountdown > 0 || isForgotPending}
                    className={`text-xs flex items-center gap-1 mx-auto transition-colors ${
                      resendCountdown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline cursor-pointer'
                    }`}
                  >
                    <ReloadOutlined className={isForgotPending ? 'animate-spin' : ''} />
                    {resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại email'}
                  </button>

                  <Button
                    htmlType="button"
                    onClick={goToLogin}
                    className="w-full h-10 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg font-semibold"
                  >
                    Quay lại đăng nhập
                  </Button>
                </div>
              )}

              {/* --- Login / Register --- */}
              {(view === 'login' || view === 'register') && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === 'register' && (
                    <div>
                      <Input
                        type="text"
                        placeholder="Họ và tên"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-10 text-sm rounded-lg"
                        disabled={isPending}
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Input
                      type="email"
                      placeholder="Email/SĐT/Tên đăng nhập"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                      disabled={isPending}
                      required
                    />
                  </div>

                  <div>
                    <Input.Password
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 text-sm rounded-lg"
                      disabled={isPending}
                      required
                    />
                  </div>

                  {view === 'register' && (
                    <div>
                      <Input.Password
                        placeholder="Xác nhận mật khẩu"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="h-10 text-sm rounded-lg"
                        disabled={isPending}
                        required
                      />
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                      <AlertCircleIcon />
                      <p className="text-xs text-red-600 m-0">{error}</p>
                    </div>
                  )}

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isPending}
                    className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold tracking-wide border-none"
                  >
                    {view === 'login' ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
                  </Button>

                  <Button
                    htmlType="button"
                    onClick={() => {
                      setView(view === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    disabled={isPending}
                    className="w-full h-10 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                  >
                    {view === 'login' ? 'Đăng ký tài khoản mới' : 'Đã có tài khoản? Đăng nhập'}
                  </Button>

                  {view === 'login' && (
                    <div className="flex justify-between text-xs text-blue-600 pt-1">
                      <button
                        type="button"
                        className="hover:underline"
                        onClick={() => {
                          setView('forgot');
                          setForgotEmail(email);
                          setError('');
                        }}
                      >
                        Quên mật khẩu
                      </button>
                      <a href="#" className="hover:underline">Đăng nhập với SMS</a>
                    </div>
                  )}
                </form>
              )}

              {(view === 'login' || view === 'register') && (
                <>
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-2 bg-white text-[10px] text-gray-400 uppercase tracking-wider">Hoặc</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-9 text-xs rounded-lg flex items-center justify-center gap-1.5" disabled={isPending}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </Button>
                    <Button
                      className="h-9 text-xs rounded-lg flex items-center justify-center gap-1.5"
                      disabled={isPending}
                      onClick={handleGoogleLogin}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Google
                    </Button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500 space-y-0.5">
                    <p className="text-gray-800 mb-1"><strong>Tài khoản demo</strong> (mật khẩu bất kỳ)</p>
                    <p>👤 Độc giả: docgia1@example.com</p>
                    <p>📚 Thủ thư: thuthu1@library.com</p>
                    <p>🛡️ Admin: admin@library.com</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
