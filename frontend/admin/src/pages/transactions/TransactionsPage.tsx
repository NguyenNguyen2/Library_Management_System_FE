import { CopyOutlined, LockOutlined, CheckCircleOutlined, InfoCircleOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Flex, TableColumnsType, Tag, Tooltip, message, Card } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '@shared/components/table/FilterTable';
import { codeHooks } from '../../hooks/useCodes';
import {
  ICreateCode,
  IDetailCode,
  IListCode,
  IUpdateCode,
} from '../../types/CodeType';

// Status matches backend `CodeStatus` enum (code.entity.ts).
const CODE_STATUS = { USED: 'used', UNUSED: 'unused' } as const;
import { cn, DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import ModalCreateTransaction from './components/ModalCreateTransaction';
import { IValueLabel } from '@shared/types/UserType';

const TransactionsPage = () => {
  const { t } = useTranslation();

  // Fetch all codes for statistics
  const { data: allCodesData, isLoading: isStatsLoading } = codeHooks.useFetchListCodes({
    page: 1,
    limit: 1000,
  });

  const allCodes = allCodesData?.rows ?? [];
  const totalCodesCount = allCodes.length;
  const usedCodesCount = allCodes.filter((c) => c.status?.value === CODE_STATUS.USED).length;
  const unusedCodesCount = allCodes.filter((c) => c.status?.value === CODE_STATUS.UNUSED).length;
  const usageRate = totalCodesCount > 0 ? Math.round((usedCodesCount / totalCodesCount) * 100) : 0;

  const createMutation = codeHooks.useCreateCode();
  const deleteMutation = codeHooks.useDeleteCode();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    message.success(t(getKey('code_copied')));
  };

  const columns: TableColumnsType<IListCode> = useMemo(
    () => [
      {
        title: t(getKey('code')),
        dataIndex: 'code',
        key: 'code',
        fixed: 'left',
        width: 180,
        render: (code: string) => (
          <Flex gap={8} align="center">
            <span
              className={cn(
                'rounded bg-bgAdvanceSection px-2 py-1 font-mono text-sm font-bold text-navyDark'
              )}
            >
              {code}
            </span>
            <Tooltip title={t(getKey('copy_code'))}>
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyCode(code);
                }}
                className="hover:bg-gray-100"
              />
            </Tooltip>
          </Flex>
        ),
      },
      {
        title: t(getKey('assigned_to')),
        dataIndex: 'userInfo',
        key: 'userInfo',
        ellipsis: true,
        className: 'font-semibold text-navyDark text-left',
        render: (userInfo: IValueLabel | undefined) =>
          userInfo?.label || <span className="text-gray-400">—</span>,
      },
      {
        title: t(getKey('course')),
        dataIndex: 'coursesInfo',
        key: 'coursesInfo',
        className: 'text-left',
        render: (coursesInfo: IValueLabel[] | undefined) => (
          <Flex gap={4} wrap="wrap">
            {coursesInfo && coursesInfo.length > 0 ? (
              coursesInfo.map((course) => (
                <Tag
                  key={course.value}
                  color="blue"
                  className="!m-0 !whitespace-nowrap !rounded-md border-0 font-medium"
                >
                  {course.label}
                </Tag>
              ))
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </Flex>
        ),
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
        title: t(getKey('status')),
        dataIndex: 'status',
        key: 'status',
        width: 140,
        render: (status: { value?: string; label?: string } | undefined) => {
          const isUsed = status?.value === CODE_STATUS.USED;
          return (
            <Tag
              className={cn('!rounded-full !px-2.5 !py-0.5 font-medium border-0')}
              color={isUsed ? 'success' : 'default'}
            >
              {status?.label || t(getKey('status_unused'))}
            </Tag>
          );
        },
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
              <LockOutlined style={{ fontSize: 20 }} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tổng số thẻ</p>
              <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalCodesCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <CheckCircleOutlined style={{ fontSize: 20 }} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Đã kích hoạt</p>
              <p className="m-0 text-[20px] font-bold text-emerald-600 mt-0.5">{usedCodesCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <UnlockOutlined style={{ fontSize: 20 }} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Chưa sử dụng</p>
              <p className="m-0 text-[20px] font-bold text-amber-500 mt-0.5">{unusedCodesCount}</p>
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
              <InfoCircleOutlined style={{ fontSize: 20 }} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tỷ lệ kích hoạt</p>
              <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">{usageRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      <FilterTable<IListCode, IDetailCode, ICreateCode, IUpdateCode>
        pageTitle={t(getKey('code_management'))}
        pageSubtitle={t(getKey('code_management_desc'))}
        title={t(getKey('code_list'))}
        createButtonLabel={t(getKey('create_code'))}
        columns={columns}
        useQueryHook={codeHooks.useFetchListCodes}
        actions={{
          isDetail: false,
          isEdit: false,
          isDelete: true,
          isDeleteDisabled: (record) =>
            (record as IListCode).status?.value === CODE_STATUS.USED,
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
            modalContent: <ModalCreateTransaction />,
            modalProps: {},
            modalFunc: createMutation,
          },
        }}
      />
    </div>
  );
};

export default TransactionsPage;
