import {
  Badge,
  Button,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import dayjs from 'dayjs';
import { renewHooks } from '../../hooks/useRenewBook';
import { reservationHooks } from '../../hooks/useReservation';
import { libraryCardRenewalHooks } from '../../hooks/useLibraryCardRenewal';
import { RenewListItem } from '../../api/renewApi';
import { ReservationRecord } from '../../api/reservationApi';
import { CardRenewalRequestItem } from '../../api/libraryCardRenewalApi';

const FMT = 'YYYY-MM-DD';

// Badge màu cho "ĐÃ GIA HẠN"
const RenewBadge = ({ count, max }: { count: number; max: number }) => {
  const label = `${count} / ${max}`;
  if (count === 0)
    return (
      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 min-w-[52px]">
        {label}
      </span>
    );
  if (count >= max)
    return (
      <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 min-w-[52px]">
        {label}
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-600 min-w-[52px]">
      {label}
    </span>
  );
};

const RESERVATION_STATUS: Record<string, { color: string; label: string }> = {
  pending:          { color: 'blue',    label: 'Đang chờ' },
  ready_for_pickup: { color: 'green',   label: 'Sẵn sàng nhận' },
  completed:        { color: 'purple',  label: 'Đã hoàn thành' },
  expired:          { color: 'default', label: 'Hết hạn' },
  cancelled:        { color: 'red',     label: 'Đã huỷ' },
};

const RenewBookPage = () => {
  const [activeTab, setActiveTab] = useState<'renew' | 'reservation' | 'card'>('renew');

  const { data: renewData, isLoading: renewLoading } = renewHooks.useRenewList();
  const renewMutation = renewHooks.useRenewBook();
  const rejectMutation = renewHooks.useRejectBook();

  const { data: reservationData, isLoading: resLoading } =
    reservationHooks.useListReservations({ page: 1, per_page: 50 });

  const { data: cardRequests, isLoading: cardLoading } = libraryCardRenewalHooks.useRequests();
  const cardApproveMutation = libraryCardRenewalHooks.useApprove();
  const cardRejectMutation = libraryCardRenewalHooks.useReject();

  const renewList = renewData?.objects ?? [];
  const maxRenewTimes = renewData?.meta.max_renew_times ?? 2;
  const reservationList = reservationData?.objects ?? [];
  const cardRequestList = cardRequests ?? [];

  // ─── Card renewal approve/reject ──────────────────────────────────────
  const handleCardApprove = (row: CardRenewalRequestItem) => {
    cardApproveMutation.mutate(
      { id: row.request_id },
      {
        onSuccess: () => message.success(`Đã duyệt gia hạn thẻ cho "${row.full_name}"`),
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Duyệt thất bại.');
        },
      }
    );
  };

  const handleCardReject = (row: CardRenewalRequestItem) => {
    cardRejectMutation.mutate(
      { id: row.request_id },
      {
        onSuccess: () => message.success(`Đã từ chối yêu cầu gia hạn thẻ của "${row.full_name}"`),
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Từ chối thất bại.');
        },
      }
    );
  };

  const cardCols: TableColumnsType<CardRenewalRequestItem> = [
    {
      title: 'ĐỘC GIẢ',
      key: 'reader',
      render: (_: unknown, r: CardRenewalRequestItem) => (
        <div>
          <p className="m-0 text-sm font-medium text-gray-800">{r.full_name}</p>
          <p className="m-0 text-xs text-gray-400 font-mono">{r.card_number}</p>
        </div>
      ),
    },
    {
      title: 'HẾT HẠN HIỆN TẠI',
      dataIndex: 'current_expiry_date',
      key: 'current_expiry_date',
      width: 140,
      render: (v: string) => <span className="text-gray-500">{dayjs(v).format(FMT)}</span>,
    },
    {
      title: 'HẾT HẠN MỚI (YÊU CẦU)',
      dataIndex: 'requested_expiry_date',
      key: 'requested_expiry_date',
      width: 160,
      render: (v: string) => <span className="text-blue-600 font-medium">{dayjs(v).format(FMT)}</span>,
    },
    {
      title: 'NGÀY YÊU CẦU',
      dataIndex: 'requested_at',
      key: 'requested_at',
      width: 140,
      render: (v: string) => <span className="text-gray-500">{dayjs(v).format(FMT)}</span>,
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 200,
      align: 'right',
      render: (_: unknown, r: CardRenewalRequestItem) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="small"
            icon={<CheckCircleOutlined />}
            loading={cardApproveMutation.isPending}
            onClick={() => handleCardApprove(r)}
            style={{
              background: '#16a34a',
              borderColor: '#16a34a',
              color: '#fff',
              fontWeight: 600,
              borderRadius: 6,
            }}
          >
            Duyệt
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseCircleOutlined />}
            loading={cardRejectMutation.isPending}
            onClick={() => handleCardReject(r)}
            style={{ fontWeight: 600, borderRadius: 6 }}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  // ─── Renew per row ────────────────────────────────────────────────────
  const handleApprove = (row: RenewListItem) => {
    renewMutation.mutate(
      { user_id: row.user_id, copy_ids: [row.copy_id], extend_days: 7 },
      {
        onSuccess: () => message.success(`Đã gia hạn +7 ngày cho "${row.title}"`),
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Gia hạn thất bại.');
        },
      }
    );
  };

  const handleReject = (row: RenewListItem) => {
    rejectMutation.mutate(
      { requestId: row.request_id },
      {
        onSuccess: () => message.success(`Đã từ chối yêu cầu gia hạn của "${row.full_name}"`),
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Từ chối thất bại.');
        },
      }
    );
  };

  // ─── Renew table columns ──────────────────────────────────────────────
  const renewCols: TableColumnsType<RenewListItem> = [
    {
      title: 'MÃ GH',
      dataIndex: 'borrow_id',
      key: 'borrow_id',
      width: 90,
      render: (v: number) => (
        <span className="text-gray-400 text-xs">GH-{String(v).padStart(4, '0')}</span>
      ),
    },
    {
      title: 'ĐỘC GIẢ',
      key: 'reader',
      render: (_: unknown, r: RenewListItem) => (
        <span className="font-medium text-gray-800">{r.full_name}</span>
      ),
    },
    {
      title: 'SÁCH',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (v: string) => <span className="text-gray-700">{v}</span>,
    },
    {
      title: 'HẠN HIỆN TẠI',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (v: string) => {
        const isOverdue = dayjs(v).isBefore(dayjs(), 'day');
        return (
          <span className={isOverdue ? 'text-red-500 font-medium' : 'text-gray-600'}>
            {dayjs(v).format(FMT)}
          </span>
        );
      },
    },
    {
      title: 'NGÀY MƯỢN',
      dataIndex: 'borrow_date',
      key: 'borrow_date',
      width: 110,
      render: (v: string) => <span className="text-gray-500">{dayjs(v).format(FMT)}</span>,
    },
    {
      title: 'ĐÃ GIA HẠN',
      key: 'renew_count',
      width: 110,
      align: 'center',
      render: (_: unknown, r: RenewListItem) => (
        <RenewBadge count={r.renew_count} max={maxRenewTimes} />
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'action',
      width: 220,
      align: 'right',
      render: (_: unknown, r: RenewListItem) => (
        <div className="flex gap-2 justify-end">
          <Tooltip title={!r.can_renew ? (r.deny_reason ?? 'Không thể gia hạn') : undefined}>
            <Button
              size="small"
              icon={<CheckCircleOutlined />}
              disabled={!r.can_renew}
              loading={renewMutation.isPending}
              onClick={() => handleApprove(r)}
              style={{
                background: r.can_renew ? '#16a34a' : undefined,
                borderColor: r.can_renew ? '#16a34a' : undefined,
                color: r.can_renew ? '#fff' : undefined,
                fontWeight: 600,
                borderRadius: 6,
              }}
            >
              Duyệt +7 ngày
            </Button>
          </Tooltip>
          <Button
            size="small"
            danger
            icon={<CloseCircleOutlined />}
            loading={rejectMutation.isPending}
            onClick={() => handleReject(r)}
            style={{ fontWeight: 600, borderRadius: 6 }}
          >
            Từ chối
          </Button>
        </div>
      ),
    },
  ];

  // ─── Reservation table columns ────────────────────────────────────────
  const resCols: TableColumnsType<ReservationRecord> = [
    {
      title: 'ĐỘC GIẢ',
      key: 'reader',
      render: (_: unknown, r: ReservationRecord) => (
        <div>
          <p className="m-0 text-sm font-medium text-gray-800">{r.full_name}</p>
          {r.card_number && (
            <p className="m-0 text-xs text-gray-400 font-mono">{r.card_number}</p>
          )}
        </div>
      ),
    },
    {
      title: 'SÁCH',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'VỊ TRÍ HÀNG CHỜ',
      key: 'queue',
      width: 130,
      align: 'center',
      render: (_: unknown, r: ReservationRecord) => (
        <Badge
          count={r.actual_queue_position}
          showZero
          style={{ backgroundColor: '#7c3aed', fontWeight: 700 }}
        />
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (v: string) => {
        const cfg = RESERVATION_STATUS[v] ?? { color: 'default', label: v };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'NGÀY ĐẶT',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 110,
      render: (v: string) => <span className="text-gray-500">{dayjs(v).format(FMT)}</span>,
    },
    {
      title: 'HẠN NHẬN SÁCH',
      dataIndex: 'pickup_deadline',
      key: 'pickup_deadline',
      width: 110,
      render: (v: string | null) =>
        v ? (
          <span className="text-orange-500">{dayjs(v).format(FMT)}</span>
        ) : (
          <span className="text-gray-300">—</span>
        ),
    },
  ];

  const canRenewCount   = renewList.filter((r) => r.can_renew).length;
  const waitingResCount = reservationList.filter((r) => r.status === 'pending' || r.status === 'ready_for_pickup').length;

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="m-0 text-2xl font-bold text-navyDark">Gia hạn &amp; Đặt trước</h1>
        <p className="m-0 text-sm text-gray-500 mt-1">
          Xử lý yêu cầu gia hạn và quản lý hàng chờ đặt trước
        </p>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('renew')}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer',
            activeTab === 'renew'
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
          ].join(' ')}
          style={{ outline: 'none' }}
        >
          <SyncOutlined spin={renewLoading} />
          Yêu cầu gia hạn
          {renewList.length > 0 && (
            <span className={[
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              activeTab === 'renew' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
            ].join(' ')}>
              {renewList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reservation')}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer',
            activeTab === 'reservation'
              ? 'bg-purple-50 border-purple-200 text-purple-600'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
          ].join(' ')}
          style={{ outline: 'none' }}
        >
          <ClockCircleOutlined />
          Đặt trước
          {reservationList.length > 0 && (
            <span className={[
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              activeTab === 'reservation' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500',
            ].join(' ')}>
              {reservationList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('card')}
          className={[
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer',
            activeTab === 'card'
              ? 'bg-green-50 border-green-200 text-green-600'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50',
          ].join(' ')}
          style={{ outline: 'none' }}
        >
          <CreditCardOutlined />
          Gia hạn thẻ
          {cardRequestList.length > 0 && (
            <span className={[
              'text-xs px-1.5 py-0.5 rounded-full font-bold',
              activeTab === 'card' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
            ].join(' ')}>
              {cardRequestList.length}
            </span>
          )}
        </button>
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Tab 1: Yêu cầu gia hạn */}
        {activeTab === 'renew' && (
          <div className="p-5">
            {renewLoading ? (
              <div className="flex justify-center py-12"><Spin size="large" /></div>
            ) : (
              <Table<RenewListItem>
                dataSource={renewList}
                columns={renewCols}
                rowKey={(r) => `${r.borrow_id}-${r.copy_id}`}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="middle"
                locale={{ emptyText: 'Không có yêu cầu gia hạn sách nào' }}
                rowClassName={(r) =>
                  !r.can_renew ? 'opacity-60' : ''
                }
              />
            )}
            {renewList.length > 0 && !renewLoading && (
              <p className="m-0 mt-3 text-xs text-gray-400">
                {canRenewCount} / {renewList.length} bản sao có thể gia hạn
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Đặt trước */}
        {activeTab === 'reservation' && (
          <div className="p-5">
            {resLoading ? (
              <div className="flex justify-center py-12"><Spin size="large" /></div>
            ) : (
              <Table<ReservationRecord>
                dataSource={reservationList}
                columns={resCols}
                rowKey="reservation_id"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="middle"
                locale={{ emptyText: 'Không có phiếu đặt trước nào' }}
                rowClassName={(r) =>
                  r.status === 'pending' || r.status === 'ready_for_pickup' ? 'bg-purple-50/30' : ''
                }
              />
            )}
            {waitingResCount > 0 && !resLoading && (
              <p className="m-0 mt-3 text-xs text-purple-500">
                {waitingResCount} phiếu đang chờ / sẵn sàng được xử lý
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Gia hạn thẻ */}
        {activeTab === 'card' && (
          <div className="p-5">
            {cardLoading ? (
              <div className="flex justify-center py-12"><Spin size="large" /></div>
            ) : (
              <Table<CardRenewalRequestItem>
                dataSource={cardRequestList}
                columns={cardCols}
                rowKey="request_id"
                pagination={{ pageSize: 10, showSizeChanger: false }}
                size="middle"
                locale={{ emptyText: 'Không có yêu cầu gia hạn thẻ nào' }}
              />
            )}
            {cardRequestList.length > 0 && !cardLoading && (
              <p className="m-0 mt-3 text-xs text-gray-400">
                {cardRequestList.length} yêu cầu đang chờ duyệt
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewBookPage;
