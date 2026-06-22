# Mock Data System

This document explains how to use the mock data system in the website frontend for development without a backend API.

## Overview

The mock data system allows you to develop and test the UI with realistic data before the backend API is ready. When the backend is complete, simply toggle an environment variable to switch from mock to real API data.

## Configuration

### Enable Mock Data

Create or edit `.env.local` in `frontend/website/`:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true
```

When set to `true`, the app will use mock data for:
- **Achievements** — list of reader achievements/ranks
- **Courses** — list of books/courses with metadata

### Disable Mock Data (Use Real API)

Change the environment variable to:

```env
NEXT_PUBLIC_USE_MOCK_DATA=false
```

This will use the real backend API calls via `achievementApi` and `courseApi`.

## What Gets Mocked

When `NEXT_PUBLIC_USE_MOCK_DATA=true`:

### Achievements Hook (`useAchievements`)
- Returns a paginated list of reader achievement levels
- Simulates a 300ms network delay
- Mock achievements: "Độc giả mới", "Độc giả thường xuyên", "Tín đồ sách", etc.

### Courses Hook (`useCourses`)
- Returns a paginated list of books/courses
- Simulates a 300ms network delay
- Mock books include realistic titles, descriptions, authors, progress tracking, and featured flags
- Examples: "Đắc Nhân Tâm", "Lịch Sử Loài Người", "Tư Duy Sáng Tạo", etc.

## Usage Examples

### In Components

The hooks automatically detect the mock mode:

```tsx
'use client';

import { useAchievements } from '@/features/achievements/hooks/useAchievements';
import { useCourses } from '@/features/courses/hooks/useCourses';

export function MyComponent() {
  // Automatically uses mock data if NEXT_PUBLIC_USE_MOCK_DATA=true
  const { data: achievementsData, isLoading: achievementsLoading } = 
    useAchievements({ page: 1, limit: 10 });
  
  const { data: coursesData, isLoading: coursesLoading } = 
    useCourses({ page: 1, limit: 20 });

  return (
    <div>
      {/* Your component code */}
    </div>
  );
}
```

No code changes needed — the hooks handle the switching automatically.

## File Structure

```
frontend/website/
├── .env.local                           # Your local config (enable mock)
├── .env.example                         # Template for env variables
└── lib/
    └── mock/
        ├── mockData.ts                  # Mock data definitions
        ├── useMockAchievements.ts       # Mock achievements hook
        └── useMockCourses.ts            # Mock courses hook

features/
├── achievements/
│   └── hooks/
│       └── useAchievements.ts           # Updated to auto-switch
└── courses/
    └── hooks/
        └── useCourses.ts                # Updated to auto-switch
```

## Adding More Mock Data

To add more mock data:

1. **Edit** `lib/mock/mockData.ts`:
   - Add new mock objects to the arrays
   - Ensure they match the expected types

Example:

```tsx
// In mockData.ts
export const mockCourses: MockCourse[] = [
  {
    id: "1",
    name: "New Book Title",
    description: "...",
    instructorName: "Author Name",
    progress: 0,
    isFeatured: false,
  },
  // ... more courses
];
```

2. **Update** mock hooks if needed:
   - Modify `useMockAchievements.ts` or `useMockCourses.ts` to customize data transformation

## Transitioning to Real API

When your backend API is ready:

1. **Disable mock data**:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

2. **Verify API endpoints** match:
   - `achievementApi.getList(params)` → returns `{ rows: Achievement[], total: number }`
   - `courseApi.getList(params)` → returns `{ rows: Course[], total: number }`

3. **No code changes needed** in components — they automatically use the real API.

4. **Test thoroughly**:
   - Run `yarn dev:fe-website`
   - Verify all features work with real data

## Network Delay Simulation

Mock hooks simulate a 300ms network delay to mimic real API behavior. This helps catch loading states and timing issues during development.

To adjust:

```tsx
// In useMockAchievements.ts or useMockCourses.ts
React.useEffect(() => {
  const timer = setTimeout(() => {
    // ... set data
  }, 300); // Change this value (in milliseconds)
  return () => clearTimeout(timer);
}, [page, limit]);
```

## Troubleshooting

### Mock data not appearing
- Ensure `.env.local` exists with `NEXT_PUBLIC_USE_MOCK_DATA=true`
- Restart dev server: `yarn dev:fe-website`
- Check browser console for errors

### Real API being called when mock should be active
- Verify `.env.local` is in `frontend/website/` root, not elsewhere
- Confirm `NEXT_PUBLIC_` prefix on env var (required for Next.js public variables)
- Rebuild/restart dev server

### Data looks wrong
- Check `lib/mock/mockData.ts` for data format
- Ensure mock hooks return the correct response structure
- Compare with actual API response format
