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

export interface ReaderListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  card: 'regular' | 'premium';
  card_number: string;
  borrowing: number;
  overdue: number;
  status: { value: string; label: string };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BorrowHistoryRow {
  borrow_id: number;
  borrow_date: string;
  due_date: string;
  status: string;
  librarian_name: string | null;
  book_title: string;
  copy_barcode: string;
  return_date: string | null;
  condition_return: string | null;
  renew_count: number;
  fine_amount: number;
  fine_status: string | null;
}

// Chuyển object dữ liệu độc giả (có thể chứa File ảnh đại diện) thành multipart FormData.
const buildUserFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value === null) {
      formData.append(key, '');
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

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
    const hasAvatarFile = (body as { avatar?: unknown }).avatar instanceof File;
    if (hasAvatarFile) {
      const formData = buildUserFormData(body as unknown as Record<string, unknown>);
      const response = await axiosInstance.post('/private/v1/users', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.results?.object;
    }
    const response = await axiosInstance.post('/private/v1/users', body);
    return response.data?.results?.object;
  },

  requestReaderEmailVerification: async (body: ICreateUser & { password: string }) => {
    const hasAvatarFile = (body as { avatar?: unknown }).avatar instanceof File;
    const payload = hasAvatarFile
      ? buildUserFormData(body as unknown as Record<string, unknown>)
      : body;
    const response = await axiosInstance.post('/private/v1/users/email-verification/request', payload,
      hasAvatarFile ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined);
    return response.data;
  },

  getReaderEmailVerificationStatus: async (token: string) => {
    const response = await axiosInstance.get('/private/v1/users/email-verification/status', { params: { token } });
    return response.data?.status as string;
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
    const hasAvatarFile = (body as { avatar?: unknown }).avatar instanceof File;
    if (hasAvatarFile) {
      const formData = buildUserFormData(body as unknown as Record<string, unknown>);
      formData.append('_method', 'PATCH');
      const response = await axiosInstance.post(`/private/v1/users/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data?.results?.object;
    }
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

  getReaderList: async (params: { keyword?: string; page?: number; limit?: number }): Promise<{ total: number; rows: ReaderListItem[] }> => {
    const response = await axiosInstance.get('/private/v1/readers', { params });
    return response.data?.results?.objects ?? { total: 0, rows: [] };
  },

  getReaderBorrowHistory: async (id: string): Promise<BorrowHistoryRow[]> => {
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

  getLoginLogs: async (params: { keyword?: string; status?: string; from?: string; to?: string; page?: number; limit?: number }) => {
    const response = await axiosInstance.get('/private/v1/login-logs', { params });
    return response.data;
  },

  getActivityLogs: async (params: {
    keyword?: string;
    module?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ objects: ActivityLogRow[]; total: number; per_page: number; page: number }> => {
    const response = await axiosInstance.get('/private/v1/activity-logs', { params });
    return response.data?.results ?? { objects: [], total: 0, per_page: params.per_page ?? 20, page: 1 };
  },
};

export interface ActivityLogRow {
  audit_id: number;
  actor_id: number;
  action: string;
  module: string | null;
  table_name: string;
  record_id: number;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  description: string | null;
  ip_address: string | null;
  created_at: string;
  user?: { user_id: number; full_name: string; email: string } | null;
}
