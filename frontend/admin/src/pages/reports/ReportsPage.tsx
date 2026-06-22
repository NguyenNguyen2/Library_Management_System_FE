import { useState } from 'react';
import { Card, Table, Tag, Button, Select, Space, Row, Col, Statistic, Tooltip, Typography, List, Alert } from 'antd';
import { FileExcelOutlined, FilePdfOutlined, RiseOutlined, UserOutlined, AlertOutlined, BookOutlined, BulbOutlined, ExperimentOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

const { Title, Text, Paragraph } = Typography;

const forecastData = [
  { month: 'T1', actual: 320, forecast: 310 },
  { month: 'T2', actual: 380, forecast: 360 },
  { month: 'T3', actual: 410, forecast: 420 },
  { month: 'T4', actual: 450, forecast: 460 },
  { month: 'T5', actual: 510, forecast: 520 },
  { month: 'T6', actual: 0, forecast: 580 },
  { month: 'T7', actual: 0, forecast: 640 },
  { month: 'T8', actual: 0, forecast: 720 },
];

const topBooksData = [
  { name: 'Đắc Nhân Tâm', borrows: 87 },
  { name: 'Nhà Giả Kim', borrows: 75 },
  { name: 'Sapiens', borrows: 68 },
  { name: 'Atomic Habits', borrows: 61 },
  { name: 'Tuổi Trẻ Đáng Giá', borrows: 52 },
  { name: 'Mắt Biếc', borrows: 49 },
  { name: 'Cây Cam Ngọt...', borrows: 44 },
];

const overdueList = [
  { id: 'GD-3039', reader: 'Nguyễn Văn An', book: 'Đắc Nhân Tâm', days: 12, fine: 60000 },
  { id: 'GD-3038', reader: 'Trần Thị Bình', book: 'Nhà Giả Kim', days: 8, fine: 40000 },
  { id: 'GD-3037', reader: 'Lê Hoàng Cường', book: 'Sapiens', days: 5, fine: 25000 },
  { id: 'GD-3036', reader: 'Phạm Minh Đức', book: 'Tôi Tài Giỏi', days: 3, fine: 15000 },
];

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState('Tháng này');

  const overdueColumns = [
    {
      title: 'Độc giả',
      dataIndex: 'reader',
      key: 'reader',
      render: (text: string) => <Text className="font-semibold">{text}</Text>,
    },
    {
      title: 'Sách quá hạn',
      dataIndex: 'book',
      key: 'book',
    },
    {
      title: 'Số ngày trễ',
      dataIndex: 'days',
      key: 'days',
      align: 'right' as const,
      render: (days: number) => <Text type="danger" className="font-medium">{days} ngày</Text>,
    },
    {
      title: 'Tiền phạt',
      dataIndex: 'fine',
      key: 'fine',
      align: 'right' as const,
      render: (fine: number) => <Text className="font-bold text-red-600">{fine.toLocaleString('vi-VN')}đ</Text>,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="m-0 text-[30px] font-bold leading-[36px] text-navyDark">Báo cáo & AI Insights</h1>
          <p className="m-0 mt-1 text-base leading-6 text-gray-500">Phân tích tần suất mượn trả, kiểm soát sách quá hạn và tổng hợp AI Insights</p>
        </div>
        <Space>
          <Select value={timeRange} onChange={setTimeRange} className="min-w-[120px] h-10">
            <Select.Option value="Tháng này">Tháng này</Select.Option>
            <Select.Option value="Quý này">Quý này</Select.Option>
            <Select.Option value="Năm nay">Năm nay</Select.Option>
          </Select>
          <Button icon={<FileExcelOutlined />} className="h-10 rounded-lg">Xuất Excel</Button>
          <Button type="primary" icon={<FilePdfOutlined />} className="h-10 rounded-lg">Xuất PDF</Button>
        </Space>
      </div>

      {/* Top Statistic cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]" style={{ borderLeft: '4px solid #1890ff' }}>
            <Statistic
              title="Tổng lượt mượn trả"
              value={1248}
              valueStyle={{ fontWeight: 700 }}
              prefix={<RiseOutlined className="text-blue-500 mr-2" />}
            />
            <div className="text-xs text-emerald-600 mt-2">▲ 12% so với tháng trước</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]" style={{ borderLeft: '4px solid #52c41a' }}>
            <Statistic
              title="Độc giả hoạt động"
              value={562}
              valueStyle={{ fontWeight: 700 }}
              prefix={<UserOutlined className="text-green-500 mr-2" />}
            />
            <div className="text-xs text-emerald-600 mt-2">▲ 32 độc giả hoạt động mới</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]" style={{ borderLeft: '4px solid #ff4d4f' }}>
            <Statistic
              title="Số sách quá hạn"
              value={overdueList.length}
              valueStyle={{ color: '#cf1322', fontWeight: 700 }}
              prefix={<AlertOutlined className="text-red-500 mr-2" />}
            />
            <div className="text-xs text-red-500 mt-2">Tổng phạt: 140.000đ</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm rounded-[10px]" style={{ borderLeft: '4px solid #722ed1' }}>
            <Statistic
              title="Sách đang được mượn"
              value={312}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<BookOutlined className="text-purple-500 mr-2" />}
            />
            <div className="text-xs text-gray-500 mt-2">Bản sao đang lưu thông</div>
          </Card>
        </Col>
      </Row>

      {/* Main charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Top 10 sách mượn nhiều nhất" bordered={false} className="shadow-sm rounded-[10px]">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={topBooksData} layout="vertical" margin={{ left: 20, right: 10, top: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" stroke="#8c8c8c" />
                  <YAxis type="category" dataKey="name" width={110} stroke="#8c8c8c" style={{ fontSize: 12 }} />
                  <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 12 }} />
                  <Bar dataKey="borrows" fill="#1890ff" name="Lượt mượn" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Danh sách sách trễ hạn cần xử lý" bordered={false} className="shadow-sm rounded-[10px]">
            <Table
              dataSource={overdueList}
              columns={overdueColumns}
              rowKey="id"
              pagination={false}
              size="small"
              bordered={false}
            />
          </Card>
        </Col>
      </Row>

      {/* AI Analytics Section */}
      <Card
        title={
          <Space>
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-1.5 rounded-lg flex items-center justify-center">
              <ExperimentOutlined className="text-white text-base" />
            </div>
            <Title level={4} className="!mb-0">AI Assistant & Dự đoán xu hướng</Title>
            <Tag color="purple" className="rounded-full">DeepMind Core</Tag>
          </Space>
        }
        bordered={false}
        className="shadow-sm rounded-[10px] relative overflow-hidden"
        style={{ background: 'linear-gradient(to bottom right, #f9f0ff, #f0f5ff)' }}
      >
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12}>
            <div className="bg-white/80 backdrop-blur p-5 rounded-xl border border-purple-100 shadow-sm h-full flex flex-col justify-between">
              <div>
                <Title level={5} className="!mt-0 flex items-center gap-2">
                  <BulbOutlined className="text-amber-500" /> Phân tích và Tóm tắt của AI
                </Title>
                <Paragraph className="text-gray-700 text-sm leading-relaxed mb-4">
                  Dựa trên tần suất giao dịch trong 30 ngày qua, trợ lý AI đề xuất các hành động sau:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    'Lượng mượn sách có xu hướng tăng mạnh 12% so với tháng trước, đỉnh điểm vào các ngày Thứ Sáu và Thứ Bảy.',
                    'Thể loại kỹ năng sống và tâm lý học đang có nhu cầu tăng vọt, đề xuất bổ sung thêm bản sao.',
                    'Ghi nhận tỷ lệ trễ hạn đối với độc giả dùng thẻ thường tăng nhẹ, nên kích hoạt thông báo tự động trước 2 ngày hết hạn.',
                    'Đề xuất nhập thêm đầu sách "Lược Sử Tương Lai" do có lượt tìm kiếm tăng đột biến (84 lượt tháng này).'
                  ]}
                  renderItem={(item) => (
                    <List.Item className="border-0 px-0 py-1.5 items-start">
                      <span className="text-purple-600 mr-2">•</span>
                      <Text className="text-sm text-gray-600 leading-snug">{item}</Text>
                    </List.Item>
                  )}
                />
              </div>
              <Alert
                message="Dự báo: Tháng 7 và 8 là mùa tựu trường, dự báo lượt mượn sách giáo trình và nghiên cứu sẽ tăng đột biến khoảng 25%."
                type="info"
                showIcon
                className="mt-4 border-blue-100 bg-blue-50/50"
              />
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="bg-white/80 backdrop-blur p-5 rounded-xl border border-purple-100 shadow-sm h-full">
              <Title level={5} className="!mt-0">Dự báo nhu cầu mượn 3 tháng tiếp theo</Title>
              <div style={{ width: '100%', height: 230 }} className="mt-2">
                <ResponsiveContainer>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" stroke="#8c8c8c" />
                    <YAxis stroke="#8c8c8c" />
                    <ChartTooltip contentStyle={{ borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="actual" name="Thực tế" stroke="#1890ff" strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="forecast" name="Dự đoán AI" stroke="#722ed1" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default ReportsPage;
