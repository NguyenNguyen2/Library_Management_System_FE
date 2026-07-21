import {
  Alert,
  Badge,
  Button,
  DatePicker,
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
import { useEffect, useState } from 'react';
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
  pending:          { label: 'Đang chờ', color: 'blue', icon: <ClockCircleOutlined /> },
  ready_for_pickup: { label: 'Sẵn sàng nhận', color: 'green', icon: <CheckCircleOutlined /> },
  expired:          { label: 'Hết hạn', color: 'default', icon: <CloseCircleOutlined /> },
  completed:        { label: 'Đã hoàn thành', color: 'purple', icon: <SyncOutlined /> },
  cancelled:        { label: 'Đã hủy', color: 'red', icon: <CloseCircleOutlined /> },
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
  const [listKeyword, setListKeyword] = useState<string>('');
  const [listDateRange, setListDateRange] = useState<[string, string] | undefined>(undefined);
  const [listQueuePosition, setListQueuePosition] = useState<string>('');
  const [listPage, setListPage] = useState(1);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    reservation: ReservationRecord | null;
    copyId: number | null;
  }>({ open: false, reservation: null, copyId: null });

  // Mark-ready modal state — thủ thư chọn đúng 1 bản sao available để giữ chỗ
  const [markReadyModal, setMarkReadyModal] = useState<{
    open: boolean;
    reservation: ReservationRecord | null;
    copyId: number | null;
  }>({ open: false, reservation: null, copyId: null });

  const searchMutation    = reservationHooks.useSearchBook();
  const createMutation    = reservationHooks.useCreateReservation();
  const confirmMutation   = reservationHooks.useConfirmReservation();
  const markReadyMutation = reservationHooks.useMarkReady();
  const cancelMutation    = reservationHooks.useCancelReservation();

  const { data: listData, isLoading: listLoading } = reservationHooks.useListReservations({
    user_id: listUserId ? parseInt(listUserId) : undefined,
    status:  listStatus || undefined,
    keyword: listKeyword || undefined,
    from: listDateRange?.[0],
    to: listDateRange?.[1],
    queue_position: listQueuePosition ? parseInt(listQueuePosition) : undefined,
    per_page: 20,
    page: listPage,
  });

  const needsCopyPicker =
    !!confirmModal.reservation &&
    confirmModal.reservation.status === 'pending' &&
    confirmModal.reservation.pickup_type === 'counter';

  const { data: confirmCopies, isLoading: confirmCopiesLoading } = reservationHooks.useAvailableCopiesByBook(
    confirmModal.open && needsCopyPicker ? confirmModal.reservation?.book_id : undefined
  );

  const { data: markReadyCopies, isLoading: markReadyCopiesLoading } = reservationHooks.useAvailableCopiesByBook(
    markReadyModal.open ? markReadyModal.reservation?.book_id : undefined
  );

  // Tự chọn sẵn bản sao đầu tiên khi danh sách available copies tải về (thủ thư vẫn có
  // thể đổi lựa chọn khác trước khi xác nhận).
  useEffect(() => {
    if (markReadyModal.open && markReadyCopies && markReadyCopies.length > 0 && !markReadyModal.copyId) {
      setMarkReadyModal((prev) => ({ ...prev, copyId: markReadyCopies[0].copy_id }));
    }
  }, [markReadyModal.open, markReadyCopies]);

  useEffect(() => {
    if (confirmModal.open && needsCopyPicker && confirmCopies && confirmCopies.length > 0 && !confirmModal.copyId) {
      setConfirmModal((prev) => ({ ...prev, copyId: confirmCopies[0].copy_id }));
    }
  }, [confirmModal.open, needsCopyPicker, confirmCopies]);

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
                {result.pickup_type === 'counter' || result.queue_position == null ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hình thức</span>
                    <Tag color="cyan">Tại quầy — đến nhận ngay</Tag>
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Vị trí hàng chờ</span>
                    <Badge
                      count={result.queue_position}
                      style={{ backgroundColor: '#3b82f6' }}
                      overflowCount={99}
                    />
                  </div>
                )}
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
    if (!reservation) return;
    if (needsCopyPicker && !copyId) return;
    confirmMutation.mutate(
      {
        reservation_id: reservation.reservation_id,
        ...(needsCopyPicker ? { copy_id: copyId! } : {}),
      },
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

  const handleOpenMarkReady = (r: ReservationRecord) => {
    setMarkReadyModal({ open: true, reservation: r, copyId: null });
  };

  const handleConfirmMarkReady = () => {
    const { reservation, copyId } = markReadyModal;
    if (!reservation) return;
    markReadyMutation.mutate(
      { reservation_id: reservation.reservation_id, ...(copyId ? { copy_id: copyId } : {}) },
      {
        onSuccess: () => {
          message.success('Đã xác nhận có sách, độc giả sẽ được thông báo.');
          setMarkReadyModal({ open: false, reservation: null, copyId: null });
        },
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Không thể xác nhận có sách.');
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
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Vị trí hàng chờ',
      key: 'queue_location',
      width: 130,
      render: (_: unknown, r: ReservationRecord) =>
        r.status === 'pending' && r.pickup_type === 'online' ? (
          <Tooltip title="Phải xác nhận Có sách đúng theo thứ tự hàng chờ">
            <Tag color="blue">Hạng chờ #{r.actual_queue_position}</Tag>
          </Tooltip>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      title: 'Vị trí kho',
      key: 'shelf_location',
      width: 120,
      render: (_: unknown, r: ReservationRecord) =>
        r.shelf_location ? (
          <Tag color="geekblue">{r.shelf_location}</Tag>
        ) : (
          <span className="text-gray-300 text-xs">Chưa xác định</span>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
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
      title: 'Hạn nhận sách',
      dataIndex: 'pickup_deadline',
      key: 'pickup_deadline',
      width: 120,
      render: (v: string | null) =>
        v ? (
          <span className={dayjs(v).isBefore(dayjs()) ? 'text-red-500' : 'text-gray-600'}>
            {dayjs(v).format('DD/MM/YYYY HH:mm')}
          </span>
        ) : (
          <span className="text-gray-300 text-xs">—</span>
        ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: unknown, r: ReservationRecord) => {
        const isCancelling =
          cancelMutation.isPending && cancelMutation.variables === r.reservation_id;

        return (
          <div className="flex flex-col gap-1 items-stretch">
            {r.status === 'pending' && r.pickup_type === 'online' && (
              <Tooltip title="Chọn bản sao sẽ giữ chỗ cho độc giả">
                <Button
                  size="small"
                  type="primary"
                  block
                  className="text-xs px-1"
                  style={{ background: '#059669', borderColor: '#059669' }}
                  onClick={() => handleOpenMarkReady(r)}
                >
                  Có sách
                </Button>
              </Tooltip>
            )}
            {(r.status === 'ready_for_pickup' ||
              (r.status === 'pending' && r.pickup_type === 'counter')) && (
              <Tooltip title="Xác nhận đã nhận sách">
                <Button
                  size="small"
                  type="primary"
                  block
                  className="text-xs px-1"
                  onClick={() =>
                    setConfirmModal({ open: true, reservation: r, copyId: null })
                  }
                >
                  Đã nhận
                </Button>
              </Tooltip>
            )}
            {(r.status === 'pending' || r.status === 'ready_for_pickup') && (
              <Button
                size="small"
                danger
                block
                className="text-xs px-1"
                onClick={() => handleCancel(r.reservation_id)}
                loading={isCancelling}
                disabled={cancelMutation.isPending && !isCancelling}
              >
                Hủy
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
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

                <Alert
                  type={selectedBook.available_copies > 0 ? 'info' : 'warning'}
                  showIcon
                  message={
                    selectedBook.available_copies > 0
                      ? 'Sách còn bản sẵn có — phiếu sẽ ở hình thức "Tại quầy", độc giả có thể đến nhận ngay.'
                      : 'Sách đã hết bản — phiếu sẽ ở hình thức "Online", xếp vào hàng chờ.'
                  }
                  className="mt-2"
                />
              </div>
            )}
          </div>

          {selectedBook && (
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
              <p className="m-0 mb-1 text-xs text-gray-500">Tìm kiếm</p>
              <Input.Search
                placeholder="Tên độc giả, mã thẻ, tên sách..."
                allowClear
                onSearch={(v) => {
                  setListKeyword(v.trim());
                  setListPage(1);
                }}
                style={{ width: 240 }}
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
                  { value: 'pending',          label: 'Đang chờ' },
                  { value: 'ready_for_pickup', label: 'Sẵn sàng nhận' },
                  { value: 'expired',          label: 'Hết hạn' },
                  { value: 'completed',        label: 'Đã hoàn thành' },
                  { value: 'cancelled',        label: 'Đã hủy' },
                ]}
              />
            </div>
            <div>
              <p className="m-0 mb-1 text-xs text-gray-500">Hàng chờ</p>
              <Select
                placeholder="Tất cả"
                value={listQueuePosition || undefined}
                onChange={(v) => {
                  setListQueuePosition(v ?? '');
                  setListPage(1);
                }}
                allowClear
                style={{ width: 130 }}
                options={Array.from({ length: 20 }, (_, i) => i + 1).map((n) => ({
                  value: String(n),
                  label: `Hàng chờ số ${n}`,
                }))}
              />
            </div>
            <div>
              <p className="m-0 mb-1 text-xs text-gray-500">Ngày đặt</p>
              <DatePicker.RangePicker
                onChange={(values) => {
                  setListDateRange(
                    values && values[0] && values[1]
                      ? [values[0].format('YYYY-MM-DD'), values[1].format('YYYY-MM-DD')]
                      : undefined
                  );
                  setListPage(1);
                }}
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
              scroll={{ x: 1200 }}
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
        title="Xác nhận đã nhận sách"
        onCancel={() => setConfirmModal({ open: false, reservation: null, copyId: null })}
        onOk={handleConfirm}
        okText="Xác nhận đã nhận sách"
        cancelText="Hủy"
        confirmLoading={confirmMutation.isPending}
        okButtonProps={{
          disabled: needsCopyPicker && !confirmModal.copyId,
        }}
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

            {needsCopyPicker ? (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Chọn bản sao sẽ giao cho độc giả
                </p>
                <Select
                  placeholder="Chọn bản sao còn trống"
                  loading={confirmCopiesLoading}
                  value={confirmModal.copyId ?? undefined}
                  onChange={(v) => setConfirmModal((prev) => ({ ...prev, copyId: v }))}
                  style={{ width: '100%' }}
                  notFoundContent={confirmCopiesLoading ? <Spin size="small" /> : 'Không còn bản sao nào trống'}
                  options={(confirmCopies ?? []).map((c) => ({
                    value: c.copy_id,
                    label: `${c.barcode} — ${c.shelf_location ?? 'Chưa xác định vị trí'}`,
                  }))}
                />
              </div>
            ) : (
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-sm text-green-700">
                Bản sao đã được giữ sẵn cho phiếu này (Copy #{confirmModal.reservation.copy_id}
                {confirmModal.reservation.shelf_location
                  ? ` — vị trí ${confirmModal.reservation.shelf_location}`
                  : ''}
                ).
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Mark Ready Modal — thủ thư chọn đúng bản sao sẽ giữ chỗ cho hàng chờ */}
      <Modal
        open={markReadyModal.open}
        title="Xác nhận có sách — chọn bản sao giữ chỗ"
        onCancel={() => setMarkReadyModal({ open: false, reservation: null, copyId: null })}
        onOk={handleConfirmMarkReady}
        okText="Xác nhận giữ chỗ"
        cancelText="Hủy"
        confirmLoading={markReadyMutation.isPending}
        okButtonProps={{ disabled: !markReadyModal.copyId }}
      >
        {markReadyModal.reservation && (
          <div className="space-y-4 mt-2">
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Độc giả</span>
                <span className="font-medium">{markReadyModal.reservation.full_name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sách</span>
                <span className="font-medium truncate max-w-[200px]">
                  {markReadyModal.reservation.title}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Chọn bản sao dành cho độc giả</p>
              <Select
                placeholder="Chọn bản sao còn trống"
                loading={markReadyCopiesLoading}
                value={markReadyModal.copyId ?? undefined}
                onChange={(v) => setMarkReadyModal((prev) => ({ ...prev, copyId: v }))}
                style={{ width: '100%' }}
                notFoundContent={markReadyCopiesLoading ? <Spin size="small" /> : 'Không còn bản sao nào trống'}
                options={(markReadyCopies ?? []).map((c) => ({
                  value: c.copy_id,
                  label: `${c.barcode} — ${c.shelf_location ?? 'Chưa xác định vị trí'}`,
                }))}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReservationPage;
