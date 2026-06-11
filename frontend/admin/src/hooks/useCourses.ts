import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { message } from 'antd';
import i18n from 'i18next';
import { courseApi } from '../api/courseApi';
import { QueryKey } from '../constants/queryKey';
import {
  ICreateCourse,
  ICreateLesson,
  IDetailCourse,
  IDownloadQuestionTemplate,
  IListCourse,
  IListLesson,
  IUpdateCourse,
  IUpdateLesson,
} from '@shared/types/CourseType';
import {
  BaseListParams,
  ListResponseTypeObject,
} from '@shared/types/GeneralType';
import { saveBlob } from '@shared/utils/fileDownload';
import { getKey } from '@shared/types/I18nKeyType';

export const courseHooks = {
  useFetchListCourses: (params: BaseListParams) => {
    return useQuery({
      queryKey: [QueryKey.courses.list, params],
      queryFn: () => courseApi.course.getListCourses(params),
    });
  },

  useFetchDetailCourse: (id: string, enabled: boolean = true) => {
    return useQuery({
      queryKey: [QueryKey.courses.detail, id],
      enabled: !!id && enabled,
      queryFn: () => courseApi.course.getDetailCourse(id),
    });
  },

  useFetchQuestionsByLesson: (
    lessonId: string,
    page: number = 1,
    limit: number = 5,
    enabled: boolean = true,
  ) => {
    return useQuery({
      queryKey: [QueryKey.courses.detail, 'questions', lessonId, page, limit],
      queryFn: () =>
        courseApi.question.getListQuestion({ lessonId, page, limit }),
      enabled: !!lessonId && enabled,
    });
  },

  useCreateCourse: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCourse,
      AxiosError,
      { body: ICreateCourse; params: BaseListParams }
    >({
      mutationFn: courseApi.course.createCourse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        message.success(i18n.t(getKey('create_course_success')));
      },
    });
  },

  useUpdateCourse: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCourse,
      AxiosError,
      {
        id: string;
        body: IUpdateCourse;
        index: number;
        params: BaseListParams;
      }
    >({
      mutationFn: courseApi.course.updateCourse,
      // Patch the updated row directly into the paginated list cache
      // using the row index passed from FilterTable — avoids iterating all rows.
      onSuccess: (updated, { index, params }) => {
        queryClient.setQueryData<ListResponseTypeObject<IListCourse>>(
          [QueryKey.courses.list, params],
          (old) => {
            if (!old?.rows?.[index]) return old;
            const rows = [...old.rows];
            rows[index] = { ...rows[index], ...updated } as IListCourse;
            return { ...old, rows };
          }
        );
      },
    });
  },

  useDeleteCourse: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IDetailCourse,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: courseApi.course.deleteCourse,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
      },
    });
  },

  // Create lessons (batch)
  useCreateLessons: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IListLesson[],
      AxiosError,
      { courseId: string; lessons: ICreateLesson[]; params: BaseListParams }
    >({
      mutationFn: courseApi.lesson.createLessons,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
      },
    });
  },

  // Update lesson
  useUpdateLesson: () => {
    const queryClient = useQueryClient();
    return useMutation<
      IListLesson,
      AxiosError,
      {
        id: string;
        body: IUpdateLesson;
        courseId: string;
        params: BaseListParams;
      }
    >({
      mutationFn: courseApi.lesson.updateLesson,
      onSuccess: (updatedLesson, { courseId, params }) => {
        queryClient.setQueryData<ListResponseTypeObject<IListCourse>>(
          [QueryKey.courses.list, params],
          (old) => {
            if (!old?.rows) return old;
            const rows = old.rows.map((course) => {
              if (course.id !== courseId) return course;
              const lessons = (course.lessons ?? []).map((l) =>
                l.id === updatedLesson.id ? { ...l, ...updatedLesson } : l
              );
              return { ...course, lessons };
            });
            return { ...old, rows };
          }
        );
      },
    });
  },

  // Delete lesson
  useDeleteLesson: () => {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      AxiosError,
      { id: string; params: BaseListParams }
    >({
      mutationFn: courseApi.lesson.deleteLesson,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
      },
    });
  },

  // Download question template
  useDownloadQuestionTemplate: () => {
    return useMutation<
      IDownloadQuestionTemplate,
      AxiosError,
      { params: BaseListParams }
    >({
      mutationFn: courseApi.question.downloadQuestionTemplate,
      onSuccess: ({ blob, filename }) => {
        saveBlob(blob, filename || 'template-cau-hoi.xlsx');
      },
    });
  },

  // Delete a question — invalidate the lesson's question list cache on success
  useDeleteQuestion: () => {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      AxiosError,
      { id: string; lessonId: string }
    >({
      mutationFn: courseApi.question.deleteQuestion,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: [QueryKey.courses.detail, 'questions', variables.lessonId],
        });
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
      },
    });
  },

  // Import questions from file
  useImportQuestions: () => {
    const queryClient = useQueryClient();
    return useMutation<
      void,
      AxiosError,
      { lessonId: string; file: File; params: BaseListParams }
    >({
      mutationFn: courseApi.question.importQuestions,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: [QueryKey.courses.list] });
        queryClient.invalidateQueries({
          queryKey: [QueryKey.courses.detail, 'questions', variables.lessonId],
        });
      },
    });
  },
};
