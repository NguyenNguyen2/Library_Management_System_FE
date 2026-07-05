import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { userApi } from '../api/userApi';
import { QueryKey } from '../constants/queryKey';
import {
  BaseListParams,
  ListResponseTypeObject,
} from '@shared/types/GeneralType';
import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
} from '@shared/types/UserType';

export const userHooks = {
  useFetchListUsers: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.users.list, params],
      queryFn: () => userApi.getListUser(params),
    });
  },

  useFetchDetailUser: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.users.detail, id],
      enabled: !!id && enabled,
      queryFn: () => userApi.getUserDetail(id),
    });
  },

  useCreateUser: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailUser,
      AxiosError,
      { body: ICreateUser; params: BaseListParams }
    >({
      mutationFn: userApi.createUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.users.list] });
      },
    });
  },

  useUpdateUser: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailUser,
      AxiosError,
      { id: string; body: IUpdateUser; index: number; params: BaseListParams }
    >({
      mutationFn: userApi.updateUser,
      onSuccess: (updated, { index, params }) => {
        queryClient.setQueryData<ListResponseTypeObject<IListUser>>(
          [QueryKey.users.list, params],
          (old) => {
            if (!old?.rows?.[index]) return old;
            const rows = [...old.rows];
            rows[index] = { ...rows[index], ...updated } as IListUser;
            return { ...old, rows };
          }
        );
      },
    });
  },

  useDeleteUser: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailUser,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: userApi.deleteUser,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.users.list] });
      },
    });
  },

  useResetUserPassword: () => {
    return useMutation<unknown, AxiosError, { id: string }>({
      mutationFn: userApi.resetUserPassword,
    });
  },

  useFetchReaderBorrowHistory: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: ['reader-borrow-history', id],
      enabled: !!id && enabled,
      queryFn: () => userApi.getReaderBorrowHistory(id),
    });
  },

  useFetchLibrarians: (params: { keyword?: string; page?: number; limit?: number }) => {
    return useQuery({
      queryKey: ['librarians-list', params],
      queryFn: () => userApi.getLibrarians(params),
    });
  },

  useCreateLibrarian: () => {
    const queryClient = useQueryClient();
    return useMutation<any, AxiosError, { name: string; email: string; librarian_level: string; phone?: string; address?: string }>({
      mutationFn: userApi.createLibrarian,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['librarians-list'] });
      },
    });
  },

  useUpdateLibrarian: () => {
    const queryClient = useQueryClient();
    return useMutation<any, AxiosError, { id: string; body: { name?: string; email?: string; librarian_level?: string; phone?: string; address?: string; status?: number } }>({
      mutationFn: userApi.updateLibrarian,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['librarians-list'] });
      },
    });
  },

  useDeleteLibrarian: () => {
    const queryClient = useQueryClient();
    return useMutation<any, AxiosError, string>({
      mutationFn: userApi.deleteLibrarian,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['librarians-list'] });
      },
    });
  },

  useResetLibrarianPassword: () => {
    return useMutation<any, AxiosError, string>({
      mutationFn: userApi.resetLibrarianPassword,
    });
  },

  useFetchLoginLogs: (params: { keyword?: string; status?: string; page?: number; limit?: number }) => {
    return useQuery({
      queryKey: ['login-logs-list', params],
      queryFn: () => userApi.getLoginLogs(params),
    });
  },
};
