import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertCircle, CheckCircle2, Clock3,
  CreditCard, BookOpen, Wrench, ShieldAlert,
  ChevronRight, Receipt, TrendingDown,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Reader } from '../../types';

const FEE_TYPE = {
  late_fee:   { label: 'Phí trễ hạn',    icon: <Clock3 className="w-4 h-4" />,      color: 'text-red-600',    bg: 'bg-red-100' },
  damage_fee: { label: 'Phí hư hỏng',    icon: <Wrench className="w-4 h-4" />,      color: 'text-orange-600', bg: 'bg-orange-100' },
  lost_fee:   { label: 'Phí mất sách',   icon: <ShieldAlert className="w-4 h-4" />, color: 'text-purple-600', bg: 'bg-purple-100' },
};

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  e_wallet: 'Ví điện tử',
};

const TABS = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'pending', label: 'Chưa thanh toán' },
  { key: 'paid',    label: 'Đã thanh toán' },
] as const;

export function FeesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getReaderFees, books } = useLibrary();
  const reader = user as Reader;

  const [tab, setTab] = useState<'all' | 'pending' | 'paid'>('all');

  const allFees = getReaderFees(reader.id);
  const pending = allFees.filter(f => f.status === 'pending');
  const paid = allFees.filter(f => f.status === 'paid');
  const displayed = tab === 'all' ? allFees : tab === 'pending' ? pending : paid;

  const totalPending = pending.reduce((s, f) => s + f.amount, 0);
  const totalPaid = paid.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl mb-1">Lịch sử phí</h1>
        <p className="text-gray-500 text-sm">Theo dõi các khoản phí phát sinh trong quá trình mượn sách</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className={`rounded-xl border px-5 py-4 ${totalPending > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className={`flex items-center gap-2 mb-2 ${totalPending > 0 ? 'text-red-600' : 'text-gray-500'}`}>
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs" style={{ fontWeight: 500 }}>Đang nợ</span>
          </div>
          <p className={`text-2xl ${totalPending > 0 ? 'text-red-700' : 'text-gray-400'}`} style={{ fontWeight: 700 }}>
            {totalPending.toLocaleString()}đ
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{pending.length} khoản chưa thanh toán</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2 text-green-600">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs" style={{ fontWeight: 500 }}>Đã thanh toán</span>
          </div>
          <p className="text-2xl text-green-700" style={{ fontWeight: 700 }}>
            {totalPaid.toLocaleString()}đ
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{paid.length} khoản đã thanh toán</p>
        </div>
      </div>

      {/* Pending alert */}
      {totalPending > 0 && (
        <div className="mb-5 bg-red-50 border border-red-300 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700" style={{ fontWeight: 600 }}>
              Bạn đang nợ {totalPending.toLocaleString()}đ
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Vui lòng đến quầy thủ thư để thanh toán. Phí chưa trả có thể ảnh hưởng đến quyền mượn sách.
            </p>
          </div>
          <button
            onClick={() => navigate('/reader/borrowed')}
            className="flex items-center gap-1 text-xs text-red-600 hover:underline flex-shrink-0"
          >
            Xem sách <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition-colors -mb-px ${
              tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            style={{ fontWeight: tab === t.key ? 600 : 400 }}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              tab === t.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {t.key === 'all' ? allFees.length : t.key === 'pending' ? pending.length : paid.length}
            </span>
          </button>
        ))}
      </div>

      {/* Fee list */}
      {displayed.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500" style={{ fontWeight: 500 }}>
            {tab === 'pending' ? 'Bạn không có khoản phí nào chưa thanh toán' : tab === 'paid' ? 'Chưa có lịch sử thanh toán' : 'Chưa có khoản phí nào'}
          </p>
          {tab === 'pending' && (
            <p className="text-sm text-green-600 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Tuyệt vời! Tài khoản của bạn không có nợ
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(fee => {
            const book = fee.transactionId ? books.find(b => b.id === b.id) : null;
            const typeCfg = FEE_TYPE[fee.type];
            const isPending = fee.status === 'pending';

            return (
              <div
                key={fee.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${
                  isPending ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-4 p-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeCfg.bg} flex items-center justify-center mt-0.5`}>
                    <span className={typeCfg.color}>{typeCfg.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>{fee.description}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] py-0 ${typeCfg.color} border-current/30`}>
                            {typeCfg.label}
                          </Badge>
                          {isPending ? (
                            <span className="flex items-center gap-1 text-[11px] text-red-500" style={{ fontWeight: 500 }}>
                              <Clock3 className="w-3 h-3" /> Chưa thanh toán
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] text-green-600" style={{ fontWeight: 500 }}>
                              <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base ${isPending ? 'text-red-600' : 'text-gray-700'}`} style={{ fontWeight: 700 }}>
                          {fee.amount.toLocaleString()}đ
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                        Phát sinh: {formatDate(fee.createdDate)}
                      </div>
                      {fee.paidDate && (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                          Đã trả: {formatDate(fee.paidDate)}
                        </div>
                      )}
                      {fee.paymentMethod && (
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          {PAYMENT_LABEL[fee.paymentMethod] ?? fee.paymentMethod}
                        </div>
                      )}
                      {fee.notes && (
                        <div className="flex items-center gap-1.5 col-span-2 italic text-gray-400">
                          "{fee.notes}"
                        </div>
                      )}
                    </div>

                    {/* Pending action hint */}
                    {isPending && (
                      <div className="mt-2.5 flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                        <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
                        Đến quầy thủ thư để thanh toán khoản phí này
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Total row */}
          {displayed.length > 1 && (
            <div className={`rounded-xl border px-5 py-3 flex items-center justify-between ${
              tab === 'pending' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <span className="text-sm text-gray-600" style={{ fontWeight: 500 }}>
                Tổng {tab === 'all' ? 'tất cả' : tab === 'pending' ? 'đang nợ' : 'đã thanh toán'}
              </span>
              <span className={`text-lg ${tab === 'pending' ? 'text-red-700' : 'text-gray-800'}`} style={{ fontWeight: 700 }}>
                {displayed.reduce((s, f) => s + f.amount, 0).toLocaleString()}đ
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
