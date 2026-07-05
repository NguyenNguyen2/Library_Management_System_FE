import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  Barcode,
  Search,
  BookOpen,
  CheckCircle,
  Loader2,
  Plus,
  RotateCcw,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

type BookInfo = {
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  pages: number;
  category: string;
  language: string;
  description: string;
  coverImage: string;
};

const ISBN_DB: Record<string, BookInfo> = {
  '9786041137394': {
    isbn: '9786041137394',
    title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh',
    author: 'Nguyễn Nhật Ánh',
    publisher: 'NXB Trẻ',
    year: 2018,
    pages: 368,
    category: 'Văn học Việt Nam',
    language: 'Tiếng Việt',
    description: 'Những câu chuyện tuổi thơ đầy hoài niệm về tình anh em, tình làng nghĩa xóm.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
  },
  '9786041092358': {
    isbn: '9786041092358',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    publisher: 'NXB Tổng Hợp TPHCM',
    year: 2020,
    pages: 228,
    category: 'Văn học nước ngoài',
    language: 'Tiếng Việt',
    description: 'Hành trình đi tìm kho báu của cậu bé chăn cừu Santiago — biểu tượng cho hành trình khám phá giấc mơ.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
  },
  '9786041007543': {
    isbn: '9786041007543',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    publisher: 'NXB Tổng Hợp TPHCM',
    year: 2019,
    pages: 320,
    category: 'Kỹ năng sống',
    language: 'Tiếng Việt',
    description: 'Nghệ thuật thu phục lòng người — cuốn sách kỹ năng bán chạy nhất thế giới.',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
  },
  '9786049564222': {
    isbn: '9786049564222',
    title: 'Sapiens: Lược Sử Loài Người',
    author: 'Yuval Noah Harari',
    publisher: 'NXB Tri Thức',
    year: 2021,
    pages: 552,
    category: 'Lịch sử',
    language: 'Tiếng Việt',
    description: 'Từ thế giới cổ đại đến nền văn minh hiện đại, Sapiens mang đến cái nhìn toàn diện về lịch sử loài người.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
  },
};

export function AddBookISBNPage() {
  const navigate = useNavigate();
  const [isbn, setIsbn] = useState('');
  const [loading, setLoading] = useState(false);
  const [book, setBook] = useState<BookInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copies, setCopies] = useState(3);
  const [location, setLocation] = useState('Kệ A1');

  const handleSearch = async () => {
    const clean = isbn.replace(/[-\s]/g, '');
    if (clean.length < 10) return toast.error('ISBN phải có ít nhất 10 ký tự');
    setLoading(true);
    setBook(null);
    setNotFound(false);
    await new Promise((r) => setTimeout(r, 1200));
    const found = ISBN_DB[clean];
    setLoading(false);
    if (found) {
      setBook(found);
    } else {
      setNotFound(true);
    }
  };

  const handleAdd = () => {
    if (!book) return;
    toast.success(`Đã thêm "${book.title}" — ${copies} bản sao`);
    setTimeout(() => navigate('/librarian/books'), 1000);
  };

  const handleReset = () => {
    setIsbn('');
    setBook(null);
    setNotFound(false);
  };

  const EXAMPLE_ISBNS = ['9786041137394', '9786041092358', '9786041007543', '9786049564222'];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl" style={{ fontWeight: 600 }}>Thêm sách qua ISBN</h1>
        <p className="text-sm text-gray-500 mt-1">Nhập mã ISBN để tự động lấy thông tin sách</p>
      </div>

      {/* ISBN search */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <Barcode className="w-5 h-5 text-[#2563EB]" />
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Tìm kiếm theo ISBN</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Nhập ISBN-10 hoặc ISBN-13 để tự động tra cứu thông tin sách từ cơ sở dữ liệu
          </p>
          <div className="flex gap-2">
            <Input
              value={isbn}
              onChange={(e) => setIsbn(e.target.value.replace(/[^0-9\-\s]/g, ''))}
              placeholder="Ví dụ: 978-6041-137394"
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              className="bg-[#2563EB] hover:bg-[#1D4ED8]"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span className="ml-2">Tìm kiếm</span>
            </Button>
            {(book || notFound) && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Example ISBNs */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Info className="w-3 h-3" /> Thử:
            </span>
            {EXAMPLE_ISBNS.map((ex) => (
              <button
                key={ex}
                onClick={() => setIsbn(ex)}
                className="text-xs text-blue-600 hover:underline font-mono"
              >
                {ex}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-10 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Đang tra cứu ISBN {isbn}...</p>
            <p className="text-xs text-gray-400 mt-1">Kết nối cơ sở dữ liệu thư viện quốc gia</p>
          </CardContent>
        </Card>
      )}

      {/* Not found */}
      {notFound && !loading && (
        <Card>
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Barcode className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-base mb-1" style={{ fontWeight: 600 }}>Không tìm thấy ISBN</p>
            <p className="text-sm text-gray-500 mb-4">
              Mã ISBN <span className="font-mono text-gray-700">{isbn}</span> chưa có trong cơ sở dữ liệu.
              <br />Bạn có thể thêm sách thủ công.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/librarian/books/manual')}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm thủ công
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Book found */}
      {book && !loading && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span className="text-sm text-emerald-700" style={{ fontWeight: 500 }}>
                Đã tìm thấy thông tin sách
              </span>
            </div>

            <div className="flex gap-5 mb-5">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-28 h-40 object-cover rounded-lg shrink-0 shadow-md"
              />
              <div className="flex-1 space-y-2">
                <h2 className="text-lg" style={{ fontWeight: 700 }}>{book.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">{book.category}</Badge>
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{book.language}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                  {[
                    { label: 'Tác giả', value: book.author },
                    { label: 'NXB', value: book.publisher },
                    { label: 'Năm xuất bản', value: book.year },
                    { label: 'Số trang', value: `${book.pages} trang` },
                    { label: 'ISBN', value: book.isbn },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span className="text-xs text-gray-500">{label}:</span>
                      <span className="text-sm ml-1.5" style={{ fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed border-l-4 border-blue-200 pl-3">
              {book.description}
            </p>

            {/* Add config */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm mb-3" style={{ fontWeight: 600 }}>Cấu hình nhập kho</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">Số bản sao nhập</label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={copies}
                    onChange={(e) => setCopies(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">Vị trí kho</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 border rounded-md px-3 text-sm bg-white"
                  >
                    {['Kệ A1', 'Kệ A2', 'Kệ B1', 'Kệ B2', 'Kệ C1', 'Kho dự phòng'].map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Tìm lại
              </Button>
              <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" /> Thêm vào thư viện
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
