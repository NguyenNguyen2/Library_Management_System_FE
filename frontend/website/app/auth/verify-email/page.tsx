'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { App, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { APP_ROUTE } from '@/constants/routes';

const ERROR_MESSAGES: Record<string, string> = {
  expired:          'Link xác minh đã hết hạn (hiệu lực 24 giờ).',
  invalid:          'Link xác minh không hợp lệ.',
  not_found:        'Tài khoản không tồn tại.',
  already_verified: 'Email đã được xác minh trước đó.',
};

type State = 'loading' | 'success' | 'error' | 'idle';

function VerifyEmailContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { message }  = App.useApp();
  const handled      = useRef(false);

  const [state, setState]           = useState<State>('loading');
  const [errorCode, setErrorCode]   = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [resending, setResending]   = useState(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setState('idle');
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    fetch(`${apiUrl}/v1/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.error === 'already_verified') {
          setState('success');
        } else {
          setErrorCode(data.error ?? 'invalid');
          setErrorEmail(data.email ?? '');
          setState('error');
        }
      })
      .catch(() => {
        setErrorCode('invalid');
        setState('error');
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleResend = async () => {
    if (!errorEmail) return;
    setResending(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: errorEmail }),
      });
      const data = await res.json();
      if (res.status === 429) {
        message.warning(data.message ?? 'Vui lòng chờ trước khi gửi lại.');
      } else if (res.ok) {
        message.success(data.message ?? 'Email xác minh đã được gửi.');
      } else {
        message.error(data.message ?? 'Gửi lại thất bại. Vui lòng thử lại.');
      }
    } catch {
      message.error('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spin size="large" />
        <p className="text-gray-500">Đang xác minh email...</p>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Xác minh thành công!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Email của bạn đã được xác minh. Bạn có thể sử dụng đầy đủ tính năng thư viện.
          </p>
          <Button
            type="primary"
            className="w-full h-10"
            onClick={() => router.replace(APP_ROUTE.home)}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <CloseCircleOutlined className="text-5xl text-red-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Xác minh thất bại</h2>
          <p className="text-gray-500 text-sm mb-6">
            {ERROR_MESSAGES[errorCode] ?? 'Link xác minh không hợp lệ.'}
          </p>
          {errorCode === 'expired' && errorEmail && (
            <Button
              type="primary"
              icon={<MailOutlined />}
              loading={resending}
              className="w-full h-10 mb-2"
              onClick={handleResend}
            >
              Gửi lại email xác minh
            </Button>
          )}
          <Button
            className="w-full h-10"
            onClick={() => router.replace(APP_ROUTE.login)}
          >
            Quay lại đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <MailOutlined className="text-5xl text-blue-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Kiểm tra email của bạn</h2>
        <p className="text-gray-500 text-sm mb-6">
          Chúng tôi đã gửi link xác minh tới email của bạn. Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).
        </p>
        <Button
          className="w-full h-10"
          onClick={() => router.replace(APP_ROUTE.login)}
        >
          Quay lại đăng nhập
        </Button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Spin size="large" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
