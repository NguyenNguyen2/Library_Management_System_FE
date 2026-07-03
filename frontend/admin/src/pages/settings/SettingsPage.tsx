import { useEffect } from 'react';
import {
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
import type { I18nKey } from '@shared/types/I18nKeyType';
import { SystemSettingsPayload } from '../../api/settingsApi';
import { useFetchSettings, useUpdateSettings } from '../../hooks/useSettings';

const { confirm } = Modal;

type SettingKey =
  | 'card_regular_borrow_limit'
  | 'card_regular_max_days'
  | 'card_priority_borrow_limit'
  | 'card_priority_max_days'
  | 'fine_per_day'
  | 'fine_cap_amount'
  | 'max_renew_times'
  | 'renew_extend_days'
  | 'reservation_expiry_days';

/** i18n label/hint keys per config_key — SystemSettingController::ALLOWED_KEYS is the source list. */
const SETTING_META: Record<SettingKey, { labelKey: keyof I18nKey; hintKey: keyof I18nKey }> = {
  card_regular_borrow_limit: { labelKey: 'settings_card_regular_borrow_limit_label', hintKey: 'settings_card_regular_borrow_limit_hint' },
  card_regular_max_days: { labelKey: 'settings_card_regular_max_days_label', hintKey: 'settings_card_regular_max_days_hint' },
  card_priority_borrow_limit: { labelKey: 'settings_card_priority_borrow_limit_label', hintKey: 'settings_card_priority_borrow_limit_hint' },
  card_priority_max_days: { labelKey: 'settings_card_priority_max_days_label', hintKey: 'settings_card_priority_max_days_hint' },
  fine_per_day: { labelKey: 'settings_fine_per_day_label', hintKey: 'settings_fine_per_day_hint' },
  fine_cap_amount: { labelKey: 'settings_fine_cap_amount_label', hintKey: 'settings_fine_cap_amount_hint' },
  max_renew_times: { labelKey: 'settings_max_renew_times_label', hintKey: 'settings_max_renew_times_hint' },
  renew_extend_days: { labelKey: 'settings_renew_extend_days_label', hintKey: 'settings_renew_extend_days_hint' },
  reservation_expiry_days: { labelKey: 'settings_reservation_expiry_days_label', hintKey: 'settings_reservation_expiry_days_hint' },
};

/**
 * Module 7 — Cài đặt hệ thống. Mỗi nhóm cấu hình một Card để admin dễ rà soát
 * và lưu từng phần. Lưu luôn là 1 POST duy nhất (API hỗ trợ cập nhật nhiều
 * config_key cùng lúc trong 1 transaction). Reset đưa form về đúng giá trị
 * API đang trả, không cần gọi lại API.
 */
const SettingsPage = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm<Record<SettingKey, number>>();

  const { data, isLoading } = useFetchSettings();
  const { mutate: update, isPending: isSaving } = useUpdateSettings();

  const toFormValues = (): Partial<Record<SettingKey, number>> =>
    Object.fromEntries(
      (data ?? []).map((s) => [s.config_key, Number(s.config_value)]),
    );

  // Seed form with server values on first load (and whenever they refresh).
  useEffect(() => {
    if (data) {
      form.setFieldsValue(toFormValues());
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

  const handleSubmit = (values: Record<SettingKey, number>) => {
    confirm({
      title: t(getKey('settings_confirm_save_title')),
      content: t(getKey('settings_confirm_save_content')),
      icon: <ExclamationCircleFilled />,
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () => update(values as SystemSettingsPayload),
    });
  };

  /** Reset pulls from the last-fetched server snapshot — no refetch needed. */
  const handleReset = () => {
    if (!data) return;
    form.setFieldsValue(toFormValues());
  };

  if (isLoading) {
    return (
      <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  const numberField = (
    key: SettingKey,
    min: number,
    max: number,
    suffix?: string,
  ) => (
    <Form.Item
      name={key}
      label={
        <h3 className="m-0 text-sm font-semibold leading-[20px] text-nearBlack">
          {t(getKey(SETTING_META[key].labelKey))}
        </h3>
      }
      extra={
        <span className="text-xs text-grayDark">
          {t(getKey(SETTING_META[key].hintKey))}
        </span>
      }
      rules={[requiredRule, positiveIntegerRule]}
    >
      <CustomInput type="number" min={min} max={max} step={1} suffix={suffix} />
    </Form.Item>
  );

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

      <Form<Record<SettingKey, number>>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
        className="flex flex-col gap-6"
      >
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
          {/* Card 1 — hạn mức mượn theo loại thẻ */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-3 text-lg font-semibold leading-[24px] text-nearBlack">
              Hạn mức mượn theo loại thẻ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberField('card_regular_borrow_limit', 1, 100, t(getKey('unit_book')))}
              {numberField('card_regular_max_days', 1, 365, t(getKey('unit_day')))}
              {numberField('card_priority_borrow_limit', 1, 100, t(getKey('unit_book')))}
              {numberField('card_priority_max_days', 1, 365, t(getKey('unit_day')))}
            </div>
          </Card>

          {/* Card 2 — phí trễ hạn */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-3 text-lg font-semibold leading-[24px] text-nearBlack">
              Phí trễ hạn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberField('fine_per_day', 0, 1000000, t(getKey('unit_time')))}
              {numberField('fine_cap_amount', 0, 100000000, t(getKey('unit_time')))}
            </div>
          </Card>

          {/* Card 3 — số lần gia hạn */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-3 text-lg font-semibold leading-[24px] text-nearBlack">
              Gia hạn mượn sách
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberField('max_renew_times', 0, 20, t(getKey('unit_times')))}
              {numberField('renew_extend_days', 1, 90, t(getKey('unit_day')))}
            </div>
          </Card>

          {/* Card 4 — thời gian giữ sách đặt trước */}
          <Card className="!rounded-[10px] border border-gray-200 shadow-sm">
            <h3 className="m-0 mb-3 text-lg font-semibold leading-[24px] text-nearBlack">
              Đặt trước sách
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numberField('reservation_expiry_days', 1, 30, t(getKey('unit_day')))}
            </div>
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
