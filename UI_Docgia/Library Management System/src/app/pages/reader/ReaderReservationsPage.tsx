import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  BookMarked,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  Users,
  Calendar,
  Hourglass,
  Bell,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Reader } from '../../types';

const STATUS_CONFIG = {
  waiting: {
    label: 'Đang chờ',
    icon: <Clock3 className="w-4 h-4" />,
    bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300',
    badgeVariant: 'outline' as const,
  },
  ready: {
    label: 'Sẵn sàng lấy',
    icon: <Bell className="w-4 h-4" />,
    bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300',
    badgeVariant: 'outline' as const,
  },
  completed: {
    label: 'Đã lấy',
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300',
    badgeVariant: 'outline' as const,
  },
  expired: {
    label: 'Đã hết hạn',
    icon: <XCircle className="w-4 h-4" />,
    bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200',
    badgeVariant: 'outline' as const,
  },
  cancelled: {
    label: 'Đã hủy',
    icon: <XCircle className="w-4 h-4" />,
    bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200',
    badgeVariant: 'outline' as const,
  },
};

const TABS = [
  { key: 'active',    label: 'Đang chờ',   statuses: ['waiting', 'ready'] },
  { key: 'history',   label: 'Lịch sử',    statuses: ['completed', 'expired', 'cancelled'] },
] as const;

export function ReaderReservationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getReaderReservations, cancelReservation, reservations, books, authors, categories, addNotification } = useLibrary();
  const reader = user as Reader;

  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const myReservations = getReaderReservations(reader.id);
  const activeList = myReservations.filter(r => r.status === 'waiting' || r.status === 'ready');
  const historyList = myReservations.filter(r => r.status === 'completed' || r.status === 'expired' || r.status === 'cancelled');
  const displayed = tab === 'active' ? activeList : historyList;

  const handleCancel = async (id: string, bookTitle: string) => {
    setCancellingId(id);
    await new Promise(r => setTimeout(r, 600));
    cancelReservation(id);
    addNotification({
      userId: reader.id,
      title: 'Đã hủy đặt trước',
      message: `Bạn đã hủy đặt trước sách "${bookTitle}".`,
      type: 'info',
    });
    setCancellingId(null);
  };

  // Count total queue for a book
  const getQueueLength = (bookId: string) =>
    reservations.filter(r => r.bookId === bookId && (r.status === 'waiting' || r.status === 'ready')).length;

  // Estimate wait: roughly 14 days per person ahead
  const estimateWait = (position: number) => {
    if (position <= 1) return 'Sắp đến lượt';
    const days = (position - 1) * 14;
    if (days < 30) return `~${days} ngày`;
    return `~${Math.round(days / 30)} tháng`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-1">Sách đặt trước</h1>
        <p className="text-gray-500 text-sm">Theo dõi hàng chờ và trạng thái sách bạn đã đặt trước</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-amber-600 mb-1">
            <Hourglass className="w-4 h-4" />
            <span className="text-xs" style={{ fontWeight: 500 }}>Đang chờ</span>
          </div>
          <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{activeList.filter(r => r.status === 'waiting').length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-green-600 mb-1">
            <Bell className="w-4 h-4" />
            <span className="text-xs" style={{ fontWeight: 500 }}>Sẵn sàng lấy</span>
          </div>
          <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{activeList.filter(r => r.status === 'ready').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs" style={{ fontWeight: 500 }}>Đã hoàn thành</span>
          </div>
          <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{historyList.filter(r => r.status === 'completed').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontWeight: tab === t.key ? 600 : 400 }}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              {t.key === 'active' ? activeList.length : historyList.length}
            </span>
          </button>
        ))}
      </div>

      {/* Ready alert */}
      {tab === 'active' && activeList.some(r => r.status === 'ready') && (
        <div className="mb-4 bg-green-50 border border-green-300 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-green-800" style={{ fontWeight: 600 }}>Có sách đang chờ bạn đến lấy!</p>
            <p className="text-green-600">Bạn còn 2 ngày để đến mượn, sau đó hệ thống sẽ tự động hủy và chuyển cho người tiếp theo.</p>
          </div>
        </div>
      )}

      {/* List */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookMarked className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500" style={{ fontWeight: 500 }}>
            {tab === 'active' ? 'Bạn chưa đặt trước sách nào' : 'Chưa có lịch sử đặt trước'}
          </p>
          {tab === 'active' && (
            <>
              <p className="text-sm text-gray-400 mt-1">Khi sách hết bản sao, bạn có thể đặt trước để giữ chỗ</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/reader/catalog')}>
                Tìm sách để đặt trước
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(reservation => {
            const book = books.find(b => b.id === reservation.bookId);
            if (!book) return null;
            const bookAuthor = authors.find(a => a.id === book.authorId);
            const bookCat = categories.find(c => c.id === book.categoryId);
            const cfg = STATUS_CONFIG[reservation.status];
            const queueLen = getQueueLength(book.id);
            const isCancelling = cancellingId === reservation.id;

            return (
              <div
                key={reservation.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  reservation.status === 'ready' ? 'border-green-300 ring-1 ring-green-200' : 'border-gray-200'
                }`}
              >
                {/* Ready banner */}
                {reservation.status === 'ready' && (
                  <div className="bg-green-500 px-4 py-2 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-white" />
                    <p className="text-white text-sm" style={{ fontWeight: 600 }}>
                      Sách đã sẵn sàng — vui lòng đến lấy trước {reservation.expiryDate ? formatDate(reservation.expiryDate) : '2 ngày tới'}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 p-4">
                  {/* Cover */}
                  <div
                    className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/reader/catalog/${book.id}`)}
                  >
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-gray-900 hover:text-blue-600 cursor-pointer text-sm leading-snug transition-colors"
                          style={{ fontWeight: 600 }}
                          onClick={() => navigate(`/reader/catalog/${book.id}`)}
                        >
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">{bookAuthor?.name}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {bookCat && <Badge variant="outline" className="text-xs py-0">{bookCat.name}</Badge>}
                          <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            {cfg.icon}
                            {cfg.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3 h-3 ${i <= Math.round(book.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Queue & dates */}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {reservation.status === 'waiting' && (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Users className="w-3.5 h-3.5 text-amber-500" />
                            <span>Vị trí hàng chờ: <span className="text-amber-700" style={{ fontWeight: 700 }}>#{reservation.queuePosition}</span> / {queueLen}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Hourglass className="w-3.5 h-3.5 text-gray-400" />
                            <span>Ước tính: <span style={{ fontWeight: 600 }}>{estimateWait(reservation.queuePosition)}</span></span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Đặt ngày: {formatDate(reservation.reservedDate)}</span>
                      </div>
                      {reservation.notifiedDate && (
                        <div className="flex items-center gap-1.5 text-xs text-green-600">
                          <Bell className="w-3.5 h-3.5" />
                          <span>Thông báo: {formatDate(reservation.notifiedDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {(reservation.status === 'waiting' || reservation.status === 'ready') && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/reader/catalog/${book.id}`)}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          Xem sách <ChevronRight className="w-3 h-3" />
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleCancel(reservation.id, book.title)}
                          disabled={isCancelling}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          {isCancelling ? 'Đang hủy...' : 'Hủy đặt trước'}
                        </button>
                      </div>
                    )}
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
