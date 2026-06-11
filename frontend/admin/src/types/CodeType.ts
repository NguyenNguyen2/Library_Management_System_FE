import { IValueLabel } from '@shared/types/UserType';

interface IBaseCode {
  code: string;
  userInfo: IValueLabel;
  coursesInfo: IValueLabel[];
}

export interface IDetailCode extends IBaseCode {
  id: string;
  status: IValueLabel;
  createdAt: string;
  updatedAt: string;
}

export interface IListCode extends IBaseCode {
  id: string;
  status: IValueLabel;
  createdAt: string;
  updatedAt: string;
}

export type ICreateCode = IBaseCode;

export type IUpdateCode = IBaseCode;
