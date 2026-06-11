import React, { createContext, useContext, useState } from 'react';
import type {
  Book,
  BookCopy,
  Transaction,
  Fee,
  Review,
  Reservation,
  Notification,
  ReadingList,
  Author,
  Publisher,
  Category,
  LibrarySettings,
} from '../types';
import {
  mockBooks,
  mockBookCopies,
  mockTransactions,
  mockFees,
  mockReviews,
  mockReservations,
  mockNotifications,
  mockReadingLists,
  mockAuthors,
  mockPublishers,
  mockCategories,
} from '../lib/mockData';

interface LibraryContextType {
  // Data
  books: Book[];
  bookCopies: BookCopy[];
  transactions: Transaction[];
  fees: Fee[];
  reviews: Review[];
  reservations: Reservation[];
  notifications: Notification[];
  readingLists: ReadingList[];
  authors: Author[];
  publishers: Publisher[];
  categories: Category[];
  settings: LibrarySettings;

  // Book operations
  getBook: (id: string) => Book | undefined;
  getBooksByCategory: (categoryId: string) => Book[];
  searchBooks: (query: string) => Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, data: Partial<Book>) => void;
  deleteBook: (id: string) => void;

  // Transaction operations
  borrowBook: (readerId: string, bookCopyId: string, bookId: string) => void;
  returnBook: (transactionId: string, condition: string) => void;
  renewTransaction: (transactionId: string) => boolean;
  getReaderTransactions: (readerId: string) => Transaction[];

  // Reservation operations
  reserveBook: (readerId: string, bookId: string) => void;
  cancelReservation: (id: string) => void;
  getReaderReservations: (readerId: string) => Reservation[];

  // Review operations
  addReview: (bookId: string, readerId: string, rating: number, comment?: string) => void;
  getBookReviews: (bookId: string) => Review[];

  // Reading list operations
  addToReadingList: (readerId: string, bookId: string, status: 'reading' | 'want_to_read' | 'finished') => void;
  updateReadingListStatus: (id: string, status: 'reading' | 'want_to_read' | 'finished') => void;
  removeFromReadingList: (id: string) => void;
  getReaderReadingList: (readerId: string) => ReadingList[];

  // Notification operations
  getUserNotifications: (userId: string) => Notification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  // Fee operations
  getReaderFees: (readerId: string) => Fee[];
  payFee: (id: string) => void;

  // Settings
  updateSettings: (settings: Partial<LibrarySettings>) => void;
}

const defaultSettings: LibrarySettings = {
  borrowLimit: 5,
  borrowDays: 14,
  maxRenewals: 2,
  lateFeePerDay: 5000,
  reservationHoldDays: 2,
  emailNotifications: true,
  appNotifications: true,
  reminderDaysBefore: [3, 1],
  holidays: [],
  darkMode: false,
  language: 'vi',
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>(mockBooks);
  const [bookCopies, setBookCopies] = useState<BookCopy[]>(mockBookCopies);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [fees, setFees] = useState<Fee[]>(mockFees);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [readingLists, setReadingLists] = useState<ReadingList[]>(mockReadingLists);
  const [authors] = useState<Author[]>(mockAuthors);
  const [publishers] = useState<Publisher[]>(mockPublishers);
  const [categories] = useState<Category[]>(mockCategories);
  const [settings, setSettings] = useState<LibrarySettings>(defaultSettings);

  const getBook = (id: string) => books.find(b => b.id === id);

  const getBooksByCategory = (categoryId: string) =>
    books.filter(b => b.categoryId === categoryId);

  const searchBooks = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return books.filter(book => {
      const author = authors.find(a => a.id === book.authorId);
      return (
        book.title.toLowerCase().includes(lowerQuery) ||
        book.titleEn?.toLowerCase().includes(lowerQuery) ||
        book.isbn?.toLowerCase().includes(lowerQuery) ||
        author?.name.toLowerCase().includes(lowerQuery) ||
        book.description?.toLowerCase().includes(lowerQuery)
      );
    });
  };

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: `book_${Date.now()}`,
    };
    setBooks([...books, newBook]);
  };

  const updateBook = (id: string, data: Partial<Book>) => {
    setBooks(books.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(b => b.id !== id));
  };

  const borrowBook = (readerId: string, bookCopyId: string, bookId: string) => {
    const newTransaction: Transaction = {
      id: `t_${Date.now()}`,
      type: 'borrow',
      readerId,
      bookCopyId,
      bookId,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + settings.borrowDays * 24 * 60 * 60 * 1000),
      renewCount: 0,
      maxRenewals: settings.maxRenewals,
      status: 'active',
    };
    setTransactions([...transactions, newTransaction]);

    // Update book copy status
    setBookCopies(bookCopies.map(bc =>
      bc.id === bookCopyId ? { ...bc, status: 'borrowed' as const } : bc
    ));

    // Update book available copies
    setBooks(books.map(b =>
      b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b
    ));
  };

  const returnBook = (transactionId: string, condition: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Update transaction
    setTransactions(transactions.map(t =>
      t.id === transactionId
        ? { ...t, returnDate: new Date(), status: 'completed' as const }
        : t
    ));

    // Update book copy
    setBookCopies(bookCopies.map(bc =>
      bc.id === transaction.bookCopyId
        ? { ...bc, status: 'available' as const }
        : bc
    ));

    // Update book available copies
    setBooks(books.map(b =>
      b.id === transaction.bookId
        ? { ...b, availableCopies: b.availableCopies + 1 }
        : b
    ));
  };

  const renewTransaction = (transactionId: string): boolean => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction || transaction.renewCount >= transaction.maxRenewals) {
      return false;
    }

    setTransactions(transactions.map(t =>
      t.id === transactionId
        ? {
            ...t,
            renewCount: t.renewCount + 1,
            dueDate: new Date(t.dueDate!.getTime() + settings.borrowDays * 24 * 60 * 60 * 1000),
          }
        : t
    ));

    return true;
  };

  const getReaderTransactions = (readerId: string) =>
    transactions.filter(t => t.readerId === readerId);

  const reserveBook = (readerId: string, bookId: string) => {
    const existingReservations = reservations.filter(
      r => r.bookId === bookId && r.status === 'waiting'
    );

    const newReservation: Reservation = {
      id: `rs_${Date.now()}`,
      readerId,
      bookId,
      reservedDate: new Date(),
      status: 'waiting',
      queuePosition: existingReservations.length + 1,
    };

    setReservations([...reservations, newReservation]);
  };

  const cancelReservation = (id: string) => {
    setReservations(reservations.map(r =>
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    ));
  };

  const getReaderReservations = (readerId: string) =>
    reservations.filter(r => r.readerId === readerId);

  const addReview = (bookId: string, readerId: string, rating: number, comment?: string) => {
    const newReview: Review = {
      id: `rv_${Date.now()}`,
      bookId,
      readerId,
      rating,
      comment,
      createdAt: new Date(),
      helpful: 0,
    };

    setReviews([...reviews, newReview]);

    // Update book rating
    const bookReviews = reviews.filter(r => r.bookId === bookId);
    const newAvgRating =
      (bookReviews.reduce((sum, r) => sum + r.rating, 0) + rating) /
      (bookReviews.length + 1);

    setBooks(books.map(b =>
      b.id === bookId
        ? { ...b, rating: newAvgRating, reviewCount: b.reviewCount + 1 }
        : b
    ));
  };

  const getBookReviews = (bookId: string) =>
    reviews.filter(r => r.bookId === bookId);

  const addToReadingList = (
    readerId: string,
    bookId: string,
    status: 'reading' | 'want_to_read' | 'finished'
  ) => {
    const newItem: ReadingList = {
      id: `rl_${Date.now()}`,
      readerId,
      bookId,
      status,
      addedDate: new Date(),
    };

    setReadingLists([...readingLists, newItem]);
  };

  const updateReadingListStatus = (
    id: string,
    status: 'reading' | 'want_to_read' | 'finished'
  ) => {
    setReadingLists(readingLists.map(rl =>
      rl.id === id
        ? {
            ...rl,
            status,
            finishedDate: status === 'finished' ? new Date() : rl.finishedDate,
          }
        : rl
    ));
  };

  const removeFromReadingList = (id: string) => {
    setReadingLists(readingLists.filter(rl => rl.id !== id));
  };

  const getReaderReadingList = (readerId: string) =>
    readingLists.filter(rl => rl.readerId === readerId);

  const getUserNotifications = (userId: string) =>
    notifications.filter(n => n.userId === userId).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications(notifications.map(n =>
      n.userId === userId ? { ...n, read: true } : n
    ));
  };

  const getReaderFees = (readerId: string) =>
    fees.filter(f => f.readerId === readerId);

  const payFee = (id: string) => {
    setFees(fees.map(f =>
      f.id === id
        ? { ...f, status: 'paid' as const, paidDate: new Date() }
        : f
    ));
  };

  const updateSettings = (newSettings: Partial<LibrarySettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        bookCopies,
        transactions,
        fees,
        reviews,
        reservations,
        notifications,
        readingLists,
        authors,
        publishers,
        categories,
        settings,
        getBook,
        getBooksByCategory,
        searchBooks,
        addBook,
        updateBook,
        deleteBook,
        borrowBook,
        returnBook,
        renewTransaction,
        getReaderTransactions,
        reserveBook,
        cancelReservation,
        getReaderReservations,
        addReview,
        getBookReviews,
        addToReadingList,
        updateReadingListStatus,
        removeFromReadingList,
        getReaderReadingList,
        getUserNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getReaderFees,
        payFee,
        updateSettings,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
