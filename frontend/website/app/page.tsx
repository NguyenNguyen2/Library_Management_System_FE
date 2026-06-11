import { Button, Card, Flex, Typography } from 'antd';
import Link from 'next/link';
import { APP_ROUTE } from '@/constants/routes';

/**
 * Public landing page.
 * Accessible without authentication — renders a simple hero pointing users
 * to either the login page or the private home (which itself requires auth).
 */
const RootPage = () => {
  return (
    <Flex
      vertical
      align="center"
      justify="center"
      className="min-h-screen w-full px-4 bg-(--grayLightest)"
    >
      <Card className="max-w-2xl w-full text-center">
        <Typography.Title level={2} className="!mb-2">
          Phong Thủy Academy
        </Typography.Title>
        <Typography.Paragraph className="!mb-6 text-(--grayDark)">
          Chào mừng bạn đến với hệ thống khóa học phong thủy. Đăng nhập để truy
          cập các khóa học của bạn.
        </Typography.Paragraph>

        <Flex gap={12} justify="center" wrap="wrap">
          <Link href={APP_ROUTE.login}>
            <Button type="primary" size="large">
              Đăng nhập
            </Button>
          </Link>
          <Link href="/home">
            <Button size="large">Vào trang chủ</Button>
          </Link>
        </Flex>
      </Card>
    </Flex>
  );
};

export default RootPage;
