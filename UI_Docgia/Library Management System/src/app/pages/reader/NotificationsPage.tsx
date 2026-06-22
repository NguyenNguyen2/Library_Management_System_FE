import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { useLibrary } from '../../contexts/LibraryContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Bell,
  CheckCheck,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BellOff,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { formatDate } from '../../lib/utils';
import type { Notification } from '../../types';

const TYPE_CONFIG = {
  info:    { icon: <Info className="w-4 h-4" />,          bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'Thông tin',  border: 'border-blue-200' },
  warning: { icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-amber-100',  text: 'text-amber-600',  label: 'Cảnh báo',   border: 'border-amber-200' },
  success: { icon: <CheckCircle2 className="w-4 h-4" />,  bg: 'bg-green-100',  text: 'text-green-600',  label: 'Thành công', border: 'border-green-200' },
  error:   { icon: <XCircle className="w-4 h-4" />,       bg: 'bg-red-100',    text: 'text-red-600',    label: 'Khẩn cấp',   border: 'border-red-200' },
};

const FILTERS = [
  { key: 'all',     label: 'Tất cả' },
  { key: 'unread',  label: 'Chưa đọc' },
  { key: 'info',    label: 'Thông tin' },
  { key: 'warning', label: 'Cảnh báo' },
  { key: 'success', label: 'Thành công' },
  { key: 'error',   label: 'Khẩn cấp' },
] as const;

function timeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return formatDate(date);
}

function NotificationItem({
  notif,
  onRead,
  onDelete,
  onNavigate,
}: {
  notif: Notification;
  onRead: () => void;
  onDelete: () => void;
  onNavigate?: () => void;
}) {
  const cfg = TYPE_CONFIG[notif.type];
  return (
    <div
      className={`group relative flex gap-4 p-4 rounded-xl border transition-all ${
        notif.read
          ? 'bg-white border-gray-200 hover:border-gray-300'
          : `${notif.type === 'error' ? 'bg-red-50' : notif.type === 'warning' ? 'bg-amber-50' : notif.type === 'success' ? 'bg-green-50' : 'bg-blue-50'} border-${notif.type === 'error' ? 'red' : notif.type === 'warning' ? 'amber' : notif.type === 'success' ? 'green' : 'blue'}-200`
      }`}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center mt-0.5`}>
        <span className={cfg.text}>{cfg.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-gray-900 text-sm" style={{ fontWeight: notif.read ? 400 : 600 }}>{notif.title}</p>
          <Badge variant="outline" className={`text-[10px] py-0 px-1.5 ${cfg.text} border-current/30 flex-shrink-0`}>
            {cfg.label}
          </Badge>
        </div>
        <p className="text-gray-600 text-sm mt-0.5 line-clamp-2">{notif.message}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-400">{timeAgo(notif.createdAt)}</span>
          {notif.link && (
            <button
              onClick={onNavigate}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
            >
              Xem chi tiết <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Actions (show on hover) */}
      <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!notif.read && (
          <button
            onClick={onRead}
            className="p-1.5 rounded-lg bg-white hover:bg-blue-50 text-gray-400 hover:text-blue-600 border border-gray-200 transition-colors"
            title="Đánh dấu đã đọc"
          >
            <CheckCheck className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 transition-colors"
          title="Xóa thông báo"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useLibrary();

  const [filter, setFilter] = useState<typeof FILTERS[number]['key']>('all');

  const all = getUserNotifications(user!.id);
  const unreadCount = all.filter(n => !n.read).length;

  const filtered = all.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const counts: Record<string, number> = {
    all: all.length,
    unread: all.filter(n => !n.read).length,
    info: all.filter(n => n.type === 'info').length,
    warning: all.filter(n => n.type === 'warning').length,
    success: all.filter(n => n.type === 'success').length,
    error: all.filter(n => n.type === 'error').length,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl">Thông báo</h1>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" style={{ fontWeight: 700 }}>
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm">Tất cả thông báo từ hệ thống thư viện</p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-sm"
            onClick={() => markAllNotificationsAsRead(user!.id)}
          >
            <CheckCheck className="w-4 h-4" />
            Đọc tất cả
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {(['error', 'warning', 'info', 'success'] as const).map(type => {
          const cfg = TYPE_CONFIG[type];
          const c = counts[type];
          if (c === 0) return null;
          return (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all text-center ${
                filter === type ? `${cfg.bg} ${cfg.border} border-2` : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={cfg.text}>{cfg.icon}</span>
              <span className="text-lg text-gray-900" style={{ fontWeight: 700 }}>{c}</span>
              <span className="text-[11px] text-gray-500">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400 self-center mr-1" />
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{ fontWeight: filter === f.key ? 600 : 400 }}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20' : 'bg-gray-200'}`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500" style={{ fontWeight: 500 }}>
            {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo' : 'Không có thông báo nào'}
          </p>
          <p className="text-sm mt-1">Các thông báo mới sẽ xuất hiện ở đây</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => (
            <NotificationItem
              key={notif.id}
              notif={notif}
              onRead={() => markNotificationAsRead(notif.id)}
              onDelete={() => deleteNotification(notif.id)}
              onNavigate={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
