import React from 'react';

/**
 * Auth layout — simple wrapper to let child pages manage their own full-screen layout.
 */
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen">
      {children}
    </div>
  );
};

export default AuthLayout;
