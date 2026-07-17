import { Card, Table, Button, Input, Select, Tag, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { userHooks } from '../../hooks/useUsers';

/**
 * Nhật ký truy cập (login_logs). Tách ra từ UsersPage.tsx (tên cũ: AuditLogsSection —
 * đổi tên cho khớp nghĩa, dữ liệu thực chất là login logs, không phải audit logs)
 * để dùng lại được ở cả UsersPage lẫn SettingsPage.
 */
const LoginLogsSection = () => {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const { data, isLoading, refetch } = userHooks.useFetchLoginLogs({
    keyword,
    status,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    limit,
  });

  const columns = [
    {
      title: 'Mã log',
      dataIndex: 'login_id',
      key: 'login_id',
      width: 90,
      render: (id: any) => <span className="font-mono text-xs text-gray-400">{id}</span>,
    },
    {
      title: 'Email đăng nhập',
      dataIndex: 'email_attempt',
      key: 'email_attempt',
      className: 'font-semibold text-navyDark text-left',
    },
    {
      title: 'Tên người dùng',
      dataIndex: 'user_name',
      key: 'user_name',
      className: 'text-left',
    },
    {
      title: 'Địa chỉ IP',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 130,
    },
    {
      title: 'Kết quả',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (s: string) => {
        const isSuccess = s === 'success';
        return (
          <Tag color={isSuccess ? 'success' : 'error'} className="!rounded-md border-0 font-semibold px-2 py-0.5">
            {isSuccess ? 'Thành công' : 'Thất bại'}
          </Tag>
        );
      },
    },
    {
      title: 'Lý do thất bại',
      dataIndex: 'failure_reason',
      key: 'failure_reason',
      render: (reason: string, record: any) => {
        if (record.status === 'success') return <span className="text-gray-400">—</span>;
        return <span className="text-red-500 font-medium text-xs">{reason || 'Thông tin sai'}</span>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'login_time',
      key: 'login_time',
      render: (t: string) => t ? dayjs(t).format('DD/MM/YYYY HH:mm:ss') : '—',
      width: 160,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Main card */}
      <Card className="!rounded-xl border border-gray-200 shadow-sm" bodyStyle={{ padding: '20px' }}>
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <Input.Search
              placeholder="Tìm theo email, IP..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              style={{ width: 260 }}
            />

            <Select
              placeholder="Trạng thái đăng nhập"
              allowClear
              style={{ width: 180 }}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <Select.Option value="success">Thành công</Select.Option>
              <Select.Option value="failed">Thất bại</Select.Option>
            </Select>

            <DatePicker.RangePicker
              onChange={(values) => {
                setDateRange(
                  values && values[0] && values[1]
                    ? [values[0].format('YYYY-MM-DD'), values[1].format('YYYY-MM-DD')]
                    : undefined
                );
                setPage(1);
              }}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            >
              Làm mới
            </Button>
          </div>
          <div className="text-xs text-gray-500 italic">
            Tổng số bản ghi: {data?.results?.objects?.total ?? 0}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data?.results?.objects?.rows ?? []}
          rowKey="login_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.results?.objects?.total ?? 0,
            onChange: (p, s) => {
              setPage(p);
              setLimit(s);
            },
            showSizeChanger: true,
            pageSizeOptions: ['15', '30', '50', '100'],
          }}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default LoginLogsSection;
