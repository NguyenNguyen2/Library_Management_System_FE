import { useState } from 'react';
import { useNavigate } from 'react-router';
import { mockAuthors, mockPublishers, mockCategories } from '../../lib/mockData';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import {
  BookOpen,
  Save,
  RotateCcw,
  ImageIcon,
  Star,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

type FormData = {
  title: string;
  author: string;
  authorCustom: string;
  publisher: string;
  publisherCustom: string;
  category: string;
  isbn: string;
  year: string;
  pages: string;
  language: string;
  copies: string;
  location: string;
  coverImage: string;
  description: string;
  isFeatured: boolean;
  isPremium: boolean;
};

const INIT: FormData = {
  title: '',
  author: '',
  authorCustom: '',
  publisher: '',
  publisherCustom: '',
  category: '',
  isbn: '',
  year: new Date().getFullYear().toString(),
  pages: '',
  language: 'vi',
  copies: '1',
  location: 'Kệ A1',
  coverImage: '',
  description: '',
  isFeatured: false,
  isPremium: false,
};

const LOCATIONS = ['Kệ A1', 'Kệ A2', 'Kệ B1', 'Kệ B2', 'Kệ C1', 'Kho dự phòng'];

export function AddBookManualPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(INIT);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const f = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = 'Vui lòng nhập tên sách';
    if (!form.author && !form.authorCustom) e.author = 'Vui lòng chọn hoặc nhập tác giả';
    if (!form.publisher && !form.publisherCustom) e.publisher = 'Vui lòng chọn NXB';
    if (!form.category) e.category = 'Vui lòng chọn thể loại';
    if (!form.copies || Number(form.copies) < 1) e.copies = 'Số bản sao phải ≥ 1';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    toast.success(`Đã thêm "${form.title}" thành công!`);
    setTimeout(() => navigate('/librarian/books'), 1000);
  };

  const resolvedAuthor = form.authorCustom || (mockAuthors.find((a) => a.id === form.author)?.name ?? '');
  const resolvedPublisher = form.publisherCustom || (mockPublishers.find((p) => p.id === form.publisher)?.name ?? '');
  const resolvedCategory = mockCategories.find((c) => c.id === form.category)?.name ?? '';

  const hasPreview = form.title || resolvedAuthor;

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-gray-100 rounded-md">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Thêm sách thủ công</h1>
          <p className="text-sm text-gray-500 mt-0.5">Nhập thông tin sách theo từng trường</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Basic info */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600 }}>
                <BookOpen className="w-4 h-4 text-blue-600" /> Thông tin cơ bản
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">
                    Tên sách <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.title}
                    onChange={f('title')}
                    placeholder="Nhập tên sách đầy đủ"
                    className={errors.title ? 'border-red-400' : ''}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">
                      Tác giả <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.author}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, author: e.target.value, authorCustom: '' }));
                        setErrors((p) => ({ ...p, author: undefined }));
                      }}
                      className={`w-full h-10 border rounded-md px-3 text-sm bg-white ${errors.author ? 'border-red-400' : ''}`}
                    >
                      <option value="">-- Chọn tác giả --</option>
                      {mockAuthors.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                    <Input
                      value={form.authorCustom}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, authorCustom: e.target.value, author: '' }));
                        setErrors((p) => ({ ...p, author: undefined }));
                      }}
                      placeholder="Hoặc nhập tên tác giả mới"
                      className="mt-2"
                    />
                    {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">
                      Nhà xuất bản <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.publisher}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, publisher: e.target.value, publisherCustom: '' }));
                        setErrors((p) => ({ ...p, publisher: undefined }));
                      }}
                      className={`w-full h-10 border rounded-md px-3 text-sm bg-white ${errors.publisher ? 'border-red-400' : ''}`}
                    >
                      <option value="">-- Chọn NXB --</option>
                      {mockPublishers.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <Input
                      value={form.publisherCustom}
                      onChange={(e) => {
                        setForm((p) => ({ ...p, publisherCustom: e.target.value, publisher: '' }));
                        setErrors((p) => ({ ...p, publisher: undefined }));
                      }}
                      placeholder="Hoặc nhập tên NXB mới"
                      className="mt-2"
                    />
                    {errors.publisher && <p className="text-xs text-red-500 mt-1">{errors.publisher}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">
                      Thể loại <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={f('category')}
                      className={`w-full h-10 border rounded-md px-3 text-sm bg-white ${errors.category ? 'border-red-400' : ''}`}
                    >
                      <option value="">-- Chọn thể loại --</option>
                      {mockCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">Ngôn ngữ</label>
                    <select
                      value={form.language}
                      onChange={f('language')}
                      className="w-full h-10 border rounded-md px-3 text-sm bg-white"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">Tiếng Anh</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">ISBN</label>
                    <Input value={form.isbn} onChange={f('isbn')} placeholder="978-..." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">Năm xuất bản</label>
                    <Input type="number" value={form.year} onChange={f('year')} placeholder="2024" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 block mb-1.5">Số trang</label>
                    <Input type="number" value={form.pages} onChange={f('pages')} placeholder="320" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover + description */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2" style={{ fontSize: 15, fontWeight: 600 }}>
                <ImageIcon className="w-4 h-4 text-blue-600" /> Ảnh bìa & Mô tả
              </h3>
              <div>
                <label className="text-sm text-gray-500 block mb-1.5">URL ảnh bìa</label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={form.coverImage}
                    onChange={f('coverImage')}
                    placeholder="https://example.com/cover.jpg"
                    className="flex-1"
                  />
                  {form.coverImage && (
                    <img
                      src={form.coverImage}
                      alt="cover"
                      className="w-10 h-14 object-cover rounded-md border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
                <label className="text-sm text-gray-500 block mb-1.5">Mô tả / Tóm tắt</label>
                <textarea
                  value={form.description}
                  onChange={f('description')}
                  rows={4}
                  placeholder="Nhập mô tả hoặc tóm tắt nội dung sách..."
                  className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory config */}
          <Card>
            <CardContent className="p-5">
              <h3 className="mb-4" style={{ fontSize: 15, fontWeight: 600 }}>Cấu hình nhập kho</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">
                    Số bản sao <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min={1}
                    value={form.copies}
                    onChange={f('copies')}
                    className={errors.copies ? 'border-red-400' : ''}
                  />
                  {errors.copies && <p className="text-xs text-red-500 mt-1">{errors.copies}</p>}
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1.5">Vị trí kho</label>
                  <select
                    value={form.location}
                    onChange={f('location')}
                    className="w-full h-10 border rounded-md px-3 text-sm bg-white"
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Sách nổi bật</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPremium}
                    onChange={(e) => setForm((p) => ({ ...p, isPremium: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Yêu cầu thẻ Premium</span>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pb-2">
            <Button variant="outline" onClick={() => setForm(INIT)}>
              <RotateCcw className="w-4 h-4 mr-2" /> Nhập lại
            </Button>
            <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" /> Lưu sách
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-5">
              <h3 className="mb-4 text-sm" style={{ fontWeight: 600 }}>Xem trước</h3>
              {hasPreview ? (
                <div>
                  {form.coverImage ? (
                    <img
                      src={form.coverImage}
                      alt={form.title}
                      className="w-full h-56 object-cover rounded-lg mb-4 shadow-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400';
                      }}
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg mb-4 flex items-center justify-center">
                      <BookOpen className="w-14 h-14 text-blue-300" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {resolvedCategory && (
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-xs">
                        {resolvedCategory}
                      </Badge>
                    )}
                    {form.isFeatured && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">
                        <Star className="w-3 h-3 mr-1" /> Nổi bật
                      </Badge>
                    )}
                    {form.isPremium && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs">
                        Premium
                      </Badge>
                    )}
                  </div>

                  <h4 className="mb-1 leading-snug" style={{ fontSize: 15, fontWeight: 700 }}>
                    {form.title || 'Tên sách'}
                  </h4>
                  {resolvedAuthor && (
                    <p className="text-sm text-gray-600 mb-0.5">{resolvedAuthor}</p>
                  )}
                  {resolvedPublisher && (
                    <p className="text-xs text-gray-400 mb-2">{resolvedPublisher}</p>
                  )}

                  {form.description && (
                    <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed border-t pt-2 mt-2">
                      {form.description}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-gray-500">
                    <span>{form.copies || 1} bản sao</span>
                    <span>{form.location}</span>
                    {form.language && (
                      <span>{form.language === 'vi' ? 'Tiếng Việt' : form.language === 'en' ? 'English' : 'Khác'}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                  <BookOpen className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">Điền thông tin để xem trước</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
