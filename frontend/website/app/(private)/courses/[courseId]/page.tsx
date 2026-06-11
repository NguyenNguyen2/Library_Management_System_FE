'use client';

import { Card, Button, Result, Spin, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  PlayCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  useCourseLessons,
  useUpdateLessonProgress,
} from '@/features/courses/hooks/useCourses';
import { LessonQuizPanel } from '@/features/courses/components/LessonQuizPanel';
import { PlayCircleIcon } from '../../_icons/PlayCircleIcon';
import { formatNumber } from '@shared/utils/numberUtils';
import { IListLesson } from '@shared/types/CourseType';
import {
  cn,
  CompletedLearningStatus,
  FailLearningStatus,
  findOptionObject,
  LearningStatusOptions,
  LockedLearningStatus,
  NotStartedLearningStatus,
  QuizLearningStatus,
} from '@shared/constants/commonConst';
import { HOVER_CLICKABLE } from '@shared/constants/animation';

export default function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const t = useTranslations();

  const { data: lessonList, isLoading } = useCourseLessons(courseId);

  const { mutate: updateLessonProgress, isPending: isStartingQuiz } =
    useUpdateLessonProgress(courseId);

  const [selectedLesson, setSelectedLesson] = useState<IListLesson | null>(
    null
  );
  const selectedLearningStatus = selectedLesson?.learningStatus?.value
    ? findOptionObject(
        LearningStatusOptions(t),
        selectedLesson.learningStatus.value
      )
    : null;

  // Factory-backed constants for equality checks (so call sites stay decoupled
  // from raw string literals — only commonConst owns the canonical values).
  const notStartedStatus = NotStartedLearningStatus(t);
  const quizStatus = QuizLearningStatus(t);
  const completedStatus = CompletedLearningStatus(t);
  const lockedStatus = LockedLearningStatus(t);
  const failStatus = FailLearningStatus(t);

  // Sequential gating: a lesson unlocks only when the previous one is done
  // (COMPLETED or LOCKED — LOCKED is auto-lock after passing, still "done").
  // The first lesson has no prerequisite and is always accessible.
  const selectedLessonIndex =
    lessonList?.findIndex((l: IListLesson) => l.id === selectedLesson?.id) ??
    -1;
  const prevLesson =
    selectedLessonIndex > 0 ? lessonList?.[selectedLessonIndex - 1] : null;
  const isPrevLessonDone = prevLesson
    ? prevLesson.learningStatus?.value === completedStatus.value ||
      prevLesson.learningStatus?.value === lockedStatus.value
    : true;
  const isLockedByPrev = !isPrevLessonDone;
  // Locked UI fires when either the status itself is LOCKED, or the previous
  // lesson gates this one.
  const showLockedBox =
    selectedLearningStatus?.value === lockedStatus.value || isLockedByPrev;

  const getYoutubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?\s]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const handleStartQuiz = () => {
    if (!selectedLesson) return;
    updateLessonProgress(
      { lessonId: selectedLesson.id, status: quizStatus.value },
      {
        // API trả UserLessonProgress (chỉ có learningStatus), không phải full
        // IListLesson — merge learningStatus mới vào selectedLesson cũ để giữ
        // nguyên name, duration, youtubeUrl, ...
        onSuccess: (data) => {
          setSelectedLesson((prev) =>
            prev ? { ...prev, learningStatus: data.learningStatus } : prev
          );
        },
      }
    );
  };

  // Each lesson icon shares the same 9x9 rounded badge wrapper so the lesson
  // list row layout stays consistent across every learning status.
  const renderLessonIcon = (lesson: IListLesson) => {
    const wrap = (bgClass: string, icon: React.ReactNode) => (
      <div
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
          bgClass
        )}
      >
        {icon}
      </div>
    );

    switch (lesson.learningStatus?.value) {
      case completedStatus.value:
        return wrap(
          'bg-(--greenLight)',
          <CheckCircleOutlined style={{ color: 'green' }} />
        );
      case quizStatus.value:
        return wrap(
          'bg-(--blueLightest)',
          <QuestionCircleOutlined style={{ color: 'blue' }} />
        );
      case failStatus.value:
        return wrap(
          'bg-(--orangePale)',
          <CloseCircleOutlined style={{ color: 'red' }} />
        );
      case lockedStatus.value:
        return wrap(
          'bg-(--yellowPale)',
          <LockOutlined style={{ color: 'orange' }} />
        );
      case completedStatus.value:
      default:
        return wrap(
          'bg-(--grayBorder)',
          <PlayCircleOutlined style={{ color: 'gray' }} />
        );
    }
  };

  return (
    <div>
      <div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          className="mb-6 px-0 font-medium text-base text-(--blackSoft) hover:underline hover:bg-transparent"
        >
          {t('back_button')}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-[309px_1fr] gap-6 items-start">
          {/* Left: lesson list */}
          <Card
            className="rounded-[10px] border border-(--grayBorder)"
            styles={{ body: { padding: 24 } }}
          >
            <p className="mb-1.5 block text-lg font-bold tracking-tight text-(--blackSoft)">
              {t('lesson_list_title')}
            </p>
            <p className="mb-4 block text-sm text-(--grayDark)">
              {formatNumber(lessonList?.length)} {t('lesson_unit')}
            </p>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {lessonList?.map((lesson: IListLesson) => {
                  const isSelected = selectedLesson?.id === lesson.id;
                  const learningStatus = findOptionObject(
                    LearningStatusOptions(t),
                    lesson.learningStatus?.value
                  );

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={cn(
                        'flex items-center justify-between rounded-[10px] border px-4 py-3',
                        HOVER_CLICKABLE,
                        isSelected
                          ? 'border-(--blueMedium) bg-(--blueLightest)'
                          : 'border-(--blackBorder) bg-transparent hover:border-(--grayMedium)'
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {renderLessonIcon(lesson)}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="line-clamp-1 text-base font-medium leading-6 text-(--blackSoft)">
                              {lesson.name}
                            </p>

                            <Tag
                              color={
                                (learningStatus?.color as string) || 'default'
                              }
                              className="!text-xs !m-0"
                            >
                              {learningStatus?.label}
                            </Tag>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.duration && (
                              <span className="flex items-center gap-1 text-sm text-(--grayDark)">
                                <ClockCircleOutlined className="text-xs" />
                                {lesson.duration}
                              </span>
                            )}
                            {lesson.questionCount > 0 && (
                              <span className="text-sm text-(--grayDark)">
                                • {formatNumber(lesson.questionCount)}{' '}
                                {t('question_unit')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Right: video player */}
          <Card
            className="min-h-[237px] rounded-[10px] border border-(--grayBorder)"
            styles={{ body: { padding: 24, height: '100%' } }}
          >
            {selectedLesson ? (
              <div className="flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xl font-bold leading-7 text-(--blackSoft)">
                    {selectedLesson.name}
                  </p>
                  {selectedLesson.learningStatus &&
                    selectedLesson.learningStatus.value !==
                      notStartedStatus.value && (
                      <Tag
                        color={
                          (findOptionObject(
                            LearningStatusOptions(t),
                            selectedLesson.learningStatus.value
                          )?.color as string) || 'default'
                        }
                        className="text-sm! px-3! py-1! shrink-0"
                      >
                        {
                          findOptionObject(
                            LearningStatusOptions(t),
                            selectedLesson.learningStatus.value
                          )?.label
                        }
                      </Tag>
                    )}
                </div>
                {/* Locked — gray box replacing video. Fires when status is
                    LOCKED, or when the previous lesson isn't done yet. */}
                {showLockedBox && (
                  <div className="aspect-video w-full rounded-[10px] bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LockOutlined className="text-4xl mb-2" />
                      <p className="text-lg font-semibold">
                        {t('video_locked')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Video player — visible only for NOT_STARTED and COMPLETED,
                    and only when not gated by the previous lesson. */}
                {!isLockedByPrev &&
                  (selectedLearningStatus?.value === notStartedStatus.value ||
                    selectedLearningStatus?.value === completedStatus.value) &&
                  (getYoutubeEmbedUrl(selectedLesson?.youtubeUrl) ? (
                    <div
                      className="relative aspect-video w-full rounded-[10px] overflow-hidden group"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <iframe
                        src={getYoutubeEmbedUrl(selectedLesson?.youtubeUrl)!}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div
                        className="absolute inset-0 z-10"
                        onContextMenu={(e) => e.preventDefault()}
                        onClick={(e) => {
                          (e.currentTarget as HTMLElement).style.display =
                            'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-[10px] bg-(--grayBorder) flex items-center justify-center">
                      <p className="text-(--grayMedium)">{t('no_video')}</p>
                    </div>
                  ))}

                {/* Complete lesson button — only show when NOT_STARTED and
                    not gated by the previous lesson. */}
                {!isLockedByPrev &&
                  selectedLearningStatus?.value === notStartedStatus.value && (
                    <div className="flex justify-end">
                      <Button
                        type="primary"
                        loading={isStartingQuiz}
                        onClick={handleStartQuiz}
                        className="h-10 rounded-lg text-base font-medium"
                      >
                        {t('complete_video_button')}
                      </Button>
                    </div>
                  )}

                {/* Quiz panel — show when status is QUIZ and not gated. */}
                {!isLockedByPrev &&
                  selectedLearningStatus?.value === quizStatus.value && (
                    <LessonQuizPanel
                      lessonId={selectedLesson.id}
                      courseId={courseId}
                    />
                  )}

                {/* FAIL — show "Chưa đạt" result (only when not gated). */}
                {!isLockedByPrev &&
                  selectedLearningStatus?.value === failStatus.value && (
                    <Result
                      status="error"
                      title={t('quiz_result_failed_title')}
                      // extra={
                      //   <Button
                      //     type="primary"
                      //     loading={isStartingQuiz}
                      //     onClick={handleStartQuiz}
                      //   >
                      //     {t('quiz_retry')}
                      //   </Button>
                      // }
                    />
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
                <PlayCircleIcon />
                <div className="text-center">
                  <p className="font-medium text-lg text-(--navyDark) leading-7">
                    {t('select_lesson_title')}
                  </p>
                  <p className="text-base text-(--grayDark) mt-1">
                    {t('select_lesson_subtitle')}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
