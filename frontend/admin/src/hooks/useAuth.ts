import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { authApi } from '../api/authApi';
import { ROUTES } from '../constants/routers';
import { STORAGES } from '@shared/constants/storage';
import { GeneralErrorType } from '@shared/types/GeneralType';
import { IResponseLogin } from '@shared/types/AuthType';
import { setCookie } from '@shared/utils/cookie';
import { useGlobalVariable } from './GlobalVariableProvider';
import { handleLogoutFunction } from '../api/axiosInstance';

export const useLogin = () => {
  const navigate = useNavigate();
  const { setUser } = useGlobalVariable();
  return useMutation<
    IResponseLogin,
    AxiosError<GeneralErrorType>,
    { email: string; password: string }
  >({
    mutationFn: authApi.signIn,
    onSuccess: (data) => {
      const userClone = _.cloneDeep(data?.user);
      setUser(userClone);
      setCookie(STORAGES.USER_LOGIN, userClone);
      setCookie(STORAGES.ACCESS_TOKEN, data?.accessToken);
      navigate(ROUTES.USERS);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { setUser } = useGlobalVariable();

  return useMutation({
    mutationFn: authApi.signOut,
    // Always clear client-side state, even if the API call fails
    // (e.g. expired token) so the user is not stuck on a dead session.
    onSettled: () => {
      handleLogoutFunction();
      setUser(undefined);
      queryClient.clear();
    },
  });
};
