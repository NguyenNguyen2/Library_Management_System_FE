import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Reader, Librarian, Admin, AuditLog } from '../types';
import { mockReaders, mockLibrarians, mockAdmins, mockAuditLogs } from '../lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  requires2FA: boolean;
  pendingUser: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  verify2FA: (otp: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
  requestPasswordReset: (email: string) => Promise<boolean>;
  getAuditLogs: () => AuditLog[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('library_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Helper function to create audit log
  const createAuditLog = (
    user: User | null,
    action: AuditLog['action'],
    success: boolean,
    details?: string
  ) => {
    const log: AuditLog = {
      id: `al${Date.now()}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Không xác định',
      userRole: user?.role || 'reader',
      action,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      success,
      details,
    };
    mockAuditLogs.push(log);
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check all user types
    const allUsers: User[] = [
      ...mockReaders,
      ...mockLibrarians,
      ...mockAdmins,
    ];

    const foundUser = allUsers.find(u => u.email === email);

    if (foundUser) {
      // Check if user is admin and requires 2FA
      if (foundUser.role === 'admin' && (foundUser as Admin).twoFactorEnabled) {
        setPendingUser(foundUser);
        setRequires2FA(true);
        createAuditLog(foundUser, 'login_success', true, 'Đăng nhập thành công, chờ xác thực 2FA');
        return { success: true, requires2FA: true };
      }

      // Regular login for non-admin or admin without 2FA
      setUser(foundUser);
      localStorage.setItem('library_user', JSON.stringify(foundUser));
      createAuditLog(foundUser, 'login_success', true, 'Đăng nhập thành công');
      return { success: true, requires2FA: false };
    }

    createAuditLog(null, 'login_failed', false, `Đăng nhập thất bại - email: ${email}`);
    return { success: false };
  };

  const verify2FA = async (otp: string): Promise<boolean> => {
    // Simulate 2FA verification
    await new Promise(resolve => setTimeout(resolve, 500));

    // For demo purposes, accept any 6-digit OTP
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      if (pendingUser) {
        setUser(pendingUser);
        localStorage.setItem('library_user', JSON.stringify(pendingUser));
        createAuditLog(pendingUser, 'login_success', true, 'Xác thực 2FA thành công');
        setPendingUser(null);
        setRequires2FA(false);
        return true;
      }
    }

    createAuditLog(pendingUser, 'login_failed', false, 'Xác thực 2FA thất bại');
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Simulate Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo, log in as first reader
    const googleUser = mockReaders[0];
    setUser(googleUser);
    localStorage.setItem('library_user', JSON.stringify(googleUser));
    return true;
  };

  const logout = () => {
    createAuditLog(user, 'logout', true, 'Đăng xuất');
    setUser(null);
    setPendingUser(null);
    setRequires2FA(false);
    localStorage.removeItem('library_user');
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if email already exists
    const allUsers: User[] = [
      ...mockReaders,
      ...mockLibrarians,
      ...mockAdmins,
    ];

    if (allUsers.some(u => u.email === email)) {
      return false;
    }

    // Create new reader
    const newReader: Reader = {
      id: `r${Date.now()}`,
      email,
      name,
      role: 'reader',
      cardNumber: `LIB${new Date().getFullYear()}${String(mockReaders.length + 1).padStart(3, '0')}`,
      cardType: 'regular',
      cardIssuedDate: new Date(),
      cardExpiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      cardStatus: 'active',
      borrowLimit: 3,
      borrowDays: 14,
      currentBorrowed: 0,
      totalFees: 0,
      createdAt: new Date(),
    };

    mockReaders.push(newReader);
    setUser(newReader);
    localStorage.setItem('library_user', JSON.stringify(newReader));
    createAuditLog(newReader, 'create_user', true, `Đăng ký tài khoản mới: ${email}`);
    return true;
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('library_user', JSON.stringify(updatedUser));
    }
  };

  const requestPasswordReset = async (email: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    createAuditLog(null, 'reset_password', true, `Yêu cầu reset mật khẩu: ${email}`);
    return true; // Always return true for demo
  };

  const getAuditLogs = (): AuditLog[] => {
    // Only admin can view audit logs
    if (user?.role === 'admin') {
      return mockAuditLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    return [];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        requires2FA,
        pendingUser,
        login,
        verify2FA,
        loginWithGoogle,
        logout,
        register,
        updateProfile,
        requestPasswordReset,
        getAuditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}