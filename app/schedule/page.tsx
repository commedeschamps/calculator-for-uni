'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '../components/ThemeToggle';
import NavTabs from '../components/NavTabs';
import {
  type DayOfWeek,
  type ScheduleItem,
  DAYS,
  DAY_SHORT,
  SCHEDULE_DATA,
  PAIR_LABELS,
  getFilteredItems,
  getUniqueSubjects,
  getUniqueValues,
  groupByDay,
  detectConflicts,
  detectGaps,
} from '../lib/schedule';

type ViewMode = 'table' | 'list';

// ── Derive subject info once ─────────────────────────

const { base: BASE_SUBJECTS, electives: ELECTIVE_MAP } = getUniqueSubjects(SCHEDULE_DATA);
const ELECTIVE_SUBJECTS = Array.from(ELECTIVE_MAP.keys()).sort();

// Group electives by pair for sidebar rendering
const ELECTIVE_PAIRS: { pair: string; label: string; subjects: string[] }[] = (() => {
  const map = new Map<string, string[]>();
  ELECTIVE_MAP.forEach((pair, subject) => {
    if (!map.has(pair)) map.set(pair, []);
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

function buildDefaultEnabled(): Set<string> {
  // Enable all subjects by default — user deselects what they don't take
  return new Set([...BASE_SUBJECTS, ...ELECTIVE_SUBJECTS]);
}

// ── Sub-components ───────────────────────────────────

function ClassCard({ item }: { item: ScheduleItem }) {
  const isOnline = item.mode === 'online';
  return (
    <div className={`sch-card sch-card--${item.type}${isOnline ? ' sch-card--online' : ''}`}>
      <div className="sch-card__time">{item.startTime}–{item.endTime}</div>
      <div className="sch-card__subject">{item.subject}</div>
      <div className="sch-card__meta">
        <span className={`sch-badge sch-badge--${item.type}`}>{item.type}</span>
        {isOnline && <span className="sch-badge sch-badge--online">online</span>}
        {item.electiveGroup !== 'Base' && (
          <span className="sch-badge sch-badge--elective">elective</span>
        )}
      </div>
      <div className="sch-card__details">
        {item.classroom ? <span>📍 {item.classroom}</span> : isOnline ? <span>🌐 Online</span> : null}
        {item.lecturer && <span>👤 {item.lecturer}</span>}
      </div>
      {item.notes && <div className="sch-card__notes">{item.notes}</div>}
    </div>
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

// ── Main page ────────────────────────────────────────

const STORAGE_KEY = 'sch-enabled-subjects';

function loadPersistedSubjects(): Set<string> {
  if (typeof window === 'undefined') return buildDefaultEnabled();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const arr = JSON.parse(stored) as string[];
      if (Array.isArray(arr) && arr.length > 0) return new Set(arr);
    }
  } catch { /* ignore */ }
  return buildDefaultEnabled();
}

export default function SchedulePage() {
  const [enabledSubjects, setEnabledSubjects] = useState<Set<string>>(loadPersistedSubjects);
  const [view, setView] = useState<ViewMode>('list');

  // Persist subject selection
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(enabledSubjects)));
    } catch { /* ignore */ }
  }, [enabledSubjects]);
  const [filterLecturer, setFilterLecturer] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on Escape
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen]);

  const toggleSubject = useCallback((subject: string) => {
    setEnabledSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  }, []);

  const enableAll = useCallback(() => {
    setEnabledSubjects(new Set([...BASE_SUBJECTS, ...ELECTIVE_SUBJECTS]));
  }, []);

  const enableBaseOnly = useCallback(() => {
    setEnabledSubjects(new Set(BASE_SUBJECTS));
  }, []);

  // Filtered items
  const filtered = useMemo(
    () => getFilteredItems(SCHEDULE_DATA, enabledSubjects, {
      lecturer: filterLecturer,
      mode: filterMode,
      day: filterDay,
    }),
    [enabledSubjects, filterLecturer, filterMode, filterDay],
  );

  // All enabled items (no detail filters) for analysis
  const enabledItems = useMemo(
    () => getFilteredItems(SCHEDULE_DATA, enabledSubjects, { lecturer: '', mode: '', day: '' }),
    [enabledSubjects],
  );

  const lecturers = useMemo(() => getUniqueValues(enabledItems, 'lecturer'), [enabledItems]);
  const byDay = useMemo(() => groupByDay(filtered), [filtered]);
  const conflicts = useMemo(() => detectConflicts(enabledItems), [enabledItems]);
  const gaps = useMemo(() => detectGaps(enabledItems), [enabledItems]);

  const hasActiveFilters = filterLecturer || filterMode || filterDay;
  const resetFilters = useCallback(() => {
    setFilterLecturer('');
    setFilterMode('');
    setFilterDay('');
  }, []);

  const totalClasses = enabledItems.length;
  const onlineCount = enabledItems.filter((i) => i.mode === 'online').length;

  return (
    <main className="app-shell sch-shell">
      <div className="top-bar">
        <Link href="/" className="nav-brand">Helper</Link>
        <NavTabs />
        <ThemeToggle />
      </div>

      <header className="sch-header">
        <h1>SE-2411 Schedule</h1>
        <div className="sch-stats">
          <span className="sch-stat">{totalClasses} classes</span>
          <span className="sch-stat">{totalClasses - onlineCount} offline</span>
          <span className="sch-stat sch-stat--online">{onlineCount} online</span>
          {conflicts.length > 0 && (
            <span className="sch-stat sch-stat--warn">
              ⚠ {conflicts.length} conflict{conflicts.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      <div id="main" className="sch-layout">
        {/* ── Sidebar: subject picker ── */}
        <aside className={`sch-sidebar${sidebarOpen ? ' sch-sidebar--open' : ''}`}>
          <div className="sch-sidebar__head">
            <span className="sch-sidebar__title">My Subjects</span>
            <button type="button" className="sch-sidebar__close" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <div className="sch-sidebar__actions">
            <button type="button" className="sch-pill-sm" onClick={enableAll}>All</button>
            <button type="button" className="sch-pill-sm" onClick={enableBaseOnly}>Base only</button>
          </div>

          <div className="sch-subject-group">
            <span className="sch-subject-group__label">Core</span>
            {BASE_SUBJECTS.map((s) => (
              <label key={s} className="sch-subject-check">
                <input
                  type="checkbox"
                  checked={enabledSubjects.has(s)}
                  onChange={() => toggleSubject(s)}
                />
                <span>{s}</span>
              </label>
            ))}
          </div>

          {ELECTIVE_PAIRS.map(({ pair, label, subjects }) => (
            <div key={pair} className="sch-subject-group">
              <span className="sch-subject-group__label">{label}</span>
              <span className="sch-subject-group__hint">pick one</span>
              {subjects.map((s) => (
                <label key={s} className="sch-subject-check sch-subject-check--elective">
                  <input
                    type="checkbox"
                    checked={enabledSubjects.has(s)}
                    onChange={() => toggleSubject(s)}
                  />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          ))}
        </aside>

        {/* ── Main content ── */}
        <div className="sch-main">
          {/* Toolbar */}
          <div className="sch-toolbar">
            <button type="button" className="sch-pill sch-pill--subjects" onClick={() => setSidebarOpen((p) => !p)}>
              Subjects ({enabledSubjects.size})
            </button>

            <div className="sch-toolbar__filters">
              <select value={filterLecturer} onChange={(e) => setFilterLecturer(e.target.value)}>
                <option value="">All lecturers</option>
                {lecturers.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)}>
                <option value="">All modes</option>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
              </select>
              <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
                <option value="">All days</option>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_SHORT[d]}</option>)}
              </select>
              {hasActiveFilters && (
                <button type="button" className="sch-pill-sm sch-pill-sm--reset" onClick={resetFilters}>✕</button>
              )}
            </div>

            <div className="sch-toolbar__right">
              <div className="sch-pills">
                <button type="button" className={`sch-pill-sm${view === 'list' ? ' sch-pill-sm--active' : ''}`} onClick={() => setView('list')}>List</button>
                <button type="button" className={`sch-pill-sm${view === 'table' ? ' sch-pill-sm--active' : ''}`} onClick={() => setView('table')}>Grid</button>
              </div>
            </div>
          </div>

          {/* Analysis warnings */}
          {(conflicts.length > 0 || gaps.length > 0) && (
            <div className="sch-warnings">
              {conflicts.map((c, i) => (
                <div key={`c${i}`} className="sch-warn-chip sch-warn-chip--conflict">
                  ⚠ {DAY_SHORT[c.day]} {c.a.startTime}: {c.a.subject} vs {c.b.subject}
                </div>
              ))}
              {gaps.map((g, i) => (
                <div key={`g${i}`} className="sch-warn-chip sch-warn-chip--gap">
                  🕐 {DAY_SHORT[g.day]}: {g.minutes}min gap ({g.afterItem.endTime}→{g.beforeItem.startTime})
                </div>
              ))}
            </div>
          )}

          {/* Schedule content */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : view === 'table' ? (
            <GridView byDay={byDay} />
          ) : (
            <ListView byDay={byDay} />
          )}
        </div>
      </div>

      {sidebarOpen && <div className="sch-overlay" onClick={() => setSidebarOpen(false)} />}
    </main>
  );
}

// ── Grid View ────────────────────────────────────────

function GridView({ byDay }: { byDay: Partial<Record<DayOfWeek, ScheduleItem[]>> }) {
  const activeDays = DAYS.filter((d) => byDay[d] && byDay[d]!.length > 0);
  if (activeDays.length === 0) return null;

  return (
    <div className="sch-table-wrap">
      <div className="sch-grid" style={{ gridTemplateColumns: `repeat(${activeDays.length}, 1fr)` }}>
        {activeDays.map((day) => (
          <div key={day} className="sch-day-col">
            <div className="sch-day-header">
              <span className="sch-day-short">{DAY_SHORT[day]}</span>
              <span className="sch-day-count">{byDay[day]!.length}</span>
            </div>
            <div className="sch-day-cards">
              {byDay[day]!.map((item) => (
                <ClassCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── List View ────────────────────────────────────────

function ListView({ byDay }: { byDay: Partial<Record<DayOfWeek, ScheduleItem[]>> }) {
  return (
    <div className="sch-list">
      {DAYS.map((day) => {
        const items = byDay[day];
        if (!items || items.length === 0) return null;

        return (
          <div key={day} className="sch-list-day">
            <h3 className="sch-list-day__title">
              {day}
              <span className="sch-day-count">{items.length}</span>
            </h3>
            <div className="sch-list-day__items">
              {items.map((item) => (
                <div key={item.id} className={`sch-list-item sch-list-item--${item.type}`}>
                  <div className="sch-list-item__time">
                    {item.startTime}<br />{item.endTime}
                  </div>
                  <div className="sch-list-item__body">
                    <div className="sch-list-item__subject">{item.subject}</div>
                    <div className="sch-list-item__meta">
                      <span className={`sch-badge sch-badge--${item.type}`}>{item.type}</span>
                      {item.mode === 'online' && <span className="sch-badge sch-badge--online">online</span>}
                      {item.electiveGroup !== 'Base' && <span className="sch-badge sch-badge--elective">elective</span>}
                    </div>
                    <div className="sch-list-item__details">
                      {item.classroom ? <span>📍 {item.classroom}</span> : item.mode === 'online' ? <span>🌐 Online</span> : null}
                      {item.lecturer && <span>👤 {item.lecturer}</span>}
                    </div>
                    {item.notes && <div className="sch-card__notes">{item.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
