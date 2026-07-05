'use client';

import { useAchievements } from '@/features/achievements/hooks/useAchievements';
import { useCourses } from '@/features/courses/hooks/useCourses';

export default function MockTestPage() {
  const { data: achievementsData, isLoading: achLoading } = useAchievements({
    page: 1,
    limit: 10,
  });
  const { data: coursesData, isLoading: courseLoading } = useCourses({
    page: 1,
    limit: 10,
  });

  const achievements = achievementsData?.rows ?? [];
  const courses = coursesData?.rows ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8">Mock Data Test Page</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          <strong>Mock Mode:</strong> {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? '✅ ON' : '❌ OFF'}
        </p>
        <p className="text-sm text-blue-600 mt-2">
          Check .env.local for <code>NEXT_PUBLIC_USE_MOCK_DATA=true</code>
        </p>
      </div>

      {/* Achievements Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Achievements ({achievements.length})</h2>
        {achLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : achievements.length === 0 ? (
          <p className="text-gray-500">No achievements loaded</p>
        ) : (
          <div className="grid gap-3">
            {achievements.map((ach: any) => (
              <div key={ach.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold">{ach.name}</h3>
                <p className="text-sm text-gray-600">Required Courses: {ach.requiredCourses}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Courses Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Courses ({courses.length})</h2>
        {courseLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-500">No courses loaded</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course: any) => (
              <div key={course.id} className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg">{course.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  📚 {course.instructorName}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-semibold text-blue-600">{course.progress ?? 0}%</span>
                  {course.isFeatured && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
