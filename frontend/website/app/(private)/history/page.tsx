'use client';

import { Spin } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useMockHistory } from '@/lib/mock/useMockHistory';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { formatDateVN } from '@/lib/utils/date';
import type { MockCourse, MockHistoryItem } from '@/lib/mock/mockData';

const STATUS_BADGE: Record<MockHistoryItem['status'], { label: string; className: string }> = {
  completed: { label: 'Đã trả', className: 'bg-green-100 text-green-700' },
  overdue: { label: 'Quá hạn', className: 'bg-red-100 text-red-700' },
  active: { label: 'Đang mượn', className: 'bg-blue-100 text-blue-700' },
};

export default function HistoryPage() {
  const { data, isLoading } = useMockHistory();
  const { data: coursesData } = useCourses({ page: 1, limit: 100 });
  const books = (coursesData?.rows ?? []) as MockCourse[];

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const transactions = data?.rows ?? [];
  const completed = transactions.filter((t) => t.status === 'completed');
  const active = transactions.filter((t) => t.status === 'active' || t.status === 'overdue');
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime(),
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử mượn trả</h1>
        <p className="text-gray-500 mt-1">Xem lại tất cả các giao dịch mượn sách của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1">Tổng sách đã mượn</p>
          <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1">Đã trả</p>
          <p className="text-3xl font-bold text-gray-900">{completed.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500 mb-1">Đang mượn</p>
          <p className="text-3xl font-bold text-gray-900">{active.length}</p>
        </div>
      </div>

      {/* History list */}
      {transactions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <BookOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500">Bạn chưa có lịch sử mượn sách</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((transaction) => {
            const book = books.find((b) => b.id === transaction.bookId);
            if (!book) return null;
            const badge = STATUS_BADGE[transaction.status];

            return (
              <div key={transaction.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex gap-6">
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-gray-300">📖</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{book.name}</h3>
                        <p className="text-gray-500 text-sm">{book.instructorName}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Ngày mượn</p>
                        <p className="font-medium text-gray-900">{formatDateVN(transaction.borrowDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Hạn trả</p>
                        <p className="font-medium text-gray-900">{formatDateVN(transaction.dueDate)}</p>
                      </div>
                      {transaction.returnDate && (
                        <div>
                          <p className="text-gray-500">Ngày trả</p>
                          <p className="font-medium text-gray-900">{formatDateVN(transaction.returnDate)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-500">Số lần gia hạn</p>
                        <p className="font-medium text-gray-900">{transaction.renewCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
