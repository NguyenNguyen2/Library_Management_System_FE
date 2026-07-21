import { TableColumnsType, Tag, Card, Table, Button, Input, Select, Modal, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { userHooks } from '../../hooks/useUsers';
import { ActivityLogRow } from '../../api/userApi';

export const MODULE_LABELS: Record<string, string> = {
  BOOK: 'Sách',
  SYSTEM_SETTING: 'Cấu hình hệ thống',
  USER: 'Tài khoản',
  HOLIDAY: 'Ngày nghỉ',
  EMAIL_TEMPLATE: 'Mẫu email',
  BACKUP: 'Sao lưu',
};

export const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'blue',
  DELETE: 'error',
  LOCK: 'warning',
  UNLOCK: 'success',
  BACKUP: 'purple',
};

/**
 * Nhật ký hệ thống (audit_logs / activity logs). Tách ra từ UsersPage.tsx để
 * dùng lại được ở cả UsersPage lẫn SettingsPage.
 */
const SystemActivityLogsSection = () => {
  const [keyword, setKeyword] = useState('');
  const [module, setModule] = useState<string | undefined>(undefined);
  const [action, setAction] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[string, string] | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [detailLog, setDetailLog] = useState<ActivityLogRow | null>(null);

  const { data, isLoading, refetch } = userHooks.useFetchActivityLogs({
    keyword,
    module,
    action,
    from: dateRange?.[0],
    to: dateRange?.[1],
    page,
    per_page: limit,
  });

  const columns: TableColumnsType<ActivityLogRow> = [
    {
      title: 'Thời gian',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (t: string) => (t ? dayjs(t).format('DD/MM/YYYY HH:mm:ss') : '—'),
    },
    {
      title: 'Người thực hiện',
      key: 'actor',
      className: 'text-left',
      render: (_: any, record) => record.user?.full_name || `#${record.actor_id}`,
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      width: 160,
      render: (m: string | null) => (m ? MODULE_LABELS[m] ?? m : '—'),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 110,
      render: (a: string) => (
        <Tag color={ACTION_COLORS[a] ?? 'default'} className="!rounded-md border-0 font-semibold px-2 py-0.5">
          {a}
        </Tag>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      className: 'text-left',
      render: (d: string | null) => d || '—',
    },
    {
      title: '',
      key: 'view',
      width: 100,
      render: (_: any, record) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailLog(record)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <Card className="!rounded-xl border border-gray-200 shadow-sm" bodyStyle={{ padding: '20px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <Input.Search
              placeholder="Tìm theo người thực hiện..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              style={{ width: 220 }}
            />

            <Select
              placeholder="Module"
              allowClear
              style={{ width: 170 }}
              value={module}
              onChange={(value) => {
                setModule(value);
                setPage(1);
              }}
              options={Object.entries(MODULE_LABELS).map(([value, label]) => ({ value, label }))}
            />

            <Select
              placeholder="Action"
              allowClear
              style={{ width: 140 }}
              value={action}
              onChange={(value) => {
                setAction(value);
                setPage(1);
              }}
              options={Object.keys(ACTION_COLORS).map((value) => ({ value, label: value }))}
            />

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

            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Làm mới
            </Button>
          </div>
          <div className="text-xs text-gray-500 italic">Tổng số bản ghi: {data?.total ?? 0}</div>
        </div>

        <Table
          columns={columns}
          dataSource={data?.objects ?? []}
          rowKey="audit_id"
          loading={isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.total ?? 0,
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

      <Modal
        title="Chi tiết nhật ký hoạt động"
        open={!!detailLog}
        onCancel={() => setDetailLog(null)}
        footer={null}
        width={720}
      >
        {detailLog && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Thời gian:</span> {dayjs(detailLog.created_at).format('DD/MM/YYYY HH:mm:ss')}</div>
              <div><span className="text-gray-500">Người thực hiện:</span> {detailLog.user?.full_name || `#${detailLog.actor_id}`}</div>
              <div><span className="text-gray-500">Module:</span> {detailLog.module ? MODULE_LABELS[detailLog.module] ?? detailLog.module : '—'}</div>
              <div><span className="text-gray-500">Action:</span> {detailLog.action}</div>
              <div className="col-span-2"><span className="text-gray-500">Description:</span> {detailLog.description || '—'}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-semibold mb-1 text-navyDark">Before</div>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-auto max-h-80">
                  {detailLog.old_data ? JSON.stringify(detailLog.old_data, null, 2) : 'null'}
                </pre>
              </div>
              <div>
                <div className="font-semibold mb-1 text-navyDark">After</div>
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs overflow-auto max-h-80">
                  {detailLog.new_data ? JSON.stringify(detailLog.new_data, null, 2) : 'null'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemActivityLogsSection;
