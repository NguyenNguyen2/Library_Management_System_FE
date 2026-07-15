import { Badge, Button, Card, Col, Flex, Modal, Row, Segmented, Skeleton, Space, Statistic, Table, TableColumnsType, Tabs, Tag, Tooltip, Typography } from 'antd';
import {
  ArrowRightOutlined,
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  FieldTimeOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  RiseOutlined,
  SwapOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import LineChart from '@shared/components/chart/LineChart';
import PieChart from '@shared/components/chart/PieChart';
import { dashboardHooks } from '../../hooks/useDashboard';
import { reportHooks } from '../../hooks/useReport';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import { cn } from '@shared/constants/commonConst';
import { ITopBookItem, IOverdueRow } from '../../types/DashboardType';
import { ROUTES } from '../../constants/routers';

const { Text } = Typography;
const VND = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫';

const SEVERITY_TAG: Record<string, { color: string; label: string }> = {
  light:  { color: 'orange', label: '1–3 ngày' },
  medium: { color: 'volcano', label: '4–10 ngày' },
  heavy:  { color: 'red', label: '>10 ngày' },
};

const TODAY_BORROWS_COLUMNS = [
  {
    title: 'Mã phiếu',
    dataIndex: 'borrow_id',
    key: 'borrow_id',
    width: 90,
    render: (id: number) => <span className="text-gray-400">#{id}</span>,
  },
  {
    title: 'Độc giả',
    dataIndex: 'reader_name',
    key: 'reader_name',
    render: (name: string, record: any) => (
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-gray-400 text-xs">{record.reader_email}</div>
      </div>
    ),
  },
  {
    title: 'Sách mượn',
    dataIndex: 'books',
    key: 'books',
    render: (books: string) => <span className="font-medium text-gray-700">{books || '—'}</span>,
  },
  {
    title: 'Hạn trả',
    dataIndex: 'due_date',
    key: 'due_date',
    render: (d: string) => <span>{dayjs(d).format('DD/MM/YYYY')}</span>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const isBorrowing = status === 'borrowing';
      return (
        <Tag color={isBorrowing ? 'blue' : 'green'}>
          {isBorrowing ? 'Đang mượn' : 'Đã trả'}
        </Tag>
      );
    },
  },
];

const TODAY_RETURNS_COLUMNS = [
  {
    title: 'Mã phiếu',
    dataIndex: 'borrow_id',
    key: 'borrow_id',
    width: 90,
    render: (id: number) => <span className="text-gray-400">#{id}</span>,
  },
  {
    title: 'Độc giả',
    dataIndex: 'reader_name',
    key: 'reader_name',
    render: (name: string, record: any) => (
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-gray-400 text-xs">{record.reader_email}</div>
      </div>
    ),
  },
  {
    title: 'Tên sách',
    dataIndex: 'book_title',
    key: 'book_title',
    render: (title: string) => <span className="font-medium text-gray-700">{title}</span>,
  },
  {
    title: 'Giờ trả',
    dataIndex: 'return_date',
    key: 'return_date',
    render: (d: string) => <span>{dayjs(d).format('HH:mm')}</span>,
  },
  {
    title: 'Phí phạt',
    dataIndex: 'fine_amount',
    key: 'fine_amount',
    align: 'right' as const,
    render: (v: number) =>
      v > 0 ? (
        <Tag color="red" className="font-semibold">
          {v.toLocaleString('vi-VN')}đ
        </Tag>
      ) : (
        <span className="text-gray-400">—</span>
      ),
  },
];

const TODAY_RESERVATIONS_COLUMNS = [
  {
    title: 'Mã đặt trước',
    dataIndex: 'reservation_id',
    key: 'reservation_id',
    width: 100,
    render: (id: number) => <span className="text-gray-400">#{id}</span>,
  },
  {
    title: 'Độc giả',
    dataIndex: 'reader_name',
    key: 'reader_name',
    render: (name: string, record: any) => (
      <div>
        <div className="font-semibold text-sm">{name}</div>
        <div className="text-gray-400 text-xs">{record.reader_email}</div>
      </div>
    ),
  },
  {
    title: 'Tên sách',
    dataIndex: 'book_title',
    key: 'book_title',
    render: (title: string) => <span className="font-medium text-gray-700">{title}</span>,
  },
  {
    title: 'Giờ đặt',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (d: string) => <span>{dayjs(d).format('HH:mm')}</span>,
  },
  {
    title: 'Hàng chờ',
    dataIndex: 'queue_position',
    key: 'queue_position',
    align: 'center' as const,
    render: (pos: number) => <Tag color="blue" className="font-semibold">{pos}</Tag>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      const colorMap: Record<string, string> = {
        waiting: 'orange',
        ready: 'cyan',
        completed: 'green',
        cancelled: 'red',
        expired: 'default',
      };
      const labelMap: Record<string, string> = {
        waiting: 'Đang chờ',
        ready: 'Sẵn sàng',
        completed: 'Đã nhận',
        cancelled: 'Đã hủy',
        expired: 'Hết hạn',
      };
      return (
        <Tag color={colorMap[status] ?? 'default'}>
          {labelMap[status] ?? status}
        </Tag>
      );
    },
  },
];

const DashboardPage = () => {
  const { user } = useGlobalVariable();
  const navigate = useNavigate();
  const [borrowRange, setBorrowRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [topTab, setTopTab] = useState<'borrowed' | 'reserved'>('borrowed');
  const [isTodayModalOpen, setIsTodayModalOpen] = useState<boolean>(false);
  const { data: todayReportData, isLoading: todayReportLoading } = reportHooks.useTodayReport();

  const buildTodayPdfUrl = (): string => {
    const base = import.meta.env.VITE_API_URL as string;
    return `${base}/private/v1/reports/export/today-pdf`;
  };

  const buildTodayCsvUrl = (): string => {
    const base = import.meta.env.VITE_API_URL as string;
    return `${base}/private/v1/reports/export/today-csv`;
  };

  // ─── Data ─────────────────────────────────────────────────────────────
  const { data: legacyData, isLoading: legacyLoading } = dashboardHooks.useFetchDashboard();
  const { data: summary, isLoading: summaryLoading }   = dashboardHooks.useSummary();
  const { data: borrowStats, isLoading: borrowLoading } = dashboardHooks.useBorrowStats(borrowRange);
  const { data: topBooks, isLoading: topLoading }       = dashboardHooks.useTopBooks();
  const { data: overdueData, isLoading: overdueLoading }= dashboardHooks.useOverdueList();

  const inventoryData = legacyData?.inventoryData ?? [];
  const totalInventory = inventoryData.reduce((s, i) => s + i.value, 0);

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // ─── KPI cards ────────────────────────────────────────────────────────
  const kpiCards = [
    {
      title: 'Tổng đầu sách',
      value: formatNumber(summary?.total_books ?? 0),
      sub: `${formatNumber(summary?.total_copies ?? 0)} bản sao`,
      icon: <BookOutlined style={{ fontSize: 18 }} />,
      color: 'text-blue-600 bg-blue-50',
      border: '4px solid #1A56DB',
    },
    {
      title: 'Đang được mượn',
      value: formatNumber(summary?.active_borrows ?? 0),
      sub: 'bản sao chưa trả',
      icon: <TeamOutlined style={{ fontSize: 18 }} />,
      color: 'text-emerald-600 bg-emerald-50',
      border: '4px solid #10B981',
    },
    {
      title: 'Sách quá hạn (bản)',
      value: formatNumber(summary?.overdue_users ?? 0),
      sub: 'độc giả cần xử lý',
      icon: <WarningOutlined style={{ fontSize: 18 }} />,
      color: 'text-red-600 bg-red-50',
      border: '4px solid #EF4444',
      isOverdue: true,
    },
    {
      title: 'Tiền phạt chưa thu',
      value: VND(summary?.total_fines_unpaid ?? 0),
      sub: 'tổng nợ phí phạt',
      icon: <DollarOutlined style={{ fontSize: 18 }} />,
      color: 'text-orange-600 bg-orange-50',
      border: '4px solid #F97316',
    },
    {
      title: 'Đặt trước đang chờ',
      value: formatNumber(summary?.total_reservations ?? 0),
      sub: 'waiting + ready',
      icon: <FieldTimeOutlined style={{ fontSize: 18 }} />,
      color: 'text-purple-600 bg-purple-50',
      border: '4px solid #8B5CF6',
    },
    {
      title: 'Giao dịch hôm nay',
      value: formatNumber(summary?.transactions_today ?? 0),
      sub: dayjs().format('DD/MM/YYYY'),
      icon: <CalendarOutlined style={{ fontSize: 18 }} />,
      color: 'text-sky-600 bg-sky-50',
      border: '4px solid #0EA5E9',
    },
  ];

  // ─── Borrow trend chart data ───────────────────────────────────────────
  const series = borrowStats?.series ?? [];
  const chartCategories = series.map((d) => dayjs(d.date).format('DD/MM'));
  const borrowSeries = [
    { name: 'Mượn', data: series.map((d) => d.borrow), color: '#2563EB' },
    { name: 'Trả',  data: series.map((d) => d.return), color: '#10B981' },
  ];

  // ─── Overdue table columns ─────────────────────────────────────────────
  const overdueCols: TableColumnsType<IOverdueRow> = [
    {
      title: 'Độc giả',
      key: 'reader',
      render: (_, r) => (
        <div>
          <p className="m-0 text-sm font-medium text-navyDark">{r.full_name}</p>
          <p className="m-0 text-xs text-gray-400">{r.card_number ?? r.email}</p>
        </div>
      ),
    },
    { title: 'Sách', dataIndex: 'title', key: 'title', ellipsis: true },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 110,
      render: (v: string) => (
        <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{v}</span>
      ),
    },
    {
      title: 'Quá hạn',
      dataIndex: 'overdue_days',
      key: 'overdue_days',
      width: 90,
      sorter: (a, b) => b.overdue_days - a.overdue_days,
      render: (v: number, r: IOverdueRow) => (
        <Tooltip title={SEVERITY_TAG[r.severity].label}>
          <Tag color={SEVERITY_TAG[r.severity].color}>{v} ngày</Tag>
        </Tooltip>
      ),
    },
    {
      title: 'Phí phạt',
      dataIndex: 'fine_amount',
      key: 'fine_amount',
      width: 120,
      sorter: (a, b) => b.fine_amount - a.fine_amount,
      render: (v: number) => <span className="text-red-600 font-semibold">{VND(v)}</span>,
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_: unknown, r: IOverdueRow) => (
        <Tooltip title="Xem lịch sử độc giả">
          <Button
            size="small"
            type="text"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(ROUTES.USER_HISTORY.replace(':userId', String(r.user_id)))}
          />
        </Tooltip>
      ),
    },
  ];

  // ─── Top books list ────────────────────────────────────────────────────
  const displayedTopBooks: ITopBookItem[] =
    topTab === 'borrowed'
      ? (topBooks?.top_borrowed ?? [])
      : (topBooks?.top_reserved ?? []);

  const rankStyle = (rank: number) =>
    rank === 1
      ? 'bg-amber-100 text-amber-700'
      : rank === 2
      ? 'bg-gray-200 text-gray-700'
      : rank === 3
      ? 'bg-orange-100 text-orange-700'
      : 'bg-blue-50 text-blue-600';

  return (
    <div className="flex flex-col gap-6 text-left max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="m-0 text-[28px] font-bold leading-[34px] text-navyDark">
            Xin chào, {user?.name ?? 'Admin'} 👋
          </h1>
          <p className="m-0 mt-1 text-sm text-grayDark">{today}</p>
        </div>
        <button
          onClick={() => setIsTodayModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 h-10 shadow cursor-pointer border-0 transition-colors"
        >
          <BarChartOutlined className="mr-2" /> Tạo báo cáo hôm nay
        </button>
      </div>

      {/* KPI Cards — 3 columns × 2 rows */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((c) => (
          <Card
            key={c.title}
            className="!rounded-[10px] border border-gray-200 shadow-sm"
            style={{ borderLeft: c.border }}
            bodyStyle={{ padding: '16px' }}
            loading={summaryLoading}
          >
            <Flex justify="space-between" align="start">
              <Text className="text-[10px] text-gray-500 uppercase tracking-wide font-medium leading-tight">
                {c.title}
              </Text>
              <div className={cn('flex size-7 items-center justify-center rounded-lg shrink-0', c.color)}>
                {c.icon}
              </div>
            </Flex>
            <div className="mt-2 flex items-center gap-1.5">
              <Text className="!text-[20px] !font-bold text-navyDark leading-none">{c.value}</Text>
              {c.isOverdue && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </div>
            <Text className="text-[11px] text-gray-400 mt-1 block">{c.sub}</Text>
          </Card>
        ))}
      </div>

      {/* Borrow Chart + Inventory Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card
          className="lg:col-span-2 !rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={borrowLoading}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="m-0 text-sm font-semibold text-navyDark">Lượt mượn &amp; trả theo ngày</h3>
              <p className="m-0 text-xs text-gray-500 mt-0.5">Theo dõi hoạt động giao dịch hàng ngày</p>
            </div>
            <Segmented
              size="small"
              value={borrowRange}
              onChange={(v) => setBorrowRange(v as '7d' | '30d' | '90d')}
              options={[
                { label: '7 ngày', value: '7d' },
                { label: '30 ngày', value: '30d' },
                { label: '90 ngày', value: '90d' },
              ]}
            />
          </div>
          <LineChart
            categories={chartCategories}
            series={borrowSeries}
            height={260}
            showLegend
          />
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={legacyLoading}
        >
          <h3 className="m-0 text-sm font-semibold text-navyDark">Trạng thái kho bản sao</h3>
          <p className="m-0 text-xs text-gray-500 mt-0.5 mb-3">Tổng {formatNumber(totalInventory)} bản</p>
          <PieChart data={inventoryData.map((d) => ({ label: d.name, value: d.value, color: d.color }))} height={180} showLegend={false} />
          <div className="space-y-1.5 mt-4">
            {inventoryData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="text-gray-900 font-semibold">{formatNumber(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Books + Reservation Flow + Overdue Severity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Top Books */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={topLoading}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="m-0 text-sm font-semibold text-navyDark">Top 10 sách</h3>
            <Segmented
              size="small"
              value={topTab}
              onChange={(v) => setTopTab(v as 'borrowed' | 'reserved')}
              options={[
                { label: 'Mượn nhiều', value: 'borrowed' },
                { label: 'Đặt nhiều', value: 'reserved' },
              ]}
            />
          </div>
          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
            {displayedTopBooks.map((b) => (
              <div key={b.book_id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                <div className={cn('w-6 h-6 rounded flex items-center justify-center text-[11px] font-bold shrink-0', rankStyle(b.rank))}>
                  {b.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs truncate m-0 font-medium text-navyDark">{b.title}</p>
                  <p className="text-[11px] text-gray-400 truncate m-0">{b.author || '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-navyDark m-0">
                    {topTab === 'borrowed' ? b.borrow_count : b.reservation_count}
                  </p>
                  <p className="text-[10px] text-gray-400 m-0">{topTab === 'borrowed' ? 'lượt' : 'đặt'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Reservation Flow */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={summaryLoading}
        >
          <h3 className="m-0 text-sm font-semibold text-navyDark mb-4">
            <FieldTimeOutlined className="mr-1.5 text-purple-500" />
            Luồng đặt trước sách
          </h3>
          {summary && (() => {
            const flow = summary.reservation_flow;
            const total = Object.values(flow).reduce((s, v) => s + v, 0) || 1;
            const items = [
              { key: 'pending',          label: 'Đang chờ',      color: '#3B82F6', value: flow.pending },
              { key: 'ready_for_pickup', label: 'Sẵn sàng nhận', color: '#10B981', value: flow.ready_for_pickup },
              { key: 'completed',        label: 'Đã hoàn thành', color: '#8B5CF6', value: flow.completed },
              { key: 'expired',          label: 'Hết hạn',       color: '#9CA3AF', value: flow.expired },
              { key: 'cancelled',        label: 'Đã huỷ',        color: '#EF4444', value: flow.cancelled },
            ];
            return (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.round((item.value / total) * 100)}%`, background: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="mt-5 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Mức độ quá hạn
            </h4>
            {summary && (() => {
              const sev = summary.overdue_severity;
              const sevItems = [
                { label: '1–3 ngày (nhẹ)',     color: '#F97316', value: sev.light },
                { label: '4–10 ngày (trung)',   color: '#EF4444', value: sev.medium },
                { label: '>10 ngày (nặng)',     color: '#7F1D1D', value: sev.heavy },
              ];
              return (
                <div className="flex gap-3 flex-wrap">
                  {sevItems.map((s) => (
                    <div key={s.label} className="flex-1 min-w-[80px] rounded-lg p-2.5 text-center" style={{ background: s.color + '18' }}>
                      <p className="text-[18px] font-bold m-0" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-[10px] text-gray-500 m-0 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </Card>

        {/* Finance Overview */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={summaryLoading}
        >
          <h3 className="m-0 text-sm font-semibold text-navyDark mb-4">
            <DollarOutlined className="mr-1.5 text-orange-500" />
            Tổng quan tài chính
          </h3>
          {summary && (
            <div className="space-y-3">
              <div className="rounded-xl bg-red-50 border border-red-100 p-3.5">
                <p className="text-xs text-red-500 m-0 font-medium uppercase tracking-wide">Chưa thu được</p>
                <p className="text-xl font-bold text-red-600 m-0 mt-1">
                  {VND(summary.total_fines_unpaid)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
                  <p className="text-[10px] text-orange-500 m-0 font-medium">Phí/ngày</p>
                  <p className="text-base font-bold text-orange-700 m-0 mt-0.5">
                    {VND(summary.fine_per_day)}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                  <p className="text-[10px] text-blue-500 m-0 font-medium">Đặt trước</p>
                  <p className="text-base font-bold text-blue-700 m-0 mt-0.5">
                    {summary.total_reservations}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-3.5">
                <p className="text-xs text-gray-500 m-0 font-medium">
                  <ClockCircleOutlined className="mr-1" />
                  Độc giả quá hạn cần liên hệ
                </p>
                <p className="text-xl font-bold text-navyDark m-0 mt-1">
                  {summary.overdue_users}
                  <span className="text-xs text-gray-400 font-normal ml-1">người</span>
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Full Overdue Table */}
      <Card
        className="!rounded-[10px] border border-gray-200 shadow-sm"
        bodyStyle={{ padding: '20px' }}
        loading={overdueLoading}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-500" style={{ fontSize: 16 }} />
            <h3 className="m-0 text-sm font-semibold text-navyDark">Sách đang quá hạn</h3>
            {overdueData && (
              <div className="flex gap-1.5 ml-2">
                <Tag color="orange">{overdueData.summary.light} nhẹ</Tag>
                <Tag color="volcano">{overdueData.summary.medium} trung bình</Tag>
                <Tag color="red">{overdueData.summary.heavy} nặng</Tag>
              </div>
            )}
          </div>
          <Badge
            count={overdueData?.summary.total ?? 0}
            style={{ backgroundColor: '#EF4444' }}
          />
        </div>

        <Table<IOverdueRow>
          dataSource={overdueData?.rows ?? []}
          columns={overdueCols}
          rowKey={(r) => `${r.borrow_id}-${r.barcode}`}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="small"
          rowClassName={(r) =>
            r.severity === 'heavy'
              ? 'bg-red-50'
              : r.severity === 'medium'
              ? 'bg-orange-50'
              : ''
          }
        />
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          MODAL BÁO CÁO HÔM NAY (MƯỢN, TRẢ, ĐẶT TRƯỚC HÔM NAY)
      ═══════════════════════════════════════════════════════════════════ */}
      <Modal
        title={
          <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <RiseOutlined className="text-blue-600" />
            Báo cáo hoạt động ngày hôm nay ({dayjs().format('DD/MM/YYYY')})
          </div>
        }
        open={isTodayModalOpen}
        onCancel={() => setIsTodayModalOpen(false)}
        width={900}
        footer={[
          <Button
            key="pdf"
            icon={<FilePdfOutlined />}
            onClick={() => window.open(buildTodayPdfUrl(), '_blank')}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            Xuất PDF
          </Button>,
          <Button
            key="csv"
            icon={<FileExcelOutlined />}
            onClick={() => window.open(buildTodayCsvUrl(), '_blank')}
            style={{ color: '#16a34a', borderColor: '#16a34a', background: '#f0fdf4' }}
            className="hover:bg-green-100"
          >
            Xuất Excel
          </Button>,
          <Button key="close" onClick={() => setIsTodayModalOpen(false)}>
            Đóng
          </Button>
        ]}
        className="rounded-lg overflow-hidden"
      >
        {todayReportLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : (
          <div className="flex flex-col gap-6 py-4">
            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  className="bg-blue-50 border-t-4 border-blue-500 rounded-lg shadow-sm"
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span className="text-blue-700 font-medium">Lượt mượn hôm nay</span>}
                    value={todayReportData?.summary?.total_borrows ?? 0}
                    valueStyle={{ color: '#1d4ed8', fontWeight: 700 }}
                    prefix={<RiseOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  className="bg-green-50 border-t-4 border-green-500 rounded-lg shadow-sm"
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span className="text-green-700 font-medium">Lượt trả hôm nay</span>}
                    value={todayReportData?.summary?.total_returns ?? 0}
                    valueStyle={{ color: '#047857', fontWeight: 700 }}
                    prefix={<SwapOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card
                  bordered={false}
                  className="bg-amber-50 border-t-4 border-amber-500 rounded-lg shadow-sm"
                  bodyStyle={{ padding: '16px' }}
                >
                  <Statistic
                    title={<span className="text-amber-700 font-medium">Đặt trước hôm nay</span>}
                    value={todayReportData?.summary?.total_reservations ?? 0}
                    valueStyle={{ color: '#b45309', fontWeight: 700 }}
                    prefix={<BookOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Tabs for details */}
            <Tabs
              defaultActiveKey="borrows"
              type="card"
              items={[
                {
                  key: 'borrows',
                  label: `Lượt mượn (${todayReportData?.summary?.total_borrows ?? 0})`,
                  children: (
                    <Table
                      dataSource={todayReportData?.details?.borrows ?? []}
                      columns={TODAY_BORROWS_COLUMNS}
                      rowKey="borrow_id"
                      pagination={{ pageSize: 5 }}
                      size="small"
                      bordered={false}
                      locale={{ emptyText: 'Không có lượt mượn nào trong ngày hôm nay' }}
                    />
                  ),
                },
                {
                  key: 'returns',
                  label: `Lượt trả (${todayReportData?.summary?.total_returns ?? 0})`,
                  children: (
                    <Table
                      dataSource={todayReportData?.details?.returns ?? []}
                      columns={TODAY_RETURNS_COLUMNS}
                      rowKey={(record) => `${record.borrow_id}-${record.book_title}`}
                      pagination={{ pageSize: 5 }}
                      size="small"
                      bordered={false}
                      locale={{ emptyText: 'Không có lượt trả nào trong ngày hôm nay' }}
                    />
                  ),
                },
                {
                  key: 'reservations',
                  label: `Đặt trước (${todayReportData?.summary?.total_reservations ?? 0})`,
                  children: (
                    <Table
                      dataSource={todayReportData?.details?.reservations ?? []}
                      columns={TODAY_RESERVATIONS_COLUMNS}
                      rowKey="reservation_id"
                      pagination={{ pageSize: 5 }}
                      size="small"
                      bordered={false}
                      locale={{ emptyText: 'Không có lượt đặt trước nào trong ngày hôm nay' }}
                    />
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

    </div>
  );
};

export default DashboardPage;
