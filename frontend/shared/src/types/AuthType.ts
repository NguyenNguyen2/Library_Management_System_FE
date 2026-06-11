import { IDetailUser } from './UserType';

export interface IResponseLogin {
  accessToken: string;
  refreshToken?: string;
  user: IDetailUser;
}
