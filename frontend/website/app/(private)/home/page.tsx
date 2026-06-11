'use client';

import { useState } from 'react';
import { Card, Button, Tag, Input, Progress, Spin } from 'antd';
import { useRouter } from 'next/navigation';
import { getCookie } from '@shared/utils/cookie';
import { STORAGES } from '@shared/constants/storage';
import { IDetailUser } from '@shared/types/user-type';
import { formatNumber } from '@shared/utils/numberUtils';
import {
  ACHIEVEMENT_STATUS,
  type AchievementStatusType,
} from '@/constants/status';
import { useAchievements } from '@/features/achievements/hooks/useAchievements';
import { StatsBarChartIcon } from '../_icons/StatsBarChartIcon';
import { ActivateKeyIcon } from '../_icons/ActivateKeyIcon';
import { AchievementTrophyIcon } from '../_icons/AchievementTrophyIcon';
import { AchievementMedalIcon } from '../_icons/AchievementMedalIcon';
import { WelcomeTrophyIcon } from '../_icons/WelcomeTrophyIcon';
import { useTranslations } from 'next-intl';
import { cn } from '@shared/constants/commonConst';
import { HOVER_CLICKABLE } from '@shared/constants/animation';
import { IListAchievement } from '@/features/shared/types/AchievementType';
import { useUser } from '@shared/provider/UserProvider';
import Image from 'next/image';
import { IListCourse } from '@shared/types/CourseType';
import { APP_ROUTE } from '@/constants/routes';

// ===== Types =====
interface AchievementItem {
  id: string;
  name: string;
  requiredCourses: number;
  status: AchievementStatusType;
}

// ===== Constants =====
// Card border + background colors mapped per achievement status
const achievementCardClassByStatus: Record<AchievementStatusType, string> = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 'border-(--greenMedium) bg-(--greenPale)',
  [ACHIEVEMENT_STATUS.CURRENT]: 'border-(--yellowGold) bg-(--yellowPale)',
  [ACHIEVEMENT_STATUS.PENDING]: 'border-(--grayBorder) bg-(--grayLightest)',
};

const achievementIconClassByStatus: Record<AchievementStatusType, string> = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 'bg-(--greenMedium)',
  [ACHIEVEMENT_STATUS.CURRENT]: 'bg-(--yellowGold)',
  [ACHIEVEMENT_STATUS.PENDING]: 'bg-(--grayBorder)',
};

const achievementNameClassByStatus: Record<AchievementStatusType, string> = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 'text-(--greenMedium)',
  [ACHIEVEMENT_STATUS.CURRENT]: 'text-(--yellowDark)',
  [ACHIEVEMENT_STATUS.PENDING]: 'text-(--grayMedium)',
};

// TODO: replace with courses API when ready
const COURSES_PLACEHOLDER = [
  {
    id: 1,
    title: 'Phong Thủy Cơ Bản',
    description: 'Khóa học giới thiệu các kiến thức nền tảng về phong thủy, bao gồm âm dương ngũ hành, bát quái và cách bố trí không gian sống hợp lý.',
    progress: 100,
    thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 2,
    title: 'Phong Thủy Nhà Ở',
    description: 'Học cách áp dụng phong thủy vào thiết kế và bố trí nhà ở để mang lại vận khí tốt cho gia đình.',
    progress: 100,
    thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  },
];

// ===== Component =====
export default function HomePage() {
  const router = useRouter();
  const t = useTranslations();
  const [showActivate, setShowActivate] = useState(false);
  const [activateCode, setActivateCode] = useState('');

  // Read logged-in user from cookie (set by useLogin on success)
  const user = getCookie(STORAGES.USER_LOGIN) as IDetailUser | undefined;
  const userName = user?.name ?? '';
  const achievementLabel = user?.achievement?.label ?? '';
  const completedCourses = user?.completedCourses ?? 0;

  // Fetch achievements from API (sorted by requiredCourses ASC)
  const { data: achievementsData, isLoading: achievementsLoading } =
    useAchievements({ page: 1, limit: 100 });
  const achievementRows = achievementsData?.rows ?? [];

  // Compute status by comparing user's completedCourses vs each achievement's requiredCourses
  const achievements: AchievementItem[] = achievementRows.map(
    (item: { id: string; name: string; requiredCourses: number }) => ({
      ...item,
      status:
        completedCourses >= item.requiredCourses
          ? ACHIEVEMENT_STATUS.COMPLETED
          : ACHIEVEMENT_STATUS.PENDING,
    })
  );

  // Mark the highest completed achievement as CURRENT (user's active rank)
  const lastCompletedIndex = achievements.findLastIndex(
    (a) => a.status === ACHIEVEMENT_STATUS.COMPLETED
  );
  if (lastCompletedIndex >= 0) {
    achievements[lastCompletedIndex].status = ACHIEVEMENT_STATUS.CURRENT;
  }

  return (
    <div>
      <div className="flex flex-col gap-8">
        {/* Welcome Banner */}
        <div className="bg-linear-to-r from-(--blueGradientStart) to-(--blueGradientEnd) p-6 rounded-[10px] flex items-center gap-3">
          <div className="shrink-0 w-8 h-8">
            <WelcomeTrophyIcon />
          </div>
          <div>
            <p className="font-bold text-2xl leading-8 text-(--whiteColor)">
              {t('user_home_greeting', {
                achievement: achievementLabel,
                name: userName,
              })}
            </p>
            <p className="font-normal text-base leading-6 text-(--blueLight) mt-1">
              {t('user_home_welcome_back')}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            onClick={() => router.push(APP_ROUTE.profile)}
            className={cn(
              'border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]',
              HOVER_CLICKABLE
            )}
            styles={{ body: { padding: 24 } }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center bg-(--blueLightest)">
                <StatsBarChartIcon />
              </div>
              <div>
                <p className="font-semibold text-base text-(--blackSoft)">
                  {t('stats_title')}
                </p>
                <p className="text-sm text-(--grayMedium) mt-0.5">
                  {t('stats_subtitle')}
                </p>
              </div>
            </div>
          </Card>

          <Card
            onClick={() => setShowActivate(!showActivate)}
            className={cn(
              'border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]',
              HOVER_CLICKABLE
            )}
            styles={{ body: { padding: 24 } }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center bg-(--greenPale)">
                <ActivateKeyIcon />
              </div>
              <div>
                <p className="font-semibold text-base text-(--blackSoft)">
                  {t('activate_title')}
                </p>
                <p className="text-sm text-(--grayMedium) mt-0.5">
                  {t('activate_subtitle')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Activate Code Section */}
        {showActivate && (
          <Card
            className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
            styles={{ body: { padding: 24 } }}
          >
            <p className="font-semibold text-lg text-(--blackSoft) mb-2">
              {t('activate_title')}
            </p>
            <p className="text-(--grayMedium) mb-4">
              {t('activate_description')}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={t('activate_placeholder')}
                value={activateCode}
                onChange={(e) => setActivateCode(e.target.value)}
                className="flex-1"
              />
              <Button type="primary" className="h-10 rounded-lg font-medium">
                {t('activate_button')}
              </Button>
            </div>
          </Card>
        )}

        {/* Achievement Section */}
        <Card
          className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)]"
          styles={{ body: { padding: 24 } }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AchievementTrophyIcon />
            <p className="font-semibold text-lg text-(--blackSoft)">
              {t('ranking_title')}
            </p>
          </div>
          <p className="text-base text-(--grayMedium) mb-4">
            {t('user_home_achievement_hint')}
          </p>

          <div className="flex flex-col gap-3">
            {achievementsLoading ? (
              <div className="flex justify-center py-4">
                <Spin />
              </div>
            ) : (
              achievements.map((item) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-4 rounded-[10px] border ${achievementCardClassByStatus[item.status]}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${achievementIconClassByStatus[item.status]}`}
                    >
                      <AchievementMedalIcon />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-semibold text-base ${achievementNameClassByStatus[item.status]}`}
                        >
                          {item.name}
                        </p>
                        {item.status === ACHIEVEMENT_STATUS.COMPLETED && (
                          <Tag color="green">
                            {t('achievement_status_achieved')}
                          </Tag>
                        )}
                        {item.status === ACHIEVEMENT_STATUS.CURRENT && (
                          <Tag color="gold">
                            {t('achievement_status_current')}
                          </Tag>
                        )}
                      </div>
                      <p className="text-sm text-(--grayDark) mt-0.5">
                        {t('achievement_required_courses', {
                          count: formatNumber(item.requiredCourses),
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Courses Section — TODO: replace COURSES_PLACEHOLDER with courses API when ready */}
        <div>
          <p className="font-semibold text-lg text-(--blackSoft) mb-4">
            {t('your_courses')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<<<<<<< HEAD
            {COURSES_PLACEHOLDER.map((course) => (
              <Card
                key={course.id}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)] overflow-hidden cursor-pointer"
                styles={{ body: { padding: 0 } }}
              >
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4 flex flex-col gap-3">
                  <p className="font-semibold text-base text-(--blackSoft) truncate">
                    {course.title}
                  </p>
                  <p className="text-sm text-(--grayDark) line-clamp-2">
                    {course.description}
                  </p>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-(--grayDark)">
                        {t('progress_label')}
                      </span>
                      <span className="text-sm font-medium text-(--blackSoft)">
                        {formatNumber(course.progress)}%
                      </span>
                    </div>
                    <Progress percent={course.progress} showInfo={false} />
                  </div>
                  <Button
                    type="primary"
                    className="h-10 rounded-lg font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {t('complete_btn')}
                  </Button>
                </div>
              </Card>
            ))}
=======
            {coursesLoading ? (
              <div className="flex justify-center py-4 col-span-full">
                <Spin />
              </div>
            ) : userCourses.length === 0 ? (
              <p className="col-span-full text-center text-(--grayMedium) py-8">
                {t('no_courses_yet')}
              </p>
            ) : (
              userCourses.map((course: IListCourse) => {
                // Backend returns progress 0-100 (rounded). Fallback to 0
                // when the field is missing (legacy clients / cached data).
                const progress = course.progress ?? 0;
                const isDone = progress >= 100;
                return (
                  <Card
                    key={course.id}
                    onClick={() =>
                      router.push(
                        APP_ROUTE.courseDetails.replace('[courseId]', course.id)
                      )
                    }
                    className={cn(
                      'border border-(--grayBorder) rounded-[10px] shadow-[0_1px_3px_var(--blackBorder)] overflow-hidden',
                      HOVER_CLICKABLE
                    )}
                    styles={{ body: { padding: 0 } }}
                  >
                    {course?.image && (
                      <Image
                        src={course?.image}
                        alt={course?.name}
                        className="w-full h-40 object-cover"
                        width={500}
                        height={200}
                      />
                    )}
                    <div className="p-4 flex flex-col gap-3">
                      <p className="font-semibold text-base text-(--blackSoft) truncate">
                        {course?.name}
                      </p>
                      {course.description && (
                        <p className="text-sm text-(--grayDark) line-clamp-2 min-h-10">
                          {course.description}
                        </p>
                      )}

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-(--grayDark)">
                            {t('progress_label')}
                          </span>
                          <span className="text-sm font-semibold text-(--blueMedium)">
                            {progress}%
                          </span>
                        </div>
                        <Progress
                          percent={progress}
                          showInfo={false}
                          strokeColor="var(--blueMedium)"
                          className="m-0!"
                        />
                      </div>

                      <Button
                        type="primary"
                        disabled={isDone}
                        className="h-10 rounded-lg font-medium"
                        onClick={(e) => {
                          // Card already has onClick to navigate; stop bubbling
                          // so "Đã hoàn thành" (disabled) doesn't inherit the
                          // card click and behaves as a pure status indicator.
                          e.stopPropagation();
                          if (!isDone)
                            router.push(
                              APP_ROUTE.courseDetails.replace(
                                '[courseId]',
                                course.id
                              )
                            );
                        }}
                      >
                        {t(
                          isDone
                            ? 'course_completed_btn'
                            : 'course_continue_btn'
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
>>>>>>> c538635685df329f9e65815ac39c125a0a2e12a7
          </div>
        </div>
      </div>
    </div>
  );
}
