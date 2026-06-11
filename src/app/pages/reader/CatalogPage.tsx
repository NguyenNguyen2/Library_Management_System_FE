import { useState } from 'react';
import { Link } from 'react-router';
import { useLibrary } from '../../contexts/LibraryContext';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Star, BookOpen } from 'lucide-react';
import { searchVietnamese } from '../../lib/utils';

export function CatalogPage() {
  const { books, authors, categories, publishers } = useLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'year' | 'popular'>('title');

  // Filter books
  let filteredBooks = books.filter((book) => {
    // Search filter
    if (searchQuery) {
      const author = authors.find(a => a.id === book.authorId);
      const matchesSearch =
        searchVietnamese(book.title, searchQuery) ||
        searchVietnamese(book.titleEn || '', searchQuery) ||
        searchVietnamese(author?.name || '', searchQuery) ||
        searchVietnamese(book.isbn || '', searchQuery) ||
        searchVietnamese(book.description || '', searchQuery);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && book.categoryId !== selectedCategory) {
      return false;
    }

    // Language filter
    if (selectedLanguage !== 'all' && book.language !== selectedLanguage) {
      return false;
    }

    // Availability filter
    if (showOnlyAvailable && book.availableCopies === 0) {
      return false;
    }

    return true;
  });

  // Sort books
  filteredBooks = [...filteredBooks].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title, 'vi');
      case 'rating':
        return b.rating - a.rating;
      case 'year':
        return b.publishYear - a.publishYear;
      case 'popular':
        return b.borrowCount - a.borrowCount;
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Danh mục sách</h1>
        <p className="text-gray-600">Khám phá kho sách phong phú của thư viện</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên sách, tác giả, ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm mb-1">Thể loại</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 rounded-md border border-gray-300 px-3 bg-white"
            >
              <option value="all">Tất cả</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Ngôn ngữ</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-10 rounded-md border border-gray-300 px-3 bg-white"
            >
              <option value="all">Tất cả</option>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Sắp xếp</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 rounded-md border border-gray-300 px-3 bg-white"
            >
              <option value="title">Theo tên</option>
              <option value="rating">Đánh giá cao</option>
              <option value="year">Năm xuất bản</option>
              <option value="popular">Được mượn nhiều</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 h-10">
              <input
                type="checkbox"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm">Chỉ hiện sách có sẵn</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Tìm thấy <span className="font-medium">{filteredBooks.length}</span> kết quả
        </p>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy sách phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredBooks.map((book) => {
            const author = authors.find(a => a.id === book.authorId);
            const category = categories.find(c => c.id === book.categoryId);

            return (
              <Link key={book.id} to={`/reader/catalog/${book.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-56 object-cover rounded"
                      />
                      {book.isNew && (
                        <Badge 
                          variant="destructive" 
                          className="absolute top-2 right-2"
                        >
                          Mới
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-2 text-sm min-h-[2.5rem]">
                        {book.title}
                      </h3>

                      <p className="text-xs text-gray-600">{author?.name}</p>

                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{book.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({book.reviewCount})</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="text-xs">
                          {category?.name}
                        </Badge>
                      </div>

                      {book.availableCopies > 0 ? (
                        <p className="text-xs text-green-600">
                          Có sẵn: {book.availableCopies}/{book.totalCopies}
                        </p>
                      ) : (
                        <p className="text-xs text-red-600">Hết sách</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
