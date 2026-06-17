// Date helpers for reader-facing pages (mock data uses ISO "YYYY-MM-DD" strings)

export function formatDateVN(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/** Number of calendar days from today until `dateString` (negative if in the past) */
export function getDaysUntil(dateString: string): number {
  const target = new Date(dateString);
  target.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
