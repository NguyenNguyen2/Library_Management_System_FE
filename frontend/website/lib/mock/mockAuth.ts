// Mock auth for development - used when NEXT_PUBLIC_USE_MOCK_DATA=true
// This will be replaced with real API calls when backend is ready

import type { IResponseLogin } from '@shared/types/AuthType';

const MOCK_DELAY = 300;

const MOCK_ACCOUNTS: Record<string, IResponseLogin> = {
  'docgia1@example.com': {
    accessToken: 'mock-access-token-reader',
    refreshToken: 'mock-refresh-token-reader',
    user: {
      id: 'mock-reader-1',
      email: 'docgia1@example.com',
      name: 'Nguyễn Văn A',
      role: 'reader',
    },
  },
  'thuthu1@library.com': {
    accessToken: 'mock-access-token-librarian',
    refreshToken: 'mock-refresh-token-librarian',
    user: {
      id: 'mock-librarian-1',
      email: 'thuthu1@library.com',
      name: 'Trần Thị Thủ Thư',
      role: 'librarian',
    },
  },
  'admin@library.com': {
    accessToken: 'mock-access-token-admin',
    refreshToken: 'mock-refresh-token-admin',
    user: {
      id: 'mock-admin-1',
      email: 'admin@library.com',
      name: 'Quản trị viên',
      role: 'admin',
    },
  },
};

// Accepts any email/password (matching the "demo accounts, any password" hint
// on the login page). Known demo emails get a matching role, anything else
// falls back to a reader account so the reader UI can always be reached.
export const mockSignIn = ({ email }: { email: string; password: string }): Promise<IResponseLogin> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = MOCK_ACCOUNTS[email.toLowerCase().trim()];
      resolve(
        account ?? {
          accessToken: 'mock-access-token-reader',
          refreshToken: 'mock-refresh-token-reader',
          user: {
            id: 'mock-reader-default',
            email,
            name: 'Độc giả',
            role: 'reader',
          },
        },
      );
    }, MOCK_DELAY);
  });
};

// New accounts always register as readers. Demo emails are treated as
// already taken, mirroring the "tài khoản demo" list shown on the login page.
export const mockSignUp = ({ email, name }: { email: string; password: string; name: string }): Promise<IResponseLogin> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (MOCK_ACCOUNTS[email.toLowerCase().trim()]) {
        reject({ response: { data: { results: { message: 'Email đã tồn tại' } } } });
        return;
      }
      resolve({
        accessToken: 'mock-access-token-reader',
        refreshToken: 'mock-refresh-token-reader',
        user: {
          id: `mock-reader-${Date.now()}`,
          email,
          name,
          role: 'reader',
        },
      });
    }, MOCK_DELAY);
  });
};
