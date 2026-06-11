import { IValueLabel } from './UserType';

interface IBaseAchievement {
  name: string;
  requiredCourses: number;
}
export interface IDetailAchievement extends IBaseAchievement {
  id: string;
  status?: IValueLabel;
  createdAt?: string;
  updatedAt?: string;
}

export interface IListAchievement extends IBaseAchievement {
  id: string;
  status?: IValueLabel;
  createdAt?: string;
  updatedAt?: string;
}

export type ICreateAchievement = IBaseAchievement & { status?: IValueLabel };

export interface IUpdateAchievement extends IBaseAchievement {
  status?: IValueLabel;
}
