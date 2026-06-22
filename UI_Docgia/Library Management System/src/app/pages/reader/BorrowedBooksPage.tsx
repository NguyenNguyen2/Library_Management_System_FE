import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertTriangle, Calendar, RefreshCw, BookOpen,
  CheckCircle2, XCircle, Users, ChevronRight, Clock3, X,
} from 'lucide-react';
import { getDaysUntil, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import type { Reader, Transaction } from '../../types';

/* ── Renew Modal ─────────────────────────────────────────────── */
function RenewModal({
  transaction,
  bookTitle,
  bookCover,
  authorName,
  newDueDate,
  hasReservation,
  noRenewalsLeft,
  onConfirm,
  onClose,
}: {
  transaction: Transaction;
  bookTitle: string;
  bookCover: string;
  authorName: string;
  newDueDate: Date;
  hasReservation: boolean;
  noRenewalsLeft: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const canRenew = !hasReservation && !noRenewalsLeft;

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    onConfirm();
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between ${canRenew ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
          <h2 className="text-white" style={{ fontWeight: 700, fontSize: '17px' }}>Gia hạn mượn sách</h2>
          {!loading && (
            <button onClick={onClose} className="text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {!done ? (
            <>
              {/* Book info */}
              <div className="flex gap-3">
                <img src={bookCover} alt={bookTitle} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-gray-900 line-clamp-2 text-sm" style={{ fontWeight: 600 }}>{bookTitle}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{authorName}</p>
                  <p className="text-xs mt-1.5 text-gray-500">
                    Lần gia hạn: <span style={{ fontWeight: 600 }}>{transaction.renewCount} / {transaction.maxRenewals}</span>
                  </p>
                </div>
              </div>

              {/* Blocks */}
              {noRenewalsLeft && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-red-700" style={{ fontWeight: 600 }}>Đã hết lượt gia hạn</p>
                    <p className="text-red-600 text-xs mt-0.5">Bạn đã gia hạn tối đa {transaction.maxRenewals} lần cho sách này.</p>
                  </div>
                </div>
              )}

              {hasReservation && !noRenewalsLeft && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <Users className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-amber-700" style={{ fontWeight: 600 }}>Có người đang đặt trước sách này</p>
                    <p className="text-amber-600 text-xs mt-0.5">Không thể gia hạn khi sách đã có người chờ. Vui lòng trả đúng hạn.</p>
                  </div>
                </div>
              )}

              {canRenew && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạn trả hiện tại</span>
                    <span style={{ fontWeight: 500 }}>{formatDate(transaction.dueDate!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hạn trả mới</span>
                    <span className="text-blue-700" style={{ fontWeight: 700 }}>{formatDate(newDueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gia hạn thêm</span>
                    <span style={{ fontWeight: 500 }}>14 ngày</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt còn lại sau</span>
                    <span style={{ fontWeight: 500 }}>{transaction.maxRenewals - transaction.renewCount - 1} lần</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Hủy</Button>
                <Button
                  className={`flex-1 ${canRenew ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white`}
                  onClick={canRenew ? handleConfirm : undefined}
                  disabled={!canRenew || loading}
                >
                  {loading
                    ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Đang xử lý...</>
                    : canRenew ? 'Xác nhận gia hạn' : 'Không thể gia hạn'}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '16px' }} className="text-gray-800">Gia hạn thành công!</p>
                <p className="text-gray-500 text-sm mt-1">
                  Hạn trả mới: <span className="text-blue-700" style={{ fontWeight: 700 }}>{formatDate(newDueDate)}</span>
                </p>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={onClose}>Đóng</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export function BorrowedBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getReaderTransactions,
    books, authors,
    reservations,
    renewTransaction,
    addNotification,
    settings,
  } = useLibrary();

  const reader = user as Reader;
  const transactions = getReaderTransactions(reader.id).filter(
    t => t.status === 'active' || t.status === 'overdue'
  );

  const [renewTarget, setRenewTarget] = useState<Transaction | null>(null);

  const renewBook = renewTarget ? books.find(b => b.id === renewTarget.bookId) : null;
  const renewAuthor = renewBook ? authors.find(a => a.id === renewBook.authorId) : null;
  const newDueDate = renewTarget?.dueDate
    ? new Date(renewTarget.dueDate.getTime() + (settings?.borrowDays ?? 14) * 86400000)
    : new Date();

  const hasReservationFor = (bookId: string) =>
    reservations.some(r => r.bookId === bookId && (r.status === 'waiting' || r.status === 'ready'));

  const handleOpenRenew = (transaction: Transaction) => setRenewTarget(transaction);

  const handleConfirmRenew = () => {
    if (!renewTarget || !renewBook) return;
    const result = renewTransaction(renewTarget.id);
    if (result === true) {
      addNotification({
        userId: reader.id,
        title: 'Gia hạn thành công',
        message: `Sách "${renewBook.title}" đã được gia hạn đến ${formatDate(newDueDate)}.`,
        type: 'success',
        link: '/reader/borrowed',
      });
      toast.success(`Gia hạn thành công "${renewBook.title}"`);
    }
  };

  const getDayStatus = (daysUntil: number) => {
    if (daysUntil < 0) return { color: 'text-red-600 bg-red-50 border-red-200', text: `Quá hạn ${Math.abs(daysUntil)} ngày`, dot: 'bg-red-500' };
    if (daysUntil === 0) return { color: 'text-orange-600 bg-orange-50 border-orange-200', text: 'Hết hạn hôm nay', dot: 'bg-orange-500' };
    if (daysUntil <= 3) return { color: 'text-amber-600 bg-amber-50 border-amber-200', text: `Còn ${daysUntil} ngày`, dot: 'bg-amber-400' };
    return { color: 'text-green-600 bg-green-50 border-green-200', text: `Còn ${daysUntil} ngày`, dot: 'bg-green-500' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Renew modal */}
      {renewTarget && renewBook && (
        <RenewModal
          transaction={renewTarget}
          bookTitle={renewBook.title}
          bookCover={renewBook.coverImage}
          authorName={renewAuthor?.name ?? ''}
          newDueDate={newDueDate}
          hasReservation={hasReservationFor(renewBook.id)}
          noRenewalsLeft={renewTarget.renewCount >= renewTarget.maxRenewals}
          onConfirm={handleConfirmRenew}
          onClose={() => setRenewTarget(null)}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-1">Sách đang mượn</h1>
        <p className="text-gray-500 text-sm">
          Đang mượn <span style={{ fontWeight: 600 }}>{transactions.length}</span> / {reader.borrowLimit} sách
        </p>
      </div>

      {/* Summary chips */}
      {transactions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {(() => {
            const overdueCount = transactions.filter(t => getDaysUntil(t.dueDate!) < 0).length;
            const soonCount = transactions.filter(t => { const d = getDaysUntil(t.dueDate!); return d >= 0 && d <= 3; }).length;
            return (
              <>
                {overdueCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full" style={{ fontWeight: 500 }}>
                    <AlertTriangle className="w-3.5 h-3.5" /> {overdueCount} quá hạn
                  </span>
                )}
                {soonCount > 0 && (
                  <span className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full" style={{ fontWeight: 500 }}>
                    <Clock3 className="w-3.5 h-3.5" /> {soonCount} sắp đến hạn
                  </span>
                )}
              </>
            );
          })()}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500" style={{ fontWeight: 500 }}>Bạn chưa mượn sách nào</p>
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/reader/catalog')}>
            Khám phá sách
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const book = books.find(b => b.id === transaction.bookId);
            const author = authors.find(a => a.id === book?.authorId);
            if (!book) return null;

            const daysUntil = transaction.dueDate ? getDaysUntil(transaction.dueDate) : 0;
            const status = getDayStatus(daysUntil);
            const noRenewals = transaction.renewCount >= transaction.maxRenewals;
            const reserved = hasReservationFor(book.id);
            const canRenew = !noRenewals && !reserved;

            return (
              <div
                key={transaction.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  daysUntil < 0 ? 'border-red-200' : daysUntil <= 3 ? 'border-amber-200' : 'border-gray-200'
                }`}
              >
                {/* Overdue / warning top bar */}
                {daysUntil < 0 && (
                  <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-white flex-shrink-0" />
                    <p className="text-white text-xs" style={{ fontWeight: 600 }}>
                      Quá hạn {Math.abs(daysUntil)} ngày — Phí tích lũy: {(Math.abs(daysUntil) * 5000).toLocaleString()}đ
                    </p>
                  </div>
                )}
                {daysUntil >= 0 && daysUntil <= 1 && (
                  <div className="bg-amber-400 px-4 py-2 flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-amber-900 flex-shrink-0" />
                    <p className="text-amber-900 text-xs" style={{ fontWeight: 600 }}>
                      {daysUntil === 0 ? 'Hết hạn hôm nay! Vui lòng trả sách.' : 'Đến hạn trả ngày mai!'}
                    </p>
                  </div>
                )}

                <div className="flex gap-4 p-4">
                  {/* Cover */}
                  <div
                    className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/reader/catalog/${book.id}`)}
                  >
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug"
                          style={{ fontWeight: 600 }}
                          onClick={() => navigate(`/reader/catalog/${book.id}`)}
                        >
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">{author?.name}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${status.color}`} style={{ fontWeight: 600 }}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.text}
                      </div>
                    </div>

                    {/* Dates grid */}
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-xs text-gray-400">Ngày mượn</p>
                        <p className="text-sm text-gray-700 mt-0.5" style={{ fontWeight: 500 }}>
                          {transaction.borrowDate && formatDate(transaction.borrowDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Hạn trả</p>
                        <p className={`text-sm mt-0.5 ${daysUntil < 0 ? 'text-red-600' : 'text-gray-700'}`} style={{ fontWeight: 500 }}>
                          {transaction.dueDate && formatDate(transaction.dueDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Lượt gia hạn</p>
                        <p className="text-sm text-gray-700 mt-0.5" style={{ fontWeight: 500 }}>
                          {transaction.renewCount} / {transaction.maxRenewals}
                        </p>
                      </div>
                    </div>

                    {/* Reservation warning */}
                    {reserved && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                        <Users className="w-3.5 h-3.5 flex-shrink-0" />
                        Có người đang đặt trước sách này — không thể gia hạn
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button
                        size="sm"
                        className={`h-8 text-xs ${canRenew ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        onClick={() => handleOpenRenew(transaction)}
                        disabled={false}
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Gia hạn
                        {!canRenew && (
                          <span className="ml-1 text-[10px]">
                            {noRenewals ? '(hết lượt)' : '(có đặt trước)'}
                          </span>
                        )}
                      </Button>

                      <button
                        onClick={() => navigate(`/reader/catalog/${book.id}`)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline h-8 px-2"
                      >
                        Xem sách <ChevronRight className="w-3 h-3" />
                      </button>

                      {daysUntil < 0 && (
                        <button
                          onClick={() => navigate('/reader/fees')}
                          className="flex items-center gap-1 text-xs text-red-500 hover:underline h-8 px-2 ml-auto"
                        >
                          Xem phí phạt <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
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
