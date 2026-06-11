import axiosInstance from '@/lib/axios/axios-client';
import { IDetailUser } from '@shared/types/UserType';

export const userApi = {
  /**
   * Partially update a user (name, avatar, …). Matches the website endpoint
   * `PATCH /v1/users/:id` — same DTO backing the admin update flow.
   */
  updateUser: async (id: string, body: Partial<IDetailUser>) => {
    const response = await axiosInstance.patch<{
      results: { object: IDetailUser };
    }>(`/v1/users/${id}`, body);
    return response?.data?.results?.object;
  },
};
