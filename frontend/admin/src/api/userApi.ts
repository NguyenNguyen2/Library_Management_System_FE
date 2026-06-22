import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
} from '@shared/types/UserType';
import {
  BaseListParams,
  DetailResponseType,
  ListResponseType,
} from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';

export const userApi = {
  getListUser: async (params: BaseListParams) => {
    const response = await axiosInstance.get<ListResponseType<IListUser>>(
      '/private/v1/users',
      { params }
    );
    return response?.data?.results?.objects;
  },

  getUserDetail: async (id: string) => {
    const response = await axiosInstance.get<DetailResponseType<IDetailUser>>(
      `/private/v1/users/${id}`
    );
    return response?.data?.results?.object;
  },

  createUser: async ({
    body,
  }: {
    body: ICreateUser;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.post('/private/v1/users', body);
    return response.data?.results?.object;
  },

  updateUser: async ({
    id,
    body,
  }: {
    id: string;
    body: IUpdateUser;
    index: number;
    params: BaseListParams;
  }) => {
    const response = await axiosInstance.patch(`/private/v1/users/${id}`, body);
    return response.data?.results?.object;
  },

  deleteUser: async ({ id }: { id: string; params: BaseListParams }) => {
    const response = await axiosInstance.delete(`/private/v1/users/${id}`);
    return response.data;
  },

  resetUserPassword: async ({ id }: { id: string }) => {
    const response = await axiosInstance.post(
      `/private/v1/users/${id}/reset-password`
    );
    return response.data?.results?.object ?? response.data;
  },

  getReaderBorrowHistory: async (id: string) => {
    const response = await axiosInstance.get(`/private/v1/readers/${id}/borrow-history`);
    return response.data?.results?.objects || [];
  },

  getLibrarians: async (params: { keyword?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/private/v1/librarians', { params });
    return response.data;
  },

  createLibrarian: async (body: { name: string; email: string; librarian_level: string; phone?: string; address?: string }) => {
    const response = await axiosInstance.post('/private/v1/librarians', body);
    return response.data?.results?.object;
  },

  updateLibrarian: async ({ id, body }: { id: string; body: { name?: string; email?: string; librarian_level?: string; phone?: string; address?: string; status?: number } }) => {
    const response = await axiosInstance.patch(`/private/v1/librarians/${id}`, body);
    return response.data?.results?.object;
  },

  deleteLibrarian: async (id: string) => {
    const response = await axiosInstance.delete(`/private/v1/librarians/${id}`);
    return response.data;
  },

  resetLibrarianPassword: async (id: string) => {
    const response = await axiosInstance.post(`/private/v1/librarians/${id}/reset-password`);
    return response.data?.results?.object;
  },

  getLoginLogs: async (params: { keyword?: string; status?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/private/v1/login-logs', { params });
    return response.data;
  },
};
