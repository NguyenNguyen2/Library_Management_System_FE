interface IBaseAchievement {
  name: string;
  requiredCourses: number;
}

export interface IListAchievement extends IBaseAchievement {
  id: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}
