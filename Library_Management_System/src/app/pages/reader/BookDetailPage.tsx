import { useParams, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { 
  Star, 
  BookOpen, 
  Calendar, 
  Globe, 
  FileText,
  Heart,
  Share2,
  ArrowLeft,
  User
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Reader } from '../../types';

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
    getBookReviews,
    reserveBook,
    addToReadingList,
    getReaderReadingList,
    addReview
  } = useLibrary();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const book = getBook(id!);
  const author = book ? authors.find(a => a.id === book.authorId) : null;
  const publisher = book ? publishers.find(p => p.id === book.publisherId) : null;
  const category = book ? categories.find(c => c.id === book.categoryId) : null;
  const reviews = book ? getBookReviews(book.id) : [];
  const relatedBooks = book ? books.filter(b => 
    b.id !== book.id && 
    (b.categoryId === book.categoryId || b.authorId === book.authorId)
  ).slice(0, 4) : [];

  const reader = user as Reader;
  const readingList = getReaderReadingList(reader.id);
  const isInReadingList = readingList.some(rl => rl.bookId === book?.id);

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Không tìm thấy sách</p>
      </div>
    );
  }

  const handleReserve = () => {
    reserveBook(reader.id, book.id);
    toast.success('Đặt trước sách thành công! Chúng tôi sẽ thông báo khi sách có sẵn.');
  };

  const handleAddToList = () => {
    addToReadingList(reader.id, book.id, 'want_to_read');
    toast.success('Đã thêm vào danh sách đọc');
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
              <Button className="w-full" onClick={() => toast.info('Vui lòng đến quầy thủ thư để mượn sách')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Mượn sách
              </Button>
            ) : (
              <Button className="w-full" onClick={handleReserve}>
                Đặt trước
              </Button>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddToList}
              disabled={isInReadingList}
            >
              <Heart className="w-4 h-4 mr-2" />
              {isInReadingList ? 'Đã thêm vào danh sách' : 'Thêm vào danh sách'}
            </Button>

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
      {relatedBooks.length > 0 && (
        <div>
          <h2 className="text-2xl mb-4">Sách liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedBooks.map((relBook) => {
              const relAuthor = authors.find(a => a.id === relBook.authorId);
              return (
                <Card
                  key={relBook.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/reader/catalog/${relBook.id}`)}
                >
                  <CardContent className="p-4">
                    <img
                      src={relBook.coverImage}
                      alt={relBook.title}
                      className="w-full h-48 object-cover rounded mb-3"
                    />
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">
                      {relBook.title}
                    </h3>
                    <p className="text-xs text-gray-600">{relAuthor?.name}</p>
                    <div className="flex items-center gap-1 text-xs mt-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span>{relBook.rating.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
