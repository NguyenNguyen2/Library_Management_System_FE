import { Card, Flex, Typography, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import { cn } from '@shared/constants/commonConst';
import {
  BookOutlined,
  WarningOutlined,
  RiseOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import LineChart from '@shared/components/chart/LineChart';
import PieChart from '@shared/components/chart/PieChart';
import { dashboardHooks } from '../../hooks/useDashboard';
import { formatNumber } from '@shared/utils/numberUtils';
import { useGlobalVariable } from '../../hooks/GlobalVariableProvider';

const { Text } = Typography;

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useGlobalVariable();
  const { data, isLoading } = dashboardHooks.useFetchDashboard();

  const stats = data?.stats;
  const trendData = data?.trendData ?? [];
  const inventoryData = data?.inventoryData ?? [];
  const topBooks = data?.topBooks ?? [];
  const overdueList = data?.overdueList ?? [];

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const statCards = [
    {
      title: 'Tổng đầu sách',
      value: formatNumber(stats?.totalBooks ?? 0),
      sub: '+124 tháng này',
      icon: <BookOutlined style={{ fontSize: 18 }} />,
      color: 'text-blue-600 bg-blue-50',
      borderLeft: '4px solid #1A56DB',
    },
    {
      title: 'Độc giả đang mượn',
      value: formatNumber(stats?.activeUsers ?? 0),
      sub: '+8.2% so với tuần trước',
      icon: <TeamOutlined style={{ fontSize: 18 }} />,
      color: 'text-emerald-600 bg-emerald-50',
      borderLeft: '4px solid #10B981',
    },
    {
      title: 'Sách quá hạn',
      value: formatNumber(stats?.overdueCount ?? 0),
      sub: 'Cần xử lý ngay',
      icon: <WarningOutlined style={{ fontSize: 18 }} />,
      color: 'text-red-600 bg-red-50',
      borderLeft: '4px solid #EF4444',
      isOverdue: true,
    },
    {
      title: 'Lượt mượn tháng',
      value: formatNumber(stats?.totalBorrowMonth ?? 0),
      sub: '+12.4% so với tháng trước',
      icon: <RiseOutlined style={{ fontSize: 18 }} />,
      color: 'text-purple-600 bg-purple-50',
      borderLeft: '4px solid #8B5CF6',
    },
  ];

  // Map inventory data for Pie Chart
  const pieData = inventoryData.map((d: any) => ({
    label: d.name,
    value: d.value,
    color: d.color,
  }));

  const totalInventory = inventoryData.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-6 text-left max-w-[1400px] mx-auto">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-4">
        <div>
          <h1 className="m-0 text-[30px] font-bold leading-[36px] text-navyDark">
            Xin chào, {user?.name ?? 'Admin'} 👋
          </h1>
          <p className="m-0 mt-1 text-base leading-6 text-grayDark">
            Hôm nay là {today}
          </p>
        </div>
        <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 h-10 shadow cursor-pointer border-0">
          <BarChartOutlined className="mr-2" style={{ fontSize: 14 }} /> Tạo báo cáo hôm nay
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards?.map((card) => (
          <Card
            key={card?.title}
            className="!rounded-[10px] border border-gray-200 shadow-sm"
            style={{ borderLeft: card.borderLeft }}
            bodyStyle={{ padding: '20px' }}
            loading={isLoading}
          >
            <Flex justify="space-between" align="start">
              <Text className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                {card?.title}
              </Text>
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-lg',
                  card?.color
                )}
              >
                {card?.icon}
              </div>
            </Flex>
            <div className="mt-2 flex items-center gap-2">
              <Text className="!text-[28px] !font-bold text-navyDark leading-none">
                {card?.value}
              </Text>
              {card.isOverdue && (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
              )}
            </div>
            <div className="mt-2">
              <Text className={cn("text-xs", card.isOverdue ? "text-red-600 font-medium" : "text-emerald-600")}>
                {card?.sub}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts - 2-column split (LineChart takes 2/3, PieChart takes 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Chart */}
        <Card
          className="lg:col-span-2 !rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={isLoading}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="m-0 text-base font-semibold text-navyDark">Lượt mượn & trả 30 ngày qua</h3>
              <p className="m-0 text-xs text-gray-500 mt-0.5">Theo dõi hoạt động giao dịch hàng ngày</p>
            </div>
            <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 px-2 py-0.5 rounded">30 ngày</Badge>
          </div>
          <LineChart
            categories={trendData?.map((item: any) => item?.day)}
            series={[
              {
                name: "Mượn",
                data: trendData?.map((item: any) => item?.borrow),
                color: "#2563EB",
              },
              {
                name: "Trả",
                data: trendData?.map((item: any) => item?.return),
                color: "#10B981",
              },
            ]}
            height={280}
            showLegend
          />
        </Card>

        {/* Pie Chart */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={isLoading}
        >
          <h3 className="m-0 text-base font-semibold text-navyDark">Trạng thái kho bản sao</h3>
          <p className="m-0 text-xs text-gray-500 mt-0.5 mb-3">Tổng {formatNumber(totalInventory)} bản</p>
          <PieChart
            data={pieData}
            height={200}
            showLegend={false}
          />
          <div className="space-y-1.5 mt-4">
            {inventoryData.map((d: any) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {formatNumber(d.value)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Borrowed Books */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={isLoading}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0 text-base font-semibold text-navyDark">Top 5 sách được mượn</h3>
            <button className="text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer">Xem tất cả</button>
          </div>
          <div className="space-y-2">
            {topBooks.map((b: any) => (
              <div
                key={b.rank}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold",
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
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm truncate m-0 font-medium text-navyDark">
                    {b.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate m-0 mt-0.5">{b.author}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm m-0 font-semibold text-navyDark">
                    {b.borrows}
                  </p>
                  <p className="text-xs text-gray-500 m-0">lượt</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Overdue Transactions */}
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '20px' }}
          loading={isLoading}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <WarningOutlined className="text-red-500" style={{ fontSize: 16 }} />
              <h3 className="m-0 text-base font-semibold text-navyDark">Giao dịch quá hạn cần xử lý</h3>
            </div>
            <Badge count={overdueList.length} className="site-badge-count-4" style={{ backgroundColor: '#EF4444' }} />
          </div>
          <div className="space-y-2">
            {overdueList.map((o: any) => (
              <div
                key={o.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/60 border border-amber-100"
              >
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{o.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-medium">
                      Quá {o.days} ngày
                    </span>
                  </div>
                  <p className="text-sm m-0 mt-1 font-medium text-navyDark">
                    {o.reader}
                  </p>
                  <p className="text-xs text-gray-500 truncate m-0 mt-0.5">{o.book}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-red-600 m-0 font-semibold">
                    {formatNumber(o.fee)}đ
                  </p>
                  <button className="text-xs text-blue-600 hover:underline bg-transparent border-0 cursor-pointer mt-1">Liên hệ</button>
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
