import {
  Alert,
  Badge,
  Button,
  Empty,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tabs,
  Tooltip,
} from 'antd';
import {
  ArrowLeftOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  FieldTimeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { historyHooks } from '../../hooks/useUserHistory';
import { receiptHooks } from '../../hooks/useReceipt';
import {
  CurrentBorrow,
  BorrowHistoryItem,
  FineHistoryItem,
  ReservationHistoryItem,
} from '../../api/historyApi';

const FMT = 'DD/MM/YYYY';
const VND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫';

const CONDITION_LABEL: Record<string, string> = {
  new:    'Mới',
  good:   'Tốt',
  old:    'Cũ',
  light:  'Hỏng nhẹ',
  heavy:  'Hỏng nặng',
  minor:  'Hư nhẹ',
  medium: 'Hư vừa',
  lost:   'Mất sách',
};

const RESERVATION_STATUS: Record<string, { label: string; color: string }> = {
  waiting:   { label: 'Đang chờ',    color: 'blue' },
  ready:     { label: 'Sẵn sàng',    color: 'green' },
  converted: { label: 'Đã mượn',     color: 'purple' },
  expired:   { label: 'Hết hạn',     color: 'default' },
  cancelled: { label: 'Đã huỷ',      color: 'red' },
};

const UserHistoryPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const uid = userId ? parseInt(userId, 10) : null;

  const { data, isLoading, isError, error } = historyHooks.useUserHistory(uid);
  const returnReceiptMutation = receiptHooks.useReturnReceipt();

  // ─── Column definitions ────────────────────────────────────────────────

  const currentBorrowCols: TableColumnsType<CurrentBorrow> = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
      render: (v: string) => (
        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{v}</span>
      ),
    },
    { title: 'Tên sách', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      width: 110,
      render: (v: string) => dayjs(v).format(FMT),
    },
    {
      title: 'Hạn trả',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 110,
      render: (v: string, row: CurrentBorrow) => (
        <span className={row.is_overdue ? 'text-red-600 font-semibold' : ''}>
          {dayjs(v).format(FMT)}
        </span>
      ),
    },
    {
      title: 'Quá hạn',
      dataIndex: 'overdue_days',
      key: 'overdue_days',
      width: 90,
      render: (v: number, row: CurrentBorrow) =>
        row.is_overdue ? (
          <Tag color="red" icon={<ExclamationCircleOutlined />}>
            {v} ngày
          </Tag>
        ) : (
          <Tag color="green">Đúng hạn</Tag>
        ),
    },
    {
      title: 'Gia hạn',
      dataIndex: 'renew_count',
      key: 'renew_count',
      width: 80,
      render: (v: number) => <span className="text-gray-500">{v} lần</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => (
        <Tag color={v === 'overdue' ? 'red' : 'blue'}>
          {v === 'overdue' ? 'Quá hạn' : 'Đang mượn'}
        </Tag>
      ),
    },
  ];

  const borrowHistoryCols: TableColumnsType<BorrowHistoryItem> = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 120,
      render: (v: string) => (
        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{v}</span>
      ),
    },
    { title: 'Tên sách', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Ngày mượn',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      width: 110,
      render: (v: string) => dayjs(v).format(FMT),
    },
    {
      title: 'Ngày trả',
      dataIndex: 'return_date',
      key: 'return_date',
      width: 110,
      render: (v: string, row: BorrowHistoryItem) => (
        <span className={row.overdue_days > 0 ? 'text-red-600' : 'text-green-700'}>
          {dayjs(v).format(FMT)}
        </span>
      ),
    },
    {
      title: 'Quá hạn',
      dataIndex: 'overdue_days',
      key: 'overdue_days',
      width: 90,
      render: (v: number) =>
        v > 0 ? (
          <Tag color="red">{v} ngày</Tag>
        ) : (
          <Tag color="green">Đúng hạn</Tag>
        ),
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition_return',
      key: 'condition_return',
      width: 110,
      render: (v: string) =>
        v ? <Tag>{CONDITION_LABEL[v] ?? v}</Tag> : <span className="text-gray-400">—</span>,
    },
    {
      title: 'Phí phạt',
      dataIndex: 'fine_amount',
      key: 'fine_amount',
      width: 110,
      render: (v: number, row: BorrowHistoryItem) =>
        v > 0 ? (
          <Tooltip title={row.fine_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}>
            <Tag color={row.fine_status === 'paid' ? 'green' : 'red'}>{VND(v)}</Tag>
          </Tooltip>
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
    {
      title: '',
      key: 'receipt',
      width: 80,
      render: (_: unknown, row: BorrowHistoryItem) => (
        <Tooltip title="In biên lai trả">
          <Button
            size="small"
            type="text"
            loading={returnReceiptMutation.isPending}
            onClick={() => returnReceiptMutation.mutate(row.borrow_id)}
          >
            PDF
          </Button>
        </Tooltip>
      ),
    },
  ];

  const fineCols: TableColumnsType<FineHistoryItem> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'borrow_id',
      key: 'borrow_id',
      width: 90,
      render: (v: number) => <span className="font-mono">#{v}</span>,
    },
    {
      title: 'Sách',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string, row: FineHistoryItem) =>
        v ? (
          v
        ) : (
          <span className="text-gray-400 font-mono">{row.barcode ?? '—'}</span>
        ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (v: number) => <span className="font-semibold text-red-600">{VND(v)}</span>,
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (v: string) => v ?? <span className="text-gray-400">—</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: string) => (
        <Tag color={v === 'paid' ? 'green' : 'red'}>
          {v === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (v: string) => dayjs(v).format(FMT),
    },
  ];

  const reservationCols: TableColumnsType<ReservationHistoryItem> = [
    {
      title: 'Sách',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Vị trí hàng đợi',
      dataIndex: 'queue_position',
      key: 'queue_position',
      width: 120,
      render: (v: number) => <Badge count={v} showZero color="#6366f1" />,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: string) => {
        const cfg = RESERVATION_STATUS[v] ?? { label: v, color: 'default' };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (v: string) => dayjs(v).format(FMT),
    },
    {
      title: 'Hết hạn',
      dataIndex: 'expired_at',
      key: 'expired_at',
      width: 110,
      render: (v: string | null) =>
        v ? dayjs(v).format(FMT) : <span className="text-gray-400">—</span>,
    },
  ];

  // ─── Render ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        type="error"
        showIcon
        message="Không thể tải lịch sử"
        description={(error as any)?.response?.data?.message ?? 'Người dùng không tồn tại.'}
        action={
          <Button size="small" onClick={() => navigate(-1)}>
            Quay lại
          </Button>
        }
      />
    );
  }

  const overdueCount = data.current_borrows.filter((b) => b.is_overdue).length;
  const unpaidFines = data.fines.filter((f) => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="flex flex-col gap-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="shrink-0"
        />
        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
          <UserOutlined className="text-indigo-600" style={{ fontSize: 18 }} />
        </div>
        <div>
          <h1 className="m-0 text-lg font-bold text-navyDark leading-tight">
            Lịch sử: {data.user.full_name}
          </h1>
          <p className="m-0 text-xs text-gray-500 mt-0.5">
            {data.user.email}
            {data.user.card_number ? ` · Thẻ: ${data.user.card_number}` : ''}
          </p>
        </div>

        {/* Summary badges */}
        <div className="ml-auto flex gap-2 flex-wrap justify-end">
          {overdueCount > 0 && (
            <Tag color="red" icon={<ExclamationCircleOutlined />}>
              {overdueCount} quá hạn
            </Tag>
          )}
          {unpaidFines > 0 && (
            <Tag color="orange" icon={<DollarOutlined />}>
              Nợ {VND(unpaidFines)}
            </Tag>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Tabs
          defaultActiveKey="current"
          className="px-4"
          items={[
            {
              key: 'current',
              label: (
                <span className="flex items-center gap-1.5">
                  <BookOutlined />
                  Đang mượn
                  <Badge count={data.current_borrows.length} color={overdueCount > 0 ? 'red' : '#3b82f6'} />
                </span>
              ),
              children: (
                <div className="pb-4">
                  {data.current_borrows.length === 0 ? (
                    <Empty description="Không có sách đang mượn" className="py-8" />
                  ) : (
                    <Table<CurrentBorrow>
                      dataSource={data.current_borrows}
                      columns={currentBorrowCols}
                      rowKey={(r) => `${r.borrow_id}-${r.copy_id}`}
                      pagination={false}
                      size="small"
                      rowClassName={(r) => (r.is_overdue ? 'bg-red-50' : '')}
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'history',
              label: (
                <span className="flex items-center gap-1.5">
                  <ClockCircleOutlined />
                  Lịch sử mượn
                  <Badge count={data.history.length} color="#6b7280" />
                </span>
              ),
              children: (
                <div className="pb-4">
                  {data.history.length === 0 ? (
                    <Empty description="Chưa có sách nào đã trả" className="py-8" />
                  ) : (
                    <Table<BorrowHistoryItem>
                      dataSource={data.history}
                      columns={borrowHistoryCols}
                      rowKey={(r) => `${r.borrow_id}-${r.copy_id}`}
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      size="small"
                      rowClassName={(r) => (r.overdue_days > 0 ? 'bg-orange-50' : '')}
                    />
                  )}
                </div>
              ),
            },
            {
              key: 'fines',
              label: (
                <span className="flex items-center gap-1.5">
                  <DollarOutlined />
                  Tiền phạt
                  <Badge
                    count={data.fines.length}
                    color={data.fines.some((f) => f.status === 'unpaid') ? 'red' : '#6b7280'}
                  />
                </span>
              ),
              children: (
                <div className="pb-4">
                  {data.fines.length === 0 ? (
                    <Empty description="Không có phí phạt nào" className="py-8" />
                  ) : (
                    <>
                      {unpaidFines > 0 && (
                        <Alert
                          type="warning"
                          showIcon
                          className="mb-3"
                          message={`Còn nợ tổng cộng: ${VND(unpaidFines)}`}
                        />
                      )}
                      <Table<FineHistoryItem>
                        dataSource={data.fines}
                        columns={fineCols}
                        rowKey="fine_id"
                        pagination={{ pageSize: 10, showSizeChanger: false }}
                        size="small"
                        rowClassName={(r) => (r.status === 'unpaid' ? 'bg-red-50' : '')}
                      />
                    </>
                  )}
                </div>
              ),
            },
            {
              key: 'reservations',
              label: (
                <span className="flex items-center gap-1.5">
                  <FieldTimeOutlined />
                  Đặt trước
                  <Badge count={data.reservations.length} color="#6b7280" />
                </span>
              ),
              children: (
                <div className="pb-4">
                  {data.reservations.length === 0 ? (
                    <Empty description="Chưa có lịch sử đặt trước" className="py-8" />
                  ) : (
                    <Table<ReservationHistoryItem>
                      dataSource={data.reservations}
                      columns={reservationCols}
                      rowKey="reservation_id"
                      pagination={{ pageSize: 10, showSizeChanger: false }}
                      size="small"
                    />
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default UserHistoryPage;
