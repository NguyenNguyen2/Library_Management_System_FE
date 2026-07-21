import { TableColumnsType, Tag, Card, Table, Button, Input, Select, Modal, Form, Space, message, Row, Col, Tooltip, Segmented } from 'antd';
import dayjs from 'dayjs';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  TrophyOutlined,
  CrownOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  KeyOutlined,
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { ROUTES } from '../../constants/routers';
import FilterTable from '@shared/components/table/FilterTable';
import { userHooks } from '../../hooks/useUsers';
import { userApi } from '../../api/userApi';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';
import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
} from '@shared/types/UserType';
import { getKey } from '@shared/types/I18nKeyType';
import { DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';
import ModalCreateEditUser from './components/ModalCreateEditUser';
import LoginLogsSection from '../../components/logs/LoginLogsSection';
import SystemActivityLogsSection from '../../components/logs/SystemActivityLogsSection';

// Wrapper: ignore enabled param from FilterTable so detail fetches for both detail & update modal types
const useFetchUserDetail = (id: string, _enabled: boolean = true) => {
  return userHooks.useFetchDetailUser(id, !!id);
};

const LibrariansSection = ({ addTrigger, onTriggerReset }: { addTrigger: number; onTriggerReset: () => void }) => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLibrarian, setEditingLibrarian] = useState<any>(null);
  const [form] = Form.useForm();

  // Listen to parent action button trigger
  useEffect(() => {
    if (addTrigger > 0) {
      handleOpenAddModal();
      onTriggerReset();
    }
  }, [addTrigger]);

  // Queries
  const { data, isLoading, refetch } = userHooks.useFetchLibrarians({
    keyword,
    page,
    limit,
  });

  const { data: allLibrariansData } = userHooks.useFetchLibrarians({
    page: 1,
    limit: 1000,
  });

  const librarians = allLibrariansData?.results?.objects?.rows ?? [];
  const totalLibrarians = allLibrariansData?.results?.objects?.total ?? 0;
  const headCount = librarians.filter((l: any) => l.librarian_level === 'head').length;
  const assistantCount = librarians.filter((l: any) => l.librarian_level === 'assistant').length;
  const viewOnlyCount = librarians.filter((l: any) => l.librarian_level === 'view_only').length;

  // Mutations
  const createMutation = userHooks.useCreateLibrarian();
  const updateMutation = userHooks.useUpdateLibrarian();
  const deleteMutation = userHooks.useDeleteLibrarian();
  const resetPasswordMutation = userHooks.useResetLibrarianPassword();

  const handleOpenAddModal = () => {
    setEditingLibrarian(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingLibrarian(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      librarian_level: record.librarian_level,
      phone: record.phone,
      address: record.address,
      status: record.status?.value,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    if (editingLibrarian) {
      updateMutation.mutate(
        {
          id: editingLibrarian.id,
          body: {
            name: values.name,
            email: values.email,
            librarian_level: values.librarian_level,
            phone: values.phone,
            address: values.address,
            status: parseInt(values.status),
          },
        },
        {
          onSuccess: () => {
            message.success('Cập nhật tài khoản thủ thư thành công!');
            setIsModalOpen(false);
            refetch();
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể cập nhật tài khoản thủ thư. Vui lòng thử lại.');
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          name: values.name,
          email: values.email,
          librarian_level: values.librarian_level,
          phone: values.phone,
          address: values.address,
        },
        {
          onSuccess: (res: any) => {
            Modal.success({
              title: 'Tạo thủ thư thành công',
              content: (
                <div className="text-left">
                  <p>Tài khoản thủ thư đã được tạo.</p>
                  <p><strong>Email:</strong> {res.email}</p>
                  <p><strong>Mật khẩu tạm thời:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold text-red-600 select-all">{res.temp_password}</code></p>
                  <p className="text-xs text-gray-500 mt-2">
                    {res.email_sent ? '📧 Email thông tin tài khoản đã được gửi.' : '⚠️ Không thể gửi email (lỗi SMTP). Hãy copy mật khẩu tạm này để giao cho thủ thư.'}
                  </p>
                </div>
              ),
            });
            setIsModalOpen(false);
            refetch();
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể tạo tài khoản thủ thư. Vui lòng thử lại.');
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xóa thủ thư',
      content: 'Bạn có chắc chắn muốn xóa tài khoản thủ thư này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deleteMutation.mutate(id, {
          onSuccess: () => {
            message.success('Xóa thủ thư thành công.');
            refetch();
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể xóa thủ thư.');
          },
        });
      },
    });
  };

  const handleResetPassword = (id: string) => {
    Modal.confirm({
      title: 'Khôi phục mật khẩu',
      content: 'Khôi phục mật khẩu của thủ thư này về mật khẩu mặc định (12345678)?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        resetPasswordMutation.mutate(id, {
          onSuccess: () => {
            message.success('Khôi phục mật khẩu mặc định thành công (12345678).');
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể khôi phục mật khẩu.');
          },
        });
      },
    });
  };

  const columns = [
    {
      title: 'Mã thủ thư',
      dataIndex: 'id',
      key: 'id',
      width: 110,
      render: (id: string) => (
        <span className="font-mono text-xs text-gray-400 font-semibold">
          {id?.slice(0, 8).toUpperCase() || '—'}
        </span>
      ),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      className: 'font-semibold text-navyDark text-left',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'text-left',
    },
    {
      title: 'Phân quyền / Vai trò',
      dataIndex: 'librarian_level',
      key: 'librarian_level',
      render: (level: string) => {
        let color = 'default';
        let label = 'Không xác định';
        if (level === 'head') { color = 'volcano'; label = 'Thủ thư trưởng (Toàn quyền)'; }
        else if (level === 'assistant') { color = 'blue'; label = 'Thủ thư phụ (Không xóa)'; }
        else if (level === 'view_only') { color = 'default'; label = 'Chỉ xem'; }
        return (
          <Tag color={color} className="!rounded-md border-0 font-medium">
            {label}
          </Tag>
        );
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (p: string) => p || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => {
        const isActive = status?.value === '1';
        return (
          <Tag
            color={isActive ? 'success' : 'error'}
            icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            className="!rounded-full !px-2.5 !py-0.5 font-medium border-0"
          >
            {isActive ? 'Hoạt động' : 'Đang khóa'}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => d ? dayjs(d).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Reset mật khẩu">
            <Button
              type="text"
              icon={<KeyOutlined className="text-amber-500" />}
              onClick={() => handleResetPassword(record.id)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <Card className="!rounded-[10px] border border-gray-200 shadow-sm animate-fade-in" bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <UserOutlined style={{ fontSize: 20 }} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tổng số thủ thư</p>
              <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalLibrarians}</p>
            </div>
          </div>
        </Card>

        <Card className="!rounded-[10px] border border-gray-200 shadow-sm" bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <CrownOutlined style={{ fontSize: 20 }} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Thủ thư trưởng</p>
              <p className="m-0 text-[20px] font-bold text-red-600 mt-0.5">{headCount}</p>
            </div>
          </div>
        </Card>

        <Card className="!rounded-[10px] border border-gray-200 shadow-sm" bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <TrophyOutlined style={{ fontSize: 20 }} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Thủ thư phụ</p>
              <p className="m-0 text-[20px] font-bold text-blue-500 mt-0.5">{assistantCount}</p>
            </div>
          </div>
        </Card>

        <Card className="!rounded-[10px] border border-gray-200 shadow-sm" bodyStyle={{ padding: '16px' }}>
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center bg-slate-55">
              <BookOutlined style={{ fontSize: 20 }} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Chỉ xem</p>
              <p className="m-0 text-[20px] font-bold text-gray-600 mt-0.5">{viewOnlyCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main content table card */}
      <Card className="!rounded-xl border border-gray-200 shadow-sm" bodyStyle={{ padding: '20px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h2 className="text-lg font-bold text-navyDark m-0 text-left">Danh sách tài khoản thủ thư</h2>
          <div className="flex items-center gap-3">
            <Input.Search
              placeholder="Tìm theo tên, email, sđt..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              style={{ width: 280 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data?.results?.objects?.rows ?? []}
          rowKey="id"
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
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          className="custom-table"
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        title={editingLibrarian ? 'Chỉnh sửa tài khoản thủ thư' : 'Tạo thủ thư mới'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={550}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ librarian_level: 'assistant', status: '1' }}
          className="mt-4 text-left"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Form.Item
            name="name"
            label="Họ và tên thủ thư"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ và tên..." size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Địa chỉ email đăng nhập"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="username@domain.com" size="large" disabled={!!editingLibrarian} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="librarian_level"
                label="Cấp bậc / Phân quyền"
                rules={[{ required: true, message: 'Chọn phân quyền cho thủ thư' }]}
              >
                <Select size="large">
                  <Select.Option value="head">Thủ thư trưởng (Toàn quyền)</Select.Option>
                  <Select.Option value="assistant">Thủ thư phụ (Không xóa)</Select.Option>
                  <Select.Option value="view_only">Chỉ xem</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            
            {editingLibrarian && (
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="Trạng thái tài khoản"
                  rules={[{ required: true, message: 'Chọn trạng thái tài khoản' }]}
                >
                  <Select size="large">
                    <Select.Option value="1">Hoạt động</Select.Option>
                    <Select.Option value="0">Đang khóa</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            )}
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại (tùy chọn)">
                <Input placeholder="09xxxxxxx" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Địa chỉ liên hệ (tùy chọn)">
                <Input placeholder="Nhập địa chỉ..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Xác nhận lưu
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

const ReadersSection = ({ addTrigger, onTriggerReset }: { addTrigger: number; onTriggerReset: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEmailOtpModalOpen, setIsEmailOtpModalOpen] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [isVerifyingEmailOtp, setIsVerifyingEmailOtp] = useState(false);
  const [pendingReaderValues, setPendingReaderValues] = useState<any>(null);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [editingReader, setEditingReader] = useState<{ record: any; index: number } | null>(null);
  const [form] = Form.useForm();

  const startResendCountdown = (seconds = 60) => {
    setResendCountdown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleResendOtp = () => {
    if (!pendingReaderValues?.email || resendCountdown > 0 || isSendingEmailOtp) return;
    setIsSendingEmailOtp(true);
    startResendCountdown(60);
    userApi
      .requestReaderEmailOtp(pendingReaderValues.email)
      .then(() => {
        message.success(`Đã gửi lại mã OTP tới ${pendingReaderValues.email}`);
      })
      .catch((err: any) => {
        message.error(err?.response?.data?.message || 'Không thể gửi lại mã OTP.');
      })
      .finally(() => setIsSendingEmailOtp(false));
  };

  // Listen to parent action button trigger
  useEffect(() => {
    if (addTrigger > 0) {
      handleOpenAddModal();
      onTriggerReset();
    }
  }, [addTrigger]);

  // Queries
  const { data, isLoading, refetch } = userHooks.useFetchListUsers({
    keyword,
    page,
    limit,
  });

  const { data: allUsersData, isLoading: isStatsLoading } = userHooks.useFetchListUsers({
    page: 1,
    limit: 1000,
  });

  const allUsers = allUsersData?.rows ?? [];
  const totalUsersCount = allUsers.length;
  
  const newStudentCount = allUsers.filter(
    (u) =>
      u.achievement?.label === 'Độc giả Mới' ||
      u.achievement?.value === 'new' ||
      u.achievement?.label?.toLowerCase().includes('mới')
  ).length;

  const expertCount = allUsers.filter(
    (u) =>
      u.achievement?.label === 'Độc giả Thân Thiết' ||
      u.achievement?.value === 'expert' ||
      u.achievement?.label?.toLowerCase().includes('thân thiết')
  ).length;

  const masterCount = allUsers.filter(
    (u) =>
      u.achievement?.label === 'Bậc Thầy Đọc Sách' ||
      u.achievement?.value === 'master' ||
      u.achievement?.label?.toLowerCase().includes('bậc thầy')
  ).length;

  // Mutations
  const createMutation = userHooks.useCreateUser();
  const updateMutation = userHooks.useUpdateUser();
  const deleteMutation = userHooks.useDeleteUser();

  const handleOpenAddModal = () => {
    setEditingReader(null);
    form.resetFields();
    // antd bỏ qua giá trị `undefined` trong setFieldsValue (coi như "không đổi") —
    // phải dùng `null` để đảm bảo xóa sạch dữ liệu của lần sửa độc giả trước đó,
    // tránh rò rỉ SĐT/địa chỉ/ảnh của người khác sang phiếu tạo mới.
    form.setFieldsValue({
      phone: null,
      address: null,
      avatar: null,
      date_of_birth: null,
      gender: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: any, index: number) => {
    setEditingReader({ record, index });
    // Dùng `null` thay vì `undefined` — antd setFieldsValue bỏ qua field có giá trị
    // `undefined` (coi như giữ nguyên), nên nếu record thiếu trường sẽ vô tình giữ lại
    // dữ liệu của độc giả được sửa trước đó.
    form.setFieldsValue({
      name: record.name ?? null,
      email: record.email ?? null,
      phone: record.phone ?? null,
      address: record.address ?? null,
      avatar: record.avatar ?? null,
      date_of_birth: record.date_of_birth ? dayjs(record.date_of_birth) : null,
      gender: record.gender ?? null,
      status: record.status?.value,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (values: any) => {
    const body: any = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      address: values.address,
      avatar: values.avatar,
      date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : null,
      gender: values.gender ?? null,
      status: values.status,
    };
    if (editingReader) {
      updateMutation.mutate(
        {
          id: editingReader.record.id,
          body,
          index: editingReader.index,
          params: { page, limit, keyword },
        },
        {
          onSuccess: () => {
            message.success('Cập nhật tài khoản độc giả thành công!');
            setIsModalOpen(false);
            refetch();
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể cập nhật tài khoản độc giả. Vui lòng thử lại.');
          },
        }
      );
    } else {
      setPendingReaderValues({ ...body, password: values.password });
      setEmailOtp('');
      setIsSendingEmailOtp(true);

      // Đóng giao diện thêm độc giả và mở giao diện nhập mã xác nhận (OTP) ngay lập tức
      setIsModalOpen(false);
      setIsEmailOtpModalOpen(true);
      startResendCountdown(60);

      userApi.requestReaderEmailOtp(values.email)
        .then(() => {
          message.success(`Mã OTP đã được gửi tới ${values.email}. Vui lòng nhập mã để hoàn tất.`);
        })
        .catch((err: any) => {
          message.error(err?.response?.data?.message || 'Không thể gửi mã xác thực email.');
        })
        .finally(() => setIsSendingEmailOtp(false));
    }
  };

  const handleVerifyReaderEmail = async () => {
    if (!pendingReaderValues || emailOtp.trim().length !== 6) return;
    setIsVerifyingEmailOtp(true);
    try {
      const verificationToken = await userApi.verifyReaderEmailOtp(
        pendingReaderValues.email,
        emailOtp.trim()
      );
      createMutation.mutate(
        {
          body: { ...pendingReaderValues, email_verification_token: verificationToken },
          params: { page, limit, keyword },
        },
        {
          onSuccess: () => {
            message.success('Tạo tài khoản độc giả thành công!');
            setIsEmailOtpModalOpen(false);
            setIsModalOpen(false);
            setPendingReaderValues(null);
            refetch();
          },
          onError: (err: any) => {
            message.error(err?.response?.data?.message || 'Không thể tạo tài khoản độc giả. Vui lòng thử lại.');
          },
        }
      );
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Mã xác thực không chính xác.');
    } finally {
      setIsVerifyingEmailOtp(false);
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xóa độc giả',
      content: 'Bạn có chắc chắn muốn xóa tài khoản độc giả này không? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deleteMutation.mutate(
          { id, params: { page, limit, keyword } },
          {
            onSuccess: () => {
              message.success('Xóa độc giả thành công.');
              refetch();
            },
            onError: (err: any) => {
              message.error(err?.response?.data?.message || 'Không thể xóa độc giả.');
            },
          }
        );
      },
    });
  };

  const resetPasswordMutation = userHooks.useResetUserPassword();

  const handleResetPassword = (id: string) => {
    Modal.confirm({
      title: 'Khôi phục mật khẩu',
      content: 'Khôi phục mật khẩu của độc giả này về mật khẩu mặc định (12345678)?',
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => {
        resetPasswordMutation.mutate(
          { id },
          {
            onSuccess: () => {
              message.success('Khôi phục mật khẩu mặc định thành công (12345678).');
            },
            onError: (err: any) => {
              message.error(err?.response?.data?.message || 'Không thể khôi phục mật khẩu.');
            },
          }
        );
      },
    });
  };

  const columns: TableColumnsType<IListUser> = useMemo(
    () => [
      {
        title: 'Mã độc giả',
        dataIndex: 'id',
        key: 'id',
        width: 110,
        render: (id: string) => (
          <span className="font-mono text-xs text-gray-400 font-semibold">
            {id?.slice(0, 8).toUpperCase() || '—'}
          </span>
        ),
      },
      {
        title: t(getKey('full_name')),
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        className: 'font-semibold text-navyDark text-left',
      },
      {
        title: t(getKey('email')),
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
        className: 'text-left',
      },
      {
        title: 'Danh hiệu / Thẻ',
        dataIndex: 'achievement',
        key: 'achievement',
        render: (achievement: { label: string; value: string } | undefined) => {
          if (!achievement || !achievement.label) {
            return <span className="text-gray-400">—</span>;
          }
          const label = achievement.label;
          let color = 'default';
          if (label.includes('Mới')) color = 'blue';
          else if (label.includes('Thân Thiết')) color = 'gold';
          else if (label.includes('Bậc Thầy')) color = 'purple';
          
          return (
            <Tag color={color} className="!rounded-md border-0 font-medium">
              {label}
            </Tag>
          );
        },
      },
      {
        title: 'Số thẻ',
        dataIndex: 'card_number',
        key: 'card_number',
        width: 120,
        render: (cardNumber: string | undefined) => (
          <span className="font-mono text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
            {cardNumber || '—'}
          </span>
        ),
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: { label: string; value: string | number } | undefined) => {
          const isActive = status?.value === 'active' || status?.value === 'ACTIVE' || status?.value === '1' || status?.value === 1;
          return (
            <Tag
              color={isActive ? 'success' : 'error'}
              icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              className="!rounded-full !px-2.5 !py-0.5 font-medium border-0"
            >
              {isActive ? 'Hoạt động' : 'Đang khóa'}
            </Tag>
          );
        },
      },
      {
        title: t(getKey('created_date')),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format(DATE_DISPLAY_FORMAT) : '',
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 180,
        render: (_: any, record: any, index: number) => (
          <Space size="small">
            <Tooltip title="Lịch sử độc giả">
              <Button
                type="text"
                icon={<HistoryOutlined className="text-indigo-500" />}
                onClick={() => navigate(ROUTES.USER_HISTORY.replace(':userId', String(record.id)))}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-blue-600" />}
                onClick={() => handleOpenEditModal(record, index)}
              />
            </Tooltip>
            <Tooltip title="Reset mật khẩu">
              <Button
                type="text"
                icon={<KeyOutlined className="text-amber-500" />}
                onClick={() => handleResetPassword(record.id)}
              />
            </Tooltip>
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.id)}
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <UserOutlined style={{ fontSize: 20 }} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tổng Độc giả</p>
              <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalUsersCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <TrophyOutlined style={{ fontSize: 20 }} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Độc giả Mới</p>
              <p className="m-0 text-[20px] font-bold text-blue-500 mt-0.5">{newStudentCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-gold-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center bg-amber-50">
              <CrownOutlined style={{ fontSize: 20 }} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Độc giả Thân Thiết</p>
              <p className="m-0 text-[20px] font-bold text-amber-500 mt-0.5">{expertCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <BookOutlined style={{ fontSize: 20 }} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Bậc Thầy Độc Sách</p>
              <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">{masterCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main content table card */}
      <Card className="!rounded-xl border border-gray-200 shadow-sm" bodyStyle={{ padding: '20px' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <h2 className="text-lg font-bold text-navyDark m-0 text-left">Danh sách độc giả</h2>
          <div className="flex items-center gap-3">
            <Input.Search
              placeholder="Tìm độc giả, email..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              style={{ width: 280 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={data?.rows ?? []}
          rowKey="id"
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
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          className="custom-table"
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{ status: '1' }}
          className="mt-4 text-left"
          disabled={createMutation.isPending || updateMutation.isPending || isSendingEmailOtp}
        >
          <ModalCreateEditUser detail={editingReader?.record} />

          <div className="flex justify-end gap-3 mt-6">
            <Button size="large" onClick={() => setIsModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              Xác nhận lưu
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal nhập mã OTP xác thực email độc giả */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <KeyOutlined className="text-blue-600 text-lg" />
            <span>Xác thực email độc giả</span>
          </div>
        }
        open={isEmailOtpModalOpen}
        onCancel={() => {
          setIsEmailOtpModalOpen(false);
          setEmailOtp('');
        }}
        onOk={handleVerifyReaderEmail}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={isVerifyingEmailOtp || createMutation.isPending}
        okButtonProps={{ disabled: isSendingEmailOtp || emailOtp.trim().length !== 6 }}
        destroyOnClose
        centered
        width={450}
      >
        <div className="py-2 text-left">
          <p className="mb-4 text-gray-600 text-sm">
            Mã OTP 6 số đã được gửi tới email{' '}
            <strong className="text-blue-600 font-semibold">{pendingReaderValues?.email}</strong>.
            Mã có hiệu lực trong 5 phút.
          </p>

          {isSendingEmailOtp && (
            <div className="mb-3 text-sm text-blue-500 flex items-center gap-2 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
              <ReloadOutlined spin />
              <span>Đang gửi mã xác thực tới email...</span>
            </div>
          )}

          <div className="mb-5 flex justify-center">
            <Input.OTP
              length={6}
              value={emailOtp}
              onChange={(value) => setEmailOtp(value)}
              size="large"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
            <span>Chưa nhận được mã?</span>
            <Button
              type="link"
              size="small"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0 || isSendingEmailOtp}
              className="!p-0 !h-auto text-xs"
            >
              {resendCountdown > 0 ? `Gửi lại mã (${resendCountdown}s)` : 'Gửi lại mã OTP'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const UsersPage = () => {
  const { user } = useGlobalVariable();
  const isAdmin = user?.role === 'admin';

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = isAdmin ? (searchParams.get('tab') || 'readers') : 'readers';
  const [readerAddTrigger, setReaderAddTrigger] = useState(0);
  const [librarianAddTrigger, setLibrarianAddTrigger] = useState(0);

  const handleTabChange = (value: any) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 text-left">
      {/* Header Row with Segmented Control and Action Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div>
          <h1 className="text-[30px] font-bold text-navyDark m-0">
            {activeTab === 'readers'
              ? 'Quản lý Độc giả'
              : activeTab === 'librarians'
                ? 'Quản lý Thủ thư'
                : activeTab === 'system-log'
                  ? 'Nhật ký hoạt động hệ thống'
                  : 'Nhật ký truy cập'}
          </h1>
          <p className="text-gray-500 m-0 mt-1">
            {activeTab === 'readers'
              ? 'Cấp thẻ, theo dõi trạng thái và quản lý danh hiệu độc giả.'
              : activeTab === 'librarians'
                ? 'Cấp quyền, tạo tài khoản và phân quyền quản trị cho thủ thư.'
                : activeTab === 'system-log'
                  ? 'Theo dõi các thay đổi nhạy cảm: sửa sách, đổi cấu hình, khóa/mở khóa tài khoản.'
                  : 'Theo dõi nhật ký đăng nhập và bảo mật hệ thống.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <Segmented
            options={
              isAdmin
                ? [
                    { label: 'Độc giả', value: 'readers' },
                    { label: 'Thủ thư', value: 'librarians' },
                    { label: 'Nhật ký truy cập', value: 'audit' },
                    { label: 'Nhật ký hệ thống', value: 'system-log' },
                  ]
                : [{ label: 'Độc giả', value: 'readers' }]
            }
            value={activeTab}
            onChange={handleTabChange}
            className="p-1 bg-gray-100 rounded-lg text-sm font-medium"
          />
          {activeTab === 'readers' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setReaderAddTrigger((prev) => prev + 1)}
              className="!rounded-lg font-medium"
              size="large"
            >
              Thêm độc giả
            </Button>
          )}
          {activeTab === 'librarians' && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setLibrarianAddTrigger((prev) => prev + 1)}
              className="!rounded-lg font-medium"
              size="large"
            >
              Thêm thủ thư
            </Button>
          )}
        </div>
      </div>

      {/* Main Tab Render */}
      {activeTab === 'readers' && (
        <ReadersSection
          addTrigger={readerAddTrigger}
          onTriggerReset={() => setReaderAddTrigger(0)}
        />
      )}
      {activeTab === 'librarians' && (
        <LibrariansSection
          addTrigger={librarianAddTrigger}
          onTriggerReset={() => setLibrarianAddTrigger(0)}
        />
      )}
      {activeTab === 'audit' && <LoginLogsSection />}
      {activeTab === 'system-log' && <SystemActivityLogsSection />}
    </div>
  );
};

export default UsersPage;
