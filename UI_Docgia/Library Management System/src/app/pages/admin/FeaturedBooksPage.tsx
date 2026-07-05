import { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Star, GripVertical, X, Plus, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

type Featured = {
  id: string;
  title: string;
  author: string;
  category: string;
  views: number;
  borrows: number;
  section: 'hero' | 'new' | 'recommended';
};

const INIT: Featured[] = [
  { id: 'F-01', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', category: 'Kỹ năng sống', views: 2840, borrows: 142, section: 'hero' },
  { id: 'F-02', title: 'Nhà Giả Kim', author: 'Paulo Coelho', category: 'Tiểu thuyết', views: 2156, borrows: 128, section: 'hero' },
  { id: 'F-03', title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Lịch sử', views: 1820, borrows: 98, section: 'new' },
  { id: 'F-04', title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', author: 'Rosie Nguyễn', category: 'Kỹ năng sống', views: 1654, borrows: 117, section: 'new' },
  { id: 'F-05', title: 'Cây Cam Ngọt Của Tôi', author: 'José Mauro', category: 'Tiểu thuyết', views: 1432, borrows: 89, section: 'recommended' },
  { id: 'F-06', title: 'Mắt Biếc', author: 'Nguyễn Nhật Ánh', category: 'Tiểu thuyết', views: 1290, borrows: 76, section: 'recommended' },
];

const SECTIONS: { key: Featured['section']; label: string; color: string }[] = [
  { key: 'hero', label: 'Hero Banner (Trang chủ)', color: 'bg-amber-100 text-amber-700' },
  { key: 'new', label: 'Sách Mới', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'recommended', label: 'Đề Xuất', color: 'bg-blue-100 text-blue-700' },
];

export function FeaturedBooksPage() {
  const [items, setItems] = useState(INIT);

  const remove = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
    toast.success('Đã gỡ khỏi danh sách nổi bật');
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl" style={{ fontWeight: 600 }}>Sách nổi bật</h1>
          <p className="text-sm text-gray-500 mt-1">Sắp xếp sách hiển thị trên trang chủ độc giả</p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
          <Plus className="w-4 h-4 mr-2" /> Thêm sách nổi bật
        </Button>
      </div>

      <div className="space-y-5">
        {SECTIONS.map((sec) => {
          const list = items.filter((i) => i.section === sec.key);
          return (
            <Card key={sec.key}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    <h3 style={{ fontSize: 16, fontWeight: 600 }}>{sec.label}</h3>
                    <Badge className={`${sec.color} hover:${sec.color}`}>{list.length} sách</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {list.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                      <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm" style={{ fontWeight: 500 }}>{b.title}</p>
                        <p className="text-xs text-gray-500">{b.author} · {b.category}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {b.views.toLocaleString('vi-VN')}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {b.borrows}</span>
                      </div>
                      <button onClick={() => remove(b.id)} className="p-1.5 hover:bg-red-50 rounded text-red-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {list.length === 0 && (
                    <div className="py-8 text-center text-sm text-gray-500 border-2 border-dashed rounded-lg">
                      Chưa có sách trong khu vực này
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
