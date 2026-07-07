import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { setCookie, clearCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { IResponseLogin } from '@shared/types/AuthType';
import { APP_ROUTE } from '@/constants/routes';
import { authApi } from '../api/authApi';
import {
  mockSignIn,
  mockSignUp,
  mockForgotPassword,
  mockResetPassword,
  mockVerifyRegistrationOtp,
  mockResendRegistrationOtp,
} from '@/lib/mock/mockAuth';
import { useUser } from '@shared/provider/UserProvider';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const useLogin = () => {
  const router = useRouter();
  const { setUser } = useUser();

  return useMutation<
    IResponseLogin,
    AxiosError,
    { email: string; password: string }
  >({
    mutationFn: USE_MOCK ? mockSignIn : authApi.signIn,
    onSuccess: (data) => {
      setCookie(STORAGES.ACCESS_TOKEN, data?.accessToken);
      if (data?.user) {
        setCookie(STORAGES.USER_LOGIN, data.user);
        setUser(data.user);
      }
      if (data?.user?.role === 'admin' || data?.user?.role === 'librarian') {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const adminUrl = isLocal ? 'http://localhost:5173/dashboard' : 'https://cms.fengshuimasteracademy.com/dashboard';
        window.location.href = adminUrl;
      } else {
        router.push(APP_ROUTE.home);
      }
    },
  });
};

// Step 1 — validate + send OTP. Navigation to the OTP step is handled at the
// call site (same pattern as useForgotPassword below), since the register form
// itself switches to an inline OTP view instead of routing away.
export const useRegister = () => {
  return useMutation<
    { success: boolean; message: string },
    AxiosError,
    { full_name: string; email: string; password: string; password_confirmation: string }
  >({
    mutationFn: USE_MOCK ? mockSignUp : authApi.signUp,
  });
};

// Step 2 — verify OTP. full_name/password are re-submitted here (mirrors the
// existing change-password OTP flow) because the account is only created now,
// after Gmail ownership has been proven.
export const useVerifyRegistrationOtp = () => {
  return useMutation<
    { success: boolean; message: string; token: string; user_id: number; role: string },
    AxiosError,
    { email: string; otp: string; full_name?: string; password?: string; password_confirmation?: string }
  >({
    mutationFn: USE_MOCK ? mockVerifyRegistrationOtp : authApi.verifyRegistrationOtp,
  });
};

export const useResendRegistrationOtp = () => {
  return useMutation<{ message: string }, AxiosError, { email: string }>({
    mutationFn: USE_MOCK ? mockResendRegistrationOtp : authApi.resendRegistrationOtp,
  });
};

export const useForgotPassword = () => {
  return useMutation<{ message: string }, AxiosError, { email: string }>({
    mutationFn: USE_MOCK ? mockForgotPassword : authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation<
    { message: string },
    AxiosError,
    { token: string; email: string; password: string; password_confirmation: string }
  >({
    mutationFn: USE_MOCK ? mockResetPassword : authApi.resetPassword,
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: USE_MOCK ? async () => undefined : authApi.signOut,
    onSettled: () => {
      clearCookie(STORAGES.ACCESS_TOKEN);
      clearCookie(STORAGES.REFRESH_TOKEN);
      clearCookie(STORAGES.USER_LOGIN);
      router.push(APP_ROUTE.login);
    },
  });
};
