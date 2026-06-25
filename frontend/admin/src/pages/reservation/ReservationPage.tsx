import {
  Alert,
  Badge,
  Button,
  Divider,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  BookOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import {
  BookSearchResult,
  ReservationRecord,
} from '../../api/reservationApi';
import { reservationHooks } from '../../hooks/useReservation';
import { cn } from '@shared/constants/commonConst';
import dayjs from 'dayjs';

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  waiting: { label: 'Đang chờ', color: 'blue', icon: <ClockCircleOutlined /> },
  ready:   { label: 'Sẵn sàng', color: 'green', icon: <CheckCircleOutlined /> },
  expired: { label: 'Hết hạn', color: 'default', icon: <CloseCircleOutlined /> },
  converted: { label: 'Đã mượn', color: 'purple', icon: <SyncOutlined /> },
  cancelled: { label: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
};

const ReservationPage = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');

  // Create form state
  const [bookKeyword, setBookKeyword] = useState('');
  const [bookResults, setBookResults] = useState<BookSearchResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // List filter state
  const [listUserId, setListUserId] = useState<string>('');
  const [listStatus, setListStatus] = useState<string>('');
  const [listPage, setListPage] = useState(1);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    reservation: ReservationRecord | null;
    copyId: number | null;
  }>({ open: false, reservation: null, copyId: null });

  const searchMutation  = reservationHooks.useSearchBook();
  const createMutation  = reservationHooks.useCreateReservation();
  const confirmMutation = reservationHooks.useConfirmReservation();
  const cancelMutation  = reservationHooks.useCancelReservation();

  const { data: listData, isLoading: listLoading } = reservationHooks.useListReservations({
    user_id: listUserId ? parseInt(listUserId) : undefined,
    status:  listStatus || undefined,
    per_page: 20,
    page: listPage,
  });

  const handleSearchBook = () => {
    const trimmed = bookKeyword.trim();
    if (trimmed.length < 1) return;
    searchMutation.mutate(trimmed, {
      onSuccess: (data) => {
        setBookResults(data);
        setSelectedBook(null);
        if (data.length === 0) message.info('Không tìm thấy sách nào.');
      },
      onError: () => message.error('Lỗi tìm kiếm sách.'),
    });
  };

  const handleCreateReservation = () => {
    if (!selectedBook || !userId) return;
    createMutation.mutate(
      { user_id: userId, book_id: selectedBook.book_id },
      {
        onSuccess: (result) => {
          Modal.success({
            title: 'Đặt trước thành công',
            content: (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sách</span>
                  <span className="font-medium">{result.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vị trí hàng chờ</span>
                  <Badge
                    count={result.queue_position}
                    style={{ backgroundColor: '#3b82f6' }}
                    overflowCount={99}
                  />
                </div>
              </div>
            ),
            okText: 'Đóng',
          });
          setSelectedBook(null);
          setBookKeyword('');
          setBookResults([]);
          setUserId(null);
          setActiveTab('list');
        },
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Không thể tạo phiếu đặt trước.');
        },
      }
    );
  };

  const handleConfirm = () => {
    const { reservation, copyId } = confirmModal;
    if (!reservation || !copyId) return;
    confirmMutation.mutate(
      { reservation_id: reservation.reservation_id, copy_id: copyId },
      {
        onSuccess: (result) => {
          Modal.success({
            title: 'Xác nhận thành công',
            width: 420,
            content: (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phiếu mượn #</span>
                  <span className="font-mono font-medium">{result.borrow_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sách</span>
                  <span className="font-medium">{result.book_title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hạn trả</span>
                  <span className="font-semibold text-blue-500">
                    {dayjs(result.due_date).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>
            ),
            okText: 'Đóng',
          });
          setConfirmModal({ open: false, reservation: null, copyId: null });
        },
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Xác nhận không thành công.');
        },
      }
    );
  };

  const handleCancel = (reservationId: number) => {
    Modal.confirm({
      title: 'Hủy phiếu đặt trước',
      content: 'Bạn có chắc muốn hủy phiếu đặt trước này?',
      okText: 'Xác nhận hủy',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: () => {
        cancelMutation.mutate(reservationId, {
          onSuccess: () => message.success('Đã hủy phiếu đặt trước.'),
          onError: (err) => {
            const msg = (err.response?.data as { message?: string })?.message;
            message.error(msg ?? 'Không thể hủy phiếu.');
          },
        });
      },
    });
  };

  const columns: TableColumnsType<ReservationRecord> = [
    {
      title: '#',
      dataIndex: 'reservation_id',
      width: 60,
      render: (v: number) => <span className="font-mono text-xs text-gray-400">{v}</span>,
    },
    {
      title: 'Độc giả',
      key: 'reader',
      width: 180,
      render: (_: unknown, r: ReservationRecord) => (
        <div>
          <div className="font-medium text-sm text-gray-800">{r.full_name}</div>
          {r.card_number && (
            <div className="font-mono text-xs text-gray-400">{r.card_number}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Sách',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Vị trí',
      key: 'queue',
      width: 80,
      align: 'center',
      render: (_: unknown, r: ReservationRecord) =>
        r.status === 'waiting' || r.status === 'ready' ? (
          <Tooltip title={`Hàng chờ thực tế: #${r.actual_queue_position}`}>
            <Badge
              count={r.actual_queue_position}
              style={{ backgroundColor: '#3b82f6' }}
              overflowCount={99}
            />
          </Tooltip>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (v: string) => {
        const cfg = STATUS_CONFIG[v] ?? { label: v, color: 'default', icon: null };
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (v: string) => dayjs(v).format('DD/MM/YYYY'),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expired_at',
      key: 'expired_at',
      width: 110,
      render: (v: string | null) =>
        v ? (
          <span className={dayjs(v).isBefore(dayjs()) ? 'text-red-500' : 'text-gray-600'}>
            {dayjs(v).format('DD/MM/YYYY')}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_: unknown, r: ReservationRecord) => (
        <div className="flex gap-1.5">
          {(r.status === 'waiting' || r.status === 'ready') && (
            <>
              <Button
                size="small"
                type="primary"
                onClick={() =>
                  setConfirmModal({ open: true, reservation: r, copyId: null })
                }
              >
                Xác nhận
              </Button>
              <Button
                size="small"
                danger
                onClick={() => handleCancel(r.reservation_id)}
                loading={cancelMutation.isPending}
              >
                Hủy
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[1100px] mx-auto flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
          <BookOutlined className="text-purple-500" style={{ fontSize: 22 }} />
        </div>
        <div>
          <h1 className="m-0 text-xl font-bold text-navyDark leading-tight">
            Đặt trước sách
          </h1>
          <p className="m-0 text-sm text-gray-500 mt-0.5">
            Quản lý hàng chờ đặt trước và xác nhận tại quầy
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['list', 'create'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all border-0 cursor-pointer',
              activeTab === tab
                ? 'bg-white shadow text-navyDark'
                : 'bg-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {tab === 'list' ? 'Danh sách phiếu' : 'Tạo phiếu mới'}
          </button>
        ))}
      </div>

      {/* Tab: Create */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5">
            <p className="m-0 mb-4 text-sm font-semibold text-gray-700">
              Bước 1 — Tìm sách
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Nhập tên sách hoặc ISBN"
                value={bookKeyword}
                onChange={(e) => setBookKeyword(e.target.value)}
                onPressEnter={handleSearchBook}
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
              />
              <Button
                type="primary"
                style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                loading={searchMutation.isPending}
                onClick={handleSearchBook}
              >
                Tìm
              </Button>
            </div>

            {/* Book search results */}
            {bookResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {bookResults.map((book) => (
                  <button
                    key={book.book_id}
                    onClick={() => {
                      setSelectedBook(book);
                      setBookResults([]);
                      setBookKeyword(book.title);
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-center justify-between',
                      'hover:bg-purple-50 transition-colors border-0 bg-white cursor-pointer',
                      'border-b border-gray-100 last:border-b-0'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title}
                          className="w-9 h-12 object-cover rounded shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-12 bg-gray-100 rounded shrink-0 flex items-center justify-center">
                          <BookOutlined className="text-gray-400 text-xs" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-800 truncate">
                          {book.title}
                        </div>
                        <div className="text-xs text-gray-400">{book.author_name}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 ml-2">
                      <Tag color={book.available_copies > 0 ? 'green' : 'orange'}>
                        {book.available_copies > 0
                          ? `${book.available_copies} sẵn có`
                          : 'Hết bản'}
                      </Tag>
                      {book.queue_count > 0 && (
                        <Tag color="blue">{book.queue_count} đang chờ</Tag>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Selected book + availability warning */}
            {selectedBook && (
              <div className="mt-3">
                <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOutlined className="text-purple-500" />
                    <div>
                      <span className="font-medium text-sm text-gray-800">
                        {selectedBook.title}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        {selectedBook.author_name}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Tag color={selectedBook.available_copies > 0 ? 'green' : 'orange'}>
                      {selectedBook.available_copies > 0
                        ? `${selectedBook.available_copies} bản sẵn có`
                        : 'Hết bản'}
                    </Tag>
                    <Button
                      size="small"
                      type="text"
                      className="text-gray-400"
                      onClick={() => setSelectedBook(null)}
                    >
                      Đổi
                    </Button>
                  </div>
                </div>

                {selectedBook.available_copies > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Sách này còn bản sẵn có. Đặt trước chỉ áp dụng khi sách hết bản."
                    className="mt-2"
                  />
                )}
              </div>
            )}
          </div>

          {selectedBook && selectedBook.available_copies === 0 && (
            <>
              <Divider className="my-0" />
              <div className="px-6 py-5">
                <p className="m-0 mb-3 text-sm font-semibold text-gray-700">
                  Bước 2 — Chọn độc giả
                </p>
                <div className="flex items-center gap-3">
                  <UserOutlined className="text-gray-400" />
                  <InputNumber
                    placeholder="Nhập User ID của độc giả"
                    value={userId}
                    onChange={(v) => setUserId(v)}
                    style={{ width: 220 }}
                    min={1}
                  />
                </div>
              </div>

              <Divider className="my-0" />
              <div className="px-6 py-5 flex justify-end">
                <Button
                  type="primary"
                  style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                  disabled={!userId}
                  loading={createMutation.isPending}
                  onClick={handleCreateReservation}
                  icon={<ClockCircleOutlined />}
                >
                  Tạo phiếu đặt trước
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-100 flex gap-3 flex-wrap items-end">
            <div>
              <p className="m-0 mb-1 text-xs text-gray-500">User ID</p>
              <Input
                placeholder="Tất cả"
                value={listUserId}
                onChange={(e) => {
                  setListUserId(e.target.value);
                  setListPage(1);
                }}
                style={{ width: 120 }}
                allowClear
              />
            </div>
            <div>
              <p className="m-0 mb-1 text-xs text-gray-500">Trạng thái</p>
              <Select
                placeholder="Tất cả"
                value={listStatus || undefined}
                onChange={(v) => {
                  setListStatus(v ?? '');
                  setListPage(1);
                }}
                allowClear
                style={{ width: 140 }}
                options={[
                  { value: 'waiting',   label: 'Đang chờ' },
                  { value: 'ready',     label: 'Sẵn sàng' },
                  { value: 'expired',   label: 'Hết hạn' },
                  { value: 'converted', label: 'Đã mượn' },
                  { value: 'cancelled', label: 'Đã hủy' },
                ]}
              />
            </div>
          </div>

          {listLoading ? (
            <div className="flex justify-center py-12">
              <Spin />
            </div>
          ) : (
            <Table<ReservationRecord>
              rowKey="reservation_id"
              size="small"
              columns={columns}
              dataSource={listData?.objects ?? []}
              pagination={{
                total: listData?.total ?? 0,
                pageSize: listData?.per_page ?? 20,
                current: listPage,
                onChange: setListPage,
                showTotal: (total) => `${total} phiếu`,
              }}
              locale={{ emptyText: 'Không có phiếu đặt trước nào.' }}
            />
          )}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal
        open={confirmModal.open}
        title="Xác nhận đặt trước tại quầy"
        onCancel={() => setConfirmModal({ open: false, reservation: null, copyId: null })}
        onOk={handleConfirm}
        okText="Xác nhận mượn sách"
        cancelText="Hủy"
        confirmLoading={confirmMutation.isPending}
        okButtonProps={{ disabled: !confirmModal.copyId }}
      >
        {confirmModal.reservation && (
          <div className="space-y-4 mt-2">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Độc giả</span>
                <span className="font-medium">{confirmModal.reservation.full_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sách</span>
                <span className="font-medium truncate max-w-[200px]">
                  {confirmModal.reservation.title}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Copy ID của bản sao sẽ giao
              </p>
              <InputNumber
                placeholder="Nhập Copy ID"
                value={confirmModal.copyId}
                onChange={(v) =>
                  setConfirmModal((prev) => ({ ...prev, copyId: v }))
                }
                style={{ width: '100%' }}
                min={1}
              />
              <p className="text-xs text-gray-400 mt-1">
                Quét barcode để lấy copy_id hoặc nhập thủ công.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReservationPage;
