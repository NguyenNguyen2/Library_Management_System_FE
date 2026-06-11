import { AxiosProgressEvent } from 'axios';
import axiosInstance from '@/lib/axios/axios-client';
import { IFileUpload } from '../types';

export const uploadApi = {
  /**
   * Upload files as multipart/form-data.
   * Signature matches shared ImageUpload `uploadFn` prop so it can be passed directly.
   */
  upload: async (
    files: File[],
    folder: string,
    onProgress?: (e: AxiosProgressEvent) => void
  ): Promise<IFileUpload[]> => {
    const formData = new FormData();
    formData.append('type', folder);
    files.forEach((f) => formData.append('files', f));

    const response = await axiosInstance.post('/v1/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });

    return response?.data?.results?.object ?? [];
  },
};
