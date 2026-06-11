import axiosInstance from '@/lib/axios/axios-client';
import { BaseListParams } from '@shared/types/GeneralType';

export const courseApi = {
  getList: async (params: BaseListParams) => {
    const response = await axiosInstance.get('/v1/courses', { params });
    return response?.data?.results?.objects;
  },

  getLessons: async (courseId: string) => {
    const response = await axiosInstance.get(`/v1/courses/${courseId}/lessons`);
    return response?.data?.results?.object;
  },

  // Generic progress update — server-side whitelist restricts which statuses
  // the client may set directly (currently only QUIZ).
  updateLessonProgress: async (lessonId: string, status: string) => {
    const response = await axiosInstance.patch(
      `/v1/lessons/${lessonId}/progress`,
      { status },
    );
    return response?.data?.results?.object;
  },

  completeLesson: async (lessonId: string) => {
    const response = await axiosInstance.post(`/v1/lessons/${lessonId}/complete`);
    return response?.data?.results?.object;
  },

  getQuestions: async (lessonId: string) => {
    const response = await axiosInstance.get(`/v1/lessons/${lessonId}/questions`);
    return response?.data?.results?.object;
  },

  submitQuiz: async (lessonId: string, answers: Record<string, string>) => {
    const response = await axiosInstance.post(`/v1/lessons/${lessonId}/submit-quiz`, { answers });
    return response?.data?.results?.object;
  },
};
