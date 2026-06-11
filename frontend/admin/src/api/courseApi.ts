import { BaseListParams, ListResponseType } from '@shared/types/GeneralType';
import axiosInstance from './axiosInstance';
import {
  ICreateCourse,
  ICreateLesson,
  IDetailCourse,
  IDownloadQuestionTemplate,
  IListCourse,
  IListQuestion,
  IUpdateCourse,
  IUpdateLesson,
} from '@shared/types/CourseType';

export const courseApi = {
  course: {
    getListCourses: async (params: BaseListParams) => {
      const response = await axiosInstance.get<ListResponseType<IListCourse>>(
        '/private/v1/courses',
        { params }
      );
      return response?.data?.results?.objects;
    },

    getDetailCourse: async (id: string): Promise<IDetailCourse> => {
      const response = await axiosInstance.get(`/private/v1/courses/${id}`);
      return response.data?.results?.object;
    },

    createCourse: async ({
      body,
    }: {
      body: ICreateCourse;
      params: BaseListParams;
    }) => {
      const response = await axiosInstance.post('/private/v1/courses', body);
      return response.data?.results?.object;
    },

    updateCourse: async ({
      id,
      body,
    }: {
      id: string;
      body: IUpdateCourse;
      index: number;
      params: BaseListParams;
    }) => {
      const response = await axiosInstance.patch(
        `/private/v1/courses/${id}`,
        body
      );
      return response.data?.results?.object;
    },

    deleteCourse: async ({ id }: { id: string; params: BaseListParams }) => {
      const response = await axiosInstance.delete(`/private/v1/courses/${id}`);
      return response.data;
    },
  },
  lesson: {
    createLessons: async ({
      courseId,
      lessons,
    }: {
      courseId: string;
      lessons: ICreateLesson[];
      params: BaseListParams;
    }) => {
      const response = await axiosInstance.post(
        `/private/v1/courses/${courseId}/lessons`,
        lessons
      );
      return response.data?.results?.object;
    },

    updateLesson: async ({
      id,
      body,
    }: {
      id: string;
      body: IUpdateLesson;
      courseId: string;
      params: BaseListParams;
    }) => {
      const response = await axiosInstance.patch(
        `/private/v1/lessons/${id}`,
        body
      );
      return response.data?.results?.object;
    },

    deleteLesson: async ({ id }: { id: string; params: BaseListParams }) => {
      const response = await axiosInstance.delete(`/private/v1/lessons/${id}`);
      return response.data;
    },
  },
  question: {
    getListQuestion: async ({
      lessonId,
      page = 1,
      limit = 5,
    }: {
      lessonId: string;
      page?: number;
      limit?: number;
    }) => {
      // Follows the shared list-response shape: { rows, total } wrapped as
      // `results.objects`. Default page=1, limit=5 matches the admin modal.
      const response = await axiosInstance.get<ListResponseType<IListQuestion>>(
        `/private/v1/lessons/${lessonId}/questions`,
        { params: { page, limit } },
      );
      return (
        response?.data?.results?.objects ?? { rows: [], total: 0 }
      );
    },

    deleteQuestion: async ({ id }: { id: string; lessonId: string }) => {
      const response = await axiosInstance.delete(`/private/v1/questions/${id}`);
      return response.data;
    },

    importQuestions: async ({
      lessonId,
      file,
    }: {
      lessonId: string;
      file: File;
      params: BaseListParams;
    }): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);
      await axiosInstance.post(
        `/private/v1/questions/lesson/${lessonId}/import`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    },

    downloadQuestionTemplate: async ({
      params: _params,
    }: {
      params: BaseListParams;
    }): Promise<IDownloadQuestionTemplate> => {
      const response = await axiosInstance.get(
        '/private/v1/questions/template/download',
        { responseType: 'blob' }
      );
      const contentDisposition =
        response.headers?.['content-disposition'] ?? '';
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      return {
        blob: response.data,
        filename: match?.[1] ?? 'template-cau-hoi.xlsx',
      };
    },
  },
};
