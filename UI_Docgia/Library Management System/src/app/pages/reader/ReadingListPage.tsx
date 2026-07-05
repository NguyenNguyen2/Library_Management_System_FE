import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  BookMarked,
  Clock3,
  CheckCheck,
  Star,
  Trash2,
  NotebookPen,
  X,
  BookOpen,
  ChevronRight,
  Search,
  Share2,
  Copy,
  Check,
  Link as LinkIcon,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import type { Reader } from '../../types';

const TABS = [
  { key: 'want_to_read' as const, label: 'Muốn đọc', icon: <BookMarked className="w-4 h-4" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-500' },
  { key: 'reading' as const,      label: 'Đang đọc',  icon: <Clock3 className="w-4 h-4" />,     color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500' },
  { key: 'finished' as const,     label: 'Đã đọc',    icon: <CheckCheck className="w-4 h-4" />,  color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500' },
];

function NoteModal({
  current,
  onSave,
  onClose,
}: {
  current: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(current);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Ghi chú cá nhân</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Ghi chú suy nghĩ, cảm nhận của bạn về cuốn sách..."
          className="w-full h-32 rounded-xl border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Hủy</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { onSave(note); onClose(); }}>Lưu ghi chú</Button>
        </div>
      </div>
    </div>
  );
}

function ShareModal({ reader, allList, books, authors, onClose }: {
  reader: Reader;
  allList: ReturnType<typeof Array.prototype.filter>;
  books: any[];
  authors: any[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shareTab, setShareTab] = useState<'want_to_read' | 'reading' | 'finished'>('want_to_read');

  const shareUrl = `${window.location.origin}/public/reading-list/${reader.id}?tab=${shareTab}`;
  const tabBooks = allList
    .filter((item: any) => item.status === shareTab)
    .map((item: any) => books.find((b: any) => b.id === item.bookId))
    .filter(Boolean);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('input');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const TAB_LABELS = { want_to_read: 'Muốn đọc', reading: 'Đang đọc', finished: 'Đã đọc' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Share2 className="w-5 h-5" />
            <h2 style={{ fontWeight: 700, fontSize: '17px' }}>Chia sẻ danh sách đọc</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {/* Chọn tab muốn share */}
          <div>
            <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 500 }}>Chọn danh sách muốn chia sẻ</p>
            <div className="flex gap-2">
              {(['want_to_read', 'reading', 'finished'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setShareTab(t)}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                    shareTab === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: shareTab === t ? 600 : 400 }}
                >
                  {TAB_LABELS[t]}
                  <span className={`ml-1 text-[10px] ${shareTab === t ? 'text-blue-100' : 'text-gray-400'}`}>
                    ({allList.filter((i: any) => i.status === t).length})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {tabBooks.length > 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-2">Xem trước ({tabBooks.length} sách):</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {tabBooks.slice(0, 6).map((b: any) => (
                  <img key={b.id} src={b.coverImage} alt={b.title} className="w-10 h-14 object-cover rounded flex-shrink-0" title={b.title} />
                ))}
                {tabBooks.length > 6 && (
                  <div className="w-10 h-14 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-500" style={{ fontWeight: 600 }}>
                    +{tabBooks.length - 6}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
              Danh sách "{TAB_LABELS[shareTab]}" trống
            </div>
          )}

          {/* Link */}
          <div>
            <p className="text-xs text-gray-500 mb-1.5" style={{ fontWeight: 500 }}>Link chia sẻ công khai</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-0">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-xs text-gray-600 truncate">{shareUrl}</span>
              </div>
              <Button
                size="sm"
                className={`flex-shrink-0 h-9 px-3 transition-all ${copied ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                onClick={handleCopy}
              >
                {copied ? <><Check className="w-3.5 h-3.5 mr-1" />Đã sao chép</> : <><Copy className="w-3.5 h-3.5 mr-1" />Sao chép</>}
              </Button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">
              Bất kỳ ai có link đều có thể xem danh sách này (chỉ đọc).
            </p>
          </div>

          {/* Social share */}
          <div>
            <p className="text-xs text-gray-500 mb-2" style={{ fontWeight: 500 }}>Chia sẻ lên mạng xã hội</p>
            <div className="flex gap-2">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg bg-[#1877F2] text-white text-xs hover:bg-[#166FE5] transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Danh sách "${TAB_LABELS[shareTab]}" của tôi trên The Library`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReadingListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getReaderReadingList, removeFromReadingList, updateReadingListStatus, books, authors, categories } = useLibrary();
  const reader = user as Reader;

  const [activeTab, setActiveTab] = useState<'want_to_read' | 'reading' | 'finished'>('want_to_read');
  const [search, setSearch] = useState('');
  const [noteTarget, setNoteTarget] = useState<{ id: string; note: string } | null>(null);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [showShare, setShowShare] = useState(false);

  const allList = getReaderReadingList(reader.id);
  const tabList = allList.filter(item => item.status === activeTab);
  const filtered = tabList.filter(item => {
    const book = books.find(b => b.id === item.bookId);
    if (!book) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return book.title.toLowerCase().includes(q) || authors.find(a => a.id === book.authorId)?.name.toLowerCase().includes(q);
  });

  const counts = {
    want_to_read: allList.filter(i => i.status === 'want_to_read').length,
    reading: allList.filter(i => i.status === 'reading').length,
    finished: allList.filter(i => i.status === 'finished').length,
  };

  const handleMove = (id: string, status: 'want_to_read' | 'reading' | 'finished') => {
    updateReadingListStatus(id, status);
    const labels = { want_to_read: 'Muốn đọc', reading: 'Đang đọc', finished: 'Đã đọc' };
    toast.success(`Đã chuyển sang "${labels[status]}"`);
  };

  const handleRemove = (id: string, title: string) => {
    removeFromReadingList(id);
    toast.success(`Đã xóa "${title}" khỏi danh sách`);
  };

  const handleSaveNote = (id: string, note: string) => {
    setLocalNotes(prev => ({ ...prev, [id]: note }));
    toast.success('Đã lưu ghi chú');
  };

  const activeTabMeta = TABS.find(t => t.key === activeTab)!;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {showShare && (
        <ShareModal
          reader={reader}
          allList={allList}
          books={books}
          authors={authors}
          onClose={() => setShowShare(false)}
        />
      )}
      {noteTarget && (
        <NoteModal
          current={noteTarget.note}
          onSave={(note) => handleSaveNote(noteTarget.id, note)}
          onClose={() => setNoteTarget(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-1">Danh sách đọc</h1>
          <p className="text-gray-500 text-sm">Quản lý sách yêu thích và theo dõi tiến độ đọc của bạn</p>
        </div>
        {allList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="w-4 h-4" />
            Chia sẻ
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TABS.map(tab => (
          <div key={tab.key} className={`${tab.bg} border rounded-xl px-4 py-3 cursor-pointer transition-all ${activeTab === tab.key ? 'ring-2 ring-offset-1 ' + tab.border.replace('border-', 'ring-') : 'hover:shadow-sm'}`} onClick={() => setActiveTab(tab.key)}>
            <div className={`flex items-center gap-1.5 ${tab.color} mb-1`}>
              {tab.icon}
              <span className="text-xs" style={{ fontWeight: 500 }}>{tab.label}</span>
            </div>
            <p className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>{counts[tab.key]}</p>
            <p className="text-xs text-gray-500">cuốn sách</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5 gap-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors ${
              activeTab === tab.key
                ? `${tab.border} ${tab.color}` + ' -mb-px'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontWeight: activeTab === tab.key ? 600 : 400 }}
          >
            {tab.icon}
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? tab.bg : 'bg-gray-100 text-gray-500'}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      {tabList.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm trong danh sách..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className={`w-16 h-16 ${activeTabMeta.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className={activeTabMeta.color}>{activeTabMeta.icon}</span>
          </div>
          {tabList.length === 0 ? (
            <>
              <p className="text-gray-600 mb-1" style={{ fontWeight: 500 }}>Chưa có sách nào trong "{activeTabMeta.label}"</p>
              <p className="text-sm">Tìm sách và thêm vào danh sách từ trang chi tiết sách</p>
              <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/reader/catalog')}>
                <BookOpen className="w-4 h-4 mr-2" /> Khám phá sách
              </Button>
            </>
          ) : (
            <p className="text-sm">Không tìm thấy sách khớp với "{search}"</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const book = books.find(b => b.id === item.bookId);
            if (!book) return null;
            const bookAuthor = authors.find(a => a.id === book.authorId);
            const bookCat = categories.find(c => c.id === book.categoryId);
            const note = localNotes[item.id] || item.notes || '';
            const otherTabs = TABS.filter(t => t.key !== activeTab);

            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex gap-4 p-4">
                  {/* Cover */}
                  <div className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer" onClick={() => navigate(`/reader/catalog/${book.id}`)}>
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-gray-900 hover:text-blue-600 cursor-pointer truncate transition-colors"
                          style={{ fontWeight: 600 }}
                          onClick={() => navigate(`/reader/catalog/${book.id}`)}
                        >
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500">{bookAuthor?.name}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {bookCat && <Badge variant="outline" className="text-xs py-0">{bookCat.name}</Badge>}
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= Math.round(book.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                            ))}
                            <span className="text-xs text-gray-400 ml-0.5">{book.rating.toFixed(1)}</span>
                          </div>
                          {book.availableCopies > 0
                            ? <span className="text-xs text-green-600">● Có sẵn</span>
                            : <span className="text-xs text-orange-500">● Đặt trước</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setNoteTarget({ id: item.id, note })}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${note ? 'text-blue-500' : 'text-gray-400'}`}
                          title="Ghi chú"
                        >
                          <NotebookPen className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id, book.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa khỏi danh sách"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Note preview */}
                    {note && (
                      <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2 italic">
                        "{note}"
                      </p>
                    )}

                    {/* Move to other list */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs text-gray-400">Chuyển sang:</span>
                      {otherTabs.map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => handleMove(item.id, tab.key)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors ${tab.bg} ${tab.color} border-current/20 hover:opacity-80`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                      <button
                        onClick={() => navigate(`/reader/catalog/${book.id}`)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors ml-auto"
                      >
                        Xem chi tiết <ChevronRight className="w-3 h-3" />
                      </button>
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
