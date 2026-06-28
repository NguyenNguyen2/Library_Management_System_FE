import {
  Alert,
  Avatar,
  Card,
  Col,
  DatePicker,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import {
  AlertOutlined,
  BookOutlined,
  RiseOutlined,
  SwapOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import ColumnChart from '@shared/components/chart/ColumnChart';
import { reportHooks } from '../../hooks/useReport';
import { ReportGroupBy, TopBook, TopReader } from '../../types/ReportType';

const { RangePicker } = DatePicker;

// ── Constants ──────────────────────────────────────────────────────────────

const DEFAULT_FROM = dayjs().startOf('month').subtract(5, 'month');
const DEFAULT_TO   = dayjs();

const GROUP_OPTIONS: { label: string; value: ReportGroupBy }[] = [
  { label: 'Theo ngày',  value: 'day'   },
  { label: 'Theo tuần', value: 'week'  },
  { label: 'Theo tháng', value: 'month' },
];

const LIMIT_OPTIONS = [
  { label: 'Top 5',  value: 5  },
  { label: 'Top 10', value: 10 },
  { label: 'Top 20', value: 20 },
  { label: 'Top 50', value: 50 },
];

// ── Table columns cho Top Books ────────────────────────────────────────────

const TOP_BOOKS_COLUMNS = [
  {
    title: '#',
    dataIndex: 'rank',
    key: 'rank',
    width: 52,
    render: (rank: number) => (
      <Tag color={rank <= 3 ? 'gold' : 'default'} className="font-bold min-w-[28px] text-center">
        {rank}
      </Tag>
    ),
  },
  {
    title: 'Tên sách',
    dataIndex: 'title',
    key: 'title',
    render: (title: string, record: TopBook) => (
      <Space>
        <Avatar
          src={record.cover_image ?? undefined}
          icon={<BookOutlined />}
          shape="square"
          size={36}
          className="flex-shrink-0"
        />
        <span className="font-medium leading-tight">{title}</span>
      </Space>
    ),
  },
  {
    title: 'Tác giả',
    dataIndex: 'author_name',
    key: 'author_name',
    render: (v: string) => v || <span className="text-gray-400">—</span>,
  },
  {
    title: 'Thể loại',
    dataIndex: 'category_names',
    key: 'category_names',
    render: (v: string | null) =>
      v
        ? v.split(', ').map((cat) => (
            <Tag key={cat} className="mb-1">
              {cat}
            </Tag>
          ))
        : <span className="text-gray-400">—</span>,
  },
  {
    title: 'Lượt mượn',
    dataIndex: 'borrow_count',
    key: 'borrow_count',
    align: 'right' as const,
    render: (v: number) => (
      <Tag color="blue" className="font-semibold text-sm">
        {v}
      </Tag>
    ),
  },
];

// ── Table columns cho Top Readers (Phase 3A) ───────────────────────────────

const TOP_READERS_COLUMNS = [
  {
    title: '#',
    dataIndex: 'rank',
    key: 'rank',
    width: 52,
    render: (rank: number) => (
      <Tag color={rank <= 3 ? 'gold' : 'default'} className="font-bold min-w-[28px] text-center">
        {rank}
      </Tag>
    ),
  },
  {
    title: 'Độc giả',
    dataIndex: 'full_name',
    key: 'full_name',
    render: (name: string, record: TopReader) => (
      <Space>
        <Avatar
          src={record.avatar_url ?? undefined}
          icon={<TeamOutlined />}
          size={36}
          className="flex-shrink-0"
        />
        <span className="font-medium leading-tight">{name}</span>
      </Space>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (v: string) => <span className="text-gray-600 text-sm">{v}</span>,
  },
  {
    title: 'Lượt mượn',
    dataIndex: 'borrow_count',
    key: 'borrow_count',
    align: 'right' as const,
    render: (v: number) => (
      <Tag color="purple" className="font-semibold text-sm">
        {v}
      </Tag>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function ReportsPage() {
  // ── Shared state: date range dùng chung cho cả Phase 1, 2 và 3 ───────────
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([DEFAULT_FROM, DEFAULT_TO]);

  // ── Phase 1 state ─────────────────────────────────────────────────────────
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('month');

  // ── Phase 2 state ─────────────────────────────────────────────────────────
  const [topLimit, setTopLimit] = useState<number>(10);

  // ── Phase 3A state — limit riêng cho top readers ──────────────────────────
  const [readerLimit, setReaderLimit] = useState<number>(10);

  // ── Params cho các API call ───────────────────────────────────────────────
  const sharedDateParams = {
    from_date: dateRange[0].format('YYYY-MM-DD'),
    to_date:   dateRange[1].format('YYYY-MM-DD'),
  };

  const phase1Params = { ...sharedDateParams, group_by: groupBy };
  const phase2Params = { ...sharedDateParams, limit: topLimit };
  const phase3AParams = { ...sharedDateParams, limit: readerLimit };
  // Phase 3B chỉ cần date range — không có limit, không có group_by
  const phase3BParams = sharedDateParams;

  // ── React Query hooks ─────────────────────────────────────────────────────
  const {
    data:      txData,
    isLoading: txLoading,
    isError:   txError,
    error:     txErr,
  } = reportHooks.useTransactionReport(phase1Params);

  const {
    data:      topBooks,
    isLoading: topLoading,
    isError:   topError,
    error:     topErr,
  } = reportHooks.useTopBooks(phase2Params);

  const {
    data:      topReaders,
    isLoading: readersLoading,
    isError:   readersError,
    error:     readersErr,
  } = reportHooks.useTopReaders(phase3AParams);

  const {
    data:      registrations,
    isLoading: regLoading,
    isError:   regError,
    error:     regErr,
  } = reportHooks.useReaderRegistrations(phase3BParams);

  // ── Derived data cho Phase 1 chart ────────────────────────────────────────
  const summary      = txData?.summary;
  const chart        = txData?.chart ?? [];
  const p1Categories = chart.map((p) => p.label);
  const p1Series     = [
    { name: 'Lượt mượn', data: chart.map((p) => p.borrows) },
    { name: 'Lượt trả',  data: chart.map((p) => p.returns) },
  ];

  // ── Derived data cho Phase 2 chart ────────────────────────────────────────
  const books = topBooks ?? [];
  const p2Categories = books.map((b) =>
    b.title.length > 22 ? b.title.slice(0, 22) + '…' : b.title
  );
  const p2Series    = [{ name: 'Lượt mượn', data: books.map((b) => b.borrow_count) }];
  const p2Height    = Math.max(300, books.length * 42);

  // ── Derived data cho Phase 3A chart ──────────────────────────────────────
  // Cắt ngắn tên độc giả (tối đa 20 ký tự) tránh chart bị vỡ layout
  const readers = topReaders ?? [];
  const p3ACategories = readers.map((r) =>
    r.full_name.length > 20 ? r.full_name.slice(0, 20) + '…' : r.full_name
  );
  const p3ASeries = [{ name: 'Lượt mượn', data: readers.map((r) => r.borrow_count) }];
  const p3AHeight = Math.max(300, readers.length * 42);

  // ── Derived data cho Phase 3B chart ──────────────────────────────────────
  // Trend theo tháng — vertical column chart, trục X là thời gian
  const trend        = registrations ?? [];
  const p3BCategories = trend.map((t) => t.label);     // ['T7/2025', 'T8/2025', ...]
  const p3BSeries    = [{ name: 'Độc giả mới', data: trend.map((t) => t.count) }];

  // ── Handler ───────────────────────────────────────────────────────────────
  const handleRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values?.[0] && values?.[1]) {
      setDateRange([values[0], values[1]]);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">

      {/* ═══════════════════════════════════════════════════════════════════
          SHARED FILTER — date range dùng chung cho toàn trang
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <Typography.Title level={3} className="!mb-1">
            Báo cáo & Thống kê
          </Typography.Title>
          <Typography.Text type="secondary">
            Thống kê lượt mượn trả, sách nổi bật và tình trạng hiện tại
          </Typography.Text>
        </div>
        <RangePicker
          value={dateRange}
          onChange={handleRangeChange}
          format="DD/MM/YYYY"
          allowClear={false}
          maxDate={dayjs()}
          disabledDate={(d) => d.isAfter(dayjs())}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 1 — Báo cáo giao dịch mượn/trả
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">Báo cáo giao dịch mượn / trả</span>
            <Select
              value={groupBy}
              onChange={setGroupBy}
              options={GROUP_OPTIONS}
              className="w-[130px]"
              size="small"
            />
          </div>
        }
      >
        {txError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu giao dịch"
            description={(txErr as Error)?.message}
            className="mb-4"
          />
        )}

        {/* Summary cards */}
        <Row gutter={[12, 12]} className="mb-5">
          <Col xs={24} sm={12} lg={6}>
            <div className="border-l-4 border-blue-500 pl-3">
              {txLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                <Statistic
                  title="Tổng lượt mượn"
                  value={summary?.total_borrows ?? 0}
                  prefix={<RiseOutlined className="text-blue-500 mr-1" />}
                  valueStyle={{ fontWeight: 700 }}
                />
              )}
              <div className="text-xs text-gray-400 mt-1">Trong khoảng thời gian đã chọn</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="border-l-4 border-green-500 pl-3">
              {txLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                <Statistic
                  title="Tổng lượt trả"
                  value={summary?.total_returns ?? 0}
                  prefix={<SwapOutlined className="text-green-500 mr-1" />}
                  valueStyle={{ fontWeight: 700 }}
                />
              )}
              <div className="text-xs text-gray-400 mt-1">Trong khoảng thời gian đã chọn</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="border-l-4 border-purple-500 pl-3">
              {txLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                <Statistic
                  title="Đang mượn"
                  value={summary?.active_borrows ?? 0}
                  prefix={<BookOutlined className="text-purple-500 mr-1" />}
                  valueStyle={{ color: '#722ed1', fontWeight: 700 }}
                />
              )}
              <div className="text-xs text-gray-400 mt-1">Bản sao đang lưu thông</div>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="border-l-4 border-red-500 pl-3">
              {txLoading ? <Skeleton active paragraph={{ rows: 1 }} /> : (
                <Statistic
                  title="Quá hạn"
                  value={summary?.overdue ?? 0}
                  prefix={<AlertOutlined className="text-red-500 mr-1" />}
                  valueStyle={{ color: '#cf1322', fontWeight: 700 }}
                />
              )}
              <div className="text-xs text-red-400 mt-1">Giao dịch chưa trả và đã quá hạn</div>
            </div>
          </Col>
        </Row>

        {/* Chart mượn/trả */}
        {txLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ColumnChart
            categories={p1Categories}
            series={p1Series}
            height={300}
            columnWidth="55%"
          />
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 2 — Top sách được mượn nhiều nhất
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">
              Top sách được mượn nhiều nhất
            </span>
            <Select
              value={topLimit}
              onChange={setTopLimit}
              options={LIMIT_OPTIONS}
              className="w-[110px]"
              size="small"
            />
          </div>
        }
      >
        {topError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu top sách"
            description={(topErr as Error)?.message}
            className="mb-4"
          />
        )}

        {topLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <ColumnChart
              categories={p2Categories}
              series={p2Series}
              horizontal={true}
              height={p2Height}
              columnWidth="60%"
            />
            <Table
              dataSource={books}
              columns={TOP_BOOKS_COLUMNS}
              rowKey="book_id"
              pagination={false}
              size="small"
              className="mt-5"
              bordered={false}
              locale={{ emptyText: 'Không có dữ liệu trong khoảng thời gian đã chọn' }}
            />
          </>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 3A — Top độc giả mượn nhiều nhất
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">
              Top độc giả mượn nhiều nhất
            </span>
            <Select
              value={readerLimit}
              onChange={setReaderLimit}
              options={LIMIT_OPTIONS}
              className="w-[110px]"
              size="small"
            />
          </div>
        }
      >
        {readersError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu top độc giả"
            description={(readersErr as Error)?.message}
            className="mb-4"
          />
        )}

        {readersLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            {/* Horizontal bar chart — tên độc giả trục Y, lượt mượn trục X */}
            <ColumnChart
              categories={p3ACategories}
              series={p3ASeries}
              horizontal={true}
              height={p3AHeight}
              columnWidth="60%"
            />

            {/* Bảng chi tiết: #, Tên độc giả (Avatar + tên), Email, Lượt mượn */}
            <Table
              dataSource={readers}
              columns={TOP_READERS_COLUMNS}
              rowKey="user_id"
              pagination={false}
              size="small"
              className="mt-5"
              bordered={false}
              locale={{ emptyText: 'Không có dữ liệu trong khoảng thời gian đã chọn' }}
            />
          </>
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 3B — Xu hướng đăng ký độc giả mới theo tháng
          Dùng vertical ColumnChart (không horizontal) vì đây là time series:
          trục X = thời gian (tháng) đọc từ trái sang phải,
          trục Y = số độc giả — đây là cách đọc chart time series tự nhiên nhất.
          Không có Table vì dữ liệu theo tháng đã đủ rõ trên chart.
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex items-center gap-2">
            <TeamOutlined className="text-blue-500" />
            <span className="font-semibold text-base">
              Xu hướng đăng ký độc giả mới
            </span>
          </div>
        }
      >
        {regError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu đăng ký"
            description={(regErr as Error)?.message}
            className="mb-4"
          />
        )}

        {regLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ColumnChart
            categories={p3BCategories}
            series={p3BSeries}
            height={300}
            columnWidth="55%"
          />
        )}
      </Card>

    </div>
  );
}

export default ReportsPage;
