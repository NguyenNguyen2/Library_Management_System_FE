'use client';

import { CloseOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { App, Button, Image, Progress, Spin, Upload, UploadProps } from 'antd';
const { Dragger } = Upload;
import ImgCrop from 'antd-img-crop';
import { AxiosProgressEvent } from 'axios';
import _, { debounce, throttle } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '../../constants/commonConst';
import { formatNumber } from '../../utils/numberUtils';
import { COLORS } from '../../constants/color';

export type TUploadFolder =
  | 'avatar'
  | 'course'
  | 'lesson'
  | 'achievement'
  | 'misc';

export interface IFileUpload {
  key: string;
  fileName: string;
  fileUrl: string;
  size: number;
  fileType: string;
}

type UploadFn = (params: {
  files: File[];
  folder: string;
  onProgress?: (e: AxiosProgressEvent) => void;
}) => Promise<IFileUpload[]>;

const BASE = 1024 as const;
function BytesToMB(bytes: number): number {
  return Math.round((bytes / (BASE * BASE)) * 100) / 100;
}

function calcUploadSpeed(e: AxiosProgressEvent): number {
  if (!e?.rate) return 0;
  return BytesToMB(e.rate);
}

function calcEtaSeconds(e: AxiosProgressEvent, MBps?: number): number {
  if (!e.total || !MBps || MBps <= 0) return 0;
  const remaining = e.total - (e.loaded ?? 0);
  if (remaining < 0) return 0;
  return Math.round(remaining / (MBps * 1024 * 1024));
}

function calcUploadedMB(e: AxiosProgressEvent): string {
  if (!e.total) return '0MB';
  return `${BytesToMB(e.loaded ?? 0)}MB / ${BytesToMB(e.total ?? 0)}MB`;
}

function calcUploadProgress(e: AxiosProgressEvent): number {
  const progress = e.progress ?? e.loaded / (e.total ?? 0);
  return Math.round(progress * 100);
}

function formatEta(seconds: number): string {
  if (seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface ICustomUploadProps extends Omit<
  UploadProps,
  'onChange' | 'value' | 'type'
> {
  maxSizeMB?: number;
  description?: string;
  onChange?: (value: IFileUpload[]) => void;
  crop?: boolean;
  aspect?: number;
  value?: IFileUpload[];
  isReplaceImageWhenEachUpload?: boolean;
  useDragger?: boolean;
  maxTotalSizeMB?: number;
  folder: TUploadFolder;
  variant?: 'default' | 'settingsDocument';
  hideUploadTrigger?: boolean;
  /** Upload function injected by consumer (different per app). */
  uploadFn: UploadFn;
  /** i18n labels — sensible Vietnamese defaults provided */
  labels?: Partial<{
    fileSizeExceeded: string;
    fileCountExceeded: string;
    totalSizeExceeded: string;
    clickToUpload: string;
    uploadButton: string;
    speed: string;
    estimatedTime: string;
  }>;
}

const CustomUpload: React.FC<ICustomUploadProps> = ({
  onChange,
  value,
  accept = '*',
  maxSizeMB = 5,
  maxCount = 1,
  multiple = false,
  crop = false,
  aspect = 16 / 9,
  disabled = false,
  description,
  isReplaceImageWhenEachUpload = false,
  useDragger = true,
  maxTotalSizeMB = 100,
  folder,
  variant = 'default',
  hideUploadTrigger = false,
  uploadFn,
  labels = {},
}) => {
  const { notification } = App.useApp();
  const t = {
    fileSizeExceeded: labels.fileSizeExceeded ?? `Ảnh vượt quá ${maxSizeMB}MB`,
    fileCountExceeded: labels.fileCountExceeded ?? `Tối đa ${maxCount} file`,
    totalSizeExceeded:
      labels.totalSizeExceeded ??
      `Tổng dung lượng vượt quá ${maxTotalSizeMB}MB`,
    clickToUpload: labels.clickToUpload ?? 'Nhấn để tải lên hoặc kéo thả',
    uploadButton: labels.uploadButton ?? 'Tải lên',
    speed: labels.speed ?? 'Tốc độ',
    estimatedTime: labels.estimatedTime ?? 'Còn lại',
  };

  const [uploading, setUploading] = useState(false);
  const [fileUploadList, setFileUploadList] = useState<IFileUpload[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [speedMbs, setSpeedMbs] = useState<number>(0);
  const [estTime, setEstTime] = useState<number>(0);
  const [uploadedMB, setUploadedMB] = useState<string>('0MB');

  useEffect(() => {
    if (value) setFileUploadList(value);
  }, [value]);

  const currentTotalMB = useMemo(
    () => BytesToMB(fileUploadList?.reduce((sum, f) => sum + f.size, 0)),
    [fileUploadList]
  );

  const acceptExtensions = useMemo(() => {
    if (!accept || accept === '*' || typeof accept !== 'string') return '';
    return accept
      .split(',')
      .map((ext: string) => ext.trim().replace('.', ''))
      .join(', ');
  }, [accept]);

  const throttledSetProgress = useMemo(
    () =>
      throttle(
        (p: number, s: number, e: number, u: string) => {
          setProgress(p);
          setSpeedMbs(s);
          setEstTime(e);
          setUploadedMB(u);
        },
        1000,
        { leading: true, trailing: true }
      ),
    []
  );

  const debouncedUpload = useMemo(
    () =>
      debounce(async (files: File[]) => {
        setUploading(true);
        try {
          const data = await uploadFn({
            files,
            folder,
            onProgress: (event: AxiosProgressEvent) => {
              throttledSetProgress(
                calcUploadProgress(event),
                calcUploadSpeed(event),
                calcEtaSeconds(event, calcUploadSpeed(event)),
                calcUploadedMB(event)
              );
            },
          });
          setFileUploadList((prev) => {
            const next = isReplaceImageWhenEachUpload
              ? [...data]
              : [...prev, ...data];
            onChange?.(next);
            return next;
          });
        } finally {
          setUploading(false);
          setProgress(0);
        }
      }, 100),
    [
      isReplaceImageWhenEachUpload,
      onChange,
      throttledSetProgress,
      uploadFn,
      folder,
    ]
  );

  useEffect(() => () => throttledSetProgress.cancel(), [throttledSetProgress]);

  const handleRemoveFile = (index: number) => {
    const clone = _.cloneDeep(fileUploadList);
    _.pullAt(clone, index);
    setFileUploadList(clone);
    onChange?.(clone);
  };

  const handleChange: UploadProps['onChange'] = (info) => {
    const files = info?.fileList?.map((file) => file.originFileObj as File);
    debouncedUpload(files);
  };

  const beforeUpload: UploadProps['beforeUpload'] = (file, fileList) => {
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      notification.error({ message: t.fileSizeExceeded });
      return Upload.LIST_IGNORE;
    }
    if (
      maxCount &&
      (fileList?.length > maxCount ||
        fileList?.length + fileUploadList?.length > maxCount)
    ) {
      notification.error({ message: t.fileCountExceeded });
      return Upload.LIST_IGNORE;
    }
    if (currentTotalMB + file.size / (1024 * 1024) > maxTotalSizeMB) {
      notification.error({ message: t.totalSizeExceeded });
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const isImageFile = (file: IFileUpload) => file.fileType?.includes('image');

  const FileItem: React.FC<{ file: IFileUpload; index: number }> = ({
    file,
    index,
  }) =>
    isImageFile(file) ? (
      <div className="w-full h-full">
        <div className="relative overflow-hidden w-full h-full rounded-lg">
          <Image
            src={file.fileUrl}
            alt={file.fileName}
            className="object-contain !w-full !h-full"
            rootClassName="!w-full !h-full"
            preview={{ mask: null }}
          />
          {variant !== 'settingsDocument' && (
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={
                <CloseOutlined style={{ color: COLORS.white, fontSize: 10 }} />
              }
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile(index);
              }}
              className="!absolute !top-[3px] !right-[3px] !bg-black/50 hover:!bg-black/70"
            />
          )}
        </div>
      </div>
    ) : (
      <div className="flex items-center gap-1.5">
        <Button
          type="text"
          size="small"
          icon={<CloseOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFile(index);
          }}
          className="!p-0 !size-4 !min-w-4"
        />
        <FileOutlined />
        <span className="text-sm">{file.fileName}</span>
        <span className="text-sm text-gray-400">
          ({BytesToMB(file.size)}MB)
        </span>
      </div>
    );

  const PreviewContent = () =>
    fileUploadList.length === 0 ? (
      useDragger ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <p className="text-sm text-gray-400 mb-0">
            {description ?? t.clickToUpload}
          </p>
        </div>
      ) : null
    ) : (
      <div className="w-full h-full">
        {fileUploadList.map((file, index) => (
          <FileItem key={file.key} file={file} index={index} />
        ))}
      </div>
    );

  const UploadButton = () => (
    <Button
      type="default"
      icon={<UploadOutlined />}
      disabled={disabled || fileUploadList.length >= maxCount}
      className="!h-10 flex items-center gap-1.5"
    >
      <span className="text-sm font-medium">{t.uploadButton}</span>
    </Button>
  );

  const UploadMeta = () => (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span>
        {fileUploadList.length}/{maxCount}
      </span>
      <span>|</span>
      <span>
        {currentTotalMB}MB/{formatNumber(maxTotalSizeMB)}MB
      </span>
      {acceptExtensions && (
        <>
          <span>|</span>
          <span>{acceptExtensions}</span>
        </>
      )}
    </div>
  );

  const renderUploadTrigger = () => {
    const uploadProps: UploadProps = {
      maxCount,
      accept,
      beforeUpload,
      multiple,
      disabled: disabled || fileUploadList.length >= maxCount,
      onChange: handleChange,
      showUploadList: false,
      fileList: [],
    };
    if (crop) {
      return (
        <ImgCrop rotationSlider aspect={aspect}>
          <Upload {...uploadProps}>
            <UploadButton />
          </Upload>
        </ImgCrop>
      );
    }
    return (
      <Upload {...uploadProps}>
        <UploadButton />
      </Upload>
    );
  };

  const ProgressSection = () => (
    <div className="flex flex-col gap-3 w-full mt-4">
      <Progress
        percent={progress}
        status={progress === 100 ? 'success' : 'active'}
        size="small"
      />
      <div className="flex gap-4 text-xs text-gray-500">
        <span>
          {t.speed}: {formatNumber(speedMbs)} MB/s
        </span>
        <span>
          {t.estimatedTime}: {formatEta(estTime)}
        </span>
        <span>{uploadedMB}</span>
      </div>
    </div>
  );

  const DraggerContent = () => {
    const draggerProps: UploadProps = {
      maxCount,
      accept,
      beforeUpload,
      multiple,
      disabled: disabled || fileUploadList.length >= maxCount,
      onChange: handleChange,
      showUploadList: false,
      fileList: [],
      openFileDialogOnClick: fileUploadList.length === 0,
    };
    return (
      <Dragger
        {...draggerProps}
        className={cn(
          '!border-dashed !border-gray-200 !rounded-lg !bg-white !overflow-hidden',
          'hover:!border-blue-400 !transition-colors',
          fileUploadList.length > 0
            ? '[&_.ant-upload-btn]:!p-0 [&_.ant-upload-btn]:!min-h-[200px]'
            : '[&_.ant-upload-btn]:!p-4 [&_.ant-upload-btn]:!min-h-20',
        )}
      >
        <PreviewContent />
      </Dragger>
    );
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* <div className="flex items-end justify-between w-full">
        {!hideUploadTrigger ? renderUploadTrigger() : <div />}
        <UploadMeta />
      </div> */}
      {uploading ? (
        <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-white min-h-20 flex items-center justify-center">
          <Spin />
        </div>
      ) : useDragger ? (
        <DraggerContent />
      ) : (
        <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-white min-h-20">
          <PreviewContent />
        </div>
      )}
      {uploading && <ProgressSection />}
    </div>
  );
};

export default CustomUpload;
