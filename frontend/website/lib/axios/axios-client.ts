import { STORAGES } from '@shared/constants/storage';
import { clearCookie, getCookie } from '@shared/utils/cookie';
import axios from 'axios';
import { APP_ROUTE } from '@/constants/routes';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  let token: string | undefined;

  if (typeof window === 'undefined') {
    // server-side only: dynamic import để bundler không include "next/headers" trong client bundle
    const { cookies } = await import('next/headers');
    token = await cookies().then(
      (res) => res.get(STORAGES.ACCESS_TOKEN)?.value
    );
  } else {
    token = getCookie(STORAGES.ACCESS_TOKEN);
  }

  const publicUrl =
    config?.url?.includes('/auth') && !config?.url?.includes('/logout');

  if (token && !publicUrl && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogoutUrl = error?.config?.url?.includes('/auth/logout');
    // Force-logout on 401 from non-logout endpoints.
    // Only run on client-side (window exists) to avoid SSR errors.
    if (
      error?.response?.status === 401 &&
      !isLogoutUrl &&
      typeof window !== 'undefined'
    ) {
      handleLogoutFunction();
    }
    return Promise.reject(error);
  }
);

/**
 * Clear auth cookies and redirect to login.
 * Client-only (uses window.location).
 */
export const handleLogoutFunction = () => {
  clearCookie(STORAGES.ACCESS_TOKEN);
  clearCookie(STORAGES.REFRESH_TOKEN);
  clearCookie(STORAGES.USER_LOGIN);
  window.location.href = APP_ROUTE.login;
};

export default axiosInstance;
