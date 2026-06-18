import { TableColumnsType, Tag, Card } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined,
  TrophyOutlined,
  CrownOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import FilterTable from '@shared/components/table/FilterTable';
import { userHooks } from '../../hooks/useUsers';
import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
} from '@shared/types/UserType';
import { getKey } from '@shared/types/I18nKeyType';
import { DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';
import ModalCreateEditUser from './components/ModalCreateEditUser';

// Wrapper: ignore enabled param from FilterTable so detail fetches for both detail & update modal types
const useFetchUserDetail = (id: string, _enabled: boolean = true) => {
  return userHooks.useFetchDetailUser(id, !!id);
};

const UsersPage = () => {
  const { t } = useTranslation();

  // Fetch all users to calculate statistic numbers
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

  const createMutation = userHooks.useCreateUser();
  const updateMutation = userHooks.useUpdateUser();
  const deleteMutation = userHooks.useDeleteUser();

  const columns: TableColumnsType<IListUser> = useMemo(
    () => [
      {
        title: 'Mã độc giả',
        dataIndex: 'id',
        key: 'id',
        width: 110,
        fixed: 'left',
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
        fixed: 'left',
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
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: { label: string; value: string } | undefined) => {
          const isActive = status?.value === 'active' || status?.value === 'ACTIVE';
          return (
            <Tag
              color={isActive ? 'success' : 'error'}
              icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              className="!rounded-full !px-2.5 !py-0.5 font-medium border-0"
            >
              {status?.label || 'Hoạt động'}
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
    ],
    [t]
  );

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
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
              <p className="text-xs text-gray-500 m-0 font-medium">{t(getKey('user_management'))}</p>
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
              <p className="text-xs text-gray-500 m-0 font-medium">Bậc Thầy Đọc Sách</p>
              <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">{masterCount}</p>
            </div>
          </div>
        </Card>
      </div>

      <FilterTable<IListUser, IDetailUser, ICreateUser, IUpdateUser>
        pageTitle={t(getKey('user_management'))}
        pageSubtitle={t(getKey('user_management_desc'))}
        title={t(getKey('user_list'))}
        createButtonLabel={t(getKey('add_user'))}
        columns={columns}
        useQueryHook={userHooks.useFetchListUsers}
        actions={{
          isDetail: false,
          isEdit: true,
          isDelete: true,
        }}
        deleteInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: null,
            modalProps: {},
            modalFunc: deleteMutation,
          },
        }}
        createInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser />,
            modalProps: { title: null },
            modalFunc: createMutation,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser />,
            modalProps: { title: null },
            modalFunc: updateMutation,
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditUser />,
            modalProps: {},
            modalFunc: useFetchUserDetail,
          },
        }}
      />
    </div>
  );
};

export default UsersPage;
