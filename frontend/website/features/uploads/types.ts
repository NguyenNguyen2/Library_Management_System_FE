/**
 * Upload types shared with backend UploadsService response shape.
 * Must match `UploadedFileInfo` in backend/libs/shared/src/modules/uploads/uploads.service.ts
 */
export interface IFileUpload {
  key: string;
  fileName: string;
  fileUrl: string;
  size: number;
  fileType: string;
}

/** Folder slug for grouping uploads on disk/CDN. Extend as needed. */
export type TUploadFolder =
  | 'avatar'
  | 'course'
  | 'lesson'
  | 'achievement'
  | 'misc';
