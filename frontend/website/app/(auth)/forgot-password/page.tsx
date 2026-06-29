'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Input } from 'antd';
import { CheckCircleOutlined, LockOutlined, WarningOutlined } from '@ant-design/icons';
import { useResetPassword } from '@/features/auth/hooks/useAuth';
import PasswordStrengthChecklist from '@/features/auth/components/PasswordStrengthChecklist';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import { APP_ROUTE } from '@/constants/routes';

const extractErrorMessage = (err: unknown, fallback: string) => {
  const axiosErr = err as {
    response?: { data?: { message?: string; results?: { message?: string } } };
  };
  return (
    axiosErr?.response?.data?.message ||
    axiosErr?.response?.data?.results?.message ||
    fallback
  );
};

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') ?? '';
  const email = decodeURIComponent(searchParams.get('email') ?? '');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetMutation = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !passwordConfirmation) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (!PASSWORD_PATTERN.test(password)) {
      setError('Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&).');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    resetMutation.mutate(
      { token, email, password, password_confirmation: passwordConfirmation },
      {
        onSuccess: () => setSuccess(true),
        onError: (err) =>
          setError(
            extractErrorMessage(err, 'Đổi mật khẩu thất bại. Link có thể đã hết hạn hoặc đã được sử dụng.')
          ),
      }
    );
  };

  // Link không hợp lệ (thiếu token hoặc email)
  if (!token || !email) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl px-6 py-8 text-gray-800 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <WarningOutlined className="text-3xl text-red-500" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-800">Link không hợp lệ</p>
          <p className="text-xs text-gray-500 mt-1">
            Link đặt lại mật khẩu bị thiếu thông tin. Vui lòng yêu cầu lại.
          </p>
        </div>
        <Button
          type="primary"
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 border-none rounded-lg font-semibold"
          onClick={() => router.push(APP_ROUTE.login)}
        >
          Quay lại đăng nhập
        </Button>
      </div>
    );
  }

  // Đổi mật khẩu thành công
  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl px-6 py-8 text-gray-800 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleOutlined className="text-3xl text-green-500" />
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-base">Đổi mật khẩu thành công!</p>
          <p className="text-xs text-gray-500 mt-1">
            Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.
          </p>
        </div>
        <Button
          type="primary"
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 border-none rounded-lg font-semibold"
          onClick={() => router.push(APP_ROUTE.login)}
        >
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  // Form đổi mật khẩu
  return (
    <div className="bg-white rounded-2xl shadow-2xl px-6 py-6 text-gray-800">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
          <LockOutlined className="text-2xl text-blue-600" />
        </div>
        <h2 className="text-blue-700" style={{ fontSize: '26px', fontWeight: 700 }}>
          Đặt lại mật khẩu
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Nhập mật khẩu mới cho tài khoản
        </p>
        <p className="text-blue-600 text-xs font-medium mt-0.5 break-all">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Mật khẩu mới</label>
          <Input.Password
            placeholder="Ít nhất 8 ký tự"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 text-sm rounded-lg"
            disabled={resetMutation.isPending}
            autoFocus
          />
          <PasswordStrengthChecklist password={password} />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Xác nhận mật khẩu</label>
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="h-10 text-sm rounded-lg"
            disabled={resetMutation.isPending}
          />
          {passwordConfirmation && (
            <p className={`text-xs mt-1 px-1 ${password === passwordConfirmation ? 'text-green-600' : 'text-red-500'}`}>
              {password === passwordConfirmation ? '✓ Mật khẩu khớp' : 'Mật khẩu chưa khớp'}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-red-600 m-0">{error}</p>
          </div>
        )}

        <Button
          type="primary"
          htmlType="submit"
          loading={resetMutation.isPending}
          className="w-full h-10 bg-blue-600 hover:bg-blue-700 border-none rounded-lg font-semibold tracking-wide text-white"
        >
          XÁC NHẬN ĐỔI MẬT KHẨU
        </Button>

        <button
          type="button"
          className="w-full text-xs text-blue-600 hover:underline pt-1"
          onClick={() => router.push(APP_ROUTE.login)}
        >
          Quay lại đăng nhập
        </button>
      </form>
    </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 font-sans flex items-center justify-center">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-indigo-400/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm mx-auto px-6 py-10">
        <Suspense fallback={
          <div className="bg-white rounded-2xl shadow-2xl px-6 py-10 text-center text-gray-400 text-sm">
            Đang tải...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
