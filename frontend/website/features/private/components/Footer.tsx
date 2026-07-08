'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  TagOutlined,
  CodeOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  BookOutlined,
  BankOutlined,
  MailOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { APP_ROUTE } from '@/constants/routes';

// Cùng danh sách điều hướng với Header — chỉ trỏ tới trang hiện có, không tạo trang mới.
const QUICK_LINKS = [
  { href: APP_ROUTE.home,        label: 'Trang chủ' },
  { href: APP_ROUTE.courses,     label: 'Danh mục' },
  { href: APP_ROUTE.borrowed,    label: 'Đang mượn' },
  { href: APP_ROUTE.readingList, label: 'Danh sách đọc' },
  { href: APP_ROUTE.reservations,label: 'Đặt trước' },
];

const SYSTEM_INFO = [
  { icon: TagOutlined,             label: 'Phiên bản 0.1.0' },
  { icon: CodeOutlined,            label: 'Next.js 15 · Laravel 12' },
  { icon: DatabaseOutlined,        label: 'MySQL' },
  { icon: SafetyCertificateOutlined, label: 'Laravel Sanctum' },
];

const GITHUB_URL = 'https://github.com/NguyenNguyen2/Library_Management_System_FE';

// Footer dùng chung cho toàn bộ giao diện Reader — nằm trong luồng flex-col
// của PrivateLayout nên luôn ở cuối trang, không chồng lên nội dung.
const Footer = () => {
  const t = useTranslations();
  const router = useRouter();
  const year = new Date().getFullYear();

  return (
    <footer className="shrink-0 bg-white border-t border-black/10 shadow-[0_-2px_8px_-4px_rgba(0,0,0,0.06)] mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Cột 1 — Thương hiệu */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M4 6h11v20H4z" stroke="var(--primaryBlue)" strokeWidth="2.667" strokeLinejoin="round" />
                <path d="M15 6h13v20H15z" stroke="var(--primaryBlue)" strokeWidth="2.667" strokeLinejoin="round" />
                <path d="M15 6V26" stroke="var(--primaryBlue)" strokeWidth="2.667" strokeLinecap="round" />
              </svg>
              <span className="font-bold text-lg text-(--navyDark)">{t('header_title')}</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Hệ thống quản lý thư viện và độc giả thông minh.
            </p>
          </div>

          {/* Cột 2 — Liên kết nhanh */}
          <div>
            <h3 className="text-sm font-semibold text-(--navyDark) mb-3">Liên kết nhanh</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3 — Thông tin hệ thống */}
          <div>
            <h3 className="text-sm font-semibold text-(--navyDark) mb-3">Thông tin hệ thống</h3>
            <ul className="space-y-2">
              {SYSTEM_INFO.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon className="text-gray-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4 — Thông tin đồ án */}
          <div>
            <h3 className="text-sm font-semibold text-(--navyDark) mb-3">Thông tin đồ án</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <BookOutlined className="text-gray-400 mt-0.5" />
                Hệ thống Quản lý Thư viện Thông minh
              </li>
              <li className="flex items-center gap-2">
                <CodeOutlined className="text-gray-400" />
                Khoa Công nghệ Thông tin
              </li>
              <li className="flex items-center gap-2">
                <BankOutlined className="text-gray-400" />
                Trường Cao đẳng Cao Thắng
              </li>
              <li>
                <a
                  href="mailto:vqnam555@gmail.com"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <MailOutlined className="text-gray-400" />
                  vqnam555@gmail.com
                </a>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <GithubOutlined className="text-gray-400" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Đường phân cách + copyright — tách rõ khỏi phần thông tin phía trên */}
      <div className="border-t border-black/10">
        <p className="max-w-7xl mx-auto px-6 py-4 text-xs text-gray-400 text-center">
          © {year} {t('header_title')}. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
