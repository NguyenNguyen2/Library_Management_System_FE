import { Alert, Form, InputNumber, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn } from '@shared/constants/commonConst';
import { IDetailAchievement } from '@frontend/shared/src/types/AchievementType';
import CustomInput from '@shared/components/input/CustomInput';

// Achievement status enum (mirrors backend AchievementStatus)
const ACHIEVEMENT_STATUS_VALUE = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

const ModalCreateEditAchievement = ({
  detail,
}: {
  detail?: IDetailAchievement;
}) => {
  const { t } = useTranslation();

  const requiredCourses = Form.useWatch('requiredCourses');
  const isEditMode = !!detail?.id;

  // Status options as `{ value, label }` — FE emits whole object, BE stores directly
  const statusOptions = [
    {
      value: ACHIEVEMENT_STATUS_VALUE.ACTIVE,
      label: t(getKey('status_active')),
    },
    {
      value: ACHIEVEMENT_STATUS_VALUE.INACTIVE,
      label: t(getKey('status_inactive')),
    },
  ];

  return (
    <div>
      <h2
        className={cn(
          'm-0 text-lg font-semibold leading-[18px] tracking-[-0.45px] text-[var(--color-near-black)]'
        )}
      >
        {isEditMode
          ? t(getKey('edit_achievement_title'))
          : t(getKey('add_achievement_title'))}
      </h2>
      <p
        className={cn(
          'mb-4 mt-1.5 text-sm font-normal leading-5 text-[var(--color-gray-medium)]'
        )}
      >
        {t(getKey('achievement_form_desc'))}
      </p>

      {isEditMode && (
        <Alert
          type="warning"
          showIcon
          message={t(getKey('achievement_edit_warning'))}
          className="mb-4"
        />
      )}

      <Form.Item
        label={t(getKey('achievement_name'))}
        name="name"
        rules={[
          { required: true, message: t(getKey('achievement_name_required')) },
        ]}
        className={cn('mb-4')}
      >
        <CustomInput placeholder={t(getKey('achievement_name_placeholder'))} />
      </Form.Item>

      <Form.Item
        label={t(getKey('required_courses'))}
        name="requiredCourses"
        rules={[
          { required: true, message: t(getKey('required_courses_required')) },
        ]}
        className={cn('mb-4')}
        extra={
          <span
            className={cn('text-xs leading-4 text-[var(--color-gray-dark)]')}
          >
            {t(getKey('required_courses_hint'), {
              count: requiredCourses ?? '...',
            })}
          </span>
        }
      >
        <InputNumber
          min={1}
          precision={0}
          placeholder={t(getKey('required_courses'))}
          className={cn('w-full')}
          size="large"
        />
      </Form.Item>

      {/* Status select — `labelInValue` emits full `{ value, label }` to match backend jsonb */}
      <Form.Item
        label={t(getKey('status'))}
        name="status"
        className={cn('!mb-0')}
      >
        <Select
          labelInValue
          size="large"
          placeholder={t(getKey('status'))}
          options={statusOptions}
        />
      </Form.Item>
    </div>
  );
};

export default ModalCreateEditAchievement;
