'use client';

import { useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import { createGpaCourse, getLetterGradeInfo, isPercentage, totalToGradePoints, type GpaCourse } from '../lib/academic';

export default function GpaPage() {
  const [courses, setCourses] = useState<GpaCourse[]>([createGpaCourse(1), createGpaCourse(2)]);
  const [nextCourseId, setNextCourseId] = useState(3);

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

  function handleAddCourse() {
    setCourses((prev) => [...prev, createGpaCourse(nextCourseId)]);
    setNextCourseId((prev) => prev + 1);
  }

  function handleRemoveCourse(id: number) {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  }

  function handleCourseChange(id: number, field: keyof Omit<GpaCourse, 'id'>, value: string) {
    setCourses((prev) =>
      prev.map((course) => {
        if (course.id !== id) return course;
        return { ...course, [field]: value };
      })
    );
  }

  return (
    <PageLayout title="GPA Calculator" description="Add courses with credits and total grade to compute your weighted GPA.">
      <div className="course-list">
        <div className="course-row-header">
          <span>Course name</span>
          <span>Credits</span>
          <span>Total (%)</span>
          <span>Grade</span>
          <span />
        </div>
        {courses.map((course) => {
          const total = Number(course.total);
          const letterInfo = isPercentage(total) ? getLetterGradeInfo(total) : null;
          const points = isPercentage(total) ? totalToGradePoints(total) : null;

          return (
            <div className="course-row course-row-5" key={course.id}>
              <input
                type="text"
                placeholder="Course name"
                value={course.name}
                onChange={(event) => handleCourseChange(course.id, 'name', event.target.value)}
              />
              <input
                type="number"
                min="0"
                step="0.5"
                placeholder="Credits"
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
        <div className="stat">
          <span>Total Credits</span>
          <strong>{totalCredits}</strong>
        </div>
        <div className="stat stat-highlight">
          <span>GPA</span>
          <strong>{gpa}</strong>
        </div>
      </div>
    </PageLayout>
  );
}
