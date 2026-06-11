import { Button, Flex, Form, Input, Typography } from 'antd';
import { getKey } from '../../types/I18nKeyType';

/**
 * Framework-agnostic translator function.
 * Compatible with both `react-i18next`'s `t` and `next-intl`'s `useTranslations()`.
 * Both accept a flat string key and an optional interpolation object.
 */
export type TranslateFn = (
  key: string,
  values?: Record<string, unknown>
) => string;

/**
 * Shape required by the framework-agnostic login form.
 * - `mutate`: callback invoked on submit with the form payload
 * - `isPending`: disables the form + shows loading state on the submit button
 */
export interface LoginMutationLike<
  TPayload = { email: string; password: string },
> {
  mutate: (payload: TPayload) => void;
  isPending: boolean;
}

export interface LoginFormProps<
  TPayload = { email: string; password: string },
> {
  /**
   * Translator function. Caller decides which i18n lib to use:
   *   - admin passes `useTranslation().t` from `react-i18next`
   *   - website passes `useTranslations()` from `next-intl`
   * Both libs accept the same flat key shape from the shared `vi.ts`.
   */
  t: TranslateFn;
  /** Title shown above the form (e.g. "Đăng nhập quản lý") */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Login mutation (react-query or any object matching `LoginMutationLike`) */
  loginMutation: LoginMutationLike<TPayload>;
  /** Number of recent failed attempts — shown as a warning when > 0 */
  loginFailedCount?: number;
  /** Handler for the "Forgot password?" link — router-agnostic */
  onForgotPassword?: () => void;
}

/**
 * Framework-agnostic login form.
 * No i18n lib dependency — caller provides a `t` function.
 */
const LoginForm = <TPayload = { email: string; password: string },>({
  t,
  title,
  subtitle,
  loginMutation,
  loginFailedCount = 0,
  onForgotPassword,
}: LoginFormProps<TPayload>) => {
  const [form] = Form.useForm();

  const onFinishForm = (payload: { email: string; password: string }) => {
    loginMutation.mutate(payload as unknown as TPayload);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="m-0 text-2xl font-semibold text-blackSoft">
          {title ?? t(getKey('login'))}
        </h2>
        <p className="m-0 mt-1 text-sm text-grayMedium">
          {subtitle ?? t(getKey('login_subtitle'))}
        </p>
      </div>

      {/* Form */}
      <Form
        disabled={loginMutation.isPending}
        onFinish={onFinishForm}
        className="w-full"
        layout="vertical"
        form={form}
      >
        <Form.Item
          label={
            <span className="text-sm font-medium text-blackSoft">
              {t(getKey('email'))}
            </span>
          }
          name="email"
          required
          rules={[
            {
              required: true,
              whitespace: true,
              message: t(getKey('email_required')),
            },
            { type: 'email', message: t(getKey('email_invalid')) },
          ]}
        >
          <Input
            placeholder="email@example.com"
            size="large"
            type="email"
            className="!rounded-lg"
          />
        </Form.Item>

        <Form.Item
          label={
            <span className="text-sm font-medium text-blackSoft">
              {t(getKey('password'))}
            </span>
          }
          name="password"
          required
          rules={[
            {
              required: true,
              whitespace: true,
              message: t(getKey('password_required')),
            },
          ]}
        >
          <Input.Password
            placeholder="••••••••"
            size="large"
            className="!rounded-lg"
          />
        </Form.Item>

        {loginFailedCount > 0 && (
          <Typography.Text className="mb-4 mt-[-12px] block text-btnDelete">
            {t(getKey('login_failed_attempts'), { count: loginFailedCount })}
          </Typography.Text>
        )}

        {/* Forgot password link — rendered only when a handler is provided */}
        {onForgotPassword && (
          <Flex justify="end" className="-mt-2 mb-4">
            <button
              type="button"
              onClick={onForgotPassword}
              className="border-none bg-transparent p-0 text-sm text-primary no-underline hover:underline cursor-pointer"
            >
              {t(getKey('forgot_password'))}
            </button>
          </Flex>
        )}

        {/* Submit button */}
        <Form.Item className="!mb-0">
          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            loading={loginMutation.isPending}
            className="!rounded-lg !text-base !font-medium"
          >
            {title ?? t(getKey('login'))}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default LoginForm;
