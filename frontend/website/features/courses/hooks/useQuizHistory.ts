import { useQuery } from '@tanstack/react-query';
import { quizHistoryApi } from '../api/quizHistoryApi';

/** Enabled only when a lesson is actually selected (modal open). */
export const useQuizHistory = (lessonId: string | undefined) =>
  useQuery({
    queryKey: ['quiz-attempts', lessonId],
    queryFn: () => quizHistoryApi.getByLesson(lessonId!),
    enabled: !!lessonId,
  });
