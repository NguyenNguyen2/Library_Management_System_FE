'use client';

import { useEffect, useState } from 'react';
import { Modal, Select, Spin, Table, Tag } from 'antd';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import { useCourseLessons } from '../hooks/useCourses';
import { useQuizHistory } from '../hooks/useQuizHistory';
import { IListLesson } from '@shared/types/CourseType';
import { DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';

interface QuizHistoryModalProps {
  open: boolean;
  courseId: string;
  courseName: string;
  onClose: () => void;
}

/**
 * Shown from the profile page "Tiến độ các khoá học" section.
 * Flow: pick a lesson of the course → fetch that lesson's quiz attempts.
 * Separate fetches keep the payload small when a course has many lessons.
 */
export function QuizHistoryModal({
  open,
  courseId,
  courseName,
  onClose,
}: QuizHistoryModalProps) {
  const t = useTranslations();
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(
    undefined,
  );

  const { data: lessons, isLoading: isLoadingLessons } =
    useCourseLessons(courseId);
  const { data: attempts, isLoading: isLoadingAttempts } =
    useQuizHistory(selectedLessonId);

  // Auto-select the first lesson whenever the modal (re)opens so the user
  // lands on something useful instead of an empty select.
  useEffect(() => {
    if (open && lessons?.length && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [open, lessons, selectedLessonId]);

  // Reset selection on close so a different course starts clean next time.
  useEffect(() => {
    if (!open) setSelectedLessonId(undefined);
  }, [open]);

  const lessonOptions = (lessons ?? []).map((l: IListLesson) => ({
    value: l.id,
    label: l.name,
  }));

  const columns = [
    {
      title: t('quiz_history_col_course'),
      key: 'course',
      render: () => courseName,
    },
    {
      title: t('quiz_history_col_result'),
      key: 'result',
      render: (_: unknown, row: { passed: boolean }) =>
        row.passed ? (
          <Tag color="green">{t('quiz_history_passed')}</Tag>
        ) : (
          <Tag color="red">{t('quiz_history_failed')}</Tag>
        ),
    },
    {
      title: t('quiz_history_col_attempt'),
      key: 'attemptNumber',
      dataIndex: 'attemptNumber',
      render: (n: number) =>
        t('quiz_history_attempt_number', { count: n }),
    },
    {
      title: t('quiz_history_col_date'),
      key: 'createdAt',
      dataIndex: 'createdAt',
      render: (date: string) => dayjs(date).format(DATE_DISPLAY_FORMAT),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      title={t('quiz_history_title', { course: courseName })}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 font-medium text-sm text-(--blackSoft)">
            {t('quiz_history_select_lesson')}
          </p>
          {isLoadingLessons ? (
            <Spin />
          ) : (
            <Select
              value={selectedLessonId}
              options={lessonOptions}
              onChange={setSelectedLessonId}
              className="w-full"
              placeholder={t('quiz_history_select_lesson')}
            />
          )}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={attempts ?? []}
          loading={isLoadingAttempts}
          pagination={false}
          locale={{ emptyText: t('quiz_history_empty') }}
          size="small"
        />
      </div>
    </Modal>
  );
}
