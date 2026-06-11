'use client';

import {
  Avatar,
  Card,
  Button,
  Form,
  Progress,
  Spin,
  Upload,
  message,
} from 'antd';
import { PASSWORD_PATTERN } from '@shared/constants/regex';
import type { UploadRequestOption } from 'rc-upload/lib/interface';
import {
  ArrowLeftOutlined,
  CameraOutlined,
  LoadingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { formatNumber } from '@shared/utils/numberUtils';
import CustomInput from '@shared/components/input/CustomInput';
import { useUser } from '@shared/provider/UserProvider';
import { uploadApi } from '@/features/uploads/api/uploadApi';
import { useCourses } from '@/features/courses/hooks/useCourses';
import {
  useChangePassword,
  useUpdateUser,
} from '@/features/users/hooks/useUsers';
import { APP_ROUTE } from '@/constants/routes';
import Image from 'next/image';
import { IListCourse } from '@shared/types/CourseType';
import { setCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { QuizHistoryModal } from '@/features/courses/components/QuizHistoryModal';
import { CheckCircleIcon } from '../_icons/CheckCircleIcon';
import { CourseBookIcon } from '../_icons/CourseBookIcon';
import { ProgressTrendIcon } from '../_icons/ProgressTrendIcon';
import { HOVER_CLICKABLE } from '@shared/constants/animation';

const ProfilePage = () => {
  const router = useRouter();
  const t = useTranslations();
  const { user, setUser } = useUser();
  const { mutate: updateUser, isPending: isSaving } = useUpdateUser();
  const { mutate: changePassword, isPending: isChangingPw } =
    useChangePassword();
  const [pwForm] = Form.useForm();

  const [editingInfo, setEditingInfo] = useState(false);
  const [editingPw, setEditingPw] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [quizHistoryCourse, setQuizHistoryCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSubmitChangePassword = (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    changePassword(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          message.success(t('save_btn'));
          pwForm.resetFields();
          setEditingPw(false);
        },
        onError: () => {
          message.error(t('config_error_message'));
        },
      },
    );
  };

  /**
   * Click-to-upload flow for the avatar circle. Wired to Antd Upload's
   * `customRequest` so we control the network call (reuse `uploadApi.upload`)
   * and skip the default file-list UI entirely.
   */
  const handleUploadAvatar = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    try {
      setIsUploadingAvatar(true);
      const uploaded = await uploadApi.upload([file as File], 'avatar');
      const fileUrl = uploaded?.[0]?.fileUrl;
      if (fileUrl) setAvatar(fileUrl);
      onSuccess?.(uploaded);
    } catch (err) {
      message.error(t('config_error_message'));
      onError?.(err as Error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Sync local form state with user data on load / change
  useEffect(() => {
    if (user) {
      setName(user.name ?? '');
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleSaveInfo = () => {
    if (!user?.id) return;
    updateUser(
      { id: user.id, body: { name, avatar } },
      {
        onSuccess: (updated) => {
          // Mirror new fields into provider + cookie so the rest of the app
          // (header name/avatar, future reloads) reflects the change without
          // a second fetch.
          const next = { ...user, ...updated };
          setUser(next);
          setCookie(STORAGES.USER_LOGIN, next);
          setEditingInfo(false);
          message.success(t('save_btn'));
        },
      },
    );
  };

  // Fetch user's courses (same endpoint home page uses — backend returns
  // CourseWithProgress: totalLessons, completedLessons, progress, no lessons[]).
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    page: 1,
    limit: 100,
  });
  const userCourses: IListCourse[] = coursesData?.rows ?? [];

  // Left-column overview stats — aggregated in a single pass over the course
  // list (also used to render the right-column cards). One `reduce` keeps
  // source of truth together; no separate stats API round-trip.
  // Course-level aggregation: "đã hoàn thành" counts courses at 100%,
  // "đang học" counts courses at 0<progress<100, and the overall progress bar
  // reflects completed / total at the course level (consistent with the rows).
  const { totalCourses, completedCoursesCount, inProgressCount } =
    userCourses.reduce(
      (acc, c) => {
        const progress = c.progress ?? 0;
        acc.totalCourses += 1;
        if (progress >= 100) acc.completedCoursesCount += 1;
        else if (progress > 0) acc.inProgressCount += 1;
        return acc;
      },
      { totalCourses: 0, completedCoursesCount: 0, inProgressCount: 0 }
    );
  const overallProgress =
    totalCourses > 0
      ? Math.round((completedCoursesCount / totalCourses) * 100)
      : 0;

  return (
    <div>
      <div>
        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(APP_ROUTE.home)}
          className="text-(--blackSoft) font-medium text-base px-0 mb-6 hover:bg-transparent hover:underline"
        >
          {t('back_button')}
        </Button>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-[308px_1fr] gap-6 items-start">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {/* Personal Info Card */}
            <Card
              className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
              styles={{ body: { padding: 24 } }}
            >
              <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
                {t('personal_info_title')}
              </p>

              {!editingInfo ? (
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    size={128}
                    shape="circle"
                    src={avatar || undefined}
                    icon={<UserOutlined />}
                    className="bg-(--blueLight) rounded-full shrink-0"
                  />
                  <div>
                    <p className="font-bold text-lg text-(--blackSoft) text-center">
                      {name}
                    </p>
                    <p className="text-(--grayMedium) mt-0.5 text-center">
                      {user?.email}
                    </p>
                  </div>
                  <Button
                    block
                    onClick={() => setEditingInfo(true)}
                    className="border border-(--grayBorderMedium) rounded-lg text-(--blackSoft) font-medium text-sm h-10"
                  >
                    {t('edit_button')}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Click-to-upload avatar — the whole circle acts as the
                      file picker. A small camera badge hints at the action;
                      a spinner replaces it while uploading. */}
                  <div className="flex justify-center">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      customRequest={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                    >
                      <div className="relative cursor-pointer group">
                        <Avatar
                          size={128}
                          shape="circle"
                          src={avatar || undefined}
                          icon={<UserOutlined />}
                          className="bg-(--blueLight) rounded-full shrink-0"
                        />
                        <div className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-(--primaryBlue) text-white flex items-center justify-center shadow-md transition-opacity group-hover:opacity-90">
                          {isUploadingAvatar ? (
                            <LoadingOutlined className="text-base" />
                          ) : (
                            <CameraOutlined className="text-base" />
                          )}
                        </div>
                      </div>
                    </Upload>
                  </div>

                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">
                      {t('full_name')}
                    </p>
                    <CustomInput
                      value={name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setName(e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <p className="font-medium text-sm text-(--blackSoft) mb-1.5">
                      {t('email')}
                    </p>
                    <CustomInput value={user?.email ?? ''} disabled />
                    <span className="block text-(--grayMedium) mt-1">
                      {t('email_cannot_change')}
                    </span>
                  </div>

                  {/* Cancel first, Save on the right — matches the design spec. */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingInfo(false)}
                      className="flex-1 rounded-lg font-medium text-base h-10"
                    >
                      {t('cancel_btn')}
                    </Button>
                    <Button
                      type="primary"
                      loading={isSaving}
                      onClick={handleSaveInfo}
                      className="flex-1 rounded-lg font-medium text-base h-10"
                    >
                      {t('save_btn')}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Stats Overview Card */}
            <Card
              className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
              styles={{ body: { padding: 24 } }}
            >
              <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
                {t('stats_overview_title')}
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-3 h-12 rounded-[10px] bg-(--blueLightest)">
                  <div className="flex items-center gap-2">
                    <CourseBookIcon />
                    <p className="text-sm text-(--blackSoft)">{t('course')}</p>
                  </div>
                  <p className="font-bold text-base text-(--primaryBlue)">
                    {formatNumber(totalCourses)}
                  </p>
                </div>

                <div className="flex justify-between items-center px-3 h-12 rounded-[10px] bg-(--greenPale)">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon />
                    <p className="text-sm text-(--blackSoft)">
                      {t('completed_label')}
                    </p>
                  </div>
                  <p className="font-bold text-base text-(--greenMedium)">
                    {formatNumber(completedCoursesCount)}/
                    {formatNumber(totalCourses)}
                  </p>
                </div>

                <div className="flex justify-between items-center px-3 h-12 rounded-[10px] bg-(--orangePale)">
                  <div className="flex items-center gap-2">
                    <ProgressTrendIcon />
                    <p className="text-sm text-(--blackSoft)">
                      {t('progress_in_progress')}
                    </p>
                  </div>
                  <p className="font-bold text-base text-(--orangeBright)">
                    {formatNumber(inProgressCount)}
                  </p>
                </div>

                <div className="border-t border-(--blackBorder) pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-(--blackSoft)">
                      {t('completion_progress_label')}
                    </p>
                    <p className="font-bold text-sm text-(--blackSoft)">
                      {formatNumber(overallProgress)}%
                    </p>
                  </div>
                  <Progress percent={overallProgress} showInfo={false} />
                </div>
              </div>
            </Card>

            {/* Change Password Card */}
            <Card
              className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
              styles={{ body: { padding: 24 } }}
            >
              <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-4">
                {t('change_password')}
              </p>

              {!editingPw ? (
                <Button
                  block
                  onClick={() => setEditingPw(true)}
                  className="border border-(--grayBorderMedium) rounded-lg text-(--blackSoft) font-medium text-sm h-10"
                >
                  {t('change_password')}
                </Button>
              ) : (
                <Form
                  form={pwForm}
                  layout="vertical"
                  onFinish={handleSubmitChangePassword}
                  className="flex flex-col gap-0"
                  requiredMark={false}
                >
                  <Form.Item
                    label={
                      <span className="font-medium text-sm text-(--blackSoft)">
                        {t('current_password_label')}
                      </span>
                    }
                    name="currentPassword"
                    rules={[
                      { required: true, message: t('password_required') },
                    ]}
                  >
                    <CustomInput.Password
                      placeholder={t('enter_password')}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-medium text-sm text-(--blackSoft)">
                        {t('new_password')}
                      </span>
                    }
                    name="newPassword"
                    rules={[
                      { required: true, message: t('password_required') },
                      {
                        pattern: PASSWORD_PATTERN,
                        message: t('password_invalid'),
                      },
                    ]}
                  >
                    <CustomInput.Password
                      placeholder={t('enter_password')}
                    />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span className="font-medium text-sm text-(--blackSoft)">
                        {t('confirm_new_password_label')}
                      </span>
                    }
                    name="confirmNewPassword"
                    dependencies={['newPassword']}
                    rules={[
                      {
                        required: true,
                        message: t('confirm_password_required'),
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value)
                            return Promise.resolve();
                          return Promise.reject(
                            new Error(t('passwords_do_not_match')),
                          );
                        },
                      }),
                    ]}
                  >
                    <CustomInput.Password
                      placeholder={t('reenter_new_password')}
                    />
                  </Form.Item>

                  {/* Cancel first, Save on the right — matches personal info. */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        pwForm.resetFields();
                        setEditingPw(false);
                      }}
                      className="flex-1 rounded-lg font-medium text-base h-10"
                    >
                      {t('cancel_btn')}
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={isChangingPw}
                      className="flex-1 rounded-lg font-medium text-base h-10"
                    >
                      {t('save_btn')}
                    </Button>
                  </div>
                </Form>
              )}
            </Card>
          </div>

          {/* Right column */}
          <Card
            className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
            styles={{ body: { padding: 24 } }}
          >
            <p className="font-semibold text-lg tracking-tight text-(--blackSoft) mb-1.5">
              {t('course_progress_title')}
            </p>
            <p className="text-(--grayMedium) mb-6">
              {t('course_progress_subtitle')}
            </p>

            <div className="flex flex-col gap-6">
              {coursesLoading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : userCourses.length === 0 ? (
                <p className="text-center text-(--grayMedium) py-8">
                  {t('no_courses_yet')}
                </p>
              ) : (
                userCourses.map((course: IListCourse) => {
                  const progress = course.progress ?? 0;
                  const total = course.totalLessons ?? 0;
                  const done = course.completedLessons ?? 0;
                  return (
                    <div
                      key={course.id}
                      onClick={() =>
                        router.push(
                          APP_ROUTE.courseDetails.replace(
                            '[courseId]',
                            course.id
                          )
                        )
                      }
                      className={`border border-(--blackBorder) rounded-[10px] p-6 ${HOVER_CLICKABLE}`}
                    >
                      <div className="flex gap-4 items-start">
                        {course.image && (
                          <Image
                            src={course.image}
                            alt={course.name}
                            width={96}
                            height={96}
                            className="w-24 h-24 object-cover rounded-[10px] shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-lg text-(--blackSoft) leading-7 mb-1 truncate">
                            {course.name}
                          </p>
                          {course.description && (
                            <p className="text-(--grayDark) mb-3 line-clamp-2">
                              {course.description}
                            </p>
                          )}

                          <div className="flex justify-between items-center mb-2">
                            <p className="text-(--grayDark)">
                              {formatNumber(done)}/{formatNumber(total)}{' '}
                              {t('lesson_unit')}
                            </p>
                            <p className="font-medium text-sm text-(--blackSoft)">
                              {formatNumber(progress)}%
                            </p>
                          </div>

                          <Progress
                            percent={progress}
                            showInfo={false}
                            className="mb-3"
                          />

                          {/* "Lịch sử làm bài" — stop event bubbling so the
                              card's navigate-to-course onClick doesn't fire. */}
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuizHistoryCourse({
                                id: course.id,
                                name: course.name,
                              });
                            }}
                          >
                            {t('quiz_history_btn')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>

      <QuizHistoryModal
        open={!!quizHistoryCourse}
        courseId={quizHistoryCourse?.id ?? ''}
        courseName={quizHistoryCourse?.name ?? ''}
        onClose={() => setQuizHistoryCourse(null)}
      />
    </div>
  );
};

export default ProfilePage;
