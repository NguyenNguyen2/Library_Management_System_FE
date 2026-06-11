import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Search, Upload, Crop, RotateCw, Image as ImageIcon, Sparkles, BookPlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

type Mode = 'isbn' | 'manual';

export function AddBookPage() {
  const [mode, setMode] = useState<Mode>('isbn');
  const [isbn, setIsbn] = useState('');
  const [fetching, setFetching] = useState(false);
  const [form, setForm] = useState({
    title: '',
    author: '',
    publisher: '',
    year: '',
    description: '',
    category: '',
    pageCount: '',
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const fetchFromGoogleBooks = async () => {
    if (!isbn) {
      toast.error('Vui lòng nhập ISBN');
      return;
    }
    setFetching(true);
    await new Promise((r) => setTimeout(r, 900));
    setForm({
      title: 'Đắc Nhân Tâm',
      author: 'Dale Carnegie',
      publisher: 'NXB Tổng hợp TP.HCM',
      year: '2020',
      description:
        'Cuốn sách kinh điển về nghệ thuật giao tiếp và đối nhân xử thế, được dịch ra hơn 30 ngôn ngữ trên thế giới.',
      category: 'Kỹ năng sống',
      pageCount: '320',
    });
    setCoverPreview(
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80'
    );
    setFetching(false);
    toast.success('Đã lấy thông tin từ Google Books');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
      toast.success('Đã tải ảnh bìa');
    }
  };

  const handleSave = () => {
    if (!form.title || !form.author) {
      toast.error('Vui lòng điền tiêu đề và tác giả');
      return;
    }
    toast.success('Đã thêm sách vào danh mục');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/admin/books"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sách
      </Link>
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <BookPlus className="w-5 h-5 text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl">Thêm sách mới</h1>
          <p className="text-gray-600 text-sm">Nhập tự động qua ISBN hoặc nhập thủ công</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('isbn')}
          className={`flex-1 lg:flex-none lg:px-8 py-3 rounded-xl border-2 transition ${
            mode === 'isbn'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <Sparkles className="w-4 h-4" />
            <span>Tự động qua ISBN</span>
          </div>
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex-1 lg:flex-none lg:px-8 py-3 rounded-xl border-2 transition ${
            mode === 'manual'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-2 justify-center">
            <BookPlus className="w-4 h-4" />
            <span>Nhập thủ công</span>
          </div>
        </button>
      </div>

      {mode === 'isbn' && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <label className="text-sm block mb-2">Số ISBN</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="VD: 978-604-1-12345-6"
                  className="pl-9 h-11"
                />
              </div>
              <Button
                onClick={fetchFromGoogleBooks}
                disabled={fetching}
                className="bg-blue-600 hover:bg-blue-700 h-11 px-5"
              >
                {fetching ? 'Đang lấy...' : 'Tải từ Google Books'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Hệ thống sẽ tự động điền các trường thông tin bên dưới.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Cover upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ảnh bìa sách</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/4] border-2 border-dashed border-gray-300 rounded-xl overflow-hidden flex items-center justify-center bg-gray-50">
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button className="bg-white/90 hover:bg-white p-1.5 rounded-md shadow">
                      <Crop className="w-4 h-4" />
                    </button>
                    <button className="bg-white/90 hover:bg-white p-1.5 rounded-md shadow">
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">Kéo thả hoặc chọn file</p>
                  <Badge variant="outline" className="text-xs">PNG, JPG · tối đa 5MB</Badge>
                </div>
              )}
            </div>
            <label className="mt-3 flex items-center justify-center gap-1 h-10 px-4 border rounded-md cursor-pointer hover:bg-gray-50 text-sm">
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <Upload className="w-4 h-4 mr-1" /> Tải ảnh lên
            </label>
            {coverPreview && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Crop className="w-3.5 h-3.5 mr-1" /> Cắt ảnh
                </Button>
                <Button variant="outline" size="sm">
                  <RotateCw className="w-3.5 h-3.5 mr-1" /> Thay đổi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin sách</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm block mb-1">Tiêu đề sách *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="VD: Đắc Nhân Tâm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm block mb-1">Tác giả *</label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="VD: Dale Carnegie"
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Nhà xuất bản</label>
                <Input
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  placeholder="VD: NXB Tổng hợp"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm block mb-1">Năm XB</label>
                <Input
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Số trang</label>
                <Input
                  value={form.pageCount}
                  onChange={(e) => setForm({ ...form, pageCount: e.target.value })}
                  placeholder="320"
                />
              </div>
              <div>
                <label className="text-sm block mb-1">Thể loại</label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Kỹ năng sống"
                />
              </div>
            </div>
            <div>
              <label className="text-sm block mb-1">Mô tả</label>
              <Textarea
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Giới thiệu ngắn về nội dung..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline">Lưu nháp</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
                Thêm vào danh mục
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
