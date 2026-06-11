import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Calendar, BookOpen } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Reader } from '../../types';

export function HistoryPage() {
  const { user } = useAuth();
  const { getReaderTransactions, books, authors } = useLibrary();

  const reader = user as Reader;
  const allTransactions = getReaderTransactions(reader.id);
  const completedTransactions = allTransactions.filter(t => t.status === 'completed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Lịch sử mượn trả</h1>
        <p className="text-gray-600">
          Xem lại tất cả các giao dịch mượn sách của bạn
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Tổng sách đã mượn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{allTransactions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Đã trả</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{completedTransactions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-600">Đang mượn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">
              {allTransactions.filter(t => t.status === 'active' || t.status === 'overdue').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* History list */}
      {allTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Bạn chưa có lịch sử mượn sách</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allTransactions
            .sort((a, b) => {
              const dateA = a.borrowDate ? new Date(a.borrowDate).getTime() : 0;
              const dateB = b.borrowDate ? new Date(b.borrowDate).getTime() : 0;
              return dateB - dateA;
            })
            .map((transaction) => {
              const book = books.find(b => b.id === transaction.bookId);
              const author = authors.find(a => a.id === book?.authorId);
              if (!book) return null;

              return (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded flex-shrink-0"
                      />

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg mb-1">{book.title}</h3>
                            <p className="text-gray-600 text-sm">{author?.name}</p>
                          </div>
                          <Badge
                            variant={
                              transaction.status === 'completed'
                                ? 'success'
                                : transaction.status === 'overdue'
                                ? 'destructive'
                                : 'default'
                            }
                          >
                            {transaction.status === 'completed'
                              ? 'Đã trả'
                              : transaction.status === 'overdue'
                              ? 'Quá hạn'
                              : 'Đang mượn'}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                          {transaction.returnDate && (
                            <div>
                              <p className="text-gray-600">Ngày trả</p>
                              <p className="font-medium">
                                {formatDate(transaction.returnDate)}
                              </p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-600">Số lần gia hạn</p>
                            <p className="font-medium">{transaction.renewCount}</p>
                          </div>
                        </div>
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
