export enum API_ROUTE {
  login = '/login',
}

export enum APP_ROUTE {
  login = '/login',
  forgotPassword = '/forgot-password',
  /** Public landing page */
  root = '/',
  /** Authenticated home (dashboard) */
  home = '/home',
  /** Course listing */
  courses = '/courses',
  /** Course details */
  courseDetails = '/courses/[courseId]',
  /** User profile */
  profile = '/profile',
}
