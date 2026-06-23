'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, InputNumber, Select, Spin, message } from 'antd';
import { SearchOutlined, BookOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useSearchBooks, useBookFilterOptions } from '@/features/books/hooks/useBooks';
import { IBookSearchParams } from '@/features/books/api/bookApi';
import { APP_ROUTE } from '@/constants/routes';
import {
  useReadingList,
  useAddToReadingList,
  useRemoveFromReadingList,
} from '@/features/reading-list/hooks/useReadingList';

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // filter state
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [authorId, setAuthorId] = useState<number | undefined>(undefined);
  const [publisherId, setPublisherId] = useState<number | undefined>(undefined);
  const [language, setLanguage] = useState<string | undefined>(undefined);
  const [yearFrom, setYearFrom] = useState<number | undefined>(undefined);
  const [yearTo, setYearTo] = useState<number | undefined>(undefined);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: filterOptions } = useBookFilterOptions();

  const params: IBookSearchParams = {
    q: debouncedSearch || undefined,
    category_id: categoryId,
    author_id: authorId,
    publisher_id: publisherId,
    language: language,
    year_from: yearFrom,
    year_to: yearTo,
    available_only: onlyAvailable ? 1 : undefined,
  };

  const { data: books, isLoading, isFetching } = useSearchBooks(params);

  const { data: readingListData } = useReadingList();
  const { mutate: addItem } = useAddToReadingList();
  const { mutate: removeItem } = useRemoveFromReadingList();
  const favoriteItemMap = new Map(
    (readingListData?.data ?? [])
      .filter((item) => item.status.value === 'favorite')
      .map((item) => [item.book_id, item])
  );

  const filtered = books ?? [];

  const hasActiveFilters = !!(categoryId || authorId || publisherId || language || yearFrom || yearTo || onlyAvailable);

  const clearFilters = () => {
    setCategoryId(undefined);
    setAuthorId(undefined);
    setPublisherId(undefined);
    setLanguage(undefined);
    setYearFrom(undefined);
    setYearTo(undefined);
    setOnlyAvailable(false);
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Danh mục sách</h1>
        <p className="text-gray-500 text-sm mt-1">Khám phá kho sách phong phú của thư viện</p>
      </div>

      {/* Search + filters */}
      <div className="mb-6 space-y-3">
        <Input
          placeholder="Tìm theo tên sách, tác giả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
        />

        {/* Row 1: checkbox + clear */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            Chỉ sách có sẵn
          </label>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Row 2: filter dropdowns */}
        <div className="flex flex-wrap gap-2">
          <Select
            placeholder="Thể loại"
            allowClear
            value={categoryId}
            onChange={(val: number | undefined) => setCategoryId(val)}
            options={filterOptions?.categories.map((c) => ({ value: c.category_id, label: c.category_name }))}
            style={{ minWidth: 150 }}
          />
          <Select
            placeholder="Tác giả"
            allowClear
            value={authorId}
            onChange={(val: number | undefined) => setAuthorId(val)}
            options={filterOptions?.authors.map((a) => ({ value: a.author_id, label: a.author_name }))}
            style={{ minWidth: 160 }}
          />
          <Select
            placeholder="Nhà xuất bản"
            allowClear
            value={publisherId}
            onChange={(val: number | undefined) => setPublisherId(val)}
            options={filterOptions?.publishers.map((p) => ({ value: p.publisher_id, label: p.name }))}
            style={{ minWidth: 160 }}
          />
          <Select
            placeholder="Ngôn ngữ"
            allowClear
            value={language}
            onChange={(val: string | undefined) => setLanguage(val)}
            options={filterOptions?.languages.map((l) => ({ value: l, label: l }))}
            style={{ minWidth: 130 }}
          />
          <InputNumber
            placeholder="Năm từ"
            value={yearFrom ?? null}
            onChange={(val) => setYearFrom(val ?? undefined)}
            min={1900}
            max={new Date().getFullYear()}
            style={{ width: 110 }}
          />
          <InputNumber
            placeholder="Đến năm"
            value={yearTo ?? null}
            onChange={(val) => setYearTo(val ?? undefined)}
            min={1900}
            max={new Date().getFullYear()}
            style={{ width: 110 }}
          />
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {debouncedSearch || hasActiveFilters ? (
          <>Tìm thấy <span className="font-semibold text-gray-900">{filtered.length}</span> kết quả</>
        ) : (
          <>Hiển thị <span className="font-semibold text-gray-900">{filtered.length}</span> cuốn sách</>
        )}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500">Không tìm thấy sách phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book) => {
            const favItem = favoriteItemMap.get(book.book_id) ?? null;
            const isFav = !!favItem;
            return (
            <div
              key={book.book_id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              onClick={() => router.push(`${APP_ROUTE.courses}/${book.book_id}`)}
            >
              <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-4xl text-gray-300">📖</span>
                )}
                <span
                  className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
                    book.available_copies > 0 ? 'bg-emerald-500' : 'bg-orange-400'
                  }`}
                >
                  {book.available_copies > 0 ? 'Có sẵn' : 'Đặt trước'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFav && favItem) {
                      removeItem(favItem.wishlist_id, {
                        onSuccess: () => message.success('Đã xóa khỏi yêu thích'),
                        onError: () => message.error('Có lỗi xảy ra'),
                      });
                    } else {
                      addItem({ book_id: book.book_id, status: 'favorite' }, {
                        onSuccess: () => message.success('Đã thêm vào yêu thích'),
                        onError: () => message.error('Có lỗi xảy ra'),
                      });
                    }
                  }}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/85 hover:bg-white flex items-center justify-center shadow-sm transition-all"
                  title={isFav ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  {isFav
                    ? <HeartFilled className="text-red-500 text-sm" />
                    : <HeartOutlined className="text-gray-400 text-sm" />
                  }
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                  {book.title}
                </h3>
                {book.author && (
                  <p className="text-xs text-gray-500 truncate mt-0.5">{book.author}</p>
                )}
                {book.isbn && (
                  <p className="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Spin size="large" />
        </div>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}
