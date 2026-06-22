import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginForm from '@shared/components/auth/LoginForm';
import { getKey } from '@shared/types/I18nKeyType';
import { useLogin, useVerify2FA } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routers';
import { Button, Form, Input, Card, Space, Typography, message } from 'antd';
import { useState } from 'react';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const verifyMutation = useVerify2FA();
  const [otpForm] = Form.useForm();

  const handleVerifyOtp = (values: { otp: string }) => {
    verifyMutation.mutate(
      { code: values.otp },
      {
        onSuccess: () => {
          message.success('Xác thực 2FA thành công!');
        },
        onError: (err: any) => {
          message.error(err?.response?.data?.message || 'Mã OTP không chính xác.');
        },
      }
    );
  };

  const is2FA = loginMutation.isSuccess && loginMutation.data?.requires_2fa;
  const isSetup = loginMutation.data?.is_setup;
  const secret = loginMutation.data?.secret;
  const qrCodeUrl = loginMutation.data?.qr_code_url;

  if (is2FA) {
    return (
      <div className="flex flex-col items-center w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6 select-none">
          <img
            src="/images/logo.png"
            alt="The Library Dashboard"
            className="w-20 h-20 object-contain animate-heartbeat hover-clickable"
          />
          <p className="text-gray-500 mt-2 text-sm font-semibold tracking-wider uppercase">
            Xác thực 2 lớp (2FA)
          </p>
        </div>

        <Card className="w-full shadow-lg rounded-2xl">
          <div className="mb-4 text-center">
            <Typography.Title level={4} className="!m-0">
              {isSetup ? 'Thiết lập Google Authenticator' : 'Xác thực OTP'}
            </Typography.Title>
            <Typography.Text type="secondary" className="text-xs block mt-1">
              {isSetup 
                ? 'Quét mã QR dưới đây hoặc nhập mã thủ công vào ứng dụng của bạn'
                : 'Mở ứng dụng Google Authenticator và nhập mã xác thực 6 chữ số'}
            </Typography.Text>
          </div>

          <Form
            form={otpForm}
            layout="vertical"
            onFinish={handleVerifyOtp}
            disabled={verifyMutation.isPending}
          >
            {isSetup && qrCodeUrl && (
              <div className="flex flex-col items-center justify-center p-3 border rounded-xl bg-gray-50 mb-4 gap-2">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeUrl)}`} 
                  alt="2FA QR Code" 
                  className="w-36 h-36 border-4 border-white shadow-sm"
                />
                <div className="text-center w-full">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Mã khóa thủ công:</span>
                  <code className="text-xs font-mono font-bold text-gray-800 bg-gray-200 px-2 py-0.5 rounded select-all block mt-0.5 break-all">{secret}</code>
                </div>
              </div>
            )}

            <Form.Item
              name="otp"
              rules={[
                { required: true, message: 'Vui lòng nhập mã OTP' },
                { pattern: /^\d{6}$/, message: 'Mã OTP phải gồm 6 chữ số' }
              ]}
            >
              <Input
                placeholder="Nhập mã OTP 6 số"
                size="large"
                maxLength={6}
                className="!rounded-lg text-center tracking-[0.2em] font-bold text-lg"
              />
            </Form.Item>

            <Space direction="vertical" className="w-full" size="small">
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={verifyMutation.isPending}
                className="!rounded-lg !font-medium"
              >
                Xác nhận
              </Button>
              <Button
                block
                size="large"
                className="!rounded-lg"
                onClick={() => {
                  loginMutation.reset();
                  otpForm.resetFields();
                }}
              >
                Quay lại
              </Button>
            </Space>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center text-center mb-6 select-none">
        <img
          src="/images/logo.png"
          alt="The Library Dashboard"
          className="w-20 h-20 object-contain animate-heartbeat hover-clickable"
        />
        <p className="text-gray-500 mt-2 text-sm font-semibold tracking-wider uppercase">
          The Library Dashboard
        </p>
      </div>
      <LoginForm
        t={t}
        title={t(getKey('login_admin_title'))}
        loginMutation={loginMutation}
        onForgotPassword={() => navigate(ROUTES.FORGOTPW)}
      />
    </div>
  );
};

export default LoginPage;
