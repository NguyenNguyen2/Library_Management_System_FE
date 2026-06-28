'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { App, Button, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { APP_ROUTE } from '@/constants/routes';
import { setCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { useUser } from '@shared/provider/UserProvider';
import type { IDetailUser } from '@shared/types/UserType';

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
  const { setUser }  = useUser();
  const handled      = useRef(false);

  const [state, setState]           = useState<State>('loading');
  const [errorCode, setErrorCode]   = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [resending, setResending]   = useState(false);

  const doAutoLogin = (token: string, userId: string, role: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
    fetch(`${apiUrl}/v1/profile/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('profile_failed');
        return res.json();
      })
      .then((profile) => {
        const user: IDetailUser = {
          id:      String(profile.user_id),
          name:    profile.full_name,
          email:   profile.email,
          role:    role,
          phone:   profile.phone    ?? undefined,
          address: profile.address  ?? undefined,
          avatar:  profile.avatar_url ?? undefined,
          status:  { value: '1', label: 'Active' },
        };
        setCookie(STORAGES.ACCESS_TOKEN, token);
        setCookie(STORAGES.USER_LOGIN, user);
        setUser(user);
        router.replace(APP_ROUTE.home);
      })
      .catch(() => {
        // Profile fetch failed — fallback to login with verified notification
        router.replace(`${APP_ROUTE.login}?verified=1`);
      });
  };

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
          if (data.token && data.user_id) {
            doAutoLogin(String(data.token), String(data.user_id), String(data.role ?? 'reader'));
          } else {
            router.replace(`${APP_ROUTE.login}?verified=1`);
          }
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
