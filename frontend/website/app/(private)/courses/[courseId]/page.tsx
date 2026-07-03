  'use client';
  import axiosInstance from '@/lib/axios/axios-client';
  import { Button, Card, Dropdown, Input, Pagination, Rate, Spin, Tag, message } from 'antd';
  import { ArrowLeftOutlined, BookOutlined, CheckOutlined, DownOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons';
import { use, useEffect, useState } from 'react';
  import { useRouter } from 'next/navigation';
  import { useQueryClient } from '@tanstack/react-query';
  import { getCookie } from '@shared/utils/cookie';
  import { STORAGES } from '@shared/constants/storage';
  import type { IDetailUser } from '@shared/types/UserType';
  import {
    useBookDetail, useRelatedBooks,
    useBookReviews, useReviewPermission, useSubmitReview,
  } from '@/features/books/hooks/useBooks';
  import type { IRelatedBook } from '@/features/books/api/bookApi';
  import { APP_ROUTE } from '@/constants/routes';
  import type { IReadingListStatus } from '@/features/reading-list/api/readingListApi';
  import {
    useReadingList,
    useAddToReadingList,
    useUpdateReadingList,
    useRemoveFromReadingList,
  } from '@/features/reading-list/hooks/useReadingList';

  function formatDate(dt: string) {
    const d = new Date(dt.replace(' ', 'T'));
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  export default function BookDetailPage({
    params,
  }: {
    params: Promise<{ courseId: string }>;
  }) {
    const { courseId } = use(params);
    const bookId = Number(courseId);
    const router = useRouter();
    const queryClient = useQueryClient();
  const [user, setUser] = useState<IDetailUser | undefined>(undefined);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  useEffect(() => {
    const storedUser = getCookie(STORAGES.USER_LOGIN) as IDetailUser | undefined;
    if (storedUser) {
      setUser(storedUser);
    }
    setIsUserLoaded(true);
  }, []);

    const [reviewContent, setReviewContent] = useState('');
    const [reviewPage, setReviewPage] = useState(1);
    const [reviewRating, setReviewRating] = useState(0);
    const userId = user?.id ? Number(user.id) : undefined;

    const { data: book, isLoading, isError } = useBookDetail(bookId);
    const { data: related } = useRelatedBooks(bookId);
    const { data: reviewsData, isLoading: isReviewsLoading, refetch: refetchReviews } = useBookReviews(bookId, reviewPage);
    const { data: permissionData } = useReviewPermission(bookId, userId ?? 0);
    const submitReviewMutation = useSubmitReview();

    const { data: readingListData } = useReadingList();
    const addItem = useAddToReadingList();
    const [isReserving, setIsReserving] = useState(false);
    const updateItem = useUpdateReadingList();
    const removeItem = useRemoveFromReadingList();

    const allItems = readingListData?.data ?? [];
    const favoriteItem = allItems.find(
      (item) => item.book_id === bookId && item.status.value === 'favorite'
    ) ?? null;
    const readingItem = allItems.find(
      (item) => item.book_id === bookId && item.status.value !== 'favorite'
    ) ?? null;

    const isFavorite = !!favoriteItem;

   const handleReserveBook = async () => {
  try {
    setIsReserving(true);

    const { data } = await axiosInstance.post(
      '/v1/me/reservations',
      {
        book_id: bookId,
      }
    );

    message.success(
      `Đặt trước thành công. Vị trí #${data.queue_position}`
    );
    queryClient.invalidateQueries({
     queryKey: ['my-reservations'],
    });

    // Chuyển sang trang danh sách đặt trước
    router.push('/reservations');

  } catch (error: any) {
    message.error(
      error?.response?.data?.message || 'Không thể kết nối máy chủ'
    );
  } finally {
    setIsReserving(false);
  }
};

    const handleToggleFavorite = () => {
      addItem.mutate(
        { book_id: bookId, status: 'favorite' },
        {
          onSuccess: () => message.success('Đã thêm vào yêu thích.'),
          onError: () => message.error('Có lỗi xảy ra. Vui lòng thử lại.'),
        }
      );
    };

    const handleRemoveFavorite = () => {
      if (!favoriteItem) return;
      removeItem.mutate(favoriteItem.wishlist_id, {
        onSuccess: () => message.success('Đã xóa khỏi yêu thích.'),
        onError: () => message.error('Có lỗi xảy ra. Vui lòng thử lại.'),
      });
    };

    const handleAddToList = () => {
      addItem.mutate(
        { book_id: bookId, status: 'want_to_read' },
        {
          onSuccess: () => message.success('Đã thêm vào danh sách đọc.'),
          onError: () => message.error('Có lỗi xảy ra. Vui lòng thử lại.'),
        }
      );
    };

    const handleMarkFinished = () => {
      if (!readingItem) return;
      updateItem.mutate(
        { wishlistId: readingItem.wishlist_id, status: 'finished' },
        {
          onSuccess: () => message.success('Đã đánh dấu hoàn thành.'),
          onError: () => message.error('Có lỗi xảy ra. Vui lòng thử lại.'),
        }
      );
    };

    const handleMenuClick = ({ key }: { key: string }) => {
      if (!readingItem) return;
      if (key === 'remove') {
        removeItem.mutate(readingItem.wishlist_id, {
          onSuccess: () => message.success('Đã xóa khỏi danh sách đọc.'),
          onError: () => message.error('Có lỗi xảy ra. Vui lòng thử lại.'),
        });
        return;
      }
      updateItem.mutate(
        { wishlistId: readingItem.wishlist_id, status: key as IReadingListStatus },
        {
          onSuccess: () => message.success('Đã cập nhật trạng thái.'),
          onError: () => message.error('Có lỗi xảy ra. Vui lòng thử lại.'),
        }
      );
    };

    const handleSubmitReview = async () => {
      if (!reviewRating) {
        message.warning('Vui lòng chọn số sao.');
        return;
      }
      if (!reviewContent.trim()) {
        message.warning('Vui lòng nhập nội dung nhận xét.');
        return;
      }
      try {
        await submitReviewMutation.mutateAsync({
          bookId,
          data: { user_id: userId, rating: reviewRating, content: reviewContent },
        });
        message.success('Đánh giá đã được lưu.');
        setReviewRating(0);
        setReviewContent('');
        setReviewPage(1);
        refetchReviews();
        queryClient.invalidateQueries({ queryKey: ['book-detail', bookId] });
      } catch {
        message.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    };

    if (isLoading) {
      return (
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      );
    }

    if (isError || !book) {
      return (
        <div className="flex flex-col items-center py-24 gap-4">
          <BookOutlined className="text-5xl text-gray-300" />
          <p className="text-gray-500">Không tìm thấy sách.</p>
          <Button onClick={() => router.push(APP_ROUTE.courses)}>
            Quay về danh mục
          </Button>
        </div>
      );
    }

    const metaRows = [
      { label: 'Nhà xuất bản', value: book.publisher },
      { label: 'Năm xuất bản', value: book.publish_year },
      { label: 'Ngôn ngữ', value: book.language },
      { label: 'Số trang', value: book.pages },
      { label: 'ISBN', value: book.isbn },
    ].filter(({ value }) => value !== null && value !== undefined);

    return (
      <div className="max-w-4xl mx-auto">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(APP_ROUTE.courses)}
          className="mb-6 px-0 font-medium text-base text-(--blackSoft) hover:underline hover:bg-transparent"
        >
          Quay về danh mục
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-start">
          {/* Cover image */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shadow-md">
              {book.cover_image ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOutlined className="text-6xl text-gray-300" />
              )}
            </div>

            <div
              className={`w-full text-center text-sm font-semibold py-2 px-4 rounded-lg ${
                book.available_copies > 0
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-orange-50 text-orange-600 border border-orange-200'
              }`}
            >
              {book.available_copies > 0
                ? `Có sẵn ${book.available_copies} bản`
                : 'Không có sẵn'}
            </div>
          </div>

          {/* Detail card */}
          <Card
            className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
            styles={{ body: { padding: 24 } }}
          >
            <h1 className="text-2xl font-bold text-(--blackSoft) mb-2 leading-tight">
              {book.title}
            </h1>

            {book.authors.length > 0 && (
              <p className="text-base text-(--grayDark) mb-3">
                {book.authors.join(', ')}
              </p>
            )}

            {book.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {book.categories.map((cat) => (
                  <Tag key={cat} color="blue" className="text-xs">
                    {cat}
                  </Tag>
                ))}
              </div>
            )}

            {book.total_reviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Rate disabled allowHalf value={book.avg_rating} className="text-sm" />
                <span className="text-sm text-(--grayMedium)">
                  {book.avg_rating.toFixed(1)} ({book.total_reviews} đánh giá)
                </span>
              </div>
            )}

            {/* Yêu thích */}
            <div className="mb-3">
              {isFavorite ? (
                <Button
                  icon={<HeartFilled className="text-red-500" />}
                  onClick={handleRemoveFavorite}
                  loading={removeItem.isPending}
                  className="w-full border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                >
                  Đã yêu thích
                </Button>
              ) : (
                <Button
                  icon={<HeartOutlined className="text-red-400" />}
                  onClick={handleToggleFavorite}
                  loading={addItem.isPending || updateItem.isPending}
                  className="w-full border-red-100 text-red-500 hover:border-red-200 hover:bg-red-50"
                >
                  Thêm vào yêu thích
                </Button>
              )}
         
            {/* Reading list widget */}
            <div className="mt-3 mb-4">
              {!readingItem ? (
                <Button
                  icon={<BookOutlined />}
                  onClick={handleAddToList}
                  loading={addItem.isPending}
                  className="w-full"
                >
                  Thêm vào danh sách đọc
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag
                    color={
                      readingItem.status.value === 'want_to_read'
                        ? 'blue'
                        : readingItem.status.value === 'reading'
                          ? 'orange'
                          : 'green'
                    }
                    className="text-sm px-3 py-1 m-0"
                  >
                    {readingItem.status.label}
                  </Tag>
                  {readingItem.status.value === 'reading' && (
                    <Button
                      size="small"
                      icon={<CheckOutlined />}
                      onClick={handleMarkFinished}
                      loading={updateItem.isPending}
                    >
                      Hoàn thành
                    </Button>
                  )}
                  <Dropdown
                    menu={{
                      items: [
                        { key: 'want_to_read', label: 'Đọc sau' },
                        { key: 'reading', label: 'Đang đọc' },
                        { key: 'finished', label: 'Đã đọc' },
                        { type: 'divider' as const },
                        { key: 'remove', label: 'Xóa khỏi danh sách', danger: true },
                      ],
                      onClick: handleMenuClick,
                    }}
                  >
                    <Button size="small">
                      Quản lý <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              )}
            </div>
            </div>
            {book.available_copies === 0 && (
              <Button
                type="primary"
                onClick={handleReserveBook}
                loading={isReserving}
                className="w-full mt-3 bg-blue-600"
              >
                Đặt trước sách
              </Button>
            )}
            {metaRows.length > 0 && (
              <div className="border-t border-(--blackBorder) pt-4">
                {metaRows.map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-2.5 border-b border-(--blackBorder) last:border-0"
                  >
                    <span className="text-sm text-(--grayMedium)">{label}</span>
                    <span className="text-sm font-medium text-(--blackSoft)">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {book.description && (
              <div className="mt-4 pt-4 border-t border-(--blackBorder)">
                <p className="text-sm font-semibold text-(--blackSoft) mb-2">Mô tả</p>
                <p className="text-sm text-(--grayDark) leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Related sections */}
        {related && related.same_author.length > 0 && (
          <RelatedSection
            title="Sách cùng tác giả"
            books={related.same_author}
            onBookClick={(id) => router.push(`${APP_ROUTE.courses}/${id}`)}
          />
        )}

        {related && related.same_category.length > 0 && (
          <RelatedSection
            title="Có thể bạn cũng thích"
            books={related.same_category}
            onBookClick={(id) => router.push(`${APP_ROUTE.courses}/${id}`)}
          />
        )}

        {/* ── Reviews section ── */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-(--blackSoft) mb-5">Đánh giá &amp; Nhận xét</h2>

          {/* Rating summary */}
          {book.total_reviews > 0 && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-(--grayBorder)">
              <span className="text-5xl font-bold text-(--blackSoft)">{book.avg_rating.toFixed(1)}</span>
              <div>
                <Rate disabled allowHalf value={book.avg_rating} className="text-base" />
                <p className="text-sm text-(--grayMedium) mt-1">{book.total_reviews} đánh giá</p>
              </div>
            </div>
          )}

          {/* Review form */}
          {permissionData?.can_review && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
              <p className="text-sm font-semibold text-(--blackSoft) mb-3">Viết đánh giá của bạn</p>
              <Rate
                value={reviewRating}
                onChange={setReviewRating}
                className="mb-3 text-xl"
              />
              <Input.TextArea
                rows={3}
                placeholder="Nhập nội dung nhận xét (tối đa 1000 ký tự)..."
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                maxLength={1000}
                showCount
                className="mb-3"
              />
              <Button
                type="primary"
                loading={submitReviewMutation.isPending}
                onClick={handleSubmitReview}
              >
                Gửi đánh giá
              </Button>
            </div>
          )}

          {/* Review list */}
          {isReviewsLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : !reviewsData || reviewsData.data.length === 0 ? (
            <p className="text-sm text-(--grayMedium) text-center py-8">Chưa có đánh giá nào.</p>
          ) : (
            <>
              <div className="space-y-5">
                {reviewsData.data.map((r) => (
                  <div key={r.review_id} className="border-b border-(--blackBorder) pb-5 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-(--blackSoft)">{r.full_name}</span>
                      <span className="text-xs text-(--grayMedium)">{formatDate(r.created_at)}</span>
                    </div>
                    <Rate disabled value={r.rating} className="text-sm mb-1.5" />
                    {r.content && (
                      <p className="text-sm text-(--grayDark) leading-relaxed">{r.content}</p>
                    )}
                  </div>
                ))}
              </div>

              {reviewsData.pagination.last_page > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={reviewPage}
                    total={reviewsData.pagination.total}
                    pageSize={reviewsData.pagination.per_page}
                    onChange={(p) => setReviewPage(p)}
                    showSizeChanger={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  function RelatedSection({
    title,
    books,
    onBookClick,
  }: {
    title: string;
    books: IRelatedBook[];
    onBookClick: (bookId: number) => void;
  }) {
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-(--blackSoft) mb-4">{title}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {books.map((b) => (
            <div
              key={b.book_id}
              onClick={() => onBookClick(b.book_id)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                {b.cover_image ? (
                  <img
                    src={b.cover_image}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <BookOutlined className="text-3xl text-gray-300" />
                )}
                <span
                  className={`absolute top-1.5 left-1.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
                    b.available_copies > 0 ? 'bg-emerald-500' : 'bg-orange-400'
                  }`}
                >
                  {b.available_copies > 0 ? 'Có sẵn' : 'Hết'}
                </span>
              </div>
              <p className="text-xs font-medium text-(--blackSoft) mt-1.5 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                {b.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }
