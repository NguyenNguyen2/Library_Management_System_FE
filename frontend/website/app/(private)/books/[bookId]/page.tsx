'use client';

import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Input, Modal, Rate, Spin } from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  HeartFilled,
  HeartOutlined,
  ShareAltOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { useMockReadingList } from '@/lib/mock/useMockReadingList';
import { useMockReservations } from '@/lib/mock/useMockReservations';
import { APP_ROUTE } from '@/constants/routes';
import { formatDateVN } from '@/lib/utils/date';
import {
  mockReviews,
  type MockCourse,
  type MockReadingListItem,
  type MockReservation,
  type MockReview,
} from '@/lib/mock/mockData';
import { getCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import type { IDetailUser } from '@shared/types/UserType';

const LIST_OPTIONS: { value: MockReadingListItem['status']; label: string; icon: React.ReactNode }[] = [
  { value: 'want_to_read', label: 'Muốn đọc', icon: <BookOutlined /> },
  { value: 'reading', label: 'Đang đọc', icon: <ClockCircleOutlined /> },
  { value: 'finished', label: 'Đã đọc', icon: <CheckOutlined /> },
];

function RelatedBookCard({ book, onClick }: { book: MockCourse; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="text-3xl text-gray-300">📖</span>
        )}
        <span
          className={`absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
            (book.availableCopies ?? 0) > 0 ? 'bg-emerald-500' : 'bg-orange-400'
          }`}
        >
          {(book.availableCopies ?? 0) > 0 ? 'Có sẵn' : 'Đặt trước'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {book.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2 truncate">{book.instructorName}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <StarFilled key={i} className={`text-xs ${i <= Math.round(book.rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">{book.borrowCount ?? 0} lượt</span>
        </div>
      </div>
    </div>
  );
}

export default function BookDetailPage({ params }: { params: Promise<{ bookId: string }> }) {
  const { bookId } = use(params);
  const router = useRouter();
  const { message } = App.useApp();

  const { data: coursesData, isLoading: booksLoading } = useCourses({ page: 1, limit: 100 });
  const { data: readingListData, isLoading: listLoading } = useMockReadingList();
  const { data: reservationsData, isLoading: reservationsLoading } = useMockReservations();

  const books = useMemo(() => (coursesData?.rows ?? []) as MockCourse[], [coursesData]);
  const book = books.find((b) => b.id === bookId);

  const [readingList, setReadingList] = useState<MockReadingListItem[] | null>(null);
  const [reservations, setReservations] = useState<MockReservation[] | null>(null);
  const [reviews, setReviews] = useState<MockReview[]>([]);
  const [showListMenu, setShowListMenu] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveDone, setReserveDone] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (readingListData?.rows) setReadingList(readingListData.rows);
  }, [readingListData]);

  useEffect(() => {
    if (reservationsData?.rows) setReservations(reservationsData.rows);
  }, [reservationsData]);

  useEffect(() => {
    setReviews(mockReviews.filter((r) => r.bookId === bookId));
  }, [bookId]);

  const user = getCookie(STORAGES.USER_LOGIN) as IDetailUser | undefined;
  const userName = user?.name ?? 'Bạn';

  if (booksLoading || listLoading || reservationsLoading || !readingList || !reservations) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-3xl mx-auto">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => router.back()} className="mb-6 px-0">
          Quay lại
        </Button>
        <div className="text-center py-16 text-gray-500">Không tìm thấy sách</div>
      </div>
    );
  }

  const currentListItem = readingList.find((i) => i.bookId === book.id);
  const myReservation = reservations.find((r) => r.bookId === book.id && (r.status === 'waiting' || r.status === 'ready'));
  const queueLength = reservations.filter((r) => r.bookId === book.id && (r.status === 'waiting' || r.status === 'ready')).length;
  const totalCopies = (book.availableCopies ?? 0) + 3;
  const isAvailable = (book.availableCopies ?? 0) > 0;
  const sentiment = (book.rating ?? 0) >= 4 ? 'Tích cực' : (book.rating ?? 0) >= 3 ? 'Trung lập' : 'Tiêu cực';

  const sameAuthorBooks = books.filter((b) => b.id !== book.id && b.instructorName === book.instructorName).slice(0, 4);
  const sameCategoryBooks = books
    .filter((b) => b.id !== book.id && b.category === book.category && b.instructorName !== book.instructorName)
    .slice(0, 4);

  const handleBorrow = () => {
    message.info('Vui lòng đến quầy thủ thư để mượn sách');
  };

  const handleConfirmReserve = () => {
    setReserveLoading(true);
    setTimeout(() => {
      const newReservation: MockReservation = {
        id: `res${Date.now()}`,
        bookId: book.id,
        reservedDate: new Date().toISOString().slice(0, 10),
        status: 'waiting',
        queuePosition: queueLength + 1,
      };
      setReservations((prev) => [...(prev ?? []), newReservation]);
      setReserveLoading(false);
      setReserveDone(true);
    }, 700);
  };

  const handleCancelReservation = () => {
    if (!myReservation) return;
    setReservations((prev) => prev!.map((r) => (r.id === myReservation.id ? { ...r, status: 'cancelled' } : r)));
    message.success('Đã hủy đặt trước');
  };

  const handleAddToList = (status: MockReadingListItem['status']) => {
    setReadingList((prev) => {
      const list = prev ?? [];
      if (currentListItem) {
        return list.map((i) => (i.id === currentListItem.id ? { ...i, status } : i));
      }
      return [...list, { id: `r${Date.now()}`, bookId: book.id, status, addedDate: new Date().toISOString().slice(0, 10) }];
    });
    const labels: Record<MockReadingListItem['status'], string> = { want_to_read: 'Muốn đọc', reading: 'Đang đọc', finished: 'Đã đọc' };
    message.success(`Đã thêm vào danh sách "${labels[status]}"`);
    setShowListMenu(false);
  };

  const handleRemoveFromList = () => {
    if (!currentListItem) return;
    setReadingList((prev) => prev!.filter((i) => i.id !== currentListItem.id));
    message.success('Đã xóa khỏi danh sách');
    setShowListMenu(false);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      message.success('Đã sao chép liên kết');
    } catch {
      message.error('Không thể sao chép liên kết');
    }
  };

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      message.warning('Vui lòng nhập nhận xét');
      return;
    }
    setReviews((prev) => [
      { id: `rv${Date.now()}`, bookId: book.id, reviewerName: userName, rating, comment: comment.trim(), date: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setComment('');
    setRating(5);
    message.success('Cảm ơn bạn đã đánh giá!');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Reserve modal */}
      <Modal
        open={showReserveModal}
        onCancel={() => !reserveLoading && setShowReserveModal(false)}
        footer={null}
        width={400}
        centered
        destroyOnHidden
        title={!reserveDone ? 'Xác nhận đặt trước' : undefined}
      >
        {!reserveDone ? (
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-gray-300">📖</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 line-clamp-2">{book.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{book.instructorName}</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Số người đang chờ</span>
                <span className="font-semibold text-orange-600">{queueLength} người</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vị trí của bạn</span>
                <span className="font-semibold">#{queueLength + 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian giữ chỗ</span>
                <span className="font-semibold">2 ngày sau thông báo</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Khi sách được trả về, hệ thống sẽ tự động gửi thông báo cho bạn. Bạn có 2 ngày để đến mượn.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setShowReserveModal(false)} disabled={reserveLoading}>
                Hủy
              </Button>
              <Button
                type="primary"
                className="flex-1 !bg-orange-500 hover:!bg-orange-600 !border-orange-500"
                loading={reserveLoading}
                onClick={handleConfirmReserve}
              >
                Xác nhận đặt trước
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckOutlined className="text-3xl text-green-500" />
            </div>
            <div>
              <p className="font-semibold text-base text-gray-800">Đặt trước thành công!</p>
              <p className="text-gray-500 text-sm mt-1">
                Vị trí của bạn: <span className="text-orange-600 font-bold">#{queueLength}</span> trong hàng chờ
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 text-left space-y-1">
              <p>✓ Thông báo sẽ gửi khi sách có sẵn</p>
              <p>✓ Bạn có 2 ngày để đến mượn sau thông báo</p>
              <p>✓ Có thể hủy bất cứ lúc nào trên trang này</p>
            </div>
            <Button
              type="primary"
              className="w-full"
              onClick={() => {
                setShowReserveModal(false);
                setReserveDone(false);
              }}
            >
              Đóng
            </Button>
          </div>
        )}
      </Modal>

      {/* Back button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        className="mb-6 px-0 text-gray-700 hover:!bg-transparent hover:!text-blue-600"
      >
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left: cover + actions */}
        <div>
          <div className="rounded-xl overflow-hidden shadow-lg bg-gray-100 aspect-[3/4] flex items-center justify-center mb-4">
            {book.coverImage ? (
              <img src={book.coverImage} alt={book.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-6xl text-gray-300">📖</span>
            )}
          </div>

          <div className="space-y-3">
            {isAvailable ? (
              <Button type="primary" block icon={<BookOutlined />} className="h-10 bg-blue-600" onClick={handleBorrow}>
                Mượn sách
              </Button>
            ) : myReservation ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold text-amber-700">Đang chờ — vị trí #{myReservation.queuePosition}</p>
                    <p className="text-amber-600 text-xs">Sẽ thông báo khi sách có sẵn</p>
                  </div>
                  <ClockCircleOutlined className="text-lg text-amber-500" />
                </div>
                <Button block danger className="h-10" onClick={handleCancelReservation}>
                  Hủy đặt trước
                </Button>
              </div>
            ) : (
              <Button
                block
                icon={<TeamOutlined />}
                className="h-10 !bg-orange-500 !text-white !border-orange-500 hover:!bg-orange-600"
                onClick={() => {
                  setReserveDone(false);
                  setShowReserveModal(true);
                }}
              >
                Đặt trước ({queueLength} người đang chờ)
              </Button>
            )}

            <div className="relative">
              <Button
                block
                className="h-10 !flex items-center justify-between"
                onClick={() => setShowListMenu((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  {currentListItem ? <HeartFilled className="text-blue-500" /> : <HeartOutlined />}
                  {currentListItem ? LIST_OPTIONS.find((o) => o.value === currentListItem.status)?.label : 'Thêm vào danh sách'}
                </span>
                <DownOutlined className="text-xs" />
              </Button>
              {showListMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
                  {LIST_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAddToList(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        currentListItem?.status === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                      {currentListItem?.status === opt.value && <CheckOutlined className="ml-auto text-xs text-blue-500" />}
                    </button>
                  ))}
                  {currentListItem && (
                    <button
                      onClick={handleRemoveFromList}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100 transition-colors"
                    >
                      <DeleteOutlined />
                      Xóa khỏi danh sách
                    </button>
                  )}
                </div>
              )}
            </div>

            <Button block icon={<ShareAltOutlined />} className="h-10" onClick={handleShare}>
              Chia sẻ
            </Button>
          </div>

          {/* Stats card */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Tình trạng</span>
              {isAvailable ? (
                <span className="text-green-600 font-medium">
                  Có sẵn ({book.availableCopies}/{totalCopies})
                </span>
              ) : (
                <span className="text-red-600 font-medium">Hết sách</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Đánh giá</span>
              <span className="flex items-center gap-1 font-medium text-gray-900">
                <StarFilled className="text-yellow-400" />
                {(book.rating ?? 0).toFixed(1)} ({book.reviewCount ?? reviews.length})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Lượt mượn</span>
              <span className="font-medium text-gray-900">{book.borrowCount ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {book.isFeatured && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Nổi bật</span>}
            {book.isNew && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Mới</span>}
            {book.category && <span className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600">{book.category}</span>}
            {isAvailable ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Có sẵn</span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Đặt trước — giữ chỗ 2 ngày</span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.name}</h1>

          <div className="flex items-center gap-2 mb-6 text-gray-700">
            <UserOutlined className="text-gray-400" />
            <span>Tác giả: {book.instructorName}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Thể loại</p>
              <p className="font-medium text-gray-900">{book.category ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Lượt mượn</p>
              <p className="font-medium text-gray-900">{book.borrowCount ?? 0}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h2>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Đánh giá ({reviews.length})</h2>
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs">
                <StarFilled className="text-purple-500" />
                Phân tích cảm xúc: <strong>{sentiment}</strong>
              </span>
            </div>

            {/* Write review */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-900 mb-3">Viết đánh giá của bạn</p>
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-1.5">Đánh giá của bạn</p>
                <Rate value={rating} onChange={setRating} />
              </div>
              <Input.TextArea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Chia sẻ suy nghĩ của bạn về cuốn sách này..."
                className="mb-3"
              />
              <Button type="primary" onClick={handleSubmitReview}>
                Gửi đánh giá
              </Button>
            </div>

            {/* Review list */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Chưa có đánh giá nào cho sách này</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {review.reviewerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.reviewerName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <StarFilled key={i} className={`text-xs ${i <= review.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">{formatDateVN(review.date)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related books */}
      {(sameAuthorBooks.length > 0 || sameCategoryBooks.length > 0) && (
        <div className="space-y-8 border-t border-gray-100 pt-8">
          {sameAuthorBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <UserOutlined className="text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">Cùng tác giả — {book.instructorName}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sameAuthorBooks.map((b) => (
                  <RelatedBookCard key={b.id} book={b} onClick={() => router.push(`${APP_ROUTE.books}/${b.id}`)} />
                ))}
              </div>
            </div>
          )}
          {sameCategoryBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOutlined className="text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">Cùng thể loại — {book.category}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sameCategoryBooks.map((b) => (
                  <RelatedBookCard key={b.id} book={b} onClick={() => router.push(`${APP_ROUTE.books}/${b.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
