import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { setCookie, clearCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { IResponseLogin } from '@shared/types/AuthType';
import { APP_ROUTE } from '@/constants/routes';
import { authApi } from '../api/authApi';

export const useLogin = () => {
  const router = useRouter();

  return useMutation<
    IResponseLogin,
    AxiosError,
    { email: string; password: string }
  >({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      console.log('data', data);
      setCookie(STORAGES.ACCESS_TOKEN, data?.accessToken);
      if (data?.user) {
        setCookie(STORAGES.USER_LOGIN, data.user);
      }
      router.push(APP_ROUTE.home);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: authApi.signOut,
    onSettled: () => {
      clearCookie(STORAGES.ACCESS_TOKEN);
      clearCookie(STORAGES.REFRESH_TOKEN);
      clearCookie(STORAGES.USER_LOGIN);
      router.push(APP_ROUTE.login);
    },
  });
};
