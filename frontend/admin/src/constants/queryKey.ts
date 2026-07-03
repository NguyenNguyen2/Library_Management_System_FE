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
    topAuthors:          'reportTopAuthors',          // Phase 2 (authors)
    topCategories:       'reportTopCategories',       // Phase 2 (categories)
    topReaders:          'reportTopReaders',          // Phase 3A
    readerRegistrations: 'reportReaderRegistrations', // Phase 3B
    overdueBooks:        'reportOverdueBooks',         // Phase 4 (overdue)
    overdueSummary:      'reportOverdueSummary',       // Phase 4 (overdue)
    fineRevenue:         'reportFineRevenue',           // Phase 4 (fine)
    fineReasons:         'reportFineReasons',           // Phase 4 (fine)
  },
  aiDemand: {
    importSuggestions: 'aiImportSuggestions',
    lowBorrowBooks:    'aiLowBorrowBooks',
    seasonalDemand:    'aiSeasonalDemand',
  },
} as const;
