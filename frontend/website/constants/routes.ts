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
  /** Books currently borrowed by the reader */
  borrowed = '/borrowed',
  /** Reader's personal reading list */
  readingList = '/reading-list',
  /** Reader's favorite books */
  favorites = '/favorites',
  /** Reader's book reservations */
  reservations = '/reservations',
  /** Borrow/return history */
  history = '/history',
  /** Fine payment history */
  fines = '/fines',
  /** Notifications */
  notifications = '/notifications',  
}
