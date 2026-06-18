import { Card, Flex, Pagination, Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn } from '@shared/constants/commonConst';
import {
  BookOutlined,
  KeyOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import LineChart from '@shared/components/chart/LineChart';
import PieChart from '@shared/components/chart/PieChart';
import { dashboardHooks } from '../../hooks/useDashboard';
import { formatNumber } from '@shared/utils/numberUtils';
import dayjs from 'dayjs';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';

const ACTIVITIES_PAGE_SIZE = 5;

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useGlobalVariable();
  const { data, isLoading } = dashboardHooks.useFetchDashboard();

  const stats = data?.stats;
  const studentsPerCourse = data?.studentsPerCourse ?? [];
  const learningProgress = data?.learningProgress ?? [];

  const [activitiesPage, setActivitiesPage] = useState(1);
  const { data: activitiesData, isLoading: isLoadingActivities } =
    dashboardHooks.useFetchRecentActivities({
      page: activitiesPage,
      limit: ACTIVITIES_PAGE_SIZE,
    });
  const recentActivities = activitiesData?.rows ?? [];
  const totalActivities = activitiesData?.total ?? 0;

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const statCards = [
    {
      title: t(getKey('total_courses')),
      value: formatNumber(stats?.totalCourses ?? 0),
      trend: (
        <span className="text-emerald-600 flex items-center gap-1 font-medium">
          <ArrowUpOutlined className="w-3 h-3" /> +124 tháng này
        </span>
      ),
      icon: <BookOutlined style={{ fontSize: 20 }} className="text-blue-600" />,
      color: 'bg-blue-50',
      borderLeft: '4px solid #1A56DB',
    },
    {
      title: t(getKey('total_users')),
      value: formatNumber(stats?.totalUsers ?? 0),
      trend: (
        <span className="text-emerald-600 flex items-center gap-1 font-medium">
          <ArrowUpOutlined className="w-3 h-3" /> +8.2% so với tuần trước
        </span>
      ),
      icon: <TeamOutlined style={{ fontSize: 20 }} className="text-emerald-600" />,
      color: 'bg-emerald-50',
      borderLeft: '4px solid #10B981',
    },
    {
      title: t(getKey('total_questions')),
      value: formatNumber(stats?.totalQuestions ?? 0),
      trend: <span className="text-red-600 font-medium">Cần xử lý ngay</span>,
      icon: <QuestionCircleOutlined style={{ fontSize: 20 }} className="text-red-600" />,
      color: 'bg-red-50',
      borderLeft: '4px solid #EF4444',
      showPing: true,
    },
    {
      title: t(getKey('total_activation_codes')),
      value: formatNumber(stats?.totalCodes ?? 0),
      trend: (
        <span className="text-emerald-600 flex items-center gap-1 font-medium">
          <ArrowUpOutlined className="w-3 h-3" /> +12.4% so với tháng trước
        </span>
      ),
      icon: <KeyOutlined style={{ fontSize: 20 }} className="text-purple-600" />,
      color: 'bg-purple-50',
      borderLeft: '4px solid #8B5CF6',
    },
  ];

  // Map data for Top 5 books list
  const topBooks = studentsPerCourse
    .slice(0, 5)
    .map((item, index) => ({
      rank: index + 1,
      title: item?.courseName,
      author: 'Nhiều tác giả',
      borrows: item?.studentCount,
    }));

  // Map data for Recent transactions
  const recentBorrows = recentActivities.slice(0, 5).map((activity) => ({
    id: `GD-${activity.id.slice(-4).toUpperCase()}`,
    reader: activity.userName,
    book: activity.courseName,
    date: dayjs(activity.date).format('DD/MM/YYYY'),
  }));

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      {/* Greeting */}
      <div className="flex items-start justify-between mb-2">
        <div className="text-left">
          <h1 className="text-2xl font-semibold m-0 text-navyDark">
            Xin chào, {user?.name ?? 'Admin'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1 m-0">Hôm nay là {today}</p>
        </div>
        <Button
          type="primary"
          icon={<FileTextOutlined />}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] border-0 h-10 px-4 rounded-md font-medium text-sm flex items-center gap-1.5 cursor-pointer text-white"
        >
          Tạo báo cáo hôm nay
        </Button>
      </div>

      {/* Stat Cards - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards?.map((card) => (
          <Card
            key={card?.title}
            className="!rounded-[10px] border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
            style={{ borderLeft: card.borderLeft }}
            bodyStyle={{ padding: '20px' }}
            loading={isLoading}
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 text-left">
                <p className="text-xs text-gray-500 uppercase tracking-wide m-0 font-medium truncate">
                  {card?.title}
                </p>
                <p className="mt-2 text-2xl font-bold m-0 text-navyDark flex items-center gap-2">
                  {card?.value}
                  {card?.showPing && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                  )}
                </p>
                <p className="text-xs mt-1.5 m-0 flex items-center gap-1">
                  {card?.trend}
                </p>
              </div>
              <div className={cn('p-2.5 rounded-lg shrink-0 flex items-center justify-center', card?.color)}>
                {card?.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts (3-column layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Chart takes 2 columns */}
        <div className="lg:col-span-2">
          <Card
            className="!rounded-[10px] border border-gray-200 shadow-sm h-full"
            loading={isLoading}
            bodyStyle={{ padding: '20px' }}
          >
            <LineChart
              title="Lượt mượn & trả 30 ngày qua"
              subtitle="Theo dõi hoạt động giao dịch hàng ngày"
              categories={studentsPerCourse?.map((item) => item?.courseName)}
              series={[
                {
                  name: 'Mượn',
                  data: studentsPerCourse?.map((item) => item?.studentCount),
                  color: '#2563EB',
                },
                {
                  name: 'Trả',
                  data: studentsPerCourse?.map((item) => Math.round(item?.studentCount * 0.75)),
                  color: '#10B981',
                },
              ]}
              height={300}
              showLegend
            />
          </Card>
        </div>

        {/* Pie Chart takes 1 column */}
        <div>
          <Card
            className="!rounded-[10px] border border-gray-200 shadow-sm h-full"
            loading={isLoading}
            bodyStyle={{ padding: '20px' }}
          >
            <PieChart
              title="Trạng thái kho bản sao"
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
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Books */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 text-base font-semibold text-navyDark text-left">
              Top 5 sách được mượn
            </h3>
            <button className="text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer">Xem tất cả</button>
          </div>
          <div className="space-y-2">
            {topBooks.map((b) => (
              <div
                key={b.rank}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 text-left"
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0 font-bold',
                    b.rank === 1
                      ? 'bg-amber-100 text-amber-700'
                      : b.rank === 2
                      ? 'bg-gray-200 text-gray-700'
                      : b.rank === 3
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-blue-50 text-blue-700'
                  )}
                >
                  {b.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate m-0 font-semibold text-navyDark">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate m-0 mt-0.5">{b.author}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm m-0 font-bold text-navyDark">
                    {b.borrows}
                  </p>
                  <p className="text-xs text-gray-500 m-0">lượt</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={isLoadingActivities}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 text-base font-semibold text-navyDark text-left">
              Giao dịch mượn gần đây
            </h3>
            {totalActivities > ACTIVITIES_PAGE_SIZE && (
              <Flex justify="flex-end" className="m-0 shrink-0">
                <Pagination
                  simple
                  current={activitiesPage}
                  pageSize={ACTIVITIES_PAGE_SIZE}
                  total={totalActivities}
                  showSizeChanger={false}
                  onChange={setActivitiesPage}
                />
              </Flex>
            )}
          </div>
          <div className="space-y-2">
            {recentBorrows.map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-blue-50/40 border border-blue-100 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{o.id}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded font-medium">
                      Thành công
                    </span>
                  </div>
                  <p className="text-sm mt-1 m-0 font-semibold text-navyDark">
                    {o.reader}
                  </p>
                  <p className="text-xs text-gray-500 truncate m-0 mt-0.5">{o.book}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400 m-0">Ngày mượn</p>
                  <p className="text-sm text-gray-600 font-semibold m-0 mt-0.5">{o.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
