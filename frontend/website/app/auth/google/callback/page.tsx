'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { App, Spin } from 'antd';
import { setCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { useUser } from '@shared/provider/UserProvider';
import { APP_ROUTE } from '@/constants/routes';
import type { IDetailUser } from '@shared/types/UserType';

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed:      'Xác thực Google thất bại.',
  email_required:    'Tài khoản Google không có email.',
  account_locked:    'Tài khoản đã bị khoá.',
  admin_not_allowed: 'Admin không thể đăng nhập qua Google.',
  server_error:      'Lỗi máy chủ, vui lòng thử lại.',
};

function CallbackContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { message }  = App.useApp();
  const { setUser }  = useUser();
  const handled      = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token  = searchParams.get('token');
    const userId = searchParams.get('user_id');
    const error  = searchParams.get('error');

    if (error) {
      message.error(ERROR_MESSAGES[error] ?? 'Đăng nhập Google thất bại.');
      router.replace(APP_ROUTE.login);
      return;
    }

    if (!token || !userId) {
      message.error('Phản hồi xác thực không hợp lệ.');
      router.replace(APP_ROUTE.login);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

    fetch(`${apiUrl}/v1/profile/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error('fetch_failed');
        return res.json();
      })
      .then((profile) => {
        const user: IDetailUser = {
          id:      String(profile.user_id),
          name:    profile.full_name,
          email:   profile.email,
          role:    'reader',
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
        message.error('Không thể lấy thông tin người dùng. Vui lòng thử lại.');
        router.replace(APP_ROUTE.login);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Spin size="large" />
      <p className="text-gray-500">Đang xử lý đăng nhập...</p>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Spin size="large" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
