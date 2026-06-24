'use client';

import { Avatar, Card, Button, Form, Input, Modal, Spin, Upload, message } from 'antd';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import {
  ArrowLeftOutlined,
  CameraOutlined,
  LoadingOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { AxiosError } from 'axios';
import CustomInput from '@shared/components/input/CustomInput';
import { useUser } from '@shared/provider/UserProvider';
import { useRequestChangePassword, useVerifyChangePasswordOtp } from '@/features/users/hooks/useUsers';
import {
  useGetProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/useProfile';
import { useGetLibraryCard } from '@/features/library-card/hooks/useLibraryCard';
import { useLogout } from '@/features/auth/hooks/useAuth';
import { APP_ROUTE } from '@/constants/routes';
import { setCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';

const ProfilePage = () => {
  const router = useRouter();
  const t = useTranslations();
  const { user, setUser } = useUser();

  const { mutate: logout } = useLogout();
  const { mutate: requestChangePassword, isPending: isRequestingOtp } = useRequestChangePassword();
  const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyChangePasswordOtp();

  const [pwForm] = Form.useForm();

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingPw, setEditingPw] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);

  // OTP modal state
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [pendingNewPassword, setPendingNewPassword] = useState('');
  const [pendingConfirmNewPassword, setPendingConfirmNewPassword] = useState('');

  const userId = user?.id ?? '';

  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfile(userId);

  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: uploadAvatarMutation, isPending: isUploadingAvatar } = useUploadAvatar();
  const { data: libraryCard, isLoading: isCardLoading } = useGetLibraryCard(userId);

  // Sync form state from fetched profile
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.full_name ?? '');
      setPhone(profileData.phone ?? '');
      setAddress(profileData.address ?? '');
      setAvatar(profileData.avatar_url ?? undefined);
    }
  }, [profileData]);

  const handleUploadAvatar = (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    if (!(file instanceof File)) return;

    uploadAvatarMutation(
      { userId, file },
      {
        onSuccess: async (data) => {
          setAvatar(data.avatar_url);
          await refetchProfile();
          if (user) {
            const updated = { ...user, avatar: data.avatar_url };
            setUser(updated);
            setCookie(STORAGES.USER_LOGIN, updated);
          }
          onSuccess?.(data);
        },
        onError: (err) => {
          message.error(t('config_error_message'));
          onError?.(err as Error);
        },
      }
    );
  };

  const handleSaveInfo = () => {
    if (!userId) return;
    updateProfile(
      {
        userId,
        body: {
          full_name: fullName,
          phone: phone || null,
          address: address || null,
        },
      },
      {
        onSuccess: async () => {
          await refetchProfile();
          if (user) {
            const updated = { ...user, name: fullName, phone, address, avatar };
            setUser(updated);
            setCookie(STORAGES.USER_LOGIN, updated);
          }
          setEditingInfo(false);
          message.success(t('save_btn'));
        },
        onError: () => {
          message.error(t('config_error_message'));
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditingInfo(false);
    if (profileData) {
      setFullName(profileData.full_name ?? '');
      setPhone(profileData.phone ?? '');
      setAddress(profileData.address ?? '');
      setAvatar(profileData.avatar_url ?? undefined);
    }
  };

  // Step 1: verify current password → send OTP
  const handleSubmitChangePassword = (values: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    requestChangePassword(
      {
        currentPassword:    values.currentPassword,
        newPassword:        values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      },
      {
        onSuccess: () => {
          // Store pending passwords for the verify step
          setPendingNewPassword(values.newPassword);
          setPendingConfirmNewPassword(values.confirmNewPassword);
          setOtpValue('');
          setOtpModalVisible(true);
          message.info('Mã OTP đã được gửi đến email của bạn.');
        },
        onError: (err) => {
          const errMsg = (err as AxiosError<{ message: string }>)?.response?.data?.message;
          message.error(errMsg || t('config_error_message'));
        },
      }
    );
  };

  // Step 2: verify OTP → apply new password
  const handleVerifyOtp = () => {
    if (!otpValue.trim()) {
      message.error('Vui lòng nhập mã OTP.');
      return;
    }
    verifyOtp(
      {
        otp:                otpValue.trim(),
        newPassword:        pendingNewPassword,
        confirmNewPassword: pendingConfirmNewPassword,
      },
      {
        onSuccess: () => {
          message.success('Đổi mật khẩu thành công.');
          setOtpModalVisible(false);
          setOtpValue('');
          setPendingNewPassword('');
          setPendingConfirmNewPassword('');
          pwForm.resetFields();
          setEditingPw(false);
        },
        onError: (err) => {
          const errMsg = (err as AxiosError<{ message: string }>)?.response?.data?.message;
          message.error(errMsg || 'OTP không hợp lệ hoặc đã hết hạn.');
        },
      }
    );
  };

  const handleCancelOtp = () => {
    setOtpModalVisible(false);
    setOtpValue('');
    setPendingNewPassword('');
    setPendingConfirmNewPassword('');
  };

  if (!userId) {
    return (
      <div className="flex justify-center py-12">
        <Spin />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.push(APP_ROUTE.home)}
        className="text-(--blackSoft) font-medium text-base px-0 mb-6 hover:bg-transparent hover:underline"
      >
        {t('back_button')}
      </Button>

      <div className="flex flex-col gap-6">
        {/* ── Top row: Personal Info + Library Card ── */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* ── Personal Info Card ── */}
        <Card
          className="h-full border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
          styles={{ body: { padding: 24 } }}
        >
          <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
            {t('personal_info_title')}
          </p>

          {isProfileLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : !editingInfo ? (
            /* ── View mode ── */
            <div className="flex flex-col items-center gap-4">
              <Avatar
                size={128}
                shape="circle"
                src={avatar || undefined}
                icon={<UserOutlined />}
                className="bg-(--blueLight) rounded-full shrink-0"
              />
              <div className="text-center space-y-0.5">
                <p className="font-bold text-lg text-(--blackSoft)">{fullName}</p>
                <p className="text-(--grayMedium)">{profileData?.email}</p>
                {phone && <p className="text-(--grayMedium)">{phone}</p>}
                {address && <p className="text-(--grayMedium)">{address}</p>}
              </div>
              <Button
                block
                onClick={() => setEditingInfo(true)}
                className="border border-(--grayBorderMedium) rounded-lg text-(--blackSoft) font-medium text-sm h-10"
              >
                Chỉnh sửa thông tin
              </Button>
            </div>
          ) : (
            /* ── Edit mode ── */
            <div className="flex flex-col gap-4">
              {/* Avatar upload */}
              <div className="flex justify-center">
                <Upload
                  accept="image/jpeg,image/jpg,image/png"
                  showUploadList={false}
                  customRequest={handleUploadAvatar}
                  disabled={isUploadingAvatar}
                >
                  <div className="relative cursor-pointer group">
                    <Avatar
                      size={128}
                      shape="circle"
                      src={avatar || undefined}
                      icon={<UserOutlined />}
                      className="bg-(--blueLight) rounded-full shrink-0"
                    />
                    <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-(--primaryBlue) text-white flex items-center justify-center shadow-md transition-opacity group-hover:opacity-90">
                      {isUploadingAvatar ? (
                        <LoadingOutlined className="text-base" />
                      ) : (
                        <CameraOutlined className="text-base" />
                      )}
                    </div>
                  </div>
                </Upload>
              </div>

              {/* Họ tên */}
              <div>
                <p className="font-medium text-sm text-(--blackSoft) mb-1.5">
                  {t('full_name')}
                </p>
                <CustomInput
                  value={fullName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFullName(e.target.value)
                  }
                />
              </div>

              {/* Email (readonly) */}
              <div>
                <p className="font-medium text-sm text-(--blackSoft) mb-1.5">
                  {t('email')}
                </p>
                <CustomInput value={profileData?.email ?? ''} disabled />
                <span className="block text-(--grayMedium) text-xs mt-1">
                  {t('email_cannot_change')}
                </span>
              </div>

              {/* Số điện thoại */}
              <div>
                <p className="font-medium text-sm text-(--blackSoft) mb-1.5">
                  {t('phone_number')}
                </p>
                <CustomInput
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPhone(e.target.value)
                  }
                />
              </div>

              {/* Địa chỉ */}
              <div>
                <p className="font-medium text-sm text-(--blackSoft) mb-1.5">
                  {t('address')}
                </p>
                <CustomInput
                  value={address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setAddress(e.target.value)
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCancelEdit}
                  className="flex-1 rounded-lg font-medium text-base h-10"
                >
                  {t('cancel_btn')}
                </Button>
                <Button
                  type="primary"
                  loading={isSaving}
                  onClick={handleSaveInfo}
                  className="flex-1 rounded-lg font-medium text-base h-10"
                >
                  {t('save_btn')}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Library Card ── */}
        <Card
          className="h-full border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
          styles={{ body: { padding: 24 } }}
        >
          <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
            Thẻ thư viện
          </p>

          {isCardLoading ? (
            <div className="flex justify-center py-6">
              <Spin />
            </div>
          ) : !libraryCard ? (
            <p className="text-sm text-(--grayMedium) text-center py-4">
              Bạn chưa được cấp thẻ thư viện.
            </p>
          ) : (
            <div className="space-y-0">
              {[
                { label: 'Số thẻ', value: libraryCard.card_number },
                {
                  label: 'Ngày cấp',
                  value: new Date(libraryCard.issue_date).toLocaleDateString('vi-VN'),
                },
                {
                  label: 'Ngày hết hạn',
                  value: new Date(libraryCard.expiry_date).toLocaleDateString('vi-VN'),
                },
                { label: 'Hạn mức mượn', value: `${libraryCard.borrow_limit} cuốn` },
                { label: 'Mượn tối đa', value: `${libraryCard.max_borrow_days} ngày` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center py-2.5 border-b border-(--blackBorder) last:border-0"
                >
                  <span className="text-sm text-(--grayMedium)">{label}</span>
                  <span className="text-sm font-medium text-(--blackSoft)">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-(--grayMedium)">Trạng thái</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    libraryCard.card_status === 'Hợp lệ'
                      ? 'bg-green-100 text-green-700'
                      : libraryCard.card_status === 'Hết hạn'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {libraryCard.card_status}
                </span>
              </div>
            </div>
          )}
        </Card>

        </div>{/* end grid */}

        {/* ── Bảo mật Card ── */}
        <Card
          className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
          styles={{ body: { padding: 24 } }}
        >
          <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
            Bảo mật
          </p>

          {!editingPw ? (
            <div className="flex flex-col gap-2">
              <Button
                block
                icon={<LockOutlined />}
                onClick={() => setEditingPw(true)}
                className="border border-(--grayBorderMedium) rounded-lg text-(--blackSoft) font-medium text-sm h-10"
              >
                Thay đổi mật khẩu
              </Button>
              <Button
                block
                danger
                icon={<LogoutOutlined />}
                onClick={() => logout()}
                className="rounded-lg font-medium text-sm h-10"
              >
                Đăng xuất
              </Button>
            </div>
          ) : (
            <Form
              form={pwForm}
              layout="vertical"
              onFinish={handleSubmitChangePassword}
              className="flex flex-col gap-0"
              requiredMark={false}
            >
              <Form.Item
                label={
                  <span className="font-medium text-sm text-(--blackSoft)">
                    {t('current_password_label')}
                  </span>
                }
                name="currentPassword"
                rules={[{ required: true, message: t('password_required') }]}
              >
                <CustomInput.Password placeholder={t('enter_password')} />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-medium text-sm text-(--blackSoft)">
                    {t('new_password')}
                  </span>
                }
                name="newPassword"
                rules={[
                  { required: true, message: t('password_required') },
                  { pattern: PASSWORD_PATTERN, message: t('password_invalid') },
                ]}
              >
                <CustomInput.Password placeholder={t('enter_password')} />
              </Form.Item>

              <Form.Item
                label={
                  <span className="font-medium text-sm text-(--blackSoft)">
                    {t('confirm_new_password_label')}
                  </span>
                }
                name="confirmNewPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: t('confirm_password_required') },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value)
                        return Promise.resolve();
                      return Promise.reject(
                        new Error(t('passwords_do_not_match'))
                      );
                    },
                  }),
                ]}
              >
                <CustomInput.Password placeholder={t('reenter_new_password')} />
              </Form.Item>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    pwForm.resetFields();
                    setEditingPw(false);
                  }}
                  className="flex-1 rounded-lg font-medium text-base h-10"
                >
                  {t('cancel_btn')}
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isRequestingOtp}
                  className="flex-1 rounded-lg font-medium text-base h-10"
                >
                  {t('save_btn')}
                </Button>
              </div>
            </Form>
          )}
        </Card>
      </div>

      {/* ── OTP Verification Modal ── */}
      <Modal
        open={otpModalVisible}
        title="Xác nhận đổi mật khẩu"
        onCancel={handleCancelOtp}
        footer={null}
        maskClosable={false}
        centered
      >
        <div className="py-2">
          <p className="text-sm text-gray-600 mb-4">
            Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư và nhập mã bên dưới.
            Mã có hiệu lực trong <strong>15 phút</strong>.
          </p>
          <p className="font-medium text-sm text-(--blackSoft) mb-1.5">Mã OTP (6 chữ số)</p>
          <Input
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            size="large"
            className="text-center tracking-[0.5rem] text-lg font-mono mb-4"
          />
          <div className="flex gap-2">
            <Button
              onClick={handleCancelOtp}
              className="flex-1 rounded-lg font-medium h-10"
            >
              {t('cancel_btn')}
            </Button>
            <Button
              type="primary"
              loading={isVerifyingOtp}
              onClick={handleVerifyOtp}
              disabled={otpValue.length !== 6}
              className="flex-1 rounded-lg font-medium h-10"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
