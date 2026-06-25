import { useState, useCallback } from 'react';
import { Button, Input, Table, Tag, Tooltip, DatePicker, Space } from 'antd';
import { SearchOutlined, DownloadOutlined, ArrowUpOutlined, ArrowDownOutlined, SwapOutlined } from '@ant-design/icons';
import type { TableColumnsType, TablePaginationConfig } from 'antd';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  transactionLogApi,
  TransactionLogItem,
  TransactionLogParams,
  EventType,
  TxStatus,
} from '../../api/transactionLogApi';

// ── Helpers ────────────────────────────────────────────────────────────────

const EVENT_LABEL: Record<EventType, { label: string; color: string; icon: React.ReactNode }> = {
  borrow: { label: 'Mượn',   color: '#3B82F6', icon: <ArrowUpOutlined />   },
  return: { label: 'Trả',    color: '#10B981', icon: <ArrowDownOutlined /> },
  renew:  { label: 'Gia hạn', color: '#F59E0B', icon: <SwapOutlined />     },
};

const STATUS_LABEL: Record<TxStatus, { label: string; color: string }> = {
  active:            { label: 'Đang mượn', color: 'blue'    },
  overdue:           { label: 'Quá hạn',  color: 'red'     },
  returned_on_time:  { label: 'Đúng hạn', color: 'green'   },
  overdue_returned:  { label: 'Trễ hạn',  color: 'volcano' },
};

function EventBadge({ type }: { type: EventType }) {
  const cfg = EVENT_LABEL[type];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: cfg.color + '18',
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatVND(amount: number) {
  if (!amount) return '—';
  return amount.toLocaleString('vi-VN') + 'đ';
}

// ── Filter type tabs ────────────────────────────────────────────────────────

type FilterType = '' | 'borrow' | 'return' | 'renew';

const TYPE_TABS: { key: FilterType; label: string }[] = [
  { key: '',       label: 'Tất cả' },
  { key: 'borrow', label: 'Mượn'   },
  { key: 'return', label: 'Trả'    },
  { key: 'renew',  label: 'Gia hạn' },
];

// ── Main page ───────────────────────────────────────────────────────────────

export default function TransactionHistoryPage() {
  const [params, setParams] = useState<TransactionLogParams>({
    q: '',
    type: '',
    date: '',
    page: 1,
    per_page: 20,
  });
  const [searchText, setSearchText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transaction-log', params],
    queryFn: () => transactionLogApi.getList(params),
    staleTime: 15_000,
  });

  const items = data?.objects ?? [];
  const meta  = data?.meta;

  const setFilter = useCallback((patch: Partial<TransactionLogParams>) => {
    setParams(prev => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const handleSearch = () => setFilter({ q: searchText });

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams(prev => ({
      ...prev,
      page: pagination.current ?? 1,
      per_page: pagination.pageSize ?? 20,
    }));
  };

  // ── Columns ──────────────────────────────────────────────────────────────

  const columns: TableColumnsType<TransactionLogItem> = [
    {
      title: 'MÃ GD',
      dataIndex: 'ma_gd',
      width: 100,
      render: (v: string) => (
        <span className="font-mono text-xs font-semibold text-gray-600">{v}</span>
      ),
    },
    {
      title: 'THỜI GIAN',
      dataIndex: 'event_date',
      width: 130,
      render: (v: string) => (
        <span className="text-sm text-gray-500">{v}</span>
      ),
    },
    {
      title: 'LOẠI',
      dataIndex: 'event_type',
      width: 110,
      render: (v: EventType) => <EventBadge type={v} />,
    },
    {
      title: 'ĐỘC GIẢ',
      dataIndex: 'reader_name',
      width: 160,
      render: (v: string) => <span className="font-semibold text-gray-800">{v}</span>,
    },
    {
      title: 'SÁCH',
      dataIndex: 'book_title',
      ellipsis: { showTitle: false },
      render: (v: string) => (
        <Tooltip title={v}>
          <span className="text-gray-700">{v}</span>
        </Tooltip>
      ),
    },
    {
      title: 'THỦ THƯ',
      dataIndex: 'librarian_name',
      width: 150,
      render: (v: string) => <span className="text-gray-500 text-sm">{v}</span>,
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'tx_status',
      width: 120,
      render: (v: TxStatus) => {
        const cfg = STATUS_LABEL[v] ?? { label: v, color: 'default' };
        return <Tag color={cfg.color} className="text-xs font-medium">{cfg.label}</Tag>;
      },
    },
    {
      title: 'PHÍ',
      dataIndex: 'fine_amount',
      width: 100,
      align: 'right',
      render: (v: number) => (
        <span className={v > 0 ? 'font-semibold text-red-500' : 'text-gray-400'}>
          {formatVND(v)}
        </span>
      ),
    },
  ];

  // ── CSV Export (simple download) ─────────────────────────────────────────

  const handleExportCSV = () => {
    const header = 'Mã GD,Thời gian,Loại,Độc giả,Sách,Thủ thư,Trạng thái,Phí';
    const rows = items.map(r => [
      r.ma_gd,
      r.event_date,
      EVENT_LABEL[r.event_type]?.label ?? r.event_type,
      r.reader_name,
      `"${r.book_title.replace(/"/g, '""')}"`,
      r.librarian_name,
      STATUS_LABEL[r.tx_status]?.label ?? r.tx_status,
      r.fine_amount > 0 ? r.fine_amount : '',
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lich-su-giao-dich-${dayjs().format('YYYYMMDD')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Lịch sử giao dịch</h1>
          <p className="text-sm text-gray-500">Toàn bộ giao dịch mượn / trả / gia hạn</p>
        </div>
        <Button
          icon={<DownloadOutlined />}
          onClick={handleExportCSV}
          className="border-gray-300 text-gray-700 hover:border-gray-400"
        >
          Xuất CSV
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo mã, độc giả, sách..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            allowClear
            onClear={() => { setSearchText(''); setFilter({ q: '' }); }}
            style={{ width: 300 }}
          />

          {/* Type tabs */}
          <Space size={4}>
            {TYPE_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter({ type: tab.key })}
                style={{
                  padding: '5px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: params.type === tab.key ? '1.5px solid #2563EB' : '1.5px solid #E5E7EB',
                  background: params.type === tab.key ? '#2563EB' : '#fff',
                  color: params.type === tab.key ? '#fff' : '#374151',
                  transition: 'all 0.15s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </Space>

          {/* Date picker */}
          <DatePicker
            format="DD/MM/YYYY"
            placeholder="dd/mm/yyyy"
            onChange={d => setFilter({ date: d ? d.format('YYYY-MM-DD') : '' })}
            style={{ width: 150 }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table<TransactionLogItem>
          columns={columns}
          dataSource={items}
          rowKey={r => `${r.borrow_id}-${r.copy_id}`}
          loading={isLoading}
          pagination={{
            current: params.page,
            pageSize: params.per_page,
            total: meta?.total ?? 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
          size="middle"
          rowClassName={() => 'hover:bg-blue-50 transition-colors'}
        />
      </div>
    </div>
  );
}
