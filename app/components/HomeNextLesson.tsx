'use client';

import NextLessonCard from './NextLessonCard';
import { SCHEDULE_DATA, getUpcomingClass } from '@/app/lib/schedule';

export default function HomeNextLesson() {
  const nextClass = getUpcomingClass(SCHEDULE_DATA);

  return (
    <NextLessonCard
      nextClass={nextClass}
      className="home-next-card"
      primaryAction={{ href: '/schedule', label: 'Open schedule' }}
    />
  );
}
