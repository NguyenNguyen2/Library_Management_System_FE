'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { App, Button, Input, Modal, Spin } from 'antd';
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  RightOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarFilled,
  LinkOutlined,
  CopyOutlined,
  CheckOutlined,
  FacebookFilled,
  XOutlined,
} from '@ant-design/icons';
import {
  useReadingList,
  useUpdateReadingList,
  useRemoveFromReadingList,
} from '@/features/reading-list/hooks/useReadingList';
import { APP_ROUTE } from '@/constants/routes';
import type { IReadingListItem, IReadingListStatus } from '@/features/reading-list/api/readingListApi';

type TabKey = Exclude<IReadingListStatus, 'favorite'>;

const TABS: { key: TabKey; label: string; icon: React.ReactNode; color: string; bg: string; border: string }[] = [
  { key: 'want_to_read', label: 'Đọc sau',   icon: <BookOutlined />,         color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-500'  },
  { key: 'reading',      label: 'Đang đọc',  icon: <ClockCircleOutlined />,  color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-500' },
  { key: 'finished',     label: 'Đã đọc',    icon: <CheckCircleOutlined />,  color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-500' },
];

const TAB_LABELS: Record<TabKey, string> = {
  want_to_read: 'Đọc sau',
  reading:      'Đang đọc',
  finished:     'Đã đọc',
};

function NoteModal({
  open,
  initialNote,
  onSave,
  onClose,
}: {
  open: boolean;
  initialNote: string;
  onSave: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    if (open) setNote(initialNote);
  }, [open, initialNote]);

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Ghi chú cá nhân" width={400} centered destroyOnHidden>
      <div className="space-y-4 pt-2">
        <Input.TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú suy nghĩ, cảm nhận của bạn về cuốn sách..."
          rows={5}
          autoFocus
        />
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            className="flex-1"
            onClick={() => {
              onSave(note);
              onClose();
            }}
          >
            Lưu ghi chú
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function ShareModal({
  open,
  items,
  onClose,
}: {
  open: boolean;
  items: IReadingListItem[];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shareTab, setShareTab] = useState<TabKey>('want_to_read');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${origin}/reading-list/shared?tab=${shareTab}`;

  const tabItems = items.filter((item) => item.status.value === shareTab);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={440}
      centered
      destroyOnHidden
      title={
        <span className="flex items-center gap-2">
          <ShareAltOutlined /> Chia sẻ danh sách đọc
        </span>
      }
    >
      <div className="space-y-4 pt-2">
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Chọn danh sách muốn chia sẻ</p>
          <div className="flex gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setShareTab(tab.key)}
                className={`flex-1 text-xs py-2 rounded-lg border transition-all ${
                  shareTab === tab.key
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-1 text-[10px] ${shareTab === tab.key ? 'text-blue-100' : 'text-gray-400'}`}>
                  ({items.filter((i) => i.status.value === tab.key).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {tabItems.length > 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-2">Xem trước ({tabItems.length} sách):</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabItems.slice(0, 6).map((item) =>
                item.cover_image ? (
                  <img
                    key={item.wishlist_id}
                    src={item.cover_image}
                    alt={item.title}
                    className="w-10 h-14 object-cover rounded flex-shrink-0"
                    title={item.title}
                  />
                ) : (
                  <div
                    key={item.wishlist_id}
                    className="w-10 h-14 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-xs"
                  >
                    <BookOutlined />
                  </div>
                )
              )}
              {tabItems.length > 6 && (
                <div className="w-10 h-14 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-xs text-gray-500 font-semibold">
                  +{tabItems.length - 6}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center text-sm text-gray-400">
            Danh sách &quot;{TAB_LABELS[shareTab]}&quot; trống
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500 mb-1.5 font-medium">Link chia sẻ công khai</p>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-0">
              <LinkOutlined className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">{shareUrl}</span>
            </div>
            <Button
              size="small"
              type="primary"
              className={copied ? '!bg-green-500 hover:!bg-green-600' : ''}
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopy}
            >
              {copied ? 'Đã sao chép' : 'Sao chép'}
            </Button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Bất kỳ ai có link đều có thể xem danh sách này (chỉ đọc).</p>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium">Chia sẻ lên mạng xã hội</p>
          <div className="flex gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg bg-[#1877F2] text-white text-xs hover:bg-[#166FE5] transition-colors"
            >
              <FacebookFilled /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Danh sách đọc của tôi trên The Library')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg bg-black text-white text-xs hover:bg-gray-800 transition-colors"
            >
              <XOutlined /> X (Twitter)
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function ReadingListPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const { data, isLoading } = useReadingList();
  const { mutate: updateItem } = useUpdateReadingList();
  const { mutate: removeItem } = useRemoveFromReadingList();

  const [activeTab, setActiveTab]   = useState<TabKey>('want_to_read');
  const [search, setSearch]         = useState('');
  const [noteTarget, setNoteTarget] = useState<IReadingListItem | null>(null);
  const [showShare, setShowShare]   = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const items = data?.data ?? [];

  const counts: Record<TabKey, number> = {
    want_to_read: items.filter((i) => i.status.value === 'want_to_read').length,
    reading:      items.filter((i) => i.status.value === 'reading').length,
    finished:     items.filter((i) => i.status.value === 'finished').length,
  };

  const tabList = items.filter((i) => i.status.value === activeTab);
  const filtered = tabList.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.author_name?.toLowerCase().includes(q) ?? false)
    );
  });

  const activeTabMeta = TABS.find((t) => t.key === activeTab)!;

  const handleMove = (wishlistId: number, status: TabKey) => {
    updateItem(
      { wishlistId, status },
      {
        onSuccess: () => message.success(`Đã chuyển sang "${TAB_LABELS[status]}"`),
        onError: ()   => message.error('Cập nhật thất bại. Vui lòng thử lại.'),
      }
    );
  };

  const handleRemove = (wishlistId: number, title: string) => {
    removeItem(wishlistId, {
      onSuccess: () => message.success(`Đã xóa "${title}" khỏi danh sách`),
      onError: ()   => message.error('Xóa thất bại. Vui lòng thử lại.'),
    });
  };

  const handleSaveNote = (wishlistId: number, note: string) => {
    updateItem(
      { wishlistId, note },
      {
        onSuccess: () => message.success('Đã lưu ghi chú'),
        onError: ()   => message.error('Lưu ghi chú thất bại.'),
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <NoteModal
        open={!!noteTarget}
        initialNote={noteTarget?.note ?? ''}
        onSave={(note) => {
          if (noteTarget) handleSaveNote(noteTarget.wishlist_id, note);
        }}
        onClose={() => setNoteTarget(null)}
      />
      <ShareModal open={showShare} items={items} onClose={() => setShowShare(false)} />

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách đọc</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý sách yêu thích và theo dõi tiến độ đọc của bạn
          </p>
        </div>
        {items.length > 0 && (
          <Button
            icon={<ShareAltOutlined />}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 shrink-0"
            onClick={() => setShowShare(true)}
          >
            Chia sẻ
          </Button>
        )}
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {TABS.map((tab) => (
          <div
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`${tab.bg} border rounded-xl px-4 py-3 cursor-pointer transition-all ${
              activeTab === tab.key ? `ring-2 ring-offset-1 ${tab.border}` : 'hover:shadow-sm'
            }`}
          >
            <div className={`flex items-center gap-1.5 ${tab.color} mb-1 text-xs font-medium`}>
              {tab.icon}
              <span>{tab.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{counts[tab.key]}</p>
            <p className="text-xs text-gray-500">cuốn sách</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors -mb-px ${
              activeTab === tab.key
                ? `${tab.border} ${tab.color} font-semibold`
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
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
          <Input
            placeholder="Tìm trong danh sách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            prefix={<SearchOutlined className="text-gray-400" />}
          />
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className={`w-16 h-16 ${activeTabMeta.bg} rounded-full flex items-center justify-center mx-auto mb-4 text-2xl ${activeTabMeta.color}`}>
            {activeTabMeta.icon}
          </div>
          {tabList.length === 0 ? (
            <>
              <p className="text-gray-600 font-medium mb-1">
                Chưa có sách nào trong &quot;{activeTabMeta.label}&quot;
              </p>
              <p className="text-sm">Tìm sách và thêm vào danh sách từ trang chi tiết sách</p>
              <Button type="primary" icon={<BookOutlined />} className="mt-4" onClick={() => router.push(APP_ROUTE.courses)}>
                Khám phá sách
              </Button>
            </>
          ) : (
            <p className="text-sm">Không tìm thấy sách khớp với &quot;{search}&quot;</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const otherTabs  = TABS.filter((tab) => tab.key !== activeTab);
            const currentNote = item.note ?? '';

            return (
              <div key={item.wishlist_id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="flex gap-4 p-4">
                  <div
                    className="flex-shrink-0 w-16 h-24 rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center"
                    onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
                  >
                    {item.cover_image ? (
                      <img
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <span className="text-2xl text-gray-300">📖</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3
                          className="text-gray-900 font-semibold hover:text-blue-600 cursor-pointer truncate transition-colors"
                          onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
                        >
                          {item.title}
                        </h3>
                        {item.author_name && (
                          <p className="text-sm text-gray-500">{item.author_name}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                          <span className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <StarFilled
                                key={i}
                                className={i <= Math.round(item.avg_rating ?? 0) ? 'text-yellow-400' : 'text-gray-200'}
                              />
                            ))}
                            <span className="text-gray-400 ml-0.5">{(item.avg_rating ?? 0).toFixed(1)}</span>
                          </span>
                          {(item.available_copies ?? 0) > 0 ? (
                            <span className="text-green-600">● Có sẵn</span>
                          ) : (
                            <span className="text-orange-500">● Đặt trước</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setNoteTarget(item)}
                          className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${currentNote ? 'text-blue-500' : 'text-gray-400'}`}
                          title="Ghi chú"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          onClick={() => handleRemove(item.wishlist_id, item.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Xóa khỏi danh sách"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </div>

                    {currentNote && (
                      <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2 italic">
                        &quot;{currentNote}&quot;
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span className="text-xs text-gray-400">Chuyển sang:</span>
                      {otherTabs.map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => handleMove(item.wishlist_id, tab.key)}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-current/20 transition-colors hover:opacity-80 ${tab.bg} ${tab.color}`}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                      <button
                        onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors ml-auto"
                      >
                        Xem chi tiết <RightOutlined className="text-[10px]" />
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
