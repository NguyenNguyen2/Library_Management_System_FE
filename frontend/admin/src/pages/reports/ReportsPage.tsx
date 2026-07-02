import {
  Alert,
  Avatar,
  Button,
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
  Tooltip,
  Typography,
} from 'antd';
import {
  AlertOutlined,
  BookOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  RiseOutlined,
  SwapOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';
import ColumnChart from '@shared/components/chart/ColumnChart';
import { reportHooks } from '../../hooks/useReport';
import { ReportGroupBy, TopBook, TopAuthor, TopCategory, TopReader, OverdueBook, OverdueBookParams, OverdueStatus, FineRevenueParams, TopAuthorsParams, TopCategoriesParams } from '../../types/ReportType';

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

// ── Phase 4: filter mức độ nghiêm trọng quá hạn ──────────────────────────

const OVERDUE_STATUS_OPTIONS = [
  { label: 'Tất cả',          value: 'all'    },
  { label: 'Nhẹ (1–7 ngày)', value: 'low'    },
  { label: 'Vừa (8–30 ngày)', value: 'medium' },
  { label: 'Nặng (>30 ngày)', value: 'high'   },
];

const OVERDUE_TAG: Record<OverdueStatus, { color: string; label: string }> = {
  low:    { color: 'gold',   label: 'Nhẹ'   },
  medium: { color: 'orange', label: 'Vừa'   },
  high:   { color: 'red',    label: 'Nặng'  },
};

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

// ── Table columns cho Top Authors (Phase 2 — mở rộng) ─────────────────────

const TOP_AUTHORS_COLUMNS = [
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
    title: 'Tên tác giả',
    dataIndex: 'author_name',
    key: 'author_name',
    render: (name: string) => <span className="font-medium">{name || <span className="text-gray-400">—</span>}</span>,
  },
  {
    title: 'Lượt mượn',
    dataIndex: 'borrow_count',
    key: 'borrow_count',
    align: 'right' as const,
    render: (v: number) => (
      <Tag color="geekblue" className="font-semibold text-sm">
        {v}
      </Tag>
    ),
  },
];

// ── Table columns cho Top Categories (Phase 2 — mở rộng) ──────────────────

const TOP_CATEGORIES_COLUMNS = [
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
    title: 'Thể loại',
    dataIndex: 'category_name',
    key: 'category_name',
    render: (name: string) => <Tag className="text-sm">{name}</Tag>,
  },
  {
    title: 'Lượt mượn',
    dataIndex: 'borrow_count',
    key: 'borrow_count',
    align: 'right' as const,
    render: (v: number) => (
      <Tag color="cyan" className="font-semibold text-sm">
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

// ── Table columns cho Overdue Books (Phase 4) ─────────────────────────────

const OVERDUE_BOOKS_COLUMNS = [
  {
    title: 'Mã phiếu',
    dataIndex: 'borrow_id',
    key: 'borrow_id',
    width: 80,
    render: (id: number) => <span className="text-gray-400 text-sm">#{id}</span>,
  },
  {
    title: 'Độc giả',
    dataIndex: 'reader_name',
    key: 'reader_name',
    render: (name: string, record: OverdueBook) => (
      <Space direction="vertical" size={0}>
        <span className="font-medium leading-tight">{name}</span>
        <span className="text-gray-400 text-xs">{record.reader_email}</span>
      </Space>
    ),
  },
  {
    title: 'Tên sách',
    dataIndex: 'book_title',
    key: 'book_title',
    render: (title: string) => (
      <Space>
        <BookOutlined className="text-gray-400 flex-shrink-0" />
        <span>{title}</span>
      </Space>
    ),
  },
  {
    title: 'Hạn trả',
    dataIndex: 'due_date',
    key: 'due_date',
    render: (d: string) => (
      <span className="text-gray-600 text-sm">{dayjs(d).format('DD/MM/YYYY')}</span>
    ),
  },
  {
    title: 'Quá hạn',
    dataIndex: 'overdue_days',
    key: 'overdue_days',
    align: 'center' as const,
    render: (days: number, record: OverdueBook) => {
      const cfg = OVERDUE_TAG[record.status] ?? { color: 'default', label: '' };
      return (
        <Space size={4}>
          <Tag color={cfg.color} className="font-semibold">{days} ngày</Tag>
          <Tag color={cfg.color}>{cfg.label}</Tag>
        </Space>
      );
    },
  },
  {
    title: 'Tiền phạt',
    dataIndex: 'fine_amount',
    key: 'fine_amount',
    align: 'right' as const,
    render: (v: number) =>
      v > 0
        ? <Tag color="red" className="font-semibold">{v.toLocaleString('vi-VN')}đ</Tag>
        : <span className="text-gray-400">—</span>,
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export function ReportsPage() {
  // ── Shared state: date range dùng chung cho cả Phase 1, 2 và 3 ───────────
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([DEFAULT_FROM, DEFAULT_TO]);

  // ── Phase 1 state ─────────────────────────────────────────────────────────
  const [groupBy, setGroupBy] = useState<ReportGroupBy>('month');

  // ── Phase 2 state ─────────────────────────────────────────────────────────
  const [topLimit,      setTopLimit]      = useState<number>(10);
  const [authorLimit,   setAuthorLimit]   = useState<number>(10);
  const [categoryLimit, setCategoryLimit] = useState<number>(10);

  // ── Phase 3A state — limit riêng cho top readers ──────────────────────────
  const [readerLimit, setReaderLimit] = useState<number>(10);

  // ── Phase 4 state — filter mức độ nghiêm trọng cho bảng sách quá hạn ─────
  const [overdueStatus, setOverdueStatus] = useState<'all' | OverdueStatus>('all');
  // Fine revenue dùng shared date range → không cần state riêng

  // ── Params cho các API call ───────────────────────────────────────────────
  const sharedDateParams = {
    from_date: dateRange[0].format('YYYY-MM-DD'),
    to_date:   dateRange[1].format('YYYY-MM-DD'),
  };

  const phase1Params = { ...sharedDateParams, group_by: groupBy };
  const phase2Params = { ...sharedDateParams, limit: topLimit };
  const topAuthorsParams:    TopAuthorsParams    = { ...sharedDateParams, limit: authorLimit };
  const topCategoriesParams: TopCategoriesParams = { ...sharedDateParams, limit: categoryLimit };
  const phase3AParams = { ...sharedDateParams, limit: readerLimit };
  // Phase 3B chỉ cần date range — không có limit, không có group_by
  const phase3BParams = sharedDateParams;
  // Phase 4 (overdue): dùng shared date range + optional status filter
  const phase4Params: OverdueBookParams = {
    ...sharedDateParams,
    ...(overdueStatus !== 'all' && { status: overdueStatus }),
  };
  // Phase 4 (fine): dùng shared date range — lọc theo payment_date
  const fineRevenueParams: FineRevenueParams = sharedDateParams;

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
    data:      topAuthors,
    isLoading: authorsLoading,
    isError:   authorsError,
    error:     authorsErr,
  } = reportHooks.useTopAuthors(topAuthorsParams);

  const {
    data:      topCategories,
    isLoading: categoriesLoading,
    isError:   categoriesError,
    error:     categoriesErr,
  } = reportHooks.useTopCategories(topCategoriesParams);

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

  const {
    data:      overdueBooks,
    isLoading: overdueLoading,
    isError:   overdueError,
    error:     overdueErr,
  } = reportHooks.useOverdueBooks(phase4Params);

  const {
    data:      overdueSummaryData,
    isLoading: sumLoading,
    isError:   sumError,
    error:     sumErr,
  } = reportHooks.useOverdueSummary();

  const {
    data:      fineRevenueData,
    isLoading: fineRevLoading,
    isError:   fineRevError,
    error:     fineRevErr,
  } = reportHooks.useFineRevenue(fineRevenueParams);

  const {
    data:      fineReasonsData,
    isLoading: fineReasonsLoading,
    isError:   fineReasonsError,
    error:     fineReasonsErr,
  } = reportHooks.useFineReasons();

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

  // ── Derived data cho Top Authors chart (Phase 2 mở rộng) ─────────────────
  const authors = topAuthors ?? [];
  const pAuthorCategories = authors.map((a: TopAuthor) =>
    a.author_name.length > 22 ? a.author_name.slice(0, 22) + '…' : a.author_name
  );
  const pAuthorSeries  = [{ name: 'Lượt mượn', data: authors.map((a: TopAuthor) => a.borrow_count) }];
  const pAuthorHeight  = Math.max(300, authors.length * 42);

  // ── Derived data cho Top Categories chart (Phase 2 mở rộng) ──────────────
  const categories = topCategories ?? [];
  const pCatCategories = categories.map((c: TopCategory) =>
    c.category_name.length > 22 ? c.category_name.slice(0, 22) + '…' : c.category_name
  );
  const pCatSeries  = [{ name: 'Lượt mượn', data: categories.map((c: TopCategory) => c.borrow_count) }];
  const pCatHeight  = Math.max(300, categories.length * 42);

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

  // ── Derived data cho Phase 4 chart (overdue summary) ─────────────────────
  // Backend luôn trả đủ 3 phần tử theo thứ tự cố định: 1-7, 8-30, >30 ngày
  const p4Categories = overdueSummaryData?.map((s) => s.label) ?? [
    'Quá hạn 1–7 ngày', 'Quá hạn 8–30 ngày', 'Quá hạn trên 30 ngày',
  ];
  const p4Series = [{ name: 'Số phiếu quá hạn', data: overdueSummaryData?.map((s) => s.count) ?? [0, 0, 0] }];

  // ── Derived data cho Fine Revenue chart (vertical, time-series) ───────────
  // Trục X = tháng (label), Trục Y = doanh thu (revenue số tiền VND)
  const fineRevTrend      = fineRevenueData ?? [];
  const fineRevCategories = fineRevTrend.map((r) => r.label);
  const fineRevSeries     = [{ name: 'Doanh thu (đ)', data: fineRevTrend.map((r) => r.revenue) }];

  // ── Derived data cho Fine Reasons chart (horizontal, category) ───────────
  // Trục Y = tên nguyên nhân (category), Trục X = số lượt (fine_count)
  // Backend luôn trả đủ 4 danh mục theo thứ tự cố định
  const fineReasonsList       = fineReasonsData ?? [];
  const fineReasonsCategories = fineReasonsList.map((r) => r.category);
  const fineReasonsSeries     = [{ name: 'Số lượt phát sinh', data: fineReasonsList.map((r) => r.fine_count) }];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleRangeChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    if (values?.[0] && values?.[1]) {
      setDateRange([values[0], values[1]]);
    }
  };

  // ── Phase 5B: build URL xuất PDF báo cáo giao dịch mượn/trả ────────────
  // Truyền cùng params với API call Phase 1 (from_date, to_date, group_by).
  const buildTransactionsPdfUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    params.set('group_by',  groupBy);
    return `${base}/private/v1/reports/export/transactions-pdf?${params.toString()}`;
  };

  // ── Phase 6B: build URL xuất CSV báo cáo giao dịch mượn/trả ────────────
  // Cùng params với PDF — route ngoài auth, browser tự nhận Content-Disposition:attachment và download.
  const buildTransactionsCsvUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    params.set('group_by',  groupBy);
    return `${base}/private/v1/reports/export/transactions-csv?${params.toString()}`;
  };

  // ── Phase 5A: build URL xuất PDF sách quá hạn ────────────────────────────
  // window.open() không thể gửi Authorization header → URL chứa filter params,
  // không chứa token (route nằm ngoài auth middleware, cùng pattern với receipt PDF).
  const buildOverduePdfUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    if (overdueStatus !== 'all') params.set('status', overdueStatus);
    return `${base}/private/v1/reports/export/overdue-pdf?${params.toString()}`;
  };

  // ── Phase 5C: build URL xuất PDF doanh thu tiền phạt ────────────────────
  // PDF kết hợp Section 1 (fine revenue, lọc theo kỳ) + Section 2 (fine reasons, all-time).
  // Chỉ truyền from_date/to_date cho Section 1; Section 2 luôn all-time ở backend.
  const buildFineReportPdfUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    return `${base}/private/v1/reports/export/fine-report-pdf?${params.toString()}`;
  };

  // ── Phase 6C: build URL xuất CSV Top sách / Top tác giả / Top thể loại ──
  // Mỗi hàm truyền từ sharedDateParams + limit riêng của card đó.
  // Limit là state riêng (topLimit / authorLimit / categoryLimit) → CSV khớp với chart đang hiển thị.
  const buildTopBooksCsvUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    params.set('limit',     String(topLimit));
    return `${base}/private/v1/reports/export/top-books-csv?${params.toString()}`;
  };

  const buildTopAuthorsCsvUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    params.set('limit',     String(authorLimit));
    return `${base}/private/v1/reports/export/top-authors-csv?${params.toString()}`;
  };

  const buildTopCategoriesCsvUrl = (): string => {
    const base   = import.meta.env.VITE_API_URL as string;
    const params = new URLSearchParams();
    params.set('from_date', dateRange[0].format('YYYY-MM-DD'));
    params.set('to_date',   dateRange[1].format('YYYY-MM-DD'));
    params.set('limit',     String(categoryLimit));
    return `${base}/private/v1/reports/export/top-categories-csv?${params.toString()}`;
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
            <Space size={8}>
              <Select
                value={groupBy}
                onChange={setGroupBy}
                options={GROUP_OPTIONS}
                className="w-[130px]"
                size="small"
              />
              <Tooltip title="Xuất báo cáo giao dịch mượn/trả ra Excel/CSV">
                <Button
                  size="small"
                  icon={<FileExcelOutlined />}
                  style={{ color: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => window.open(buildTransactionsCsvUrl(), '_blank')}
                >
                  Xuất Excel
                </Button>
              </Tooltip>
              <Tooltip title="Xuất báo cáo giao dịch mượn/trả ra PDF">
                <Button
                  size="small"
                  icon={<FilePdfOutlined />}
                  onClick={() => window.open(buildTransactionsPdfUrl(), '_blank')}
                >
                  Xuất PDF
                </Button>
              </Tooltip>
            </Space>
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
            <Space size={8}>
              <Select
                value={topLimit}
                onChange={setTopLimit}
                options={LIMIT_OPTIONS}
                className="w-[110px]"
                size="small"
              />
              <Tooltip title="Xuất danh sách top sách ra Excel/CSV">
                <Button
                  size="small"
                  icon={<FileExcelOutlined />}
                  style={{ color: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => window.open(buildTopBooksCsvUrl(), '_blank')}
                >
                  Xuất Excel
                </Button>
              </Tooltip>
            </Space>
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
          PHASE 2 (mở rộng) — Top tác giả được mượn nhiều nhất
          Horizontal ColumnChart — tên tác giả trục Y, lượt mượn trục X.
          Mỗi borrow_detail tính là 1 lượt — COUNT(*) trong 1 SQL query.
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">
              Top tác giả được mượn nhiều nhất
            </span>
            <Space size={8}>
              <Select
                value={authorLimit}
                onChange={setAuthorLimit}
                options={LIMIT_OPTIONS}
                className="w-[110px]"
                size="small"
              />
              <Tooltip title="Xuất danh sách top tác giả ra Excel/CSV">
                <Button
                  size="small"
                  icon={<FileExcelOutlined />}
                  style={{ color: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => window.open(buildTopAuthorsCsvUrl(), '_blank')}
                >
                  Xuất Excel
                </Button>
              </Tooltip>
            </Space>
          </div>
        }
      >
        {authorsError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu top tác giả"
            description={(authorsErr as Error)?.message}
            className="mb-4"
          />
        )}

        {authorsLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <ColumnChart
              categories={pAuthorCategories}
              series={pAuthorSeries}
              horizontal={true}
              height={pAuthorHeight}
              columnWidth="60%"
            />
            <Table
              dataSource={authors}
              columns={TOP_AUTHORS_COLUMNS}
              rowKey="author_id"
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
          PHASE 2 (mở rộng) — Top thể loại được mượn nhiều nhất
          Horizontal ColumnChart — tên thể loại trục Y, lượt mượn trục X.
          Sách nhiều thể loại: mỗi thể loại được tính riêng (GROUP BY category_id).
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">
              Top thể loại được mượn nhiều nhất
            </span>
            <Space size={8}>
              <Select
                value={categoryLimit}
                onChange={setCategoryLimit}
                options={LIMIT_OPTIONS}
                className="w-[110px]"
                size="small"
              />
              <Tooltip title="Xuất danh sách top thể loại ra Excel/CSV">
                <Button
                  size="small"
                  icon={<FileExcelOutlined />}
                  style={{ color: '#16a34a', borderColor: '#16a34a' }}
                  onClick={() => window.open(buildTopCategoriesCsvUrl(), '_blank')}
                >
                  Xuất Excel
                </Button>
              </Tooltip>
            </Space>
          </div>
        }
      >
        {categoriesError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu top thể loại"
            description={(categoriesErr as Error)?.message}
            className="mb-4"
          />
        )}

        {categoriesLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <>
            <ColumnChart
              categories={pCatCategories}
              series={pCatSeries}
              horizontal={true}
              height={pCatHeight}
              columnWidth="60%"
            />
            <Table
              dataSource={categories}
              columns={TOP_CATEGORIES_COLUMNS}
              rowKey="category_id"
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

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 4A — Danh sách sách quá hạn
          Bảng chi tiết từng bản sao chưa trả và đã quá due_date.
          Filter: shared date range (lọc theo due_date) + select status severity.
          Tag màu: gold=nhẹ (1-7 ngày), orange=vừa (8-30), red=nặng (>30).
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex justify-between items-center">
            <Space>
              <AlertOutlined className="text-red-500" />
              <span className="font-semibold text-base">Danh sách sách quá hạn</span>
            </Space>
            <Space size={8}>
              <Select
                value={overdueStatus}
                onChange={setOverdueStatus}
                options={OVERDUE_STATUS_OPTIONS}
                className="w-[160px]"
                size="small"
              />
              <Tooltip title="Xuất danh sách sách quá hạn hiện tại ra PDF">
                <Button
                  size="small"
                  icon={<FilePdfOutlined />}
                  danger
                  onClick={() => window.open(buildOverduePdfUrl(), '_blank')}
                >
                  Xuất PDF
                </Button>
              </Tooltip>
            </Space>
          </div>
        }
      >
        {overdueError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải danh sách sách quá hạn"
            description={(overdueErr as Error)?.message}
            className="mb-4"
          />
        )}

        {overdueLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Table
            dataSource={overdueBooks ?? []}
            columns={OVERDUE_BOOKS_COLUMNS}
            rowKey={(r) => `${r.borrow_id}-${r.book_title}`}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            size="small"
            bordered={false}
            locale={{ emptyText: 'Không có sách quá hạn trong khoảng thời gian đã chọn' }}
          />
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 4B — Thống kê quá hạn theo nhóm ngày
          ColumnChart vertical: 3 cột cố định tương ứng 3 nhóm ngày.
          Dữ liệu real-time (không filter ngày) — phản ánh tình trạng hiện tại.
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex items-center gap-2">
            <AlertOutlined className="text-red-500" />
            <span className="font-semibold text-base">
              Thống kê quá hạn theo nhóm ngày
            </span>
          </div>
        }
      >
        {sumError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải thống kê quá hạn"
            description={(sumErr as Error)?.message}
            className="mb-4"
          />
        )}

        {sumLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ColumnChart
            categories={p4Categories}
            series={p4Series}
            height={300}
            columnWidth="40%"
          />
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 4 — Doanh thu tiền phạt theo tháng
          Vertical ColumnChart — trục X = tháng (time-series), trục Y = tiền VND.
          Dùng shared date range để lọc theo payments.payment_date.
          yLabelFormatter: rút gọn sang "K" để Y-axis không bị dài.
          tooltipValueFormatter: hiển thị số đầy đủ với đơn vị "đ".
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOutlined className="text-orange-500" />
              <span className="font-semibold text-base">Doanh thu tiền phạt theo tháng</span>
            </div>
            <Tooltip title="Xuất báo cáo doanh thu tiền phạt ra PDF (kèm phân loại nguyên nhân)">
              <Button
                size="small"
                icon={<FilePdfOutlined />}
                onClick={() => window.open(buildFineReportPdfUrl(), '_blank')}
              >
                Xuất PDF
              </Button>
            </Tooltip>
          </div>
        }
      >
        {fineRevError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu doanh thu tiền phạt"
            description={(fineRevErr as Error)?.message}
            className="mb-4"
          />
        )}

        {fineRevLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <ColumnChart
            categories={fineRevCategories}
            series={fineRevSeries}
            height={300}
            columnWidth="55%"
            yLabelFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
            tooltipValueFormatter={(v) => `${v.toLocaleString('vi-VN')}đ`}
          />
        )}
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════
          PHASE 4 — Nguyên nhân phát sinh tiền phạt
          Horizontal ColumnChart — trục Y = tên danh mục nguyên nhân,
          trục X = số lượt phát sinh (fine_count).
          Backend luôn trả đủ 4 danh mục kể cả khi count=0 → chart không Empty.
          Không có date filter — thống kê all-time toàn bộ lịch sử.
      ═══════════════════════════════════════════════════════════════════ */}
      <Card
        bordered={false}
        className="shadow-sm rounded-[10px]"
        title={
          <div className="flex items-center gap-2">
            <AlertOutlined className="text-yellow-500" />
            <span className="font-semibold text-base">Nguyên nhân phát sinh tiền phạt</span>
          </div>
        }
      >
        {fineReasonsError && (
          <Alert
            type="error"
            showIcon
            message="Không thể tải dữ liệu nguyên nhân tiền phạt"
            description={(fineReasonsErr as Error)?.message}
            className="mb-4"
          />
        )}

        {fineReasonsLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <ColumnChart
            categories={fineReasonsCategories}
            series={fineReasonsSeries}
            horizontal={true}
            height={280}
            columnWidth="60%"
            showLegend={false}
          />
        )}
      </Card>

    </div>
  );
}

export default ReportsPage;
