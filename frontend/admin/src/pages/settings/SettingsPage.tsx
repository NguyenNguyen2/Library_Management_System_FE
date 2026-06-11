import { useEffect } from 'react';
import {
  Alert,
  Button,
  Card,
  Flex,
  Form,
  Modal,
  Skeleton,
  type FormRule,
} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CustomInput from '@shared/components/input/CustomInput';
import { getKey } from '@shared/types/I18nKeyType';
import {
  IPlatformSettings,
  IPlatformSettingsPayload,
} from '../../api/settingsApi';
import { useFetchSettings, useUpdateSettings } from '../../hooks/useSettings';

const { confirm } = Modal;

/** Coerce CustomInput's string value to number. Used in both submit + reset. */
const coerce = (
  values: IPlatformSettingsPayload
): IPlatformSettingsPayload => ({
  videoLockDays: Number(values.videoLockDays),
  quizPassThreshold: Number(values.quizPassThreshold),
  quizRetryLimit: Number(values.quizRetryLimit),
  inactiveUserPasswordResetDays: Number(values.inactiveUserPasswordResetDays),
});

/**
 * Each setting lives in its own Card so the admin can scan, edit, save one
 * section at a time. Save is always a single PATCH — matches the singleton
 * settings row on the backend. Reset rolls the form back to whatever the API
 * currently stores, undoing any unsaved edits.
 */
const SettingsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<IPlatformSettingsPayload>();

  const { data, isLoading } = useFetchSettings();
  const { mutate: update, isPending: isSaving } = useUpdateSettings();

  // Seed form with server values on first load (and whenever they refresh).
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        videoLockDays: data.videoLockDays,
        quizPassThreshold: data.quizPassThreshold,
        quizRetryLimit: data.quizRetryLimit,
        inactiveUserPasswordResetDays: data.inactiveUserPasswordResetDays,
      });
    }
  }, [data, form]);

  /** Non-negative integer validator — rejects decimals, negatives, NaN. */
  const positiveIntegerRule: FormRule = {
    validator: (_, value) => {
      if (value === null || value === undefined || value === '') {
        return Promise.resolve();
      }
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0) {
        return Promise.reject(
          new Error(t(getKey('settings_integer_only_message')))
        );
      }
      return Promise.resolve();
    },
  };

  const requiredRule: FormRule = {
    required: true,
    message: t(getKey('mess_required')),
  };

  const handleSubmit = (values: IPlatformSettingsPayload) => {
    confirm({
      title: t(getKey('settings_confirm_save_title')),
      content: t(getKey('settings_confirm_save_content')),
      icon: <ExclamationCircleFilled />,
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () => update(coerce(values)),
    });
  };

  /** Reset pulls from the last-fetched server snapshot — no refetch needed. */
  const handleReset = () => {
    if (!data) return;
    form.setFieldsValue({
      videoLockDays: data.videoLockDays,
      quizPassThreshold: data.quizPassThreshold,
      quizRetryLimit: data.quizRetryLimit,
      inactiveUserPasswordResetDays: data.inactiveUserPasswordResetDays,
    } as IPlatformSettings);
  };

  if (isLoading) {
    return (
      <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  const scheduleNote = t(getKey('settings_schedule_note'));

  return (
    <div className="flex flex-col gap-6">
      {/* Page header — same typography as the other admin pages (FilterTable). */}
      <div>
        <h1 className="m-0 text-[30px] font-bold leading-[36px] text-navyDark">
          {t(getKey('settings_title'))}
        </h1>
        <p className="m-0 mt-1 text-base leading-6 text-grayDark">
          {t(getKey('settings_description'))}
        </p>
      </div>

      <Form<IPlatformSettingsPayload>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="flex flex-col gap-6"
      >
        {/* 2-column × 2-row grid on md+ screens, stacks on mobile. */}
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          {/* Card 1 — video lock */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-1 text-lg font-semibold leading-[24px] text-nearBlack">
              {t(getKey('settings_video_lock_days_label'))}
            </h3>
            <p className="m-0 mb-3 text-sm text-grayDark">
              {t(getKey('settings_video_lock_days_hint'))}
            </p>
            <Alert
              type="info"
              showIcon
              className="!mb-4"
              message={scheduleNote}
            />
            <Form.Item
              name="videoLockDays"
              rules={[requiredRule, positiveIntegerRule]}
              className="!mb-0"
            >
              <CustomInput
                type="number"
                min={0}
                max={3650}
                step={1}
                suffix={t(getKey('unit_day'))}
              />
            </Form.Item>
          </Card>

          {/* Card 2 — inactive-user password reset */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-1 text-lg font-semibold leading-[24px] text-nearBlack">
              {t(getKey('settings_inactive_reset_days_label'))}
            </h3>
            <p className="m-0 mb-3 text-sm text-grayDark">
              {t(getKey('settings_inactive_reset_days_hint'))}
            </p>
            <Alert
              type="info"
              showIcon
              className="!mb-4"
              message={scheduleNote}
            />
            <Form.Item
              name="inactiveUserPasswordResetDays"
              rules={[requiredRule, positiveIntegerRule]}
              className="!mb-0"
            >
              <CustomInput
                type="number"
                min={1}
                max={3650}
                step={1}
                suffix={t(getKey('unit_day'))}
              />
            </Form.Item>
          </Card>

          {/* Card 3 — quiz pass threshold */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-1 text-lg font-semibold leading-[24px] text-nearBlack">
              {t(getKey('settings_quiz_pass_threshold_label'))}
            </h3>
            <p className="m-0 mb-3 text-sm text-grayDark">
              {t(getKey('settings_quiz_pass_threshold_hint'))}
            </p>
            <Form.Item
              name="quizPassThreshold"
              rules={[requiredRule, positiveIntegerRule]}
              className="!mb-0"
            >
              <CustomInput
                type="number"
                min={1}
                max={100}
                step={1}
                suffix="%"
              />
            </Form.Item>
          </Card>

          {/* Card 4 — quiz retry limit */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-1 text-lg font-semibold leading-[24px] text-nearBlack">
              {t(getKey('settings_quiz_retry_limit_label'))}
            </h3>
            <p className="m-0 mb-3 text-sm text-grayDark">
              {t(getKey('settings_quiz_retry_limit_hint'))}
            </p>
            <Form.Item
              name="quizRetryLimit"
              rules={[requiredRule, positiveIntegerRule]}
              className="!mb-0"
            >
              <CustomInput
                type="number"
                min={0}
                max={100}
                step={1}
                suffix={t(getKey('unit_time'))}
              />
            </Form.Item>
          </Card>
        </div>

        {/* Action row spans full width, buttons anchored right. */}
        <Flex justify="flex-end" gap={12}>
          <Button size="large" onClick={handleReset} disabled={isSaving}>
            {t(getKey('settings_reset_btn'))}
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isSaving}
          >
            {t(getKey('save_btn'))}
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default SettingsPage;
