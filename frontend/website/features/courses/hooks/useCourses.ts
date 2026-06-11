import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BaseListParams } from '@shared/types/GeneralType';
import { courseApi } from '../api/courseApi';

export const useCourses = (params: BaseListParams) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseApi.getList(params),
  });
};

export const useCourseLessons = (courseId: string) => {
  return useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => courseApi.getLessons(courseId),
    enabled: !!courseId,
  });
};

export const useUpdateLessonProgress = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, status }: { lessonId: string; status: string }) =>
      courseApi.updateLessonProgress(lessonId, status),
    // Await the invalidation so the refetch finishes before the mutation
    // resolves — callers' per-call `onSettled` then runs AFTER the cache
    // holds the fresh lesson list.
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] }),
  });
};

export const useCompleteLesson = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => courseApi.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
    },
  });
};

export const useLessonQuestions = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ['lesson-questions', lessonId],
    queryFn: () => courseApi.getQuestions(lessonId!),
    enabled: !!lessonId,
  });
};

export const useSubmitQuiz = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, answers }: { lessonId: string; answers: Record<string, string> }) =>
      courseApi.submitQuiz(lessonId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] });
    },
  });
};
