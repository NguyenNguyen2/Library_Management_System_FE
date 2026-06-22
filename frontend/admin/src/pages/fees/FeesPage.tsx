import { useState } from 'react';
import { Card, Table, Tag, Input, Button, Badge, Modal, Form, Select, message, Typography, Space, Row, Col, Statistic, Flex } from 'antd';
import { SearchOutlined, CreditCardOutlined, DollarOutlined, HistoryOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

type Fee = {
  id: string;
  reader: string;
  book: string;
  type: 'late' | 'damage' | 'lost';
  amount: number;
  createdAt: string;
  status: 'unpaid' | 'paid' | 'partial';
  method?: 'cash' | 'card' | 'momo';
};

const INITIAL_FEES: Fee[] = [
  { id: 'PH-5021', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', type: 'late', amount: 60000, createdAt: '2026-06-01', status: 'unpaid' },
  { id: 'PH-5020', reader: 'Trần Thị Bình', book: 'Sapiens', type: 'late', amount: 40000, createdAt: '2026-06-02', status: 'paid', method: 'momo' },
  { id: 'PH-5019', reader: 'Phạm Minh Đức', book: 'Tuổi Trẻ Đáng Giá', type: 'damage', amount: 24000, createdAt: '2026-06-02', status: 'paid', method: 'cash' },
  { id: 'PH-5018', reader: 'Lê Hoàng Cường', book: 'Nhà Giả Kim', type: 'lost', amount: 120000, createdAt: '2026-05-30', status: 'partial' },
  { id: 'PH-5017', reader: 'Vũ Thanh Mai', book: 'Cây Cam Ngọt Của Tôi', type: 'late', amount: 15000, createdAt: '2026-05-29', status: 'unpaid' },
  { id: 'PH-5016', reader: 'Đỗ Văn Khải', book: 'Mắt Biếc', type: 'damage', amount: 36000, createdAt: '2026-05-28', status: 'paid', method: 'card' },
];

const TYPE_CONFIG = {
  late: { label: 'Trễ hạn', color: 'orange' },
  damage: { label: 'Hư hỏng', color: 'volcano' },
  lost: { label: 'Mất sách', color: 'red' },
} as const;

const METHOD_LABELS = {
  cash: 'Tiền mặt',
  card: 'Thẻ ngân hàng',
  momo: 'Ví MoMo',
} as const;

export function FeesPage() {
  const [fees, setFees] = useState<Fee[]>(INITIAL_FEES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Fee['status']>('all');
  
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; fee: Fee | null }>({
    open: false,
    fee: null,
  });
  const [form] = Form.useForm();

  const handlePayFeeClick = (fee: Fee) => {
    setPaymentModal({ open: true, fee });
    form.setFieldsValue({ method: 'cash' });
  };

  const handlePaymentSubmit = (values: { method: 'cash' | 'card' | 'momo' }) => {
    if (!paymentModal.fee) return;
    
    setFees(prev =>
      prev.map(f =>
        f.id === paymentModal.fee?.id
          ? { ...f, status: 'paid', method: values.method }
          : f
      )
    );

    message.success(`Đã thu thành công ${paymentModal.fee.amount.toLocaleString('vi-VN')}đ bằng hình thức ${METHOD_LABELS[values.method]}!`);
    setPaymentModal({ open: false, fee: null });
  };

  const filteredFees = fees.filter(f => {
    const matchesSearch =
      f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.reader.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.book.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || f.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
  const collectedAmount = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const unpaidAmount = fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);
  const collectionRate = totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0;

  const columns = [
    {
      title: 'Mã phí',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text className="font-mono text-xs">{id}</Text>,
    },
    {
      title: 'Độc giả',
      dataIndex: 'reader',
      key: 'reader',
      render: (name: string) => <Text className="font-semibold">{name}</Text>,
    },
    {
      title: 'Sách',
      dataIndex: 'book',
      key: 'book',
    },
    {
      title: 'Loại phí',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof TYPE_CONFIG) => {
        const config = TYPE_CONFIG[type];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as const,
      render: (amount: number) => <Text className="font-semibold text-navyDark">{amount.toLocaleString('vi-VN')}đ</Text>,
    },
    {
      title: 'Ngày phát sinh',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Fee['status'], record: Fee) => {
        if (status === 'paid' && record.method) {
          return (
            <Badge status="success" text={`Đã thu (${METHOD_LABELS[record.method]})`} />
          );
        } else if (status === 'partial') {
          return <Badge status="warning" text="Trả 1 phần" />;
        } else {
          return <Badge status="error" text="Chưa thu" />;
        }
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'right' as const,
      render: (_: unknown, record: Fee) => {
        if (record.status !== 'paid') {
          return (
            <Button
              type="primary"
              size="small"
              onClick={() => handlePayFeeClick(record)}
            >
              Thu phí
            </Button>
          );
        }
        return <Button size="small">Biên lai</Button>;
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <h1 className="m-0 text-[30px] font-bold leading-[36px] text-navyDark">Quản lý phí & thanh toán</h1>
        <p className="m-0 mt-1 text-base leading-6 text-gray-500">Theo dõi phí trễ hạn, phạt hỏng/mất sách và ghi nhận thanh toán tại quầy</p>
      </div>

      {/* Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]">
            <Statistic
              title="Tổng phí phát sinh"
              value={totalAmount}
              suffix="đ"
              valueStyle={{ fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]">
            <Statistic
              title="Đã thu"
              value={collectedAmount}
              suffix="đ"
              valueStyle={{ color: '#389e0d', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]">
            <Statistic
              title="Chưa thu"
              value={unpaidAmount}
              suffix="đ"
              valueStyle={{ color: '#cf1322', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]">
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={collectionRate}
              suffix="%"
              valueStyle={{ color: '#096dd9', fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table block */}
      <Card bordered={false} className="shadow-sm rounded-[10px] p-2">
        <Flex justify="space-between" align="center" className="mb-4" wrap="wrap" gap={12}>
          <Input
            placeholder="Tìm theo mã phí, độc giả, sách..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full max-w-sm rounded-lg"
          />
          <Space>
            {(['all', 'unpaid', 'partial', 'paid'] as const).map(status => (
              <Button
                key={status}
                type={filterStatus === status ? 'primary' : 'default'}
                onClick={() => setFilterStatus(status)}
                className="rounded-lg"
              >
                {status === 'all' ? 'Tất cả' : status === 'unpaid' ? 'Chưa thu' : status === 'partial' ? 'Trả 1 phần' : 'Đã thu'}
              </Button>
            ))}
          </Space>
        </Flex>

        <Table
          dataSource={filteredFees}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8 }}
          bordered={false}
          className="rounded-lg"
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        title={`Thu phí giao dịch: ${paymentModal.fee?.id}`}
        open={paymentModal.open}
        onCancel={() => setPaymentModal({ open: false, fee: null })}
        footer={null}
        destroyOnClose
        className="rounded-xl overflow-hidden"
      >
        <Form form={form} layout="vertical" onFinish={handlePaymentSubmit}>
          <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2 border border-gray-100">
            <div><Text className="text-gray-500">Độc giả: </Text><Text className="font-semibold">{paymentModal.fee?.reader}</Text></div>
            <div><Text className="text-gray-500">Sách: </Text><Text className="font-medium">{paymentModal.fee?.book}</Text></div>
            <div><Text className="text-gray-500">Số tiền cần nộp: </Text><Text className="font-bold text-lg text-navyDark">{paymentModal.fee?.amount.toLocaleString('vi-VN')}đ</Text></div>
          </div>

          <Form.Item
            name="method"
            label={<Text className="font-semibold text-gray-700">Hình thức thanh toán</Text>}
            rules={[{ required: true, message: 'Vui lòng chọn hình thức thanh toán!' }]}
          >
            <Select className="h-10 rounded-lg">
              <Select.Option value="cash"><DollarOutlined className="mr-1.5" /> Tiền mặt</Select.Option>
              <Select.Option value="card"><CreditCardOutlined className="mr-1.5" /> Chuyển khoản ngân hàng</Select.Option>
              <Select.Option value="momo"><HistoryOutlined className="mr-1.5" /> Ví điện tử MoMo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setPaymentModal({ open: false, fee: null })} className="rounded-lg">Hủy</Button>
              <Button type="primary" htmlType="submit" className="rounded-lg">Xác nhận thanh toán</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default FeesPage;
