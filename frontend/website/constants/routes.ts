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
  /** Book detail (reader-facing, mock data) */
  books = '/books',
  /** Book details */
  bookDetails = '/books/[bookId]',
  /** User profile */
  profile = '/profile',
  /** Books currently borrowed by the reader */
  borrowed = '/borrowed',
  /** Reader's personal reading list */
  readingList = '/reading-list',
  /** Reader's book reservations */
  reservations = '/reservations',
  /** Borrow/return history */
  history = '/history',
}
