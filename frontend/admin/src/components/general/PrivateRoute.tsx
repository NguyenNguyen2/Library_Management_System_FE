import { App } from 'antd';
import { Navigate } from 'react-router-dom';
import { STORAGES } from '@shared/constants/storage';
import { ROUTES } from '../../constants/routers';
import { getCookie } from '@shared/utils/cookie';

const PrivateRoute = ({
  children,
  isPublicOnly = false,
}: {
  children: React.ReactNode;
  isPublicOnly?: boolean;
}) => {
  const { notification } = App.useApp();
  const token = getCookie(STORAGES.ACCESS_TOKEN);

  if (!token && !isPublicOnly) {
    notification.warning({
      message: 'Please log in to use this feature',
    });
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (token && isPublicOnly) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
};

export default PrivateRoute;
