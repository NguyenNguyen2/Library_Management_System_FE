import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';
import type { IFileUpload } from '@shared/components/upload/CustomUpload';
import { FileUploadData, UploadProps } from '@shared/types/UploadType';
import { useGlobalVariable } from './GlobalVariableProvider';
import { uploadApi } from '../api/uploadApi';
import { configErr, configSuccess } from '@shared/constants/commonConst';

export const useUpload = () => {
  const { notification } = App.useApp();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { loadingUpload, setLoadingUpload } = useGlobalVariable();

  return useMutation<
    IFileUpload[],
    Error,
    {
      params: UploadProps;
      key: string;
      type: 'add' | 'replace';
      index?: number;
    }
  >({
    // uploadApi.upload(files, folder) — pass the two fields UploadProps carries.
    mutationFn: ({ params }) => uploadApi.upload(params.files, params.type),
    onMutate: async ({ key }) => {
      if (loadingUpload) {
        setLoadingUpload({ ...loadingUpload, [key]: true });
      }
    },
    onSuccess: (res, { key, type, index }) => {
      queryClient.setQueryData(
        [key],
        (_oldData: FileUploadData[] | undefined) => {
          const currentData =
            (queryClient.getQueryData([key]) as FileUploadData[]) ?? [];
          // API returns IFileUpload[]; cache is typed FileUploadData[]. Legacy
          // shape mismatch predates this file — cast at the boundary.
          const newValue = res as unknown as FileUploadData[];
          if (type === 'add') {
            currentData[index ?? 0] = newValue?.[0];
            return currentData;
          }
          return newValue;
        }
      );
      if (loadingUpload) {
        setLoadingUpload({ ...loadingUpload, [key]: false });
      }
      notification.success(configSuccess(t));
    },
    onError: (_, { key }) => {
      if (loadingUpload) {
        setLoadingUpload({ ...loadingUpload, [key]: false });
      }
      return notification.error(configErr(t));
    },
  });
};
