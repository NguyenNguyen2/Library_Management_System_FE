/** Generic value-label pair for denormalized selector references. */
export interface IValueLabel {
  value: string;
  label: string;
}

export interface IBaseUser {
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  avatar?: string;
  achievement?: IValueLabel;
}

export interface IDetailUser extends IBaseUser {
  id: string;
  status?: IValueLabel;
  completedCourses?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface IListUser extends IBaseUser {
  id: string;
  status?: IValueLabel;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateUser extends IBaseUser {
  password: string;
}

export interface IUpdateUser extends IBaseUser {
  status?: IValueLabel;
}
