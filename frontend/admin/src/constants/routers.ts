import { I18nKey } from '@shared/types/I18nKeyType';
// Common
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  USERS: '/users',
  COURSES: '/courses',
  CODES: '/codes',
  FORGOTPW: '/forgot-password',
  ACHIEVEMENTS: '/achievements',
  SETTINGS: '/settings',
};

type RoutePath = typeof ROUTES[keyof typeof ROUTES];

export const HEADER_TITLES: Record<RoutePath, keyof I18nKey> = {
  [ROUTES.DASHBOARD]: 'dashboard',
  [ROUTES.LOGIN]: 'login',
  [ROUTES.USERS]: 'user_management',
  [ROUTES.COURSES]: 'course_management',
  [ROUTES.CODES]: 'code_management',
  [ROUTES.FORGOTPW]: 'forgot_password_title',
  [ROUTES.ACHIEVEMENTS]: 'achievement_management',
  [ROUTES.SETTINGS]: 'settings_title',
};

export const DYNAMIC_ROUTES: string[] = [];
