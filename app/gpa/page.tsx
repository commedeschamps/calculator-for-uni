'use client';

import { useMemo, useState } from 'react';
import AnimatedNumber from '../components/AnimatedNumber';
import CopyButton from '../components/CopyButton';
import PageLayout from '../components/PageLayout';
import { useToast } from '../components/ToastProvider';
import { createGpaCourse, formatScore, getLetterGradeInfo, isPercentage, totalToGradePoints, type GpaCourse } from '../lib/academic';
import { getBaseTemplates, getElectivePairs } from '../lib/syllabusTemplates';
import { usePersistedState } from '../lib/usePersistedState';

const BASE_TEMPLATES = getBaseTemplates();
const ELECTIVE_PAIRS = getElectivePairs();

export default function GpaPage() {
  const [courses, setCourses] = usePersistedState<GpaCourse[]>('gpa-courses', [createGpaCourse(1), createGpaCourse(2)]);
  const [nextCourseId, setNextCourseId] = usePersistedState('gpa-nextId', 3);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { showToast } = useToast();

  const { totalCredits, gpa } = useMemo(() => {
    let sumPoints = 0;
    let sumCredits = 0;

    for (const course of courses) {
      const credits = Number(course.credits);
      const total = Number(course.total);

      if (!Number.isFinite(credits) || credits <= 0 || !isPercentage(total)) {
        continue;
      }

      const gradePoints = totalToGradePoints(total);
      sumPoints += credits * gradePoints;
      sumCredits += credits;
    }

    return {
      totalCredits: sumCredits === 0 ? '0' : String(Math.round(sumCredits * 100) / 100),
      gpa: sumCredits === 0 ? '0.00' : (sumPoints / sumCredits).toFixed(2),
    };
  }, [courses]);

  const copyAllText = useMemo(() => {
    const lines: string[] = [];

    for (const course of courses) {
      const total = Number(course.total);
      const letterInfo = isPercentage(total) ? getLetterGradeInfo(total) : null;
      const points = isPercentage(total) ? totalToGradePoints(total) : null;
      const name = course.name || 'Untitled';
      const cr = course.credits || '-';
      const tot = isPercentage(total) ? formatScore(total) : '-';
      const grade = letterInfo ? `${letterInfo.letter} (${points?.toFixed(2)})` : '-';
      lines.push(`${name} | ${cr} cr | ${tot}% | ${grade}`);
    }

    lines.push('---');
    lines.push(`Total Credits: ${totalCredits}`);
    lines.push(`GPA: ${gpa}`);
    return lines.join('\n');
  }, [courses, totalCredits, gpa]);

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
    const existingNames = new Set(courses.map((c) => c.name.trim().toLowerCase()));
    const toAdd: GpaCourse[] = [];
    let id = nextCourseId;

    for (const key of selectedKeys) {
      const tpl = [...BASE_TEMPLATES, ...ELECTIVE_PAIRS.flatMap((p) => p.templates)].find((t) => t.key === key);
      if (!tpl) continue;
      if (existingNames.has(tpl.name.trim().toLowerCase())) continue;
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
    <PageLayout title="GPA Calculator" description="Add courses with credits and total grade to compute your weighted GPA.">
      {/* Template picker */}
      <div className="template-picker" style={{ border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <button
          type="button"
          className="gpa-template-toggle"
          onClick={() => setPickerOpen((v) => !v)}
          aria-expanded={pickerOpen}
        >
          <span className="gpa-template-toggle__label">📋 Load from templates</span>
          <span className={`gpa-template-toggle__arrow ${pickerOpen ? 'gpa-template-toggle__arrow--open' : ''}`}>▸</span>
        </button>

        {pickerOpen && (
          <>
            <p className="template-picker__sub">SE-2411 Term 6 — pick courses to add with pre-filled name & credits</p>

            <div className="template-picker__group">
              <span className="template-picker__label">Core subjects</span>
              {BASE_TEMPLATES.map((t) => (
                <label key={t.key} className={`template-chip ${selectedKeys.includes(t.key) ? 'template-chip--active' : ''}`}>
                  <input type="checkbox" checked={selectedKeys.includes(t.key)} onChange={() => toggleTemplate(t.key)} />
                  <span className="template-chip__name">{t.name}</span>
                  <span className="template-chip__credits">{t.credits} cr</span>
                </label>
              ))}
            </div>

            {ELECTIVE_PAIRS.map((group) => (
              <div key={group.pair} className="template-picker__group">
                <span className="template-picker__label">
                  {group.label}
                  <span className="template-picker__hint">(pick one)</span>
                </span>
                {group.templates.map((t) => (
                  <label key={t.key} className={`template-chip template-chip--elective ${selectedKeys.includes(t.key) ? 'template-chip--active' : ''}`}>
                    <input type="checkbox" checked={selectedKeys.includes(t.key)} onChange={() => toggleTemplate(t.key)} />
                    <span className="template-chip__name">{t.name}</span>
                    <span className="template-chip__credits">{t.credits} cr</span>
                  </label>
                ))}
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
          </>
        )}
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
          const total = Number(course.total);
          const letterInfo = isPercentage(total) ? getLetterGradeInfo(total) : null;
          const points = isPercentage(total) ? totalToGradePoints(total) : null;

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
                {letterInfo ? `${letterInfo.letter} (${points?.toFixed(2)})` : '-'}
              </span>
              <button className="remove" type="button" onClick={() => handleRemoveCourse(course.id)}>
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="actions">
        <button className="btn btn-muted" type="button" onClick={handleAddCourse}>
          Add Course
        </button>
      </div>

      <div className="stats-grid stats-grid-2">
        <div className="stat stat-with-copy">
          <span>Total Credits</span>
          <strong><AnimatedNumber value={Number(totalCredits)} decimals={0} /></strong>
          <CopyButton value={copyAllText} label="Copy all courses & GPA" />
        </div>
        <div className="stat stat-highlight stat-with-copy">
          <span>GPA</span>
          <strong><AnimatedNumber value={Number(gpa)} decimals={2} /></strong>
          <CopyButton value={gpa} label="Copy GPA" />
        </div>
      </div>
    </PageLayout>
  );
}
