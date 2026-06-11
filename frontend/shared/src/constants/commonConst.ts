import { getKey } from '../types/I18nKeyType';
import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BaseListParams, OptionType } from '../types/GeneralType';
import { TLearningStatus } from '../types/CourseType';

export const NUMBER_FORMAT = '0,0[.]0';
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATE_DISPLAY_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'HH:mm';
export const DATE_TIME_FORMAT = 'MMMM D, YYYY, h:mm:ss A';

export const DEFAULT_PASSWORD = '123456aA@';

export const initSearchParams: BaseListParams = {
  page: 1,
  limit: 100,
};

export const NotAvailable = '-';

export const IMAGE_FALLBACK = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iODAiIGZpbGw9IiNFOEVDRjAiLz48dGV4dCB4PSI2NCIgeT0iNDQiIGZvbnQtZmFtaWx5PSJJbnRlciIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNCOCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+`;

// Framework-agnostic translator signature. Each app passes its own translator
// (admin: i18next.t, website: next-intl useTranslations()) so shared code stays
// decoupled from any specific i18n library.
export type TranslatorFn = (key: string) => string;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const findOptionObject = (
  arr: OptionType[],
  value: string | undefined
) => {
  if (!value) return;
  return arr.find((item) => item.value === value);
};

export const configSuccess = (t: TranslatorFn) => ({
  message: t(getKey('config_success_message')),
});

export const configErr = (t: TranslatorFn) => ({
  message: t(getKey('config_error_message')),
});

// ── Learning Status options (per-user course/lesson progress) ──
// Align with `TLearningStatus` union and backend `LearningStatusValue` enum.
// Factory signature `(t) => ({...})` keeps label i18n-agnostic: admin passes
// i18next.t, website passes next-intl's translator.
export const NotStartedLearningStatus = (t: TranslatorFn) => ({
  label: t(getKey('learning_not_started')),
  value: 'NOT_STARTED' as const,
  color: 'default',
});

export const QuizLearningStatus = (t: TranslatorFn) => ({
  label: t(getKey('learning_quiz')),
  value: 'QUIZ' as const,
  color: 'blue',
});

export const FailLearningStatus = (t: TranslatorFn) => ({
  label: t(getKey('learning_fail')),
  value: 'FAIL' as const,
  color: 'red',
});

export const CompletedLearningStatus = (t: TranslatorFn) => ({
  label: t(getKey('learning_completed')),
  value: 'COMPLETED' as const,
  color: 'green',
});

export const LockedLearningStatus = (t: TranslatorFn) => ({
  label: t(getKey('learning_locked')),
  value: 'LOCKED' as const,
  color: 'orange',
});

export const LearningStatusOptions = (t: TranslatorFn) =>
  [
    NotStartedLearningStatus(t),
    QuizLearningStatus(t),
    FailLearningStatus(t),
    CompletedLearningStatus(t),
    LockedLearningStatus(t),
  ] as const satisfies Array<{
    label: string;
    value: TLearningStatus;
    color: string;
  }>;
