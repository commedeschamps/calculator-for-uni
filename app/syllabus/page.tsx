'use client';

import { useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';
import {
  calculateSyllabusCourseResult,
  createSyllabusCourse,
  createSyllabusItem,
  createSyllabusSection,
  formatScore,
  getLetterGradeInfo,
  HIGH_SCHOLARSHIP_THRESHOLD,
  PASSING_THRESHOLD,
  SCHOLARSHIP_THRESHOLD,
  type StatusTone,
  type SyllabusCourse,
  type SyllabusSection,
} from '../lib/academic';

type CourseViewModel = {
  course: SyllabusCourse;
  totalWeight: number;
  weightedTotal: number;
  hasWeightMismatch: boolean;
  hasInvalidWeights: boolean;
  letter: ReturnType<typeof getLetterGradeInfo>;
  statusText: string;
  statusTone: StatusTone;
  sectionMetrics: Map<string, { average: number; contribution: number; gradedItems: number; totalItems: number }>;
};

function buildStatus(total: number, hasWeightMismatch: boolean): { text: string; tone: StatusTone } {
  if (hasWeightMismatch) {
    return {
      text: 'Weight sum must equal 100% for reliable final result.',
      tone: 'warn',
    };
  }

  if (total >= HIGH_SCHOLARSHIP_THRESHOLD) {
    return {
      text: 'Excellent result. Eligible for high scholarship.',
      tone: 'ok',
    };
  }

  if (total >= SCHOLARSHIP_THRESHOLD) {
    return {
      text: 'Good result. Eligible for scholarship.',
      tone: 'ok',
    };
  }

  if (total >= PASSING_THRESHOLD) {
    return {
      text: 'Course is passed.',
      tone: 'ok',
    };
  }

  return {
    text: 'Course is not passed. Retake required.',
    tone: 'warn',
  };
}

export default function SyllabusPage() {
  const [courses, setCourses] = useState<SyllabusCourse[]>([createSyllabusCourse(1)]);
  const [nextCourseId, setNextCourseId] = useState(2);

  const courseView = useMemo<CourseViewModel[]>(
    () =>
      courses.map((course) => {
        const result = calculateSyllabusCourseResult(course);
        const totalWeight = result.totalWeight;
        const weightedTotal = result.weightedTotal;
        const hasWeightMismatch = Math.abs(totalWeight - 100) > 0.0001;
        const letter = getLetterGradeInfo(weightedTotal);
        const status = buildStatus(weightedTotal, hasWeightMismatch);
        const sectionMetrics = new Map(
          result.sectionResults.map((row) => [
            row.sectionId,
            {
              average: row.average,
              contribution: row.contribution,
              gradedItems: row.gradedItems,
              totalItems: row.totalItems,
            },
          ])
        );

        return {
          course,
          totalWeight,
          weightedTotal,
          hasWeightMismatch,
          hasInvalidWeights: result.hasInvalidWeights,
          letter,
          statusText: status.text,
          statusTone: status.tone,
          sectionMetrics,
        };
      }),
    [courses]
  );

  function updateCourse(courseId: number, updater: (course: SyllabusCourse) => SyllabusCourse) {
    setCourses((prev) => prev.map((course) => (course.id === courseId ? updater(course) : course)));
  }

  function updateSection(
    courseId: number,
    sectionId: string,
    updater: (section: SyllabusSection) => SyllabusSection
  ) {
    updateCourse(courseId, (course) => ({
      ...course,
      sections: course.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }));
  }

  function handleAddCourse() {
    setCourses((prev) => [...prev, createSyllabusCourse(nextCourseId)]);
    setNextCourseId((prev) => prev + 1);
  }

  function handleRemoveCourse(courseId: number) {
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
  }

  function handleAddSection(courseId: number) {
    updateCourse(courseId, (course) => ({
      ...course,
      sections: [
        ...course.sections,
        createSyllabusSection(`Section ${course.sections.length + 1}`, '0', [`Item ${course.sections.length + 1}.1`]),
      ],
    }));
  }

  function handleRemoveSection(courseId: number, sectionId: string) {
    updateCourse(courseId, (course) => {
      if (course.sections.length <= 1) {
        return course;
      }

      return {
        ...course,
        sections: course.sections.filter((section) => section.id !== sectionId),
      };
    });
  }

  function handleAddItem(courseId: number, sectionId: string) {
    updateSection(courseId, sectionId, (section) => ({
      ...section,
      items: [...section.items, createSyllabusItem(`Item ${section.items.length + 1}`)],
    }));
  }

  function handleRemoveItem(courseId: number, sectionId: string, itemId: string) {
    updateSection(courseId, sectionId, (section) => {
      if (section.items.length <= 1) {
        return section;
      }

      return {
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      };
    });
  }

  return (
    <PageLayout
      title="Syllabus Builder"
      description="Create weighted grading templates per course and track your results."
    >
      <div className="actions">
        <button className="btn btn-primary" type="button" onClick={handleAddCourse}>
          Add Course Template
        </button>
      </div>

      <div className="syllabus-list">
        {courseView.map((entry) => (
          <article className="card syllabus-card" key={entry.course.id}>
            <div className="syllabus-course-header">
              <label className="single-field">
                Course Name
                <input
                  type="text"
                  value={entry.course.title}
                  onChange={(event) =>
                    updateCourse(entry.course.id, (course) => ({ ...course, title: event.target.value }))
                  }
                />
              </label>

              <div className="syllabus-header-actions">
                <button className="btn btn-muted" type="button" onClick={() => handleAddSection(entry.course.id)}>
                  Add Section
                </button>
                <button className="remove" type="button" onClick={() => handleRemoveCourse(entry.course.id)}>
                  Remove Course
                </button>
              </div>
            </div>

            <div className="syllabus-sections">
              {entry.course.sections.map((section) => {
                const metrics = entry.sectionMetrics.get(section.id);

                return (
                  <section className="syllabus-section" key={section.id}>
                    <div className="syllabus-section-header">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(event) =>
                          updateSection(entry.course.id, section.id, (source) => ({
                            ...source,
                            title: event.target.value,
                          }))
                        }
                      />
                      <label className="syllabus-weight">
                        Weight %
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={section.weight}
                          onChange={(event) =>
                            updateSection(entry.course.id, section.id, (source) => ({
                              ...source,
                              weight: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <button
                        className="remove"
                        type="button"
                        onClick={() => handleRemoveSection(entry.course.id, section.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="syllabus-items">
                      {section.items.map((item) => (
                        <div className="syllabus-item-row" key={item.id}>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(event) =>
                              updateSection(entry.course.id, section.id, (source) => ({
                                ...source,
                                items: source.items.map((sectionItem) =>
                                  sectionItem.id === item.id
                                    ? { ...sectionItem, title: event.target.value }
                                    : sectionItem
                                ),
                              }))
                            }
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="Score (0-100)"
                            value={item.score}
                            onChange={(event) =>
                              updateSection(entry.course.id, section.id, (source) => ({
                                ...source,
                                items: source.items.map((sectionItem) =>
                                  sectionItem.id === item.id
                                    ? { ...sectionItem, score: event.target.value }
                                    : sectionItem
                                ),
                              }))
                            }
                          />
                          <button
                            className="remove"
                            type="button"
                            onClick={() => handleRemoveItem(entry.course.id, section.id, item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="syllabus-section-footer">
                      <button
                        className="btn btn-muted"
                        type="button"
                        onClick={() => handleAddItem(entry.course.id, section.id)}
                      >
                        Add Item
                      </button>

                      <div className="syllabus-metrics">
                        <span>
                          Avg: <strong>{formatScore(metrics?.average ?? 0)}</strong>
                        </span>
                        <span>
                          Contribution: <strong>{formatScore(metrics?.contribution ?? 0)}</strong>
                        </span>
                        <span>
                          Graded: <strong>{metrics?.gradedItems ?? 0}</strong>/{metrics?.totalItems ?? section.items.length}
                        </span>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            <div className="syllabus-summary">
              <div className="stats-grid">
                <div className="stat">
                  <span>Total Weight</span>
                  <strong>{formatScore(entry.totalWeight)}</strong>
                </div>
                <div className="stat">
                  <span>Total Result</span>
                  <strong>{formatScore(entry.weightedTotal)}</strong>
                </div>
                <div className="stat stat-highlight">
                  <span>Letter Grade</span>
                  <strong>{entry.letter ? entry.letter.letter : '-'}</strong>
                </div>
                <div className="stat">
                  <span>Traditional Grade</span>
                  <strong>{entry.letter ? entry.letter.traditional : '-'}</strong>
                </div>
              </div>

              {entry.hasInvalidWeights ? (
                <p className="message message-warn">Some section weights are invalid. Use values from 0 to 100.</p>
              ) : null}

              {entry.hasWeightMismatch ? (
                <p className="message message-warn">Weight sum is {formatScore(entry.totalWeight)}. It must be exactly 100%.</p>
              ) : null}

              <p className={`message ${entry.statusTone === 'ok' ? 'message-ok' : 'message-warn'}`}>{entry.statusText}</p>
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}
