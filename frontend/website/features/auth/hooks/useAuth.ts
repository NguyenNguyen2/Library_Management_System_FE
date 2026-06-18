import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { setCookie, clearCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { IResponseLogin } from '@shared/types/AuthType';
import { APP_ROUTE } from '@/constants/routes';
import { authApi } from '../api/authApi';
import { mockSignIn, mockSignUp, mockForgotPassword, mockResetPassword } from '@/lib/mock/mockAuth';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const useLogin = () => {
  const router = useRouter();

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
      }
      router.push(APP_ROUTE.home);
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation<
    IResponseLogin,
    AxiosError,
    { full_name: string; email: string; password: string; password_confirmation: string }
  >({
    mutationFn: USE_MOCK ? mockSignUp : authApi.signUp,
    onSuccess: (data) => {
      setCookie(STORAGES.ACCESS_TOKEN, data?.accessToken);
      if (data?.user) {
        setCookie(STORAGES.USER_LOGIN, data.user);
      }
      router.push(APP_ROUTE.home);
    },
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
