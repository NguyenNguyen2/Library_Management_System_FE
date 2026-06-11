'use client';

import React, { createContext, useEffect, useState } from 'react';
import { IDetailUser } from '../types/UserType';
import { getCookie } from '../utils/cookie';
import { STORAGES } from '../constants/storage';

interface UserContextProps {
  user: IDetailUser | undefined;
  setUser: (user: IDetailUser | undefined) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: any }) => {
  const [user, setUser] = useState<IDetailUser>();

  useEffect(() => {
    if (!user) {
      const storedUser = getCookie(STORAGES.USER_LOGIN);
      if (storedUser) setUser(storedUser);
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
