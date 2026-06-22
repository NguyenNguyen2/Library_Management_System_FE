import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Star,
  BookOpen,
  Heart,
  Share2,
  ArrowLeft,
  User,
  ChevronDown,
  BookMarked,
  CheckCheck,
  Clock3,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import type { Reader } from '../../types';

function RelatedBookCard({ book, authors, onNavigate }: { book: any; authors: any[]; onNavigate: () => void }) {
  const relAuthor = authors.find(a => a.id === book.authorId);
  return (
    <div
      onClick={onNavigate}
      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="relative">
        <img src={book.coverImage} alt={book.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 right-2">
          {book.availableCopies > 0 ? (
            <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">Có sẵn</span>
          ) : (
            <span className="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded-full">Đặt trước</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors" style={{ fontWeight: 600 }}>{book.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{relAuthor?.name}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-3 h-3 ${i <= Math.round(book.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">{book.borrowCount} lượt</span>
        </div>
      </div>
    </div>
  );
}

export function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getBook,
    authors,
    publishers,
    categories,
    books,
    reservations,
    getBookReviews,
    reserveBook,
    cancelReservation,
    getReaderReservations,
    addToReadingList,
    removeFromReadingList,
    updateReadingListStatus,
    getReaderReadingList,
    addReview,
    addNotification,
  } = useLibrary();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveDone, setReserveDone] = useState(false);
  const listDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (listDropdownRef.current && !listDropdownRef.current.contains(e.target as Node)) {
        setShowListDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const book = getBook(id!);
  const author = book ? authors.find(a => a.id === book.authorId) : null;
  const publisher = book ? publishers.find(p => p.id === book.publisherId) : null;
  const category = book ? categories.find(c => c.id === book.categoryId) : null;
  const reviews = book ? getBookReviews(book.id) : [];
  const sameAuthorBooks = book ? books.filter(b => b.id !== book.id && b.authorId === book.authorId).slice(0, 4) : [];
  const sameCategoryBooks = book ? books.filter(b => b.id !== book.id && b.categoryId === book.categoryId && b.authorId !== book.authorId).slice(0, 4) : [];

  const reader = user as Reader;
  const readingList = getReaderReadingList(reader.id);
  const isInReadingList = readingList.some(rl => rl.bookId === book?.id);
  const readerReservations = getReaderReservations(reader.id);
  const myReservation = book ? readerReservations.find(r => r.bookId === book.id && (r.status === 'waiting' || r.status === 'ready')) : null;
  const queueLength = book ? reservations.filter(r => r.bookId === book.id && (r.status === 'waiting' || r.status === 'ready')).length : 0;

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Không tìm thấy sách</p>
      </div>
    );
  }

  const handleConfirmReserve = async () => {
    setReserveLoading(true);
    await new Promise(r => setTimeout(r, 900));
    reserveBook(reader.id, book!.id);
    addNotification({
      userId: reader.id,
      title: 'Đặt trước thành công',
      message: `Bạn đã đặt trước sách "${book!.title}". Chúng tôi sẽ thông báo khi sách có sẵn.`,
      type: 'success',
      link: '/reader/notifications',
    });
    setReserveLoading(false);
    setReserveDone(true);
  };

  const handleCancelReservation = () => {
    if (myReservation) {
      cancelReservation(myReservation.id);
      toast.success('Đã hủy đặt trước');
    }
  };

  const handleAddToList = (status: 'reading' | 'want_to_read' | 'finished') => {
    addToReadingList(reader.id, book.id, status);
    const labels = { reading: 'Đang đọc', want_to_read: 'Muốn đọc', finished: 'Đã đọc' };
    toast.success(`Đã thêm vào danh sách "${labels[status]}"`);
    setShowListDropdown(false);
  };

  const currentListItem = readingList.find(rl => rl.bookId === book?.id);
  const listStatusLabel: Record<string, string> = {
    reading: 'Đang đọc',
    want_to_read: 'Muốn đọc',
    finished: 'Đã đọc',
  };

  const handleSubmitReview = () => {
    if (!comment.trim()) {
      toast.error('Vui lòng nhập nhận xét');
      return;
    }
    addReview(book.id, reader.id, rating, comment);
    setComment('');
    setRating(5);
    toast.success('Cảm ơn bạn đã đánh giá!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Reserve Modal */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !reserveLoading && setShowReserveModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <h2 className="text-white" style={{ fontWeight: 700, fontSize: '18px' }}>Xác nhận đặt trước</h2>
              <p className="text-orange-100 text-sm mt-0.5">Sách hiện không có bản sao nào</p>
            </div>
            <div className="p-6 space-y-4">
              {!reserveDone ? (
                <>
                  <div className="flex gap-3">
                    <img src={book.coverImage} alt={book.title} className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-gray-900 line-clamp-2" style={{ fontWeight: 600 }}>{book.title}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{author?.name}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số người đang chờ</span>
                      <span className="text-orange-600" style={{ fontWeight: 600 }}>{queueLength} người</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vị trí của bạn</span>
                      <span style={{ fontWeight: 600 }}>#{queueLength + 1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian giữ chỗ</span>
                      <span style={{ fontWeight: 600 }}>2 ngày sau thông báo</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Khi sách được trả về, hệ thống sẽ tự động gửi thông báo cho bạn. Bạn có 2 ngày để đến mượn.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowReserveModal(false)} disabled={reserveLoading}>Hủy</Button>
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" onClick={handleConfirmReserve} disabled={reserveLoading}>
                      {reserveLoading ? <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Đang xử lý...</> : 'Xác nhận đặt trước'}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4 py-2">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCheck className="w-9 h-9 text-green-500" />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '16px' }} className="text-gray-800">Đặt trước thành công!</p>
                    <p className="text-gray-500 text-sm mt-1">Vị trí của bạn: <span className="text-orange-600" style={{ fontWeight: 700 }}>#{queueLength + 1}</span> trong hàng chờ</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 text-left space-y-1">
                    <p>✓ Thông báo sẽ gửi qua email khi sách có sẵn</p>
                    <p>✓ Bạn có 2 ngày để đến mượn sau thông báo</p>
                    <p>✓ Có thể hủy bất cứ lúc nào trên trang này</p>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowReserveModal(false)}>Đóng</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Book cover and actions */}
        <div>
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full rounded-lg shadow-lg mb-4"
          />

          <div className="space-y-3">
            {book.availableCopies > 0 ? (
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => toast.info('Vui lòng đến quầy thủ thư để mượn sách')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Mượn sách
              </Button>
            ) : myReservation ? (
              <div className="space-y-2">
                <div className="w-full flex items-center justify-between bg-amber-50 border border-amber-300 rounded-lg px-4 py-2.5 text-sm">
                  <div>
                    <p className="text-amber-700" style={{ fontWeight: 600 }}>Đang chờ — vị trí #{myReservation.queuePosition}</p>
                    <p className="text-amber-600 text-xs">Sẽ thông báo khi sách có sẵn</p>
                  </div>
                  <Clock3 className="w-5 h-5 text-amber-500" />
                </div>
                <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50" onClick={handleCancelReservation}>
                  Hủy đặt trước
                </Button>
              </div>
            ) : (
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => { setReserveDone(false); setShowReserveModal(true); }}>
                <BookMarked className="w-4 h-4 mr-2" />
                Đặt trước ({queueLength} người đang chờ)
              </Button>
            )}

            <div className="relative" ref={listDropdownRef}>
              <Button
                variant="outline"
                className={`w-full ${currentListItem ? 'border-blue-400 text-blue-700 bg-blue-50' : ''}`}
                onClick={() => setShowListDropdown(!showListDropdown)}
              >
                <Heart className={`w-4 h-4 mr-2 ${currentListItem ? 'fill-blue-500 text-blue-500' : ''}`} />
                {currentListItem ? listStatusLabel[currentListItem.status] : 'Thêm vào danh sách'}
                <ChevronDown className="w-4 h-4 ml-auto" />
              </Button>
              {showListDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg z-20 overflow-hidden">
                  {[
                    { value: 'want_to_read' as const, label: 'Muốn đọc', icon: <BookMarked className="w-4 h-4 text-blue-500" /> },
                    { value: 'reading' as const, label: 'Đang đọc', icon: <Clock3 className="w-4 h-4 text-amber-500" /> },
                    { value: 'finished' as const, label: 'Đã đọc', icon: <CheckCheck className="w-4 h-4 text-green-500" /> },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAddToList(opt.value)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${currentListItem?.status === opt.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                      {opt.icon}
                      {opt.label}
                      {currentListItem?.status === opt.value && <CheckCheck className="w-3.5 h-3.5 ml-auto text-blue-500" />}
                    </button>
                  ))}
                  {currentListItem && (
                    <button
                      onClick={() => { removeFromReadingList(currentListItem.id); setShowListDropdown(false); toast.success('Đã xóa khỏi danh sách'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                      Xóa khỏi danh sách
                    </button>
                  )}
                </div>
              )}
            </div>

            <Button variant="outline" className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Chia sẻ
            </Button>
          </div>

          {/* Book stats */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tình trạng:</span>
                  {book.availableCopies > 0 ? (
                    <span className="text-green-600">Có sẵn ({book.availableCopies}/{book.totalCopies})</span>
                  ) : (
                    <span className="text-red-600">Hết sách</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đánh giá:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span>{book.rating.toFixed(1)} ({book.reviewCount})</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lượt mượn:</span>
                  <span>{book.borrowCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Book details */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {book.isFeatured && <Badge>Nổi bật</Badge>}
            {book.isNew && <Badge variant="destructive">Mới</Badge>}
            {category && <Badge variant="outline">{category.name}</Badge>}
            {book.availableCopies > 0 ? (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Có sẵn
              </Badge>
            ) : (
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
                Đặt trước — giữ chỗ 2 ngày
              </Badge>
            )}
          </div>

          <h1 className="text-4xl mb-2">{book.title}</h1>
          {book.titleEn && (
            <p className="text-xl text-gray-600 mb-4">{book.titleEn}</p>
          )}

          <div className="flex items-center gap-2 mb-6">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">Tác giả: {author?.name}</span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nhà xuất bản</p>
              <p>{publisher?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Thể loại</p>
              <p>{category?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Năm xuất bản</p>
              <p>{book.publishYear}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ngôn ngữ</p>
              <p>{book.language === 'vi' ? 'Tiếng Việt' : 'English'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Số trang</p>
              <p>{book.pages}</p>
            </div>
            {book.isbn && (
              <div>
                <p className="text-sm text-gray-600 mb-1">ISBN</p>
                <p className="font-mono text-sm">{book.isbn}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl mb-3">Giới thiệu</h2>
            <p className="text-gray-700 leading-relaxed">{book.description}</p>
          </div>

          {/* Reviews */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-xl">Đánh giá ({reviews.length})</h2>
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full text-xs">
                <Star className="w-3.5 h-3.5 fill-purple-500 text-purple-500" />
                Phân tích cảm xúc NLP:{' '}
                <strong>
                  {book.rating >= 4 ? 'Tích cực' : book.rating >= 3 ? 'Trung lập' : 'Tiêu cực'}
                </strong>
              </span>
            </div>

            {/* Add review */}
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Viết đánh giá của bạn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Đánh giá của bạn</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          onClick={() => setRating(value)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              value <= rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Nhận xét</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full h-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      placeholder="Chia sẻ suy nghĩ của bạn về cuốn sách này..."
                    />
                  </div>

                  <Button onClick={handleSubmitReview}>Gửi đánh giá</Button>
                </div>
              </CardContent>
            </Card>

            {/* Reviews list */}
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm">Độc giả</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <Star
                              key={value}
                              className={`w-3 h-3 ${
                                value <= review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related books */}
      {(sameAuthorBooks.length > 0 || sameCategoryBooks.length > 0) && (
        <div className="space-y-8 border-t border-gray-100 pt-8">
          {sameAuthorBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl">Cùng tác giả — {author?.name}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sameAuthorBooks.map((relBook) => (
                  <RelatedBookCard key={relBook.id} book={relBook} authors={authors} onNavigate={() => navigate(`/reader/catalog/${relBook.id}`)} />
                ))}
              </div>
            </div>
          )}
          {sameCategoryBooks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl">Cùng thể loại — {category?.name}</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sameCategoryBooks.map((relBook) => (
                  <RelatedBookCard key={relBook.id} book={relBook} authors={authors} onNavigate={() => navigate(`/reader/catalog/${relBook.id}`)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
