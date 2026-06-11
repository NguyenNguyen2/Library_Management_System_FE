import { Card, Flex, Pagination, Typography } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn, DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';
import {
  BookOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ColumnChart from '@shared/components/chart/ColumnChart';
import PieChart from '@shared/components/chart/PieChart';
import { dashboardHooks } from '../../hooks/useDashboard';
import { COLORS } from '@shared/constants/color';
import { formatNumber } from '@shared/utils/numberUtils';
import dayjs from 'dayjs';

const { Text } = Typography;

const ACTIVITIES_PAGE_SIZE = 5;

const DashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = dashboardHooks.useFetchDashboard();

  const stats = data?.stats;
  const studentsPerCourse = data?.studentsPerCourse ?? [];
  const learningProgress = data?.learningProgress ?? [];

  // Activities are paginated independently of the other dashboard blocks,
  // so re-fetching a page doesn't reload the stat cards and charts.
  const [activitiesPage, setActivitiesPage] = useState(1);
  const { data: activitiesData, isLoading: isLoadingActivities } =
    dashboardHooks.useFetchRecentActivities({
      page: activitiesPage,
      limit: ACTIVITIES_PAGE_SIZE,
    });
  const recentActivities = activitiesData?.rows ?? [];
  const totalActivities = activitiesData?.total ?? 0;

  const statCards = [
    {
      title: t(getKey('total_users')),
      value: formatNumber(stats?.totalUsers ?? 0),
      sub: String(
        t(getKey('total_users_sub'), {
          count: formatNumber(stats?.activeUsers ?? 0),
        } as Record<string, unknown>)
      ),
      icon: <TeamOutlined style={{ fontSize: 16 }} />,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      title: t(getKey('total_courses')),
      value: formatNumber(stats?.totalCourses ?? 0),
      sub: String(
        t(getKey('total_courses_sub'), {
          count: formatNumber(stats?.totalLessons ?? 0),
        } as Record<string, unknown>)
      ),
      icon: <BookOutlined style={{ fontSize: 16 }} />,
      color: 'text-green-500 bg-green-50',
    },
    {
      title: t(getKey('total_questions')),
      value: formatNumber(stats?.totalQuestions ?? 0),
      sub: t(getKey('total_questions_sub')),
      icon: <QuestionCircleOutlined style={{ fontSize: 16 }} />,
      color: 'text-orange-500 bg-orange-50',
    },
    {
      title: t(getKey('total_activation_codes')),
      value: formatNumber(stats?.totalCodes ?? 0),
      sub: String(
        t(getKey('total_activation_codes_sub'), {
          count: formatNumber(stats?.usedCodes ?? 0),
        } as Record<string, unknown>)
      ),
      icon: <KeyOutlined style={{ fontSize: 16 }} />,
      color: 'text-red-500 bg-red-50',
    },
  ];

  return (
    <div className={cn('flex flex-col gap-8')}>
      {/* Page Header — matches the h1/p pattern used by FilterTable on other admin pages. */}
      <div>
        <h1 className="m-0 text-[30px] font-bold leading-[36px] text-navyDark">
          {t(getKey('dashboard'))}
        </h1>
        <p className="m-0 mt-1 text-base leading-6 text-grayDark">
          {t(getKey('dashboard_subtitle'))}
        </p>
      </div>

      {/* Stat Cards - 2x2 grid */}
      <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2')}>
        {statCards?.map((card) => (
          <Card
            key={card?.title}
            className={cn('!rounded-[10px] border border-gray-200 shadow-sm')}
            loading={isLoading}
          >
            <Flex justify="space-between" align="start">
              <Text className="text-sm font-medium text-gray-500">
                {card?.title}
              </Text>
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-full',
                  card?.color
                )}
              >
                {card?.icon}
              </div>
            </Flex>
            <div className="mt-2">
              <Text className="!text-2xl !font-bold">{card?.value}</Text>
            </div>
            <Text className="text-xs text-gray-500">{card?.sub}</Text>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className={cn('grid grid-cols-1 gap-6')}>
        {/* Bar Chart */}
        <Card
          className={cn('!rounded-[10px] border border-gray-200 shadow-sm')}
          loading={isLoading}
        >
          <ColumnChart
            title={t(getKey('students_per_course'))}
            categories={studentsPerCourse?.map((item) => item?.courseName)}
            series={[
              {
                name: t(getKey('students_legend')),
                data: studentsPerCourse?.map((item) => item?.studentCount),
                color: COLORS.chartBarStudent,
              },
            ]}
            height={300}
            columnWidth="100px"
            showLegend
            yLabelFormatter={(v) => formatNumber(Math.round(v))}
          />
        </Card>

        {/* Pie Chart */}
        <Card
          className={cn('!rounded-[10px] border border-gray-200 shadow-sm')}
          loading={isLoading}
        >
          <PieChart
            title={t(getKey('learning_progress'))}
            data={learningProgress?.map((item) => ({
              label: item?.label,
              value: item?.value,
              color: item?.color,
            }))}
            height={300}
            showLegend
          />
        </Card>
      </div>

      {/* Recent Activities */}
      <Card
        className={cn('!rounded-[10px] border border-gray-200 shadow-sm')}
        loading={isLoadingActivities}
      >
        {/* Card section title — mirrors `.filter-table-title` (18px, 600). */}
        <h3 className="m-0 mb-4 text-lg font-semibold leading-none text-nearBlack">
          {t(getKey('recent_activities'))}
        </h3>
        <div className={cn('flex flex-col')}>
          {recentActivities?.map((activity, index) => (
            <div
              key={activity?.id}
              className={cn(
                'flex items-center gap-4 py-3',
                index < recentActivities?.length - 1 &&
                  'border-b border-black/10'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100'
                )}
              >
                <UserOutlined
                  style={{ fontSize: 14 }}
                  className="text-blue-500"
                />
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <Text className="block text-base font-medium">
                  {activity?.userName}
                </Text>
                <Text className="block text-sm text-gray-500">
                  {t(getKey('activated_course'), {
                    course: activity?.courseName,
                  })}
                </Text>
              </div>

              {/* Date */}
              <Text className="shrink-0 text-sm text-gray-400">
                {dayjs(activity?.date).format(DATE_DISPLAY_FORMAT)}
              </Text>
            </div>
          ))}
        </div>

        {totalActivities > ACTIVITIES_PAGE_SIZE && (
          <Flex justify="flex-end" className="mt-4">
            <Pagination
              current={activitiesPage}
              pageSize={ACTIVITIES_PAGE_SIZE}
              total={totalActivities}
              showSizeChanger={false}
              onChange={setActivitiesPage}
            />
          </Flex>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
