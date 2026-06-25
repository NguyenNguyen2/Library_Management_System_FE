'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Input, Modal, Spin } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  FacebookFilled,
  HeartOutlined,
  LinkOutlined,
  MessageFilled,
  RightOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarFilled,
  XOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import {
  useReadingList,
  useAddToReadingList,
  useRemoveFromReadingList,
} from '@/features/reading-list/hooks/useReadingList';
import { favoritesShareApi } from '@/features/favorites/api/favoritesShareApi';
import { APP_ROUTE } from '@/constants/routes';

export default function FavoritesPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { data, isLoading } = useReadingList();
  const { mutate: addItem } = useAddToReadingList();
  const { mutate: removeItem } = useRemoveFromReadingList();
  const { mutate: shareFavorites, isPending: isSharing } = useMutation({
    mutationFn: () => favoritesShareApi.share(),
  });

  const [search, setSearch] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    shareFavorites(undefined, {
      onSuccess: (res) => {
        const url = `${window.location.origin}/shared/favorites/${res.token}`;
        setShareUrl(url);
      },
      onError: () => message.error('Không thể tạo link chia sẻ. Vui lòng thử lại.'),
    });
  };

  const handleCopyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const items = data?.data ?? [];
  const favoriteItems = items.filter((item) => item.status.value === 'favorite');

  const filtered = favoriteItems.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.author_name?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleMoveToReading = (bookId: number, title: string) => {
    addItem(
      { book_id: bookId, status: 'reading' },
      {
        onSuccess: () => message.success(`Đã thêm "${title}" vào Đang đọc`),
        onError: () => message.error('Thao tác thất bại. Vui lòng thử lại.'),
      }
    );
  };

  const handleMoveToFinished = (bookId: number, title: string) => {
    addItem(
      { book_id: bookId, status: 'finished' },
      {
        onSuccess: () => message.success(`Đã thêm "${title}" vào Đã đọc`),
        onError: () => message.error('Thao tác thất bại. Vui lòng thử lại.'),
      }
    );
  };

  const handleRemove = (wishlistId: number, title: string) => {
    removeItem(wishlistId, {
      onSuccess: () => message.success(`Đã xóa "${title}" khỏi yêu thích`),
      onError: () => message.error('Xóa thất bại. Vui lòng thử lại.'),
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Share modal */}
      <Modal
        open={!!shareUrl}
        onCancel={() => { setShareUrl(''); setCopied(false); }}
        footer={null}
        width={420}
        centered
        destroyOnHidden
        title={
          <span className="flex items-center gap-2">
            <ShareAltOutlined /> Chia sẻ danh sách yêu thích
          </span>
        }
      >
        <div className="space-y-4 pt-2">
          <div>
            <p className="text-xs text-gray-500 mb-1.5 font-medium">Link chia sẻ công khai</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-0">
                <LinkOutlined className="text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-600 truncate">{shareUrl}</span>
              </div>
              <Button
                size="small"
                type="primary"
                className={copied ? '!bg-green-500 hover:!bg-green-600' : ''}
                icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                onClick={handleCopyShareUrl}
              >
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </Button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Bất kỳ ai có link đều có thể xem danh sách yêu thích của bạn (chỉ đọc).
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Chia sẻ lên mạng xã hội</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1877F2] text-white text-sm hover:opacity-90 transition-opacity"
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                    '_blank'
                  )
                }
              >
                <FacebookFilled /> Facebook
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0084FF] text-white text-sm hover:opacity-90 transition-opacity"
                onClick={() =>
                  window.open(
                    `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`,
                    '_blank'
                  )
                }
              >
                <MessageFilled /> Messenger
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black text-white text-sm hover:opacity-90 transition-opacity"
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Xem danh sách yêu thích của tôi trên The Library!')}`,
                    '_blank'
                  )
                }
              >
                <XOutlined /> X
              </button>
              {typeof navigator !== 'undefined' && !!navigator.share && (
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    navigator
                      .share({ title: 'Danh sách yêu thích', url: shareUrl })
                      .catch(() => undefined)
                  }
                >
                  <ShareAltOutlined /> Khác
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HeartOutlined className="text-red-500" />
            Yêu thích
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Danh sách sách bạn muốn đọc ({favoriteItems.length} cuốn)
          </p>
        </div>
        {favoriteItems.length > 0 && (
          <Button
            icon={<ShareAltOutlined />}
            loading={isSharing}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 shrink-0"
            onClick={handleShare}
          >
            Chia sẻ
          </Button>
        )}
      </div>

      {favoriteItems.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-red-400">
            <HeartOutlined />
          </div>
          <p className="text-gray-600 font-medium mb-1">Chưa có sách yêu thích nào</p>
          <p className="text-sm">Tìm sách và thêm vào yêu thích từ trang chi tiết sách</p>
          <Button
            type="primary"
            icon={<BookOutlined />}
            className="mt-4"
            onClick={() => router.push(APP_ROUTE.courses)}
          >
            Khám phá sách
          </Button>
        </div>
      ) : (
        <>
          <div className="relative mb-5">
            <Input
              placeholder="Tìm trong yêu thích..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Không tìm thấy sách khớp với &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <div
                  key={item.wishlist_id}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-4 p-4">
                    <div
                      className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center"
                      onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
                    >
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-2xl text-gray-300">📖</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="text-gray-900 font-semibold hover:text-blue-600 cursor-pointer truncate transition-colors"
                            onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
                          >
                            {item.title}
                          </h3>
                          {item.author_name && (
                            <p className="text-sm text-gray-500">{item.author_name}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                            <span className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <StarFilled
                                  key={i}
                                  className={
                                    i <= Math.round(item.avg_rating ?? 0)
                                      ? 'text-yellow-400'
                                      : 'text-gray-200'
                                  }
                                />
                              ))}
                              <span className="text-gray-400 ml-0.5">
                                {(item.avg_rating ?? 0).toFixed(1)}
                              </span>
                            </span>
                            {(item.available_copies ?? 0) > 0 ? (
                              <span className="text-green-600">● Có sẵn</span>
                            ) : (
                              <span className="text-orange-500">● Đặt trước</span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemove(item.wishlist_id, item.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                          title="Xóa khỏi yêu thích"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="text-xs text-gray-400">Chuyển sang:</span>
                        <button
                          onClick={() => handleMoveToReading(item.book_id, item.title)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-amber-200 bg-amber-50 text-amber-600 hover:opacity-80 transition-colors"
                        >
                          <ClockCircleOutlined />
                          Đang đọc
                        </button>
                        <button
                          onClick={() => handleMoveToFinished(item.book_id, item.title)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-green-200 bg-green-50 text-green-600 hover:opacity-80 transition-colors"
                        >
                          <CheckCircleOutlined />
                          Đã đọc
                        </button>
                        <button
                          onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors ml-auto"
                        >
                          Xem chi tiết <RightOutlined className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
