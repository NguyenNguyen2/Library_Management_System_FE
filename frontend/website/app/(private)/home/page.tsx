"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Empty, Input, Spin } from "antd";
import {
  SearchOutlined,
  BookOutlined,
  ReadOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  FireOutlined,
  TrophyOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { getCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import type { IDetailUser } from '@shared/types/UserType';
import { useMockBorrowedBooks } from '@/lib/mock/useMockBorrowedBooks';
import { useMockReadingList } from '@/lib/mock/useMockReadingList';
import { useMockReservations } from '@/lib/mock/useMockReservations';
import { READER_BORROW_LIMIT, READER_CATEGORIES } from '@/lib/mock/mockData';
import { getDaysUntil } from '@/lib/utils/date';
import { APP_ROUTE } from '@/constants/routes';
import { useSearchBooks, useHomeBooks } from '@/features/books/hooks/useBooks';
import type { IHomeBook } from '@/features/books/api/bookApi';

function HomeBookCard({ book, onClick }: { book: IHomeBook; onClick: () => void }) {
  return (
    <div
      className="flex-shrink-0 w-40 snap-start group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all h-full">
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden flex items-center justify-center">
          {book.cover_image ? (
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <BookOutlined style={{ fontSize: 36 }} className="text-gray-300" />
          )}
          <span
            className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
              book.available_copies > 0 ? "bg-emerald-500" : "bg-orange-400"
            }`}
          >
            {book.available_copies > 0 ? "Có sẵn" : "Đặt trước"}
          </span>
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors font-semibold">
            {book.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  onClick,
  accent = "text-white/80",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  onClick?: () => void;
  accent?: string;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white/15 backdrop-blur border border-white/20 rounded-xl p-4 h-full hover:bg-white/20 transition-colors cursor-pointer"
    >
      <div className={`flex items-center gap-2 text-xs ${accent}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl mt-1 text-white">{value}</div>
    </div>
  );
}

function BookSection({
  title,
  icon,
  books,
  onBookClick,
}: {
  title: string;
  icon: React.ReactNode;
  books: IHomeBook[];
  onBookClick: (bookId: number) => void;
}) {
  const router = useRouter();
  if (books.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl text-gray-900 font-semibold">
          {icon}
          {title}
        </h2>
        <Button type="link" className="text-blue-600" onClick={() => router.push(APP_ROUTE.courses)}>
          Xem tất cả →
        </Button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-none -mx-1 px-1">
        {books.map((b) => (
          <HomeBookCard key={b.book_id} book={b} onClick={() => onBookClick(b.book_id)} />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState("");

  const user = getCookie(STORAGES.USER_LOGIN) as IDetailUser | undefined;
  const userName = user?.name ?? "Độc giả";

  const { data: borrowedData } = useMockBorrowedBooks();
  const { data: reservationsData } = useMockReservations();
  const { data: readingListData } = useMockReadingList();

  const borrowedBooks = borrowedData?.rows ?? [];
  const reservationsList = reservationsData?.rows ?? [];
  const readingList = readingListData?.rows ?? [];

  const borrowedCount = borrowedBooks.length;
  const overdueCount = borrowedBooks.filter((b) => getDaysUntil(b.dueDate) < 0).length;
  const activeReservationsCount = reservationsList.filter(
    (r) => r.status === 'waiting' || r.status === 'ready',
  ).length;
  const readingListCount = readingList.length;

  const { data: homeBooks, isLoading: isHomeBooksLoading } = useHomeBooks();

  const handleBookClick = (bookId: number) => {
    router.push(`${APP_ROUTE.courses}/${bookId}`);
  };

  const [debouncedQ, setDebouncedQ] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(searchQ.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQ]);
  const { data: searchResults, isFetching: isSearching } = useSearchBooks({ q: debouncedQ });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) router.push(`/courses?q=${encodeURIComponent(searchQ.trim())}`);
    else router.push('/courses');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm mb-4">
                👋 Xin chào, <span className="font-semibold">{userName}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl leading-tight drop-shadow">
                Khám phá hàng ngàn<br />đầu sách hay
              </h1>
              <p className="mt-3 text-white/85 text-lg">
                Mượn nhanh chóng · Đọc thông minh · Trả tiện lợi
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="mt-6 bg-white rounded-2xl p-2 flex gap-2 shadow-2xl max-w-xl">
                <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Tìm sách, tác giả, thể loại..."
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  className="border-0 h-11 focus:ring-0"
                  style={{ fontSize: "14px" }}
                />
                <Button type="primary" htmlType="submit" className="h-11 bg-blue-600 hover:bg-blue-700 px-6 rounded-xl border-0">
                  Tìm kiếm
                </Button>
              </form>

              {/* Category tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {READER_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => router.push(`/courses?category=${cat}`)}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full text-sm transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Right stats (desktop only) */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              <StatPill
                icon={<BookOutlined />}
                label="Đang mượn"
                value={`${borrowedCount} / ${READER_BORROW_LIMIT}`}
                onClick={() => router.push(APP_ROUTE.borrowed)}
              />
              <StatPill
                icon={<WarningOutlined />}
                label="Quá hạn"
                value={overdueCount}
                accent="text-red-200"
                onClick={() => router.push(APP_ROUTE.borrowed)}
              />
              <StatPill
                icon={<ClockCircleOutlined />}
                label="Đặt trước"
                value={activeReservationsCount}
                accent="text-amber-200"
                onClick={() => router.push(APP_ROUTE.reservations)}
              />
              <StatPill
                icon={<ReadOutlined />}
                label="Danh sách đọc"
                value={readingListCount}
                onClick={() => router.push(APP_ROUTE.readingList)}
              />
            </div>
          </div>

          {/* Mobile stats */}
          <div className="grid grid-cols-4 gap-2 mt-6 lg:hidden">
            {[
              { label: "Mượn", value: `${borrowedCount}/${READER_BORROW_LIMIT}` },
              { label: "Quá hạn", value: overdueCount },
              { label: "Đặt trước", value: activeReservationsCount },
              { label: "DS đọc", value: readingListCount },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/15 border border-white/20 rounded-xl p-3 text-center hover:bg-white/20 transition-colors"
              >
                <p className="text-2xl text-white font-bold">{stat.value}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <button
            onClick={() => router.push(APP_ROUTE.borrowed)}
            className="w-full flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition-colors text-left"
          >
            <WarningOutlined className="text-red-500 text-lg flex-shrink-0" />
            <p className="text-sm text-red-700">
              Bạn có <span className="font-bold">{overdueCount} sách quá hạn</span>. Vui lòng trả sớm để tránh phát sinh phí.
            </p>
            <RightOutlined className="text-red-400 ml-auto text-xs flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Book Sections / Search Results */}
      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10">
        {debouncedQ ? (
          /* ── Search results ── */
          <section>
            <h2 className="flex items-center gap-2 text-xl text-gray-900 font-semibold mb-4">
              <SearchOutlined className="text-blue-500" />
              Kết quả cho &ldquo;{debouncedQ}&rdquo;
            </h2>

            {isSearching ? (
              <div className="flex justify-center py-16">
                <Spin size="large" />
              </div>
            ) : !searchResults || searchResults.length === 0 ? (
              <Empty description="Không tìm thấy sách phù hợp" className="py-16" />
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Tìm thấy <span className="font-semibold text-gray-800">{searchResults.length}</span> kết quả
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {searchResults.map((book) => (
                    <div
                      key={book.book_id}
                      onClick={() => router.push(`${APP_ROUTE.courses}/${book.book_id}`)}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all group"
                    >
                      {/* Cover */}
                      <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <BookOutlined style={{ fontSize: 36 }} className="text-gray-300" />
                        )}
                        <span
                          className={`absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white ${
                            book.available_copies > 0 ? "bg-emerald-500" : "bg-orange-400"
                          }`}
                        >
                          {book.available_copies > 0 ? `Còn ${book.available_copies}` : "Hết"}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-0.5 group-hover:text-blue-600 transition-colors">
                          {book.title}
                        </p>
                        {book.author && (
                          <p className="text-[11px] text-gray-500 truncate">{book.author}</p>
                        )}
                        {book.isbn && (
                          <p className="text-[11px] text-gray-400 mt-1">ISBN: {book.isbn}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        ) : isHomeBooksLoading ? (
          <div className="flex justify-center py-16">
            <Spin size="large" />
          </div>
        ) : (
          /* ── Book collections ── */
          <>
            <BookSection
              title="Sách nổi bật"
              icon={<TrophyOutlined className="text-yellow-500" />}
              books={homeBooks?.featured ?? []}
              onBookClick={handleBookClick}
            />
            <BookSection
              title="Sách mới nhập"
              icon={<ThunderboltOutlined className="text-blue-500" />}
              books={homeBooks?.new_books ?? []}
              onBookClick={handleBookClick}
            />
            <BookSection
              title="Sách được mượn nhiều nhất"
              icon={<FireOutlined className="text-rose-500" />}
              books={homeBooks?.most_borrowed ?? []}
              onBookClick={handleBookClick}
            />
          </>
        )}
      </div>
    </div>
  );
}
