import axiosInstance from './axiosInstance';
import { DetailResponseType } from '@shared/types/GeneralType';

export interface IPlatformSettings {
  id: string;
  videoLockDays: number;
  quizPassThreshold: number;
  quizRetryLimit: number;
  inactiveUserPasswordResetDays: number;
  createdAt: string;
  updatedAt: string;
}

export type IPlatformSettingsPayload = Partial<
  Pick<
    IPlatformSettings,
    | 'videoLockDays'
    | 'quizPassThreshold'
    | 'quizRetryLimit'
    | 'inactiveUserPasswordResetDays'
  >
>;

export const settingsApi = {
  get: async (): Promise<IPlatformSettings> => {
    const response = await axiosInstance.get<
      DetailResponseType<IPlatformSettings>
    >('/private/v1/settings');
    return response?.data?.results?.object;
  },

  update: async (
    body: IPlatformSettingsPayload,
  ): Promise<IPlatformSettings> => {
    const response = await axiosInstance.patch<
      DetailResponseType<IPlatformSettings>
    >('/private/v1/settings', body);
    return response?.data?.results?.object;
  },
};
