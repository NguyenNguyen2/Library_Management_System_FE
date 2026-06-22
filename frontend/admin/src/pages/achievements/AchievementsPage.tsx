import { TableColumnsType, Tag, Card } from 'antd';
import { TableColumnsType, Tag, Card } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrophyOutlined, BookOutlined, StarOutlined, FlagOutlined } from '@ant-design/icons';
import { TrophyOutlined, BookOutlined, StarOutlined, FlagOutlined } from '@ant-design/icons';
import { getKey } from '@shared/types/I18nKeyType';
import { COLORS } from '@shared/constants/color';
import FilterTable from '@shared/components/table/FilterTable';
import { achievementHooks } from '../../hooks/useAchievements';
import {
  ICreateAchievement,
  IDetailAchievement,
  IListAchievement,
  IUpdateAchievement,
} from '@frontend/shared/src/types/AchievementType';
import { cn, DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';
import { formatNumber } from '@shared/utils/numberUtils';
import ModalCreateEditAchievement from './components/ModalCreateEditAchievement';

// Wrapper: ignore enabled param from FilterTable so detail fetches for both detail & update modal types
const useFetchAchievementDetail = (id: string, _enabled: boolean = true) => {
  return achievementHooks.useFetchDetailAchievement(id, !!id);
};

const AchievementsPage = () => {
  const { t } = useTranslation();

  // Fetch achievements for statistics
  const { data: allAchievementsData, isLoading: isStatsLoading } = achievementHooks.useFetchListAchievements({
    page: 1,
    limit: 1000,
  });

  const allAchievements = allAchievementsData?.rows ?? [];
  const totalCount = allAchievements.length;
  
  const minRequired = allAchievements.length > 0
    ? Math.min(...allAchievements.map((a) => a.requiredCourses))
    : 0;
    
  const maxRequired = allAchievements.length > 0
    ? Math.max(...allAchievements.map((a) => a.requiredCourses))
    : 0;

  const createMutation = achievementHooks.useCreateAchievement();
  const updateMutation = achievementHooks.useUpdateAchievement();
  const deleteMutation = achievementHooks.useDeleteAchievement();

  const columns: TableColumnsType<IDetailAchievement> = useMemo(
    () => [
      {
        title: 'Mã',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        fixed: 'left',
        render: (id: string) => (
          <span className="font-mono text-xs text-gray-400 font-semibold">
            {id?.slice(0, 8).toUpperCase() || '—'}
          </span>
        ),
      },
      {
        title: 'Mã',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        fixed: 'left',
        render: (id: string) => (
          <span className="font-mono text-xs text-gray-400 font-semibold">
            {id?.slice(0, 8).toUpperCase() || '—'}
          </span>
        ),
      },
      {
        title: t(getKey('achievement_name')),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        ellipsis: true,
        className: 'font-semibold text-navyDark text-left',
        className: 'font-semibold text-navyDark text-left',
        render: (name: string) => (
          <div className={cn('flex items-center gap-2')}>
            <TrophyOutlined
              style={{ fontSize: 18, color: COLORS.goldMedium }}
              style={{ fontSize: 18, color: COLORS.goldMedium }}
            />
            <span>{name}</span>
            <span>{name}</span>
          </div>
        ),
      },
      {
        title: t(getKey('required_courses')),
        dataIndex: 'requiredCourses',
        key: 'requiredCourses',
        className: 'text-left',
        className: 'text-left',
        render: (count: number) => (
          <Tag color="blue" className="!rounded-full border-0 !px-2.5 !py-0.5 font-medium">
          <Tag color="blue" className="!rounded-full border-0 !px-2.5 !py-0.5 font-medium">
            {formatNumber(count)} {t(getKey('course')).toLowerCase()}
          </Tag>
          </Tag>
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
              <TrophyOutlined style={{ fontSize: 20 }} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tổng danh hiệu</p>
              <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalCount}</p>
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
              <BookOutlined style={{ fontSize: 20 }} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Yêu cầu thấp nhất</p>
              <p className="m-0 text-[20px] font-bold text-emerald-600 mt-0.5">{minRequired} quyển</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center bg-amber-50">
              <StarOutlined style={{ fontSize: 20 }} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Yêu cầu cao nhất</p>
              <p className="m-0 text-[20px] font-bold text-amber-500 mt-0.5">{maxRequired} quyển</p>
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
              <FlagOutlined style={{ fontSize: 20 }} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Mức độ đa dạng</p>
              <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">Khá tốt</p>
            </div>
          </div>
        </Card>
      </div>

      <FilterTable<
        IListAchievement,
        IDetailAchievement,
        ICreateAchievement,
        IUpdateAchievement
      >
        pageTitle={t(getKey('achievement_management'))}
        pageSubtitle={t(getKey('achievement_management_desc'))}
        title={t(getKey('achievement_list'))}
        createButtonLabel={t(getKey('add_achievement'))}
        columns={columns}
        useQueryHook={achievementHooks.useFetchListAchievements}
        actions={{
          isDetail: false,
          isEdit: true,
          isDelete: true,
        }}
        deleteConfirmTitle={t(getKey('achievement_delete_warning_title'))}
        deleteConfirmContent={t(getKey('achievement_delete_warning_content'))}
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
            modalContent: <ModalCreateEditAchievement />,
            modalProps: {},
            modalFunc: createMutation,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditAchievement />,
            modalProps: {},
            modalFunc: updateMutation,
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: null,
            modalProps: { footer: null },
            modalFunc: useFetchAchievementDetail,
          },
        }}
      />
    </div>
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
              <TrophyOutlined style={{ fontSize: 20 }} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tổng danh hiệu</p>
              <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalCount}</p>
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
              <BookOutlined style={{ fontSize: 20 }} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Yêu cầu thấp nhất</p>
              <p className="m-0 text-[20px] font-bold text-emerald-600 mt-0.5">{minRequired} quyển</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isStatsLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center bg-amber-50">
              <StarOutlined style={{ fontSize: 20 }} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Yêu cầu cao nhất</p>
              <p className="m-0 text-[20px] font-bold text-amber-500 mt-0.5">{maxRequired} quyển</p>
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
              <FlagOutlined style={{ fontSize: 20 }} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Mức độ đa dạng</p>
              <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">Khá tốt</p>
            </div>
          </div>
        </Card>
      </div>

      <FilterTable<
        IListAchievement,
        IDetailAchievement,
        ICreateAchievement,
        IUpdateAchievement
      >
        pageTitle={t(getKey('achievement_management'))}
        pageSubtitle={t(getKey('achievement_management_desc'))}
        title={t(getKey('achievement_list'))}
        createButtonLabel={t(getKey('add_achievement'))}
        columns={columns}
        useQueryHook={achievementHooks.useFetchListAchievements}
        actions={{
          isDetail: false,
          isEdit: true,
          isDelete: true,
        }}
        deleteConfirmTitle={t(getKey('achievement_delete_warning_title'))}
        deleteConfirmContent={t(getKey('achievement_delete_warning_content'))}
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
            modalContent: <ModalCreateEditAchievement />,
            modalProps: {},
            modalFunc: createMutation,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateEditAchievement />,
            modalProps: {},
            modalFunc: updateMutation,
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: null,
            modalProps: { footer: null },
            modalFunc: useFetchAchievementDetail,
          },
        }}
      />
    </div>
  );
};

export default AchievementsPage;
