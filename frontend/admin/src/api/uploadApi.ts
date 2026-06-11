import { AxiosProgressEvent } from 'axios';
import axiosInstance from './axiosInstance';
import { IFileUpload } from '@shared/components/upload/CustomUpload';

export const uploadApi = {
  /**
   * Upload files via multipart/form-data. Backend returns IFileUpload[] with fileUrl.
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

  /** Convenience: upload single file and return URL only. */
  uploadSingleAndGetUrl: async (
    file: File,
    folder = 'misc'
  ): Promise<string> => {
    const result = await uploadApi.upload([file], folder);
    return result[0]?.fileUrl ?? '';
  },
};
