'use client';

import { useMemo } from 'react';
import NextLessonCard from './NextLessonCard';
import { SCHEDULE_DATA, getFilteredItems, getNextLessonSnapshot } from '@/app/lib/schedule';
import { useCurrentTime } from '@/app/lib/useCurrentTime';
import { useEnabledScheduleSubjects } from '@/app/lib/useEnabledScheduleSubjects';

export default function HomeNextLesson() {
  const now = useCurrentTime();
  const [enabledSubjects] = useEnabledScheduleSubjects();
  const enabledItems = useMemo(
    () => getFilteredItems(SCHEDULE_DATA, enabledSubjects, { lecturer: '', mode: '', day: '' }),
    [enabledSubjects],
  );
  const lessonSnapshot = useMemo(() => getNextLessonSnapshot(enabledItems, now), [enabledItems, now]);

  return (
    <NextLessonCard
      lessonSnapshot={lessonSnapshot}
      className="home-next-card"
      primaryAction={{ href: '/schedule', label: 'Open schedule' }}
    />
  );
}
