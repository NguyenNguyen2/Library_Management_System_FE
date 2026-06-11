import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import i18n from 'i18next';
import { getKey } from '@shared/types/I18nKeyType';
import {
  IPlatformSettings,
  IPlatformSettingsPayload,
  settingsApi,
} from '../api/settingsApi';

const SETTINGS_KEY = ['platform-settings'] as const;

export const useFetchSettings = () =>
  useQuery<IPlatformSettings>({
    queryKey: SETTINGS_KEY,
    queryFn: settingsApi.get,
  });

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: IPlatformSettingsPayload) => settingsApi.update(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(SETTINGS_KEY, updated);
      message.success(i18n.t(getKey('settings_saved')));
    },
  });
};
