'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Spin } from 'antd';
import { BookOutlined, HeartFilled, StarFilled } from '@ant-design/icons';
import { favoritesShareApi, type ISharedFavoritesData } from '@/features/favorites/api/favoritesShareApi';

export default function SharedFavoritesPage() {
  const params = useParams<{ token: string }>();
  const [sharedData, setSharedData] = useState<ISharedFavoritesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.token) return;
    favoritesShareApi
      .getPublic(params.token)
      .then((res) => setSharedData(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (notFound || !sharedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy danh sách</h1>
          <p className="text-gray-500 text-sm">
            Danh sách này không tồn tại hoặc không còn được chia sẻ công khai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <HeartFilled className="text-red-500 text-xl" />
          <span className="font-bold text-gray-900 text-lg">The Library</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Owner info */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl text-blue-500">
            <BookOutlined />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Danh sách yêu thích của {sharedData.owner_name}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">{sharedData.total} cuốn sách</p>
          </div>
        </div>

        {/* Book list */}
        {sharedData.books.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-red-300">
              <HeartFilled />
            </div>
            <p className="text-gray-500">Danh sách yêu thích đang trống.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedData.books.map((book) => (
              <div
                key={book.book_id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="flex gap-4 p-4">
                  <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {book.cover_image ? (
                      <img
                        src={book.cover_image}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl text-gray-300">📖</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 font-semibold truncate">{book.title}</h3>
                    {book.author_name && (
                      <p className="text-sm text-gray-500 mt-0.5">{book.author_name}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <StarFilled
                            key={i}
                            className={
                              i <= Math.round(book.avg_rating ?? 0)
                                ? 'text-yellow-400'
                                : 'text-gray-200'
                            }
                          />
                        ))}
                        <span className="text-gray-400 ml-0.5">
                          {(book.avg_rating ?? 0).toFixed(1)}
                        </span>
                      </span>
                      {(book.available_copies ?? 0) > 0 ? (
                        <span className="text-green-600">● Có sẵn</span>
                      ) : (
                        <span className="text-orange-500">● Đặt trước</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
