import { I18nKey } from '@shared/types/I18nKeyType';
// Common
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  USERS: '/users',
  BOOKS: '/books',
  TRANSACTIONS: '/transactions',
  RETURN: '/return',
  RENEW: '/renew',
  RESERVATION: '/reservation',
  FEES: '/fees',
  REPORTS: '/reports',
  FORGOTPW: '/forgot-password',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',
  USER_HISTORY: '/users/:userId/history',
  TRANSACTION_LOG: '/transaction-log',
};

type RoutePath = typeof ROUTES[keyof typeof ROUTES];

export const HEADER_TITLES: Record<RoutePath, keyof I18nKey> = {
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.LOGIN]: 'login',
  [ROUTES.USERS]: 'user_management',
  [ROUTES.BOOKS]: 'course_management',
  [ROUTES.TRANSACTIONS]: 'checkout_title',
  [ROUTES.RETURN]: 'return_title',
  [ROUTES.RENEW]: 'renew_title',
  [ROUTES.RESERVATION]: 'reservation_title',
  [ROUTES.FEES]: 'fee_management',
  [ROUTES.REPORTS]: 'report_management',
  [ROUTES.FORGOTPW]: 'forgot_password_title',
  [ROUTES.ACHIEVEMENTS]: 'achievement_management',
  [ROUTES.SETTINGS]: 'settings_title',
  [ROUTES.USER_HISTORY]: 'user_history_title',
  [ROUTES.TRANSACTION_LOG]: 'menu_transaction_history',
};

export const DYNAMIC_ROUTES: string[] = [ROUTES.USER_HISTORY];
