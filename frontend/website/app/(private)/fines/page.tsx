'use client';

import { useRouter } from 'next/navigation';
import { Spin } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useFines } from '@/features/fines/hooks/useFines';
import { APP_ROUTE } from '@/constants/routes';
import { formatDateVN } from '@/lib/utils/date';
import { toCoverImageUrl } from '@/lib/utils/image';
import type { IFine } from '@/features/fines/api/fineApi';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

const STATUS_BADGE = {
  paid: {
    className: 'bg-green-100 text-green-700 border border-green-200',
    icon: <CheckCircleOutlined />,
  },
  unpaid: {
    className: 'bg-red-100 text-red-700 border border-red-200',
    icon: <WarningOutlined />,
  },
};

function FineCard({ fine }: { fine: IFine }) {
  const router = useRouter();
  const badge = STATUS_BADGE[fine.status.value];

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden ${
        fine.status.value === 'unpaid' ? 'border-red-200' : 'border-gray-200'
      }`}
    >
      {fine.status.value === 'unpaid' && (
        <div className="bg-red-500 px-4 py-2 flex items-center gap-2 text-white text-xs font-semibold">
          <WarningOutlined />
          <span>Khoản phí chưa thanh toán — vui lòng đến thư viện để nộp phí.</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex gap-4 min-w-0">
            <div
              className="flex-shrink-0 w-14 h-20 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer"
              onClick={() => router.push(`${APP_ROUTE.courses}/${fine.book_id}`)}
            >
              {fine.cover_image ? (
                <img
                  src={toCoverImageUrl(fine.cover_image) ?? undefined}
                  alt={fine.title}
                  className="w-full h-full object-cover rounded-lg hover:scale-105 transition-transform"
                />
              ) : (
                <span className="text-2xl text-gray-300">📖</span>
              )}
            </div>
            <div className="min-w-0">
              <h3
                className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-snug text-sm"
                onClick={() => router.push(`${APP_ROUTE.courses}/${fine.book_id}`)}
              >
                {fine.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{fine.reason}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${badge.className}`}
            >
              {badge.icon}
              {fine.status.label}
            </span>
            <span
              className={`text-lg font-bold ${
                fine.status.value === 'unpaid' ? 'text-red-600' : 'text-gray-800'
              }`}
            >
              {formatCurrency(fine.amount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <CalendarOutlined /> Ngày mượn
            </p>
            <p className="font-medium text-gray-900 mt-0.5">{formatDateVN(fine.borrow_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Hạn trả</p>
            <p className="font-medium text-gray-900 mt-0.5">{formatDateVN(fine.due_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Ngày trả thực tế</p>
            <p
              className={`font-medium mt-0.5 ${
                !fine.return_date ? 'text-red-500 italic' : 'text-gray-900'
              }`}
            >
              {fine.return_date ? formatDateVN(fine.return_date) : 'Chưa trả'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ClockCircleOutlined /> Số ngày trễ
            </p>
            <p
              className={`font-medium mt-0.5 ${
                fine.days_late > 0 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {fine.days_late > 0 ? `${fine.days_late} ngày` : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FinesPage() {
  const { data, isLoading } = useFines();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  const fines = data?.data ?? [];
  const unpaidFines = fines.filter((f) => f.status.value === 'unpaid');
  const paidFines   = fines.filter((f) => f.status.value === 'paid');
  const totalDebt   = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử phí</h1>
        <p className="text-gray-500 text-sm mt-1">Danh sách các khoản phí thư viện của bạn</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1">Tổng khoản phí</p>
          <p className="text-3xl font-bold text-gray-900">{fines.length}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <WarningOutlined className="text-red-500" /> Đang nợ
          </p>
          <p className="text-3xl font-bold text-red-600">{unpaidFines.length}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <CheckCircleOutlined className="text-green-500" /> Đã nộp
          </p>
          <p className="text-3xl font-bold text-green-600">{paidFines.length}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <DollarOutlined className="text-red-500" /> Tổng tiền nợ
          </p>
          <p className="text-xl font-bold text-red-600">
            {totalDebt > 0 ? formatCurrency(totalDebt) : '0 đ'}
          </p>
        </div>
      </div>

      {/* Alert banner when there are unpaid fines */}
      {unpaidFines.length > 0 && (
        <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <WarningOutlined className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-800 font-semibold">
              Bạn có {unpaidFines.length} khoản phí chưa thanh toán
            </p>
            <p className="text-red-600">
              Vui lòng đến thư viện để nộp phí. Tổng số tiền:{' '}
              <span className="font-bold">{formatCurrency(totalDebt)}</span>
            </p>
          </div>
        </div>
      )}

      {/* Fine list */}
      {fines.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <BookOutlined className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">Bạn chưa có khoản phí nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fines.map((fine) => (
            <FineCard key={fine.fine_id} fine={fine} />
          ))}
        </div>
      )}
    </div>
  );
}
