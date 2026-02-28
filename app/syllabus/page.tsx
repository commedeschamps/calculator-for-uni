'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { useToast } from '../components/ToastProvider';
import { usePersistedState } from '../lib/usePersistedState';
import {
  calculateSyllabusCourseResult,
  DEFAULT_SYLLABUS_SECTION_PRESETS,
  createSyllabusCourse,
  createSyllabusItem,
  createSyllabusSection,
  formatScore,
  getSyllabusItemInputConfig,
  getLetterGradeInfo,
  getSyllabusSectionMetricLabel,
  ATTESTATION_SECTION_MAX,
  HIGH_SCHOLARSHIP_THRESHOLD,
  PASSING_THRESHOLD,
  SCHOLARSHIP_THRESHOLD,
  isAttestationSection,
  parseInputValue,
  type AttestationFormulaBreakdown,
  type StatusTone,
  type SyllabusCourse,
  type SyllabusSection,
} from '../lib/academic';
import {
  type SyllabusTemplate,
  SYLLABUS_TEMPLATES,
  getBaseTemplates,
  getElectivePairs,
} from '../lib/syllabusTemplates';

type CourseViewModel = {
  course: SyllabusCourse;
  totalWeight: number;
  weightedTotal: number;
  hasWeightMismatch: boolean;
  hasInvalidWeights: boolean;
  hasAttestationOverflow: boolean;
  usesAttestationStructure: boolean;
  formulaBreakdown: AttestationFormulaBreakdown | null;
  letter: ReturnType<typeof getLetterGradeInfo>;
  statusText: string;
  statusTone: StatusTone;
  sectionMetrics: Map<string, { score: number; contribution: number; gradedItems: number; totalItems: number; isAttestation: boolean; maxPointsSum: number; maxPointsMismatch: boolean; overflowAmount: number }>;
};

function detectItemPrefix(sectionTitle: string): string {
  const normalized = sectionTitle.trim().toLowerCase();
  if (normalized.includes('quiz')) return 'Quiz';
  if (normalized.includes('final exam')) return 'Exam';
  if (normalized.includes('midterm')) return 'Midterm';
  if (normalized.includes('endterm')) return 'Endterm';
  if (normalized.includes('final')) return 'Final';
  if (normalized.includes('report')) return 'Report';
  return 'Assignment';
}

function nextItemLabel(sectionTitle: string, itemCount: number): string {
  const prefix = detectItemPrefix(sectionTitle);
  const nextIndex = itemCount + 1;
  return `${prefix} ${nextIndex}`;
}

function normalizeLegacyLabs(courses: SyllabusCourse[]): SyllabusCourse[] {
  let changed = false;

  const normalized = courses.map((course) => {
    const normalizedSections = course.sections.map((section) => {
      const sectionIsLab = /\blab(s)?\b/i.test(section.title);
      const title = sectionIsLab ? 'Assignments' : section.title;
      if (title !== section.title) {
        changed = true;
      }

      const isAttest = isAttestationSection(title);

      const items = section.items.map((item) => {
        let updatedItem = item;
        const updatedTitle = item.title.replace(/^lab\s*(\d+)$/i, 'Assignment $1');
        if (updatedTitle !== item.title) {
          changed = true;
          updatedItem = { ...updatedItem, title: updatedTitle };
        }
        // Migrate items without maxPoints
        if (!('maxPoints' in item) || item.maxPoints === undefined || item.maxPoints === '') {
          changed = true;
          updatedItem = { ...updatedItem, maxPoints: isAttest ? '25' : '100' };
        }
        return updatedItem === item ? item : updatedItem;
      });

      if (title === section.title && items === section.items) {
        return section;
      }

      return {
        ...section,
        title,
        items,
      };
    });

    if (normalizedSections === course.sections) {
      return course;
    }

    return {
      ...course,
      sections: normalizedSections,
    };
  });

  return changed ? normalized : courses;
}

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

  if (total > PASSING_THRESHOLD) {
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
  const [courses, setCourses, hasHydratedCourses] = usePersistedState<SyllabusCourse[]>('syl-courses', []);
  const [nextCourseId, setNextCourseId] = usePersistedState('syl-nextId', 1);
  const [selectedKeys, setSelectedKeys] = usePersistedState<string[]>('syl-selected-templates', []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedTemplates = useMemo(() => new Set(selectedKeys), [selectedKeys]);

  const toggleTemplate = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const s = new Set(prev);
      if (s.has(key)) { s.delete(key); } else { s.add(key); }
      return Array.from(s);
    });
  }, [setSelectedKeys]);

  const BASE_TEMPLATES = useMemo(() => getBaseTemplates(), []);
  const ELECTIVE_PAIRS = useMemo(() => getElectivePairs(), []);

  useEffect(() => {
    setCourses((prev) => normalizeLegacyLabs(prev));
  }, [setCourses]);

  useEffect(() => {
    if (hasHydratedCourses && courses.length === 0) {
      setPickerOpen(true);
    }
  }, [courses.length, hasHydratedCourses]);

  const totalCredits = useMemo(() => {
    let sum = 0;
    for (const t of SYLLABUS_TEMPLATES) {
      if (selectedTemplates.has(t.key)) sum += t.credits;
    }
    return sum;
  }, [selectedTemplates]);

  function templateToCourse(template: SyllabusTemplate, id: number): SyllabusCourse {
    return {
      id,
      title: `${template.name} (${template.credits} cr.)`,
      sections: template.sections.map((s) =>
        createSyllabusSection(s.title, s.weight, s.items),
      ),
    };
  }

  function handleLoadTemplates() {
    const templates = SYLLABUS_TEMPLATES.filter((t) => selectedTemplates.has(t.key));
    if (templates.length === 0) return;

    // Only add templates that aren't already loaded (by name match)
    const existingNames = new Set(courses.map((c) => c.title));
    const toAdd = templates.filter((t) => !existingNames.has(`${t.name} (${t.credits} cr.)`));

    if (toAdd.length === 0) {
      showToast('All selected templates are already loaded');
      return;
    }

    let id = nextCourseId;
    const newCourses = toAdd.map((t) => templateToCourse(t, id++));
    setCourses((prev) => [...prev, ...newCourses]);
    setNextCourseId(id);
    setPickerOpen(false);
    showToast(`Added ${newCourses.length} course template${newCourses.length > 1 ? 's' : ''}`);
  }

  const { showToast } = useToast();

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
              score: row.score,
              contribution: row.contribution,
              gradedItems: row.gradedItems,
              totalItems: row.totalItems,
              isAttestation: row.isAttestation,
              maxPointsSum: row.maxPointsSum,
              maxPointsMismatch: row.maxPointsMismatch,
              overflowAmount: row.overflowAmount,
            },
          ])
        );

        return {
          course,
          totalWeight,
          weightedTotal,
          hasWeightMismatch,
          hasInvalidWeights: result.hasInvalidWeights,
          hasAttestationOverflow: result.hasAttestationOverflow,
          usesAttestationStructure: result.usesAttestationStructure,
          formulaBreakdown: result.formulaBreakdown,
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
    const removed = courses.find((c) => c.id === courseId);
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
    if (removed) {
      showToast(`Removed "${removed.title || 'Course'}"`, () => {
        setCourses((prev) => [...prev, removed]);
      });
    }
  }

  function handleAddSection(courseId: number) {
    updateCourse(courseId, (course) => ({
      ...course,
      sections: [
        ...course.sections,
        (() => {
          const existingTitles = new Set(course.sections.map((section) => section.title.trim().toLowerCase()));
          const nextPreset = DEFAULT_SYLLABUS_SECTION_PRESETS.find(
            (preset) => !existingTitles.has(preset.title.trim().toLowerCase()),
          );

          if (nextPreset) {
            return createSyllabusSection(nextPreset.title, nextPreset.weight, nextPreset.items);
          }

          return createSyllabusSection(`Section ${course.sections.length + 1}`, '0', [{ title: 'Item 1', maxPoints: 100 }]);
        })(),
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
    updateSection(courseId, sectionId, (section) => {
      const isAttest = isAttestationSection(section.title);
      const defaultMax = isAttest ? 25 : 100;
      return {
        ...section,
        items: [...section.items, createSyllabusItem(nextItemLabel(section.title, section.items.length), defaultMax)],
      };
    });
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
      <div className="actions" style={{ gap: 8 }}>
        <button className="btn btn-primary" type="button" onClick={() => setPickerOpen((p) => !p)}>
          {pickerOpen ? 'Hide Templates' : 'Subject Templates'}
        </button>
        <button className="btn btn-muted" type="button" onClick={handleAddCourse}>
          + Blank Course
        </button>
      </div>

      {pickerOpen && (
        <div className="card template-picker">
          <h2 className="template-picker__title">Pick your subjects</h2>
          <p className="template-picker__sub">SE-2411 · Term 6 · Select then load</p>

          <div className="template-picker__group">
            <span className="template-picker__label">Core</span>
            {BASE_TEMPLATES.map((t) => (
              <label key={t.key} className={`template-chip${selectedTemplates.has(t.key) ? ' template-chip--active' : ''}`}>
                <input type="checkbox" checked={selectedTemplates.has(t.key)} onChange={() => toggleTemplate(t.key)} />
                <span className="template-chip__name">{t.name}</span>
                <span className="template-chip__credits">{t.credits} cr.</span>
              </label>
            ))}
          </div>

          {ELECTIVE_PAIRS.map(({ pair, label, templates }) => (
            <div key={pair} className="template-picker__group">
              <span className="template-picker__label">{label} <span className="template-picker__hint">pick one</span></span>
              {templates.map((t) => (
                <label key={t.key} className={`template-chip template-chip--elective${selectedTemplates.has(t.key) ? ' template-chip--active' : ''}`}>
                  <input type="checkbox" checked={selectedTemplates.has(t.key)} onChange={() => toggleTemplate(t.key)} />
                  <span className="template-chip__name">{t.name}</span>
                  <span className="template-chip__credits">{t.credits} cr.</span>
                </label>
              ))}
            </div>
          ))}

          <div className="template-picker__footer">
            <span className="template-picker__total">
              {selectedTemplates.size} subject{selectedTemplates.size !== 1 ? 's' : ''} · {totalCredits} credits
            </span>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleLoadTemplates}
              disabled={selectedTemplates.size === 0}
            >
              Load Templates
            </button>
          </div>
        </div>
      )}

      <div className="syllabus-list">
        {courseView.length === 0 && !pickerOpen && (
          <div className="card syllabus-empty">
            <span className="syllabus-empty__icon">📋</span>
            <p className="syllabus-empty__text">No courses yet</p>
            <p className="syllabus-empty__hint">Use Subject Templates to load your term courses, or add a blank one.</p>
            <div className="syllabus-empty__actions">
              <button className="btn btn-primary" type="button" onClick={() => setPickerOpen(true)}>Open Templates</button>
              <button className="btn btn-muted" type="button" onClick={handleAddCourse}>+ Blank Course</button>
            </div>
          </div>
        )}
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
                const isAttest = isAttestationSection(section.title);
                const metricLabel = getSyllabusSectionMetricLabel(section.title);
                const weightSum = metrics?.maxPointsSum ?? 0;
                const sectionPct = isAttest && weightSum > 0
                  ? Math.min((metrics?.score ?? 0) / weightSum * 100, 100)
                  : 0;

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

                    {isAttest && (
                      <div className="syllabus-att-labels">
                        <span>Item</span>
                        <span>Weight</span>
                        <span>Grade %</span>
                        <span>Points</span>
                        <span></span>
                      </div>
                    )}

                    <div className="syllabus-items">
                      {section.items.map((item) => {
                        const itemInput = getSyllabusItemInputConfig(section.title);
                        const scoreVal = parseInputValue(item.score);
                        const maxPts = parseInputValue(item.maxPoints) ?? 25;
                        const earned = scoreVal !== null ? maxPts * Math.min(scoreVal, 100) / 100 : null;

                        return isAttest ? (
                          <div className="syllabus-att-row" key={item.id}>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((si) =>
                                    si.id === item.id ? { ...si, title: event.target.value } : si
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              placeholder="25"
                              value={item.maxPoints}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((si) =>
                                    si.id === item.id ? { ...si, maxPoints: event.target.value } : si
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              min={itemInput.min}
                              max={itemInput.max}
                              step={itemInput.step}
                              placeholder="0–100"
                              value={item.score}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((si) =>
                                    si.id === item.id ? { ...si, score: event.target.value } : si
                                  ),
                                }))
                              }
                            />
                            <span className="syllabus-att-pts">
                              {earned !== null ? formatScore(earned, 1) : '—'}
                            </span>
                            <button
                              className="remove"
                              type="button"
                              onClick={() => handleRemoveItem(entry.course.id, section.id, item.id)}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="syllabus-item-row" key={item.id}>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((si) =>
                                    si.id === item.id ? { ...si, title: event.target.value } : si
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              min={itemInput.min}
                              max={itemInput.max}
                              step={itemInput.step}
                              placeholder={itemInput.placeholder}
                              value={item.score}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((si) =>
                                    si.id === item.id ? { ...si, score: event.target.value } : si
                                  ),
                                }))
                              }
                            />
                            <button
                              className="remove"
                              type="button"
                              onClick={() => handleRemoveItem(entry.course.id, section.id, item.id)}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="syllabus-section-footer">
                      <button
                        className="btn btn-muted btn-sm"
                        type="button"
                        onClick={() => handleAddItem(entry.course.id, section.id)}
                      >
                        + Item
                      </button>

                      {isAttest ? (
                        <div className="syllabus-att-summary">
                          <span className="syllabus-att-summary__score">
                            {formatScore(metrics?.score ?? 0, 1)}<span className="syllabus-att-summary__max">/{formatScore(metrics?.maxPointsSum ?? 0, 0)}</span>
                          </span>
                          <span className="syllabus-att-summary__pct">{formatScore(sectionPct, 1)}%</span>
                          <span className="syllabus-att-summary__contrib">→ {formatScore(metrics?.contribution ?? 0, 1)}</span>
                        </div>
                      ) : (
                        <div className="syllabus-metrics">
                          <span>
                            {metricLabel}: <strong>{formatScore(metrics?.score ?? 0)}</strong>
                          </span>
                          <span>
                            Contribution: <strong>{formatScore(metrics?.contribution ?? 0)}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {metrics?.isAttestation && metrics.maxPointsMismatch && (
                      <p className="message message-warn" style={{ margin: 0, fontSize: 13 }}>
                        Weights sum to {formatScore(metrics.maxPointsSum, 0)} — should be {ATTESTATION_SECTION_MAX}.
                      </p>
                    )}

                    {(() => {
                      const graded = metrics?.gradedItems ?? 0;
                      const total = metrics?.totalItems ?? section.items.length;
                      const pct = total > 0 ? Math.round((graded / total) * 100) : 0;
                      return (
                        <div className="progress-bar-container">
                          <div className="progress-bar">
                            <div
                              className={`progress-bar-fill${pct === 100 ? ' complete' : ''}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="progress-bar-label">{graded}/{total}</span>
                        </div>
                      );
                    })()}
                  </section>
                );
              })}
            </div>

            <div className="syllabus-summary">
              {entry.formulaBreakdown && (
                <div className="syllabus-formula">
                  <span className="syllabus-formula__label">Formula:</span>
                  <span className="syllabus-formula__expr">
                    {formatScore(entry.formulaBreakdown.att1Weight / 100, 1)} × <strong>{formatScore(entry.formulaBreakdown.att1Score, 1)}</strong>
                    {' + '}
                    {formatScore(entry.formulaBreakdown.att2Weight / 100, 1)} × <strong>{formatScore(entry.formulaBreakdown.att2Score, 1)}</strong>
                    {' + '}
                    {formatScore(entry.formulaBreakdown.finalWeight / 100, 1)} × <strong>{formatScore(entry.formulaBreakdown.finalScore, 1)}</strong>
                    {' = '}
                    <strong>{formatScore(entry.formulaBreakdown.total)}</strong>
                  </span>
                </div>
              )}

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

              {entry.hasAttestationOverflow ? (
                <p className="message message-warn">One or more attestation sections exceed 100 points. Excess points are capped.</p>
              ) : null}

              <p className={`message ${entry.statusTone === 'ok' ? 'message-ok' : 'message-warn'}`}>{entry.statusText}</p>
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}
