import { Button, DatePicker, Flex, Form, message, Modal, Table, Tag, Select, Upload } from 'antd';
import { UploadOutlined, UserOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import CustomInput from '@shared/components/input/CustomInput';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import { generateRandomPassword } from '@shared/utils/passwordGenerator';
import { DEFAULT_PASSWORD } from '@shared/constants/commonConst';
import { userHooks } from '../../../hooks/useUsers';
import { IDetailUser } from '@shared/types/UserType';
import dayjs from 'dayjs';

interface IModalCreateEditUser {
  /** Injected by FilterTable via cloneElement when opening update/detail modal. */
  detail?: IDetailUser;
}

const AVATAR_ACCEPT = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

// Backend trả về đường dẫn tương đối (/storage/avatars/xxx.jpg) — cần prepend base URL của Laravel để hiển thị.
const resolveAvatarUrl = (avatar?: string | null): string | null => {
  if (!avatar) return null;
  return avatar.startsWith('http') ? avatar : `http://127.0.0.1:8000${avatar}`;
};

const ACHIEVEMENT_COLOR: Record<string, string> = {
  new: 'blue',
  expert: 'gold',
  master: 'purple',
};

// Độc giả mới tạo luôn có 0 lượt mượn sách -> luôn ở mức "Độc giả Mới".
const DEFAULT_NEW_ACHIEVEMENT = { value: 'new', label: 'Độc giả Mới' };

const ModalCreateEditUser = ({ detail }: IModalCreateEditUser) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const isEditMode = !!detail?.id;
  const achievement = (isEditMode && detail?.achievement) || DEFAULT_NEW_ACHIEVEMENT;

  // Ảnh đại diện được gửi kèm dưới dạng File thô trong payload lưu (giống ảnh bìa sách),
  // không qua endpoint upload chung /v1/uploads (endpoint đó chưa tồn tại ở backend).
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(
    resolveAvatarUrl(detail?.avatar)
  );

  const handleAvatarFileSelect = (file: File) => {
    if (!AVATAR_ACCEPT.includes(file.type)) {
      message.error('Chỉ chấp nhận ảnh định dạng JPG, JPEG, PNG hoặc WEBP!');
      return Upload.LIST_IGNORE;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      message.error('Ảnh đại diện không được vượt quá 5MB!');
      return Upload.LIST_IGNORE;
    }
    setAvatarPreviewUrl(URL.createObjectURL(file));
    form?.setFieldValue('avatar', file);
    return false; // ngăn antd tự upload — file được gửi kèm khi lưu độc giả
  };

  const handleRemoveAvatar = () => {
    setAvatarPreviewUrl(null);
    form?.setFieldValue('avatar', '');
  };

  const { mutate: resetUserPassword, isPending: isResetting } =
    userHooks.useResetUserPassword();

  const { data: borrowHistory, isLoading: isHistoryLoading } =
    userHooks.useFetchReaderBorrowHistory(detail?.id || '', !!detail?.id);

  const historyColumns = [
    { title: 'Tên sách', dataIndex: 'book_title', key: 'book_title', ellipsis: true },
    { title: 'Mã vạch', dataIndex: 'copy_barcode', key: 'copy_barcode', width: 100 },
    { title: 'Ngày mượn', dataIndex: 'borrow_date', key: 'borrow_date', render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : '—', width: 90 },
    { title: 'Hạn trả', dataIndex: 'due_date', key: 'due_date', render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : '—', width: 90 },
    { title: 'Ngày trả', dataIndex: 'return_date', key: 'return_date', render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY') : '—', width: 90 },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', width: 90, render: (s: string, record: any) => {
        const isReturned = !!record.return_date;
        let color = 'blue';
        let label = 'Đang mượn';
        if (isReturned) { color = 'green'; label = 'Đã trả'; }
        else if (s === 'overdue') { color = 'red'; label = 'Quá hạn'; }
        return <Tag color={color} className="!rounded">{label}</Tag>;
    }},
  ];

  const handleGenerateRandomPassword = () => {
    form?.setFieldValue('password', generateRandomPassword(10));
    // Re-validate the password field so the error (if any) is cleared immediately.
    form?.validateFields(['password']);
  };

  const handleResetPasswordConfirm = () => {
    Modal.confirm({
      title: t(getKey('reset_password_confirm_title')),
      content: t(getKey('reset_password_confirm_content')),
      okText: t(getKey('save_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () => {
        if (!detail?.id) return;
        resetUserPassword({ id: detail?.id });
      },
    });
  };

  return (
    <>
      <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft">
        {isEditMode
          ? t(getKey('edit_user_title'))
          : t(getKey('add_user_title'))}
      </h2>
      <p className="mb-6 text-sm leading-5 text-grayMedium">
        {t(getKey('add_user_desc'))}
      </p>

      {isEditMode && detail?.card_number && (
        <Flex gap={16} className="mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100 items-center justify-between">
          <span className="text-sm font-semibold text-navyDark">Số thẻ thư viện:</span>
          <span className="font-mono text-sm font-bold text-blue-600 bg-white border border-blue-200 px-2.5 py-0.5 rounded select-all shadow-sm">
            {detail.card_number}
          </span>
        </Flex>
      )}

      {/* Edit mode: reset-password action row — red note on the left, button on the right */}
      {isEditMode && (
        <Flex align="center" justify="space-between" className="mb-4">
          <span className="text-xs text-red-500">
            {t(getKey('reset_password_note'))}
          </span>
          <Button
            size="large"
            danger
            ghost
            loading={isResetting}
            onClick={handleResetPasswordConfirm}
            // className="!h-10 !rounded-lg !text-sm !font-medium"
          >
            {t(getKey('reset_password_default'))}
          </Button>
        </Flex>
      )}

      <Flex gap={16}>
        <Form.Item
          label={t(getKey('full_name'))}
          name="name"
          rules={[{ required: true, message: t(getKey('user_name_required')) }]}
          className="flex-1"
        >
          <CustomInput placeholder={t(getKey('full_name'))} />
        </Form.Item>

        <Form.Item
          label={t(getKey('email'))}
          name="email"
          rules={[
            { required: true, message: t(getKey('user_email_required')) },
            { type: 'email', message: t(getKey('email_invalid')) },
          ]}
          className="flex-1"
        >
          <CustomInput placeholder={t(getKey('email'))} readOnly={isEditMode} />
        </Form.Item>
      </Flex>

      <Flex gap={16}>
        <Form.Item label="Số điện thoại" name="phone" className="flex-1">
          <CustomInput placeholder="09xxxxxxx" />
        </Form.Item>

        <Form.Item label="Địa chỉ liên hệ" name="address" className="flex-1">
          <CustomInput placeholder="Nhập địa chỉ..." />
        </Form.Item>
      </Flex>

      <Flex gap={16}>
        <Form.Item
          label="Ngày sinh"
          name="date_of_birth"
          className="flex-1"
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                if (dayjs().diff(value, 'year') < 6) {
                  return Promise.reject(new Error('Độc giả phải từ đủ 6 tuổi trở lên.'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            className="w-full"
            size="large"
            format="DD/MM/YYYY"
            placeholder="Chọn ngày sinh"
            disabledDate={(current) => !!current && current > dayjs().endOf('day')}
          />
        </Form.Item>

        <Form.Item label="Giới tính" name="gender" className="flex-1">
          <Select size="large" placeholder="Chọn giới tính" allowClear>
            <Select.Option value="male">Nam</Select.Option>
            <Select.Option value="female">Nữ</Select.Option>
            <Select.Option value="other">Khác</Select.Option>
          </Select>
        </Form.Item>
      </Flex>

      <div className="mb-4">
        <p className="mb-1.5 text-sm font-medium text-blackSoft">Ảnh đại diện</p>
        <div className="flex items-center gap-4">
          {avatarPreviewUrl ? (
            <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-200 shadow-sm group">
              <img src={avatarPreviewUrl} alt="Ảnh đại diện" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="absolute top-0 right-0 bg-white/90 rounded-full p-0.5 shadow hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Xóa ảnh"
              >
                <CloseCircleOutlined style={{ color: '#ef4444', fontSize: 16 }} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
              <UserOutlined style={{ fontSize: 22 }} />
            </div>
          )}
          <Upload accept=".jpg,.jpeg,.png,.webp" showUploadList={false} beforeUpload={handleAvatarFileSelect} maxCount={1}>
            <Button icon={<UploadOutlined />}>{avatarPreviewUrl ? 'Đổi ảnh khác' : 'Tải ảnh lên'}</Button>
          </Upload>
          <span className="text-xs text-gray-400">JPG, JPEG, PNG, WEBP · tối đa 5MB</span>
        </div>
      </div>

      {!isEditMode && (
        <Form.Item
          name="password"
          initialValue={DEFAULT_PASSWORD}
          label={
            <Flex align="center" justify="space-between" className="w-full">
              <span>{t(getKey('password'))}</span>
              <Button
                size="small"
                type="link"
                onClick={handleGenerateRandomPassword}
                className="!p-0 !h-auto"
              >
                {t(getKey('generate_random_password'))}
              </Button>
            </Flex>
          }
          // Make the label row take full width so the button can sit on the right.
          className="[&_.ant-form-item-label]:w-full [&_.ant-form-item-label>label]:w-full"
          rules={[
            { required: true, message: t(getKey('password_field_required')) },
            {
              pattern: PASSWORD_PATTERN,
              message: t(getKey('password_invalid')),
            },
          ]}
        >
          <CustomInput.Password placeholder={t(getKey('password'))} />
        </Form.Item>
      )}

      <Flex gap={16} align="flex-start" className="mb-4">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-blackSoft">Danh hiệu độc giả</p>
          <Tag
            color={ACHIEVEMENT_COLOR[achievement.value] ?? 'default'}
            className="!rounded-md border-0 font-medium"
          >
            {achievement.label}
          </Tag>
          <p className="mt-1 text-xs text-grayMedium">
            Tự động tính theo số lượt mượn sách (Độc giả Mới / Độc giả Thân Thiết / Bậc Thầy Đọc Sách), không thể chỉnh sửa trực tiếp.
          </p>
        </div>
        {isEditMode && (
          <Form.Item
            label="Trạng thái tài khoản"
            name="status"
            className="flex-1"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái tài khoản' }]}
          >
            <Select size="large">
              <Select.Option value="1">Hoạt động</Select.Option>
              <Select.Option value="0">Đang khóa</Select.Option>
            </Select>
          </Form.Item>
        )}
      </Flex>

      {isEditMode && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-[14px] font-semibold leading-[20px] mb-3 text-blackSoft">
            Lịch sử mượn/trả sách
          </h3>
          <Table
            dataSource={borrowHistory}
            columns={historyColumns}
            rowKey="id"
            loading={isHistoryLoading}
            size="small"
            pagination={{ pageSize: 5, showSizeChanger: false }}
            locale={{ emptyText: 'Chưa có lịch sử mượn trả' }}
          />
        </div>
      )}
    </>
  );
};

export default ModalCreateEditUser;
