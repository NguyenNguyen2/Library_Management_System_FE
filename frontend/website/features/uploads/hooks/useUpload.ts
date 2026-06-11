import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { uploadApi } from '../api/uploadApi';
import { IFileUpload } from '../types';

interface UploadVariables {
  files: File[];
  folder: string;
}

export const useUpload = () => {
  return useMutation<IFileUpload[], AxiosError, UploadVariables>({
    mutationFn: ({ files, folder }) => uploadApi.upload(files, folder),
  });
};
