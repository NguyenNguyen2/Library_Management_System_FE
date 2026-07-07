// Mock auth for development - used when NEXT_PUBLIC_USE_MOCK_DATA=true
// This will be replaced with real API calls when backend is ready

import type { IResponseLogin } from '@shared/types/AuthType';

const MOCK_DELAY = 300;

const MOCK_ACCOUNTS: Record<string, IResponseLogin> = {
  'docgia1@example.com': {
    accessToken: 'mock-access-token-reader',
    refreshToken: 'mock-refresh-token-reader',
    user: {
      id: 'mock-reader-1',
      email: 'docgia1@example.com',
      name: 'Nguyễn Văn A',
      role: 'reader',
    },
  },
  'thuthu1@library.com': {
    accessToken: 'mock-access-token-librarian',
    refreshToken: 'mock-refresh-token-librarian',
    user: {
      id: 'mock-librarian-1',
      email: 'thuthu1@library.com',
      name: 'Trần Thị Thủ Thư',
      role: 'librarian',
    },
  },
  'admin@library.com': {
    accessToken: 'mock-access-token-admin',
    refreshToken: 'mock-refresh-token-admin',
    user: {
      id: 'mock-admin-1',
      email: 'admin@library.com',
      name: 'Quản trị viên',
      role: 'admin',
    },
  },
};

// Accepts any email/password (matching the "demo accounts, any password" hint
// on the login page). Known demo emails get a matching role, anything else
// falls back to a reader account so the reader UI can always be reached.
export const mockSignIn = ({ email }: { email: string; password: string }): Promise<IResponseLogin> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = MOCK_ACCOUNTS[email.toLowerCase().trim()];
      resolve(
        account ?? {
          accessToken: 'mock-access-token-reader',
          refreshToken: 'mock-refresh-token-reader',
          user: {
            id: 'mock-reader-default',
            email,
            name: 'Độc giả',
            role: 'reader',
          },
        },
      );
    }, MOCK_DELAY);
  });
};

export const mockForgotPassword = (_body: { email: string }): Promise<{ message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Nếu email tồn tại, mã OTP đã được gửi.' });
    }, MOCK_DELAY);
  });
};

// Mock OTP is always "123456" for local/demo testing (mirrors mockVerifyRegistrationOtp).
export const mockVerifyForgotPasswordOtp = ({ otp }: { email: string; otp: string }): Promise<{ message: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp !== '123456') {
        reject({ response: { data: { message: 'OTP không chính xác.', error: 'invalid' } } });
        return;
      }
      resolve({ message: 'Xác minh OTP thành công.' });
    }, MOCK_DELAY);
  });
};

export const mockResetPassword = (_body: { email: string; otp: string; password: string; password_confirmation: string }): Promise<{ message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập.' });
    }, MOCK_DELAY);
  });
};

// New accounts always register as readers. Demo emails are treated as
// already taken, mirroring the "tài khoản demo" list shown on the login page.
export const mockSignUp = ({ email }: { full_name: string; email: string; password: string; password_confirmation: string }): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_ACCOUNTS[email.toLowerCase().trim()]) {
        reject({ response: { data: { results: { message: 'Email đã tồn tại' } } } });
        return;
      }
      resolve({ success: true, message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP xác minh tài khoản.' });
    }, MOCK_DELAY);
  });
};

// Mock OTP is always "123456" for local/demo testing.
export const mockVerifyRegistrationOtp = ({
  otp,
}: {
  email: string;
  otp: string;
  full_name?: string;
  password?: string;
  password_confirmation?: string;
}): Promise<{ success: boolean; message: string; token: string; user_id: number; role: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (otp !== '123456') {
        reject({ response: { data: { message: 'OTP không chính xác.', error: 'invalid' } } });
        return;
      }
      resolve({
        success: true,
        message: 'Xác minh email thành công.',
        token: 'mock-access-token-reader',
        user_id: 0,
        role: 'reader',
      });
    }, MOCK_DELAY);
  });
};

export const mockResendRegistrationOtp = (_body: { email: string }): Promise<{ message: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ message: 'Nếu email tồn tại và chưa xác minh, mã OTP sẽ được gửi.' });
    }, MOCK_DELAY);
  });
};
