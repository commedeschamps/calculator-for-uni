import Link from 'next/link';
import {
  type NextLessonSnapshot,
  type ScheduleItem,
  DAY_SHORT,
} from '@/app/lib/schedule';
import { extractCampusLocation } from '@/app/lib/campusMap';
import { cn } from '@/lib/utils';

type NextLessonCardProps = {
  lessonSnapshot: NextLessonSnapshot;
  className?: string;
  label?: string;
  variant?: 'default' | 'inline';
  primaryAction?: {
    href: string;
    label: string;
  };
  showMapAction?: boolean;
};

function formatDuration(minutes: number): string {
  if (minutes <= 0) {
    return '0m';
  }

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins}m`);
  }

  return parts.slice(0, 2).join(' ');
}

function buildMapHref(item: ScheduleItem): string | null {
  const location = extractCampusLocation(item.classroom);
  if (!location) {
    return null;
  }

  const params = new URLSearchParams({
    room: location.canonicalRoom,
    subject: item.subject,
    day: item.day,
    time: `${item.startTime} - ${item.endTime}`,
  });

  return `/map?${params.toString()}`;
}

function formatLocation(location: ReturnType<typeof extractCampusLocation>) {
  if (!location) {
    return null;
  }

  return `${location.blockLabel} • ${location.floorNumber}F`;
}

function getLessonLocation(item: ScheduleItem): string {
  return item.classroom ?? 'Online';
}

function getDisplayLesson(snapshot: NextLessonSnapshot) {
  switch (snapshot.kind) {
    case 'current':
      return snapshot.current;
    case 'break':
    case 'window':
    case 'upcoming':
      return snapshot.next;
    case 'empty':
      return null;
  }
}

function getMapLesson(snapshot: NextLessonSnapshot) {
  switch (snapshot.kind) {
    case 'current':
      return snapshot.next ?? snapshot.current;
    case 'break':
    case 'window':
    case 'upcoming':
      return snapshot.next;
    case 'empty':
      return null;
  }
}

function getStateLabel(snapshot: NextLessonSnapshot): string {
  switch (snapshot.kind) {
    case 'current':
      return 'Now';
    case 'break':
      return 'Break';
    case 'window':
      return `Window ${formatDuration(snapshot.gapMinutes)}`;
    case 'upcoming':
      return 'Next';
    case 'empty':
      return 'Free';
  }
}

function getTimeLine(snapshot: NextLessonSnapshot): string | null {
  switch (snapshot.kind) {
    case 'current':
      return `${DAY_SHORT[snapshot.current.day]} · ${snapshot.current.item.startTime} - ${snapshot.current.item.endTime} · ends in ${formatDuration(snapshot.minutesUntilCurrentEnds)}`;
    case 'break':
    case 'window':
      return `${DAY_SHORT[snapshot.next.day]} · ${snapshot.next.item.startTime} - ${snapshot.next.item.endTime} · starts in ${formatDuration(snapshot.minutesUntilNextStarts)}`;
    case 'upcoming':
      return `${DAY_SHORT[snapshot.next.day]} · ${snapshot.next.item.startTime} - ${snapshot.next.item.endTime} · starts in ${formatDuration(snapshot.minutesUntilNextStarts)}`;
    case 'empty':
      return null;
  }
}

function getSubcopy(snapshot: NextLessonSnapshot): string | null {
  switch (snapshot.kind) {
    case 'current':
      return snapshot.next
        ? `Next: ${snapshot.next.item.subject} · ${DAY_SHORT[snapshot.next.day]} · ${snapshot.next.item.startTime} - ${snapshot.next.item.endTime}`
        : 'This is the last lesson in the current schedule.';
    case 'break':
      return `Short break after ${snapshot.previous.item.subject}.`;
    case 'window':
      return `Window after ${snapshot.previous.item.subject}. Total gap: ${formatDuration(snapshot.gapMinutes)}.`;
    case 'upcoming':
      return 'No class is running right now.';
    case 'empty':
      return 'No classes in the current schedule.';
  }
}

export default function NextLessonCard({
  lessonSnapshot,
  className,
  label = 'Next lesson',
  variant = 'default',
  primaryAction,
  showMapAction = false,
}: NextLessonCardProps) {
  const displayLesson = getDisplayLesson(lessonSnapshot);
  const mapLesson = getMapLesson(lessonSnapshot);
  const mapHref = mapLesson ? buildMapHref(mapLesson.item) : null;
  const mapLabel = lessonSnapshot.kind === 'current' && lessonSnapshot.next ? 'Next map' : 'Map';
  const location = displayLesson ? formatLocation(extractCampusLocation(displayLesson.item.classroom)) : null;
  const timeLine = getTimeLine(lessonSnapshot);
  const subcopy = getSubcopy(lessonSnapshot);

  return (
    <section
      className={cn(
        'card sch-next-card',
        variant === 'inline' && 'sch-next-card--inline',
        className,
      )}
    >
      <div className="sch-next-card__content">
        <div className="sch-next-card__head">
          <span className="sch-next-card__label">{label}</span>
          <div className="sch-next-card__badges">
            <span
              className={cn(
                'sch-next-card__state',
                `sch-next-card__state--${lessonSnapshot.kind}`,
              )}
            >
              {getStateLabel(lessonSnapshot)}
            </span>
            {displayLesson ? <span className="sch-next-card__day">{DAY_SHORT[displayLesson.day]}</span> : null}
          </div>
        </div>

        {displayLesson ? (
          <>
            <strong>{displayLesson.item.subject}</strong>
            {timeLine ? <p className="sch-next-card__time">{timeLine}</p> : null}
            {subcopy ? <p className="sch-next-card__subcopy">{subcopy}</p> : null}
            <div className="sch-next-card__meta">
              <span>{getLessonLocation(displayLesson.item)}</span>
              {location ? <span>{location}</span> : null}
              {displayLesson.item.lecturer ? <span>{displayLesson.item.lecturer}</span> : null}
            </div>
          </>
        ) : (
          <p className="sch-next-card__empty">{subcopy}</p>
        )}
      </div>

      {(primaryAction || (showMapAction && mapHref)) ? (
        <div className="sch-next-card__actions">
          {primaryAction ? (
            <Link href={primaryAction.href} className="sch-map-link">
              {primaryAction.label}
            </Link>
          ) : null}
          {showMapAction && mapHref ? (
            <Link href={mapHref} className="sch-map-link">
              {mapLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
