'use client';

import { useRouter } from 'next/navigation';
import type { AxiosError } from 'axios';
import { App, Button, Spin } from 'antd';
import {
  WarningOutlined,
  ClockCircleOutlined,
  BookOutlined,
  RightOutlined,
  ReloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { useBorrowing, useRenewBorrowing, useCancelRenewBorrowing } from '@/features/borrowing/hooks/useBorrowing';
import { APP_ROUTE } from '@/constants/routes';
import { READER_BORROW_LIMIT } from '@/lib/mock/mockData';
import { formatDateVN } from '@/lib/utils/date';
import { toCoverImageUrl } from '@/lib/utils/image';
import type { IBorrowedBook } from '@/features/borrowing/api/borrowingApi';

function getDayStatus(daysRemaining: number) {
  if (daysRemaining < 0) {
    return {
      color: 'text-red-600 bg-red-50 border-red-200',
      text: `Quá hạn ${Math.abs(daysRemaining)} ngày`,
      dot: 'bg-red-500',
    };
  }
  if (daysRemaining === 0) {
    return {
      color: 'text-orange-600 bg-orange-50 border-orange-200',
      text: 'Hết hạn hôm nay',
      dot: 'bg-orange-500',
    };
  }
  if (daysRemaining <= 3) {
    return {
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      text: `Còn ${daysRemaining} ngày`,
      dot: 'bg-amber-400',
    };
  }
  return {
    color: 'text-green-600 bg-green-50 border-green-200',
    text: `Còn ${daysRemaining} ngày`,
    dot: 'bg-green-500',
  };
}

function BorrowedBookCard({
  item,
  onRenew,
  onCancelRenew,
  isCanceling,
}: {
  item: IBorrowedBook;
  onRenew: (item: IBorrowedBook) => void;
  onCancelRenew: (item: IBorrowedBook) => void;
  isCanceling: boolean;
}) {
  const router = useRouter();
  const status = getDayStatus(item.days_remaining);
  const isOverdue = item.days_remaining < 0;
  const isSoon = item.days_remaining >= 0 && item.days_remaining <= 1;

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all ${
        isOverdue ? 'border-red-200' : item.days_remaining <= 3 ? 'border-amber-200' : 'border-gray-200'
      }`}
    >
      {isOverdue && (
        <div className="bg-red-500 px-4 py-2 flex items-center gap-2">
          <WarningOutlined className="text-white flex-shrink-0" />
          <p className="text-white text-xs font-semibold">
            Quá hạn {Math.abs(item.days_remaining)} ngày — Vui lòng trả sách ngay.
          </p>
        </div>
      )}
      {isSoon && !isOverdue && (
        <div className="bg-amber-400 px-4 py-2 flex items-center gap-2">
          <ClockCircleOutlined className="text-amber-900 flex-shrink-0" />
          <p className="text-amber-900 text-xs font-semibold">
            {item.days_remaining === 0 ? 'Hết hạn hôm nay! Vui lòng trả sách.' : 'Đến hạn trả ngày mai!'}
          </p>
        </div>
      )}

      {/* Pending renewal badge */}
      {item.renewal_pending && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
          <LoadingOutlined className="text-blue-500 flex-shrink-0" spin />
          <p className="text-blue-600 text-xs font-semibold">
            Yêu cầu gia hạn đang chờ thư viện duyệt
          </p>
        </div>
      )}

      <div className="flex gap-4 p-4">
        <div
          className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden cursor-pointer bg-gray-100 flex items-center justify-center"
          onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
        >
          {item.cover_image ? (
            <img
              src={toCoverImageUrl(item.cover_image) ?? undefined}
              alt={item.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <span className="text-3xl text-gray-300">📖</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="text-gray-900 font-semibold hover:text-blue-600 cursor-pointer transition-colors leading-snug"
              onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
            >
              {item.title}
            </h3>
            <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border flex-shrink-0 font-semibold ${status.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.text}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-xs text-gray-400">Ngày mượn</p>
              <p className="text-sm text-gray-700 mt-0.5 font-medium">{formatDateVN(item.borrow_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Hạn trả</p>
              <p className={`text-sm mt-0.5 font-medium ${isOverdue ? 'text-red-600' : 'text-gray-700'}`}>
                {formatDateVN(item.due_date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {item.renewal_pending ? (
              <>
                <span className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 font-semibold">
                  <LoadingOutlined spin />
                  Chờ duyệt gia hạn
                </span>
                <Button
                  size="small"
                  danger
                  loading={isCanceling}
                  onClick={() => onCancelRenew(item)}
                >
                  Hủy yêu cầu
                </Button>
              </>
            ) : (
              <Button
                size="small"
                type="primary"
                icon={<ReloadOutlined />}
                disabled={isOverdue}
                onClick={() => onRenew(item)}
              >
                Gia hạn
              </Button>
            )}

            <button
              onClick={() => router.push(`${APP_ROUTE.courses}/${item.book_id}`)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline h-8 px-2"
            >
              Xem sách <RightOutlined className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BorrowedBooksContent() {
  const router = useRouter();
  const { modal, message } = App.useApp();
  const { data, isLoading } = useBorrowing();
  const renewMutation = useRenewBorrowing();
  const cancelRenewMutation = useCancelRenewBorrowing();

  const borrowed = data?.data ?? [];
  const overdueCount = borrowed.filter((b) => b.days_remaining < 0).length;
  const soonCount = borrowed.filter((b) => b.days_remaining >= 0 && b.days_remaining <= 3).length;

  const handleRenew = (item: IBorrowedBook) => {
    modal.confirm({
      title: 'Gửi yêu cầu gia hạn',
      content: `Gửi yêu cầu gia hạn "${item.title}" đến thư viện? Bạn sẽ nhận thông báo khi được duyệt.`,
      okText: 'Gửi yêu cầu',
      cancelText: 'Hủy',
      okButtonProps: { type: 'primary' },
      onOk: async () => {
        // Truyền đúng borrow_id + copy_id của sách được chọn — không tác động sách khác.
        const res = await renewMutation
          .mutateAsync({ borrowId: item.borrow_id, copyId: item.copy_id })
          .catch((err: AxiosError<{ message?: string }>) => {
            const msg = err?.response?.data?.message ?? 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
            message.error(msg);
            throw err;
          });
        message.success(res.message ?? 'Yêu cầu gia hạn đã được gửi.');
      },
    });
  };

  // Chỉ cho phép hủy khi yêu cầu còn ở trạng thái Pending.
  const handleCancelRenew = (item: IBorrowedBook) => {
    modal.confirm({
      title: 'Hủy yêu cầu gia hạn',
      content: `Bạn có chắc muốn hủy yêu cầu gia hạn "${item.title}"?`,
      okText: 'Hủy yêu cầu',
      okButtonProps: { danger: true },
      cancelText: 'Đóng',
      onOk: async () => {
        const res = await cancelRenewMutation
          .mutateAsync({ borrowId: item.borrow_id, copyId: item.copy_id })
          .catch((err: AxiosError<{ message?: string }>) => {
            const msg = err?.response?.data?.message ?? 'Hủy yêu cầu thất bại. Vui lòng thử lại.';
            message.error(msg);
            throw err;
          });
        message.success(res.message ?? 'Đã hủy yêu cầu gia hạn.');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sách đang mượn</h1>
        <p className="text-gray-500 text-sm mt-1">
          Đang mượn <span className="font-semibold">{borrowed.length}</span> / {READER_BORROW_LIMIT} sách
        </p>
      </div>

      {borrowed.length > 0 && (overdueCount > 0 || soonCount > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {overdueCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-full font-medium">
              <WarningOutlined /> {overdueCount} quá hạn
            </span>
          )}
          {soonCount > 0 && (
            <span className="flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-medium">
              <ClockCircleOutlined /> {soonCount} sắp đến hạn
            </span>
          )}
        </div>
      )}

      {borrowed.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOutlined className="text-3xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">Bạn chưa mượn sách nào</p>
          <Button type="primary" className="mt-4" onClick={() => router.push(APP_ROUTE.courses)}>
            Khám phá sách
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {borrowed.map((item) => (
            <BorrowedBookCard
              key={`${item.borrow_id}-${item.copy_id}`}
              item={item}
              onRenew={handleRenew}
              onCancelRenew={handleCancelRenew}
              isCanceling={cancelRenewMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BorrowedBooksPage() {
  return (
    <App>
      <BorrowedBooksContent />
    </App>
  );
}
