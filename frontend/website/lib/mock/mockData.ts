// Mock data for development - used when NEXT_PUBLIC_USE_MOCK_DATA=true
// This will be replaced with real API calls when backend is ready

export interface MockAchievement {
  id: string;
  name: string;
  requiredCourses: number;
}

export interface MockCourse {
  id: string;
  name: string;
  description: string;
  instructorName: string;
  category?: string;
  coverImage?: string;
  progress?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  rating?: number;
  reviewCount?: number;
  availableCopies?: number;
  borrowCount?: number;
}

export const mockAchievements: MockAchievement[] = [
  { id: "1", name: "Độc giả mới", requiredCourses: 0 },
  { id: "2", name: "Độc giả thường xuyên", requiredCourses: 5 },
  { id: "3", name: "Tín đồ sách", requiredCourses: 10 },
  { id: "4", name: "Nhà nghiên cứu", requiredCourses: 20 },
  { id: "5", name: "Bậc thầy đọc", requiredCourses: 50 },
];

/** Quick category tags shown on the home hero and used for the "Thể loại" stat */
export const READER_CATEGORIES = ["Tiểu thuyết", "Khoa học", "Lịch sử", "Tâm lý", "Kinh tế"];

export const mockCourses: MockCourse[] = [
  {
    id: "1",
    name: "Thầy Cúc Kén Ba Sao",
    description: "Cuốn tiểu thuyết nổi tiếng từ Kiều Bích Hàn",
    instructorName: "Kiều Bích Hàn",
    category: "Tiểu thuyết",
    progress: 45,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: 4.5,
    reviewCount: 210,
    availableCopies: 3,
    borrowCount: 520,
  },
  {
    id: "2",
    name: "Đắc Nhân Tâm",
    description: "Sách tâm lý học kinh điển dạy cách thành công",
    instructorName: "Dale Carnegie",
    category: "Tâm lý",
    progress: 20,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    rating: 4.9,
    reviewCount: 980,
    availableCopies: 6,
    borrowCount: 1450,
  },
  {
    id: "3",
    name: "Lịch Sử Loài Người",
    description: "Những câu chuyện thú vị về lịch sử nhân loại",
    instructorName: "Sapiens",
    category: "Lịch sử",
    progress: 60,
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    rating: 4.8,
    reviewCount: 760,
    availableCopies: 0,
    borrowCount: 1200,
  },
  {
    id: "4",
    name: "Tư Duy Sáng Tạo",
    description: "Hướng dẫn phát triển khả năng sáng tạo",
    instructorName: "Edward de Bono",
    category: "Tâm lý",
    progress: 0,
    isFeatured: true,
    isNew: true,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    rating: 4.6,
    reviewCount: 340,
    availableCopies: 4,
    borrowCount: 610,
  },
  {
    id: "5",
    name: "Triết Lý Thực Tế",
    description: "Khám phá tư tưởng triết học cơ bản",
    instructorName: "Bertrand Russell",
    category: "Khoa học",
    progress: 30,
    coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400",
    rating: 4.4,
    reviewCount: 180,
    availableCopies: 5,
    borrowCount: 390,
  },
  {
    id: "6",
    name: "Sinh Học Phân Tử",
    description: "Giới thiệu ngành sinh học hiện đại",
    instructorName: "James Watson",
    category: "Khoa học",
    progress: 15,
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400",
    rating: 4.3,
    reviewCount: 95,
    availableCopies: 0,
    borrowCount: 210,
  },
  {
    id: "7",
    name: "Tinh Thần Startup",
    description: "Bí quyết xây dựng startup thành công",
    instructorName: "Eric Ries",
    category: "Kinh tế",
    progress: 50,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400",
    rating: 4.7,
    reviewCount: 430,
    availableCopies: 2,
    borrowCount: 880,
  },
  {
    id: "8",
    name: "Nghệ Thuật Đàm Phán",
    description: "Kỹ năng đàm phán hiệu quả trong kinh doanh",
    instructorName: "Roger Fisher",
    category: "Kinh tế",
    progress: 25,
    coverImage: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400",
    rating: 4.5,
    reviewCount: 265,
    availableCopies: 4,
    borrowCount: 540,
  },
  {
    id: "9",
    name: "Kinh Tế Vi Mô",
    description: "Kinh tế học từ cơ bản đến nâng cao",
    instructorName: "Paul Samuelson",
    category: "Kinh tế",
    progress: 40,
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400",
    rating: 4.2,
    reviewCount: 150,
    availableCopies: 5,
    borrowCount: 320,
  },
  {
    id: "10",
    name: "Lập Trình Hàm Số",
    description: "Hướng dẫn lập trình hàm trong JavaScript",
    instructorName: "Kyle Simpson",
    category: "Khoa học",
    progress: 70,
    isNew: true,
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    rating: 4.6,
    reviewCount: 410,
    availableCopies: 6,
    borrowCount: 700,
  },
  {
    id: "11",
    name: "Thiết Kế Giao Diện",
    description: "Nguyên tắc UX/UI thiết kế hiệu quả",
    instructorName: "Don Norman",
    category: "Khoa học",
    progress: 35,
    isNew: true,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    rating: 4.7,
    reviewCount: 320,
    availableCopies: 3,
    borrowCount: 650,
  },
  {
    id: "12",
    name: "Tâm Lý Hành Vi",
    description: "Hiểu biết sâu về hành vi con người",
    instructorName: "Daniel Kahneman",
    category: "Tâm lý",
    progress: 55,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    rating: 4.8,
    reviewCount: 590,
    availableCopies: 4,
    borrowCount: 990,
  },
  {
    id: "13",
    name: "Vũ Trụ Học",
    description: "Khám phá những bí ẩn của vũ trụ",
    instructorName: "Carl Sagan",
    category: "Khoa học",
    progress: 10,
    isFeatured: true,
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    rating: 4.9,
    reviewCount: 470,
    availableCopies: 2,
    borrowCount: 730,
  },
  {
    id: "14",
    name: "Quản Lý Dự Án",
    description: "Quản lý dự án hiệu quả theo phương pháp Agile",
    instructorName: "Mike Cohn",
    category: "Kinh tế",
    progress: 45,
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    rating: 4.3,
    reviewCount: 130,
    availableCopies: 5,
    borrowCount: 280,
  },
  {
    id: "15",
    name: "Tiếp Thị Kỹ Thuật Số",
    description: "Chiến lược tiếp thị trực tuyến hiện đại",
    instructorName: "Neil Patel",
    category: "Kinh tế",
    progress: 30,
    coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400",
    rating: 4.4,
    reviewCount: 200,
    availableCopies: 6,
    borrowCount: 360,
  },
];

/** Maximum number of books a reader can borrow at the same time */
export const READER_BORROW_LIMIT = 5;

export interface MockBorrowedBook {
  id: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  renewCount: number;
  maxRenewals: number;
}

export interface MockReadingListItem {
  id: string;
  bookId: string;
  status: 'want_to_read' | 'reading' | 'finished';
  addedDate: string;
  notes?: string;
}

export interface MockReservation {
  id: string;
  bookId: string;
  reservedDate: string;
  expiryDate?: string;
  notifiedDate?: string;
  status: 'waiting' | 'ready' | 'completed' | 'expired' | 'cancelled';
  queuePosition: number;
}

export interface MockHistoryItem {
  id: string;
  bookId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  renewCount: number;
  status: 'active' | 'completed' | 'overdue';
}

export interface MockReview {
  id: string;
  bookId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

export const mockBorrowedBooks: MockBorrowedBook[] = [
  {
    id: "b1",
    bookId: "1",
    borrowDate: "2026-06-01",
    dueDate: "2026-06-20",
    renewCount: 0,
    maxRenewals: 2,
  },
  {
    id: "b2",
    bookId: "3",
    borrowDate: "2026-05-20",
    dueDate: "2026-06-10",
    renewCount: 1,
    maxRenewals: 2,
  },
  {
    id: "b3",
    bookId: "7",
    borrowDate: "2026-06-10",
    dueDate: "2026-06-13",
    renewCount: 0,
    maxRenewals: 2,
  },
];

export const mockReadingList: MockReadingListItem[] = [
  {
    id: "r1",
    bookId: "2",
    status: "reading",
    addedDate: "2026-05-15",
    notes: "Đọc lại chương 3 về cách giao tiếp",
  },
  {
    id: "r2",
    bookId: "4",
    status: "want_to_read",
    addedDate: "2026-06-01",
  },
  {
    id: "r3",
    bookId: "5",
    status: "want_to_read",
    addedDate: "2026-06-05",
  },
  {
    id: "r4",
    bookId: "9",
    status: "finished",
    addedDate: "2026-04-10",
  },
  {
    id: "r5",
    bookId: "12",
    status: "finished",
    addedDate: "2026-03-20",
  },
  {
    id: "r6",
    bookId: "10",
    status: "reading",
    addedDate: "2026-06-08",
  },
];

export const mockReservations: MockReservation[] = [
  {
    id: "res1",
    bookId: "6",
    reservedDate: "2026-06-05",
    status: "waiting",
    queuePosition: 2,
  },
  {
    id: "res2",
    bookId: "13",
    reservedDate: "2026-05-28",
    expiryDate: "2026-06-15",
    notifiedDate: "2026-06-12",
    status: "ready",
    queuePosition: 1,
  },
  {
    id: "res3",
    bookId: "8",
    reservedDate: "2026-04-01",
    status: "completed",
    queuePosition: 1,
  },
  {
    id: "res4",
    bookId: "11",
    reservedDate: "2026-03-10",
    status: "expired",
    queuePosition: 1,
  },
  {
    id: "res5",
    bookId: "14",
    reservedDate: "2026-05-01",
    status: "cancelled",
    queuePosition: 1,
  },
];

export const mockHistory: MockHistoryItem[] = [
  {
    id: "h1",
    bookId: "1",
    borrowDate: "2026-06-01",
    dueDate: "2026-06-20",
    renewCount: 0,
    status: "active",
  },
  {
    id: "h2",
    bookId: "3",
    borrowDate: "2026-05-20",
    dueDate: "2026-06-10",
    renewCount: 1,
    status: "overdue",
  },
  {
    id: "h3",
    bookId: "7",
    borrowDate: "2026-06-10",
    dueDate: "2026-06-13",
    renewCount: 0,
    status: "active",
  },
  {
    id: "h4",
    bookId: "2",
    borrowDate: "2026-04-01",
    dueDate: "2026-04-15",
    returnDate: "2026-04-14",
    renewCount: 0,
    status: "completed",
  },
  {
    id: "h5",
    bookId: "9",
    borrowDate: "2026-03-01",
    dueDate: "2026-03-15",
    returnDate: "2026-03-20",
    renewCount: 1,
    status: "completed",
  },
  {
    id: "h6",
    bookId: "12",
    borrowDate: "2026-02-10",
    dueDate: "2026-02-24",
    returnDate: "2026-02-22",
    renewCount: 0,
    status: "completed",
  },
  {
    id: "h7",
    bookId: "5",
    borrowDate: "2026-01-05",
    dueDate: "2026-01-19",
    returnDate: "2026-01-18",
    renewCount: 0,
    status: "completed",
  },
];

export const mockReviews: MockReview[] = [
  {
    id: "rv1",
    bookId: "1",
    reviewerName: "Minh Anh",
    rating: 5,
    comment: "Cuốn sách rất hay, cốt truyện cuốn hút từ đầu đến cuối.",
    date: "2026-05-20",
  },
  {
    id: "rv2",
    bookId: "1",
    reviewerName: "Hoàng Long",
    rating: 4,
    comment: "Nội dung sâu sắc, tuy nhiên một vài đoạn hơi dài dòng.",
    date: "2026-05-10",
  },
  {
    id: "rv3",
    bookId: "2",
    reviewerName: "Thu Trang",
    rating: 5,
    comment: "Sách kinh điển, đọc lại vẫn thấy nhiều điều mới.",
    date: "2026-06-01",
  },
  {
    id: "rv4",
    bookId: "2",
    reviewerName: "Quốc Bảo",
    rating: 5,
    comment: "Áp dụng được nhiều vào công việc và cuộc sống hàng ngày.",
    date: "2026-05-15",
  },
  {
    id: "rv5",
    bookId: "3",
    reviewerName: "Ngọc Hà",
    rating: 4,
    comment: "Cách kể chuyện lôi cuốn, nhiều kiến thức bổ ích về lịch sử.",
    date: "2026-04-28",
  },
  {
    id: "rv6",
    bookId: "5",
    reviewerName: "Đức Anh",
    rating: 4,
    comment: "Khá thú vị nhưng cần tập trung khi đọc, nhiều khái niệm mới.",
    date: "2026-04-15",
  },
  {
    id: "rv7",
    bookId: "7",
    reviewerName: "Lan Phương",
    rating: 5,
    comment: "Rất hữu ích cho ai đang muốn khởi nghiệp, nhiều ví dụ thực tế.",
    date: "2026-06-05",
  },
  {
    id: "rv8",
    bookId: "13",
    reviewerName: "Việt Hùng",
    rating: 5,
    comment: "Một trong những cuốn sách khoa học hay nhất mình từng đọc.",
    date: "2026-06-10",
  },
];
