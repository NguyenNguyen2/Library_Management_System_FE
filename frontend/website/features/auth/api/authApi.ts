import axiosInstance from '@/lib/axios/axios-client';

export const authApi = {
  signIn: async (body: { email: string; password: string }) => {
    const response = await axiosInstance.post('/v1/auth/login', body);
    return response?.data?.results?.object;
  },
  signOut: async () => {
    return await axiosInstance.post('/v1/auth/logout');
  },
  signUp: async (body: { full_name: string; email: string; password: string; password_confirmation: string }) => {
    const response = await axiosInstance.post('/v1/auth/register', body);
    return response?.data as { success: boolean; message: string };
  },
  verifyRegistrationOtp: async (body: {
    email: string;
    otp: string;
    full_name?: string;
    password?: string;
    password_confirmation?: string;
  }) => {
    const response = await axiosInstance.post('/v1/auth/verify-registration-otp', body);
    return response?.data as { success: boolean; message: string; token: string; user_id: number; role: string };
  },
  resendRegistrationOtp: async (body: { email: string }) => {
    const response = await axiosInstance.post('/v1/auth/resend-verification', body);
    return response?.data as { message: string };
  },
  forgotPassword: async (body: { email: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/v1/auth/forgot-password', body);
    return response?.data;
  },
  verifyForgotPasswordOtp: async (body: { email: string; otp: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/v1/auth/verify-forgot-password-otp', body);
    return response?.data;
  },
  resetPassword: async (body: { email: string; otp: string; password: string; password_confirmation: string }): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/v1/auth/reset-password', body);
    return response?.data;
  },
};
