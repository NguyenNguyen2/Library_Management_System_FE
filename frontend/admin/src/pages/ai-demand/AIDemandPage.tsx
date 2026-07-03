import {
  Badge,
  Card,
  Col,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Button,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  BulbOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  FundOutlined,
  InboxOutlined,
  RobotOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import ColumnChart, { ColumnSeries } from '@shared/components/chart/ColumnChart';
import { aiDemandHooks } from '../../hooks/useAIDemand';
import { LowBorrowBook, SeasonalDemand } from '../../api/aiDemandApi';

const { Title, Text } = Typography;

const MONTH_LABELS = [
  'Th.1','Th.2','Th.3','Th.4','Th.5','Th.6',
  'Th.7','Th.8','Th.9','Th.10','Th.11','Th.12',
];

const SUGGESTION_TAG: Record<string, { color: string; icon: React.ReactNode }> = {
  'Thanh lý':   { color: 'red',    icon: <DeleteOutlined /> },
  'Chuyển kho': { color: 'orange', icon: <InboxOutlined /> },
};

// ── Transform seasonal data → ApexCharts series ──────────────────────────────
function buildSeasonalSeries(rows: SeasonalDemand[]): { categories: string[]; series: ColumnSeries[] } {
  const categories = MONTH_LABELS;
  const categoryMap = new Map<string, number[]>();

  rows.forEach(({ month, category, borrow_count }) => {
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Array(12).fill(0));
    }
    categoryMap.get(category)![month - 1] = borrow_count;
  });

  const series: ColumnSeries[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    data,
  }));

  return { categories, series };
}

// ── Tab 1: Gợi ý nhập sách ───────────────────────────────────────────────────
const ImportSuggestionsTab = () => {
  const { data = [], isLoading } = aiDemandHooks.useImportSuggestions();
  const navigate = useNavigate();

  const columns = [
    {
      title: '#',
      key: 'index',
      width: 52,
      render: (_: unknown, __: unknown, i: number) => (
        <Tag color={i < 3 ? 'gold' : 'default'} className="font-bold min-w-[28px] text-center">
          {i + 1}
        </Tag>
      ),
    },
    {
      title: 'Từ khóa / Tên sách',
      dataIndex: 'keyword',
      key: 'keyword',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Lượt tìm / Yêu cầu',
      dataIndex: 'search_count',
      key: 'search_count',
      width: 140,
      render: (v: number) => (
        <Badge count={v} color={v >= 10 ? 'red' : v >= 5 ? 'orange' : 'blue'} overflowCount={999} />
      ),
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (v: string) =>
        v === 'search_log'
          ? <Tag color="blue">Tìm kiếm</Tag>
          : <Tag color="purple">Danh sách đọc</Tag>,
    },
    {
      title: 'Đề xuất AI',
      dataIndex: 'suggestion',
      key: 'suggestion',
      render: (v: string) => (
        <Space>
          <BulbOutlined style={{ color: '#F9AB00' }} />
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 160,
      render: (_: unknown, record: any) => {
        if (record.source === 'wishlist') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/books?tab=copies&action=create-copy&book_id=${record.book_id}&book_title=${encodeURIComponent(record.keyword)}`)}
            >
              Nhập thêm bản sao
            </Button>
          );
        } else {
          return (
            <Button
              type="dashed"
              size="small"
              onClick={() => navigate(`/books?tab=list&action=create-book&title=${encodeURIComponent(record.keyword)}`)}
            >
              Tạo đầu sách mới
            </Button>
          );
        }
      },
    },
  ];

  return (
    <Card
      title={
        <Space>
          <BulbOutlined style={{ color: '#F9AB00', fontSize: 18 }} />
          <span>Danh sách từ khóa cần nhập sách</span>
          <Tag color="blue">{data.length} mục</Tag>
        </Space>
      }
    >
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          rowKey="keyword"
          size="small"
          pagination={{ pageSize: 15, showSizeChanger: false }}
          locale={{ emptyText: 'Không có dữ liệu tìm kiếm thất bại trong 6 tháng gần đây' }}
        />
      )}
    </Card>
  );
};

// ── Tab 2: Sách ít mượn ──────────────────────────────────────────────────────
const LowBorrowBooksTab = () => {
  const { data = [], isLoading } = aiDemandHooks.useLowBorrowBooks();
  const navigate = useNavigate();

  const thanhlySach  = data.filter((b) => b.suggestion === 'Thanh lý').length;
  const chuyenKhoSach = data.filter((b) => b.suggestion === 'Chuyển kho').length;

  const columns = [
    {
      title: 'Tên sách',
      dataIndex: 'book_name',
      key: 'book_name',
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Thể loại',
      dataIndex: 'category',
      key: 'category',
      width: 160,
      render: (v: string) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: 'Lần mượn cuối',
      dataIndex: 'last_borrow_date',
      key: 'last_borrow_date',
      width: 140,
      render: (v: string | null) =>
        v ? (
          <Text type="secondary">{v}</Text>
        ) : (
          <Tag color="red" icon={<WarningOutlined />}>Chưa từng mượn</Tag>
        ),
    },
    {
      title: 'Đề xuất AI',
      dataIndex: 'suggestion',
      key: 'suggestion',
      width: 130,
      render: (v: LowBorrowBook['suggestion']) => {
        const cfg = SUGGESTION_TAG[v] ?? { color: 'default', icon: null };
        return (
          <Tag color={cfg.color} icon={cfg.icon}>
            {v}
          </Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 160,
      render: (_: unknown, record: any) => (
        <Button
          type="primary"
          ghost
          size="small"
          onClick={() => navigate(`/books?tab=copies&q=${encodeURIComponent(record.book_name)}`)}
        >
          Xử lý bản sao
        </Button>
      ),
    },
  ];

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Text type="secondary">Tổng sách cần xử lý</Text>
            <Title level={2} style={{ margin: '4px 0', color: '#1E2A3B' }}>{data.length}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Text type="secondary">Cần thanh lý</Text>
            <Title level={2} style={{ margin: '4px 0', color: '#ff4d4f' }}>{thanhlySach}</Title>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Text type="secondary">Cần chuyển kho</Text>
            <Title level={2} style={{ margin: '4px 0', color: '#fa8c16' }}>{chuyenKhoSach}</Title>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <Space>
            <WarningOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
            <span>Sách không được mượn trong 12 tháng qua</span>
          </Space>
        }
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <Table
            dataSource={data}
            columns={columns}
            rowKey="book_name"
            size="small"
            pagination={{ pageSize: 15, showSizeChanger: false }}
            rowClassName={(r) => r.suggestion === 'Thanh lý' ? 'bg-red-50' : ''}
          />
        )}
      </Card>
    </Space>
  );
};

// ── Tab 3: Dự báo nhu cầu theo mùa ──────────────────────────────────────────
const SeasonalDemandTab = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear + 1);

  const { data = [], isLoading } = aiDemandHooks.useSeasonalDemand(year);

  const { categories, series } = useMemo(() => buildSeasonalSeries(data), [data]);

  const yearOptions = [
    { label: `Năm ${currentYear + 1} (Dự báo AI)`, value: currentYear + 1 },
    ...Array.from({ length: 5 }, (_, i) => {
      const y = currentYear - i;
      return { label: `Năm ${y}`, value: y };
    }),
  ];

  const isForecast = year > currentYear;

  // Top month
  const topMonth = useMemo(() => {
    if (!data.length) return null;
    const totals: Record<number, number> = {};
    data.forEach(({ month, borrow_count }) => {
      totals[month] = (totals[month] ?? 0) + borrow_count;
    });
    const best = Object.entries(totals).sort((a, b) => +b[1] - +a[1])[0];
    return best ? { month: +best[0], count: +best[1] } : null;
  }, [data]);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={16}>
      <Card
        title={
          <Space>
            <FundOutlined style={{ color: '#2563EB', fontSize: 18 }} />
            <span>Biểu đồ nhu cầu mượn sách theo thể loại {isForecast && '(Dự báo AI)'}</span>
          </Space>
        }
        extra={
          <Select
            value={year}
            onChange={setYear}
            options={yearOptions}
            style={{ width: 180 }}
          />
        }
      >
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 10 }} />
        ) : (
          <>
            {topMonth && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <Space>
                  <BulbOutlined style={{ color: '#2563EB' }} />
                  <Text>
                    <Text strong>{isForecast ? 'Dự báo AI:' : 'AI nhận xét:'}</Text> Dự kiến tháng {topMonth.month} {isForecast ? 'năm sau' : `năm ${year}`} sẽ có nhu cầu mượn cao nhất với tổng khoảng <Text strong style={{ color: '#2563EB' }}>{topMonth.count}</Text> lượt mượn.
                  </Text>
                </Space>
              </div>
            )}
            <ColumnChart
              categories={categories}
              series={series}
              height={380}
              stacked={false}
              showLegend={true}
              legendPosition="bottom"
            />
          </>
        )}
      </Card>

      {!isLoading && data.length > 0 && (
        <Card title="Chi tiết theo tháng" size="small">
          <Table
            dataSource={data}
            rowKey={(r) => `${r.month}-${r.category}`}
            size="small"
            pagination={false}
            columns={[
              {
                title: 'Tháng',
                dataIndex: 'month',
                key: 'month',
                width: 80,
                render: (v: number) => <Tag color="blue">Th.{v}</Tag>,
              },
              {
                title: 'Thể loại',
                dataIndex: 'category',
                key: 'category',
                render: (v: string) => <Tag color="geekblue">{v}</Tag>,
              },
              {
                title: 'Lượt mượn',
                dataIndex: 'borrow_count',
                key: 'borrow_count',
                width: 100,
                render: (v: number) => (
                  <Tooltip title={`${v} lượt mượn`}>
                    <Badge count={v} color="#2563EB" overflowCount={999} />
                  </Tooltip>
                ),
              },
            ]}
            scroll={{ y: 300 }}
          />
        </Card>
      )}
    </Space>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AIDemandPage = () => {
  const tabs = [
    {
      key: 'import',
      label: (
        <Space>
          <BulbOutlined />
          Gợi ý nhập sách
        </Space>
      ),
      children: <ImportSuggestionsTab />,
    },
    {
      key: 'low-borrow',
      label: (
        <Space>
          <WarningOutlined />
          Sách ít được mượn
        </Space>
      ),
      children: <LowBorrowBooksTab />,
    },
    {
      key: 'seasonal',
      label: (
        <Space>
          <FundOutlined />
          Dự báo theo mùa
        </Space>
      ),
      children: <SeasonalDemandTab />,
    },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4">
        <Space align="center">
          <div className="w-10 h-10 rounded-xl bg-[#2563EB] flex items-center justify-center">
            <RobotOutlined style={{ fontSize: 22, color: '#fff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              AI Phân tích nhu cầu sách
            </Title>
            <Text type="secondary">
              <ExperimentOutlined /> Phân tích tự động từ dữ liệu mượn trả thực tế
            </Text>
          </div>
        </Space>
      </div>

      <Tabs defaultActiveKey="import" items={tabs} size="large" />
    </div>
  );
};

export default AIDemandPage;
