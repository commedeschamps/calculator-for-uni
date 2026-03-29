'use client';

import { useMemo, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber';
import CopyButton from '../components/CopyButton';
import PageLayout from '../components/PageLayout';
import { useToast } from '../components/ToastProvider';
import {
  calculateGpaSummary,
  createGpaCourse,
  formatScore,
  getAcademicOutcomeFromTotal,
  normalizeCourseName,
  parseInputValue,
  SYLLABUS_GPA_LINK_STORAGE_KEY,
  type GpaCourse,
  type SyllabusLinkedGpaCourse,
} from '../lib/academic';
import { getBaseTemplates, getElectivePairs } from '../lib/syllabusTemplates';
import { usePersistedState } from '../lib/usePersistedState';

const BASE_TEMPLATES = getBaseTemplates();
const ELECTIVE_PAIRS = getElectivePairs();

export default function GpaPage() {
  const [courses, setCourses] = usePersistedState<GpaCourse[]>('gpa-courses', [createGpaCourse(1), createGpaCourse(2)]);
  const [nextCourseId, setNextCourseId] = usePersistedState('gpa-nextId', 3);
  const [linkedCourses] = usePersistedState<SyllabusLinkedGpaCourse[]>(SYLLABUS_GPA_LINK_STORAGE_KEY, []);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { showToast } = useToast();

  const manualOverrideNames = useMemo(
    () => new Set(courses.map((course) => normalizeCourseName(course.name)).filter(Boolean)),
    [courses],
  );

  const visibleLinkedCourses = useMemo(
    () =>
      linkedCourses.filter((course) => !manualOverrideNames.has(normalizeCourseName(course.name))),
    [linkedCourses, manualOverrideNames],
  );

  const overriddenLinkedCount = linkedCourses.length - visibleLinkedCourses.length;

  const summary = useMemo(
    () => calculateGpaSummary([...courses, ...visibleLinkedCourses]),
    [courses, visibleLinkedCourses],
  );

  const totalCredits = summary.totalCredits === 0 ? '0' : String(Math.round(summary.totalCredits * 100) / 100);
  const gpa = summary.gpa.toFixed(2);
  const totalCreditsDecimals = Number.isInteger(summary.totalCredits) ? 0 : 1;

  const copyAllText = useMemo(() => {
    const lines: string[] = [];

    for (const course of courses) {
      const total = parseInputValue(course.total);
      const outcome = getAcademicOutcomeFromTotal(total);
      const name = course.name || 'Untitled';
      const cr = course.credits || '-';
      const tot = total !== null ? formatScore(total) : '-';
      const grade = outcome.letterInfo ? `${outcome.letterInfo.letter} (${outcome.gradePoints?.toFixed(2)})` : '-';
      lines.push(`${name} | ${cr} cr | ${tot}% | ${grade}`);
    }

    for (const course of visibleLinkedCourses) {
      const outcome = getAcademicOutcomeFromTotal(course.total);
      const grade = outcome.letterInfo ? `${outcome.letterInfo.letter} (${outcome.gradePoints?.toFixed(2)})` : '-';
      lines.push(`[Syllabus] ${course.name} | ${formatScore(course.credits, course.credits % 1 === 0 ? 0 : 1)} cr | ${formatScore(course.total)}% | ${grade}`);
    }

    lines.push('---');
    lines.push(`Total Credits: ${totalCredits}`);
    lines.push(`GPA: ${gpa}`);
    return lines.join('\n');
  }, [courses, visibleLinkedCourses, totalCredits, gpa]);

  function handleAddCourse() {
    setCourses((prev) => [...prev, createGpaCourse(nextCourseId)]);
    setNextCourseId((prev) => prev + 1);
  }

  function handleRemoveCourse(id: number) {
    const removed = courses.find((c) => c.id === id);
    setCourses((prev) => prev.filter((course) => course.id !== id));
    if (removed) {
      showToast(`Removed "${removed.name || 'Course'}"`, () => {
        setCourses((prev) => [...prev, removed]);
      });
    }
  }

  function handleCourseChange(id: number, field: keyof Omit<GpaCourse, 'id'>, value: string) {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== id) return course;
        return { ...course, [field]: value };
      })
    );
  }

  function toggleTemplate(key: string) {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleLoadTemplates() {
    const existingNames = new Set(courses.map((course) => normalizeCourseName(course.name)).filter(Boolean));
    const toAdd: GpaCourse[] = [];
    let id = nextCourseId;

    for (const key of selectedKeys) {
      const tpl = [...BASE_TEMPLATES, ...ELECTIVE_PAIRS.flatMap((p) => p.templates)].find((t) => t.key === key);
      if (!tpl) continue;
      if (existingNames.has(normalizeCourseName(tpl.name))) continue;
      toAdd.push({ id, name: tpl.name, credits: String(tpl.credits), total: '' });
      id += 1;
    }

    if (toAdd.length > 0) {
      setCourses((prev) => [...prev, ...toAdd]);
      setNextCourseId(id);
      showToast(`Added ${toAdd.length} course${toAdd.length > 1 ? 's' : ''}`);
    }
    setSelectedKeys([]);
    setPickerOpen(false);
  }

  const selectedCredits = selectedKeys.reduce((sum, key) => {
    const tpl = [...BASE_TEMPLATES, ...ELECTIVE_PAIRS.flatMap((p) => p.templates)].find((t) => t.key === key);
    return sum + (tpl?.credits ?? 0);
  }, 0);

  return (
    <PageLayout title="GPA Calculator">
      <section className="card section-block">
        <div className="section-head">
          <div>
            <h2>Summary</h2>
          </div>
          <div className="row-actions">
            <button className="btn btn-primary" type="button" onClick={() => setPickerOpen((v) => !v)}>
              {pickerOpen ? 'Hide templates' : 'Templates'}
            </button>
            <button className="btn btn-muted" type="button" onClick={handleAddCourse}>
              Add course
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span>Manual</span>
            <strong>{courses.length}</strong>
          </div>
          <div className="stat">
            <span>Linked</span>
            <strong>{visibleLinkedCourses.length}</strong>
          </div>
          <div className="stat">
            <span>Total Credits</span>
            <strong>{totalCredits}</strong>
          </div>
          <div className="stat">
            <span>GPA</span>
            <strong>{gpa}</strong>
          </div>
        </div>
      </section>

      {pickerOpen && (
        <div className="card template-picker">
          <div className="template-picker__top">
            <div>
              <h2 className="template-picker__title">Templates</h2>
            </div>
            <div className="template-picker__mini">
              <span>{selectedKeys.length} selected</span>
              <strong>{selectedCredits} cr.</strong>
            </div>
          </div>

          <div className="template-picker__group">
            <span className="template-picker__label">Core</span>
            <div className="template-picker__grid">
              {BASE_TEMPLATES.map((t) => (
                <label key={t.key} className={`template-chip ${selectedKeys.includes(t.key) ? 'template-chip--active' : ''}`}>
                  <input type="checkbox" checked={selectedKeys.includes(t.key)} onChange={() => toggleTemplate(t.key)} />
                  <span className="template-chip__name">{t.name}</span>
                  <span className="template-chip__credits">{t.credits} cr</span>
                </label>
              ))}
            </div>
          </div>

          {ELECTIVE_PAIRS.map((group) => (
            <div key={group.pair} className="template-picker__group">
              <span className="template-picker__label">
                {group.label}
                <span className="template-picker__hint">pick one</span>
              </span>
              <div className="template-picker__grid">
                {group.templates.map((t) => (
                  <label key={t.key} className={`template-chip template-chip--elective ${selectedKeys.includes(t.key) ? 'template-chip--active' : ''}`}>
                    <input type="checkbox" checked={selectedKeys.includes(t.key)} onChange={() => toggleTemplate(t.key)} />
                    <span className="template-chip__name">{t.name}</span>
                    <span className="template-chip__credits">{t.credits} cr</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="template-picker__footer">
            <span className="template-picker__total">
              {selectedKeys.length} selected · {selectedCredits} credits
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={selectedKeys.length === 0}
              onClick={handleLoadTemplates}
            >
              Load selected
            </button>
          </div>
        </div>
      )}

      <section className="card section-block">
          <div className="section-head">
            <div>
              <h2>Manual Courses</h2>
            </div>
            <CopyButton value={copyAllText} label="Copy all courses & GPA" />
          </div>

        <div className="course-list">
          <div className="course-row-header">
            <span>Course name</span>
            <span>Credits</span>
            <span>Total (%)</span>
            <span>Grade</span>
            <span />
          </div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon">📚</span>
              <p>No courses yet</p>
              <button className="btn btn-primary" type="button" onClick={handleAddCourse}>Add first course</button>
            </div>
          ) : courses.map((course) => {
            const total = parseInputValue(course.total);
            const outcome = getAcademicOutcomeFromTotal(total);

            return (
              <div className="course-row course-row-5" key={course.id}>
                <input
                  type="text"
                  placeholder="Course name"
                  aria-label="Course name"
                  value={course.name}
                  onChange={(event) => handleCourseChange(course.id, 'name', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Credits"
                  aria-label="Credits"
                  value={course.credits}
                  onChange={(event) => handleCourseChange(course.id, 'credits', event.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="Total (%)"
                  value={course.total}
                  onChange={(event) => handleCourseChange(course.id, 'total', event.target.value)}
                />
                <span className="course-grade-badge">
                  {outcome.letterInfo ? `${outcome.letterInfo.letter} (${outcome.gradePoints?.toFixed(2)})` : '-'}
                </span>
                <button className="remove" type="button" onClick={() => handleRemoveCourse(course.id)}>
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {visibleLinkedCourses.length > 0 ? (
        <div className="card section-block">
          <div className="section-head">
            <div>
              <h2>Linked From Syllabus</h2>
            </div>
          </div>

          {overriddenLinkedCount > 0 ? (
            <p className="message">
              Manual entries with the same course name replace {overriddenLinkedCount} linked course{overriddenLinkedCount > 1 ? 's' : ''}.
            </p>
          ) : null}

          <div className="course-list">
            <div className="course-row-header">
              <span>Course name</span>
              <span>Credits</span>
              <span>Total (%)</span>
              <span>Grade</span>
              <span />
            </div>

            {visibleLinkedCourses.map((course) => {
              const outcome = getAcademicOutcomeFromTotal(course.total);

              return (
                <div className="course-row course-row-5" key={`linked-${course.syllabusCourseId}`}>
                  <input type="text" readOnly value={course.name} aria-label="Linked course name" />
                  <input
                    type="text"
                    readOnly
                    value={formatScore(course.credits, course.credits % 1 === 0 ? 0 : 1)}
                    aria-label="Linked course credits"
                  />
                  <input type="text" readOnly value={formatScore(course.total)} aria-label="Linked course total" />
                  <span className="course-grade-badge">
                    {outcome.letterInfo ? `${outcome.letterInfo.letter} (${outcome.gradePoints?.toFixed(2)})` : '-'}
                  </span>
                  <span className="course-grade-badge">Syllabus</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="stats-grid stats-grid-2">
        <div className="stat stat-with-copy">
          <span>Total Credits</span>
          <strong><AnimatedNumber value={summary.totalCredits} decimals={totalCreditsDecimals} /></strong>
          <CopyButton value={copyAllText} label="Copy all courses & GPA" />
        </div>
        <div className="stat stat-highlight stat-with-copy">
          <span>GPA</span>
          <strong><AnimatedNumber value={summary.gpa} decimals={2} /></strong>
          <CopyButton value={gpa} label="Copy GPA" />
        </div>
      </div>
    </PageLayout>
  );
}
