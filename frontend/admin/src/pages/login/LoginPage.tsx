import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginForm from '@shared/components/auth/LoginForm';
import { getKey } from '@shared/types/I18nKeyType';
import { useLogin } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routers';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center text-center mb-6 select-none">
        <img
          src="/images/logo.png"
          alt="The Library Dashboard"
          className="w-20 h-20 object-contain animate-heartbeat hover-clickable"
        />
        <p className="text-gray-500 mt-2 text-sm font-semibold tracking-wider uppercase">
          The Library Dashboard
        </p>
      </div>
      <LoginForm
        t={t}
        title={t(getKey('login_admin_title'))}
        loginMutation={loginMutation}
        onForgotPassword={() => navigate(ROUTES.FORGOTPW)}
      />
    </div>
  );
};

export default LoginPage;
