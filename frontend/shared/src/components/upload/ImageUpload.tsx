'use client';

import { UploadOutlined } from '@ant-design/icons';
import { Button, Image, Progress, Upload, UploadProps, App } from 'antd';
import { AxiosProgressEvent } from 'axios';
import { useState } from 'react';

export interface IFileUpload {
  key: string;
  fileName: string;
  fileUrl: string;
  size: number;
  fileType: string;
}

interface ImageUploadProps {
  /** Current image URL (controlled) */
  value?: string;
  /** Emits new image URL after successful upload */
  onChange?: (url: string) => void;
  /** Upload folder slug (e.g. 'course', 'avatar'). Sent as form field `type`. */
  folder: string;
  /** Axios instance caller (provided by consumer — different per app) */
  uploadFn: (
    files: File[],
    folder: string,
    onProgress?: (e: AxiosProgressEvent) => void,
  ) => Promise<IFileUpload[]>;
  /** Max size in MB (default 5) */
  maxSizeMB?: number;
  /** Fallback image if URL broken */
  fallback?: string;
  /** Preview image height in px (default 128) */
  previewHeight?: number;
  /** Button label */
  buttonLabel?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Self-contained image upload with preview + progress.
 * Consumer provides `uploadFn` so we don't couple to a specific API client.
 */
export default function ImageUpload({
  value,
  onChange,
  folder,
  uploadFn,
  maxSizeMB = 5,
  fallback,
  previewHeight = 128,
  buttonLabel = 'Chọn ảnh',
  disabled = false,
}: ImageUploadProps) {
  const { notification } = App.useApp();
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      notification.error({
        message: `Ảnh vượt quá ${maxSizeMB}MB`,
      });
      return Upload.LIST_IGNORE;
    }
    if (!file.type.startsWith('image/')) {
      notification.error({ message: 'Chỉ cho phép file ảnh' });
      return Upload.LIST_IGNORE;
    }
    // Return false to block auto upload; customRequest will handle it
    return false;
  };

  const handleChange: UploadProps['onChange'] = async (info) => {
    const file = info.fileList[0]?.originFileObj as File | undefined;
    if (!file) return;

    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadFn([file], folder, (e) => {
        if (e.total) {
          setProgress(Math.round(((e.loaded ?? 0) / e.total) * 100));
        }
      });
      const uploaded = result[0];
      if (uploaded?.fileUrl) {
        onChange?.(uploaded.fileUrl);
      }
    } catch {
      notification.error({ message: 'Tải ảnh thất bại' });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Upload
        accept="image/*"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        disabled={disabled || uploading}
        maxCount={1}
      >
        <Button
          block
          icon={<UploadOutlined />}
          loading={uploading}
          disabled={disabled}
          className="!h-10 !rounded-lg !font-medium"
        >
          {buttonLabel}
        </Button>
      </Upload>

      {uploading && <Progress percent={progress} size="small" />}

      {value && !uploading && previewHeight > 0 && (
        <Image
          src={value}
          alt="preview"
          className="!rounded-[10px] object-cover"
          width="100%"
          height={previewHeight}
          preview={false}
          fallback={fallback}
        />
      )}
    </div>
  );
}
