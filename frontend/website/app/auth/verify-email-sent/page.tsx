'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { App, Button, Spin } from 'antd';
import { CheckCircleOutlined, MailOutlined, ReloadOutlined } from '@ant-design/icons';

function VerifyEmailSentContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { message }  = App.useApp();

  const email = decodeURIComponent(searchParams.get('email') ?? '');

  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((v) => {
        if (v <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  };

  const handleResend = async () => {
    if (!email || resending || countdown > 0) return;
    setResending(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';
      const res = await fetch(`${apiUrl}/v1/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.status === 429) {
        message.warning(data.message ?? 'Vui lòng chờ trước khi gửi lại.');
      } else if (res.ok) {
        message.success('Đã gửi lại email xác minh.');
        startCountdown();
      } else {
        message.error(data.message ?? 'Gửi lại thất bại. Vui lòng thử lại.');
      }
    } catch {
      message.error('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <MailOutlined className="text-4xl text-blue-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">Đăng ký thành công!</h2>
        <p className="text-gray-500 text-sm">Chúng tôi đã gửi email xác minh tới:</p>

        {email ? (
          <p className="text-blue-700 font-semibold text-sm mt-1 mb-4 break-all">{email}</p>
        ) : (
          <p className="text-gray-400 text-sm mt-1 mb-4 italic">hộp thư của bạn</p>
        )}

        <p className="text-gray-500 text-sm mb-5">
          Bạn cần xác minh email trước khi có thể đăng nhập.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600 text-left space-y-2 mb-6">
          <p className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">①</span>
            Mở hộp thư email của bạn
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">②</span>
            Nhấn nút <strong>Xác minh email</strong> trong thư
          </p>
          <p className="flex items-start gap-2">
            <span className="text-blue-500 font-bold mt-0.5">③</span>
            Quay lại và nhấn <strong>Tôi đã xác minh — Đăng nhập</strong>
          </p>
          <p className="text-gray-400 pt-1 border-t border-gray-100 mt-1">Không thấy email? Kiểm tra thư mục Spam.</p>
        </div>

        <div className="space-y-3">
          <Button
            htmlType="button"
            icon={<MailOutlined />}
            className="w-full h-10"
            onClick={() => window.open('https://mail.google.com', '_blank')}
          >
            Mở Gmail
          </Button>

          <Button
            htmlType="button"
            icon={<ReloadOutlined />}
            loading={resending}
            disabled={countdown > 0 || !email}
            className="w-full h-10"
            onClick={handleResend}
          >
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại email xác minh'}
          </Button>

          <Button
            type="primary"
            htmlType="button"
            icon={<CheckCircleOutlined />}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 border-none"
            onClick={() => router.replace('/login')}
          >
            Tôi đã xác minh — Đăng nhập
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Spin size="large" />
        </div>
      }
    >
      <VerifyEmailSentContent />
    </Suspense>
  );
}
