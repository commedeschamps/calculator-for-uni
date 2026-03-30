import Link from 'next/link';
import { type DayOfWeek, type ScheduleItem, DAY_SHORT } from '@/app/lib/schedule';
import { extractCampusLocation } from '@/app/lib/campusMap';
import { cn } from '@/lib/utils';

type NextLessonCardProps = {
  nextClass: { day: DayOfWeek; item: ScheduleItem } | null;
  className?: string;
  label?: string;
  variant?: 'default' | 'inline';
  primaryAction?: {
    href: string;
    label: string;
  };
  showMapAction?: boolean;
};

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

export default function NextLessonCard({
  nextClass,
  className,
  label = 'Next lesson',
  variant = 'default',
  primaryAction,
  showMapAction = false,
}: NextLessonCardProps) {
  const mapHref = nextClass ? buildMapHref(nextClass.item) : null;
  const location = nextClass ? formatLocation(extractCampusLocation(nextClass.item.classroom)) : null;

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
          {nextClass ? <span className="sch-next-card__day">{DAY_SHORT[nextClass.day]}</span> : null}
        </div>

        {nextClass ? (
          <>
            <strong>{nextClass.item.subject}</strong>
            <p className="sch-next-card__time">
              {DAY_SHORT[nextClass.day]} · {nextClass.item.startTime} - {nextClass.item.endTime}
            </p>
            <div className="sch-next-card__meta">
              <span>{getLessonLocation(nextClass.item)}</span>
              {location ? <span>{location}</span> : null}
              {nextClass.item.lecturer ? <span>{nextClass.item.lecturer}</span> : null}
            </div>
          </>
        ) : (
          <p className="sch-next-card__empty">No upcoming lesson right now.</p>
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
              Map
            </Link>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
