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
};
