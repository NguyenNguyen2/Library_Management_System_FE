import axiosInstance from '@/lib/axios/axios-client';

export interface IQuizAttempt {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  createdAt: string;
}

export const quizHistoryApi = {
  /** Current user's quiz attempts for a lesson, newest first. */
  getByLesson: async (lessonId: string): Promise<IQuizAttempt[]> => {
    const response = await axiosInstance.get<{
      results: { objects: { rows: IQuizAttempt[]; total: number } };
    }>(`/v1/lessons/${lessonId}/quiz-attempts`);
    return response?.data?.results?.objects?.rows ?? [];
  },
};
