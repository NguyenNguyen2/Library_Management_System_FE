import {
  Badge, Button, Card, Col, DatePicker, Form, Input,
  Modal, Row, Select, Skeleton, Space, Spin, Statistic,
  Table, TablePaginationConfig, Tabs, Tag, Typography, message,
} from 'antd';
import {
  CreditCardOutlined, DollarOutlined, ExclamationCircleOutlined,
  HistoryOutlined, LineChartOutlined, SearchOutlined, ToolOutlined, DownloadOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import debounce from 'lodash/debounce';
import dayjs from 'dayjs';
import ColumnChart from '@shared/components/chart/ColumnChart';
import { feesHooks } from '../../hooks/useFees';
import { Fine, FineType, HistoryFine, PaymentMethod } from '../../api/feesApi';
import { checkoutApi } from '../../api/checkoutApi';
import { userApi } from '../../api/userApi';
import { getBookCopies } from '../../services/copyService';

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [form] = Form.useForm();

  const { data, isLoading } = feesHooks.useFines({ search: search || undefined, type: typeFilter || undefined, page });
  const recordPayment = feesHooks.useRecordPayment();

  const fines = data?.data ?? [];
  const meta  = data?.meta;

  const handlePay = (fine: Fine) => {
    setPayModal({ open: true, fine });
    setSelectedMethod('cash');
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

  const handlePrintQR = () => {
    if (!payModal.fine) return;
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      message.error('Không thể mở cửa sổ in. Vui lòng kiểm tra cài đặt chặn popup của trình duyệt.');
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>In mã thanh toán PH-${payModal.fine.fine_id}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              color: #333;
              text-align: center;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              border: 1px dashed #ccc;
              padding: 20px;
              border-radius: 8px;
            }
            .title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 13px;
              color: #666;
              margin-bottom: 20px;
            }
            .qr-image {
              width: 220px;
              height: 220px;
              object-fit: contain;
              margin-bottom: 20px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              text-align: left;
              font-size: 14px;
            }
            .info-table td {
              padding: 6px 0;
            }
            .info-table td.label {
              color: #888;
              width: 40%;
            }
            .info-table td.value {
              font-weight: 500;
            }
            .highlight {
              color: #e53e3e;
              font-weight: bold;
            }
            .code {
              font-family: monospace;
              background: #f7fafc;
              padding: 2px 6px;
              border-radius: 4px;
              border: 1px solid #edf2f7;
            }
            @media print {
              body { padding: 0; }
              .container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">THÔNG TIN THANH TOÁN</div>
            <div class="subtitle">Mã khoản phí: PH-${payModal.fine.fine_id}</div>
            
            <img class="qr-image" src="${
              selectedMethod === 'transfer'
                ? `https://img.vietqr.io/image/TCB-2408057979-compact2.png?amount=${payModal.fine.amount}&addInfo=THANH%20TOAN%20PHI%20PH%20${payModal.fine.fine_id}&accountName=THU%20VIEN%20SACH%20VIET`
                : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&charset-target=UTF-8&data=${encodeURIComponent(
                    `2|99|0971471076|THU VIEN SACH VIET||0|0|${payModal.fine.amount}|THANH TOAN PHI PH ${payModal.fine.fine_id}|transfer_mywallet`
                  )}`
            }" />
            
            <table class="info-table">
              <tr>
                <td class="label">Hình thức:</td>
                <td class="value">${selectedMethod === 'transfer' ? 'Chuyển khoản (VietQR)' : 'Ví điện tử MoMo'}</td>
              </tr>
              <tr>
                <td class="label">Độc giả:</td>
                <td class="value">${payModal.fine.reader_name}</td>
              </tr>
              <tr>
                <td class="label">Số tiền:</td>
                <td class="value highlight">${payModal.fine.amount.toLocaleString('vi-VN')} đ</td>
              </tr>
              <tr>
                <td class="label">Nội dung chuyển:</td>
                <td class="value"><span class="code">THANH TOAN PHI PH ${payModal.fine.fine_id}</span></td>
              </tr>
              ${selectedMethod === 'transfer' ? `
              <tr>
                <td class="label">Ngân hàng:</td>
                <td class="value">Techcombank (TCB)</td>
              </tr>
              <tr>
                <td class="label">Số tài khoản:</td>
                <td class="value">2408057979</td>
              </tr>
              ` : `
              <tr>
                <td class="label">Ví nhận:</td>
                <td class="value">MoMo</td>
              </tr>
              <tr>
                <td class="label">Số điện thoại:</td>
                <td class="value">0971471076</td>
              </tr>
              `}
              <tr>
                <td class="label">Chủ tài khoản:</td>
                <td class="value">THU VIEN SACH VIET</td>
              </tr>
            </table>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
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
            <Select onChange={(value) => setSelectedMethod(value as PaymentMethod)}>
              <Select.Option value="cash"><DollarOutlined /> Tiền mặt</Select.Option>
              <Select.Option value="transfer"><CreditCardOutlined /> Chuyển khoản (VietQR)</Select.Option>
              <Select.Option value="momo"><HistoryOutlined /> Ví MoMo</Select.Option>
            </Select>
          </Form.Item>

          {selectedMethod !== 'cash' && payModal.fine && (
            <div className="border border-dashed border-blue-200 bg-blue-50/50 p-4 rounded-lg mb-4 flex flex-col md:flex-row items-center gap-4 animate-fade-in">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100 flex-shrink-0">
                {selectedMethod === 'transfer' ? (
                  <img
                    src={`https://img.vietqr.io/image/TCB-2408057979-compact2.png?amount=${payModal.fine.amount}&addInfo=THANH%20TOAN%20PHI%20PH%20${payModal.fine.fine_id}&accountName=THU%20VIEN%20SACH%20VIET`}
                    alt="VietQR Chuyen khoan"
                    className="w-[180px] h-[180px] object-contain"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&charset-target=UTF-8&data=${encodeURIComponent(
                      `2|99|0971471076|THU VIEN SACH VIET||0|0|${payModal.fine.amount}|THANH TOAN PHI PH ${payModal.fine.fine_id}|transfer_mywallet`
                    )}`}
                    alt="MoMo QR Chuyen khoan"
                    className="w-[180px] h-[180px] object-contain"
                  />
                )}
              </div>
              <div className="space-y-1 text-xs text-gray-600 w-full">
                <p className="font-semibold text-sm text-blue-900 flex items-center gap-1.5">
                  {selectedMethod === 'transfer' ? (
                    <>🏦 THÔNG TIN CHUYỂN KHOẢN NGÂN HÀNG</>
                  ) : (
                    <>🔴 THÔNG TIN CHUYỂN KHOẢN VÍ MOMO</>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-y-1 pt-1.5">
                  <span className="text-gray-400">Người nhận:</span>
                  <span className="col-span-2 font-medium text-gray-800">
                    {selectedMethod === 'transfer' ? 'Techcombank (TCB)' : 'Ví điện tử MoMo'}
                  </span>
                  
                  <span className="text-gray-400">Số tài khoản:</span>
                  <span className="col-span-2 font-mono font-bold text-gray-900">
                    {selectedMethod === 'transfer' ? '2408057979' : '0971471076'}
                  </span>

                  <span className="text-gray-400">Tên tài khoản:</span>
                  <span className="col-span-2 font-semibold text-gray-800">THU VIEN SACH VIET</span>

                  <span className="text-gray-400">Số tiền:</span>
                  <span className="col-span-2 font-bold text-red-600 text-sm">
                    {payModal.fine.amount.toLocaleString('vi-VN')} đ
                  </span>

                  <span className="text-gray-400">Nội dung:</span>
                  <span className="col-span-2 font-mono font-semibold text-blue-800 bg-blue-100/50 px-1 rounded">
                    THANH TOAN PHI PH {payModal.fine.fine_id}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 pt-2 italic">
                  * Vui lòng quét đúng mã QR để hệ thống tự động ghi nhận chính xác số tiền cần thanh toán.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-right">
            {selectedMethod !== 'cash' && payModal.fine ? (
              <Button icon={<PrinterOutlined />} onClick={handlePrintQR}>
                In mã thanh toán
              </Button>
            ) : (
              <div />
            )}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

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
      <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabs} size="large" />
    </div>
  );
}

// ── Tab: Tạo phí hỏng / mất ─────────────────────────────────────────────────
const DamageFineTab = () => {
  const [form] = Form.useForm();
  const createDamage = feesHooks.useCreateDamageFine();

  const [readers, setReaders] = useState<any[]>([]);
  const [searchingReaders, setSearchingReaders] = useState(false);
  const [selectedReaderId, setSelectedReaderId] = useState<number | null>(null);

  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [copies, setCopies] = useState<any[]>([]);
  const [searchingCopies, setSearchingCopies] = useState(false);

  // Fetch readers (actual search call)
  const fetchReaders = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setReaders([]);
      return;
    }
    setSearchingReaders(true);
    try {
      const results = await checkoutApi.findReader(trimmed);
      setReaders(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingReaders(false);
    }
  };

  // Debounced search handler for readers
  const handleSearchReader = useMemo(
    () => debounce(fetchReaders, 500),
    []
  );

  // When a reader is selected
  const handleSelectReader = async (readerId: number) => {
    setSelectedReaderId(readerId);
    setBorrowHistory([]);
    form.setFieldsValue({ borrow_id: undefined, copy_id: undefined });
    
    setLoadingHistory(true);
    try {
      const history = await userApi.getReaderBorrowHistory(String(readerId));
      setBorrowHistory(history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // When a borrow transaction is selected
  const handleSelectBorrow = async (borrowId: number) => {
    const selectedBorrow = borrowHistory.find(b => b.borrow_id === borrowId);
    if (!selectedBorrow) return;

    try {
      // Fetch all copies of the borrowed book by searching its title
      const res = await getBookCopies(1, selectedBorrow.book_title);
      if (res && res.data) {
        setCopies(res.data);
        
        // Find the copy matching the borrowed copy barcode and pre-select it
        const matchedCopy = res.data.find((c: any) => c.barcode === selectedBorrow.copy_barcode);
        if (matchedCopy) {
          form.setFieldsValue({ copy_id: matchedCopy.copy_id });
        } else if (res.data.length > 0) {
          form.setFieldsValue({ copy_id: res.data[0].copy_id });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch copies (actual search call)
  const fetchCopies = async (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setCopies([]);
      return;
    }
    setSearchingCopies(true);
    try {
      const res = await getBookCopies(1, trimmed);
      if (res && res.data) {
        setCopies(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingCopies(false);
    }
  };

  // Debounced search handler for copies
  const handleSearchCopies = useMemo(
    () => debounce(fetchCopies, 500),
    []
  );

  const handleSubmit = async (values: any) => {
    try {
      await createDamage.mutateAsync({
        user_id: values.user_id,
        copy_id: values.copy_id,
        borrow_id: values.borrow_id,
        damage_level: values.damage_level,
      });
      message.success('Tạo khoản phí bồi thường thành công!');
      form.resetFields();
      setSelectedReaderId(null);
      setBorrowHistory([]);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <Card bordered={false} title={<Space><ToolOutlined />Tạo phí bồi thường sách hỏng / mất</Space>}>
      <div className="max-w-lg">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-sm text-blue-700">
          Phí được tính tự động: <strong>Hỏng nhẹ 20%</strong> · <strong>Hỏng vừa 35%</strong> · <strong>Hỏng nặng 50%</strong> · <strong>Mất sách 100%</strong> giá trị thay thế sách
        </div>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          {/* Reader select drop down */}
          <Form.Item name="user_id" label="Độc giả nhận phạt" rules={[{ required: true, message: 'Vui lòng chọn độc giả' }]}>
            <Select
              showSearch
              placeholder="Nhập tên, email hoặc số điện thoại độc giả..."
              defaultActiveFirstOption={false}
              suffixIcon={null}
              filterOption={false}
              onSearch={handleSearchReader}
              onChange={handleSelectReader}
              notFoundContent={searchingReaders ? <Spin size="small" /> : null}
              loading={searchingReaders}
            >
              {readers.map(r => (
                <Select.Option key={r.user_id} value={r.user_id}>
                  {r.full_name} ({r.email} - {r.phone || 'Không số ĐT'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Borrow Transaction selection (conditional) */}
          <Form.Item name="borrow_id" label="Chọn giao dịch mượn liên quan (tùy chọn)">
            <Select
              placeholder={selectedReaderId ? "Chọn từ danh sách sách đang mượn..." : "Vui lòng chọn độc giả trước..."}
              disabled={!selectedReaderId}
              loading={loadingHistory}
              onChange={handleSelectBorrow}
              allowClear
            >
              {borrowHistory.map(b => (
                <Select.Option key={b.borrow_id} value={b.borrow_id}>
                  {b.book_title} (Mã mượn: BM-{b.borrow_id} - Barcode: {b.copy_barcode})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Book Copy Select drop down */}
          <Form.Item name="copy_id" label="Bản sao sách bị hỏng / mất" rules={[{ required: true, message: 'Vui lòng chọn bản sao sách' }]}>
            <Select
              showSearch
              placeholder="Nhập tên sách hoặc barcode bản sao..."
              defaultActiveFirstOption={false}
              suffixIcon={null}
              filterOption={false}
              onSearch={handleSearchCopies}
              notFoundContent={searchingCopies ? <Spin size="small" /> : null}
              loading={searchingCopies}
            >
              {copies.map(c => (
                <Select.Option key={c.copy_id} value={c.copy_id}>
                  {c.book_title} (Barcode: {c.barcode})
                </Select.Option>
              ))}
            </Select>
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
