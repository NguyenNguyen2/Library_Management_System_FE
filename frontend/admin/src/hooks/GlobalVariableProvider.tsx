import React, { createContext, useState } from 'react';
import { UserProvider, useUser } from '@shared/provider/UserProvider';

export interface LocationDefaultProps {
  province: { label: string | null; value: string | null };
  district: { label: string | null; value: string | null };
  address: string;
}

export interface LoadingUploadProps {
  avatar: boolean;
  attachment: boolean;
  panorama: boolean;
  image: boolean;
  thumbnail: boolean;
  preview: boolean;
  original: boolean;
}
interface GlobalVariableContextProps {
  locationValue?: LocationDefaultProps | undefined;
  locationKey?: string;
  loadingUpload?: LoadingUploadProps;
  setLocationValue: (locationValue: LocationDefaultProps) => void;
  setLocationKey: (locationKey: string) => void;
  setLoadingUpload: (loadingUpload: LoadingUploadProps) => void;
}

const GlobalVariableContext = createContext<
  GlobalVariableContextProps | undefined
>(undefined);

export const GlobalVariableProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [locationValue, setLocationValue] = useState<LocationDefaultProps>();
  const [locationKey, setLocationKey] = useState<string>('');
  const [loadingUpload, setLoadingUpload] = useState<LoadingUploadProps>({
    thumbnail: false,
    preview: false,
    original: false,
    panorama: false,
    image: false,
    attachment: false,
    avatar: false,
  });

  return (
    <UserProvider>
      <GlobalVariableContext.Provider
        value={{
          locationValue,
          locationKey,
          loadingUpload,
          setLocationValue,
          setLocationKey,
          setLoadingUpload,
        }}
      >
        {children}
      </GlobalVariableContext.Provider>
    </UserProvider>
  );
};

export const useGlobalVariable = () => {
  const context = React.useContext(GlobalVariableContext);
  if (!context) {
    throw new Error('useGlobalVariable must be used within a GlobalVariable');
  }
  const { user, setUser } = useUser();
  return { ...context, user, setUser };
};
