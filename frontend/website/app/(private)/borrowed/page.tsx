'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Modal, Spin } from 'antd';
import {
  ReloadOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  RightOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useMockBorrowedBooks } from '@/lib/mock/useMockBorrowedBooks';
import { useMockReservations } from '@/lib/mock/useMockReservations';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { APP_ROUTE } from '@/constants/routes';
import { READER_BORROW_LIMIT, type MockCourse, type MockBorrowedBook } from '@/lib/mock/mockData';
import { formatDateVN, getDaysUntil } from '@/lib/utils/date';

const RENEW_DAYS = 14;

function addDays(dateString: string, days: number): Date {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function getDayStatus(daysUntil: number) {
  if (daysUntil < 0) {
    return { color: 'text-red-600 bg-red-50 border-red-200', text: `Quá hạn ${Math.abs(daysUntil)} ngày`, dot: 'bg-red-500' };
  }
  if (daysUntil === 0) {
    return { color: 'text-orange-600 bg-orange-50 border-orange-200', text: 'Hết hạn hôm nay', dot: 'bg-orange-500' };
  }
  if (daysUntil <= 3) {
    return { color: 'text-amber-600 bg-amber-50 border-amber-200', text: `Còn ${daysUntil} ngày`, dot: 'bg-amber-400' };
  }
  return { color: 'text-green-600 bg-green-50 border-green-200', text: `Còn ${daysUntil} ngày`, dot: 'bg-green-500' };
}

function RenewModal({
  book,
  transaction,
  renewCount,
  hasReservation,
  onConfirm,
  onClose,
}: {
  book: MockCourse;
  transaction: MockBorrowedBook;
  renewCount: number;
  hasReservation: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const noRenewalsLeft = renewCount >= transaction.maxRenewals;
  const canRenew = !hasReservation && !noRenewalsLeft;
  const newDueDate = addDays(transaction.dueDate, RENEW_DAYS);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onConfirm();
    setLoading(false);
    setDone(true);
  };

  return (
    <Modal open onCancel={onClose} footer={null} closable={!loading} width={384} centered>
      {!done ? (
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-semibold text-gray-900">Gia hạn mượn sách</h2>

          <div className="flex gap-3">
            {book.coverImage && (
              <img src={book.coverImage} alt={book.name} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-gray-900 text-sm font-semibold line-clamp-2">{book.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{book.instructorName}</p>
              <p className="text-xs mt-1.5 text-gray-500">
                Lần gia hạn: <span className="font-semibold">{renewCount} / {transaction.maxRenewals}</span>
              </p>
            </div>
          </div>

          {noRenewalsLeft && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
              <CloseCircleOutlined className="text-red-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-red-700 font-semibold">Đã hết lượt gia hạn</p>
                <p className="text-red-600 text-xs mt-0.5">Bạn đã gia hạn tối đa {transaction.maxRenewals} lần cho sách này.</p>
              </div>
            </div>
          )}

          {hasReservation && !noRenewalsLeft && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
              <TeamOutlined className="text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-700 font-semibold">Có người đang đặt trước sách này</p>
                <p className="text-amber-600 text-xs mt-0.5">Không thể gia hạn khi sách đã có người chờ. Vui lòng trả đúng hạn.</p>
              </div>
            </div>
          )}

          {canRenew && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Hạn trả hiện tại</span>
                <span className="font-medium">{formatDateVN(transaction.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hạn trả mới</span>
                <span className="text-blue-700 font-bold">{formatDateVN(newDueDate.toISOString())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gia hạn thêm</span>
                <span className="font-medium">{RENEW_DAYS} ngày</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lượt còn lại sau</span>
                <span className="font-medium">{transaction.maxRenewals - renewCount - 1} lần</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button
              type="primary"
              className="flex-1"
              onClick={canRenew ? handleConfirm : undefined}
              disabled={!canRenew || loading}
              loading={loading}
            >
              {canRenew ? 'Xác nhận gia hạn' : 'Không thể gia hạn'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4 py-2">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircleOutlined className="text-3xl text-green-500" />
          </div>
          <div>
            <p className="text-gray-800 text-base font-semibold">Gia hạn thành công!</p>
            <p className="text-gray-500 text-sm mt-1">
              Hạn trả mới: <span className="text-blue-700 font-bold">{formatDateVN(newDueDate.toISOString())}</span>
            </p>
          </div>
          <Button type="primary" block onClick={onClose}>
            Đóng
          </Button>
        </div>
      )}
    </Modal>
  );
}

export default function BorrowedBooksPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { data: borrowedData, isLoading } = useMockBorrowedBooks();
  const { data: coursesData } = useCourses({ page: 1, limit: 100 });
  const { data: reservationsData } = useMockReservations();
  const [renewCounts, setRenewCounts] = useState<Record<string, number>>({});
  const [renewTarget, setRenewTarget] = useState<MockBorrowedBook | null>(null);

  const borrowed = borrowedData?.rows ?? [];
  const books = (coursesData?.rows ?? []) as MockCourse[];
  const reservations = reservationsData?.rows ?? [];

  const hasReservationFor = (bookId: string) =>
    reservations.some((r) => r.bookId === bookId && (r.status === 'waiting' || r.status === 'ready'));

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const renewBook = renewTarget ? books.find((b) => b.id === renewTarget.bookId) : null;
  const overdueCount = borrowed.filter((b) => getDaysUntil(b.dueDate) < 0).length;
  const soonCount = borrowed.filter((b) => {
    const d = getDaysUntil(b.dueDate);
    return d >= 0 && d <= 3;
  }).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renewTarget && renewBook && (
        <RenewModal
          book={renewBook}
          transaction={renewTarget}
          renewCount={renewCounts[renewTarget.id] ?? renewTarget.renewCount}
          hasReservation={hasReservationFor(renewBook.id)}
          onConfirm={() => {
            const current = renewCounts[renewTarget.id] ?? renewTarget.renewCount;
            setRenewCounts((prev) => ({ ...prev, [renewTarget.id]: current + 1 }));
            message.success(`Gia hạn thành công sách "${renewBook.name}"`);
          }}
          onClose={() => setRenewTarget(null)}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sách đang mượn</h1>
        <p className="text-gray-500 text-sm mt-1">
          Đang mượn <span className="font-semibold">{borrowed.length}</span> / {READER_BORROW_LIMIT} sách
        </p>
      </div>

      {borrowed.length > 0 && (overdueCount > 0 || soonCount > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium">
              <WarningOutlined /> {overdueCount} quá hạn
            </span>
          )}
          {soonCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium">
              <ClockCircleOutlined /> {soonCount} sắp đến hạn
            </span>
          )}
        </div>
      )}

      {borrowed.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOutlined className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Bạn chưa mượn sách nào</p>
          <Button type="primary" className="mt-4" onClick={() => router.push(APP_ROUTE.courses)}>
            Khám phá sách
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {borrowed.map((item) => {
            const book = books.find((b) => b.id === item.bookId);
            if (!book) return null;

            const renewCount = renewCounts[item.id] ?? item.renewCount;
            const daysUntil = getDaysUntil(item.dueDate);
            const noRenewals = renewCount >= item.maxRenewals;
            const reserved = hasReservationFor(book.id);
            const canRenew = !noRenewals && !reserved;
            const status = getDayStatus(daysUntil);

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  daysUntil < 0 ? 'border-red-200' : daysUntil <= 3 ? 'border-amber-200' : 'border-gray-200'
                }`}
              >
                {daysUntil < 0 && (
                  <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                    <WarningOutlined className="text-white flex-shrink-0" />
                    <p className="text-white text-xs font-semibold">
                      Quá hạn {Math.abs(daysUntil)} ngày — Phí tích lũy: {(Math.abs(daysUntil) * 5000).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
                {daysUntil >= 0 && daysUntil <= 1 && (
                  <div className="bg-amber-400 px-4 py-2 flex items-center gap-2">
                    <ClockCircleOutlined className="text-amber-900 flex-shrink-0" />
                    <p className="text-amber-900 text-xs font-semibold">
                      {daysUntil === 0 ? 'Hết hạn hôm nay! Vui lòng trả sách.' : 'Đến hạn trả ngày mai!'}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 p-4">
                  <div
                    className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center"
                    onClick={() => router.push(`${APP_ROUTE.courses}/${book.id}`)}
                  >
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-3xl text-gray-300">📖</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-gray-900 font-semibold hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                          onClick={() => router.push(`${APP_ROUTE.courses}/${book.id}`)}
                        >
                          {book.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{book.instructorName}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border flex-shrink-0 font-semibold ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.text}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-400">Ngày mượn</p>
                        <p className="text-sm text-gray-700 mt-0.5 font-medium">{formatDateVN(item.borrowDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hạn trả</p>
                        <p className={`text-sm mt-0.5 font-medium ${daysUntil < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                          {formatDateVN(item.dueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Lượt gia hạn</p>
                        <p className="text-sm text-gray-700 mt-0.5 font-medium">{renewCount} / {item.maxRenewals}</p>
                      </div>
                    </div>

                    {reserved && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                        <TeamOutlined className="flex-shrink-0" />
                        Có người đang đặt trước sách này — không thể gia hạn
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button
                        size="small"
                        type={canRenew ? 'primary' : 'default'}
                        icon={<ReloadOutlined />}
                        onClick={() => setRenewTarget(item)}
                      >
                        Gia hạn
                        {!canRenew && (
                          <span className="ml-1 text-[10px]">{noRenewals ? '(hết lượt)' : '(có đặt trước)'}</span>
                        )}
                      </Button>

                      <button
                        onClick={() => router.push(`${APP_ROUTE.courses}/${book.id}`)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline h-8 px-2"
                      >
                        Xem sách <RightOutlined className="text-[10px]" />
                      </button>
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
