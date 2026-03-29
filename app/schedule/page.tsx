'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Clock3,
  MapPinned,
  RotateCcw,
  FileText,
} from 'lucide-react';
import BasicDatePicker from '@/components/ui/calendar-1';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { extractCampusLocation } from '../lib/campusMap';
import {
  type DayOfWeek,
  type ScheduleItem,
  DAYS,
  DAY_SHORT,
  SCHEDULE_DATA,
  PAIR_LABELS,
  detectConflicts,
  detectGaps,
  getFilteredItems,
  getScheduleDayForDate,
  getRecommendedDay,
  getTimeRange,
  getUniqueSubjects,
  getUniqueValues,
  groupByDay,
  formatMinutesToTime,
  parseTimeToMinutes,
} from '../lib/schedule';

type ViewMode = 'table' | 'list' | 'calendar';
type DayFilter = DayOfWeek | 'all';

const { base: BASE_SUBJECTS, electives: ELECTIVE_MAP } = getUniqueSubjects(SCHEDULE_DATA);

const ELECTIVE_PAIRS: { pair: string; label: string; subjects: string[] }[] = (() => {
  const map = new Map<string, string[]>();
  ELECTIVE_MAP.forEach((pair, subject) => {
    if (!map.has(pair)) {
      map.set(pair, []);
    }
    map.get(pair)!.push(subject);
  });

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pair, subjects]) => ({
      pair,
      label: PAIR_LABELS[pair] || pair,
      subjects: subjects.sort(),
    }));
})();

const SUBJECT_SESSION_COUNT = SCHEDULE_DATA.reduce<Record<string, number>>((acc, item) => {
  acc[item.subject] = (acc[item.subject] ?? 0) + 1;
  return acc;
}, {});

const STORAGE_KEY = 'sch-enabled-subjects';

function buildDefaultEnabled(): Set<string> {
  const defaults = new Set(BASE_SUBJECTS);

  for (const { subjects } of ELECTIVE_PAIRS) {
    const firstSubject = subjects[0];
    if (firstSubject) {
      defaults.add(firstSubject);
    }
  }

  return defaults;
}

function normalizeEnabledSubjects(subjects: Iterable<string>): Set<string> {
  const incoming = new Set(subjects);
  const normalized = new Set<string>();

  for (const subject of BASE_SUBJECTS) {
    if (incoming.has(subject)) {
      normalized.add(subject);
    }
  }

  for (const { subjects: pairSubjects } of ELECTIVE_PAIRS) {
    const selected = pairSubjects.find((subject) => incoming.has(subject));
    if (selected) {
      normalized.add(selected);
    }
  }

  return normalized;
}

function loadPersistedSubjects(): Set<string> {
  if (typeof window === 'undefined') {
    return buildDefaultEnabled();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      if (Array.isArray(arr)) {
        return normalizeEnabledSubjects(arr);
      }
    }
  } catch {
    // Ignore malformed local state and fall back to defaults.
  }

  return buildDefaultEnabled();
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

function renderNotes(notes: string) {
  if (/^https?:\/\//i.test(notes)) {
    return (
      <a href={notes} target="_blank" rel="noreferrer">
        Open link
      </a>
    );
  }

  return notes;
}

function getDayTimeLabel(items: ScheduleItem[]): string | null {
  if (items.length === 0) {
    return null;
  }

  return `${items[0].startTime} - ${items[items.length - 1].endTime}`;
}

function getUpcomingClass(
  items: ScheduleItem[],
  date: Date = new Date(),
): { day: DayOfWeek; item: ScheduleItem } | null {
  const grouped = groupByDay(items);
  const today = getScheduleDayForDate(date);
  const nowMinutes = date.getHours() * 60 + date.getMinutes();

  if (today) {
    const todayItems = grouped[today] ?? [];
    const upcomingToday = todayItems.find((item) => parseTimeToMinutes(item.endTime) >= nowMinutes);

    if (upcomingToday) {
      return {
        day: today,
        item: upcomingToday,
      };
    }
  }

  const startIndex = today ? DAYS.indexOf(today) : -1;

  for (let offset = 1; offset <= DAYS.length; offset += 1) {
    const day = DAYS[(startIndex + offset + DAYS.length) % DAYS.length];
    const firstItem = grouped[day]?.[0];

    if (firstItem) {
      return {
        day,
        item: firstItem,
      };
    }
  }

  return null;
}

function ClassCard({ item }: { item: ScheduleItem }) {
  const isOnline = item.mode === 'online';
  const location = extractCampusLocation(item.classroom);
  const mapHref = buildMapHref(item);

  return (
    <article className={`sch-card sch-card--${item.type}${isOnline ? ' sch-card--online' : ''}`}>
      <div className="sch-card__rail" aria-hidden="true">
        <span className="sch-card__time">{item.startTime}</span>
        <span className="sch-card__time-line" />
        <span className="sch-card__time sch-card__time--end">{item.endTime}</span>
      </div>
      <div className="sch-card__body">
        <div className="sch-card__subject">{item.subject}</div>
        <div className="sch-card__meta">
          <span className={`sch-badge sch-badge--${item.type}`}>{item.type}</span>
          {isOnline && <span className="sch-badge sch-badge--online">online</span>}
          {item.electiveGroup !== 'Base' && (
            <span className="sch-badge sch-badge--elective">elective</span>
          )}
        </div>
        <div className="sch-card__details">
          {item.classroom ? <span>{item.classroom}</span> : isOnline ? <span>Online</span> : null}
          {location && <span>{formatLocation(location)}</span>}
          {item.lecturer && <span>{item.lecturer}</span>}
        </div>
        {mapHref && (
          <div className="sch-card__actions">
            <Link href={mapHref} className="sch-map-link">See in Map</Link>
          </div>
        )}
        {item.notes && <div className="sch-card__notes">{renderNotes(item.notes)}</div>}
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="sch-empty">
      <span className="sch-empty__icon">📭</span>
      <p>No classes match your current selection.</p>
    </div>
  );
}

function DayPicker({
  activeDay,
  dayCounts,
  onPickDay,
}: {
  activeDay: DayFilter;
  dayCounts: Record<DayOfWeek, number>;
  onPickDay: (day: DayFilter) => void;
}) {
  const totalCount = DAYS.reduce((sum, day) => sum + dayCounts[day], 0);

  return (
    <div className="sch-day-picker" aria-label="Quick day picker">
      <button
        type="button"
        className={`sch-day-pill${activeDay === 'all' ? ' sch-day-pill--active' : ''}`}
        onClick={() => onPickDay('all')}
      >
        <span className="sch-day-pill__label">All</span>
        <span className="sch-day-pill__count">{totalCount}</span>
      </button>

      {DAYS.map((day) => (
        <button
          key={day}
          type="button"
          className={`sch-day-pill${activeDay === day ? ' sch-day-pill--active' : ''}${dayCounts[day] === 0 ? ' sch-day-pill--muted' : ''}`}
          onClick={() => onPickDay(day)}
        >
          <span className="sch-day-pill__label">{DAY_SHORT[day]}</span>
          <span className="sch-day-pill__count">{dayCounts[day]}</span>
        </button>
      ))}
    </div>
  );
}

function ScheduleSummaryBar({
  nextClass,
  totalClasses,
  offlineCount,
  onlineCount,
  activeDayCount,
  weekWindow,
  conflictsCount,
  gapsCount,
  recommendedDay,
  onPickRecommendedDay,
}: {
  nextClass: { day: DayOfWeek; item: ScheduleItem } | null;
  totalClasses: number;
  offlineCount: number;
  onlineCount: number;
  activeDayCount: number;
  weekWindow: string;
  conflictsCount: number;
  gapsCount: number;
  recommendedDay: DayOfWeek | null;
  onPickRecommendedDay: () => void;
}) {
  const mapHref = nextClass ? buildMapHref(nextClass.item) : null;
  const location = nextClass ? formatLocation(extractCampusLocation(nextClass.item.classroom)) : null;

  return (
    <section className="card sch-summary-bar">
      <div className="sch-summary-bar__head">
        <div className="sch-summary-bar__title">
          <h1>Schedule</h1>
          <div className="sch-summary-bar__chips">
            <span>{totalClasses} classes</span>
            <span>{activeDayCount} days</span>
            <span>{weekWindow}</span>
            <span>{onlineCount} online</span>
            <span>{offlineCount} offline</span>
            {conflictsCount > 0 && <span>{conflictsCount} conflicts</span>}
            {gapsCount > 0 && <span>{gapsCount} long gaps</span>}
          </div>
        </div>

        {recommendedDay && (
          <button type="button" className="sch-summary-bar__today" onClick={onPickRecommendedDay}>
            {DAY_SHORT[recommendedDay]}
          </button>
        )}
      </div>

      <div className="sch-summary-bar__next">
        <span className="sch-summary-bar__label">Next class</span>
        {nextClass ? (
          <>
            <strong>{nextClass.item.subject}</strong>
            <span>
              {DAY_SHORT[nextClass.day]} · {nextClass.item.startTime} - {nextClass.item.endTime}
            </span>
            <span>
              {getLessonLocation(nextClass.item)}
              {location ? ` · ${location}` : ''}
            </span>
            {mapHref && (
              <Link href={mapHref} className="sch-map-link sch-map-link--compact">
                Map
              </Link>
            )}
          </>
        ) : (
          <span>No upcoming class</span>
        )}
      </div>
    </section>
  );
}

export default function SchedulePage() {
  const [enabledSubjects, setEnabledSubjects] = useState<Set<string>>(buildDefaultEnabled);
  const [view, setView] = useState<ViewMode>('list');
  const [filterLecturer, setFilterLecturer] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [activeDay, setActiveDay] = useState<DayFilter>('all');
  const [didAutoPickDay, setDidAutoPickDay] = useState(false);
  const [subjectsReady, setSubjectsReady] = useState(false);
  const [recommendedDay, setRecommendedDay] = useState<DayOfWeek | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    setEnabledSubjects(loadPersistedSubjects());
    setSubjectsReady(true);
  }, []);

  useEffect(() => {
    if (!subjectsReady) {
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(enabledSubjects)));
    } catch {
      // Ignore storage failures in private / restricted environments.
    }
  }, [enabledSubjects, subjectsReady]);

  const toggleSubject = useCallback((subject: string) => {
    setEnabledSubjects((prev) => {
      const next = new Set(prev);
      const pair = ELECTIVE_MAP.get(subject);

      if (pair) {
        if (next.has(subject)) {
          next.delete(subject);
        } else {
          const group = ELECTIVE_PAIRS.find((item) => item.pair === pair);
          group?.subjects.forEach((pairSubject) => next.delete(pairSubject));
          next.add(subject);
        }
      } else if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }

      return normalizeEnabledSubjects(next);
    });
  }, []);

  const enableAll = useCallback(() => {
    setEnabledSubjects(buildDefaultEnabled());
  }, []);

  const enableBaseOnly = useCallback(() => {
    setEnabledSubjects(new Set(BASE_SUBJECTS));
  }, []);

  const enabledItems = useMemo(
    () => getFilteredItems(SCHEDULE_DATA, enabledSubjects, { lecturer: '', mode: '', day: '' }),
    [enabledSubjects],
  );

  const itemsForActiveControls = useMemo(
    () => getFilteredItems(SCHEDULE_DATA, enabledSubjects, {
      lecturer: filterLecturer,
      mode: filterMode,
      day: '',
    }),
    [enabledSubjects, filterLecturer, filterMode],
  );

  useEffect(() => {
    if (!subjectsReady) {
      return;
    }

    const nextDay = getRecommendedDay(itemsForActiveControls);
    setRecommendedDay(nextDay);

    if (didAutoPickDay) {
      return;
    }

    if (nextDay) {
      setActiveDay(nextDay);
    }

    setDidAutoPickDay(true);
  }, [didAutoPickDay, itemsForActiveControls, subjectsReady]);

  const filtered = useMemo(
    () => (activeDay === 'all'
      ? itemsForActiveControls
      : itemsForActiveControls.filter((item) => item.day === activeDay)),
    [itemsForActiveControls, activeDay],
  );

  const lecturers = useMemo(() => getUniqueValues(enabledItems, 'lecturer'), [enabledItems]);
  const byDay = useMemo(() => groupByDay(filtered), [filtered]);
  const visibleByDay = useMemo(() => groupByDay(itemsForActiveControls), [itemsForActiveControls]);
  const conflicts = useMemo(() => detectConflicts(itemsForActiveControls), [itemsForActiveControls]);
  const gaps = useMemo(() => detectGaps(itemsForActiveControls), [itemsForActiveControls]);
  const nextClass = useMemo(() => getUpcomingClass(itemsForActiveControls), [itemsForActiveControls]);

  const dayCounts = useMemo(() => (
    DAYS.reduce<Record<DayOfWeek, number>>((acc, day) => {
      acc[day] = visibleByDay[day]?.length ?? 0;
      return acc;
    }, {} as Record<DayOfWeek, number>)
  ), [visibleByDay]);

  const activeItems = useMemo(() => (
    activeDay === 'all'
      ? filtered
      : visibleByDay[activeDay] ?? []
  ), [activeDay, filtered, visibleByDay]);

  const hasActiveFilters = Boolean(
    filterLecturer
      || filterMode
      || (activeDay !== 'all' && activeDay !== recommendedDay)
      || (activeDay === 'all' && recommendedDay !== null),
  );

  const resetFilters = useCallback(() => {
    setFilterLecturer('');
    setFilterMode('');
    setActiveDay(getRecommendedDay(enabledItems) ?? 'all');
    setSelectedDate(new Date());
  }, [enabledItems]);

  const totalClasses = itemsForActiveControls.length;
  const onlineCount = itemsForActiveControls.filter((item) => item.mode === 'online').length;
  const offlineCount = totalClasses - onlineCount;
  const activeDayCount = DAYS.filter((day) => dayCounts[day] > 0).length;
  const activeElectivePairs = ELECTIVE_PAIRS.filter(({ subjects }) => subjects.some((subject) => enabledSubjects.has(subject))).length;
  const weekWindow = totalClasses > 0
    ? (() => {
      const { earliest, latest } = getTimeRange(itemsForActiveControls);
      return `${formatMinutesToTime(earliest)} - ${formatMinutesToTime(latest)}`;
    })()
    : 'No classes';
  const selectedDayRange = getDayTimeLabel(activeItems);
  const calendarDay = useMemo(() => getScheduleDayForDate(selectedDate), [selectedDate]);
  const calendarItems = useMemo(
    () => (calendarDay ? visibleByDay[calendarDay] ?? [] : []),
    [calendarDay, visibleByDay],
  );

  const handleCalendarChange = useCallback((date: Date) => {
    setSelectedDate(date);
    const day = getScheduleDayForDate(date);
    setActiveDay(day ?? 'all');
  }, []);

  return (
    <div className="app-shell sch-shell">
      <ScheduleSummaryBar
          nextClass={nextClass}
          totalClasses={totalClasses}
          offlineCount={offlineCount}
          onlineCount={onlineCount}
          activeDayCount={activeDayCount}
          weekWindow={weekWindow}
          conflictsCount={conflicts.length}
          gapsCount={gaps.length}
          onPickRecommendedDay={() => setActiveDay(recommendedDay ?? 'all')}
          recommendedDay={recommendedDay}
      />

      <Tabs value={view} onValueChange={(next) => setView(next as ViewMode)} className="sch-main">
        <section className="card sch-controls-panel">
          <div className="sch-controls-panel__top">
            <TabsList className="sch-view-tabs">
              <TabsTrigger value="list">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                Agenda
              </TabsTrigger>
              <TabsTrigger value="table">
                <CalendarRange className="h-4 w-4" aria-hidden="true" />
                Week grid
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Date
              </TabsTrigger>
            </TabsList>

            <div className="sch-toolbar__filters">
              <div className="sch-toolbar__field">
                <span className="sch-toolbar__label">Instructor</span>
                <select value={filterLecturer} onChange={(event) => setFilterLecturer(event.target.value)}>
                  <option value="">All</option>
                  {lecturers.map((lecturer) => (
                    <option key={lecturer} value={lecturer}>{lecturer}</option>
                  ))}
                </select>
              </div>
              <div className="sch-toolbar__field">
                <span className="sch-toolbar__label">Format</span>
                <select value={filterMode} onChange={(event) => setFilterMode(event.target.value)}>
                  <option value="">All</option>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>

            <div className="sch-toolbar__right">
              <button type="button" className="btn btn-muted" onClick={enableAll}>
                Default
              </button>
              <button type="button" className="btn btn-muted" onClick={enableBaseOnly}>
                Base
              </button>
              {hasActiveFilters && (
                <button type="button" className="btn btn-primary" onClick={resetFilters}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {view !== 'calendar' ? (
            <DayPicker activeDay={activeDay} dayCounts={dayCounts} onPickDay={setActiveDay} />
          ) : (
            <div className="sch-calendar-summary">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              <span>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}

          <div className="sch-controls-panel__summary">
            <span className="sch-summary-chip">{enabledSubjects.size} subjects</span>
            <span className="sch-summary-chip">{activeElectivePairs}/{ELECTIVE_PAIRS.length} electives</span>
            <span className="sch-summary-chip">{activeDay === 'all' ? 'All days' : activeDay}</span>
            {selectedDayRange && <span className="sch-summary-chip">{selectedDayRange}</span>}
          </div>

          <div className="sch-controls-panel__body">
            <section className="sch-filter-section">
              <div className="sch-filter-section__head">
                <h3>Subjects</h3>
              </div>

              <div className="sch-chip-cloud">
                {BASE_SUBJECTS.map((subject) => {
                  const active = enabledSubjects.has(subject);

                  return (
                    <button
                      key={subject}
                      type="button"
                      className={`sch-chip${active ? ' sch-chip--active' : ''}`}
                      onClick={() => toggleSubject(subject)}
                    >
                      <span>{subject}</span>
                      <span className="sch-chip__count">{SUBJECT_SESSION_COUNT[subject] ?? 0}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="sch-filter-section">
              <div className="sch-filter-section__head">
                <h3>Electives</h3>
              </div>

              <div className="sch-segment-stack">
                {ELECTIVE_PAIRS.map(({ pair, label, subjects }) => {
                  const activeSubject = subjects.find((subject) => enabledSubjects.has(subject)) ?? null;

                  return (
                    <div key={pair} className="sch-segment-card">
                      <div className="sch-segment-card__head">
                        <div>
                          <strong>{label}</strong>
                          <p>{activeSubject ?? 'Not selected'}</p>
                        </div>
                      </div>

                      <div className="sch-segment">
                        {subjects.map((subject) => {
                          const active = enabledSubjects.has(subject);

                          return (
                            <button
                              key={subject}
                              type="button"
                              className={`sch-segment__item${active ? ' sch-segment__item--active' : ''}`}
                              onClick={() => toggleSubject(subject)}
                            >
                              <span>{subject}</span>
                              <span className="sch-chip__count">{SUBJECT_SESSION_COUNT[subject] ?? 0}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="sch-quick-links">
            <Link className="sch-side-link" href="/map">
              <MapPinned className="h-4 w-4" />
              Map
            </Link>
            <Link className="sch-side-link" href="/gpa">
              <BarChart3 className="h-4 w-4" />
              GPA
            </Link>
            <Link className="sch-side-link" href="/help">
              <FileText className="h-4 w-4" />
              Guide
            </Link>
          </div>
        </section>

        {(conflicts.length > 0 || gaps.length > 0) && (
          <section className="sch-alert-strip">
            {conflicts.slice(0, 4).map((conflict, index) => (
              <div key={`c${index}`} className="sch-warn-chip sch-warn-chip--conflict">
                {DAY_SHORT[conflict.day]} {conflict.a.startTime}: {conflict.a.subject} vs {conflict.b.subject}
              </div>
            ))}
            {gaps.slice(0, 4).map((gap, index) => (
              <div key={`g${index}`} className="sch-warn-chip sch-warn-chip--gap">
                {DAY_SHORT[gap.day]}: {gap.minutes} min gap
              </div>
            ))}
          </section>
        )}

          <TabsContent value="list">
            {filtered.length === 0 ? <EmptyState /> : <ListView byDay={byDay} />}
          </TabsContent>

          <TabsContent value="table">
            {filtered.length === 0 ? <EmptyState /> : <GridView byDay={byDay} />}
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView
              selectedDate={selectedDate}
              onDateChange={handleCalendarChange}
              selectedDay={calendarDay}
              items={calendarItems}
            />
          </TabsContent>
      </Tabs>
    </div>
  );
}

function CalendarView({
  selectedDate,
  onDateChange,
  selectedDay,
  items,
}: {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedDay: DayOfWeek | null;
  items: ScheduleItem[];
}) {
  const dateLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[340px,1fr]">
      <section className="card">
        <div className="section-head">
          <div>
            <h2>Choose date</h2>
          </div>
        </div>
        <BasicDatePicker value={selectedDate} onDateChange={onDateChange} />
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <h2>{dateLabel}</h2>
            {selectedDay ? <p className="section-head__sub">{selectedDay}</p> : null}
          </div>
        </div>

        {!selectedDay ? (
          <p className="message">Pick a Monday to Saturday date to view lessons.</p>
        ) : items.length === 0 ? (
          <p className="message">No classes are scheduled for {selectedDay} with the current filters.</p>
        ) : (
          <div className="sch-day-cards">
            {items.map((item) => (
              <ClassCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function GridView({ byDay }: { byDay: Partial<Record<DayOfWeek, ScheduleItem[]>> }) {
  const activeDays = DAYS.filter((day) => byDay[day] && byDay[day]!.length > 0);
  if (activeDays.length === 0) {
    return null;
  }

  return (
    <div className="sch-table-wrap">
      <div
        className="sch-grid"
        style={{ gridTemplateColumns: `repeat(${activeDays.length}, minmax(270px, 1fr))` }}
      >
        {activeDays.map((day) => {
          const items = byDay[day]!;
          const onlineCount = items.filter((item) => item.mode === 'online').length;
          const dayModeLabel = onlineCount === 0
            ? 'offline only'
            : onlineCount === items.length
              ? 'online only'
              : `${onlineCount} online`;

          return (
            <section key={day} className="sch-day-col">
              <div className="sch-day-header">
                <div className="sch-day-header__copy">
                  <span className="sch-day-short">{DAY_SHORT[day]}</span>
                  <h3 className="sch-day-name">{day}</h3>
                </div>
                <span className="sch-day-count">{items.length}</span>
              </div>
              <div className="sch-day-meta">
                <span>{items[0].startTime} - {items[items.length - 1].endTime}</span>
                <span>{dayModeLabel}</span>
              </div>
              <div className="sch-day-cards">
                {items.map((item) => (
                  <ClassCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ListView({ byDay }: { byDay: Partial<Record<DayOfWeek, ScheduleItem[]>> }) {
  return (
    <div className="sch-list">
      {DAYS.map((day) => {
        const items = byDay[day];
        if (!items || items.length === 0) {
          return null;
        }

        return (
          <section key={day} className="card sch-agenda-day">
            <div className="sch-agenda-day__head">
              <div className="sch-agenda-day__copy">
                <span className="sch-agenda-day__eyebrow">{DAY_SHORT[day]}</span>
                <h3 className="sch-agenda-day__title">{day}</h3>
              </div>
              <div className="sch-agenda-day__meta">
                <span>{items.length} classes</span>
                <span>{items[0].startTime} - {items[items.length - 1].endTime}</span>
              </div>
            </div>

            <div className="sch-agenda-day__items">
              {items.map((item) => (
                <ClassCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
