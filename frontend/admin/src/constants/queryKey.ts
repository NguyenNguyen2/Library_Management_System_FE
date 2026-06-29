export const QueryKey = {
  dashboard: {
    data: 'dashboardData',
  },
  users: {
    list: 'usersList',
    detail: 'usersDetail',
  },
  courses: {
    list: 'coursesList',
    detail: 'coursesDetail',
  },
  codes: {
    list: 'codesList',
    detail: 'codesDetail',
  },
  achievements: {
    list: 'achievementsList',
    detail: 'achievementsDetail',
  },
  reports: {
    transactions:        'reportTransactions',
    topBooks:            'reportTopBooks',
    topReaders:          'reportTopReaders',          // Phase 3A
    readerRegistrations: 'reportReaderRegistrations', // Phase 3B
  },
} as const;
