import axiosInstance from '@/lib/axios/axios-client';

export interface IProfileData {
  user_id: number;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
}

// Backend trả về path tương đối: /storage/avatars/xxx.jpg
// Browser (Next.js port 3000) phải load từ Laravel (port 8000)
// => cần prepend base URL của Laravel
const toStorageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
  return `${base}${path}`;
};

export const profileApi = {
  getProfile: async (userId: string): Promise<IProfileData> => {
    const response = await axiosInstance.get(`/v1/profile/${userId}`);
    const data = response.data;
    return { ...data, avatar_url: toStorageUrl(data.avatar_url) };
  },

  updateProfile: async (
    userId: string,
    body: { full_name: string; phone?: string | null; address?: string | null }
  ): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/v1/profile/${userId}`, body);
    return response.data;
  },

  uploadAvatar: async (
    userId: string,
    file: File
  ): Promise<{ message: string; avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosInstance.post(`/v1/profile/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const data = response.data;
    return { ...data, avatar_url: toStorageUrl(data.avatar_url) ?? data.avatar_url };
  },
};
