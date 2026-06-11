import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Card, CardContent } from '../../components/ui/card';
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
  Heart,
} from 'lucide-react';
import { Link } from 'react-router';
import type { Reader, Book } from '../../types';

export function ReaderDashboard() {
  const { user } = useAuth();
  const { books, authors, categories, getReaderTransactions } = useLibrary();

  const reader = user as Reader;
  const active = getReaderTransactions(reader.id).filter(
    (t) => t.status === 'active' || t.status === 'overdue'
  );
  const overdue = active.filter((t) => t.status === 'overdue');

  const newArrivals = books.filter((b) => b.isNew).slice(0, 8);
  const featured = books.filter((b) => b.isFeatured).slice(0, 8);
  const recommended = books.filter((b) => b.isRecommended).slice(0, 8);

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-yellow-300/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-6 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-white/20 text-white hover:bg-white/20 mb-3">
                Xin chào, {reader.name} 👋
              </Badge>
              <h1 className="text-4xl lg:text-5xl drop-shadow-md leading-tight">
                Khám phá hàng ngàn<br />đầu sách hay
              </h1>
              <p className="mt-3 text-white/90">
                Mượn nhanh chóng — đọc thông minh — trả tiện lợi.
              </p>

              <div className="mt-6 bg-white rounded-2xl p-2 flex gap-2 shadow-2xl max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm sách, tác giả, thể loại..."
                    className="pl-9 h-11 border-0 focus-visible:ring-0"
                  />
                </div>
                <Link to="/reader/catalog">
                  <Button className="h-11 bg-blue-600 hover:bg-blue-700 px-6">Tìm</Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {categories.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    to={`/reader/catalog?cat=${c.id}`}
                    className="bg-white/15 hover:bg-white/25 backdrop-blur px-3 py-1.5 rounded-full text-sm"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick stats card */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                <StatPill icon={<BookOpen className="w-5 h-5" />} label="Đang mượn" value={`${active.length}/${reader.borrowLimit}`} />
                <StatPill icon={<AlertTriangle className="w-5 h-5" />} label="Quá hạn" value={`${overdue.length}`} accent="red" />
                <StatPill icon={<Heart className="w-5 h-5" />} label="Yêu thích" value="—" />
                <StatPill icon={<Star className="w-5 h-5" />} label="Thẻ" value={reader.cardType === 'premium' ? 'Premium' : 'Thường'} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carousels */}
      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-10">
        <BookRow
          title="Mới về thư viện"
          icon={<Sparkles className="w-5 h-5 text-blue-600" />}
          books={newArrivals}
          authors={authors}
        />
        <BookRow
          title="Sách nổi bật"
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          books={featured}
          authors={authors}
        />
        <BookRow
          title="Gợi ý dành cho bạn"
          icon={<Star className="w-5 h-5 text-yellow-500" />}
          books={recommended}
          authors={authors}
        />
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: 'red';
}) {
  return (
    <div className="bg-white/15 backdrop-blur border border-white/20 rounded-xl p-4">
      <div className={`flex items-center gap-2 text-xs ${accent === 'red' ? 'text-red-200' : 'text-white/80'}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl mt-1">{value}</div>
    </div>
  );
}

function BookRow({
  title,
  icon,
  books,
  authors,
}: {
  title: string;
  icon: React.ReactNode;
  books: Book[];
  authors: { id: string; name: string }[];
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl flex items-center gap-2">
          {icon} {title}
        </h2>
        <Link to="/reader/catalog">
          <Button variant="ghost" size="sm" className="text-blue-600">
            Xem tất cả <ChevronRight className="w-4 h-4 ml-0.5" />
          </Button>
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-2 px-2 snap-x">
        {books.map((b) => {
          const author = authors.find((a) => a.id === b.authorId);
          return (
            <Link
              key={b.id}
              to={`/reader/catalog/${b.id}`}
              className="flex-shrink-0 w-44 snap-start"
            >
              <Card className="h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-3">
                  <div className="relative aspect-[3/4] mb-2 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover"
                    />
                    {b.availableCopies > 0 ? (
                      <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-500 text-white text-xs">
                        Có sẵn
                      </Badge>
                    ) : (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-500 text-white text-xs">
                        Hết sách
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm line-clamp-2 leading-snug">{b.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{author?.name}</p>
                  <div className="flex items-center gap-1 text-xs mt-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span>{b.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({b.reviewCount})</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
