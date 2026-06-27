import { useMemo, useState } from 'react';
import {
  Table, Tag, Tooltip, Space, Button, Empty, DatePicker, Spin,
} from 'antd';
import {
  ArrowUpOutlined, ArrowDownOutlined, SwapOutlined,
  PrinterOutlined, FileTextOutlined,
} from '@ant-design/icons';
import type { TableColumnsType } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { userApi, BorrowHistoryRow } from '../../api/userApi';
import { receiptApi } from '../../api/receiptApi';

const { RangePicker } = DatePicker;

// ── Types ────────────────────────────────────────────────────────────────────

type EventType = 'borrow' | 'return' | 'renew';
type TxStatus = 'active' | 'overdue' | 'returned_on_time' | 'overdue_returned';
type FilterType = '' | EventType;

interface HistoryTableRow {
  key: string;
  index: number;
  borrow_id: number;
  barcode: string;
  ma_gd: string;
  event_type: EventType;
  event_date: string;
  book_title: string;
  borrow_date: string;
  due_date: string;
  return_date: string | null;
  renew_count: number;
  tx_status: TxStatus;
  librarian_name: string | null;
  fine_amount: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const EVENT_CFG: Record<EventType, { label: string; color: string; icon: React.ReactNode }> = {
  borrow: { label: 'Mượn',    color: '#3B82F6', icon: <ArrowUpOutlined />   },
  return: { label: 'Trả',     color: '#10B981', icon: <ArrowDownOutlined /> },
  renew:  { label: 'Gia hạn', color: '#F59E0B', icon: <SwapOutlined />      },
};

const STATUS_CFG: Record<TxStatus, { label: string; color: string }> = {
  active:           { label: 'Đang mượn', color: 'blue'    },
  overdue:          { label: 'Quá hạn',   color: 'red'     },
  returned_on_time: { label: 'Đúng hạn',  color: 'green'   },
  overdue_returned: { label: 'Trễ hạn',   color: 'volcano' },
};

const TYPE_TABS: { key: FilterType; label: string }[] = [
  { key: '',       label: 'Tất cả'  },
  { key: 'borrow', label: 'Mượn'    },
  { key: 'return', label: 'Trả'     },
  { key: 'renew',  label: 'Gia hạn' },
];

function computeEventType(row: BorrowHistoryRow): EventType {
  if (row.return_date) return 'return';
  if (row.renew_count > 0) return 'renew';
  return 'borrow';
}

function computeTxStatus(row: BorrowHistoryRow): TxStatus {
  const due = dayjs(row.due_date);
  if (row.return_date) {
    return dayjs(row.return_date).isAfter(due, 'day') ? 'overdue_returned' : 'returned_on_time';
  }
  return dayjs().isAfter(due, 'day') ? 'overdue' : 'active';
}

function EventBadge({ type }: { type: EventType }) {
  const cfg = EVENT_CFG[type];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: cfg.color + '18', color: cfg.color, border: `1px solid ${cfg.color}40`,
      whiteSpace: 'nowrap',
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return <span className="text-gray-300">—</span>;
  return <span className="text-sm text-gray-600">{dayjs(d).format('DD/MM/YYYY')}</span>;
}

function formatVND(amount: number) {
  if (!amount) return <span className="text-gray-300">—</span>;
  return <span className="font-semibold text-red-500">{amount.toLocaleString('vi-VN')}đ</span>;
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  userName: string;
}

export default function UserHistoryTable({ userId, userName }: Props) {
  const [typeFilter, setTypeFilter] = useState<FilterType>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([null, null]);
  const [pdfLoading, setPdfLoading] = useState<Record<string, boolean>>({});

  const { data: rawRows = [], isLoading } = useQuery({
    queryKey: ['reader-history', userId],
    queryFn: () => userApi.getReaderBorrowHistory(userId),
    enabled: !!userId,
    staleTime: 15_000,
  });

  // Transform raw API rows → enriched table rows
  const allRows: HistoryTableRow[] = useMemo(() => {
    return rawRows.map((row, idx) => ({
      key: `${row.borrow_id}-${row.copy_barcode}-${idx}`,
      index: idx + 1,
      borrow_id: row.borrow_id,
      barcode: row.copy_barcode,
      ma_gd: `GD-${String(row.borrow_id).padStart(4, '0')}`,
      event_type: computeEventType(row),
      event_date: row.return_date ?? row.borrow_date,
      book_title: row.book_title,
      borrow_date: row.borrow_date,
      due_date: row.due_date,
      return_date: row.return_date,
      renew_count: row.renew_count,
      tx_status: computeTxStatus(row),
      librarian_name: row.librarian_name,
      fine_amount: row.fine_amount,
    }));
  }, [rawRows]);

  // Apply filters
  const filteredRows = useMemo(() => {
    const [from, to] = dateRange;
    return allRows.filter(row => {
      if (typeFilter && row.event_type !== typeFilter) return false;
      if (from && dayjs(row.event_date).isBefore(from, 'day')) return false;
      if (to && dayjs(row.event_date).isAfter(to, 'day')) return false;
      return true;
    });
  }, [allRows, typeFilter, dateRange]);

  const handlePdf = async (borrowId: number, eventType: EventType) => {
    const key = `${borrowId}-${eventType}`;
    setPdfLoading(prev => ({ ...prev, [key]: true }));
    try {
      if (eventType === 'borrow') {
        await receiptApi.getCheckoutReceipt(borrowId);
      } else if (eventType === 'return') {
        await receiptApi.getReturnReceipt(borrowId);
      }
    } finally {
      setPdfLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns: TableColumnsType<HistoryTableRow> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: 56,
      align: 'center',
      render: (_: unknown, __: HistoryTableRow, i: number) => (
        <span className="text-xs text-gray-400">{i + 1}</span>
      ),
    },
    {
      title: 'NGÀY GD',
      dataIndex: 'event_date',
      width: 110,
      sorter: (a, b) => dayjs(a.event_date).diff(dayjs(b.event_date)),
      defaultSortOrder: 'descend',
      render: (v: string) => formatDate(v),
    },
    {
      title: 'LOẠI',
      dataIndex: 'event_type',
      width: 110,
      render: (v: EventType) => <EventBadge type={v} />,
    },
    {
      title: 'MÃ PHIẾU',
      dataIndex: 'ma_gd',
      width: 96,
      render: (v: string) => (
        <span className="font-mono text-xs font-semibold text-gray-500">{v}</span>
      ),
    },
    {
      title: 'BARCODE',
      dataIndex: 'barcode',
      width: 110,
      render: (v: string) => (
        <span className="font-mono text-xs text-gray-500">{v}</span>
      ),
    },
    {
      title: 'NGÀY MƯỢN',
      dataIndex: 'borrow_date',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'HẠN TRẢ',
      dataIndex: 'due_date',
      width: 110,
      render: (v: string) => formatDate(v),
    },
    {
      title: 'NGÀY TRẢ',
      dataIndex: 'return_date',
      width: 110,
      render: (v: string | null) => formatDate(v),
    },
    {
      title: 'GIA HẠN',
      dataIndex: 'renew_count',
      width: 80,
      align: 'center',
      render: (v: number) =>
        v > 0
          ? <Tag color="orange" className="text-xs">{v} lần</Tag>
          : <span className="text-gray-300">—</span>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'tx_status',
      width: 120,
      render: (v: TxStatus) => {
        const cfg = STATUS_CFG[v] ?? { label: v, color: 'default' };
        return <Tag color={cfg.color} className="text-xs font-medium">{cfg.label}</Tag>;
      },
    },
    {
      title: 'THỦ THƯ',
      dataIndex: 'librarian_name',
      width: 140,
      render: (v: string | null) => (
        <span className="text-gray-500 text-sm">{v ?? 'Hệ thống'}</span>
      ),
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full">
      {/* User header */}
      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <h2 className="text-lg font-bold text-gray-800 m-0">
          Lịch sử giao dịch — {userName}
        </h2>
        <p className="text-sm text-gray-400 mt-0.5 mb-0">
          {allRows.length} giao dịch • {filteredRows.length} hiển thị
        </p>
      </div>

      {/* Filter bar */}
      <div className="px-6 py-3 border-b border-gray-100 shrink-0">
        <div className="flex flex-wrap gap-3 items-center">
          <Space size={4}>
            {TYPE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                style={{
                  padding: '4px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                  border: typeFilter === tab.key ? '1.5px solid #2563EB' : '1.5px solid #E5E7EB',
                  background: typeFilter === tab.key ? '#2563EB' : '#fff',
                  color: typeFilter === tab.key ? '#fff' : '#374151',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </Space>

          <RangePicker
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            onChange={range => setDateRange(range ? [range[0], range[1]] : [null, null])}
            style={{ width: 240 }}
            size="small"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Spin spinning={isLoading} tip="Đang tải...">
          <Table<HistoryTableRow>
            columns={columns}
            dataSource={filteredRows}
            rowKey="key"
            loading={false}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: total => `Tổng ${total} giao dịch`,
              size: 'small',
            }}
            scroll={{ x: 1200 }}
            size="small"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có giao dịch nào"
                />
              ),
            }}
            rowClassName={() => 'hover:bg-blue-50 transition-colors'}
          />
        </Spin>
      </div>
    </div>
  );
}
