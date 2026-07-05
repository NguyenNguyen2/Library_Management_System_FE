import axiosInstance from './axiosInstance';

export interface ISystemSetting {
  setting_id: number;
  config_key: string;
  config_value: string;
  updated_at: string;
}

export type SystemSettingsPayload = Record<string, number>;

export const settingsApi = {
  // GET /private/v1/system-settings — returns one row per allowed config_key
  get: async (): Promise<ISystemSetting[]> => {
    const response = await axiosInstance.get<ISystemSetting[]>(
      '/private/v1/system-settings',
    );
    return response.data;
  },

  // POST /private/v1/system-settings/update — body: { settings: { config_key: value, ... } }
  update: async (settings: SystemSettingsPayload): Promise<ISystemSetting[]> => {
    const response = await axiosInstance.post<ISystemSetting[]>(
      '/private/v1/system-settings/update',
      { settings },
    );
    return response.data;
  },
};
