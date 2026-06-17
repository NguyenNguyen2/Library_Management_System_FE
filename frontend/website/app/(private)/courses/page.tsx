'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input, Select, Spin } from 'antd';
import { SearchOutlined, BookOutlined, StarFilled } from '@ant-design/icons';
import { useCourses } from '@/features/courses/hooks/useCourses';
import { READER_CATEGORIES, type MockCourse } from '@/lib/mock/mockData';
import { APP_ROUTE } from '@/constants/routes';

type SortKey = 'name' | 'rating' | 'popular';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Theo tên' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'popular', label: 'Được mượn nhiều' },
];

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading } = useCourses({ page: 1, limit: 100 });
  const books = useMemo(() => (data?.rows ?? []) as MockCourse[], [data]);

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortKey>('name');

  const filtered = useMemo(() => {
    const result = books.filter((book) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          book.name.toLowerCase().includes(q) ||
          book.instructorName.toLowerCase().includes(q) ||
          book.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (category !== 'all' && book.category !== category) return false;
      if (onlyAvailable && (book.availableCopies ?? 0) === 0) return false;
      return true;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case 'rating':
          return (b.rating ?? 0) - (a.rating ?? 0);
        case 'popular':
          return (b.borrowCount ?? 0) - (a.borrowCount ?? 0);
        default:
          return a.name.localeCompare(b.name, 'vi');
      }
    });
  }, [books, search, category, onlyAvailable, sort]);

  if (isLoading) {
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
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('all')}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                category === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              Tất cả
            </button>
            {READER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <label className="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded"
              />
              Chỉ sách có sẵn
            </label>
            <Select<SortKey> value={sort} onChange={setSort} options={SORT_OPTIONS} className="w-40" />
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Tìm thấy <span className="font-semibold text-gray-900">{filtered.length}</span> kết quả
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500">Không tìm thấy sách phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((book) => (
            <div
              key={book.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group"
              onClick={() => router.push(`${APP_ROUTE.books}/${book.id}`)}
            >
              <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="text-4xl text-gray-300">📖</span>
                )}
                {book.isNew && (
                  <span className="absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                    Mới
                  </span>
                )}
                <span
                  className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
                    (book.availableCopies ?? 0) > 0 ? 'bg-emerald-500' : 'bg-orange-400'
                  }`}
                >
                  {(book.availableCopies ?? 0) > 0 ? 'Có sẵn' : 'Đặt trước'}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
                  {book.name}
                </h3>
                <p className="text-xs text-gray-500 truncate mt-0.5">{book.instructorName}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <StarFilled className="text-xs text-yellow-400" />
                  <span className="text-xs text-gray-700 font-semibold">{(book.rating ?? 0).toFixed(1)}</span>
                  {book.reviewCount != null && <span className="text-xs text-gray-400">({book.reviewCount})</span>}
                </div>
                {book.category && (
                  <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">
                    {book.category}
                  </span>
                )}
              </div>
            </div>
          ))}
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
