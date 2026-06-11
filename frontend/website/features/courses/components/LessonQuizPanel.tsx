'use client';

import { Button, Radio, Space, Spin, Alert, Card, Result } from 'antd';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useLessonQuestions, useSubmitQuiz } from '../hooks/useCourses';

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string;
  correctAnswerText: string;
}

interface QuizResult {
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  score: number;
  results: QuestionResult[];
}

// Map option index to letter
const INDEX_TO_LETTER = ['A', 'B', 'C', 'D'];

interface LessonQuizPanelProps {
  lessonId: string;
  courseId: string;
}

export function LessonQuizPanel({ lessonId, courseId }: LessonQuizPanelProps) {
  const t = useTranslations();
  const { data: questions, isLoading } = useLessonQuestions(lessonId);
  const { mutate: submitQuiz, isPending: isSubmitting } =
    useSubmitQuiz(courseId);

  // answers stores letter values: { [questionId]: "A" | "B" | "C" | "D" }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showReview, setShowReview] = useState(false);

  const questionList: Question[] = Array.isArray(questions) ? questions : [];

  const handleSubmit = () => {
    submitQuiz(
      { lessonId, answers },
      {
        onSuccess: (result: QuizResult) => {
          setQuizResult(result);
          setShowReview(false);
        },
      }
    );
  };

  const handleRetry = () => {
    setAnswers({});
    setQuizResult(null);
    setShowReview(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  if (questionList.length === 0) {
    return <Alert type="info" message={t('quiz_no_questions')} showIcon />;
  }

  // Show Result screen after submit (unless reviewing answers)
  if (quizResult && !showReview) {
    return (
      <Result
        status={quizResult.passed ? 'success' : 'error'}
        title={
          quizResult.passed
            ? t('quiz_result_passed_title')
            : t('quiz_result_failed_title')
        }
        subTitle={
          quizResult.passed
            ? t('quiz_result_passed_subtitle', {
                correct: quizResult.correctCount,
                total: quizResult.totalQuestions,
              })
            : t('quiz_result_failed_subtitle', {
                correct: quizResult.correctCount,
                total: quizResult.totalQuestions,
              })
        }
        // extra={
        //   quizResult.passed
        //     ? [
        //         <Button key="review" onClick={() => setShowReview(true)}>
        //           {t('quiz_back_to_review')}
        //         </Button>,
        //       ]
        //     : [
        //         <Button key="retry" type="primary" onClick={handleRetry}>
        //           {t('quiz_retry')}
        //         </Button>,
        //         <Button key="review" onClick={() => setShowReview(true)}>
        //           {t('quiz_back_to_review')}
        //         </Button>,
        //       ]
        // }
      />
    );
  }

  // Build a map of question results for review display
  const resultMap = new Map(
    quizResult?.results.map((r) => [r.questionId, r]) ?? []
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-lg font-bold text-(--blackSoft)">{t('quiz_title')}</p>

      <div className="flex flex-col gap-3">
        {questionList.map((q, index) => {
          const result = resultMap.get(q.id);

          return (
            <Card
              key={q.id}
              size="small"
              className={[
                'rounded-lg border',
                result
                  ? result.isCorrect
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                  : 'border-(--grayBorder)',
              ].join(' ')}
              styles={{ body: { padding: 16 } }}
            >
              <div className="flex items-start gap-2 mb-3">
                <span className="font-semibold text-(--blackSoft) shrink-0">
                  {t('quiz_question_label', { index: index + 1 })}:
                </span>
                <span className="text-(--blackSoft)">{q.question}</span>
                {result &&
                  (result.isCorrect ? (
                    <CheckCircleOutlined className="text-green-500 mt-1 ml-auto shrink-0" />
                  ) : (
                    <CloseCircleOutlined className="text-red-500 mt-1 ml-auto shrink-0" />
                  ))}
              </div>

              <Radio.Group
                value={answers[q.id]}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                disabled={!!quizResult}
              >
                <Space direction="vertical" className="w-full">
                  {q.options.map((option, optIndex) => {
                    const letter = INDEX_TO_LETTER[optIndex];
                    const isCorrectAnswer =
                      result && letter === result.correctAnswer?.toUpperCase();
                    const isWrongSelected =
                      result && !result.isCorrect && letter === answers[q.id];

                    return (
                      <Radio
                        key={letter}
                        value={letter}
                        className={[
                          isCorrectAnswer ? 'text-green-600! font-medium' : '',
                          isWrongSelected ? 'text-red-500!' : '',
                        ].join(' ')}
                      >
                        {letter}. {option}
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-3">
        {quizResult && <Button onClick={handleRetry}>{t('quiz_retry')}</Button>}
        {!quizResult && (
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={Object.keys(answers).length < questionList.length}
            className="h-10 rounded-lg text-base font-medium"
          >
            {t('quiz_submit')}
          </Button>
        )}
      </div>
    </div>
  );
}
