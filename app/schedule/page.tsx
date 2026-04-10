'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CalendarRange,
  Clock3,
  RotateCcw,
} from 'lucide-react';
import NextLessonCard from '@/app/components/NextLessonCard';
import { Button } from '@/components/tailgrids/core/button';
import BasicDatePicker from '@/components/ui/calendar-1';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentTime } from '@/app/lib/useCurrentTime';
import { useEnabledScheduleSubjects } from '@/app/lib/useEnabledScheduleSubjects';
import { extractCampusLocation } from '../lib/campusMap';
import { BASE_SUBJECTS, ELECTIVE_MAP, ELECTIVE_PAIRS } from '../lib/schedulePreferences';
import {
  type DayOfWeek,
  type ScheduleItem,
  DAYS,
  DAY_SHORT,
  SCHEDULE_DATA,
  getFilteredItems,
  getNextLessonSnapshot,
  getScheduleDayForDate,
  getRecommendedDay,
  getUniqueValues,
  groupByDay,
} from '../lib/schedule';

type ViewMode = 'table' | 'list' | 'calendar';
type DayFilter = DayOfWeek | 'all';

const SUBJECT_SESSION_COUNT = SCHEDULE_DATA.reduce<Record<string, number>>((acc, item) => {
  acc[item.subject] = (acc[item.subject] ?? 0) + 1;
  return acc;
}, {});

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
      <CalendarDays className="sch-empty__icon h-6 w-6" aria-hidden="true" />
      <p>No classes match this setup. Try another day, teacher, or subject mix.</p>
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

export default function SchedulePage() {
  const now = useCurrentTime();
  const [enabledSubjects, setEnabledSubjects, subjectsReady] = useEnabledScheduleSubjects();
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [view, setView] = useState<ViewMode>('list');
  const [filterLecturer, setFilterLecturer] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [activeDay, setActiveDay] = useState<DayFilter>('all');
  const [didAutoPickDay, setDidAutoPickDay] = useState(false);
  const [recommendedDay, setRecommendedDay] = useState<DayOfWeek | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

      return next;
    });
  }, [setEnabledSubjects]);

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
  const lessonSnapshot = useMemo(
    () => getNextLessonSnapshot(enabledItems, now),
    [enabledItems, now],
  );

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

  const activeElectivePairs = ELECTIVE_PAIRS.filter(({ subjects }) => subjects.some((subject) => enabledSubjects.has(subject))).length;
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
      <NextLessonCard
        lessonSnapshot={lessonSnapshot}
        label="Next lesson"
        variant="inline"
        className="sch-page-next"
        showMapAction
      />

      <Tabs value={view} onValueChange={(next) => setView(next as ViewMode)} className="sch-main">
        <div className="sch-stage">
          <section className="card sch-planner-compact">
            <div className="sch-planner-compact__top">
              <div className="sch-planner-compact__copy">
                <span className="sch-toolbar__label">Planner</span>
                <p className="sch-planner-compact__intro">Keep only the classes you want visible in the schedule.</p>
              </div>

              <div className="sch-planner-compact__summary">
                <span className="sch-summary-chip">{enabledSubjects.size} subjects</span>
                <span className="sch-summary-chip">{activeElectivePairs}/{ELECTIVE_PAIRS.length} electives</span>
                <span className="sch-summary-chip">{activeDay === 'all' ? 'All days' : activeDay}</span>
                {selectedDayRange && <span className="sch-summary-chip">{selectedDayRange}</span>}
              </div>

              <div className="sch-planner-compact__actions">
                <Button
                  size="xs"
                  appearance="outline"
                  className="sch-planner-compact__action"
                  onClick={() => setPlannerOpen((prev) => !prev)}
                >
                  {plannerOpen ? 'Done editing' : 'Edit schedule'}
                </Button>
              </div>
            </div>

            {plannerOpen ? (
              <div className="sch-planner-compact__panel">
                <section className="sch-filter-section">
                  <div className="sch-filter-section__head">
                    <div>
                      <h3>Subjects</h3>
                      <p>Base classes you want to keep in the week.</p>
                    </div>
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
                    <div>
                      <h3>Electives</h3>
                      <p>One visible choice per track.</p>
                    </div>
                  </div>

                  <div className="sch-segment-stack">
                    {ELECTIVE_PAIRS.map(({ pair, label, subjects }) => {
                      const activeSubject = subjects.find((subject) => enabledSubjects.has(subject)) ?? null;

                      return (
                        <div key={pair} className="sch-segment-card">
                          <div className="sch-segment-card__head">
                            <div>
                              <strong>{label}</strong>
                              <span className="sch-segment-card__status">{activeSubject ?? 'Pick one'}</span>
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
            ) : null}
          </section>

          <section className="card sch-controls-panel">
            <div className="sch-controls-panel__top">
              <div className="sch-view-switch">
                <span className="sch-toolbar__label">View</span>
                <TabsList className="sch-view-tabs">
                  <TabsTrigger value="list">
                    <Clock3 className="h-4 w-4" aria-hidden="true" />
                    Agenda
                  </TabsTrigger>
                  <TabsTrigger value="table">
                    <CalendarRange className="h-4 w-4" aria-hidden="true" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="calendar">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </div>

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

              {hasActiveFilters ? (
                <div className="sch-toolbar__right">
                  <Button size="xs" className="w-full sm:w-auto" onClick={resetFilters}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset
                  </Button>
                </div>
              ) : (
                <div className="sch-toolbar__right sch-toolbar__right--empty" aria-hidden="true" />
              )}
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
          </section>

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
        </div>
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
          <p className="message">Select a Monday to Saturday date.</p>
        ) : items.length === 0 ? (
          <p className="message">No classes scheduled for {selectedDay}.</p>
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
