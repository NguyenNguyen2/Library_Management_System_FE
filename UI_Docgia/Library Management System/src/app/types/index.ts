export type UserRole = 'reader' | 'librarian' | 'admin';

export type CardStatus = 'active' | 'expired' | 'suspended';

export type CardType = 'regular' | 'premium';

export type LibrarianRole = 'head_librarian' | 'assistant_librarian' | 'viewer';

export type BookCopyStatus = 'available' | 'borrowed' | 'reserved' | 'maintenance' | 'lost';

export type BookCondition = 'new' | 'good' | 'old' | 'light_damage' | 'heavy_damage';

export type TransactionType = 'borrow' | 'return' | 'reserve';

export type TransactionStatus = 'active' | 'completed' | 'overdue';

export type ReturnCondition = 'good' | 'light_damage' | 'heavy_damage' | 'lost';

export type FeeType = 'late_fee' | 'damage_fee' | 'lost_fee';

export type FeeStatus = 'pending' | 'paid' | 'cancelled';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'e_wallet';

export type AuditAction =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'create_book'
  | 'update_book'
  | 'delete_book'
  | 'create_copy'
  | 'update_copy'
  | 'retire_copy'
  | 'create_user'
  | 'update_user'
  | 'delete_user'
  | 'lock_user'
  | 'unlock_user'
  | 'reset_password'
  | 'checkout'
  | 'checkin'
  | 'renew'
  | 'create_reservation'
  | 'cancel_reservation'
  | 'collect_fee'
  | 'update_settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
  createdAt: Date;
  twoFactorEnabled?: boolean;
}

export interface Reader extends User {
  role: 'reader';
  cardNumber: string;
  cardType: CardType;
  cardIssuedDate: Date;
  cardExpiryDate: Date;
  cardStatus: CardStatus;
  borrowLimit: number;
  borrowDays: number;
  currentBorrowed: number;
  totalFees: number;
}

export interface Librarian extends User {
  role: 'librarian';
  librarianRole: LibrarianRole;
  department?: string;
  isActive: boolean;
}

export interface Admin extends User {
  role: 'admin';
  twoFactorEnabled: true;
  twoFactorSecret?: string;
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
}

export interface Publisher {
  id: string;
  name: string;
  country?: string;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  description?: string;
  order: number;
}

export interface Book {
  id: string;
  isbn?: string;
  title: string;
  titleEn?: string;
  authorId: string;
  publisherId: string;
  categoryId: string;
  publishYear: number;
  language: string;
  pages: number;
  description?: string;
  coverImage?: string;
  isFeatured: boolean;
  isNew: boolean;
  isRecommended: boolean;
  isPremium: boolean;
  totalCopies: number;
  availableCopies: number;
  rating: number;
  reviewCount: number;
  borrowCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  qrCode?: string;
  status: BookCopyStatus;
  condition: BookCondition;
  location: string;
  shelf: string;
  acquiredDate: Date;
  acquisitionPrice?: number;
  lastMaintenance?: Date;
  retiredDate?: Date;
  retiredReason?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  readerId: string;
  bookCopyId: string;
  bookId: string;
  librarianId?: string;
  borrowDate?: Date;
  dueDate?: Date;
  returnDate?: Date;
  returnCondition?: ReturnCondition;
  renewCount: number;
  maxRenewals: number;
  status: TransactionStatus;
  daysOverdue?: number;
  notes?: string;
  checkoutLibrarianId?: string;
  checkinLibrarianId?: string;
}

export interface Reservation {
  id: string;
  readerId: string;
  bookId: string;
  reservedDate: Date;
  expiryDate?: Date;
  notifiedDate?: Date;
  status: 'waiting' | 'ready' | 'completed' | 'expired' | 'cancelled';
  queuePosition: number;
}

export interface Fee {
  id: string;
  readerId: string;
  transactionId?: string;
  type: FeeType;
  amount: number;
  status: FeeStatus;
  description: string;
  createdDate: Date;
  paidDate?: Date;
  paymentMethod?: PaymentMethod;
  collectedBy?: string;
  notes?: string;
}

export interface Review {
  id: string;
  bookId: string;
  readerId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  helpful: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
  link?: string;
}

export interface LibrarySettings {
  // Borrowing limits
  regularBorrowLimit: number;
  premiumBorrowLimit: number;
  regularBorrowDays: number;
  premiumBorrowDays: number;
  maxRenewals: number;
  renewalDays: number;

  // Fees
  lateFeePerDay: number;
  premiumLateFeePerDay: number;
  lightDamageFeePercent: number;
  heavyDamageFeePercent: number;
  lostFeePercent: number;

  // Reservations
  reservationHoldDays: number;
  maxReservations: number;

  // Notifications
  emailNotifications: boolean;
  appNotifications: boolean;
  reminderDaysBefore: number[];

  // Holidays (for fee calculation exclusion)
  holidays: Date[];
  excludeWeekendsFromFee: boolean;

  // System
  darkMode: boolean;
  language: 'vi' | 'en';
  enableAutoBackup: boolean;
  backupSchedule?: string;
}

export interface ReadingList {
  id: string;
  readerId: string;
  bookId: string;
  status: 'reading' | 'want_to_read' | 'finished';
  notes?: string;
  addedDate: Date;
  finishedDate?: Date;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
  details?: string;
  metadata?: Record<string, any>;
}

export interface BookEditHistory {
  id: string;
  bookId: string;
  editedBy: string;
  editorName: string;
  timestamp: Date;
  changes: BookFieldChange[];
}

export interface BookFieldChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface BulkImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: BulkImportError[];
  importedItems: any[];
}

export interface BulkImportError {
  row: number;
  field: string;
  value: any;
  error: string;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  authorId?: string;
  readerId?: string;
  librarianId?: string;
  bookId?: string;
}

export interface TransactionReport {
  totalBorrows: number;
  totalReturns: number;
  totalOverdue: number;
  avgBorrowDuration: number;
  transactionsByDay: { date: string; borrows: number; returns: number }[];
}

export interface TopBookReport {
  bookId: string;
  title: string;
  author: string;
  category: string;
  borrowCount: number;
  rating: number;
}

export interface TopReaderReport {
  readerId: string;
  name: string;
  cardNumber: string;
  borrowCount: number;
  totalFees: number;
}

export interface OverdueReport {
  transactionId: string;
  readerId: string;
  readerName: string;
  bookTitle: string;
  dueDate: Date;
  daysOverdue: number;
  estimatedFee: number;
}
