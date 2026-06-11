import { IValueLabel } from './UserType';

// ── Lesson ──────────────────────────────────────────────
interface IBaseLesson {
  name: string;
  /**
   * YouTube URL — `null` when the viewer isn't allowed to watch this lesson
   * (backend access control). Only exposed when the lesson is COMPLETED, or
   * when it's NOT_STARTED and the previous lesson is done (first lesson has
   * no prereq).
   */
  youtubeUrl: string | null;
  questionCount: number;
  duration?: string;
  learningStatus?: ILearningStatus;
  /** Platform-wide retry cap (from settings). */
  quizRetryLimit?: number;
  /** Retries the user has already used on this lesson. */
  quizRetryUsed?: number;
}

export interface IListLesson extends IBaseLesson {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDetailLesson extends IBaseLesson {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type ICreateLesson = IBaseLesson;

export interface IUpdateLesson extends IBaseLesson {
  status?: IValueLabel;
}

// ── Question ────────────────────────────────────────────
interface IBaseQuestion {
  id: string;
  lessonId: string;
  question: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  options: string[];
}

export interface IListQuestion extends IBaseQuestion {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDownloadQuestionTemplate {
  blob: Blob;
  filename?: string;
}

// ── Course ──────────────────────────────────────────────
// Shared list/detail endpoint, different response shape per app:
// - Admin keeps the full `lessons` array (for lesson management UI).
// - Website drops `lessons` and returns only progress metrics
//   (`totalLessons`, `completedLessons`, `progress`) to keep payloads small
//   on the home page.
interface IBaseCourse {
  name: string;
  image: string;
  /** Populated for admin responses; website omits it. */
  lessons?: IListLesson[];
  description?: string;
}

export interface IDetailCourse extends IBaseCourse {
  id: string;
  lessons: IListLesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface IListCourse extends IBaseCourse {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  /** Total lesson count (website only). */
  totalLessons?: number;
  /** Lessons user has finished — COMPLETED or LOCKED (website only). */
  completedLessons?: number;
  /** Completion percentage 0-100, rounded (website only). */
  progress?: number;
  /** Admin visibility flag — admin list always returns it. */
  isActive?: boolean;
}

export type ICreateCourse = IBaseCourse;

export interface IUpdateCourse extends IBaseCourse {
  status?: IValueLabel;
}

// ── Learning Status ─────────────────────────────────────
export type TLearningStatus =
  | 'NOT_STARTED'
  | 'QUIZ'
  | 'FAIL'
  | 'COMPLETED'
  | 'LOCKED';

export interface ILearningStatus {
  value: TLearningStatus;
  label: string;
}

/** Lesson with user learning progress (website) */
export interface ILessonWithProgress extends IListLesson {
  learningStatus?: ILearningStatus;
}
