import { Button, Flex, Form, Modal, Table, Tag, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import CustomInput from '@shared/components/input/CustomInput';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import { generateRandomPassword } from '@shared/utils/passwordGenerator';
import { DEFAULT_PASSWORD } from '@shared/constants/commonConst';
import { SearchSelect } from '@shared/components/select/SearchSelect';
import { achievementHooks } from '../../../hooks/useAchievements';
import { userHooks } from '../../../hooks/useUsers';
import { IDetailUser } from '@shared/types/UserType';
import dayjs from 'dayjs';

interface IModalCreateEditUser {
  /** Injected by FilterTable via cloneElement when opening update/detail modal. */
  detail?: IDetailUser;
}

const ModalCreateEditUser = ({ detail }: IModalCreateEditUser) => {
  const { t } = useTranslation();
  const form = Form.useFormInstance();
  const isEditMode = !!detail?.id;

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

      {isEditMode ? (
        <Flex gap={16}>
          <Form.Item
            label={t(getKey('achievement_optional'))}
            name="achievement"
            className="flex-1"
          >
            <SearchSelect
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              useQueryHook={achievementHooks.useFetchListAchievements as any}
              fieldNames={{ label: 'name', value: 'id' }}
              labelInValue
              placeholder={t(getKey('no_achievement'))}
            />
          </Form.Item>
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
        </Flex>
      ) : (
        <Form.Item label={t(getKey('achievement_optional'))} name="achievement">
          <SearchSelect
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            useQueryHook={achievementHooks.useFetchListAchievements as any}
            fieldNames={{ label: 'name', value: 'id' }}
            labelInValue
            placeholder={t(getKey('no_achievement'))}
          />
        </Form.Item>
      )}
      <p className="-mt-4 mb-4 text-xs text-grayMedium">
        {t(getKey('achievement_note'))}
      </p>

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
