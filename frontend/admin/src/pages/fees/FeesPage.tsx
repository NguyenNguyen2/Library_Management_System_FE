import {
  Badge, Button, Card, Col, DatePicker, Form, Input,
  Modal, Row, Select, Skeleton, Space, Statistic,
  Table, TablePaginationConfig, Tabs, Tag, Typography, message,
} from 'antd';
import {
  CreditCardOutlined, DollarOutlined, ExclamationCircleOutlined,
  HistoryOutlined, LineChartOutlined, SearchOutlined, ToolOutlined, DownloadOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import ColumnChart from '@shared/components/chart/ColumnChart';
import { feesHooks } from '../../hooks/useFees';
import { Fine, FineType, HistoryFine, PaymentMethod } from '../../api/feesApi';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const TYPE_TAG: Record<string, { label: string; color: string }> = {
  late:   { label: 'Trễ hạn',   color: 'orange'  },
  damage: { label: 'Hư hỏng',   color: 'volcano' },
  lost:   { label: 'Mất sách',  color: 'red'     },
};

const METHOD_LABEL: Record<string, string> = {
  cash:     'Tiền mặt',
  transfer: 'Chuyển khoản',
  momo:     'Ví MoMo',
};

const STATUS_BADGE: Record<string, { status: 'error' | 'warning' | 'success'; label: string }> = {
  unpaid:  { status: 'error',   label: 'Chưa thu'   },
  partial: { status: 'warning', label: 'Trả 1 phần' },
  paid:    { status: 'success', label: 'Đã thu'     },
};

// ── Tab 1: Danh sách phí chưa thu ───────────────────────────────────────────
const FineListTab = () => {
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<FineType | ''>('');
  const [page, setPage]             = useState(1);
  const [payModal, setPayModal]     = useState<{ open: boolean; fine: Fine | null }>({ open: false, fine: null });
  const [form] = Form.useForm();

  const { data, isLoading } = feesHooks.useFines({ search: search || undefined, type: typeFilter || undefined, page });
  const recordPayment = feesHooks.useRecordPayment();

  const fines = data?.data ?? [];
  const meta  = data?.meta;

  const handlePay = (fine: Fine) => {
    setPayModal({ open: true, fine });
    form.setFieldsValue({ method: 'cash' });
  };

  const handlePaySubmit = async (values: { method: PaymentMethod }) => {
    if (!payModal.fine) return;
    try {
      await recordPayment.mutateAsync({ fineId: payModal.fine.fine_id, method: values.method });
      message.success(`Đã thu ${payModal.fine.amount.toLocaleString('vi-VN')}đ thành công!`);
      setPayModal({ open: false, fine: null });
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const pagination: TablePaginationConfig = {
    current:  page,
    pageSize: meta?.per_page ?? 15,
    total:    meta?.total    ?? 0,
    onChange: (p) => setPage(p),
    showTotal: (t) => `Tổng ${t} khoản phí`,
  };

  const columns = [
    { title: 'Mã phí', dataIndex: 'fine_id', width: 80, render: (v: number) => <Text className="font-mono text-xs">PH-{v}</Text> },
    { title: 'Độc giả', dataIndex: 'reader_name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Sách', dataIndex: 'book_title' },
    {
      title: 'Loại phí', dataIndex: 'type', width: 110,
      render: (v: FineType) => <Tag color={TYPE_TAG[v]?.color}>{TYPE_TAG[v]?.label}</Tag>,
    },
    {
      title: 'Số tiền', dataIndex: 'amount', align: 'right' as const, width: 120,
      render: (v: number) => <Text strong>{v.toLocaleString('vi-VN')}đ</Text>,
    },
    { title: 'Ngày phát sinh', dataIndex: 'created_at', width: 130 },
    {
      title: 'Trạng thái', dataIndex: 'status', width: 120,
      render: (v: string) => {
        const cfg = STATUS_BADGE[v];
        return <Badge status={cfg?.status} text={cfg?.label} />;
      },
    },
    {
      title: 'Thao tác', key: 'action', align: 'right' as const, width: 110,
      render: (_: unknown, record: Fine) =>
        record.status !== 'paid'
          ? <Button type="primary" size="small" onClick={() => handlePay(record)}>Thu phí</Button>
          : <Button size="small" disabled>Đã thu</Button>,
    },
  ];

  return (
    <>
      <Card bordered={false}>
        <div className="flex flex-wrap gap-3 mb-4">
          <Input
            placeholder="Tìm mã phí, độc giả, sách..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Select
            value={typeFilter}
            onChange={v => { setTypeFilter(v); setPage(1); }}
            style={{ width: 140 }}
            options={[
              { value: '',       label: 'Tất cả loại' },
              { value: 'late',   label: 'Trễ hạn'     },
              { value: 'damage', label: 'Hư hỏng'     },
              { value: 'lost',   label: 'Mất sách'    },
            ]}
          />
        </div>
        {isLoading
          ? <Skeleton active paragraph={{ rows: 8 }} />
          : <Table dataSource={fines} columns={columns} rowKey="fine_id" size="small" pagination={pagination} bordered={false} />
        }
      </Card>

      {/* Modal Thu phí */}
      <Modal
        title={`Thu phí — PH-${payModal.fine?.fine_id}`}
        open={payModal.open}
        onCancel={() => setPayModal({ open: false, fine: null })}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handlePaySubmit}>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-1 border border-gray-100">
            <div><Text type="secondary">Độc giả: </Text><Text strong>{payModal.fine?.reader_name}</Text></div>
            <div><Text type="secondary">Sách: </Text><Text>{payModal.fine?.book_title}</Text></div>
            <div><Text type="secondary">Lý do: </Text><Text>{payModal.fine?.reason}</Text></div>
            <div><Text type="secondary">Số tiền: </Text><Text strong className="text-lg text-[#1E2A3B]">{payModal.fine?.amount.toLocaleString('vi-VN')}đ</Text></div>
          </div>
          <Form.Item name="method" label="Hình thức thanh toán" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="cash"><DollarOutlined /> Tiền mặt</Select.Option>
              <Select.Option value="transfer"><CreditCardOutlined /> Chuyển khoản</Select.Option>
              <Select.Option value="momo"><HistoryOutlined /> Ví MoMo</Select.Option>
            </Select>
          </Form.Item>
          <div className="text-right">
            <Space>
              <Button onClick={() => setPayModal({ open: false, fine: null })}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={recordPayment.isPending}>Xác nhận thu phí</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </>
  );
};

// ── Tab 2: Lịch sử thu phí ──────────────────────────────────────────────────
const FeeHistoryTab = () => {
  const [search, setSearch]   = useState('');
  const [method, setMethod]   = useState('');
  const [dates, setDates]     = useState<[string, string] | []>([]);
  const [page, setPage]       = useState(1);

  const params = {
    search:    search    || undefined,
    method:    method    || undefined,
    date_from: dates[0]  || undefined,
    date_to:   dates[1]  || undefined,
    page,
  };
  const { data, isLoading } = feesHooks.useHistory(params);

  const history = data?.data ?? [];
  const meta    = data?.meta;

  const columns = [
    { title: 'Mã phí', dataIndex: 'fine_id', width: 80, render: (v: number) => <Text className="font-mono text-xs">PH-{v}</Text> },
    { title: 'Độc giả', dataIndex: 'reader_name', render: (v: string) => <Text strong>{v}</Text> },
    { title: 'Sách', dataIndex: 'book_title' },
    {
      title: 'Loại phí', dataIndex: 'type', width: 110,
      render: (v: FineType) => <Tag color={TYPE_TAG[v]?.color}>{TYPE_TAG[v]?.label}</Tag>,
    },
    {
      title: 'Số tiền', dataIndex: 'amount', align: 'right' as const, width: 120,
      render: (v: number) => <Text strong className="text-green-700">{v.toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Phương thức', dataIndex: 'payment_method', width: 130,
      render: (v: string) => <Tag color="blue">{METHOD_LABEL[v] ?? v}</Tag>,
    },
    { title: 'Ngày thu', dataIndex: 'paid_at', width: 150 },
  ];

  return (
    <Card bordered={false}>
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Tìm độc giả, sách..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select
          value={method}
          onChange={v => { setMethod(v); setPage(1); }}
          style={{ width: 150 }}
          options={[
            { value: '',         label: 'Tất cả PT'   },
            { value: 'cash',     label: 'Tiền mặt'    },
            { value: 'transfer', label: 'Chuyển khoản' },
            { value: 'momo',     label: 'Ví MoMo'     },
          ]}
        />
        <RangePicker
          onChange={(_, strs) => { setDates(strs as [string, string]); setPage(1); }}
          placeholder={['Từ ngày', 'Đến ngày']}
        />
      </div>
      {isLoading
        ? <Skeleton active paragraph={{ rows: 8 }} />
        : <Table
            dataSource={history}
            columns={columns}
            rowKey="fine_id"
            size="small"
            pagination={{
              current: page,
              pageSize: meta?.per_page ?? 15,
              total: meta?.total ?? 0,
              onChange: setPage,
              showTotal: (t) => `Tổng ${t} giao dịch`,
            }}
            bordered={false}
          />
      }
    </Card>
  );
};

// ── Tab 3: Báo cáo doanh thu ────────────────────────────────────────────────
const FeeRevenueTab = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear]     = useState(currentYear);
  const [groupBy, setGroupBy] = useState<'month' | 'day'>('month');

  const { data, isLoading } = feesHooks.useRevenue(year, groupBy);

  const { categories, series } = useMemo(() => {
    if (!data?.series?.length) return { categories: [], series: [] };

    if (groupBy === 'month') {
      const labels = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];
      const amounts = new Array(12).fill(0);
      data.series.forEach(s => { amounts[(s.period as number) - 1] = s.total; });
      return {
        categories: labels,
        series: [{ name: 'Doanh thu (đ)', data: amounts }],
      };
    } else {
      return {
        categories: data.series.map(s => String(s.period)),
        series: [{ name: 'Doanh thu (đ)', data: data.series.map(s => s.total) }],
      };
    }
  }, [data, groupBy]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({ label: `Năm ${currentYear - i}`, value: currentYear - i }));

  return (
    <div className="flex flex-col gap-4">
      {/* Summary cards */}
      <Row gutter={16}>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Text type="secondary">Tổng doanh thu năm {year}</Text>
            <div className="text-2xl font-bold text-[#389e0d] mt-1">
              {isLoading ? '...' : (data?.total_revenue ?? 0).toLocaleString('vi-VN')}đ
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Text type="secondary">Số giao dịch</Text>
            <div className="text-2xl font-bold text-[#1E2A3B] mt-1">
              {isLoading ? '...' : data?.total_count ?? 0}
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Text type="secondary">TB mỗi giao dịch</Text>
            <div className="text-2xl font-bold text-[#096dd9] mt-1">
              {isLoading || !data?.total_count ? '...' : Math.round((data.total_revenue / data.total_count)).toLocaleString('vi-VN')}đ
            </div>
          </Card>
        </Col>
      </Row>

      {/* Chart */}
      <Card
        title={<Space><LineChartOutlined style={{ color: '#2563EB' }} />Biểu đồ doanh thu</Space>}
        extra={
          <Space>
            <Select value={groupBy} onChange={setGroupBy} style={{ width: 120 }}
              options={[{ value: 'month', label: 'Theo tháng' }, { value: 'day', label: 'Theo ngày' }]}
            />
            <Select value={year} onChange={setYear} style={{ width: 110 }} options={yearOptions} />
            <Button
              type="primary"
              ghost
              icon={<DownloadOutlined />}
              onClick={() => {
                const baseUrl = import.meta.env.VITE_API_URL || '';
                window.open(`${baseUrl}/private/v1/reports/export/fine-report-csv?from_date=${year}-01-01&to_date=${year}-12-31`, '_blank');
              }}
            >
              Xuất Excel
            </Button>
          </Space>
        }
        bordered={false}
      >
        {isLoading
          ? <Skeleton active paragraph={{ rows: 8 }} />
          : <ColumnChart categories={categories} series={series} height={320} />
        }
      </Card>

      {/* Breakdown by type */}
      {!isLoading && data && data.breakdown && data.breakdown.length > 0 && (
        <Card title="Phân loại theo lý do" size="small" bordered={false}>
          <Row gutter={16}>
            {data.breakdown.map(b => (
              <Col key={b.type} span={8}>
                <div className="p-3 rounded-lg border border-gray-100 text-center">
                  <Tag color={TYPE_TAG[b.type]?.color}>{TYPE_TAG[b.type]?.label}</Tag>
                  <div className="font-bold mt-2">{b.total.toLocaleString('vi-VN')}đ</div>
                  <Text type="secondary" className="text-xs">{b.count} giao dịch</Text>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      )}
    </div>
  );
};

// ── Summary Cards (dùng chung) ───────────────────────────────────────────────
const SummaryCards = () => {
  const { data } = feesHooks.useFines({ per_page: 100 } as any);
  const fines = data?.data ?? [];
  const total     = fines.reduce((s, f) => s + f.amount, 0);
  const unpaid    = fines.filter(f => f.status === 'unpaid').reduce((s, f) => s + f.amount, 0);
  const partial   = fines.filter(f => f.status === 'partial').reduce((s, f) => s + f.amount, 0);
  const countUnpaid = fines.filter(f => f.status !== 'paid').length;

  return (
    <Row gutter={[16, 16]} className="mb-4">
      {[
        { title: 'Tổng phí chưa thu', value: total,    color: '#cf1322', suffix: 'đ' },
        { title: 'Chưa thu',          value: unpaid,   color: '#cf1322', suffix: 'đ' },
        { title: 'Trả 1 phần',        value: partial,  color: '#d46b08', suffix: 'đ' },
        { title: 'Số khoản cần thu',  value: countUnpaid, color: '#096dd9', suffix: '' },
      ].map(({ title, value, color, suffix }) => (
        <Col xs={12} sm={6} key={title}>
          <Card bordered={false} className="shadow-sm rounded-[10px]">
            <Statistic title={title} value={value} suffix={suffix}
              valueStyle={{ color, fontWeight: 700 }}
              formatter={suffix === 'đ' ? (v) => `${Number(v).toLocaleString('vi-VN')}` : undefined}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
export function FeesPage() {
  const tabs = [
    {
      key: 'list',
      label: <Space><ExclamationCircleOutlined />Phí chưa thu</Space>,
      children: <FineListTab />,
    },
    {
      key: 'damage',
      label: <Space><ToolOutlined />Tạo phí hỏng/mất</Space>,
      children: <DamageFineTab />,
    },
    {
      key: 'history',
      label: <Space><HistoryOutlined />Lịch sử thu phí</Space>,
      children: <FeeHistoryTab />,
    },
    {
      key: 'revenue',
      label: <Space><LineChartOutlined />Báo cáo doanh thu</Space>,
      children: <FeeRevenueTab />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="m-0 text-[28px] font-bold leading-[36px] text-navyDark">Quản lý phí & thanh toán</h1>
        <p className="m-0 mt-1 text-sm text-gray-500">Theo dõi phí trễ hạn, phạt hỏng/mất sách và ghi nhận thanh toán tại quầy</p>
      </div>
      <SummaryCards />
      <Tabs items={tabs} size="large" />
    </div>
  );
}

// ── Tab: Tạo phí hỏng / mất ─────────────────────────────────────────────────
const DamageFineTab = () => {
  const [form] = Form.useForm();
  const createDamage = feesHooks.useCreateDamageFine();

  const handleSubmit = async (values: { user_id: number; copy_id: number; damage_level: 'minor' | 'medium' | 'heavy' | 'lost' }) => {
    try {
      const res = await createDamage.mutateAsync(values);
      message.success(`Đã tạo phí ${res.data.amount.toLocaleString('vi-VN')}đ cho sách "${res.data.book_title}"`);
      form.resetFields();
    } catch {
      message.error('Có lỗi xảy ra. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <Card bordered={false} title={<Space><ToolOutlined />Tạo phí bồi thường sách hỏng / mất</Space>}>
      <div className="max-w-lg">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-700">
          Phí được tính tự động: <strong>Hỏng nhẹ 20%</strong> · <strong>Hỏng vừa 35%</strong> · <strong>Hỏng nặng 50%</strong> · <strong>Mất sách 100%</strong> giá trị thay thế sách
        </div>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="user_id" label="ID Độc giả" rules={[{ required: true, message: 'Nhập ID độc giả' }]}>
            <Input type="number" placeholder="VD: 42" />
          </Form.Item>
          <Form.Item name="copy_id" label="ID Bản sao sách" rules={[{ required: true, message: 'Nhập ID bản sao' }]}>
            <Input type="number" placeholder="VD: 15" />
          </Form.Item>
          <Form.Item name="borrow_id" label="ID Giao dịch mượn (tùy chọn)">
            <Input type="number" placeholder="Bỏ trống nếu không có" />
          </Form.Item>
          <Form.Item name="damage_level" label="Mức độ hư hỏng" rules={[{ required: true }]}>
            <Select placeholder="Chọn mức độ">
              <Select.Option value="minor"><Tag color="orange">Hỏng nhẹ — 20%</Tag></Select.Option>
              <Select.Option value="medium"><Tag color="gold">Hỏng vừa — 35%</Tag></Select.Option>
              <Select.Option value="heavy"><Tag color="volcano">Hỏng nặng — 50%</Tag></Select.Option>
              <Select.Option value="lost"><Tag color="red">Mất sách — 100%</Tag></Select.Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={createDamage.isPending}>
            Tạo khoản phí
          </Button>
        </Form>
      </div>
    </Card>
  );
};

export default FeesPage;
