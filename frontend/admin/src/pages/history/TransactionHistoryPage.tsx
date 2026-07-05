import { useCallback, useEffect, useState } from 'react';
import { Input, Avatar, Pagination, Empty, Spin } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { userApi, ReaderListItem } from '../../api/userApi';
import UserHistoryTable from './UserHistoryTable';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.trim().split(' ').slice(-1)[0]?.charAt(0).toUpperCase() ?? 'U';
}

function ReaderCard({
  reader,
  selected,
  onClick,
}: {
  reader: ReaderListItem;
  selected: boolean;
  onClick: () => void;
}) {
  const isActive = reader.status.value === '1';

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        border: 'none',
        cursor: 'pointer',
        padding: '10px 14px',
        borderRadius: 8,
        background: selected ? '#EFF6FF' : 'transparent',
        borderLeft: selected ? '3px solid #2563EB' : '3px solid transparent',
        transition: 'all 0.15s',
      }}
      className="hover:bg-blue-50"
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar
          size={38}
          src={reader.avatar ?? undefined}
          style={{ background: selected ? '#2563EB' : '#6B7280', flexShrink: 0 }}
          icon={!reader.avatar ? <UserOutlined /> : undefined}
        >
          {!reader.avatar ? getInitials(reader.name) : undefined}
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: selected ? '#1D4ED8' : '#1F2937' }}
            >
              {reader.name}
            </span>
            {!isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">
                Khoá
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 truncate m-0 mt-0.5">{reader.email}</p>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
              {reader.card_number === '—' ? 'Chưa có thẻ' : reader.card_number}
            </span>
            {reader.borrowing > 0 && (
              <span className="text-[11px] text-blue-600">
                {reader.borrowing} đang mượn
              </span>
            )}
            {reader.overdue > 0 && (
              <span className="text-[11px] text-red-500 font-medium">
                {reader.overdue} quá hạn
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function TransactionHistoryPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
  }, []);

  // Fetch readers list
  const { data: readersData, isLoading: loadingReaders } = useQuery({
    queryKey: ['readers-list', debouncedSearch, page],
    queryFn: () => userApi.getReaderList({ keyword: debouncedSearch, page, limit: 10 }),
    staleTime: 30_000,
    placeholderData: prev => prev,
  });

  const readers: ReaderListItem[] = readersData?.rows ?? [];
  const total: number = readersData?.total ?? 0;

  const handleSelectUser = useCallback((reader: ReaderListItem) => {
    setSelectedUser({ id: reader.id, name: reader.name });
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full" style={{ minHeight: 'calc(100vh - 88px)' }}>
      {/* ── Left panel: Reader list ─────────────────────────────────────── */}
      <div
        style={{
          width: 300,
          minWidth: 300,
          borderRight: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
        }}
      >
        {/* Panel header */}
        <div className="px-4 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-800 m-0 mb-3">Danh sách người dùng</h2>
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo tên, email..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            allowClear
            onClear={() => handleSearchChange('')}
            size="small"
          />
        </div>

        {/* Reader list */}
        <div className="flex-1 overflow-y-auto p-2">
          <Spin spinning={loadingReaders} size="small">
            {readers.length === 0 && !loadingReaders ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span className="text-gray-400 text-sm">
                      {debouncedSearch ? 'Không tìm thấy kết quả' : 'Chưa có độc giả'}
                    </span>
                  }
                />
              </div>
            ) : (
              <div className="space-y-0.5">
                {readers.map(reader => (
                  <ReaderCard
                    key={reader.id}
                    reader={reader}
                    selected={selectedUser?.id === reader.id}
                    onClick={() => handleSelectUser(reader)}
                  />
                ))}
              </div>
            )}
          </Spin>
        </div>

        {/* Pagination */}
        {total > 10 && (
          <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex justify-center">
            <Pagination
              current={page}
              total={total}
              pageSize={10}
              size="small"
              showSizeChanger={false}
              onChange={p => setPage(p)}
            />
          </div>
        )}

        {/* Total count */}
        <div className="px-4 py-2 border-t border-gray-100 shrink-0">
          <p className="text-xs text-gray-400 m-0 text-center">
            {total} độc giả
          </p>
        </div>
      </div>

      {/* ── Right panel: History table ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedUser ? (
          <UserHistoryTable userId={selectedUser.id} userName={selectedUser.name} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#F3F4F6', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <UserOutlined style={{ fontSize: 28, color: '#9CA3AF' }} />
            </div>
            <h3 className="text-gray-500 font-medium text-base m-0 mb-2">
              Chọn một độc giả
            </h3>
            <p className="text-gray-400 text-sm m-0">
              Nhấn vào tên độc giả ở cột trái để xem toàn bộ lịch sử giao dịch
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
