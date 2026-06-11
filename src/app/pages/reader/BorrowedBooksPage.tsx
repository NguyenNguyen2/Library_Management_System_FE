import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AlertTriangle, Calendar, RefreshCw } from 'lucide-react';
import { getDaysUntil, formatDate } from '../../lib/utils';
import { toast } from 'sonner';
import type { Reader } from '../../types';

export function BorrowedBooksPage() {
  const { user } = useAuth();
  const { 
    getReaderTransactions, 
    books, 
    authors,
    renewTransaction
  } = useLibrary();

  const reader = user as Reader;
  const transactions = getReaderTransactions(reader.id).filter(
    t => t.status === 'active' || t.status === 'overdue'
  );

  const handleRenew = (transactionId: string, bookTitle: string) => {
    const success = renewTransaction(transactionId);
    if (success) {
      toast.success(`Gia hạn thành công sách "${bookTitle}"`);
    } else {
      toast.error('Không thể gia hạn. Bạn đã hết số lần gia hạn hoặc có người đặt trước sách này.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Sách đang mượn</h1>
        <p className="text-gray-600">
          Quản lý các sách bạn đang mượn ({transactions.length}/{reader.borrowLimit})
        </p>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Bạn chưa mượn sách nào</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.href = '/reader/catalog'}
            >
              Khám phá sách
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const book = books.find(b => b.id === transaction.bookId);
            const author = authors.find(a => a.id === book?.authorId);
            if (!book) return null;

            const daysUntil = transaction.dueDate ? getDaysUntil(transaction.dueDate) : 0;
            let statusVariant: 'success' | 'warning' | 'destructive' = 'success';
            let statusText = '';

            if (daysUntil < 0) {
              statusVariant = 'destructive';
              statusText = `Quá hạn ${Math.abs(daysUntil)} ngày`;
            } else if (daysUntil === 0) {
              statusVariant = 'warning';
              statusText = 'Hết hạn hôm nay';
            } else if (daysUntil <= 3) {
              statusVariant = 'warning';
              statusText = `Còn ${daysUntil} ngày`;
            } else {
              statusVariant = 'success';
              statusText = `Còn ${daysUntil} ngày`;
            }

            const canRenew = transaction.renewCount < transaction.maxRenewals;

            return (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded flex-shrink-0"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl mb-1">{book.title}</h3>
                          <p className="text-gray-600">{author?.name}</p>
                        </div>
                        <Badge variant={statusVariant}>{statusText}</Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-600">Ngày mượn</p>
                          <p className="font-medium">
                            {transaction.borrowDate && formatDate(transaction.borrowDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Hạn trả</p>
                          <p className="font-medium">
                            {transaction.dueDate && formatDate(transaction.dueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Số lần gia hạn</p>
                          <p className="font-medium">
                            {transaction.renewCount}/{transaction.maxRenewals}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!canRenew}
                          onClick={() => handleRenew(transaction.id, book.title)}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Gia hạn
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.location.href = `/reader/catalog/${book.id}`}
                        >
                          Xem chi tiết
                        </Button>
                      </div>

                      {!canRenew && (
                        <p className="text-sm text-gray-500 mt-2">
                          Bạn đã hết số lần gia hạn
                        </p>
                      )}

                      {daysUntil < 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-red-900">
                            <p>Sách đã quá hạn trả.</p>
                            <p>Phí phạt: {Math.abs(daysUntil)} ngày × 5,000 VNĐ = {(Math.abs(daysUntil) * 5000).toLocaleString()} VNĐ</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
