import { Form } from 'antd';
import { AxiosProgressEvent } from 'axios';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import CustomUpload, { IFileUpload } from '@shared/components/upload/CustomUpload';
import { uploadApi } from '../../../api/uploadApi';
import CustomInput from '@shared/components/input/CustomInput';

const uploadFn = async (params: {
  files: File[];
  folder: string;
  onProgress?: (e: AxiosProgressEvent) => void;
}) => uploadApi.upload(params.files, params.folder, params.onProgress);

/** Convert string URL from form → IFileUpload[] for CustomUpload value prop */
const urlToFileList = (url: unknown): { value: IFileUpload[] } => {
  if (!url || typeof url !== 'string') return { value: [] };
  return { value: [{ key: url, fileName: '', fileUrl: url, size: 0, fileType: 'image' }] };
};

/** Convert IFileUpload[] from CustomUpload onChange → string URL for form */
const fileListToUrl = (files: IFileUpload[]) => files[0]?.fileUrl ?? '';

const ModalCreateUpdateCourse = ({ isEdit = false }: { isEdit?: boolean }) => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
        {isEdit
          ? t(getKey('edit_course_title'))
          : t(getKey('create_course_title'))}
      </h2>
      <p className="mb-6 text-sm leading-5 text-grayMedium">
        {isEdit
          ? t(getKey('edit_course_desc'))
          : t(getKey('create_course_desc'))}
      </p>

      <Form.Item
        label={t(getKey('course_name'))}
        name="name"
        rules={[{ required: true, message: t(getKey('course_name_required')) }]}
      >
        <CustomInput placeholder={t(getKey('course_name'))} />
      </Form.Item>

      <Form.Item label={t(getKey('course_description'))} name="description">
        <CustomInput
          placeholder={t(getKey('course_description'))}
          isTextArea
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>

      <Form.Item
        name="image"
        label={t(getKey('course_thumbnail'))}
        getValueProps={urlToFileList}
        getValueFromEvent={fileListToUrl}
      >
        <CustomUpload
          folder="course"
          uploadFn={uploadFn}
          accept="image/*"
          maxCount={1}
          maxSizeMB={5}
          isReplaceImageWhenEachUpload
          labels={{ uploadButton: t(getKey('choose_image')) }}
        />
      </Form.Item>
    </>
  );
};

export default ModalCreateUpdateCourse;
