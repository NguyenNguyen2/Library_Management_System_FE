import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { setCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { useUser } from '@shared/provider/UserProvider';
import { IDetailUser } from '@shared/types/UserType';
import { codeApi } from '../api/codeApi';

interface ActivateResponse {
  code: unknown;
  user: IDetailUser;
}

/**
 * Activate a code: marks it USED and grants attached courses.
 * Backend returns updated user (completedCourses + achievement) so FE
 * refreshes local state in cookie + UserProvider without extra fetch.
 */
export const useActivateCode = () => {
  const queryClient = useQueryClient();
  const { setUser } = useUser();

  return useMutation<ActivateResponse, AxiosError, { code: string }>({
    mutationFn: codeApi.activate,
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
        setCookie(STORAGES.USER_LOGIN, data.user);
      }
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
