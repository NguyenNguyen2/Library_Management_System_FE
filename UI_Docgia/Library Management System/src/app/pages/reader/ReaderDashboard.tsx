import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  BookOpen,
  Search,
  Sparkles,
  Flame,
  Star,
  ChevronRight,
  AlertTriangle,
  Clock3,
  CreditCard,
  BookMarked,
  TrendingUp,
  Award,
  Lightbulb,
} from 'lucide-react';
import type { Reader, Book } from '../../types';

/* ─── Book Card ─────────────────────────────────────────────── */
function BookCard({ book, authorName }: { book: Book; authorName: string }) {
  return (
    <Link to={`/reader/catalog/${book.id}`} className="flex-shrink-0 w-40 snap-start group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all h-full">
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2">
            {book.availableCopies > 0 ? (
              <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                Có sẵn
              </span>
            ) : (
              <span className="bg-orange-400 text-white text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                Đặt trước
              </span>
            )}
          </div>
          {book.isFeatured && (
            <div className="absolute top-2 right-2">
              <span className="bg-yellow-400 text-yellow-900 text-[10px] px-1.5 py-0.5 rounded-full" style={{ fontWeight: 600 }}>
                Nổi bật
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-xs text-gray-900 line-clamp-2 leading-snug mb-0.5 group-hover:text-blue-600 transition-colors" style={{ fontWeight: 600 }}>
            {book.title}
          </p>
          <p className="text-[11px] text-gray-500 truncate">{authorName}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-700" style={{ fontWeight: 600 }}>{book.rating.toFixed(1)}</span>
            <span className="text-[11px] text-gray-400">({book.reviewCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Section Row ───────────────────────────────────────────── */
function BookSection({
  title,
  icon,
  books,
  authors,
  viewAllLink,
}: {
  title: string;
  icon: React.ReactNode;
  books: Book[];
  authors: { id: string; name: string }[];
  viewAllLink?: string;
}) {
  if (books.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-xl text-gray-900">
          {icon}
          {title}
        </h2>
        <Link to={viewAllLink ?? '/reader/catalog'}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            Xem tất cả <ChevronRight className="w-4 h-4 ml-0.5" />
          </Button>
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-none -mx-1 px-1">
        {books.map((b) => {
          const author = authors.find((a) => a.id === b.authorId);
          return <BookCard key={b.id} book={b} authorName={author?.name ?? ''} />;
        })}
      </div>
    </section>
  );
}

/* ─── Stat Pill ─────────────────────────────────────────────── */
function StatPill({
  icon,
  label,
  value,
  to,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  to?: string;
  accent?: 'red' | 'amber' | 'green';
}) {
  const accentClass =
    accent === 'red' ? 'text-red-200' : accent === 'amber' ? 'text-yellow-200' : 'text-white/80';
  const inner = (
    <div className="bg-white/15 backdrop-blur border border-white/20 rounded-xl p-4 h-full hover:bg-white/20 transition-colors">
      <div className={`flex items-center gap-2 text-xs ${accentClass}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl mt-1 text-white">{value}</div>
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : <div>{inner}</div>;
}

/* ─── Main Page ─────────────────────────────────────────────── */
export function ReaderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    books, authors, categories,
    getReaderTransactions, getReaderReservations, getReaderReadingList,
  } = useLibrary();

  const reader = user as Reader;
  const [searchQ, setSearchQ] = useState('');

  const allTransactions = getReaderTransactions(reader.id);
  const active = allTransactions.filter(t => t.status === 'active' || t.status === 'overdue');
  const overdue = active.filter(t => t.status === 'overdue');
  const reservations = getReaderReservations(reader.id).filter(r => r.status === 'waiting' || r.status === 'ready');
  const readingList = getReaderReadingList(reader.id);

  // Sách mới nhập — ưu tiên isNew, rồi năm xuất bản mới nhất
  const newArrivals = [...books]
    .sort((a, b) => {
      if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
      return b.publishYear - a.publishYear;
    })
    .slice(0, 10);

  // Mượn nhiều nhất
  const mostBorrowed = [...books]
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 10);

  // Nổi bật (admin chọn)
  const featured = books.filter(b => b.isFeatured).slice(0, 10);

  // Gợi ý dựa trên lịch sử mượn
  const borrowedBookIds = new Set(allTransactions.map(t => t.bookId));
  const readingListBookIds = new Set(readingList.map(r => r.bookId));
  // Lấy các category đã mượn (có trọng số: mượn nhiều hơn → ưu tiên hơn)
  const categoryCount: Record<string, number> = {};
  const authorCount: Record<string, number> = {};
  allTransactions.forEach(t => {
    const b = books.find(bk => bk.id === t.bookId);
    if (!b) return;
    categoryCount[b.categoryId] = (categoryCount[b.categoryId] || 0) + 1;
    authorCount[b.authorId] = (authorCount[b.authorId] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 3);
  const topAuthors = Object.entries(authorCount).sort((a, b) => b[1] - a[1]).map(e => e[0]).slice(0, 2);
  const suggestedBooks = books
    .filter(b =>
      !borrowedBookIds.has(b.id) &&
      !readingListBookIds.has(b.id) &&
      (topCategories.includes(b.categoryId) || topAuthors.includes(b.authorId))
    )
    .sort((a, b) => {
      // Ưu tiên: cùng category ưa thích > rating > borrowCount
      const aScore = (topCategories.indexOf(a.categoryId) === 0 ? 10 : topCategories.includes(a.categoryId) ? 5 : 0)
        + (topAuthors.includes(a.authorId) ? 3 : 0) + a.rating;
      const bScore = (topCategories.indexOf(b.categoryId) === 0 ? 10 : topCategories.includes(b.categoryId) ? 5 : 0)
        + (topAuthors.includes(b.authorId) ? 3 : 0) + b.rating;
      return bScore - aScore;
    })
    .slice(0, 10);
  const topCategoryNames = topCategories
    .map(id => categories.find(c => c.id === id)?.name)
    .filter(Boolean) as string[];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/reader/catalog?q=${encodeURIComponent(searchQ.trim())}`);
    else navigate('/reader/catalog');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm mb-4">
                👋 Xin chào, <span style={{ fontWeight: 600 }}>{reader.name}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl drop-shadow leading-tight">
                Khám phá hàng ngàn<br />đầu sách hay
              </h1>
              <p className="mt-3 text-white/85 text-lg">
                Mượn nhanh chóng · Đọc thông minh · Trả tiện lợi
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="mt-6 bg-white rounded-2xl p-2 flex gap-2 shadow-2xl max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm sách, tác giả, thể loại..."
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    className="pl-9 h-11 border-0 focus-visible:ring-0 text-gray-800"
                  />
                </div>
                <Button type="submit" className="h-11 bg-blue-600 hover:bg-blue-700 px-6 rounded-xl">
                  Tìm kiếm
                </Button>
              </form>

              {/* Quick category tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {categories.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    to={`/reader/catalog?cat=${c.id}`}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full text-sm transition-colors"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right — Stats */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              <StatPill
                icon={<BookOpen className="w-4 h-4" />}
                label="Đang mượn"
                value={`${active.length} / ${reader.borrowLimit}`}
                to="/reader/borrowed"
              />
              <StatPill
                icon={<AlertTriangle className="w-4 h-4" />}
                label="Quá hạn"
                value={overdue.length}
                accent="red"
                to="/reader/borrowed"
              />
              <StatPill
                icon={<Clock3 className="w-4 h-4" />}
                label="Đặt trước"
                value={reservations.length}
                accent="amber"
                to="/reader/reservations"
              />
              <StatPill
                icon={<BookMarked className="w-4 h-4" />}
                label="Danh sách đọc"
                value={readingList.length}
                to="/reader/reading-list"
              />
            </div>
          </div>

          {/* Mobile stats */}
          <div className="grid grid-cols-4 gap-2 mt-6 lg:hidden">
            {[
              { label: 'Mượn', value: active.length, to: '/reader/borrowed' },
              { label: 'Quá hạn', value: overdue.length, to: '/reader/borrowed' },
              { label: 'Đặt trước', value: reservations.length, to: '/reader/reservations' },
              { label: 'DS đọc', value: readingList.length, to: '/reader/reading-list' },
            ].map(s => (
              <Link key={s.label} to={s.to} className="bg-white/15 border border-white/20 rounded-xl p-3 text-center hover:bg-white/20 transition-colors">
                <p className="text-2xl text-white" style={{ fontWeight: 700 }}>{s.value}</p>
                <p className="text-[11px] text-white/70 mt-0.5">{s.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alert: overdue or card expiry ── */}
      {(overdue.length > 0 || reader.cardStatus !== 'active') && (
        <div className="max-w-7xl mx-auto px-6 mt-6 space-y-2">
          {overdue.length > 0 && (
            <Link to="/reader/borrowed" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                Bạn có <span style={{ fontWeight: 700 }}>{overdue.length} sách quá hạn</span>. Vui lòng trả sớm để tránh phát sinh phí.
              </p>
              <ChevronRight className="w-4 h-4 text-red-400 ml-auto" />
            </Link>
          )}
          {reader.cardStatus !== 'active' && (
            <Link to="/reader/profile" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors">
              <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                Thẻ thư viện của bạn đã hết hạn. <span style={{ fontWeight: 600 }}>Gia hạn ngay</span> để tiếp tục mượn sách.
              </p>
              <ChevronRight className="w-4 h-4 text-amber-400 ml-auto" />
            </Link>
          )}
        </div>
      )}

      {/* ── Book Sections ── */}
      <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10">

        {/* Sách mới nhập */}
        <BookSection
          title="Sách mới nhập"
          icon={<Sparkles className="w-5 h-5 text-blue-500" />}
          books={newArrivals}
          authors={authors}
          viewAllLink="/reader/catalog"
        />

        {/* Mượn nhiều nhất */}
        <BookSection
          title="Mượn nhiều nhất"
          icon={<TrendingUp className="w-5 h-5 text-rose-500" />}
          books={mostBorrowed}
          authors={authors}
          viewAllLink="/reader/catalog"
        />

        {/* Gợi ý dựa trên lịch sử */}
        {suggestedBooks.length > 0 ? (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl text-gray-900">
                  <Lightbulb className="w-5 h-5 text-violet-500" />
                  Gợi ý dành cho bạn
                </h2>
                {topCategoryNames.length > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5 ml-7">
                    Dựa trên thể loại bạn yêu thích: {topCategoryNames.join(' · ')}
                  </p>
                )}
              </div>
              <Link to="/reader/catalog">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  Xem tất cả <ChevronRight className="w-4 h-4 ml-0.5" />
                </Button>
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-none -mx-1 px-1">
              {suggestedBooks.map((b) => {
                const author = authors.find((a) => a.id === b.authorId);
                return <BookCard key={b.id} book={b} authorName={author?.name ?? ''} />;
              })}
            </div>
          </section>
        ) : allTransactions.length === 0 ? null : (
          <div className="bg-violet-50 border border-violet-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-violet-500 flex-shrink-0" />
            <p className="text-sm text-violet-700">
              Bạn đã đọc hầu hết sách trong thể loại yêu thích! Khám phá thêm thể loại mới nhé.
            </p>
            <Link to="/reader/catalog" className="ml-auto flex-shrink-0">
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs">Khám phá</Button>
            </Link>
          </div>
        )}

        {/* Nổi bật */}
        {featured.length > 0 && (
          <BookSection
            title="Sách nổi bật"
            icon={<Award className="w-5 h-5 text-yellow-500" />}
            books={featured}
            authors={authors}
            viewAllLink="/reader/catalog"
          />
        )}

        {/* Thống kê nhanh */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <BookOpen className="w-6 h-6 text-blue-500" />, label: 'Tổng đầu sách', value: books.length.toLocaleString(), bg: 'bg-blue-50 border-blue-200' },
            { icon: <Flame className="w-6 h-6 text-rose-500" />, label: 'Lượt mượn nhiều nhất', value: Math.max(...books.map(b => b.borrowCount)).toLocaleString(), bg: 'bg-rose-50 border-rose-200' },
            { icon: <Star className="w-6 h-6 text-yellow-500" />, label: 'Sách nổi bật', value: featured.length, bg: 'bg-yellow-50 border-yellow-200' },
            { icon: <TrendingUp className="w-6 h-6 text-emerald-500" />, label: 'Thể loại', value: categories.length, bg: 'bg-emerald-50 border-emerald-200' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border rounded-xl px-5 py-4`}>
              {s.icon}
              <p className="text-2xl text-gray-900 mt-2" style={{ fontWeight: 700 }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
